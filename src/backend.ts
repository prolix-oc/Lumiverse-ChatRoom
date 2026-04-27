import type { SpindleAPI } from 'lumiverse-spindle-types';
declare const spindle: SpindleAPI;

// Council chatroom message shape
interface CouncilMessage {
  name: string;
  username: string;
  content: string;
  avatarUrl: string | null;
  isUser: boolean;
  ts: number;
}

// Per-user runtime state for message-based triggering
interface UserChatroomState {
  autoReply: boolean;
  messageCounter: number;
  messageTarget: number;
  triggerMode: string;
  randomMessageCountEnabled: boolean;
  messageCount: number;
  messageCountMin: number;
  messageCountMax: number;
  isGenerating: boolean;
  currentChatId: string | null;
}

const userStates = new Map<string, UserChatroomState>();

// For user-scoped extensions, event handlers don't receive userId.
// We capture it from the first frontend message and reuse it for events.
let activeUserId: string | null = null;

function getUserState(userId?: string): UserChatroomState {
  const key = userId || activeUserId || 'default';
  if (!userStates.has(key)) {
    const state: UserChatroomState = {
      autoReply: false,
      messageCounter: 0,
      messageTarget: 5,
      triggerMode: 'time',
      randomMessageCountEnabled: true,
      messageCount: 5,
      messageCountMin: 3,
      messageCountMax: 7,
      isGenerating: false,
      currentChatId: null,
    };
    userStates.set(key, state);
    return state;
  }
  return userStates.get(key)!;
}

function recalcMessageTarget(state: UserChatroomState) {
  if (state.randomMessageCountEnabled) {
    state.messageTarget = state.messageCountMin + Math.floor(Math.random() * (state.messageCountMax - state.messageCountMin + 1));
  } else {
    state.messageTarget = state.messageCount;
  }
}

const CHATROOM_HISTORY_KEY = 'council_chatroom_history';

async function getChatroomHistory(chatId: string): Promise<CouncilMessage[]> {
  try {
    const raw = await spindle.variables.chat.get(chatId, CHATROOM_HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore parse errors
  }
  return [];
}

async function saveChatroomHistory(chatId: string, history: CouncilMessage[]) {
  await spindle.variables.chat.set(chatId, CHATROOM_HISTORY_KEY, JSON.stringify(history));
}

function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, '');
}

function toLlmHistory(messages: CouncilMessage[]) {
  return messages.map(m => ({
    role: (m.isUser ? 'user' : 'assistant') as 'user' | 'assistant',
    content: `[${m.name} in Chatroom]: ${stripHtmlTags(m.content)}`
  }));
}

async function runCouncilGeneration(userId?: string) {
  const state = getUserState(userId);
  if (state.isGenerating) return;
  state.isGenerating = true;

  spindle.log.info('Starting generation trigger processing');
  if (!spindle.permissions.has('generation')) {
    spindle.log.warn('Generation permission not granted');
    spindle.sendToFrontend({ type: 'error', message: 'Generation permission not granted' });
    state.isGenerating = false;
    return;
  }

  try {
    spindle.log.info('Fetching active chat...');
    const activeChat = await spindle.chats.getActive(userId);
    if (!activeChat) {
      spindle.log.warn('No active chat found');
      spindle.sendToFrontend({ type: 'error', message: 'No active chat to monitor.' });
      state.isGenerating = false;
      return;
    }

    const chatId = activeChat.id;

    spindle.log.info(`Active chat found: ${chatId}. Fetching messages...`);
    const ctxLimitStr = await spindle.variables.global.get('chatroom_context_limit', userId);
    const contextLimit = ctxLimitStr ? parseInt(ctxLimitStr, 10) : 10;

    const messages = await spindle.chat.getMessages(chatId);
    const recentMessages = messages.slice(-contextLimit);
    const chatContext = recentMessages.map(m => `${m.name || m.role}: ${stripHtmlTags(m.content)}`).join('\\n');

    spindle.log.info('Fetching council members...');
    const councilMembers = await spindle.council.getMembers({ userId });
    if (councilMembers.length === 0) {
      spindle.log.warn('No council members assigned');
      spindle.sendToFrontend({ type: 'error', message: 'No council members assigned.' });
      state.isGenerating = false;
      return;
    }

    spindle.log.info('Fetching active persona...');
    const activePersona = await spindle.personas.getActive(userId);

    const councilContext = councilMembers.map(m => `- ${m.name}: ${m.role}. Personality: ${m.personality}`).join('\\n');

    const memberCount = councilMembers.length;
    const targetResponses = memberCount === 1 ? 1 : 1 + Math.floor(Math.random() * memberCount);

    const responseInstruction = memberCount === 1
      ? `Write exactly 1 new message in the chatroom.`
      : `Write ${targetResponses} new message${targetResponses > 1 ? 's' : ''} in the chatroom.`;

    const systemPrompt = `You are running a live internet shitposting chatroom for the "council members" who are watching a story unfold.
They are watching the main story chat and reacting to it in real-time.
They talk casually, use internet slang, bicker with each other, and gossip about the characters or the author ({{user}}).
This is {{user}}'s chatroom, so council members should refer to {{user}} in the first person when talking about or to them.

COUNCIL MEMBERS:
${councilContext}

CURRENT STORY CONTEXT:
${chatContext}

${responseInstruction}
For each message, one council member should speak. They should pick a chat "username" for themselves based on their character, and continue to use it.
Separate each message with "---" on a new line.
Format each message exactly as follows:
MemberName (Username): The message content
`;

    const chatroomHistory = await getChatroomHistory(chatId);
    const promptMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...toLlmHistory(chatroomHistory).slice(-20)
    ];

    spindle.log.info('Resolving connection profile...');
    const connId = await spindle.variables.global.get('chatroom_connection_id', userId);

    let conn: any = null;
    if (connId) {
      conn = await spindle.connections.get(connId, userId);
    }
    if (!conn) {
      const conns = await spindle.connections.list(userId);
      conn = conns.find((c: any) => c.is_default) || conns[0];
    }

    if (!conn) {
      spindle.log.error('No connection profile available');
      spindle.sendToFrontend({ type: 'error', message: 'No connection profile available.' });
      state.isGenerating = false;
      return;
    }

    spindle.log.info(`Generating using connection: ${conn.id} (${conn.provider} - ${conn.model})`);

    // Token-aware context clipping
    const maxCtxStr = await spindle.variables.global.get('chatroom_max_context_tokens', userId);
    const maxContextTokens = maxCtxStr ? parseInt(maxCtxStr, 10) : 4096;

    if (spindle.permissions.has('generation')) {
      try {
        let countResult = await spindle.tokens.countMessages(promptMessages, { model: conn.model, userId });
        spindle.log.info(`Prompt token count: ${countResult.total_tokens} / ${maxContextTokens} (model: ${countResult.model})`);

        // Trim oldest chatroom history messages until under the limit
        let trimAttempts = 0;
        const maxTrimAttempts = 100;
        while (countResult.total_tokens > maxContextTokens && trimAttempts < maxTrimAttempts) {
          // Find the index of the first non-system message
          const firstNonSystemIdx = promptMessages.findIndex(m => m.role !== 'system');
          if (firstNonSystemIdx === -1) break;

          promptMessages.splice(firstNonSystemIdx, 1);
          trimAttempts++;
          countResult = await spindle.tokens.countMessages(promptMessages, { model: conn.model, userId });
        }

        if (trimAttempts > 0) {
          spindle.log.info(`Trimmed ${trimAttempts} chatroom history message(s) to fit within ${maxContextTokens} tokens. Final count: ${countResult.total_tokens}`);
        }
      } catch (e: any) {
        spindle.log.warn(`Token count failed, skipping context clipping: ${e.message || String(e)}`);
      }
    }

    spindle.sendToFrontend({ type: 'generation_started' });

    const stream = spindle.generate.rawStream({
      type: 'raw',
      provider: conn.provider,
      model: conn.model,
      connection_id: conn.id,
      messages: promptMessages,
      userId
    });

    let fullText = '';
    for await (const chunk of stream) {
      if (chunk.type === 'token') {
        fullText += chunk.token;
      } else if (chunk.type === 'done') {
        fullText = chunk.content || fullText;
      }
    }

    spindle.log.info('Generation stream completed. Processing results...');

    const chunks = fullText.split('---');

    for (const chunk of chunks) {
      if (!chunk.trim()) continue;

      const match = chunk.trim().match(/^([^:(]+)(?:\s*\(([^)]+)\))?:\s*(.*)$/s);

      let speakerName = 'Unknown';
      let username = '';
      let content = chunk.trim();

      if (match) {
        speakerName = match[1].trim();
        username = match[2] ? match[2].trim() : speakerName;
        content = match[3].trim();
      }

      const speaker = councilMembers.find(m => m.name.toLowerCase() === speakerName.toLowerCase());
      const avatarUrl = speaker ? speaker.avatarUrl : null;

      const uiMsg: CouncilMessage = {
        name: speakerName,
        username: username || speakerName,
        content: content,
        avatarUrl: avatarUrl,
        isUser: false,
        ts: Date.now()
      };

      chatroomHistory.push(uiMsg);
      spindle.sendToFrontend({
        type: 'new_message',
        name: uiMsg.name,
        username: uiMsg.username,
        content: uiMsg.content,
        avatarUrl: uiMsg.avatarUrl,
        isUser: uiMsg.isUser
      });
    }

    await saveChatroomHistory(chatId, chatroomHistory);

    spindle.log.info('Successfully dispatched messages to frontend.');
    spindle.sendToFrontend({ type: 'generation_ended' });

  } catch (e: any) {
    spindle.log.error(`Generation error: ${e.message || String(e)}`);
    spindle.sendToFrontend({ type: 'generation_ended' });
    spindle.sendToFrontend({ type: 'error', message: e.message || String(e) });
  } finally {
    state.isGenerating = false;
  }
}

spindle.onFrontendMessage(async (payload, userId) => {
  // Capture userId from frontend messages for use in event handlers
  if (userId) {
    activeUserId = userId;
  }

  if (payload.type === 'save_settings') {
    await spindle.variables.global.set('chatroom_message_interval', (payload.messageInterval ?? 10).toString(), userId);
    await spindle.variables.global.set('chatroom_random_interval_enabled', (payload.randomIntervalEnabled ?? true).toString(), userId);
    await spindle.variables.global.set('chatroom_interval_min', payload.intervalMin.toString(), userId);
    await spindle.variables.global.set('chatroom_interval_max', payload.intervalMax.toString(), userId);
    await spindle.variables.global.set('chatroom_context_limit', payload.contextLimit.toString(), userId);
    await spindle.variables.global.set('chatroom_max_context_tokens', (payload.maxContextTokens ?? 4096).toString(), userId);
    await spindle.variables.global.set('chatroom_connection_id', payload.connectionId || '', userId);

    await spindle.variables.global.set('chatroom_trigger_mode', payload.triggerMode || 'time', userId);
    await spindle.variables.global.set('chatroom_message_count', (payload.messageCount ?? 5).toString(), userId);
    await spindle.variables.global.set('chatroom_random_message_count_enabled', (payload.randomMessageCountEnabled ?? true).toString(), userId);
    await spindle.variables.global.set('chatroom_message_count_min', (payload.messageCountMin ?? 3).toString(), userId);
    await spindle.variables.global.set('chatroom_message_count_max', (payload.messageCountMax ?? 7).toString(), userId);

    const state = getUserState(userId);
    const oldMode = state.triggerMode;
    state.triggerMode = payload.triggerMode || 'time';
    state.messageCount = payload.messageCount ?? 5;
    state.randomMessageCountEnabled = payload.randomMessageCountEnabled ?? true;
    state.messageCountMin = payload.messageCountMin ?? 3;
    state.messageCountMax = payload.messageCountMax ?? 7;
    recalcMessageTarget(state);
    if (oldMode !== state.triggerMode) {
      state.messageCounter = 0;
    }

    // Save per-chat decorative name
    const chatName = payload.chatroomName?.trim();
    if (state.currentChatId && chatName) {
      await spindle.variables.global.set(`chatroom_name_${state.currentChatId}`, chatName, userId);
    }

    spindle.toast.success('Chatroom configuration saved.', { userId });
    return;
  }

  if (payload.type === 'load_settings') {
    const msgInterval = await spindle.variables.global.get('chatroom_message_interval', userId);
    const randomEnabled = await spindle.variables.global.get('chatroom_random_interval_enabled', userId);
    const min = await spindle.variables.global.get('chatroom_interval_min', userId);
    const max = await spindle.variables.global.get('chatroom_interval_max', userId);
    const ctxLimit = await spindle.variables.global.get('chatroom_context_limit', userId);
    const maxCtxTokens = await spindle.variables.global.get('chatroom_max_context_tokens', userId);
    const connId = await spindle.variables.global.get('chatroom_connection_id', userId);

    const triggerMode = await spindle.variables.global.get('chatroom_trigger_mode', userId);
    const messageCount = await spindle.variables.global.get('chatroom_message_count', userId);
    const randomMessageCountEnabled = await spindle.variables.global.get('chatroom_random_message_count_enabled', userId);
    const messageCountMin = await spindle.variables.global.get('chatroom_message_count_min', userId);
    const messageCountMax = await spindle.variables.global.get('chatroom_message_count_max', userId);
    const autoReply = await spindle.variables.global.get('chatroom_auto_reply', userId);

    const widgetX = await spindle.variables.global.get('chatroom_widget_x', userId);
    const widgetY = await spindle.variables.global.get('chatroom_widget_y', userId);
    const widgetW = await spindle.variables.global.get('chatroom_widget_w', userId);
    const widgetH = await spindle.variables.global.get('chatroom_widget_h', userId);

    let connections: any[] = [];
    try {
      if (spindle.permissions.has('generation')) {
        connections = await spindle.connections.list(userId);
      }
    } catch (err) {
      spindle.log.warn('Could not fetch connections for chatroom overlay settings.');
    }

    let userPersona = null;
    try {
      const persona = await spindle.personas.getActive(userId);
      if (persona) {
        userPersona = {
          name: persona.name,
          avatarUrl: persona.image_id ? `/api/v1/images/${persona.image_id}` : null
        };
      }
    } catch (e) {
      spindle.log.warn('Could not fetch active persona for chatroom.');
    }

    const state = getUserState(userId);
    state.autoReply = autoReply === 'true';
    state.triggerMode = triggerMode || 'time';

    // Track current active chat
    let activeChatId: string | null = null;
    try {
      const activeChat = await spindle.chats.getActive(userId);
      activeChatId = activeChat ? activeChat.id : null;
      state.currentChatId = activeChatId;
    } catch {
      state.currentChatId = null;
    }
    state.messageCount = messageCount ? parseInt(messageCount, 10) : 5;
    state.randomMessageCountEnabled = randomMessageCountEnabled ? randomMessageCountEnabled === 'true' : true;
    state.messageCountMin = messageCountMin ? parseInt(messageCountMin, 10) : 3;
    state.messageCountMax = messageCountMax ? parseInt(messageCountMax, 10) : 7;
    recalcMessageTarget(state);

    // Load per-chat decorative name
    let chatroomName: string | null = null;
    if (activeChatId) {
      chatroomName = await spindle.variables.global.get(`chatroom_name_${activeChatId}`, userId);
    }

    // Load history for the active chat
    let history: CouncilMessage[] = [];
    let hasActiveChat = false;
    if (activeChatId) {
      hasActiveChat = true;
      try {
        history = await getChatroomHistory(activeChatId);
      } catch (e) {
        spindle.log.warn('Could not load chatroom history.');
      }
    }

    spindle.sendToFrontend({
      type: 'settings_loaded',
      triggerMode: state.triggerMode,
      messageInterval: msgInterval ? parseInt(msgInterval, 10) : 10,
      randomIntervalEnabled: randomEnabled ? randomEnabled === 'true' : true,
      intervalMin: min ? parseInt(min, 10) : 5,
      intervalMax: max ? parseInt(max, 10) : 15,
      messageCount: state.messageCount,
      randomMessageCountEnabled: state.randomMessageCountEnabled,
      messageCountMin: state.messageCountMin,
      messageCountMax: state.messageCountMax,
      contextLimit: ctxLimit ? parseInt(ctxLimit, 10) : 10,
      maxContextTokens: maxCtxTokens ? parseInt(maxCtxTokens, 10) : 4096,
      connectionId: connId,
      connections: connections,
      history: history,
      hasActiveChat,
      userPersona,
      autoReply: state.autoReply,
      widgetX: widgetX ? parseInt(widgetX, 10) : null,
      widgetY: widgetY ? parseInt(widgetY, 10) : null,
      widgetW: widgetW ? parseInt(widgetW, 10) : null,
      widgetH: widgetH ? parseInt(widgetH, 10) : null,
      chatroomName: chatroomName || undefined,
    }, userId);
    return;
  }

  if (payload.type === 'set_auto_reply') {
    const enabled = payload.enabled ?? false;
    await spindle.variables.global.set('chatroom_auto_reply', enabled.toString(), userId);
    const state = getUserState(userId);
    state.autoReply = enabled;
    return;
  }

  if (payload.type === 'user_message') {
    spindle.log.info('Received user_message trigger');

    let personaName = 'The User';
    let personaAvatar: string | null = null;
    try {
      const activePersona = await spindle.personas.getActive(userId);
      if (activePersona) {
        personaName = activePersona.name;
        personaAvatar = activePersona.image_id ? `/api/v1/images/${activePersona.image_id}` : null;
      }
    } catch (e) {
      spindle.log.warn('Could not fetch active persona for user message.');
    }

    const activeChat = await spindle.chats.getActive(userId);
    if (!activeChat) {
      spindle.sendToFrontend({ type: 'error', message: 'No active chat to send message to.' }, userId);
      return;
    }

    const chatId = activeChat.id;
    const chatroomHistory = await getChatroomHistory(chatId);

    chatroomHistory.push({
      name: personaName,
      username: personaName,
      content: payload.content,
      avatarUrl: personaAvatar,
      isUser: true,
      ts: Date.now()
    });

    await saveChatroomHistory(chatId, chatroomHistory);

    spindle.sendToFrontend({
      type: 'new_message',
      name: personaName,
      username: personaName,
      content: payload.content,
      avatarUrl: personaAvatar,
      isUser: true
    }, userId);

    await runCouncilGeneration(userId);
    return;
  }

  if (payload.type === 'trigger_generation') {
    await runCouncilGeneration(userId);
    return;
  }

  if (payload.type === 'clear_chat_history') {
    try {
      const activeChat = await spindle.chats.getActive(userId);
      if (!activeChat) {
        spindle.sendToFrontend({ type: 'error', message: 'No active chat to clear history from.' }, userId);
        return;
      }

      await spindle.variables.chat.delete(activeChat.id, CHATROOM_HISTORY_KEY);
      spindle.sendToFrontend({ type: 'chat_changed', history: [] }, userId);
      spindle.toast.success('Chatroom history cleared.', { userId });
    } catch (e: any) {
      spindle.log.error(`Failed to clear chatroom history: ${e.message || String(e)}`);
      spindle.sendToFrontend({ type: 'error', message: 'Failed to clear chatroom history.' }, userId);
    }
    return;
  }

  if (payload.type === 'save_widget_state') {
    if (payload.x != null) await spindle.variables.global.set('chatroom_widget_x', String(Math.round(payload.x)), userId);
    if (payload.y != null) await spindle.variables.global.set('chatroom_widget_y', String(Math.round(payload.y)), userId);
    if (payload.w != null) await spindle.variables.global.set('chatroom_widget_w', String(Math.round(payload.w)), userId);
    if (payload.h != null) await spindle.variables.global.set('chatroom_widget_h', String(Math.round(payload.h)), userId);
    return;
  }
});

// Listen for story chat messages to support message-based triggering
spindle.on('MESSAGE_SENT', async (payload: any) => {
  const state = getUserState();
  if (state.triggerMode !== 'messages' || !state.autoReply) return;

  try {
    const activeChat = await spindle.chats.getActive();
    const eventChatId = payload?.chatId || payload?.chat_id;
    if (!activeChat || activeChat.id !== eventChatId) return;

    state.messageCounter++;
    spindle.log.info(`Message-based auto-reply counter: ${state.messageCounter}/${state.messageTarget}`);

    if (state.messageCounter >= state.messageTarget) {
      state.messageCounter = 0;
      recalcMessageTarget(state);
      spindle.log.info('Message target reached. Triggering council generation.');
      await runCouncilGeneration();
    }
  } catch (e: any) {
    spindle.log.error(`Message trigger error: ${e.message || String(e)}`);
  }
});

// Hide or show the chatroom when the user switches chats
// CHAT_CHANGED only fires when chat *data* changes, not when active chat switches.
// Active chat switches are communicated via SETTINGS_UPDATED with key === 'activeChatId'.
spindle.on('SETTINGS_UPDATED', async (payload: any) => {
  const state = getUserState();
  const key = payload?.key ?? payload?.keys?.[0] ?? null;

  if (key !== 'activeChatId') return;

  const newChatId = payload?.value ?? null;

  if (!newChatId) {
    // User went back to home screen — hide the widget
    state.currentChatId = null;
    spindle.sendToFrontend({ type: 'hide_widget' });
    return;
  }

  if (state.currentChatId !== newChatId) {
    state.currentChatId = newChatId;
    const history = await getChatroomHistory(newChatId);
    const chatroomName = await spindle.variables.global.get(`chatroom_name_${newChatId}`, userId);
    spindle.sendToFrontend({ type: 'chat_changed', history, chatroomName: chatroomName || undefined });
  }
});
