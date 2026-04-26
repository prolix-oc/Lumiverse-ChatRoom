import type { SpindleFrontendContext } from 'lumiverse-spindle-types';

export function setup(ctx: SpindleFrontendContext) {
  // Create the floating widget
  const widget = ctx.ui.createFloatWidget({
    width: 320,
    height: 480,
    initialPosition: { x: window.innerWidth - 340, y: window.innerHeight - 500 },
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
  controls.style.background = 'var(--lumiverse-fill-subtle)';
  controls.style.display = 'flex';
  controls.style.flexDirection = 'column';
  controls.style.gap = '8px';
  
  const genButton = document.createElement('button');
  genButton.textContent = 'Generate Reply';
  genButton.style.width = '100%';
  genButton.style.padding = '8px';
  genButton.style.borderRadius = 'var(--lumiverse-radius)';
  genButton.style.background = 'var(--lumiverse-primary)';
  genButton.style.color = 'white'; // Lumiverse primary standard is white text usually or derived contrast.
  genButton.style.border = 'none';
  genButton.style.fontSize = '12px';
  genButton.style.fontWeight = '500';
  genButton.style.cursor = 'pointer';
  genButton.style.transition = 'opacity 0.2s';
  genButton.addEventListener('mouseenter', () => genButton.style.opacity = '0.9');
  genButton.addEventListener('mouseleave', () => genButton.style.opacity = '1');
  genButton.addEventListener('click', () => {
    ctx.sendToBackend({ type: 'trigger_generation' });
  });

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

  controls.appendChild(genButton);
  controls.appendChild(autoToggleLabel);
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
  function appendMessage(name: string, username: string, content: string, avatarUrl: string | null) {
    const msgEl = document.createElement('div');
    msgEl.style.display = 'flex';
    msgEl.style.gap = '10px';
    msgEl.style.alignItems = 'flex-start';

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
      placeholder.style.background = 'var(--lumiverse-fill-hover)';
      placeholder.style.flexShrink = '0';
      msgEl.appendChild(placeholder);
    }

    const contentDiv = document.createElement('div');
    contentDiv.style.flex = '1';
    contentDiv.style.minWidth = '0';

    const nameDiv = document.createElement('div');
    nameDiv.style.fontSize = '12px';
    nameDiv.style.display = 'flex';
    nameDiv.style.gap = '6px';
    nameDiv.style.alignItems = 'baseline';
    nameDiv.style.lineHeight = '1.2';
    nameDiv.style.marginBottom = '4px';

    const displayUsername = document.createElement('span');
    displayUsername.style.fontWeight = '600';
    displayUsername.style.color = 'var(--lumiverse-text)';
    displayUsername.textContent = username;

    const realName = document.createElement('span');
    realName.style.fontSize = '10.5px';
    realName.style.color = 'var(--lumiverse-text-dim)';
    realName.textContent = name;

    nameDiv.appendChild(displayUsername);
    if (name.toLowerCase() !== username.toLowerCase()) {
      nameDiv.appendChild(realName);
    }

    contentDiv.appendChild(nameDiv);

    const textDiv = document.createElement('div');
    textDiv.style.fontSize = '13px';
    textDiv.style.lineHeight = '1.4';
    textDiv.style.color = 'var(--lumiverse-text)';
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
      appendMessage(payload.name, payload.username || payload.name, payload.content, payload.avatarUrl);
    } else if (payload.type === 'error') {
      appendMessage('System', 'System', `Error: ${payload.message}`, null);
    }
  });
}
