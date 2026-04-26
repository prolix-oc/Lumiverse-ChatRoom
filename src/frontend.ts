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
  settingsContainer.style.display = 'flex';
  settingsContainer.style.flexDirection = 'column';
  settingsContainer.style.gap = '20px';
  
  const titleEl = document.createElement('h3');
  titleEl.textContent = 'Council Chatroom Overlay';
  titleEl.style.marginTop = '0';
  titleEl.style.marginBottom = '0px';
  titleEl.style.fontSize = '16px';
  settingsContainer.appendChild(titleEl);

  const descEl = document.createElement('p');
  descEl.textContent = 'The Council Chatroom overlay appears automatically. You can toggle the floating widget visibility here or use the controls below.';
  descEl.style.fontSize = '13px';
  descEl.style.color = 'var(--lumiverse-text-muted)';
  descEl.style.margin = '0';
  descEl.style.lineHeight = '1.4';
  settingsContainer.appendChild(descEl);

  function makeInteractive(el: HTMLElement) {
    const stop = (e: Event) => e.stopPropagation();
    // Only block bubble phase — capture-phase stopPropagation on the target
    // would prevent our own bubble-phase listeners from firing.
    el.addEventListener('mousedown', stop, false);
    el.addEventListener('touchstart', stop, { passive: true, capture: false });
    el.addEventListener('pointerdown', stop, false);
    el.addEventListener('click', stop, false);
    el.addEventListener('keydown', stop, false);
  }

  const toggleBtn = document.createElement('button');
  makeInteractive(toggleBtn);
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

  const configSection = document.createElement('div');
  configSection.style.display = 'flex';
  configSection.style.flexDirection = 'column';
  configSection.style.gap = '12px';
  configSection.style.borderTop = '1px solid var(--lumiverse-border)';
  configSection.style.paddingTop = '16px';

  const configTitle = document.createElement('h4');
  configTitle.textContent = 'Chatroom Configuration';
  configTitle.style.margin = '0';
  configTitle.style.fontSize = '14px';
  configSection.appendChild(configTitle);

  // Connection setting
  const connectionRow = document.createElement('div');
  connectionRow.style.display = 'flex';
  connectionRow.style.flexDirection = 'column';
  connectionRow.style.gap = '4px';

  const connectionLabel = document.createElement('label');
  connectionLabel.textContent = 'Generation Connection Profile';
  connectionLabel.style.fontSize = '13px';
  connectionLabel.style.fontWeight = '500';
  connectionRow.appendChild(connectionLabel);

  const connectionSelect = document.createElement('select');
  makeInteractive(connectionSelect);
  connectionSelect.style.padding = '6px';
  connectionSelect.style.border = '1px solid var(--lumiverse-border)';
  connectionSelect.style.borderRadius = 'var(--lumiverse-radius)';
  connectionSelect.style.background = 'var(--lumiverse-fill)';
  connectionSelect.style.color = 'var(--lumiverse-text)';
  connectionSelect.style.fontSize = '13px';
  connectionSelect.style.outline = 'none';
  connectionRow.appendChild(connectionSelect);
  configSection.appendChild(connectionRow);

  // Interval setting
  const intervalRow = document.createElement('div');
  intervalRow.style.display = 'flex';
  intervalRow.style.flexDirection = 'column';
  intervalRow.style.gap = '4px';

  const intervalLabel = document.createElement('label');
  intervalLabel.textContent = 'Auto-reply Interval Range (seconds)';
  intervalLabel.style.fontSize = '13px';
  intervalLabel.style.fontWeight = '500';
  intervalRow.appendChild(intervalLabel);

  const intervalInputs = document.createElement('div');
  intervalInputs.style.display = 'flex';
  intervalInputs.style.gap = '8px';
  intervalInputs.style.alignItems = 'center';

  const intervalMinInput = document.createElement('input');
  makeInteractive(intervalMinInput);
  intervalMinInput.type = 'number';
  intervalMinInput.min = '1';
  intervalMinInput.max = '60';
  intervalMinInput.value = '5';
  intervalMinInput.style.width = '60px';
  intervalMinInput.style.padding = '6px';
  intervalMinInput.style.border = '1px solid var(--lumiverse-border)';
  intervalMinInput.style.borderRadius = 'var(--lumiverse-radius)';
  intervalMinInput.style.background = 'var(--lumiverse-fill)';
  intervalMinInput.style.color = 'var(--lumiverse-text)';

  const intervalMaxInput = document.createElement('input');
  makeInteractive(intervalMaxInput);
  intervalMaxInput.type = 'number';
  intervalMaxInput.min = '1';
  intervalMaxInput.max = '120';
  intervalMaxInput.value = '15';
  intervalMaxInput.style.width = '60px';
  intervalMaxInput.style.padding = '6px';
  intervalMaxInput.style.border = '1px solid var(--lumiverse-border)';
  intervalMaxInput.style.borderRadius = 'var(--lumiverse-radius)';
  intervalMaxInput.style.background = 'var(--lumiverse-fill)';
  intervalMaxInput.style.color = 'var(--lumiverse-text)';

  intervalInputs.appendChild(intervalMinInput);
  intervalInputs.appendChild(document.createTextNode('to'));
  intervalInputs.appendChild(intervalMaxInput);
  intervalRow.appendChild(intervalInputs);
  configSection.appendChild(intervalRow);

  // Context history setting
  const contextRow = document.createElement('div');
  contextRow.style.display = 'flex';
  contextRow.style.flexDirection = 'column';
  contextRow.style.gap = '4px';

  const contextLabel = document.createElement('label');
  contextLabel.textContent = 'Context Retrieval (number of messages)';
  contextLabel.style.fontSize = '13px';
  contextLabel.style.fontWeight = '500';
  contextRow.appendChild(contextLabel);

  const contextInput = document.createElement('input');
  makeInteractive(contextInput);
  contextInput.type = 'number';
  contextInput.min = '1';
  contextInput.max = '50';
  contextInput.value = '10';
  contextInput.style.width = '80px';
  contextInput.style.padding = '6px';
  contextInput.style.border = '1px solid var(--lumiverse-border)';
  contextInput.style.borderRadius = 'var(--lumiverse-radius)';
  contextInput.style.background = 'var(--lumiverse-fill)';
  contextInput.style.color = 'var(--lumiverse-text)';
  contextRow.appendChild(contextInput);
  configSection.appendChild(contextRow);

  const saveBtn = document.createElement('button');
  makeInteractive(saveBtn);
  saveBtn.textContent = 'Save Configuration';
  saveBtn.style.padding = '8px 12px';
  saveBtn.style.background = 'var(--lumiverse-primary)';
  saveBtn.style.color = 'white';
  saveBtn.style.border = 'none';
  saveBtn.style.borderRadius = 'var(--lumiverse-radius)';
  saveBtn.style.cursor = 'pointer';
  saveBtn.style.fontSize = '13px';
  saveBtn.style.fontWeight = '500';
  saveBtn.style.alignSelf = 'flex-start';
  saveBtn.style.marginTop = '8px';
  saveBtn.addEventListener('click', () => {
    ctx.sendToBackend({
      type: 'save_settings',
      intervalMin: parseInt(intervalMinInput.value, 10),
      intervalMax: parseInt(intervalMaxInput.value, 10),
      contextLimit: parseInt(contextInput.value, 10),
      connectionId: connectionSelect.value
    });
    ctx.dom.addStyle(''); // Trigger a minor repaint/feedback if desired, or better:
    // we can use a toast but we don't have it explicitly bound in frontend context directly easily unless we emit.
    // We'll just trust the save since we don't have ctx.toast easily without event emission here.
  });
  configSection.appendChild(saveBtn);

  settingsContainer.appendChild(configSection);
  tab.root.appendChild(settingsContainer);


  // --- 2. Float Widget UI ---
  const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
  const WIDGET_MIN_W = isMobile ? 260 : 340;
  const WIDGET_MIN_H = isMobile ? 180 : 220;
  const WIDGET_MAX_W = Math.min(820, window.innerWidth - (isMobile ? 8 : 40));
  const WIDGET_MAX_H = Math.min(960, window.innerHeight - (isMobile ? 40 : 80));

  const widget = ctx.ui.createFloatWidget({
    width: isMobile ? Math.min(400, window.innerWidth - 16) : 460,
    height: isMobile ? Math.min(640, window.innerHeight - 80) : 640,
    initialPosition: {
      x: isMobile ? 8 : window.innerWidth - 500,
      y: isMobile ? 40 : window.innerHeight - 680
    },
    snapToEdge: true,
    tooltip: 'Council Chatroom',
    chromeless: false
  });

  const widgetContainer = widget.root.parentElement || widget.root;
  widget.root.style.position = 'relative';
  widget.root.style.display = 'flex';
  widget.root.style.flexDirection = 'column';
  widget.root.style.width = '100%';
  widget.root.style.height = '100%';
  widget.root.style.background = 'var(--lumiverse-bg)';
  widget.root.style.color = 'var(--lumiverse-text)';
  widget.root.style.overflow = 'hidden';
  widget.root.style.borderRadius = 'inherit';
  widget.root.style.fontFamily = 'var(--lumiverse-font-family, system-ui, -apple-system, sans-serif)';

  ctx.dom.addStyle(`
    @keyframes spin { 100% { transform: rotate(360deg); } }
    @keyframes msgPop { from { opacity:0; transform: translateY(10px) scale(0.98); } to { opacity:1; transform: translateY(0) scale(1); } }
    .chatroom-scroll::-webkit-scrollbar { width: 5px; }
    .chatroom-scroll::-webkit-scrollbar-track { background: transparent; }
    .chatroom-scroll::-webkit-scrollbar-thumb { background: var(--lumiverse-border); border-radius: 3px; }
    .chatroom-scroll::-webkit-scrollbar-thumb:hover { background: var(--lumiverse-border-hover); }
  `);

  // ── State ──
  let autoTimer: any = null;
  let intervalMin = 5;
  let intervalMax = 15;
  let isGenerating = false;
  let isCollapsed = false;
  let isFullscreen = false;
  let preFullscreenState: { w: number; h: number; x: number; y: number } | null = null;
  let expandedHeight = 640;
  let unreadCount = 0;

  // ── Header ──
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 12px 16px;
    background: var(--lumiverse-fill-subtle);
    border-bottom: 1px solid var(--lumiverse-border);
    display: flex; align-items: center; gap: 10px;
    flex-shrink: 0; cursor: default; user-select: none;
  `;

  const headerLeft = document.createElement('div');
  headerLeft.style.cssText = 'display:flex;align-items:center;gap:10px;flex:1;min-width:0;';

  const headerIcon = document.createElement('div');
  headerIcon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
  headerIcon.style.cssText = 'display:flex;color:var(--lumiverse-primary);flex-shrink:0;';

  const headerText = document.createElement('span');
  headerText.textContent = 'Council Chatroom';
  headerText.style.cssText = 'font-weight:600;font-size:14px;color:var(--lumiverse-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';

  const badge = document.createElement('span');
  badge.style.cssText = `
    display:none;background:var(--lumiverse-primary);color:white;
    font-size:10px;font-weight:700;padding:2px 6px;border-radius:10px;
    min-width:16px;text-align:center;flex-shrink:0;
  `;

  headerLeft.appendChild(headerIcon);
  headerLeft.appendChild(headerText);
  headerLeft.appendChild(badge);

  const headerActions = document.createElement('div');
  headerActions.style.cssText = 'display:flex;align-items:center;gap:4px;flex-shrink:0;';

  function headerBtn(html: string, title: string) {
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

  const fsBtn = headerBtn(
    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`,
    'Fullscreen'
  );
  const collapseBtn = headerBtn(
    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`,
    'Collapse'
  );
  const hideBtn = headerBtn(
    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    'Hide'
  );

  headerActions.appendChild(fsBtn);
  headerActions.appendChild(collapseBtn);
  headerActions.appendChild(hideBtn);
  header.appendChild(headerLeft);
  header.appendChild(headerActions);
  widget.root.appendChild(header);

  // ── Body ──
  const body = document.createElement('div');
  body.style.cssText = 'flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0;';

  const messageList = document.createElement('div');
  messageList.className = 'chatroom-scroll';
  messageList.style.cssText = `
    flex:1;overflow-y:auto;overflow-x:hidden;
    padding:16px;display:flex;flex-direction:column;gap:14px;min-height:0;
  `;

  const loadingIndicator = document.createElement('div');
  loadingIndicator.style.cssText = `
    display:none;padding:10px 16px;align-items:center;gap:8px;
    font-size:12px;color:var(--lumiverse-text-dim);font-style:italic;
  `;
  loadingIndicator.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 2s linear infinite;flex-shrink:0;">
      <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
      <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
    </svg>
    <span>Council is typing...</span>
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
  inputRow.style.cssText = 'display:flex;gap:10px;align-items:center;';

  const inputField = document.createElement('input');
  makeInteractive(inputField);
  inputField.type = 'text';
  inputField.placeholder = 'Type a message...';
  inputField.style.cssText = `
    flex:1;padding:10px 14px;border:1px solid var(--lumiverse-border);
    border-radius:20px;background:var(--lumiverse-fill-subtle);color:var(--lumiverse-text);
    font-size:${isMobile ? '16px' : '14px'};outline:none;min-width:0;
  `;
  inputField.addEventListener('pointerdown', () => inputField.focus());

  const sendButton = document.createElement('button');
  makeInteractive(sendButton);
  sendButton.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
  sendButton.style.cssText = `
    display:flex;align-items:center;justify-content:center;
    width:40px;height:40px;border-radius:50%;background:var(--lumiverse-primary);
    color:white;border:none;cursor:pointer;flex-shrink:0;
    transition:opacity .2s,transform .1s;
  `;
  sendButton.addEventListener('mouseenter', () => sendButton.style.opacity = '0.9');
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
  resizeHandle.style.cssText = `
    position:absolute;right:0;bottom:0;width:18px;height:18px;
    cursor:nwse-resize;z-index:10;
    display:${isMobile ? 'none' : 'flex'};
    align-items:flex-end;justify-content:flex-end;
    padding:0 3px 3px 0;
  `;
  resizeHandle.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:.35;"><polyline points="22 12 22 22 12 22"/></svg>`;
  widget.root.appendChild(resizeHandle);

  let isResizing = false;
  let resizeStart = { x: 0, y: 0, w: 0, h: 0 };

  resizeHandle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    isResizing = true;
    const rect = widgetContainer.getBoundingClientRect();
    resizeStart = { x: e.clientX, y: e.clientY, w: rect.width, h: rect.height };
    document.body.style.cursor = 'nwse-resize';
  });
  resizeHandle.addEventListener('touchstart', (e) => {
    e.preventDefault();
    e.stopPropagation();
    isResizing = true;
    const t = e.touches[0];
    const rect = widgetContainer.getBoundingClientRect();
    resizeStart = { x: t.clientX, y: t.clientY, w: rect.width, h: rect.height };
  }, { passive: false });

  function onResizeMove(e: MouseEvent | TouchEvent) {
    if (!isResizing) return;
    const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const nw = Math.max(WIDGET_MIN_W, Math.min(WIDGET_MAX_W, resizeStart.w + (cx - resizeStart.x)));
    const nh = Math.max(WIDGET_MIN_H, Math.min(WIDGET_MAX_H, resizeStart.h + (cy - resizeStart.y)));
    widgetContainer.style.width = nw + 'px';
    widgetContainer.style.height = nh + 'px';
    if (isCollapsed) { isCollapsed = false; updateCollapse(); }
  }
  function onResizeEnd() { isResizing = false; document.body.style.cursor = ''; }
  document.addEventListener('mousemove', onResizeMove);
  document.addEventListener('mouseup', onResizeEnd);
  document.addEventListener('touchmove', onResizeMove, { passive: false });
  document.addEventListener('touchend', onResizeEnd);

  // ── Collapse / Fullscreen logic ──
  function updateCollapse() {
    if (isCollapsed) {
      body.style.display = 'none';
      collapseBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
      collapseBtn.title = 'Expand';
      widgetContainer.style.height = header.offsetHeight + 'px';
      if (unreadCount > 0) { badge.textContent = unreadCount > 99 ? '99+' : String(unreadCount); badge.style.display = 'block'; }
    } else {
      body.style.display = 'flex';
      collapseBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`;
      collapseBtn.title = 'Collapse';
      if (!isFullscreen) widgetContainer.style.height = expandedHeight + 'px';
      badge.style.display = 'none';
      unreadCount = 0;
    }
  }

  collapseBtn.addEventListener('click', () => {
    if (!isCollapsed) expandedHeight = widgetContainer.offsetHeight;
    isCollapsed = !isCollapsed;
    updateCollapse();
  });

  fsBtn.addEventListener('click', () => {
    if (isFullscreen) {
      isFullscreen = false;
      if (preFullscreenState) {
        widgetContainer.style.width = preFullscreenState.w + 'px';
        widgetContainer.style.height = preFullscreenState.h + 'px';
        widget.moveTo(preFullscreenState.x, preFullscreenState.y);
      }
      fsBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`;
      fsBtn.title = 'Fullscreen';
    } else {
      preFullscreenState = { w: widgetContainer.offsetWidth, h: widgetContainer.offsetHeight, x: widget.getPosition().x, y: widget.getPosition().y };
      isFullscreen = true;
      isCollapsed = false;
      updateCollapse();
      const pad = isMobile ? 4 : 20;
      widgetContainer.style.width = (window.innerWidth - pad * 2) + 'px';
      widgetContainer.style.height = (window.innerHeight - pad * 2) + 'px';
      widget.moveTo(pad, pad);
      fsBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>`;
      fsBtn.title = 'Exit Fullscreen';
    }
  });

  hideBtn.addEventListener('click', () => widget.setVisible(false));

  window.addEventListener('resize', () => {
    if (!isFullscreen && !isCollapsed) {
      const pos = widget.getPosition();
      const rect = widgetContainer.getBoundingClientRect();
      let nx = pos.x, ny = pos.y;
      if (nx + rect.width > window.innerWidth) nx = Math.max(0, window.innerWidth - rect.width - 16);
      if (ny + rect.height > window.innerHeight) ny = Math.max(0, window.innerHeight - rect.height - 16);
      if (nx !== pos.x || ny !== pos.y) widget.moveTo(nx, ny);
    }
  });

  // ── Event wiring ──
  autoToggle.addEventListener('change', () => {
    if (autoToggle.checked) {
      const scheduleNext = () => {
        const ms = intervalMin * 1000 + Math.random() * ((intervalMax - intervalMin) * 1000);
        autoTimer = setTimeout(() => {
          if (!isGenerating) ctx.sendToBackend({ type: 'trigger_generation' });
          scheduleNext();
        }, ms);
      };
      scheduleNext();
    } else {
      if (autoTimer) clearTimeout(autoTimer);
    }
  });

  const sendMessage = () => {
    if (isGenerating) return;
    const text = inputField.value.trim();
    if (!text) return;
    inputField.value = '';
    ctx.sendToBackend({ type: 'user_message', content: text });
  };
  sendButton.addEventListener('click', sendMessage);
  inputField.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });
  genButton.addEventListener('click', () => {
    if (isGenerating) return;
    ctx.sendToBackend({ type: 'trigger_generation' });
  });

  // ── Append message ──
  function appendMessage(name: string, username: string, content: string, avatarUrl: string | null, isUser: boolean = false) {
    const wrap = document.createElement('div');
    wrap.style.cssText = `
      display:flex;gap:10px;align-items:flex-end;max-width:88%;
      animation:msgPop .25s ease-out;
      ${isUser ? 'align-self:flex-end;flex-direction:row-reverse;' : 'align-self:flex-start;'}
    `;

    // Avatar
    const avatarWrap = document.createElement('div');
    avatarWrap.style.cssText = 'flex-shrink:0;width:32px;height:32px;';
    if (avatarUrl) {
      avatarWrap.innerHTML = `<img src="${avatarUrl}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">`;
    } else {
      const initial = (isUser ? 'You' : name).charAt(0).toUpperCase();
      const bg = isUser ? 'var(--lumiverse-primary)' : 'var(--lumiverse-fill-hover)';
      const fg = isUser ? 'white' : 'var(--lumiverse-text)';
      avatarWrap.innerHTML = `<div style="width:32px;height:32px;border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:${fg};">${initial}</div>`;
    }
    wrap.appendChild(avatarWrap);

    // Bubble column
    const col = document.createElement('div');
    col.style.cssText = `display:flex;flex-direction:column;gap:3px;min-width:0;${isUser ? 'align-items:flex-end;' : 'align-items:flex-start;'}`;

    const nameEl = document.createElement('div');
    nameEl.style.cssText = 'font-size:11px;font-weight:600;color:var(--lumiverse-text-dim);padding:0 4px;';
    nameEl.textContent = isUser ? 'You' : (username || name);
    col.appendChild(nameEl);

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
    wrap.appendChild(col);

    messageList.insertBefore(wrap, loadingIndicator);
    messageList.scrollTo({ top: messageList.scrollHeight, behavior: 'smooth' });

    if (isCollapsed) {
      unreadCount++;
      badge.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
      badge.style.display = 'block';
    }
  }

  const unsubBackend = ctx.onBackendMessage((payload: any) => {
    if (payload.type === 'settings_loaded') {
      intervalMinInput.value = payload.intervalMin.toString();
      intervalMaxInput.value = payload.intervalMax.toString();
      contextInput.value = payload.contextLimit.toString();
      intervalMin = payload.intervalMin;
      intervalMax = payload.intervalMax;

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

      if (payload.history) {
        messageList.innerHTML = '';
        messageList.appendChild(loadingIndicator);
        for (const msg of payload.history) {
          appendMessage(msg.name, msg.username, msg.content, msg.avatarUrl, msg.isUser);
        }
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
    unsubBackend();
    widget.destroy();
    tab.destroy();
    ctx.dom.cleanup();
  };
}
