import type { SpindleFrontendContext } from 'lumiverse-spindle-types';

export function setup(ctx: SpindleFrontendContext) {
  // ── 1. Settings Drawer Tab ──
  const tab = ctx.ui.registerDrawerTab({
    id: 'chatroom_settings',
    title: 'Council Chatroom',
    shortName: 'Chatroom',
    description: 'Configure the Council Chatroom overlay',
    iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`
  });

  function makeInteractive(el: HTMLElement) {
    const stop = (e: Event) => e.stopPropagation();
    el.addEventListener('mousedown', stop, false);
    el.addEventListener('touchstart', stop, { passive: true, capture: false });
    el.addEventListener('pointerdown', stop, false);
    el.addEventListener('click', stop, false);
    el.addEventListener('keydown', stop, false);
  }

  const settingsContainer = document.createElement('div');
  settingsContainer.style.cssText = `
    padding: 20px;
    color: var(--lumiverse-text);
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 520px;
    font-family: var(--lumiverse-font-family, system-ui, -apple-system, sans-serif);
  `;

  // ── Header Section ──
  const headerSection = document.createElement('div');
  headerSection.style.cssText = `
    display: flex; flex-direction: column; gap: 4px;
  `;

  const titleEl = document.createElement('h3');
  titleEl.textContent = 'Council Chatroom Overlay';
  titleEl.style.cssText = `
    margin: 0; font-size: 18px; font-weight: 700;
    color: var(--lumiverse-text); letter-spacing: -0.01em;
  `;

  const descEl = document.createElement('p');
  descEl.textContent = 'Configure how your council members react to the story. Toggle the floating widget below or use the controls in the chatroom itself.';
  descEl.style.cssText = `
    margin: 0; font-size: 13px; color: var(--lumiverse-text-muted);
    line-height: 1.5;
  `;

  headerSection.appendChild(titleEl);
  headerSection.appendChild(descEl);
  settingsContainer.appendChild(headerSection);

  // ── Toggle Overlay Card ──
  const toggleCard = document.createElement('div');
  toggleCard.style.cssText = `
    background: var(--lumiverse-fill-subtle);
    border: 1px solid var(--lumiverse-border);
    border-radius: var(--lumiverse-radius, 10px);
    padding: 16px;
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
  `;

  const toggleInfo = document.createElement('div');
  toggleInfo.style.cssText = 'display: flex; flex-direction: column; gap: 2px;';
  const toggleLabel = document.createElement('span');
  toggleLabel.textContent = 'Floating Widget';
  toggleLabel.style.cssText = 'font-size: 14px; font-weight: 600; color: var(--lumiverse-text);';
  const toggleHint = document.createElement('span');
  toggleHint.textContent = 'Show or hide the chatroom overlay';
  toggleHint.style.cssText = 'font-size: 12px; color: var(--lumiverse-text-muted);';
  toggleInfo.appendChild(toggleLabel);
  toggleInfo.appendChild(toggleHint);

  const toggleBtn = document.createElement('button');
  makeInteractive(toggleBtn);
  toggleBtn.textContent = 'Toggle Visibility';
  toggleBtn.style.cssText = `
    padding: 8px 14px;
    background: var(--lumiverse-fill);
    color: var(--lumiverse-text);
    border: 1px solid var(--lumiverse-border);
    border-radius: var(--lumiverse-radius, 8px);
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: background .15s, border-color .15s;
    flex-shrink: 0;
  `;
  toggleBtn.addEventListener('mouseenter', () => {
    toggleBtn.style.background = 'var(--lumiverse-fill-hover)';
    toggleBtn.style.borderColor = 'var(--lumiverse-border-hover)';
  });
  toggleBtn.addEventListener('mouseleave', () => {
    toggleBtn.style.background = 'var(--lumiverse-fill)';
    toggleBtn.style.borderColor = 'var(--lumiverse-border)';
  });
  toggleBtn.addEventListener('click', () => {
    widget.setVisible(!widget.isVisible());
  });

  toggleCard.appendChild(toggleInfo);
  toggleCard.appendChild(toggleBtn);
  settingsContainer.appendChild(toggleCard);

  // ── Configuration Card ──
  const configCard = document.createElement('div');
  configCard.style.cssText = `
    background: var(--lumiverse-bg-elevated, var(--lumiverse-fill-subtle));
    border: 1px solid var(--lumiverse-border);
    border-radius: var(--lumiverse-radius, 10px);
    padding: 20px;
    display: flex; flex-direction: column; gap: 16px;
  `;

  const configHeader = document.createElement('div');
  configHeader.style.cssText = `
    display: flex; align-items: center; gap: 8px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--lumiverse-border);
  `;
  const configHeaderIcon = document.createElement('span');
  configHeaderIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.67 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
  configHeaderIcon.style.cssText = 'color: var(--lumiverse-primary); display: flex; flex-shrink: 0;';
  const configTitle = document.createElement('h4');
  configTitle.textContent = 'Chatroom Configuration';
  configTitle.style.cssText = 'margin: 0; font-size: 15px; font-weight: 700; color: var(--lumiverse-text);';
  configHeader.appendChild(configHeaderIcon);
  configHeader.appendChild(configTitle);
  configCard.appendChild(configHeader);

  // Helper for labeled input rows
  function createSettingRow(labelText: string, description: string, control: HTMLElement) {
    const row = document.createElement('div');
    row.style.cssText = 'display: flex; flex-direction: column; gap: 6px;';

    const labelWrap = document.createElement('div');
    labelWrap.style.cssText = 'display: flex; flex-direction: column; gap: 2px;';

    const label = document.createElement('label');
    label.textContent = labelText;
    label.style.cssText = 'font-size: 13px; font-weight: 600; color: var(--lumiverse-text);';

    const desc = document.createElement('span');
    desc.textContent = description;
    desc.style.cssText = 'font-size: 12px; color: var(--lumiverse-text-muted); line-height: 1.4;';

    labelWrap.appendChild(label);
    labelWrap.appendChild(desc);

    control.style.alignSelf = 'flex-start';
    row.appendChild(labelWrap);
    row.appendChild(control);
    return row;
  }

  // Helper for styled select
  function createStyledSelect(): HTMLSelectElement {
    const sel = document.createElement('select');
    makeInteractive(sel);
    sel.style.cssText = `
      padding: 8px 10px;
      border: 1px solid var(--lumiverse-border);
      border-radius: var(--lumiverse-radius, 8px);
      background: var(--lumiverse-fill);
      color: var(--lumiverse-text);
      font-size: 13px;
      outline: none;
      min-width: 240px;
      cursor: pointer;
      transition: border-color .15s, box-shadow .15s;
    `;
    sel.addEventListener('focus', () => {
      sel.style.borderColor = 'var(--lumiverse-primary)';
      sel.style.boxShadow = '0 0 0 3px var(--lumiverse-primary-010, rgba(139,92,246,0.15))';
    });
    sel.addEventListener('blur', () => {
      sel.style.borderColor = 'var(--lumiverse-border)';
      sel.style.boxShadow = 'none';
    });
    return sel;
  }

  // Helper for styled number input
  function createStyledNumberInput(min: string, max: string, value: string): HTMLInputElement {
    const inp = document.createElement('input');
    makeInteractive(inp);
    inp.type = 'number';
    inp.min = min;
    inp.max = max;
    inp.value = value;
    inp.style.cssText = `
      width: 80px;
      padding: 8px 10px;
      border: 1px solid var(--lumiverse-border);
      border-radius: var(--lumiverse-radius, 8px);
      background: var(--lumiverse-fill);
      color: var(--lumiverse-text);
      font-size: 13px;
      outline: none;
      transition: border-color .15s, box-shadow .15s;
    `;
    inp.addEventListener('focus', () => {
      inp.style.borderColor = 'var(--lumiverse-primary)';
      inp.style.boxShadow = '0 0 0 3px var(--lumiverse-primary-010, rgba(139,92,246,0.15))';
    });
    inp.addEventListener('blur', () => {
      inp.style.borderColor = 'var(--lumiverse-border)';
      inp.style.boxShadow = 'none';
    });
    return inp;
  }

  // Connection Profile
  const connectionSelect = createStyledSelect();
  connectionSelect.innerHTML = '<option value="">Default Active Connection</option>';
  configCard.appendChild(createSettingRow(
    'Generation Connection Profile',
    'The LLM connection used to generate council messages.',
    connectionSelect
  ));

  // Trigger Mode
  const triggerModeSelect = createStyledSelect();
  triggerModeSelect.innerHTML = `
    <option value="time">Time-based (seconds)</option>
    <option value="messages">Message-based (chat messages)</option>
  `;
  configCard.appendChild(createSettingRow(
    'Auto-Reply Trigger',
    'Choose whether council auto-replies are triggered by elapsed time or by the number of story chat messages sent.',
    triggerModeSelect
  ));

  // Time-based settings group
  const timeSettingsGroup = document.createElement('div');
  timeSettingsGroup.style.cssText = 'display: flex; flex-direction: column; gap: 16px;';

  // Time Between Messages
  const messageIntervalInput = createStyledNumberInput('1', '3600', '10');
  timeSettingsGroup.appendChild(createSettingRow(
    'Time Between Messages (seconds)',
    'How long to wait before generating the next council message.',
    messageIntervalInput
  ));

  // Random Interval Toggle
  const randomToggleRow = document.createElement('div');
  randomToggleRow.style.cssText = 'display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; padding: 4px 0;';
  const randomToggleCheckbox = document.createElement('input');
  randomToggleCheckbox.type = 'checkbox';
  randomToggleCheckbox.style.cssText = 'width: 18px; height: 18px; cursor: pointer; accent-color: var(--lumiverse-primary); flex-shrink: 0;';
  const randomToggleLabel = document.createElement('span');
  randomToggleLabel.textContent = 'Use Random Message Interval';
  randomToggleLabel.style.cssText = 'font-size: 13px; font-weight: 500; color: var(--lumiverse-text);';
  randomToggleRow.appendChild(randomToggleCheckbox);
  randomToggleRow.appendChild(randomToggleLabel);
  makeInteractive(randomToggleCheckbox);
  timeSettingsGroup.appendChild(createSettingRow(
    'Random Interval',
    'When enabled, the delay between messages varies randomly within the range below. When disabled, the fixed time above is used exactly.',
    randomToggleRow
  ));

  // Interval Range (min / max)
  const intervalRangeWrap = document.createElement('div');
  intervalRangeWrap.style.cssText = 'display: flex; gap: 12px; align-items: center;';

  const intervalMinInput = createStyledNumberInput('1', '60', '5');
  const intervalMaxInput = createStyledNumberInput('1', '120', '15');

  const minWrap = document.createElement('div');
  minWrap.style.cssText = 'display: flex; flex-direction: column; gap: 4px;';
  const minLabel = document.createElement('span');
  minLabel.textContent = 'Min (s)';
  minLabel.style.cssText = 'font-size: 11px; font-weight: 600; color: var(--lumiverse-text-muted); text-transform: uppercase; letter-spacing: 0.03em;';
  minWrap.appendChild(minLabel);
  minWrap.appendChild(intervalMinInput);

  const maxWrap = document.createElement('div');
  maxWrap.style.cssText = 'display: flex; flex-direction: column; gap: 4px;';
  const maxLabel = document.createElement('span');
  maxLabel.textContent = 'Max (s)';
  maxLabel.style.cssText = 'font-size: 11px; font-weight: 600; color: var(--lumiverse-text-muted); text-transform: uppercase; letter-spacing: 0.03em;';
  maxWrap.appendChild(maxLabel);
  maxWrap.appendChild(intervalMaxInput);

  const rangeArrow = document.createElement('span');
  rangeArrow.textContent = '→';
  rangeArrow.style.cssText = 'color: var(--lumiverse-text-muted); font-size: 13px; padding-top: 16px;';

  intervalRangeWrap.appendChild(minWrap);
  intervalRangeWrap.appendChild(rangeArrow);
  intervalRangeWrap.appendChild(maxWrap);

  const rangeRow = createSettingRow(
    'Random Interval Range',
    'Council messages will be spaced by a random duration between these two values.',
    intervalRangeWrap
  );
  timeSettingsGroup.appendChild(rangeRow);
  configCard.appendChild(timeSettingsGroup);

  // Message-based settings group
  const messagesSettingsGroup = document.createElement('div');
  messagesSettingsGroup.style.cssText = 'display: none; flex-direction: column; gap: 16px;';

  // Messages Between Responses
  const messageCountInput = createStyledNumberInput('1', '100', '5');
  messagesSettingsGroup.appendChild(createSettingRow(
    'Messages Between Responses',
    'How many story chat messages must be sent before the council auto-replies.',
    messageCountInput
  ));

  // Random Message Count Toggle
  const randomMessageCountRow = document.createElement('div');
  randomMessageCountRow.style.cssText = 'display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; padding: 4px 0;';
  const randomMessageCountCheckbox = document.createElement('input');
  randomMessageCountCheckbox.type = 'checkbox';
  randomMessageCountCheckbox.style.cssText = 'width: 18px; height: 18px; cursor: pointer; accent-color: var(--lumiverse-primary); flex-shrink: 0;';
  const randomMessageCountLabel = document.createElement('span');
  randomMessageCountLabel.textContent = 'Use Random Message Count';
  randomMessageCountLabel.style.cssText = 'font-size: 13px; font-weight: 500; color: var(--lumiverse-text);';
  randomMessageCountRow.appendChild(randomMessageCountCheckbox);
  randomMessageCountRow.appendChild(randomMessageCountLabel);
  makeInteractive(randomMessageCountCheckbox);
  messagesSettingsGroup.appendChild(createSettingRow(
    'Random Message Count',
    'When enabled, the number of messages required varies randomly within the range below. When disabled, the fixed count above is used exactly.',
    randomMessageCountRow
  ));

  // Message Count Range (min / max)
  const messageCountRangeWrap = document.createElement('div');
  messageCountRangeWrap.style.cssText = 'display: flex; gap: 12px; align-items: center;';

  const messageCountMinInput = createStyledNumberInput('1', '100', '3');
  const messageCountMaxInput = createStyledNumberInput('1', '100', '7');

  const msgMinWrap = document.createElement('div');
  msgMinWrap.style.cssText = 'display: flex; flex-direction: column; gap: 4px;';
  const msgMinLabel = document.createElement('span');
  msgMinLabel.textContent = 'Min';
  msgMinLabel.style.cssText = 'font-size: 11px; font-weight: 600; color: var(--lumiverse-text-muted); text-transform: uppercase; letter-spacing: 0.03em;';
  msgMinWrap.appendChild(msgMinLabel);
  msgMinWrap.appendChild(messageCountMinInput);

  const msgMaxWrap = document.createElement('div');
  msgMaxWrap.style.cssText = 'display: flex; flex-direction: column; gap: 4px;';
  const msgMaxLabel = document.createElement('span');
  msgMaxLabel.textContent = 'Max';
  msgMaxLabel.style.cssText = 'font-size: 11px; font-weight: 600; color: var(--lumiverse-text-muted); text-transform: uppercase; letter-spacing: 0.03em;';
  msgMaxWrap.appendChild(msgMaxLabel);
  msgMaxWrap.appendChild(messageCountMaxInput);

  const msgRangeArrow = document.createElement('span');
  msgRangeArrow.textContent = '→';
  msgRangeArrow.style.cssText = 'color: var(--lumiverse-text-muted); font-size: 13px; padding-top: 16px;';

  messageCountRangeWrap.appendChild(msgMinWrap);
  messageCountRangeWrap.appendChild(msgRangeArrow);
  messageCountRangeWrap.appendChild(msgMaxWrap);

  const messageCountRangeRow = createSettingRow(
    'Random Message Count Range',
    'Council will auto-reply after a random number of story messages between these two values.',
    messageCountRangeWrap
  );
  messagesSettingsGroup.appendChild(messageCountRangeRow);
  configCard.appendChild(messagesSettingsGroup);

  // Show/hide time range row based on toggle
  function updateTimeRangeVisibility() {
    rangeRow.style.display = randomToggleCheckbox.checked ? 'flex' : 'none';
    messageIntervalInput.disabled = randomToggleCheckbox.checked;
    messageIntervalInput.style.opacity = randomToggleCheckbox.checked ? '0.5' : '1';
  }
  randomToggleCheckbox.addEventListener('change', updateTimeRangeVisibility);

  // Show/hide message count range row based on toggle
  function updateMessageCountRangeVisibility() {
    messageCountRangeRow.style.display = randomMessageCountCheckbox.checked ? 'flex' : 'none';
    messageCountInput.disabled = randomMessageCountCheckbox.checked;
    messageCountInput.style.opacity = randomMessageCountCheckbox.checked ? '0.5' : '1';
  }
  randomMessageCountCheckbox.addEventListener('change', updateMessageCountRangeVisibility);

  // Show/hide settings groups based on trigger mode
  function updateTriggerMode() {
    const isTime = triggerModeSelect.value === 'time';
    timeSettingsGroup.style.display = isTime ? 'flex' : 'none';
    messagesSettingsGroup.style.display = isTime ? 'none' : 'flex';
  }
  triggerModeSelect.addEventListener('change', updateTriggerMode);

  // Context Retrieval
  const contextInput = createStyledNumberInput('1', '50', '10');
  configCard.appendChild(createSettingRow(
    'Context Retrieval (messages)',
    'How many recent story messages the council can see before reacting.',
    contextInput
  ));

  // Max Context Tokens
  const maxContextTokensInput = createStyledNumberInput('512', '32768', '4096');
  configCard.appendChild(createSettingRow(
    'Max Context Tokens',
    'Maximum tokens the council chatroom history can consume. Older messages are removed automatically when this limit is exceeded.',
    maxContextTokensInput
  ));

  // Save Button
  const saveBtnWrap = document.createElement('div');
  saveBtnWrap.style.cssText = 'display: flex; gap: 10px; padding-top: 4px;';

  const saveBtn = document.createElement('button');
  makeInteractive(saveBtn);
  saveBtn.textContent = 'Save Configuration';
  saveBtn.style.cssText = `
    padding: 10px 18px;
    background: var(--lumiverse-primary);
    color: white;
    border: none;
    border-radius: var(--lumiverse-radius, 8px);
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    transition: filter .15s, transform .1s;
  `;
  saveBtn.addEventListener('mouseenter', () => saveBtn.style.filter = 'brightness(1.1)');
  saveBtn.addEventListener('mouseleave', () => saveBtn.style.filter = 'none');
  saveBtn.addEventListener('mousedown', () => saveBtn.style.transform = 'scale(0.97)');
  saveBtn.addEventListener('mouseup', () => saveBtn.style.transform = 'none');
  saveBtn.addEventListener('click', () => {
    ctx.sendToBackend({
      type: 'save_settings',
      triggerMode: triggerModeSelect.value,
      messageInterval: parseInt(messageIntervalInput.value, 10),
      randomIntervalEnabled: randomToggleCheckbox.checked,
      intervalMin: parseInt(intervalMinInput.value, 10),
      intervalMax: parseInt(intervalMaxInput.value, 10),
      messageCount: parseInt(messageCountInput.value, 10),
      randomMessageCountEnabled: randomMessageCountCheckbox.checked,
      messageCountMin: parseInt(messageCountMinInput.value, 10),
      messageCountMax: parseInt(messageCountMaxInput.value, 10),
      contextLimit: parseInt(contextInput.value, 10),
      maxContextTokens: parseInt(maxContextTokensInput.value, 10),
      connectionId: connectionSelect.value
    });
  });

  saveBtnWrap.appendChild(saveBtn);
  configCard.appendChild(saveBtnWrap);

  settingsContainer.appendChild(configCard);
  tab.root.appendChild(settingsContainer);

  // ── 2. Float Widget UI ──
  const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;

  const widget = ctx.ui.createFloatWidget({
    width: isMobile ? Math.min(380, window.innerWidth - 16) : 440,
    height: isMobile ? Math.min(540, window.innerHeight - 80) : 620,
    initialPosition: {
      x: isMobile ? 8 : window.innerWidth - 480,
      y: isMobile ? 40 : window.innerHeight - 660
    },
    snapToEdge: true,
    tooltip: 'Council Chatroom',
    chromeless: true
  });

  // Start hidden until a chat is active
  widget.setVisible(false);

  ctx.dom.addStyle(`
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes msgIn { from { opacity:0; transform: translateY(6px) scale(.98); } to { opacity:1; transform: none; } }
    .chatroom-scroll::-webkit-scrollbar { width: 5px; }
    .chatroom-scroll::-webkit-scrollbar-track { background: transparent; }
    .chatroom-scroll::-webkit-scrollbar-thumb { background: var(--lumiverse-border); border-radius: 3px; }
    .chatroom-msg { animation: msgIn .2s ease-out; }
  `);

  let autoTimer: any = null;
  let triggerMode = 'time';
  let messageInterval = 10;
  let randomIntervalEnabled = true;
  let intervalMin = 5;
  let intervalMax = 15;
  let messageCount = 5;
  let randomMessageCountEnabled = true;
  let messageCountMin = 3;
  let messageCountMax = 7;
  let isGenerating = false;

  function startAutoTimer() {
    if (autoTimer) clearTimeout(autoTimer);
    const scheduleNext = () => {
      let ms: number;
      if (randomIntervalEnabled) {
        ms = intervalMin * 1000 + Math.random() * ((intervalMax - intervalMin) * 1000);
      } else {
        ms = messageInterval * 1000;
      }
      autoTimer = setTimeout(() => {
        if (!isGenerating) ctx.sendToBackend({ type: 'trigger_generation' });
        scheduleNext();
      }, ms);
    };
    scheduleNext();
  }

  function stopAutoTimer() {
    if (autoTimer) clearTimeout(autoTimer);
    autoTimer = null;
  }
  let isCollapsed = false;
  let isFullscreen = false;
  let preFullscreenState: { w: number; h: number; x: number; y: number } | null = null;
  let expandedHeight = 620;
  let unreadCount = 0;
  let lastSenderId: string | null = null;
  let userPersona: { name: string; avatarUrl: string | null } | null = null;

  function hashHue(str: string) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
    return Math.abs(h) % 360;
  }
  function memberColor(name: string) {
    const hue = hashHue(name);
    return `hsl(${hue}, 70%, 60%)`;
  }

  // The host's widget container is the outer positioned wrapper around widget.root.
  // With chromeless: true it's typically widget.root's immediate parent.
  const shell = (widget.root.parentElement as HTMLElement) || widget.root;

  // Find the actual outermost host wrapper (the one the host positions/moves)
  function getHostWrapper(): HTMLElement {
    let el: HTMLElement = shell;
    while (el.parentElement && el.parentElement !== document.body) {
      el = el.parentElement;
    }
    return el;
  }
  const hostWrapper = getHostWrapper();

  // Apply our chrome to the host wrapper, and make widget.root fill it.
  widget.root.style.cssText = `
    width:100%;height:100%;
    display:flex;flex-direction:column;
    overflow:hidden;
  `;

  shell.style.cssText = `
    display:flex;flex-direction:column;
    width:100%;height:100%;
    background:var(--lumiverse-bg);
    color:var(--lumiverse-text);
    border-radius:20px;
    box-shadow:0 20px 60px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05);
    border:1px solid var(--lumiverse-border);
    overflow:hidden;
    font-family:var(--lumiverse-font-family, system-ui, -apple-system, sans-serif);
    position:relative;
  `;

  // ── Header ──
  const header = document.createElement('div');
  header.style.cssText = `
    padding:14px 18px;
    background:linear-gradient(180deg, var(--lumiverse-fill-subtle) 0%, var(--lumiverse-fill) 100%);
    border-bottom:1px solid var(--lumiverse-border);
    display:flex;align-items:center;gap:12px;
    flex-shrink:0;cursor:grab;user-select:none;
    position:relative;
  `;

  const headerLeft = document.createElement('div');
  headerLeft.style.cssText = 'display:flex;align-items:center;gap:10px;flex:1;min-width:0;';

  const headerIcon = document.createElement('div');
  headerIcon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
  headerIcon.style.cssText = 'display:flex;color:var(--lumiverse-primary);flex-shrink:0;';

  const headerTextWrap = document.createElement('div');
  headerTextWrap.style.cssText = 'display:flex;flex-direction:column;gap:1px;min-width:0;';

  const headerTitle = document.createElement('span');
  headerTitle.textContent = 'Council Chatroom';
  headerTitle.style.cssText = 'font-weight:700;font-size:14px;color:var(--lumiverse-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';

  const headerSubtitle = document.createElement('span');
  headerSubtitle.textContent = 'Watching the story unfold…';
  headerSubtitle.style.cssText = 'font-size:11px;color:var(--lumiverse-text-dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';

  headerTextWrap.appendChild(headerTitle);
  headerTextWrap.appendChild(headerSubtitle);

  const badge = document.createElement('span');
  badge.style.cssText = `
    display:none;background:var(--lumiverse-primary);color:white;
    font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;
    min-width:16px;text-align:center;flex-shrink:0;margin-left:4px;
  `;

  headerLeft.appendChild(headerIcon);
  headerLeft.appendChild(headerTextWrap);
  headerLeft.appendChild(badge);

  const headerActions = document.createElement('div');
  headerActions.style.cssText = 'display:flex;align-items:center;gap:2px;flex-shrink:0;';

  function iconBtn(html: string, title: string) {
    const b = document.createElement('button');
    b.innerHTML = html;
    b.title = title;
    b.style.cssText = `
      display:flex;align-items:center;justify-content:center;
      width:28px;height:28px;border-radius:var(--lumiverse-radius,6px);
      background:transparent;border:none;color:var(--lumiverse-text-muted);
      cursor:pointer;transition:all .15s;
    `;
    b.addEventListener('mouseenter', () => { b.style.background = 'var(--lumiverse-fill-hover)'; b.style.color = 'var(--lumiverse-text)'; });
    b.addEventListener('mouseleave', () => { b.style.background = 'transparent'; b.style.color = 'var(--lumiverse-text-muted)'; });
    b.addEventListener('click', (e) => e.stopPropagation());
    return b;
  }

  const fsBtn = iconBtn(
    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`,
    'Fullscreen'
  );
  const collapseBtn = iconBtn(
    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`,
    'Collapse'
  );
  const hideBtn = iconBtn(
    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    'Hide'
  );

  headerActions.appendChild(fsBtn);
  headerActions.appendChild(collapseBtn);
  headerActions.appendChild(hideBtn);
  header.appendChild(headerLeft);
  header.appendChild(headerActions);
  widget.root.appendChild(header);

  // Drag
  let isDragging = false;
  let dragStart = { x: 0, y: 0, wx: 0, wy: 0 };
  header.addEventListener('mousedown', (e) => {
    if ((e.target as HTMLElement).closest('button')) return;
    isDragging = true;
    header.style.cursor = 'grabbing';
    const pos = widget.getPosition();
    dragStart = { x: e.clientX, y: e.clientY, wx: pos.x, wy: pos.y };
  });
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    widget.moveTo(dragStart.wx + (e.clientX - dragStart.x), dragStart.wy + (e.clientY - dragStart.y));
  });
  document.addEventListener('mouseup', () => { isDragging = false; header.style.cursor = 'grab'; });

  // ── Body ──
  const body = document.createElement('div');
  body.style.cssText = 'flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0;';

  const messageList = document.createElement('div');
  messageList.className = 'chatroom-scroll';
  messageList.style.cssText = `
    flex:1;overflow-y:auto;overflow-x:hidden;
    padding:16px;display:flex;flex-direction:column;gap:2px;min-height:0;
  `;

  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'chatroom-msg';
  loadingIndicator.style.cssText = `
    display:none;padding:10px 16px;align-items:center;gap:8px;
    font-size:12px;color:var(--lumiverse-text-dim);font-style:italic;
  `;
  loadingIndicator.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1.5s linear infinite;flex-shrink:0;">
      <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
      <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
    </svg>
    <span>Council is typing…</span>
  `;
  messageList.appendChild(loadingIndicator);
  body.appendChild(messageList);

  // ── Controls ──
  const controls = document.createElement('div');
  controls.style.cssText = `
    padding:12px 16px;border-top:1px solid var(--lumiverse-border);
    background:var(--lumiverse-bg);display:flex;flex-direction:column;gap:10px;flex-shrink:0;
  `;

  const inputRow = document.createElement('div');
  inputRow.style.cssText = 'display:flex;gap:10px;align-items:flex-end;';

  const inputField = document.createElement('textarea');
  makeInteractive(inputField);
  inputField.placeholder = 'Type a message…';
  inputField.rows = 1;
  inputField.style.cssText = `
    flex:1;padding:10px 14px;border:1px solid var(--lumiverse-border);
    border-radius:18px;background:var(--lumiverse-fill-subtle);color:var(--lumiverse-text);
    font-size:${isMobile ? '16px' : '14px'};outline:none;min-width:0;resize:none;
    font-family:inherit;line-height:1.4;max-height:100px;overflow-y:auto;
  `;

  const sendButton = document.createElement('button');
  makeInteractive(sendButton);
  sendButton.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
  sendButton.style.cssText = `
    display:flex;align-items:center;justify-content:center;
    width:40px;height:40px;border-radius:50%;background:var(--lumiverse-primary);
    color:white;border:none;cursor:pointer;flex-shrink:0;
    transition:opacity .2s,transform .1s;
  `;
  sendButton.addEventListener('mouseenter', () => sendButton.style.opacity = '0.85');
  sendButton.addEventListener('mouseleave', () => sendButton.style.opacity = '1');

  inputRow.appendChild(inputField);
  inputRow.appendChild(sendButton);
  controls.appendChild(inputRow);

  const toolsRow = document.createElement('div');
  toolsRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;';

  const autoToggleLabel = document.createElement('label');
  autoToggleLabel.style.cssText = 'display:flex;gap:8px;font-size:13px;color:var(--lumiverse-text-dim);align-items:center;cursor:pointer;user-select:none;';
  const autoToggle = document.createElement('input');
  autoToggle.type = 'checkbox';
  autoToggle.style.cssText = 'width:16px;height:16px;cursor:pointer;accent-color:var(--lumiverse-primary);';
  autoToggleLabel.appendChild(autoToggle);
  autoToggleLabel.appendChild(document.createTextNode('Auto-reply'));

  const genButton = document.createElement('button');
  makeInteractive(genButton);
  genButton.textContent = 'Generate';
  genButton.style.cssText = `
    padding:6px 14px;border-radius:var(--lumiverse-radius,6px);
    background:var(--lumiverse-fill-subtle);color:var(--lumiverse-text);
    border:1px solid var(--lumiverse-border);font-size:12px;font-weight:500;
    cursor:pointer;transition:all .15s;
  `;
  genButton.addEventListener('mouseenter', () => genButton.style.background = 'var(--lumiverse-fill-hover)');
  genButton.addEventListener('mouseleave', () => genButton.style.background = 'var(--lumiverse-fill-subtle)');

  toolsRow.appendChild(autoToggleLabel);
  toolsRow.appendChild(genButton);
  controls.appendChild(toolsRow);
  body.appendChild(controls);
  widget.root.appendChild(body);

  // ── Resize handle ──
  const resizeHandle = document.createElement('div');
  resizeHandle.className = 'chatroom-resize';
  resizeHandle.style.cssText = `
    position:absolute;right:0;bottom:0;width:20px;height:20px;
    cursor:nwse-resize;z-index:10;
    display:${isMobile ? 'none' : 'flex'};
    align-items:flex-end;justify-content:flex-end;
    padding:0 4px 4px 0;
    touch-action:none;
  `;
  resizeHandle.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:.3;"><polyline points="22 12 22 22 12 22"/></svg>`;
  widget.root.appendChild(resizeHandle);

  let isResizing = false;
  let resizeStart = { x: 0, y: 0, w: 0, h: 0 };
  let resizeAnchor = { x: 0, y: 0 };
  let rafId: number | null = null;

  const WIDGET_MIN_W = isMobile ? 260 : 320;
  const WIDGET_MIN_H = isMobile ? 120 : 180;
  const WIDGET_MAX_W = Math.min(900, window.innerWidth - (isMobile ? 8 : 32));
  const WIDGET_MAX_H = Math.min(1000, window.innerHeight - (isMobile ? 32 : 64));

  function startResize(clientX: number, clientY: number) {
    const pos = widget.getPosition();
    resizeAnchor = { x: pos.x, y: pos.y };
    resizeStart = { x: clientX, y: clientY, w: shell.offsetWidth, h: shell.offsetHeight };
    isResizing = true;
    document.body.style.cursor = 'nwse-resize';
  }

  function onResizePointerMove(e: PointerEvent) {
    if (!isResizing) return;
    const nw = Math.max(WIDGET_MIN_W, Math.min(WIDGET_MAX_W, resizeStart.w + (e.clientX - resizeStart.x)));
    const nh = Math.max(WIDGET_MIN_H, Math.min(WIDGET_MAX_H, resizeStart.h + (e.clientY - resizeStart.y)));
    shell.style.setProperty('width', nw + 'px', 'important');
    shell.style.setProperty('height', nh + 'px', 'important');
    if (isCollapsed) { isCollapsed = false; updateCollapse(); }
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      widget.moveTo(resizeAnchor.x, resizeAnchor.y);
      rafId = null;
    });
  }

  function onResizePointerUp(e: PointerEvent) {
    if (!isResizing) return;
    isResizing = false;
    document.body.style.cursor = '';
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    try { resizeHandle.releasePointerCapture(e.pointerId); } catch (_) {}
  }

  function onWindowPointerDown(e: PointerEvent) {
    const target = e.target as HTMLElement;
    if (!target?.closest?.('.chatroom-resize')) return;
    e.stopPropagation();
    startResize(e.clientX, e.clientY);
    resizeHandle.setPointerCapture(e.pointerId);
  }
  window.addEventListener('pointerdown', onWindowPointerDown, true);

  resizeHandle.addEventListener('pointermove', onResizePointerMove);
  resizeHandle.addEventListener('pointerup', onResizePointerUp);
  resizeHandle.addEventListener('pointercancel', onResizePointerUp);

  // ── Collapse / Fullscreen logic ──
  function updateCollapse() {
    if (isCollapsed) {
      body.style.display = 'none';
      collapseBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
      collapseBtn.title = 'Expand';
      shell.style.setProperty('height', header.offsetHeight + 'px', 'important');
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
        badge.style.display = 'block';
      }
    } else {
      body.style.display = 'flex';
      collapseBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`;
      collapseBtn.title = 'Collapse';
      if (!isFullscreen) shell.style.setProperty('height', expandedHeight + 'px', 'important');
      badge.style.display = 'none';
      unreadCount = 0;
    }
  }

  collapseBtn.addEventListener('click', () => {
    // If we're fullscreen, exit fullscreen before collapsing so the host
    // doesn't fight our height override.
    if (isFullscreen) {
      fsBtn.click();
    }
    if (!isCollapsed) expandedHeight = shell.offsetHeight;
    isCollapsed = !isCollapsed;
    updateCollapse();
  });

  const supportsNativeFullscreen = typeof (widget as any).setFullscreen === 'function';

  fsBtn.addEventListener('click', () => {
    if (isFullscreen) {
      // Exit fullscreen
      isFullscreen = false;
      if (supportsNativeFullscreen) {
        (widget as any).setFullscreen(false);
      } else {
        const props = ['position', 'left', 'top', 'right', 'bottom', 'margin', 'transform'];
        props.forEach(p => hostWrapper.style.removeProperty(p));
        if (preFullscreenState) {
          widget.moveTo(preFullscreenState.x, preFullscreenState.y);
        }
      }
      if (preFullscreenState) {
        shell.style.setProperty('width', preFullscreenState.w + 'px', 'important');
        shell.style.setProperty('height', preFullscreenState.h + 'px', 'important');
      }
      shell.style.removeProperty('border-radius');
      updateCollapse();
      fsBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`;
      fsBtn.title = 'Fullscreen';
    } else {
      // Enter fullscreen — snap the widget to the full viewport
      preFullscreenState = { w: shell.offsetWidth, h: shell.offsetHeight, x: widget.getPosition().x, y: widget.getPosition().y };
      isFullscreen = true;
      isCollapsed = false;

      if (supportsNativeFullscreen) {
        (widget as any).setFullscreen(true);
      } else {
        // Move the widget to the top-left origin so it covers the full screen
        widget.moveTo(0, 0);

        // Clear host positioning constraints
        hostWrapper.style.setProperty('position', 'fixed', 'important');
        hostWrapper.style.setProperty('left', '0', 'important');
        hostWrapper.style.setProperty('top', '0', 'important');
        hostWrapper.style.setProperty('right', 'auto', 'important');
        hostWrapper.style.setProperty('bottom', 'auto', 'important');
        hostWrapper.style.setProperty('width', '100vw', 'important');
        hostWrapper.style.setProperty('height', '100vh', 'important');
        hostWrapper.style.setProperty('margin', '0', 'important');
        hostWrapper.style.setProperty('transform', 'none', 'important');
      }
      // Make the shell fill the host container in fullscreen mode
      shell.style.setProperty('width', '100%', 'important');
      shell.style.setProperty('height', '100%', 'important');
      shell.style.setProperty('border-radius', '0', 'important');
      updateCollapse();

      fsBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>`;
      fsBtn.title = 'Exit Fullscreen';
    }
  });

  hideBtn.addEventListener('click', () => widget.setVisible(false));

  window.addEventListener('resize', () => {
    if (!isFullscreen && !isCollapsed) {
      const pos = widget.getPosition();
      const rect = shell.getBoundingClientRect();
      let nx = pos.x, ny = pos.y;
      if (nx + rect.width > window.innerWidth) nx = Math.max(0, window.innerWidth - rect.width - 16);
      if (ny + rect.height > window.innerHeight) ny = Math.max(0, window.innerHeight - rect.height - 16);
      if (nx !== pos.x || ny !== pos.y) widget.moveTo(nx, ny);
    } else if (isFullscreen && !supportsNativeFullscreen) {
      // Keep manual fullscreen shell synced to viewport
      shell.style.setProperty('width', window.innerWidth + 'px', 'important');
      shell.style.setProperty('height', window.innerHeight + 'px', 'important');
    }
  });

  // ── Event wiring ──
  autoToggle.addEventListener('change', () => {
    ctx.sendToBackend({ type: 'set_auto_reply', enabled: autoToggle.checked });
    if (triggerMode === 'time') {
      if (autoToggle.checked) {
        startAutoTimer();
      } else {
        stopAutoTimer();
      }
    }
  });

  const sendMessage = () => {
    if (isGenerating) return;
    const text = inputField.value.trim();
    if (!text) return;
    inputField.value = '';
    inputField.rows = 1;
    ctx.sendToBackend({ type: 'user_message', content: text });
  };
  sendButton.addEventListener('click', sendMessage);
  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  genButton.addEventListener('click', () => {
    if (isGenerating) return;
    ctx.sendToBackend({ type: 'trigger_generation' });
  });

  // ── Append message ──
  function appendMessage(name: string, username: string, content: string, avatarUrl: string | null, isUser: boolean = false) {
    const senderId = isUser ? '__user__' : name;
    const isGrouped = senderId === lastSenderId;
    lastSenderId = senderId;

    const wrap = document.createElement('div');
    wrap.className = 'chatroom-msg';
    wrap.style.cssText = `
      display:flex;gap:10px;align-items:flex-start;max-width:85%;
      ${isUser ? 'align-self:flex-end;flex-direction:row-reverse;' : 'align-self:flex-start;'}
      ${isGrouped ? 'margin-top:2px;' : 'margin-top:12px;'}
    `;

    // Avatar (only show if not grouped)
    const avatarWrap = document.createElement('div');
    avatarWrap.style.cssText = `flex-shrink:0;width:32px;height:32px;${isGrouped ? 'visibility:hidden;' : ''}`;
    if (avatarUrl) {
      avatarWrap.innerHTML = `<img src="${avatarUrl}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">`;
    } else {
      const displayName = isUser ? (userPersona?.name || 'You') : name;
      const initial = displayName.charAt(0).toUpperCase();
      const bg = isUser ? 'var(--lumiverse-primary)' : memberColor(name);
      const fg = 'white';
      avatarWrap.innerHTML = `<div style="width:32px;height:32px;border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:${fg};">${initial}</div>`;
    }
    wrap.appendChild(avatarWrap);

    // Content column
    const col = document.createElement('div');
    col.style.cssText = `display:flex;flex-direction:column;gap:2px;min-width:0;${isUser ? 'align-items:flex-end;' : 'align-items:flex-start;'}`;

    // Name (only show if not grouped)
    if (!isGrouped) {
      const nameEl = document.createElement('div');
      nameEl.style.cssText = 'font-size:11px;font-weight:700;padding:0 6px;';
      nameEl.style.color = isUser ? 'var(--lumiverse-primary)' : memberColor(name);
      nameEl.textContent = isUser ? (userPersona?.name || 'You') : (username || name);
      col.appendChild(nameEl);
    }

    // Bubble
    const bubble = document.createElement('div');
    bubble.style.cssText = `
      padding:10px 14px;border-radius:18px;font-size:13.5px;
      line-height:1.45;word-break:break-word;
      ${isUser
        ? 'background:var(--lumiverse-primary);color:white;border-bottom-right-radius:4px;'
        : 'background:var(--lumiverse-fill-subtle);color:var(--lumiverse-text);border-bottom-left-radius:4px;'}
    `;
    bubble.textContent = content;
    col.appendChild(bubble);

    // Timestamp
    const timeEl = document.createElement('div');
    timeEl.style.cssText = 'font-size:10px;color:var(--lumiverse-text-dim);padding:0 6px;';
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    col.appendChild(timeEl);

    wrap.appendChild(col);

    messageList.insertBefore(wrap, loadingIndicator);
    messageList.scrollTo({ top: messageList.scrollHeight, behavior: 'smooth' });

    if (isCollapsed) {
      unreadCount++;
      badge.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
      badge.style.display = 'block';
    }
  }

  function clearMessages() {
    messageList.innerHTML = '';
    messageList.appendChild(loadingIndicator);
    lastSenderId = null;
    unreadCount = 0;
  }

  function loadHistory(history: any[]) {
    clearMessages();
    for (const msg of history) {
      appendMessage(msg.name, msg.username, msg.content, msg.avatarUrl, msg.isUser);
    }
  }

  const unsubBackend = ctx.onBackendMessage((payload: any) => {
    if (payload.type === 'settings_loaded') {
      triggerModeSelect.value = payload.triggerMode ?? 'time';
      messageIntervalInput.value = (payload.messageInterval ?? 10).toString();
      randomToggleCheckbox.checked = payload.randomIntervalEnabled ?? true;
      intervalMinInput.value = (payload.intervalMin ?? 5).toString();
      intervalMaxInput.value = (payload.intervalMax ?? 15).toString();
      messageCountInput.value = (payload.messageCount ?? 5).toString();
      randomMessageCountCheckbox.checked = payload.randomMessageCountEnabled ?? true;
      messageCountMinInput.value = (payload.messageCountMin ?? 3).toString();
      messageCountMaxInput.value = (payload.messageCountMax ?? 7).toString();
      contextInput.value = (payload.contextLimit ?? 10).toString();
      maxContextTokensInput.value = (payload.maxContextTokens ?? 4096).toString();

      triggerMode = payload.triggerMode ?? 'time';
      messageInterval = payload.messageInterval ?? 10;
      randomIntervalEnabled = payload.randomIntervalEnabled ?? true;
      intervalMin = payload.intervalMin ?? 5;
      intervalMax = payload.intervalMax ?? 15;
      messageCount = payload.messageCount ?? 5;
      randomMessageCountEnabled = payload.randomMessageCountEnabled ?? true;
      messageCountMin = payload.messageCountMin ?? 3;
      messageCountMax = payload.messageCountMax ?? 7;

      updateTriggerMode();
      updateTimeRangeVisibility();
      updateMessageCountRangeVisibility();

      if (payload.userPersona) {
        userPersona = payload.userPersona;
      }

      autoToggle.checked = payload.autoReply ?? false;
      if (payload.autoReply && triggerMode === 'time') {
        startAutoTimer();
      } else if (!payload.autoReply && autoTimer) {
        stopAutoTimer();
      }

      connectionSelect.innerHTML = '<option value="">Default Active Connection</option>';
      if (payload.connections) {
        for (const conn of payload.connections) {
          const opt = document.createElement('option');
          opt.value = conn.id;
          opt.textContent = `${conn.name} (${conn.provider})`;
          connectionSelect.appendChild(opt);
        }
      }
      connectionSelect.value = payload.connectionId || '';

      if (payload.history && payload.history.length > 0) {
        loadHistory(payload.history);
        widget.setVisible(true);
      } else if (payload.hasActiveChat) {
        clearMessages();
        widget.setVisible(true);
      } else {
        clearMessages();
        widget.setVisible(false);
      }
    } else if (payload.type === 'hide_widget') {
      widget.setVisible(false);
      stopAutoTimer();
      autoToggle.checked = false;
    } else if (payload.type === 'chat_changed') {
      widget.setVisible(true);
      if (payload.history && payload.history.length > 0) {
        loadHistory(payload.history);
      } else {
        clearMessages();
      }
    } else if (payload.type === 'generation_started') {
      isGenerating = true;
      genButton.disabled = true;
      genButton.style.opacity = '0.5';
      loadingIndicator.style.display = 'flex';
      messageList.appendChild(loadingIndicator);
      messageList.scrollTo({ top: messageList.scrollHeight, behavior: 'smooth' });
    } else if (payload.type === 'generation_ended') {
      isGenerating = false;
      genButton.disabled = false;
      genButton.style.opacity = '1';
      loadingIndicator.style.display = 'none';
    } else if (payload.type === 'new_message') {
      appendMessage(payload.name, payload.username || payload.name, payload.content, payload.avatarUrl, payload.isUser);
    } else if (payload.type === 'error') {
      appendMessage('System', 'System', `Error: ${payload.message}`, null);
    }
  });

  ctx.sendToBackend({ type: 'load_settings' });

  return () => {
    if (autoTimer) clearTimeout(autoTimer);
    window.removeEventListener('pointerdown', onWindowPointerDown, true);
    unsubBackend();
    widget.destroy();
    tab.destroy();
    ctx.dom.cleanup();
  };
}
