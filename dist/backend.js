// src/backend.ts
var userStates = new Map;
var activeUserId = null;
function getUserState(userId2) {
  const key = userId2 || activeUserId || "default";
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
function stripHtmlTags(text) {
  return text.replace(/<[^>]*>/g, "");
}
function toLlmHistory(messages) {
  return messages.map((m) => ({
    role: m.isUser ? "user" : "assistant",
    content: `[${m.name} in Chatroom]: ${stripHtmlTags(m.content)}`
  }));
}
async function runCouncilGeneration(userId2) {
  const state = getUserState(userId2);
  if (state.isGenerating)
    return;
  state.isGenerating = true;
  spindle.log.info("Starting generation trigger processing");
  if (!spindle.permissions.has("generation")) {
    spindle.log.warn("Generation permission not granted");
    spindle.sendToFrontend({ type: "error", message: "Generation permission not granted" });
    state.isGenerating = false;
    return;
  }
  try {
    spindle.log.info("Fetching active chat...");
    const activeChat = await spindle.chats.getActive(userId2);
    if (!activeChat) {
      spindle.log.warn("No active chat found");
      spindle.sendToFrontend({ type: "error", message: "No active chat to monitor." });
      state.isGenerating = false;
      return;
    }
    const chatId = activeChat.id;
    spindle.log.info(`Active chat found: ${chatId}. Fetching messages...`);
    const ctxLimitStr = await spindle.variables.global.get("chatroom_context_limit", userId2);
    const contextLimit = ctxLimitStr ? parseInt(ctxLimitStr, 10) : 10;
    const messages = await spindle.chat.getMessages(chatId);
    const recentMessages = messages.slice(-contextLimit);
    const chatContext = recentMessages.map((m) => `${m.name || m.role}: ${stripHtmlTags(m.content)}`).join("\\n");
    spindle.log.info("Fetching council members...");
    const councilMembers = await spindle.council.getMembers({ userId: userId2 });
    if (councilMembers.length === 0) {
      spindle.log.warn("No council members assigned");
      spindle.sendToFrontend({ type: "error", message: "No council members assigned." });
      state.isGenerating = false;
      return;
    }
    spindle.log.info("Fetching active persona...");
    const activePersona = await spindle.personas.getActive(userId2);
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
    const connId = await spindle.variables.global.get("chatroom_connection_id", userId2);
    let conn = null;
    if (connId) {
      conn = await spindle.connections.get(connId, userId2);
    }
    if (!conn) {
      const conns = await spindle.connections.list(userId2);
      conn = conns.find((c) => c.is_default) || conns[0];
    }
    if (!conn) {
      spindle.log.error("No connection profile available");
      spindle.sendToFrontend({ type: "error", message: "No connection profile available." });
      state.isGenerating = false;
      return;
    }
    spindle.log.info(`Generating using connection: ${conn.id} (${conn.provider} - ${conn.model})`);
    const maxCtxStr = await spindle.variables.global.get("chatroom_max_context_tokens", userId2);
    const maxContextTokens = maxCtxStr ? parseInt(maxCtxStr, 10) : 4096;
    if (spindle.permissions.has("generation")) {
      try {
        let countResult = await spindle.tokens.countMessages(promptMessages, { model: conn.model, userId: userId2 });
        spindle.log.info(`Prompt token count: ${countResult.total_tokens} / ${maxContextTokens} (model: ${countResult.model})`);
        let trimAttempts = 0;
        const maxTrimAttempts = 100;
        while (countResult.total_tokens > maxContextTokens && trimAttempts < maxTrimAttempts) {
          const firstNonSystemIdx = promptMessages.findIndex((m) => m.role !== "system");
          if (firstNonSystemIdx === -1)
            break;
          promptMessages.splice(firstNonSystemIdx, 1);
          trimAttempts++;
          countResult = await spindle.tokens.countMessages(promptMessages, { model: conn.model, userId: userId2 });
        }
        if (trimAttempts > 0) {
          spindle.log.info(`Trimmed ${trimAttempts} chatroom history message(s) to fit within ${maxContextTokens} tokens. Final count: ${countResult.total_tokens}`);
        }
      } catch (e) {
        spindle.log.warn(`Token count failed, skipping context clipping: ${e.message || String(e)}`);
      }
    }
    spindle.sendToFrontend({ type: "generation_started" });
    const stream = spindle.generate.rawStream({
      type: "raw",
      provider: conn.provider,
      model: conn.model,
      connection_id: conn.id,
      messages: promptMessages,
      userId: userId2
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
      });
    }
    await saveChatroomHistory(chatId, chatroomHistory);
    spindle.log.info("Successfully dispatched messages to frontend.");
    spindle.sendToFrontend({ type: "generation_ended" });
  } catch (e) {
    spindle.log.error(`Generation error: ${e.message || String(e)}`);
    spindle.sendToFrontend({ type: "generation_ended" });
    spindle.sendToFrontend({ type: "error", message: e.message || String(e) });
  } finally {
    state.isGenerating = false;
  }
}
spindle.onFrontendMessage(async (payload, userId2) => {
  if (userId2) {
    activeUserId = userId2;
  }
  if (payload.type === "save_settings") {
    await spindle.variables.global.set("chatroom_message_interval", (payload.messageInterval ?? 10).toString(), userId2);
    await spindle.variables.global.set("chatroom_random_interval_enabled", (payload.randomIntervalEnabled ?? true).toString(), userId2);
    await spindle.variables.global.set("chatroom_interval_min", payload.intervalMin.toString(), userId2);
    await spindle.variables.global.set("chatroom_interval_max", payload.intervalMax.toString(), userId2);
    await spindle.variables.global.set("chatroom_context_limit", payload.contextLimit.toString(), userId2);
    await spindle.variables.global.set("chatroom_max_context_tokens", (payload.maxContextTokens ?? 4096).toString(), userId2);
    await spindle.variables.global.set("chatroom_connection_id", payload.connectionId || "", userId2);
    await spindle.variables.global.set("chatroom_trigger_mode", payload.triggerMode || "time", userId2);
    await spindle.variables.global.set("chatroom_message_count", (payload.messageCount ?? 5).toString(), userId2);
    await spindle.variables.global.set("chatroom_random_message_count_enabled", (payload.randomMessageCountEnabled ?? true).toString(), userId2);
    await spindle.variables.global.set("chatroom_message_count_min", (payload.messageCountMin ?? 3).toString(), userId2);
    await spindle.variables.global.set("chatroom_message_count_max", (payload.messageCountMax ?? 7).toString(), userId2);
    const state = getUserState(userId2);
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
    if (state.currentChatId && chatName) {
      await spindle.variables.global.set(`chatroom_name_${state.currentChatId}`, chatName, userId2);
    }
    spindle.toast.success("Chatroom configuration saved.", { userId: userId2 });
    return;
  }
  if (payload.type === "load_settings") {
    const msgInterval = await spindle.variables.global.get("chatroom_message_interval", userId2);
    const randomEnabled = await spindle.variables.global.get("chatroom_random_interval_enabled", userId2);
    const min = await spindle.variables.global.get("chatroom_interval_min", userId2);
    const max = await spindle.variables.global.get("chatroom_interval_max", userId2);
    const ctxLimit = await spindle.variables.global.get("chatroom_context_limit", userId2);
    const maxCtxTokens = await spindle.variables.global.get("chatroom_max_context_tokens", userId2);
    const connId = await spindle.variables.global.get("chatroom_connection_id", userId2);
    const triggerMode = await spindle.variables.global.get("chatroom_trigger_mode", userId2);
    const messageCount = await spindle.variables.global.get("chatroom_message_count", userId2);
    const randomMessageCountEnabled = await spindle.variables.global.get("chatroom_random_message_count_enabled", userId2);
    const messageCountMin = await spindle.variables.global.get("chatroom_message_count_min", userId2);
    const messageCountMax = await spindle.variables.global.get("chatroom_message_count_max", userId2);
    const autoReply = await spindle.variables.global.get("chatroom_auto_reply", userId2);
    const widgetX = await spindle.variables.global.get("chatroom_widget_x", userId2);
    const widgetY = await spindle.variables.global.get("chatroom_widget_y", userId2);
    const widgetW = await spindle.variables.global.get("chatroom_widget_w", userId2);
    const widgetH = await spindle.variables.global.get("chatroom_widget_h", userId2);
    let connections = [];
    try {
      if (spindle.permissions.has("generation")) {
        connections = await spindle.connections.list(userId2);
      }
    } catch (err) {
      spindle.log.warn("Could not fetch connections for chatroom overlay settings.");
    }
    let userPersona = null;
    try {
      const persona = await spindle.personas.getActive(userId2);
      if (persona) {
        userPersona = {
          name: persona.name,
          avatarUrl: persona.image_id ? `/api/v1/images/${persona.image_id}` : null
        };
      }
    } catch (e) {
      spindle.log.warn("Could not fetch active persona for chatroom.");
    }
    const state = getUserState(userId2);
    state.autoReply = autoReply === "true";
    state.triggerMode = triggerMode || "time";
    let activeChatId = null;
    try {
      const activeChat = await spindle.chats.getActive(userId2);
      activeChatId = activeChat ? activeChat.id : null;
      state.currentChatId = activeChatId;
    } catch {
      state.currentChatId = null;
    }
    state.messageCount = messageCount ? parseInt(messageCount, 10) : 5;
    state.randomMessageCountEnabled = randomMessageCountEnabled ? randomMessageCountEnabled === "true" : true;
    state.messageCountMin = messageCountMin ? parseInt(messageCountMin, 10) : 3;
    state.messageCountMax = messageCountMax ? parseInt(messageCountMax, 10) : 7;
    recalcMessageTarget(state);
    let chatroomName = null;
    if (activeChatId) {
      chatroomName = await spindle.variables.global.get(`chatroom_name_${activeChatId}`, userId2);
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
      messageInterval: msgInterval ? parseInt(msgInterval, 10) : 10,
      randomIntervalEnabled: randomEnabled ? randomEnabled === "true" : true,
      intervalMin: min ? parseInt(min, 10) : 5,
      intervalMax: max ? parseInt(max, 10) : 15,
      messageCount: state.messageCount,
      randomMessageCountEnabled: state.randomMessageCountEnabled,
      messageCountMin: state.messageCountMin,
      messageCountMax: state.messageCountMax,
      contextLimit: ctxLimit ? parseInt(ctxLimit, 10) : 10,
      maxContextTokens: maxCtxTokens ? parseInt(maxCtxTokens, 10) : 4096,
      connectionId: connId,
      connections,
      history,
      hasActiveChat,
      userPersona,
      autoReply: state.autoReply,
      widgetX: widgetX ? parseInt(widgetX, 10) : null,
      widgetY: widgetY ? parseInt(widgetY, 10) : null,
      widgetW: widgetW ? parseInt(widgetW, 10) : null,
      widgetH: widgetH ? parseInt(widgetH, 10) : null,
      chatroomName: chatroomName || undefined
    }, userId2);
    return;
  }
  if (payload.type === "set_auto_reply") {
    const enabled = payload.enabled ?? false;
    await spindle.variables.global.set("chatroom_auto_reply", enabled.toString(), userId2);
    const state = getUserState(userId2);
    state.autoReply = enabled;
    return;
  }
  if (payload.type === "user_message") {
    spindle.log.info("Received user_message trigger");
    let personaName = "The User";
    let personaAvatar = null;
    try {
      const activePersona = await spindle.personas.getActive(userId2);
      if (activePersona) {
        personaName = activePersona.name;
        personaAvatar = activePersona.image_id ? `/api/v1/images/${activePersona.image_id}` : null;
      }
    } catch (e) {
      spindle.log.warn("Could not fetch active persona for user message.");
    }
    const activeChat = await spindle.chats.getActive(userId2);
    if (!activeChat) {
      spindle.sendToFrontend({ type: "error", message: "No active chat to send message to." }, userId2);
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
    }, userId2);
    await runCouncilGeneration(userId2);
    return;
  }
  if (payload.type === "trigger_generation") {
    await runCouncilGeneration(userId2);
    return;
  }
  if (payload.type === "clear_chat_history") {
    try {
      const activeChat = await spindle.chats.getActive(userId2);
      if (!activeChat) {
        spindle.sendToFrontend({ type: "error", message: "No active chat to clear history from." }, userId2);
        return;
      }
      await spindle.variables.chat.delete(activeChat.id, CHATROOM_HISTORY_KEY);
      spindle.sendToFrontend({ type: "chat_changed", history: [] }, userId2);
      spindle.toast.success("Chatroom history cleared.", { userId: userId2 });
    } catch (e) {
      spindle.log.error(`Failed to clear chatroom history: ${e.message || String(e)}`);
      spindle.sendToFrontend({ type: "error", message: "Failed to clear chatroom history." }, userId2);
    }
    return;
  }
  if (payload.type === "save_widget_state") {
    if (payload.x != null)
      await spindle.variables.global.set("chatroom_widget_x", String(Math.round(payload.x)), userId2);
    if (payload.y != null)
      await spindle.variables.global.set("chatroom_widget_y", String(Math.round(payload.y)), userId2);
    if (payload.w != null)
      await spindle.variables.global.set("chatroom_widget_w", String(Math.round(payload.w)), userId2);
    if (payload.h != null)
      await spindle.variables.global.set("chatroom_widget_h", String(Math.round(payload.h)), userId2);
    return;
  }
});
spindle.on("MESSAGE_SENT", async (payload) => {
  const state = getUserState();
  if (state.triggerMode !== "messages" || !state.autoReply)
    return;
  try {
    const activeChat = await spindle.chats.getActive();
    const eventChatId = payload?.chatId || payload?.chat_id;
    if (!activeChat || activeChat.id !== eventChatId)
      return;
    state.messageCounter++;
    spindle.log.info(`Message-based auto-reply counter: ${state.messageCounter}/${state.messageTarget}`);
    if (state.messageCounter >= state.messageTarget) {
      state.messageCounter = 0;
      recalcMessageTarget(state);
      spindle.log.info("Message target reached. Triggering council generation.");
      await runCouncilGeneration();
    }
  } catch (e) {
    spindle.log.error(`Message trigger error: ${e.message || String(e)}`);
  }
});
spindle.on("SETTINGS_UPDATED", async (payload) => {
  const state = getUserState();
  const key = payload?.key ?? payload?.keys?.[0] ?? null;
  if (key !== "activeChatId")
    return;
  const newChatId = payload?.value ?? null;
  if (!newChatId) {
    state.currentChatId = null;
    spindle.sendToFrontend({ type: "hide_widget" });
    return;
  }
  if (state.currentChatId !== newChatId) {
    state.currentChatId = newChatId;
    const history = await getChatroomHistory(newChatId);
    const chatroomName = await spindle.variables.global.get(`chatroom_name_${newChatId}`, userId);
    spindle.sendToFrontend({ type: "chat_changed", history, chatroomName: chatroomName || undefined });
  }
});
