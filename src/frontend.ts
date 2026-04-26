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
    ctx.dom.addStyle('');
  });
  configSection.appendChild(saveBtn);

  settingsContainer.appendChild(configSection);
  tab.root.appendChild(settingsContainer);

  // --- 2. Float Widget UI ---
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

  ctx.dom.addStyle(`
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes msgIn { from { opacity:0; transform: translateY(6px) scale(.98); } to { opacity:1; transform: none; } }
    .chatroom-scroll::-webkit-scrollbar { width: 5px; }
    .chatroom-scroll::-webkit-scrollbar-track { background: transparent; }
    .chatroom-scroll::-webkit-scrollbar-thumb { background: var(--lumiverse-border); border-radius: 3px; }
    .chatroom-msg { animation: msgIn .2s ease-out; }
  `);

  let autoTimer: any = null;
  let intervalMin = 5;
  let intervalMax = 15;
  let isGenerating = false;
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

  // Use pointer events with setPointerCapture — works for mouse, touch, and pen.
  // The capture-phase window listener lets us stopPropagation before the host's
  // drag system hears the event. We do NOT call preventDefault() because that
  // suppresses compatibility mouse events per the Pointer Events spec.
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
    if (!isCollapsed) expandedHeight = shell.offsetHeight;
    isCollapsed = !isCollapsed;
    updateCollapse();
  });

  fsBtn.addEventListener('click', () => {
    if (isFullscreen) {
      // Exit fullscreen
      isFullscreen = false;
      // Strip the viewport-override styles from widget.root
      const props = ['position', 'left', 'top', 'right', 'bottom', 'margin', 'transform', 'width', 'height', 'max-width', 'max-height', 'border-radius'];
      props.forEach(p => widget.root.style.removeProperty(p));
      if (preFullscreenState) {
        widget.moveTo(preFullscreenState.x, preFullscreenState.y);
      }
      // Restore collapsed/expanded height through the normal layout path
      updateCollapse();
      fsBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`;
      fsBtn.title = 'Fullscreen';
    } else {
      // Enter fullscreen — snap widget.root to the viewport
      preFullscreenState = { w: widget.root.offsetWidth, h: widget.root.offsetHeight, x: widget.getPosition().x, y: widget.getPosition().y };
      isFullscreen = true;
      isCollapsed = false;
      const pad = isMobile ? 4 : 24;
      widget.root.style.setProperty('position', 'fixed', 'important');
      widget.root.style.setProperty('left', pad + 'px', 'important');
      widget.root.style.setProperty('top', pad + 'px', 'important');
      widget.root.style.setProperty('right', pad + 'px', 'important');
      widget.root.style.setProperty('bottom', pad + 'px', 'important');
      widget.root.style.setProperty('width', 'auto', 'important');
      widget.root.style.setProperty('height', 'auto', 'important');
      widget.root.style.setProperty('border-radius', '20px', 'important');
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

  const unsubBackend = ctx.onBackendMessage((payload: any) => {
    if (payload.type === 'settings_loaded') {
      intervalMinInput.value = payload.intervalMin.toString();
      intervalMaxInput.value = payload.intervalMax.toString();
      contextInput.value = payload.contextLimit.toString();
      intervalMin = payload.intervalMin;
      intervalMax = payload.intervalMax;

      if (payload.userPersona) {
        userPersona = payload.userPersona;
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

      if (payload.history) {
        messageList.innerHTML = '';
        messageList.appendChild(loadingIndicator);
        lastSenderId = null;
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
    window.removeEventListener('pointerdown', onWindowPointerDown, true);
    unsubBackend();
    widget.destroy();
    tab.destroy();
    ctx.dom.cleanup();
  };
}
