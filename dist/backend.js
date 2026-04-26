// @bun
// src/backend.ts
var chatroomHistory = [];
spindle.onFrontendMessage(async (payload, userId) => {
  if (payload.type === "save_settings") {
    await spindle.variables.global.set("chatroom_interval_min", payload.intervalMin.toString(), userId);
    await spindle.variables.global.set("chatroom_interval_max", payload.intervalMax.toString(), userId);
    await spindle.variables.global.set("chatroom_context_limit", payload.contextLimit.toString(), userId);
    await spindle.variables.global.set("chatroom_connection_id", payload.connectionId || "", userId);
    spindle.toast.success("Chatroom configuration saved.", userId);
    return;
  }
  if (payload.type === "load_settings") {
    const min = await spindle.variables.global.get("chatroom_interval_min", userId);
    const max = await spindle.variables.global.get("chatroom_interval_max", userId);
    const ctxLimit = await spindle.variables.global.get("chatroom_context_limit", userId);
    const connId = await spindle.variables.global.get("chatroom_connection_id", userId);
    let connections = [];
    try {
      if (spindle.permissions.has("generation")) {
        connections = await spindle.connections.list(userId);
      }
    } catch (err) {
      spindle.log.warn("Could not fetch connections for chatroom overlay settings.");
    }
    spindle.sendToFrontend({
      type: "settings_loaded",
      intervalMin: min ? parseInt(min, 10) : 5,
      intervalMax: max ? parseInt(max, 10) : 15,
      contextLimit: ctxLimit ? parseInt(ctxLimit, 10) : 10,
      connectionId: connId,
      connections
    }, userId);
    return;
  }
  if (payload.type === "user_message") {
    spindle.log.info("Received user_message trigger");
    chatroomHistory.push({ role: "user", content: `[User Message in Chatroom]: ${payload.content}` });
    spindle.sendToFrontend({
      type: "new_message",
      name: "The User",
      username: "User",
      content: payload.content,
      avatarUrl: null,
      isUser: true
    }, userId);
    payload.type = "trigger_generation";
  }
  if (payload.type === "trigger_generation") {
    spindle.log.info("Starting generation trigger processing");
    if (!spindle.permissions.has("generation")) {
      spindle.log.warn("Generation permission not granted");
      spindle.sendToFrontend({ type: "error", message: "Generation permission not granted" }, userId);
      return;
    }
    try {
      spindle.log.info("Fetching active chat...");
      const activeChat = await spindle.chats.getActive(userId);
      if (!activeChat) {
        spindle.log.warn("No active chat found");
        spindle.sendToFrontend({ type: "error", message: "No active chat to monitor." }, userId);
        return;
      }
      spindle.log.info(`Active chat found: ${activeChat.id}. Fetching messages...`);
      const ctxLimitStr = await spindle.variables.global.get("chatroom_context_limit", userId);
      const contextLimit = ctxLimitStr ? parseInt(ctxLimitStr, 10) : 10;
      const messages = await spindle.chat.getMessages(activeChat.id, userId);
      const recentMessages = messages.slice(-contextLimit);
      const chatContext = recentMessages.map((m) => `${m.name || m.role}: ${m.content}`).join("\\n");
      spindle.log.info("Fetching council members...");
      const councilMembers = await spindle.council.getMembers(userId);
      if (councilMembers.length === 0) {
        spindle.log.warn("No council members assigned");
        spindle.sendToFrontend({ type: "error", message: "No council members assigned." }, userId);
        return;
      }
      spindle.log.info("Fetching active persona...");
      const activePersona = await spindle.personas.getActive(userId);
      const personaName = activePersona ? activePersona.name : "The User";
      const councilContext = councilMembers.map((m) => `- ${m.name}: ${m.role}. Personality: ${m.personality}`).join("\\n");
      const systemPrompt = `You are running a live internet shitposting chatroom for the "council members" who are watching a story unfold.
They are watching the main story chat and reacting to it in real-time.
They talk casually, use internet slang, bicker with each other, and gossip about the characters or the author (${personaName}).

COUNCIL MEMBERS:
${councilContext}

CURRENT STORY CONTEXT:
${chatContext}

Write 1 to 3 new messages in the chatroom.
For each message, one council member should speak. They should pick a chat "username" for themselves based on their character, and continue to use it.
Separate each message with "---" on a new line.
Format each message exactly as follows:
MemberName (Username): The message content
`;
      const promptMessages = [
        { role: "system", content: systemPrompt },
        ...chatroomHistory.slice(-20)
      ];
      spindle.log.info("Resolving connection profile...");
      const connId = await spindle.variables.global.get("chatroom_connection_id", userId);
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
        return;
      }
      spindle.log.info(`Generating using connection: ${conn.id} (${conn.provider} - ${conn.model})`);
      spindle.sendToFrontend({ type: "generation_started" }, userId);
      const stream = spindle.generate.rawStream({
        provider: conn.provider,
        model: conn.model,
        connection_id: conn.id,
        messages: promptMessages
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
      chatroomHistory.push({ role: "assistant", content: fullText });
      const chunks = fullText.split("---");
      for (const chunk of chunks) {
        if (!chunk.trim())
          continue;
        const match = chunk.trim().match(/^([^:(]+)(?:\\s*\\(([^)]+)\\))?:\\s*(.*)$/s);
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
        spindle.sendToFrontend({
          type: "new_message",
          name: speakerName,
          username: username || speakerName,
          content,
          avatarUrl,
          isUser: false
        }, userId);
      }
      spindle.log.info("Successfully dispatched messages to frontend.");
      spindle.sendToFrontend({ type: "generation_ended" }, userId);
    } catch (e) {
      spindle.log.error(`Generation error: ${e.message || String(e)}`);
      spindle.sendToFrontend({ type: "generation_ended" }, userId);
      spindle.sendToFrontend({ type: "error", message: e.message || String(e) }, userId);
    }
  }
});
