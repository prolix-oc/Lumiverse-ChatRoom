import type { SpindleAPI } from 'lumiverse-spindle-types';
declare const spindle: SpindleAPI;

// Keep track of the chatroom history so the council members remember what they said
const chatroomHistory: { role: 'system' | 'user' | 'assistant', content: string }[] = [];

spindle.onFrontendMessage(async (payload, userId) => {
  if (payload.type === 'save_settings') {
    await spindle.variables.global.set('chatroom_interval_min', payload.intervalMin.toString(), userId);
    await spindle.variables.global.set('chatroom_interval_max', payload.intervalMax.toString(), userId);
    await spindle.variables.global.set('chatroom_context_limit', payload.contextLimit.toString(), userId);
    await spindle.variables.global.set('chatroom_connection_id', payload.connectionId || '', userId);
    
    spindle.toast.success('Chatroom configuration saved.', userId);
    return;
  }

  if (payload.type === 'load_settings') {
    const min = await spindle.variables.global.get('chatroom_interval_min', userId);
    const max = await spindle.variables.global.get('chatroom_interval_max', userId);
    const ctxLimit = await spindle.variables.global.get('chatroom_context_limit', userId);
    const connId = await spindle.variables.global.get('chatroom_connection_id', userId);
    
    let connections: any[] = [];
    try {
      if (spindle.permissions.has('generation')) {
        connections = await spindle.connections.list(userId);
      }
    } catch (err) {
      spindle.log.warn('Could not fetch connections for chatroom overlay settings.');
    }
    
    spindle.sendToFrontend({
      type: 'settings_loaded',
      intervalMin: min ? parseInt(min, 10) : 5,
      intervalMax: max ? parseInt(max, 10) : 15,
      contextLimit: ctxLimit ? parseInt(ctxLimit, 10) : 10,
      connectionId: connId,
      connections: connections
    }, userId);
    return;
  }

  if (payload.type === 'user_message') {
    // A message from the user specifically to the council
    chatroomHistory.push({ role: 'user', content: `[User Message in Chatroom]: ${payload.content}` });
    
    // Broadcast back so it renders
    spindle.sendToFrontend({
      type: 'new_message',
      name: 'The User',
      username: 'User',
      content: payload.content,
      avatarUrl: null,
      isUser: true
    }, userId);
  }
  
  if (payload.type === 'trigger_generation') {
    if (!spindle.permissions.has('generation')) {
      spindle.sendToFrontend({ type: 'error', message: 'Generation permission not granted' }, userId);
      return;
    }

    try {
      // Get the active chat
      const activeChat = await spindle.chats.getActive(userId);
      if (!activeChat) {
        spindle.sendToFrontend({ type: 'error', message: 'No active chat to monitor.' }, userId);
        return;
      }

      // Get recent messages based on configured limit
      const ctxLimitStr = await spindle.variables.global.get('chatroom_context_limit', userId);
      const contextLimit = ctxLimitStr ? parseInt(ctxLimitStr, 10) : 10;
      
      const messages = await spindle.chat.getMessages(activeChat.id, userId);
      const recentMessages = messages.slice(-contextLimit);
      const chatContext = recentMessages.map(m => `${m.name || m.role}: ${m.content}`).join('\\n');

      // Get council members
      const councilMembers = await spindle.council.getMembers(userId);
      if (councilMembers.length === 0) {
        spindle.sendToFrontend({ type: 'error', message: 'No council members assigned.' }, userId);
        return;
      }

      // Get user persona
      const activePersona = await spindle.personas.getActive(userId);
      const personaName = activePersona ? activePersona.name : 'The User';

      // Format council info
      const councilContext = councilMembers.map(m => `- ${m.name}: ${m.role}. Personality: ${m.personality}`).join('\\n');

      // Construct Prompt
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
        { role: 'system' as const, content: systemPrompt },
        ...chatroomHistory.slice(-20) // Provide the last 20 messages of chatroom context
      ];

      const connId = await spindle.variables.global.get('chatroom_connection_id', userId);

      const result = await spindle.generate.quiet({
        messages: promptMessages,
        ...(connId ? { connection_id: connId } : {})
      });

      const text = result.content;
      
      // Store the generated response in history so they have continuity
      chatroomHistory.push({ role: 'assistant', content: text });
      
      const chunks = text.split('---');

      for (const chunk of chunks) {
        if (!chunk.trim()) continue;

        // Parse "Name (Username): message" or fallback to "Name: message"
        const match = chunk.trim().match(/^([^:(]+)(?:\\s*\\(([^)]+)\\))?:\\s*(.*)$/s);
        
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

        spindle.sendToFrontend({
          type: 'new_message',
          name: speakerName,
          username: username || speakerName,
          content: content,
          avatarUrl: avatarUrl,
          isUser: false
        }, userId);
      }
    } catch (e: any) {
      spindle.sendToFrontend({ type: 'error', message: e.message || String(e) }, userId);
    }
  }
});
