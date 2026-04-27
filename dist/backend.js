// src/backend.ts
var userStates = new Map;
var USER_SETTINGS_PATH = "settings/chatroom.json";
var activeUserId = null;
function getUserState(userId) {
  const key = userId || activeUserId || "default";
  if (!userStates.has(key)) {
    const state = {
      autoReply: false,
      messageCounter: 0,
      messageTarget: 5,
      triggerMode: "time",
      randomMessageCountEnabled: true,
      messageCount: 5,
      messageCountMin: 3,
      messageCountMax: 7,
      isGenerating: false,
      currentChatId: null
    };
    userStates.set(key, state);
    return state;
  }
  return userStates.get(key);
}
function recalcMessageTarget(state) {
  if (state.randomMessageCountEnabled) {
    state.messageTarget = state.messageCountMin + Math.floor(Math.random() * (state.messageCountMax - state.messageCountMin + 1));
  } else {
    state.messageTarget = state.messageCount;
  }
}
var CHATROOM_HISTORY_KEY = "council_chatroom_history";
async function getChatroomHistory(chatId) {
  try {
    const raw = await spindle.variables.chat.get(chatId, CHATROOM_HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed))
        return parsed;
    }
  } catch {}
  return [];
}
async function saveChatroomHistory(chatId, history) {
  await spindle.variables.chat.set(chatId, CHATROOM_HISTORY_KEY, JSON.stringify(history));
}
async function loadPersistedSettings(userId) {
  return spindle.userStorage.getJson(USER_SETTINGS_PATH, {
    fallback: {},
    userId
  });
}
async function updatePersistedSettings(updater, userId) {
  const current = await loadPersistedSettings(userId);
  await spindle.userStorage.setJson(USER_SETTINGS_PATH, updater(current), {
    indent: 2,
    userId
  });
}
function stripHtmlTags(text) {
  return text.replace(/<[^>]*>/g, "");
}
function toLlmHistory(messages) {
  return messages.map((m) => ({
    role: m.isUser ? "user" : "assistant",
    content: `[${m.name} in Chatroom]: ${stripHtmlTags(m.content)}`
  }));
}
async function runCouncilGeneration(userId) {
  const state = getUserState(userId);
  if (state.isGenerating)
    return;
  state.isGenerating = true;
  spindle.log.info("Starting generation trigger processing");
  if (!spindle.permissions.has("generation")) {
    spindle.log.warn("Generation permission not granted");
    spindle.sendToFrontend({ type: "error", message: "Generation permission not granted" }, userId);
    state.isGenerating = false;
    return;
  }
  try {
    spindle.log.info("Fetching active chat...");
    const activeChat = await spindle.chats.getActive(userId);
    if (!activeChat) {
      spindle.log.warn("No active chat found");
      spindle.sendToFrontend({ type: "error", message: "No active chat to monitor." }, userId);
      state.isGenerating = false;
      return;
    }
    const chatId = activeChat.id;
    const persistedSettings = await loadPersistedSettings(userId);
    spindle.log.info(`Active chat found: ${chatId}. Fetching messages...`);
    const contextLimit = persistedSettings.contextLimit ?? 10;
    const messages = await spindle.chat.getMessages(chatId);
    const recentMessages = messages.slice(-contextLimit);
    const chatContext = recentMessages.map((m) => `${m.name || m.role}: ${stripHtmlTags(m.content)}`).join("\\n");
    spindle.log.info("Fetching council members...");
    const councilMembers = await spindle.council.getMembers({ userId });
    if (councilMembers.length === 0) {
      spindle.log.warn("No council members assigned");
      spindle.sendToFrontend({ type: "error", message: "No council members assigned." }, userId);
      state.isGenerating = false;
      return;
    }
    spindle.log.info("Fetching active persona...");
    const activePersona = await spindle.personas.getActive(userId);
    const councilContext = councilMembers.map((m) => `- ${m.name}: ${m.role}. Personality: ${m.personality}`).join("\\n");
    const memberCount = councilMembers.length;
    const targetResponses = memberCount === 1 ? 1 : 1 + Math.floor(Math.random() * memberCount);
    const responseInstruction = memberCount === 1 ? `Write exactly 1 new message in the chatroom.` : `Write ${targetResponses} new message${targetResponses > 1 ? "s" : ""} in the chatroom.`;
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
      { role: "system", content: systemPrompt },
      ...toLlmHistory(chatroomHistory).slice(-20)
    ];
    spindle.log.info("Resolving connection profile...");
    const connId = persistedSettings.connectionId;
    let conn = null;
    if (connId) {
      conn = await spindle.connections.get(connId, userId);
    }
    if (!conn) {
      const conns = await spindle.connections.list(userId);
      conn = conns.find((c) => c.is_default) || conns[0];
    }
    if (!conn) {
      spindle.log.error("No connection profile available");
      spindle.sendToFrontend({ type: "error", message: "No connection profile available." }, userId);
      state.isGenerating = false;
      return;
    }
    spindle.log.info(`Generating using connection: ${conn.id} (${conn.provider} - ${conn.model})`);
    const maxContextTokens = persistedSettings.maxContextTokens ?? 4096;
    if (spindle.permissions.has("generation")) {
      try {
        let countResult = await spindle.tokens.countMessages(promptMessages, { model: conn.model, userId });
        spindle.log.info(`Prompt token count: ${countResult.total_tokens} / ${maxContextTokens} (model: ${countResult.model})`);
        let trimAttempts = 0;
        const maxTrimAttempts = 100;
        while (countResult.total_tokens > maxContextTokens && trimAttempts < maxTrimAttempts) {
          const firstNonSystemIdx = promptMessages.findIndex((m) => m.role !== "system");
          if (firstNonSystemIdx === -1)
            break;
          promptMessages.splice(firstNonSystemIdx, 1);
          trimAttempts++;
          countResult = await spindle.tokens.countMessages(promptMessages, { model: conn.model, userId });
        }
        if (trimAttempts > 0) {
          spindle.log.info(`Trimmed ${trimAttempts} chatroom history message(s) to fit within ${maxContextTokens} tokens. Final count: ${countResult.total_tokens}`);
        }
      } catch (e) {
        spindle.log.warn(`Token count failed, skipping context clipping: ${e.message || String(e)}`);
      }
    }
    spindle.sendToFrontend({ type: "generation_started" }, userId);
    const stream = spindle.generate.rawStream({
      type: "raw",
      provider: conn.provider,
      model: conn.model,
      connection_id: conn.id,
      messages: promptMessages,
      userId
    });
    let fullText = "";
    for await (const chunk of stream) {
      if (chunk.type === "token") {
        fullText += chunk.token;
      } else if (chunk.type === "done") {
        fullText = chunk.content || fullText;
      }
    }
    spindle.log.info("Generation stream completed. Processing results...");
    const chunks = fullText.split("---");
    for (const chunk of chunks) {
      if (!chunk.trim())
        continue;
      const match = chunk.trim().match(/^([^:(]+)(?:\s*\(([^)]+)\))?:\s*(.*)$/s);
      let speakerName = "Unknown";
      let username = "";
      let content = chunk.trim();
      if (match) {
        speakerName = match[1].trim();
        username = match[2] ? match[2].trim() : speakerName;
        content = match[3].trim();
      }
      const speaker = councilMembers.find((m) => m.name.toLowerCase() === speakerName.toLowerCase());
      const avatarUrl = speaker ? speaker.avatarUrl : null;
      const uiMsg = {
        name: speakerName,
        username: username || speakerName,
        content,
        avatarUrl,
        isUser: false,
        ts: Date.now()
      };
      chatroomHistory.push(uiMsg);
      spindle.sendToFrontend({
        type: "new_message",
        name: uiMsg.name,
        username: uiMsg.username,
        content: uiMsg.content,
        avatarUrl: uiMsg.avatarUrl,
        isUser: uiMsg.isUser
      }, userId);
    }
    await saveChatroomHistory(chatId, chatroomHistory);
    spindle.log.info("Successfully dispatched messages to frontend.");
    spindle.sendToFrontend({ type: "generation_ended" }, userId);
  } catch (e) {
    spindle.log.error(`Generation error: ${e.message || String(e)}`);
    spindle.sendToFrontend({ type: "generation_ended" }, userId);
    spindle.sendToFrontend({ type: "error", message: e.message || String(e) }, userId);
  } finally {
    state.isGenerating = false;
  }
}
spindle.onFrontendMessage(async (payload, userId) => {
  if (userId) {
    activeUserId = userId;
  }
  if (payload.type === "save_settings") {
    const state = getUserState(userId);
    const oldMode = state.triggerMode;
    state.triggerMode = payload.triggerMode || "time";
    state.messageCount = payload.messageCount ?? 5;
    state.randomMessageCountEnabled = payload.randomMessageCountEnabled ?? true;
    state.messageCountMin = payload.messageCountMin ?? 3;
    state.messageCountMax = payload.messageCountMax ?? 7;
    recalcMessageTarget(state);
    if (oldMode !== state.triggerMode) {
      state.messageCounter = 0;
    }
    const chatName = payload.chatroomName?.trim();
    await updatePersistedSettings((settings) => {
      const next = {
        ...settings,
        messageInterval: payload.messageInterval ?? 10,
        randomIntervalEnabled: payload.randomIntervalEnabled ?? true,
        intervalMin: payload.intervalMin ?? 5,
        intervalMax: payload.intervalMax ?? 15,
        contextLimit: payload.contextLimit ?? 10,
        maxContextTokens: payload.maxContextTokens ?? 4096,
        connectionId: payload.connectionId || "",
        triggerMode: payload.triggerMode || "time",
        messageCount: payload.messageCount ?? 5,
        randomMessageCountEnabled: payload.randomMessageCountEnabled ?? true,
        messageCountMin: payload.messageCountMin ?? 3,
        messageCountMax: payload.messageCountMax ?? 7
      };
      if (state.currentChatId) {
        next.chatroomNames = {
          ...settings.chatroomNames ?? {},
          [state.currentChatId]: chatName || ""
        };
      }
      return next;
    }, userId);
    spindle.toast.success("Chatroom configuration saved.", { userId });
    return;
  }
  if (payload.type === "load_settings") {
    const settings = await loadPersistedSettings(userId);
    let connections = [];
    try {
      if (spindle.permissions.has("generation")) {
        connections = await spindle.connections.list(userId);
      }
    } catch (err) {
      spindle.log.warn("Could not fetch connections for chatroom overlay settings.");
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
      spindle.log.warn("Could not fetch active persona for chatroom.");
    }
    const state = getUserState(userId);
    state.autoReply = settings.autoReply ?? false;
    state.triggerMode = settings.triggerMode || "time";
    let activeChatId = null;
    try {
      const activeChat = await spindle.chats.getActive(userId);
      activeChatId = activeChat ? activeChat.id : null;
      state.currentChatId = activeChatId;
    } catch {
      state.currentChatId = null;
    }
    state.messageCount = settings.messageCount ?? 5;
    state.randomMessageCountEnabled = settings.randomMessageCountEnabled ?? true;
    state.messageCountMin = settings.messageCountMin ?? 3;
    state.messageCountMax = settings.messageCountMax ?? 7;
    recalcMessageTarget(state);
    let chatroomName = null;
    if (activeChatId) {
      chatroomName = settings.chatroomNames?.[activeChatId] ?? null;
    }
    let history = [];
    let hasActiveChat = false;
    if (activeChatId) {
      hasActiveChat = true;
      try {
        history = await getChatroomHistory(activeChatId);
      } catch (e) {
        spindle.log.warn("Could not load chatroom history.");
      }
    }
    spindle.sendToFrontend({
      type: "settings_loaded",
      triggerMode: state.triggerMode,
      messageInterval: settings.messageInterval ?? 10,
      randomIntervalEnabled: settings.randomIntervalEnabled ?? true,
      intervalMin: settings.intervalMin ?? 5,
      intervalMax: settings.intervalMax ?? 15,
      messageCount: state.messageCount,
      randomMessageCountEnabled: state.randomMessageCountEnabled,
      messageCountMin: state.messageCountMin,
      messageCountMax: state.messageCountMax,
      contextLimit: settings.contextLimit ?? 10,
      maxContextTokens: settings.maxContextTokens ?? 4096,
      connectionId: settings.connectionId || "",
      connections,
      history,
      hasActiveChat,
      userPersona,
      autoReply: state.autoReply,
      widgetX: settings.widgetX ?? null,
      widgetY: settings.widgetY ?? null,
      widgetW: settings.widgetW ?? null,
      widgetH: settings.widgetH ?? null,
      chatroomName: chatroomName || undefined
    }, userId);
    return;
  }
  if (payload.type === "set_auto_reply") {
    const enabled = payload.enabled ?? false;
    await updatePersistedSettings((settings) => ({
      ...settings,
      autoReply: enabled
    }), userId);
    const state = getUserState(userId);
    state.autoReply = enabled;
    return;
  }
  if (payload.type === "user_message") {
    spindle.log.info("Received user_message trigger");
    let personaName = "The User";
    let personaAvatar = null;
    try {
      const activePersona = await spindle.personas.getActive(userId);
      if (activePersona) {
        personaName = activePersona.name;
        personaAvatar = activePersona.image_id ? `/api/v1/images/${activePersona.image_id}` : null;
      }
    } catch (e) {
      spindle.log.warn("Could not fetch active persona for user message.");
    }
    const activeChat = await spindle.chats.getActive(userId);
    if (!activeChat) {
      spindle.sendToFrontend({ type: "error", message: "No active chat to send message to." }, userId);
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
      type: "new_message",
      name: personaName,
      username: personaName,
      content: payload.content,
      avatarUrl: personaAvatar,
      isUser: true
    }, userId);
    await runCouncilGeneration(userId);
    return;
  }
  if (payload.type === "trigger_generation") {
    await runCouncilGeneration(userId);
    return;
  }
  if (payload.type === "clear_chat_history") {
    try {
      const activeChat = await spindle.chats.getActive(userId);
      if (!activeChat) {
        spindle.sendToFrontend({ type: "error", message: "No active chat to clear history from." }, userId);
        return;
      }
      await spindle.variables.chat.delete(activeChat.id, CHATROOM_HISTORY_KEY);
      spindle.sendToFrontend({ type: "chat_changed", history: [] }, userId);
      spindle.toast.success("Chatroom history cleared.", { userId });
    } catch (e) {
      spindle.log.error(`Failed to clear chatroom history: ${e.message || String(e)}`);
      spindle.sendToFrontend({ type: "error", message: "Failed to clear chatroom history." }, userId);
    }
    return;
  }
  if (payload.type === "save_widget_state") {
    await updatePersistedSettings((settings) => ({
      ...settings,
      widgetX: payload.x != null ? Math.round(payload.x) : settings.widgetX,
      widgetY: payload.y != null ? Math.round(payload.y) : settings.widgetY,
      widgetW: payload.w != null ? Math.round(payload.w) : settings.widgetW,
      widgetH: payload.h != null ? Math.round(payload.h) : settings.widgetH
    }), userId);
    return;
  }
});
spindle.on("MESSAGE_SENT", async (payload, userId) => {
  const state = getUserState(userId);
  if (state.triggerMode !== "messages" || !state.autoReply)
    return;
  try {
    const activeChat = await spindle.chats.getActive(userId);
    const eventChatId = payload?.chatId || payload?.chat_id;
    if (!activeChat || activeChat.id !== eventChatId)
      return;
    state.messageCounter++;
    spindle.log.info(`Message-based auto-reply counter: ${state.messageCounter}/${state.messageTarget}`);
    if (state.messageCounter >= state.messageTarget) {
      state.messageCounter = 0;
      recalcMessageTarget(state);
      spindle.log.info("Message target reached. Triggering council generation.");
      await runCouncilGeneration(userId);
    }
  } catch (e) {
    spindle.log.error(`Message trigger error: ${e.message || String(e)}`);
  }
});
spindle.on("SETTINGS_UPDATED", async (payload, userId) => {
  const state = getUserState(userId);
  const key = payload?.key ?? payload?.keys?.[0] ?? null;
  if (key !== "activeChatId")
    return;
  const newChatId = payload?.value ?? null;
  if (!newChatId) {
    state.currentChatId = null;
    spindle.sendToFrontend({ type: "hide_widget" }, userId);
    return;
  }
  if (state.currentChatId !== newChatId) {
    state.currentChatId = newChatId;
    const history = await getChatroomHistory(newChatId);
    const settings = await loadPersistedSettings(userId);
    const chatroomName = settings.chatroomNames?.[newChatId];
    spindle.sendToFrontend({ type: "chat_changed", history, chatroomName: chatroomName || undefined }, userId);
  }
});
