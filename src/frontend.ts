import type { SpindleFrontendContext } from 'lumiverse-spindle-types';

export function setup(ctx: SpindleFrontendContext) {
  // --- 1. Settings Drawer Tab ---
  const tab = ctx.ui.registerDrawerTab({
    id: 'chatroom_settings',
    title: 'Council Chatroom',
    shortName: 'Chatroom',
    description: 'Configure the Council Chatroom overlay',
    iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`
  });

  const settingsContainer = document.createElement('div');
  settingsContainer.style.padding = '16px';
  settingsContainer.style.color = 'var(--lumiverse-text)';
  
  const titleEl = document.createElement('h3');
  titleEl.textContent = 'Council Chatroom Overlay';
  titleEl.style.marginTop = '0';
  titleEl.style.marginBottom = '16px';
  titleEl.style.fontSize = '16px';
  settingsContainer.appendChild(titleEl);

  const descEl = document.createElement('p');
  descEl.textContent = 'The Council Chatroom overlay appears automatically. You can toggle the floating widget visibility here or use the controls below.';
  descEl.style.fontSize = '13px';
  descEl.style.color = 'var(--lumiverse-text-muted)';
  descEl.style.marginBottom = '24px';
  descEl.style.lineHeight = '1.4';
  settingsContainer.appendChild(descEl);

  const toggleBtn = document.createElement('button');
  toggleBtn.textContent = 'Toggle Overlay Visibility';
  toggleBtn.style.padding = '8px 12px';
  toggleBtn.style.background = 'var(--lumiverse-fill-subtle)';
  toggleBtn.style.color = 'var(--lumiverse-text)';
  toggleBtn.style.border = '1px solid var(--lumiverse-border)';
  toggleBtn.style.borderRadius = 'var(--lumiverse-radius)';
  toggleBtn.style.cursor = 'pointer';
  toggleBtn.style.fontSize = '13px';
  toggleBtn.addEventListener('click', () => {
    widget.setVisible(!widget.isVisible());
  });
  settingsContainer.appendChild(toggleBtn);

  tab.root.appendChild(settingsContainer);


  // --- 2. Float Widget UI ---
  const widget = ctx.ui.createFloatWidget({
    width: 340,
    height: 480,
    initialPosition: { x: window.innerWidth - 360, y: window.innerHeight - 500 },
    snapToEdge: true,
    tooltip: 'Council Chatroom',
    chromeless: false
  });

  // Basic styling for the widget contents
  widget.root.style.display = 'flex';
  widget.root.style.flexDirection = 'column';
  widget.root.style.height = '100%';
  widget.root.style.background = 'var(--lumiverse-bg)';
  widget.root.style.color = 'var(--lumiverse-text)';
  widget.root.style.overflow = 'hidden';

  const header = document.createElement('div');
  header.style.padding = '10px 14px';
  header.style.background = 'var(--lumiverse-fill-subtle)';
  header.style.borderBottom = '1px solid var(--lumiverse-border)';
  header.style.fontWeight = '600';
  header.style.fontSize = '13px';
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.gap = '8px';

  const headerIcon = document.createElement('div');
  headerIcon.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
  headerIcon.style.display = 'flex';
  headerIcon.style.color = 'var(--lumiverse-primary)';
  
  const headerText = document.createElement('span');
  headerText.textContent = 'Council Chatroom';
  headerText.style.color = 'var(--lumiverse-text)';
  
  header.appendChild(headerIcon);
  header.appendChild(headerText);
  widget.root.appendChild(header);

  const messageList = document.createElement('div');
  messageList.style.flex = '1';
  messageList.style.overflowY = 'auto';
  messageList.style.padding = '12px';
  messageList.style.display = 'flex';
  messageList.style.flexDirection = 'column';
  messageList.style.gap = '14px';
  widget.root.appendChild(messageList);

  const controls = document.createElement('div');
  controls.style.padding = '10px 12px';
  controls.style.borderTop = '1px solid var(--lumiverse-border)';
  controls.style.background = 'var(--lumiverse-bg)';
  controls.style.display = 'flex';
  controls.style.flexDirection = 'column';
  controls.style.gap = '8px';

  // Chat Input Row
  const inputRow = document.createElement('div');
  inputRow.style.display = 'flex';
  inputRow.style.gap = '8px';

  const inputField = document.createElement('input');
  inputField.type = 'text';
  inputField.placeholder = 'Type a message...';
  inputField.style.flex = '1';
  inputField.style.padding = '8px 12px';
  inputField.style.border = '1px solid var(--lumiverse-border)';
  inputField.style.borderRadius = '16px';
  inputField.style.background = 'var(--lumiverse-fill-subtle)';
  inputField.style.color = 'var(--lumiverse-text)';
  inputField.style.fontSize = '13px';
  inputField.style.outline = 'none';

  const sendButton = document.createElement('button');
  sendButton.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
  sendButton.style.display = 'flex';
  sendButton.style.alignItems = 'center';
  sendButton.style.justifyContent = 'center';
  sendButton.style.width = '32px';
  sendButton.style.height = '32px';
  sendButton.style.borderRadius = '50%';
  sendButton.style.background = 'var(--lumiverse-primary)';
  sendButton.style.color = 'white';
  sendButton.style.border = 'none';
  sendButton.style.cursor = 'pointer';
  sendButton.style.flexShrink = '0';
  sendButton.style.transition = 'opacity 0.2s';
  sendButton.addEventListener('mouseenter', () => sendButton.style.opacity = '0.9');
  sendButton.addEventListener('mouseleave', () => sendButton.style.opacity = '1');
  
  const sendMessage = () => {
    const text = inputField.value.trim();
    if (!text) return;
    inputField.value = '';
    ctx.sendToBackend({ type: 'user_message', content: text });
  };
  
  sendButton.addEventListener('click', sendMessage);
  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  inputRow.appendChild(inputField);
  inputRow.appendChild(sendButton);
  controls.appendChild(inputRow);

  // Tools row
  const toolsRow = document.createElement('div');
  toolsRow.style.display = 'flex';
  toolsRow.style.justifyContent = 'space-between';
  toolsRow.style.alignItems = 'center';
  toolsRow.style.marginTop = '4px';

  const autoToggleLabel = document.createElement('label');
  autoToggleLabel.style.display = 'flex';
  autoToggleLabel.style.gap = '6px';
  autoToggleLabel.style.fontSize = '12px';
  autoToggleLabel.style.color = 'var(--lumiverse-text-dim)';
  autoToggleLabel.style.alignItems = 'center';
  autoToggleLabel.style.cursor = 'pointer';
  autoToggleLabel.style.userSelect = 'none';
  const autoToggle = document.createElement('input');
  autoToggle.type = 'checkbox';
  autoToggleLabel.appendChild(autoToggle);
  autoToggleLabel.appendChild(document.createTextNode('Auto-reply interval'));

  const genButton = document.createElement('button');
  genButton.textContent = 'Generate';
  genButton.style.padding = '4px 10px';
  genButton.style.borderRadius = 'var(--lumiverse-radius)';
  genButton.style.background = 'var(--lumiverse-fill-subtle)';
  genButton.style.color = 'var(--lumiverse-text)';
  genButton.style.border = '1px solid var(--lumiverse-border)';
  genButton.style.fontSize = '11px';
  genButton.style.fontWeight = '500';
  genButton.style.cursor = 'pointer';
  genButton.style.transition = 'background 0.2s';
  genButton.addEventListener('mouseenter', () => genButton.style.background = 'var(--lumiverse-fill-hover)');
  genButton.addEventListener('mouseleave', () => genButton.style.background = 'var(--lumiverse-fill-subtle)');
  genButton.addEventListener('click', () => {
    ctx.sendToBackend({ type: 'trigger_generation' });
  });

  toolsRow.appendChild(autoToggleLabel);
  toolsRow.appendChild(genButton);
  controls.appendChild(toolsRow);

  widget.root.appendChild(controls);

  let autoTimer: any = null;
  autoToggle.addEventListener('change', (e) => {
    if (autoToggle.checked) {
      // Setup random interval 5-15s
      const scheduleNext = () => {
        const nextMs = 5000 + Math.random() * 10000;
        autoTimer = setTimeout(() => {
          ctx.sendToBackend({ type: 'trigger_generation' });
          scheduleNext();
        }, nextMs);
      };
      scheduleNext();
    } else {
      if (autoTimer) clearTimeout(autoTimer);
    }
  });

  // Function to append a message
  function appendMessage(name: string, username: string, content: string, avatarUrl: string | null, isUser: boolean = false) {
    const msgEl = document.createElement('div');
    msgEl.style.display = 'flex';
    msgEl.style.gap = '10px';
    msgEl.style.alignItems = 'flex-start';
    
    // Distinct styling for user messages
    if (isUser) {
      msgEl.style.flexDirection = 'row-reverse';
    }

    if (avatarUrl) {
      const img = document.createElement('img');
      img.src = avatarUrl;
      img.style.width = '30px';
      img.style.height = '30px';
      img.style.borderRadius = 'var(--lumiverse-radius, 6px)';
      img.style.objectFit = 'cover';
      img.style.flexShrink = '0';
      msgEl.appendChild(img);
    } else {
      const placeholder = document.createElement('div');
      placeholder.style.width = '30px';
      placeholder.style.height = '30px';
      placeholder.style.borderRadius = 'var(--lumiverse-radius, 6px)';
      placeholder.style.background = isUser ? 'var(--lumiverse-primary)' : 'var(--lumiverse-fill-hover)';
      placeholder.style.display = 'flex';
      placeholder.style.alignItems = 'center';
      placeholder.style.justifyContent = 'center';
      placeholder.style.flexShrink = '0';
      
      if (isUser) {
        placeholder.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
      }
      
      msgEl.appendChild(placeholder);
    }

    const contentDiv = document.createElement('div');
    contentDiv.style.flex = '1';
    contentDiv.style.minWidth = '0';
    contentDiv.style.display = 'flex';
    contentDiv.style.flexDirection = 'column';
    if (isUser) {
      contentDiv.style.alignItems = 'flex-end';
    }

    const nameDiv = document.createElement('div');
    nameDiv.style.fontSize = '12px';
    nameDiv.style.display = 'flex';
    nameDiv.style.gap = '6px';
    nameDiv.style.alignItems = 'baseline';
    nameDiv.style.lineHeight = '1.2';
    nameDiv.style.marginBottom = '4px';

    const displayUsername = document.createElement('span');
    displayUsername.style.fontWeight = '600';
    displayUsername.style.color = isUser ? 'var(--lumiverse-text)' : 'var(--lumiverse-accent)';
    displayUsername.textContent = username;

    const realName = document.createElement('span');
    realName.style.fontSize = '10.5px';
    realName.style.color = 'var(--lumiverse-text-dim)';
    realName.textContent = isUser ? '' : name;

    nameDiv.appendChild(displayUsername);
    if (!isUser && name.toLowerCase() !== username.toLowerCase()) {
      nameDiv.appendChild(realName);
    }

    contentDiv.appendChild(nameDiv);

    const textDiv = document.createElement('div');
    textDiv.style.fontSize = '13px';
    textDiv.style.lineHeight = '1.4';
    textDiv.style.color = isUser ? 'white' : 'var(--lumiverse-text)';
    textDiv.style.background = isUser ? 'var(--lumiverse-primary)' : 'transparent';
    if (isUser) {
      textDiv.style.padding = '8px 12px';
      textDiv.style.borderRadius = '16px';
      textDiv.style.borderTopRightRadius = '4px';
    }
    textDiv.style.wordBreak = 'break-word';
    textDiv.textContent = content;
    contentDiv.appendChild(textDiv);

    msgEl.appendChild(contentDiv);
    messageList.appendChild(msgEl);

    // Auto-scroll
    messageList.scrollTo({ top: messageList.scrollHeight, behavior: 'smooth' });
  }

  ctx.onBackendMessage((payload: any) => {
    if (payload.type === 'new_message') {
      appendMessage(payload.name, payload.username || payload.name, payload.content, payload.avatarUrl, payload.isUser);
    } else if (payload.type === 'error') {
      appendMessage('System', 'System', `Error: ${payload.message}`, null);
    }
  });
}
