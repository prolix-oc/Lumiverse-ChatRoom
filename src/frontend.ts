import { Virtualizer, elementScroll, observeElementOffset, observeElementRect } from '@tanstack/virtual-core';
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
    margin: 0; font-size: 16px; font-weight: 600;
    color: var(--lumiverse-text); letter-spacing: -0.01em;
  `;

  const descEl = document.createElement('p');
  descEl.textContent = 'Configure how your council members react to the story. Toggle the floating widget below or use the controls in the chatroom itself.';
  descEl.style.cssText = `
    margin: 0; font-size: 12px; color: var(--lumiverse-text-dim);
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
    padding: 14px;
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
  `;

  const toggleInfo = document.createElement('div');
  toggleInfo.style.cssText = 'display: flex; flex-direction: column; gap: 2px;';
  const toggleLabel = document.createElement('span');
  toggleLabel.textContent = 'Floating Widget';
  toggleLabel.style.cssText = 'font-size: 13px; font-weight: 600; color: var(--lumiverse-text);';
  const toggleHint = document.createElement('span');
  toggleHint.textContent = 'Show or hide the chatroom overlay';
  toggleHint.style.cssText = 'font-size: 11px; color: var(--lumiverse-text-dim); line-height: 1.4;';
  toggleInfo.appendChild(toggleLabel);
  toggleInfo.appendChild(toggleHint);

  const toggleBtn = document.createElement('button');
  makeInteractive(toggleBtn);
  toggleBtn.textContent = 'Toggle Visibility';
  toggleBtn.style.cssText = `
    padding: 8px 14px;
    background: var(--lumiverse-fill-subtle);
    color: var(--lumiverse-text);
    border: 1px solid var(--lumiverse-border);
    border-radius: var(--lumiverse-radius, 8px);
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: background .15s, border-color .15s;
    flex-shrink: 0;
  `;
  toggleBtn.addEventListener('mouseenter', () => {
    toggleBtn.style.background = 'var(--lumiverse-fill-hover)';
    toggleBtn.style.borderColor = 'var(--lumiverse-border-hover)';
  });
  toggleBtn.addEventListener('mouseleave', () => {
    toggleBtn.style.background = 'var(--lumiverse-fill-subtle)';
    toggleBtn.style.borderColor = 'var(--lumiverse-border)';
  });
  toggleBtn.addEventListener('click', () => {
    setWidgetVisible(!widgetVisible);
  });

  toggleCard.appendChild(toggleInfo);
  toggleCard.appendChild(toggleBtn);
  settingsContainer.appendChild(toggleCard);

  // ── Configuration Card ──
  const configCard = document.createElement('div');
  configCard.style.cssText = `
    background: var(--lumiverse-fill-subtle);
    border: 1px solid var(--lumiverse-border);
    border-radius: var(--lumiverse-radius, 10px);
    padding: 16px;
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
  configTitle.style.cssText = 'margin: 0; font-size: 15px; font-weight: 600; color: var(--lumiverse-text);';
  configHeader.appendChild(configHeaderIcon);
  configHeader.appendChild(configTitle);
  configCard.appendChild(configHeader);

  // Chatroom Name (per-chat decorative)
  const chatroomNameMount = document.createElement('div');
  chatroomNameMount.style.cssText = 'width: 100%; max-width: 400px;';
  configCard.appendChild(createSettingRow(
    'Chatroom Name',
    'A custom name for this chatroom. Saved per-chat and shown in the widget header.',
    chatroomNameMount
  ));
  const chatroomNameInput = ctx.components.mountTextInput(chatroomNameMount, {
    value: '',
    placeholder: 'Council Chatroom',
  });

  // Helper for labeled input rows
  function createSettingRow(labelText: string, description: string, control: HTMLElement) {
    const row = document.createElement('div');
    row.style.cssText = 'display: flex; flex-direction: column; gap: 6px;';

    const labelWrap = document.createElement('div');
    labelWrap.style.cssText = 'display: flex; flex-direction: column; gap: 2px;';

    const label = document.createElement('label');
    label.textContent = labelText;
    label.style.cssText = 'font-size: 12px; font-weight: 500; color: var(--lumiverse-text-muted); letter-spacing: 0.03em; text-transform: uppercase;';

    const desc = document.createElement('span');
    desc.textContent = description;
    desc.style.cssText = 'font-size: 11px; color: var(--lumiverse-text-dim); line-height: 1.45;';

    labelWrap.appendChild(label);
    labelWrap.appendChild(desc);

    control.style.alignSelf = 'flex-start';
    row.appendChild(labelWrap);
    row.appendChild(control);
    return row;
  }

  // Connection Profile
  const connectionMount = document.createElement('div');
  connectionMount.style.cssText = 'min-width: 260px; max-width: 400px;';
  configCard.appendChild(createSettingRow(
    'Generation Connection Profile',
    'The LLM connection used to generate council messages.',
    connectionMount
  ));
  const connectionSelect = ctx.components.mountSelect(connectionMount, {
    options: [],
    value: '',
    placeholder: 'Default Active Connection',
    clearable: true,
    clearLabel: 'Default Active Connection',
    searchPlaceholder: 'Search connections…',
    emptyMessage: 'No connections available.',
    noResultsMessage: 'No connections match.',
  });

  // Persona Override (searchable popover with avatar leading)
  const personaMount = document.createElement('div');
  personaMount.style.cssText = 'min-width: 260px; max-width: 400px;';
  configCard.appendChild(createSettingRow(
    'Chatroom Persona',
    'Persona used to represent you in the chatroom. Defaults to your currently active persona; pick another to override it just for this extension.',
    personaMount
  ));
  const personaSelect = ctx.components.mountSelect(personaMount, {
    options: [],
    value: '',
    placeholder: 'Use Active Persona',
    clearable: true,
    clearLabel: 'Use Active Persona',
    searchPlaceholder: 'Search personas…',
    searchThreshold: 0,
    emptyMessage: 'No personas available.',
    noResultsMessage: 'No personas match.',
  });

  // Other Chatters (character cards added as guest chat participants)
  const otherChattersMount = document.createElement('div');
  otherChattersMount.style.cssText = 'min-width: 260px; max-width: 400px;';
  configCard.appendChild(createSettingRow(
    'Other Chatters',
    'Add characters from your library as guest participants in this chatroom. Saved per-chat. They chat casually alongside your council members and can be @mentioned.',
    otherChattersMount
  ));
  const otherChattersSelect = ctx.components.mountMultiSelect(otherChattersMount, {
    options: [],
    value: [],
    placeholder: 'No guest chatters',
    searchPlaceholder: 'Search your characters…',
    searchThreshold: 0,
    emptyMessage: 'No characters available.',
    noResultsMessage: 'No characters match.',
  });


  // Trigger Mode
  const triggerModeMount = document.createElement('div');
  triggerModeMount.style.cssText = 'min-width: 260px; max-width: 400px;';
  configCard.appendChild(createSettingRow(
    'Auto-Reply Trigger',
    'Choose whether council auto-replies are triggered by elapsed time or by the number of story chat messages sent.',
    triggerModeMount
  ));
  const triggerModeSelect = ctx.components.mountSelect(triggerModeMount, {
    options: [
      { value: 'time', label: 'Time-based (seconds)' },
      { value: 'messages', label: 'Message-based (chat messages)' },
    ],
    value: 'time',
    onChange: () => updateTriggerMode(),
  });

  // Time-based settings group
  const timeSettingsGroup = document.createElement('div');
  timeSettingsGroup.style.cssText = 'display: flex; flex-direction: column; gap: 16px;';

  // Time Between Messages
  const messageIntervalMount = document.createElement('div');
  timeSettingsGroup.appendChild(createSettingRow(
    'Time Between Messages (seconds)',
    'How long to wait before generating the next council message.',
    messageIntervalMount
  ));
  const messageIntervalInput = ctx.components.mountNumericInput(messageIntervalMount, {
    value: 10, min: 1, max: 3600, integer: true,
  });

  // Random Interval Toggle
  const randomToggleMount = document.createElement('div');
  timeSettingsGroup.appendChild(createSettingRow(
    'Random Interval',
    'When enabled, the delay between messages varies randomly within the range below.',
    randomToggleMount
  ));
  const randomToggleCheckbox = ctx.components.mountCheckbox(randomToggleMount, {
    checked: false,
    label: 'Use Random Message Interval',
    onChange: () => updateTimeRangeVisibility(),
  });

  // Interval Range (min / max)
  const intervalRangeWrap = document.createElement('div');
  intervalRangeWrap.style.cssText = 'display: flex; gap: 12px; align-items: flex-end;';

  const intervalMinMount = document.createElement('div');
  const intervalMaxMount = document.createElement('div');

  const minWrap = document.createElement('div');
  minWrap.style.cssText = 'display: flex; flex-direction: column; gap: 4px;';
  const minLabel = document.createElement('span');
  minLabel.textContent = 'Min (s)';
  minLabel.style.cssText = 'font-size: 11px; font-weight: 600; color: var(--lumiverse-text-muted); text-transform: uppercase; letter-spacing: 0.03em;';
  minWrap.appendChild(minLabel);
  minWrap.appendChild(intervalMinMount);

  const maxWrap = document.createElement('div');
  maxWrap.style.cssText = 'display: flex; flex-direction: column; gap: 4px;';
  const maxLabel = document.createElement('span');
  maxLabel.textContent = 'Max (s)';
  maxLabel.style.cssText = 'font-size: 11px; font-weight: 600; color: var(--lumiverse-text-muted); text-transform: uppercase; letter-spacing: 0.03em;';
  maxWrap.appendChild(maxLabel);
  maxWrap.appendChild(intervalMaxMount);

  const rangeArrow = document.createElement('span');
  rangeArrow.textContent = '→';
  rangeArrow.style.cssText = 'color: var(--lumiverse-text-dim); font-size: 12px; padding-bottom: 6px; font-weight: 500;';

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

  const intervalMinInput = ctx.components.mountNumericInput(intervalMinMount, {
    value: 5, min: 1, max: 60, integer: true,
  });
  const intervalMaxInput = ctx.components.mountNumericInput(intervalMaxMount, {
    value: 15, min: 1, max: 120, integer: true,
  });

  // Message-based settings group
  const messagesSettingsGroup = document.createElement('div');
  messagesSettingsGroup.style.cssText = 'display: none; flex-direction: column; gap: 16px;';

  // Messages Between Responses
  const messageCountMount = document.createElement('div');
  messagesSettingsGroup.appendChild(createSettingRow(
    'Messages Between Responses',
    'How many story chat messages must be sent before the council auto-replies.',
    messageCountMount
  ));
  const messageCountInput = ctx.components.mountNumericInput(messageCountMount, {
    value: 5, min: 1, max: 100, integer: true,
  });

  // Random Message Count Toggle
  const randomMessageCountMount = document.createElement('div');
  messagesSettingsGroup.appendChild(createSettingRow(
    'Random Message Count',
    'When enabled, the number of messages required varies randomly within the range below.',
    randomMessageCountMount
  ));
  const randomMessageCountCheckbox = ctx.components.mountCheckbox(randomMessageCountMount, {
    checked: false,
    label: 'Use Random Message Count',
    onChange: () => updateMessageCountRangeVisibility(),
  });

  // Message Count Range (min / max)
  const messageCountRangeWrap = document.createElement('div');
  messageCountRangeWrap.style.cssText = 'display: flex; gap: 12px; align-items: flex-end;';

  const messageCountMinMount = document.createElement('div');
  const messageCountMaxMount = document.createElement('div');

  const msgMinWrap = document.createElement('div');
  msgMinWrap.style.cssText = 'display: flex; flex-direction: column; gap: 4px;';
  const msgMinLabel = document.createElement('span');
  msgMinLabel.textContent = 'Min';
  msgMinLabel.style.cssText = 'font-size: 11px; font-weight: 600; color: var(--lumiverse-text-muted); text-transform: uppercase; letter-spacing: 0.03em;';
  msgMinWrap.appendChild(msgMinLabel);
  msgMinWrap.appendChild(messageCountMinMount);

  const msgMaxWrap = document.createElement('div');
  msgMaxWrap.style.cssText = 'display: flex; flex-direction: column; gap: 4px;';
  const msgMaxLabel = document.createElement('span');
  msgMaxLabel.textContent = 'Max';
  msgMaxLabel.style.cssText = 'font-size: 11px; font-weight: 600; color: var(--lumiverse-text-muted); text-transform: uppercase; letter-spacing: 0.03em;';
  msgMaxWrap.appendChild(msgMaxLabel);
  msgMaxWrap.appendChild(messageCountMaxMount);

  const msgRangeArrow = document.createElement('span');
  msgRangeArrow.textContent = '→';
  msgRangeArrow.style.cssText = 'color: var(--lumiverse-text-dim); font-size: 12px; padding-bottom: 6px; font-weight: 500;';

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

  const messageCountMinInput = ctx.components.mountNumericInput(messageCountMinMount, {
    value: 3, min: 1, max: 100, integer: true,
  });
  const messageCountMaxInput = ctx.components.mountNumericInput(messageCountMaxMount, {
    value: 7, min: 1, max: 100, integer: true,
  });

  // Show/hide time range row based on toggle
  function updateTimeRangeVisibility() {
    const enabled = randomToggleCheckbox.getValue();
    rangeRow.style.display = enabled ? 'flex' : 'none';
    messageIntervalInput.update({ disabled: enabled });
  }

  // Show/hide message count range row based on toggle
  function updateMessageCountRangeVisibility() {
    const enabled = randomMessageCountCheckbox.getValue();
    messageCountRangeRow.style.display = enabled ? 'flex' : 'none';
    messageCountInput.update({ disabled: enabled });
  }

  // Show/hide settings groups based on trigger mode
  function updateTriggerMode() {
    const isTime = triggerModeSelect.getValue() === 'time';
    timeSettingsGroup.style.display = isTime ? 'flex' : 'none';
    messagesSettingsGroup.style.display = isTime ? 'none' : 'flex';
  }

  // Context Retrieval
  const contextMount = document.createElement('div');
  configCard.appendChild(createSettingRow(
    'Context Retrieval (messages)',
    'How many recent story messages the council can see before reacting.',
    contextMount
  ));
  const contextInput = ctx.components.mountNumericInput(contextMount, {
    value: 10, min: 1, max: 50, integer: true,
  });

  // Max Context Tokens
  const maxContextTokensMount = document.createElement('div');
  configCard.appendChild(createSettingRow(
    'Max Context Tokens',
    'Maximum tokens the council chatroom history can consume. Older messages are removed automatically when this limit is exceeded.',
    maxContextTokensMount
  ));
  const maxContextTokensInput = ctx.components.mountNumericInput(maxContextTokensMount, {
    value: 4096, min: 512, max: 32768, integer: true,
  });

  const advancedGenerationGroup = document.createElement('div');
  advancedGenerationGroup.style.cssText = 'display: flex; flex-direction: column; gap: 14px;';

  const advancedGenerationHeader = document.createElement('div');
  advancedGenerationHeader.textContent = 'Advanced Generation';
  advancedGenerationHeader.style.cssText = 'padding-top: 6px; font-size: 12px; font-weight: 700; color: var(--lumiverse-text); letter-spacing: 0.04em; text-transform: uppercase;';
  advancedGenerationGroup.appendChild(advancedGenerationHeader);

  const temperatureMount = document.createElement('div');
  advancedGenerationGroup.appendChild(createSettingRow(
    'Temperature',
    'Higher values increase randomness. Leave blank to use the default of 1. A value of 0 omits temperature from the request.',
    temperatureMount
  ));
  const temperatureInput = ctx.components.mountNumericInput(temperatureMount, {
    value: null, min: 0, max: 2, step: 0.05, allowEmpty: true, placeholder: '1',
  });

  const topPMount = document.createElement('div');
  advancedGenerationGroup.appendChild(createSettingRow(
    'Top P',
    'Nucleus sampling cutoff. Leave blank to use the default of 0.95. A value of 0 omits top_p from the request.',
    topPMount
  ));
  const topPInput = ctx.components.mountNumericInput(topPMount, {
    value: null, min: 0, max: 1, step: 0.01, allowEmpty: true, placeholder: '0.95',
  });

  const topKWrap = document.createElement('div');
  topKWrap.style.cssText = 'display: flex; align-items: center; gap: 12px; flex-wrap: wrap;';

  const topKEnabledMount = document.createElement('div');
  const topKInputMount = document.createElement('div');
  topKWrap.appendChild(topKEnabledMount);
  topKWrap.appendChild(topKInputMount);

  advancedGenerationGroup.appendChild(createSettingRow(
    'Top K',
    'Enable to include top_k in the request. When enabled, 0 is allowed and sent as-is.',
    topKWrap
  ));

  const topKEnabledCheckbox = ctx.components.mountCheckbox(topKEnabledMount, {
    checked: false,
    label: 'Include top_k',
    onChange: () => updateTopKVisibility(),
  });
  const topKInput = ctx.components.mountNumericInput(topKInputMount, {
    value: 0, min: 0, max: 1000, integer: true,
  });

  function updateTopKVisibility() {
    topKInput.update({ disabled: !topKEnabledCheckbox.getValue() });
  }
  updateTopKVisibility();

  const maxResponseTokensMount = document.createElement('div');
  advancedGenerationGroup.appendChild(createSettingRow(
    'Max Response Tokens',
    'Maximum completion tokens to request. Leave blank to use the default of 8192.',
    maxResponseTokensMount
  ));
  const maxResponseTokensInput = ctx.components.mountNumericInput(maxResponseTokensMount, {
    value: null, min: 1, max: 32768, integer: true, allowEmpty: true, placeholder: '8192',
  });

  configCard.appendChild(advancedGenerationGroup);

  // Save Button
  const saveBtnWrap = document.createElement('div');
  saveBtnWrap.style.cssText = 'display: flex; gap: 10px; padding-top: 8px;';

  const saveBtn = document.createElement('button');
  makeInteractive(saveBtn);
  saveBtn.textContent = 'Save Configuration';
  saveBtn.style.cssText = `
    padding: 8px 16px;
    background: var(--lumiverse-primary);
    color: white;
    border: none;
    border-radius: var(--lumiverse-radius, 8px);
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: filter .15s, transform .1s;
  `;
  saveBtn.addEventListener('mouseenter', () => saveBtn.style.filter = 'brightness(1.1)');
  saveBtn.addEventListener('mouseleave', () => saveBtn.style.filter = 'none');
  saveBtn.addEventListener('mousedown', () => saveBtn.style.transform = 'scale(0.97)');
  saveBtn.addEventListener('mouseup', () => saveBtn.style.transform = 'none');
  saveBtn.addEventListener('click', () => {
    const topKOn = topKEnabledCheckbox.getValue();
    ctx.sendToBackend({
      type: 'save_settings',
      triggerMode: triggerModeSelect.getValue(),
      messageInterval: messageIntervalInput.getValue() ?? 10,
      randomIntervalEnabled: randomToggleCheckbox.getValue(),
      intervalMin: intervalMinInput.getValue() ?? 5,
      intervalMax: intervalMaxInput.getValue() ?? 15,
      messageCount: messageCountInput.getValue() ?? 5,
      randomMessageCountEnabled: randomMessageCountCheckbox.getValue(),
      messageCountMin: messageCountMinInput.getValue() ?? 3,
      messageCountMax: messageCountMaxInput.getValue() ?? 7,
      contextLimit: contextInput.getValue() ?? 10,
      maxContextTokens: maxContextTokensInput.getValue() ?? 4096,
      temperature: temperatureInput.getValue(),
      topP: topPInput.getValue(),
      topKEnabled: topKOn,
      topK: topKOn ? (topKInput.getValue() ?? 0) : null,
      maxResponseTokens: maxResponseTokensInput.getValue(),
      connectionId: connectionSelect.getValue(),
      personaId: personaSelect.getValue(),
      characterIds: otherChattersSelect.getValue(),
      chatroomName: chatroomNameInput.getValue().trim(),
    });
  });

  saveBtnWrap.appendChild(saveBtn);

  const clearBtn = document.createElement('button');
  makeInteractive(clearBtn);
  clearBtn.textContent = 'Clear Chat History';
  clearBtn.style.cssText = `
    padding: 8px 16px;
    background: transparent;
    color: var(--lumiverse-danger, #ef4444);
    border: 1px solid var(--lumiverse-danger, #ef4444);
    border-radius: var(--lumiverse-radius, 8px);
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: filter .15s, transform .1s, background .15s;
  `;
  clearBtn.addEventListener('mouseenter', () => {
    clearBtn.style.background = 'var(--lumiverse-danger-010, rgba(239,68,68,0.1))';
  });
  clearBtn.addEventListener('mouseleave', () => {
    clearBtn.style.background = 'transparent';
  });
  clearBtn.addEventListener('mousedown', () => clearBtn.style.transform = 'scale(0.97)');
  clearBtn.addEventListener('mouseup', () => clearBtn.style.transform = 'none');
  clearBtn.addEventListener('click', () => {
    ctx.sendToBackend({ type: 'clear_chat_history' });
  });
  saveBtnWrap.appendChild(clearBtn);

  configCard.appendChild(saveBtnWrap);

  settingsContainer.appendChild(configCard);
  tab.root.appendChild(settingsContainer);

  // ── 2. Float Widget UI ──
  const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const WIDGET_TRANSITION = prefersReducedMotion.matches
    ? '0ms linear'
    : '220ms cubic-bezier(0.22, 1, 0.36, 1)';
  const WIDGET_TRANSITION_FAST = prefersReducedMotion.matches
    ? '0ms linear'
    : '160ms cubic-bezier(0.4, 0, 0.2, 1)';
  const WIDGET_TRANSITION_MS = prefersReducedMotion.matches ? 0 : 220;

  function getDefaultWidgetSize() {
    return {
      width: isMobile ? Math.min(380, window.innerWidth - 16) : 440,
      height: isMobile ? Math.min(540, window.innerHeight - 80) : 620,
    };
  }

  function getDefaultWidgetPosition() {
    return {
      x: isMobile ? 8 : window.innerWidth - 480,
      y: isMobile ? 40 : window.innerHeight - 660,
    };
  }

  const defaultWidgetSize = getDefaultWidgetSize();
  const defaultWidgetPosition = getDefaultWidgetPosition();

  function isInChatView() {
    return /^\/chat\/[^/]+/.test(window.location.pathname);
  }

  const widget = ctx.ui.createFloatWidget({
    width: defaultWidgetSize.width,
    height: defaultWidgetSize.height,
    initialPosition: defaultWidgetPosition,
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
    .chatroom-msg-entering { animation: msgIn .2s ease-out; }
    .chatroom-copy-btn { opacity: .45; transition: opacity .15s, background .15s, transform .1s; }
    .chatroom-copy-btn:hover, .chatroom-copy-btn:focus-visible { opacity: 1; }
    .chatroom-copy-btn:active { transform: scale(.96); }
    .chatroom-rich strong { font-weight: 700; }
    .chatroom-rich em { font-style: italic; }
    .chatroom-inline-mention { color: var(--lumiverse-primary, #8c82ff); background: color-mix(in srgb, var(--lumiverse-primary, #8c82ff) 18%, transparent); border-radius: 6px; box-shadow: 0 0 0 2px color-mix(in srgb, var(--lumiverse-primary, #8c82ff) 18%, transparent); }
    .chatroom-input-shell { position: relative; flex: 1; display: flex; align-items: flex-end; min-height: 40px; max-height: 112px; border-radius: 18px; overflow: hidden; transition: background .2s, box-shadow .2s, border-color .2s; }
    .chatroom-input-shell:focus-within { box-shadow: inset 0 0 0 1px var(--lumiverse-border-hover), 0 0 0 2px color-mix(in srgb, var(--lumiverse-border-hover) 55%, transparent); }
    .chatroom-textarea-mirror { position: absolute; inset: 0; box-sizing: border-box; padding: 10px 14px; color: transparent; -webkit-text-fill-color: transparent; font: inherit; line-height: 1.4; white-space: pre-wrap; overflow-wrap: anywhere; word-break: normal; overflow-y: auto; overflow-x: hidden; scrollbar-gutter: stable; pointer-events: none; user-select: none; z-index: 0; }
    .chatroom-textarea-mirror::-webkit-scrollbar { width: 3px; }
    .chatroom-textarea-mirror::-webkit-scrollbar-thumb, .chatroom-textarea-mirror::-webkit-scrollbar-track { background: transparent; }
    .chatroom-mention-pill { background: color-mix(in srgb, var(--lumiverse-primary, rgba(140, 130, 255, 0.9)) 22%, transparent); border-radius: 4px; box-shadow: 0 0 0 2px color-mix(in srgb, var(--lumiverse-primary, rgba(140, 130, 255, 0.9)) 22%, transparent); }
    .chatroom-textarea { position: relative; z-index: 1; flex: 1; resize: none; border: none; outline: none; background: transparent; color: var(--lumiverse-text); -webkit-text-fill-color: var(--lumiverse-text); caret-color: var(--lumiverse-text); padding: 10px 14px; min-height: 40px; max-height: 112px; overflow-y: auto; overflow-x: hidden; scrollbar-gutter: stable; font: inherit; line-height: 1.4; white-space: pre-wrap; overflow-wrap: anywhere; word-break: normal; }
    .chatroom-textarea::placeholder { color: var(--lumiverse-text-dim); -webkit-text-fill-color: var(--lumiverse-text-dim); }
    .chatroom-textarea::-webkit-scrollbar { width: 3px; }
    .chatroom-textarea::-webkit-scrollbar-thumb { background: var(--lcs-scrollbar-thumb, rgba(255,255,255,0.15)); border-radius: 4px; }
    .chatroom-mention-popover { display: none; flex-direction: column; gap: 4px; max-height: 188px; overflow-y: auto; padding: 8px; border: 1px solid var(--lumiverse-border); border-radius: 12px; background: color-mix(in srgb, var(--lumiverse-bg-elevated, var(--lumiverse-fill)) 92%, var(--lcs-glass-bg, transparent) 8%); box-shadow: 0 16px 36px rgba(0,0,0,0.22); }
    .chatroom-mention-popover[data-open="true"] { display: flex; }
    .chatroom-mention-option { border: 1px solid transparent; border-radius: 10px; background: transparent; color: var(--lumiverse-text); padding: 8px 10px; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 10px; }
    .chatroom-mention-option:hover, .chatroom-mention-option[data-active="true"] { background: var(--lumiverse-fill-subtle); border-color: var(--lumiverse-border); }
    .chatroom-mention-avatar { width: 24px; height: 24px; border-radius: 999px; overflow: hidden; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; background: var(--lumiverse-fill-subtle); border: 1px solid var(--lumiverse-border); color: var(--lumiverse-text-dim); font-size: 10px; font-weight: 700; }
    .chatroom-mention-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .chatroom-mention-meta { display: flex; flex-direction: column; min-width: 0; gap: 1px; }
    .chatroom-mention-name { font-size: 12px; font-weight: 600; color: var(--lumiverse-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .chatroom-mention-slug { font-size: 11px; color: var(--lumiverse-text-dim); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
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
  let expandedWidth = 440;
  let unreadCount = 0;
  let lastSenderId: string | null = null;
  let userPersona: { name: string; avatarUrl: string | null } | null = null;
  let councilMembers: Array<{ name: string; avatarUrl: string | null; slug: string }> = [];

  function hashHue(str: string) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
    return Math.abs(h) % 360;
  }
  function memberColor(name: string) {
    const hue = hashHue(name);
    return `hsl(${hue}, 70%, 60%)`;
  }

  function slugifyName(name: string) {
    return name
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function setCouncilMembers(nextMembers: Array<{ name: string; avatarUrl?: string | null }>) {
    const deduped = new Map<string, { name: string; avatarUrl: string | null; slug: string }>();
    for (const member of nextMembers) {
      const name = typeof member?.name === 'string' ? member.name.trim() : '';
      if (!name) continue;
      const slug = slugifyName(name);
      if (!slug || deduped.has(slug)) continue;
      deduped.set(slug, {
        name,
        avatarUrl: member.avatarUrl || null,
        slug,
      });
    }
    councilMembers = Array.from(deduped.values());
  }

  function escapeHtml(text: string) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeRegExp(text: string) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function highlightRenderedMentions(html: string) {
    const candidateNames = new Set<string>();
    if (userPersona?.name?.trim()) candidateNames.add(userPersona.name.trim());
    for (const member of councilMembers) {
      if (member.name.trim()) candidateNames.add(member.name.trim());
    }

    if (candidateNames.size === 0) return html;

    const orderedNames = Array.from(candidateNames).sort((left, right) => right.length - left.length);
    const pattern = new RegExp(`(^|[^\\w>])@(${orderedNames.map(escapeRegExp).join('|')})(?=$|[\\s.,!?;:<])`, 'g');
    return html.replace(pattern, (_match, prefix: string, name: string) => `${prefix}<span class="chatroom-inline-mention">@${name}</span>`);
  }

  function formatMessageContent(text: string) {
    let html = escapeHtml(text);
    html = html.replace(/\*\*\*([\s\S]+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([\s\S]+?)\*/g, '<em>$1</em>');
    html = highlightRenderedMentions(html);
    return html.replace(/\n/g, '<br>');
  }

  async function copyToClipboard(text: string) {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const fallback = document.createElement('textarea');
    fallback.value = text;
    fallback.setAttribute('readonly', 'true');
    fallback.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;pointer-events:none;';
    document.body.appendChild(fallback);
    fallback.select();
    fallback.setSelectionRange(0, fallback.value.length);

    const copied = document.execCommand('copy');
    document.body.removeChild(fallback);
    if (!copied) {
      throw new Error('Copy failed');
    }
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
  const sizedWidget = widget as typeof widget & {
    setSize?: (width: number, height: number) => void;
    isFullscreen?: () => boolean;
  };

  function syncFullscreenStateFromHost() {
    if (typeof sizedWidget.isFullscreen === 'function') {
      isFullscreen = sizedWidget.isFullscreen();
    }
    syncHeaderSafeAreaPadding();
    return isFullscreen;
  }

  function setWidgetSize(width: number, height: number) {
    shell.style.setProperty('width', width + 'px', 'important');
    shell.style.setProperty('height', height + 'px', 'important');
    sizedWidget.setSize?.(width, height);
  }

  const userWidgetState: { x: number | null; y: number | null; w: number | null; h: number | null } = {
    x: null, y: null, w: null, h: null,
  };

  function restoreUserWidgetState() {
    if (syncFullscreenStateFromHost()) {
      fsBtn.click();
    }
    const defaults = getDefaultWidgetSize();
    const pos = getDefaultWidgetPosition();
    const w = userWidgetState.w ?? defaults.width;
    const h = userWidgetState.h ?? defaults.height;
    const x = userWidgetState.x ?? pos.x;
    const y = userWidgetState.y ?? pos.y;
    expandedHeight = h;
    expandedWidth = w;
    setWidgetSize(w, isCollapsed ? header.offsetHeight : h);
    widget.moveTo(x, y);
    requestAnimationFrame(() => clampWidgetToViewport());
  }

  function resetWidgetToSaneDefaults() {
    if (syncFullscreenStateFromHost()) {
      fsBtn.click();
    }

    const defaults = getDefaultWidgetSize();
    const pos = getDefaultWidgetPosition();
    expandedHeight = defaults.height;
    expandedWidth = defaults.width;

    if (isCollapsed) {
      isCollapsed = false;
      setWidgetSize(defaults.width, defaults.height);
      updateCollapse();
    } else {
      setWidgetSize(defaults.width, defaults.height);
      syncHostWrapperSize();
    }

    widget.moveTo(pos.x, pos.y);
    requestAnimationFrame(() => {
      clampWidgetToViewport();
      persistWidgetState();
    });
  }

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
    transform-origin:bottom right;
    will-change:width,height,transform,opacity,border-radius;
    transition:
      width var(--lcs-chat-widget-transition, ${WIDGET_TRANSITION}),
      height var(--lcs-chat-widget-transition, ${WIDGET_TRANSITION}),
      border-radius var(--lcs-chat-widget-transition, ${WIDGET_TRANSITION}),
      box-shadow var(--lcs-chat-widget-transition, ${WIDGET_TRANSITION}),
      opacity var(--lcs-chat-widget-transition-fast, ${WIDGET_TRANSITION_FAST}),
      transform var(--lcs-chat-widget-transition, ${WIDGET_TRANSITION}),
      filter var(--lcs-chat-widget-transition-fast, ${WIDGET_TRANSITION_FAST});
  `;

  hostWrapper.style.setProperty('transform-origin', 'bottom right');
  hostWrapper.style.setProperty('will-change', 'width, height, transform, opacity');
  hostWrapper.style.setProperty(
    'transition',
    [
      `width var(--lcs-chat-widget-transition, ${WIDGET_TRANSITION})`,
      `height var(--lcs-chat-widget-transition, ${WIDGET_TRANSITION})`,
      `opacity var(--lcs-chat-widget-transition-fast, ${WIDGET_TRANSITION_FAST})`,
      `transform var(--lcs-chat-widget-transition, ${WIDGET_TRANSITION})`,
      `left var(--lcs-chat-widget-transition, ${WIDGET_TRANSITION})`,
      `top var(--lcs-chat-widget-transition, ${WIDGET_TRANSITION})`,
    ].join(', ')
  );

  function getTypographyPreferenceSignature() {
    const rootStyle = getComputedStyle(document.documentElement);
    return [
      rootStyle.getPropertyValue('--lumiverse-font-scale').trim() || '1',
      rootStyle.getPropertyValue('--lumiverse-font-family').trim() || '',
    ].join('|');
  }

  let typographyPreferenceSignature = '';

  function applyWidgetPreferenceVars() {
    shell.style.setProperty('--lcs-chat-font-scale', 'var(--lumiverse-font-scale, 1)');
    shell.style.setProperty('--lcs-chat-name-font-size', 'calc(11px * var(--lcs-chat-font-scale, 1))');
    shell.style.setProperty('--lcs-chat-message-font-size', 'calc(13.5px * var(--lcs-chat-font-scale, 1))');
    shell.style.setProperty('--lcs-chat-meta-font-size', 'calc(10px * var(--lcs-chat-font-scale, 1))');
    shell.style.setProperty('--lcs-chat-input-font-size', 'calc(14px * var(--lcs-chat-font-scale, 1))');
    shell.style.setProperty('--lcs-chat-input-font-size-mobile', 'max(16px, calc(14px * var(--lcs-chat-font-scale, 1)))');
    shell.style.setProperty('--lcs-chat-widget-transition', WIDGET_TRANSITION);
    shell.style.setProperty('--lcs-chat-widget-transition-fast', WIDGET_TRANSITION_FAST);

    const nextSignature = getTypographyPreferenceSignature();
    const changed = typographyPreferenceSignature !== '' && typographyPreferenceSignature !== nextSignature;
    typographyPreferenceSignature = nextSignature;
    return changed;
  }

  applyWidgetPreferenceVars();

  // Start hidden until a chat is active
  let widgetVisible = false;
  let requestedWidgetVisible = false;
  let widgetVisibilityTimer: number | null = null;
  function applyWidgetVisibility() {
    const visible = requestedWidgetVisible && isInChatView();
    widgetVisible = visible;
    if (widgetVisibilityTimer != null) {
      window.clearTimeout(widgetVisibilityTimer);
      widgetVisibilityTimer = null;
    }
    // Manual fallback: some host versions don't reliably restore chromeless widgets
    if (visible) {
      widget.setVisible(true);
      shell.style.visibility = 'visible';
      shell.style.removeProperty('opacity');
      shell.style.removeProperty('filter');
      shell.style.pointerEvents = 'auto';
      requestAnimationFrame(() => {
        shell.style.opacity = '1';
        shell.style.transform = 'translateY(0) scale(1)';
      });
      // Recover from hosts that squash the shell to 2×2px when hidden.
      // Restore to the user's last-known position/size, not defaults — otherwise
      // we trample the position whenever this fires on a normal chat switch.
      const w = shell.offsetWidth;
      const h = shell.offsetHeight;
      if (w < 50 || h < 50) {
        restoreUserWidgetState();
        syncHostWrapperSize();
      }
    } else {
      shell.style.opacity = '0';
      shell.style.pointerEvents = 'none';
      shell.style.transform = 'translateY(12px) scale(0.975)';
      shell.style.filter = 'saturate(0.92)';
      widgetVisibilityTimer = window.setTimeout(() => {
        shell.style.visibility = 'hidden';
        shell.style.removeProperty('filter');
        widget.setVisible(false);
        widgetVisibilityTimer = null;
      }, WIDGET_TRANSITION_MS);
    }
  }
  function setWidgetVisible(visible: boolean) {
    const wasRequestedVisible = requestedWidgetVisible;
    requestedWidgetVisible = visible;
    applyWidgetVisibility();

    if (visible && !wasRequestedVisible && isInChatView()) {
      ctx.sendToBackend({ type: 'sync_active_chat' });
    }
  }
  setWidgetVisible(false);

  const originalPushState = window.history.pushState.bind(window.history);
  const originalReplaceState = window.history.replaceState.bind(window.history);
  const syncRouteVisibility = () => applyWidgetVisibility();
  window.history.pushState = function (...args) {
    const result = originalPushState(...args);
    syncRouteVisibility();
    return result;
  };
  window.history.replaceState = function (...args) {
    const result = originalReplaceState(...args);
    syncRouteVisibility();
    return result;
  };
  window.addEventListener('popstate', syncRouteVisibility);
  window.addEventListener('hashchange', syncRouteVisibility);

  // Auto-recover if the host squashes the shell dimensions while visible
  const shellResizeObserver = new ResizeObserver((entries) => {
    if (!widgetVisible || isFullscreen) return;
    for (const entry of entries) {
      const w = entry.contentRect.width;
      const h = entry.contentRect.height;
      if (w > 0 && h > 0) {
        syncHostWrapperSize();
      }
      if (w < 50 || h < 50) {
        restoreUserWidgetState();
        syncHostWrapperSize();
      }
    }
  });
  shellResizeObserver.observe(shell);

  // Persist widget position/size (skip on mobile)
  function persistWidgetState() {
    if (isMobile) return;
    const pos = widget.getPosition();
    const persistedHeight = isCollapsed ? expandedHeight : shell.offsetHeight;
    userWidgetState.x = pos.x;
    userWidgetState.y = pos.y;
    userWidgetState.w = expandedWidth;
    userWidgetState.h = persistedHeight;
    ctx.sendToBackend({
      type: 'save_widget_state',
      x: pos.x,
      y: pos.y,
      w: expandedWidth,
      h: persistedHeight,
      collapsed: isCollapsed,
    });
  }

  function persistCollapsedState() {
    if (isMobile) return;
    ctx.sendToBackend({
      type: 'save_widget_state',
      collapsed: isCollapsed,
    });
  }

  function clampWidgetToViewport() {
    if (isFullscreen) return;
    const pos = widget.getPosition();
    const rect = shell.getBoundingClientRect();
    let nx = pos.x;
    let ny = pos.y;
    const pad = 8;

    if (nx < pad) nx = pad;
    if (nx + rect.width > window.innerWidth - pad) nx = Math.max(pad, window.innerWidth - rect.width - pad);
    if (ny < pad) ny = pad;
    if (ny + rect.height > window.innerHeight - pad) ny = Math.max(pad, window.innerHeight - rect.height - pad);

    if (nx !== pos.x || ny !== pos.y) {
      widget.moveTo(nx, ny);
    }
  }

  widget.onDragEnd(() => {
    clampWidgetToViewport();
    persistWidgetState();
  });

  // ── Soft-keyboard handling ──
  // When the on-screen keyboard appears, shrink (and shift if needed) the
  // widget so the input bar stays above the keyboard. Restore on dismiss
  // without persisting — the saved widget state stays as the user left it.
  //
  // The host's keyboard state is global: it reflects whether *any* virtual
  // keyboard is visible, regardless of which element is focused. We only
  // adjust the widget while our own chat input holds focus, so the keyboard
  // appearing for some other field on the host page leaves the widget alone.
  let keyboardAdjustment: { x: number; y: number; w: number; h: number } | null = null;
  let chatInputFocused = false;
  let lastKeyboardState = ctx.ui.events.getKeyboardState();
  const KEYBOARD_TOP_PAD = 8;
  const KEYBOARD_GAP = 8;
  const KEYBOARD_MIN_HEIGHT = 220;

  function applyKeyboardAdjustment(insetBottom: number, viewportHeight: number) {
    const pos = widget.getPosition();
    const currentW = shell.offsetWidth;
    const currentH = shell.offsetHeight;
    if (keyboardAdjustment == null) {
      keyboardAdjustment = { x: pos.x, y: pos.y, w: currentW, h: currentH };
    }
    const keyboardTop = viewportHeight - insetBottom;
    const desiredBottom = keyboardTop - KEYBOARD_GAP;
    const baseY = keyboardAdjustment.y;
    const baseH = keyboardAdjustment.h;

    let targetY = baseY;
    let targetH = baseH;
    if (baseY + baseH > desiredBottom) {
      const shrinkOnly = desiredBottom - baseY;
      if (shrinkOnly >= KEYBOARD_MIN_HEIGHT) {
        targetH = shrinkOnly;
      } else {
        targetH = Math.max(KEYBOARD_MIN_HEIGHT, Math.min(baseH, desiredBottom - KEYBOARD_TOP_PAD));
        targetY = Math.max(KEYBOARD_TOP_PAD, desiredBottom - targetH);
      }
    }

    if (targetH !== currentH || pos.y !== targetY) {
      setWidgetSize(currentW, targetH);
      widget.moveTo(pos.x, targetY);
      syncHostWrapperSize();
    }
  }

  function clearKeyboardAdjustment() {
    if (keyboardAdjustment == null) return;
    const snapshot = keyboardAdjustment;
    keyboardAdjustment = null;
    setWidgetSize(snapshot.w, snapshot.h);
    widget.moveTo(snapshot.x, snapshot.y);
    syncHostWrapperSize();
  }

  function reconcileKeyboardAdjustment() {
    if (isFullscreen) {
      clearKeyboardAdjustment();
      return;
    }
    const state = lastKeyboardState;
    if (chatInputFocused && state.visible && state.insetBottom > 0 && widgetVisible) {
      applyKeyboardAdjustment(state.insetBottom, state.viewportHeight);
    } else {
      clearKeyboardAdjustment();
    }
  }

  const unsubKeyboard = ctx.ui.events.onKeyboardChange((state) => {
    lastKeyboardState = state;
    reconcileKeyboardAdjustment();
  });

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

  function syncHeaderSafeAreaPadding() {
    const useSafeAreaInsets = isFullscreen && isMobile;
    header.style.paddingTop = useSafeAreaInsets
      ? 'calc(14px + env(safe-area-inset-top, 0px))'
      : '14px';
    header.style.paddingRight = useSafeAreaInsets
      ? 'calc(18px + env(safe-area-inset-right, 0px))'
      : '18px';
    header.style.paddingBottom = '14px';
    header.style.paddingLeft = useSafeAreaInsets
      ? 'calc(18px + env(safe-area-inset-left, 0px))'
      : '18px';
  }

  syncHeaderSafeAreaPadding();

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

  // The host's built-in float-widget context menu ("Reset Position" / "Hide")
  // only resizes the host's outer container. For a chromeless widget that owns
  // its own shell (and pins the shell width), the host reset can't restore our
  // width — it just repositions. The host also exposes no size-change
  // notification, so we can't react to it either. Until that gap is closed
  // (see docs/spindle-float-resize-gap.md), intercept the right-click in *all*
  // states — not just while collapsed — and run our own reset, which resizes
  // the shell correctly.
  let widgetContextMenuOpen = false;
  async function openWidgetContextMenu(position: { x: number; y: number }) {
    if (widgetContextMenuOpen) return;
    widgetContextMenuOpen = true;
    try {
      const result = await ctx.ui.showContextMenu({
        position,
        items: [
          { key: 'reset', label: 'Reset Position' },
          { key: 'hide', label: 'Hide Widget' },
        ],
      });

      if (result.selectedKey === 'reset') {
        resetWidgetToSaneDefaults();
      } else if (result.selectedKey === 'hide') {
        setWidgetVisible(false);
      }
    } finally {
      widgetContextMenuOpen = false;
    }
  }

  const handleWidgetContextMenu = (e: Event) => {
    const mouseEvent = e as MouseEvent;
    mouseEvent.preventDefault();
    mouseEvent.stopPropagation();
    void openWidgetContextMenu({ x: mouseEvent.clientX, y: mouseEvent.clientY });
  };

  hostWrapper.addEventListener('contextmenu', handleWidgetContextMenu, true);

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
    e.preventDefault();
    e.stopPropagation();
    isDragging = true;
    header.style.cursor = 'grabbing';
    const pos = widget.getPosition();
    dragStart = { x: e.clientX, y: e.clientY, wx: pos.x, wy: pos.y };
  });
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    widget.moveTo(dragStart.wx + (e.clientX - dragStart.x), dragStart.wy + (e.clientY - dragStart.y));
  });
  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    header.style.cursor = 'grab';
    clampWidgetToViewport();
    persistWidgetState();
  });

  // ── Body ──
  const body = document.createElement('div');
  body.style.cssText = `
    flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0;
    opacity:1;transform:translateY(0) scale(1);transform-origin:top center;
    transition:
      opacity var(--lcs-chat-widget-transition-fast, ${WIDGET_TRANSITION_FAST}),
      transform var(--lcs-chat-widget-transition-fast, ${WIDGET_TRANSITION_FAST});
  `;

  // Prevent the host's float-widget drag from initiating on body taps —
  // drag is reserved for the header only.
  const stopDragInit = (e: Event) => e.stopPropagation();
  body.addEventListener('mousedown', stopDragInit, false);
  body.addEventListener('pointerdown', stopDragInit, false);
  body.addEventListener('touchstart', stopDragInit, { passive: true, capture: false });

  const messageList = document.createElement('div');
  messageList.className = 'chatroom-scroll';
  messageList.style.cssText = `
    flex:1;overflow-y:auto;overflow-x:hidden;
    min-height:0;position:relative;box-sizing:border-box;
    padding:0 16px;overflow-anchor:none;
  `;

  // ── Virtual List Structure ──
  const virtualContent = document.createElement('div');
  virtualContent.style.cssText = 'position:relative;width:100%;min-height:100%;';
  messageList.appendChild(virtualContent);

  body.appendChild(messageList);

  // ── Virtual Message List State ──
  interface ChatMessage {
    messageId: string;
    name: string;
    username: string;
    content: string;
    avatarUrl: string | null;
    isUser: boolean;
    timestamp: number;
    canRetry?: boolean;
    clientMessageId?: string;
  }
  let allMessages: ChatMessage[] = [];
  const msgHeightCache = new Map<string, number>();
  const ESTIMATED_MSG_HEIGHT = 60;
  const VIRTUAL_OVERSCAN = isMobile ? 4 : 6;
  const VIRTUAL_LIST_PADDING = 16;
  let isStickToBottom = true;
  let pendingUserRetryCandidateIndex: number | null = null;
  let currentGenerationRetryCandidateIndex: number | null = null;
  let typingPlaceholderVisible = false;
  let typingPlaceholderSpeakerName: string | null = null;
  let localUserMessageCounter = 0;
  let localMessageCounter = 0;
  const animatedMessageIds = new Set<string>();
  let ignoreScrollTrackingUntil = 0;
  let bottomScrollRaf: number | null = null;
  let pendingBottomScrollBehavior: 'auto' | 'smooth' | 'instant' | null = null;
  let virtualRenderRaf: number | null = null;
  let pendingRenderShouldStickToBottom = false;
  const renderedRows = new Map<string, HTMLElement>();
  const dirtyMeasurementKeys = new Set<string>();

  function invalidateVirtualMeasurements(shouldScrollToBottom = isStickToBottom) {
    msgHeightCache.clear();
    dirtyMeasurementKeys.clear();
    rowVirtualizer.measure();
    refreshVirtualizer(shouldScrollToBottom, 'auto');
  }

  function isGroupedAt(index: number): boolean {
    if (index <= 0) return false;
    const curr = allMessages[index];
    const prev = allMessages[index - 1];
    const currId = curr.isUser ? '__user__' : curr.name;
    const prevId = prev.isUser ? '__user__' : prev.name;
    return currId === prevId;
  }

  function getTypingIndicatorLabel() {
    return typingPlaceholderSpeakerName?.trim()
      ? `${typingPlaceholderSpeakerName.trim()} is typing…`
      : 'Council is typing…';
  }

  function getVirtualItemCount() {
    return allMessages.length + (typingPlaceholderVisible ? 1 : 0);
  }

  function isTypingPlaceholderIndex(index: number) {
    return typingPlaceholderVisible && index === allMessages.length;
  }

  function getVirtualItemKey(index: number) {
    return isTypingPlaceholderIndex(index) ? '__typing__' : (allMessages[index]?.messageId || `m:${index}`);
  }

  function getItemTopSpacing(index: number) {
    if (index <= 0) return 0;
    return isTypingPlaceholderIndex(index)
      ? (isTypingPlaceholderGrouped() ? 2 : 12)
      : (isGroupedAt(index) ? 2 : 12);
  }

  function createLocalUserMessageId() {
    localUserMessageCounter += 1;
    return `local-user-${Date.now()}-${localUserMessageCounter}`;
  }

  function createLocalMessageId(prefix: 'user' | 'assistant' | 'system') {
    localMessageCounter += 1;
    return `${prefix}-msg-${Date.now()}-${localMessageCounter}`;
  }

  function getVirtualItemSignature(index: number) {
    if (isTypingPlaceholderIndex(index)) {
      return [
        'typing',
        typingPlaceholderSpeakerName || '',
        isTypingPlaceholderGrouped() ? 'grouped' : 'solo',
      ].join('|');
    }

    const msg = allMessages[index];
    return [
      msg.messageId,
      msg.name,
      msg.username,
      msg.content,
      msg.avatarUrl || '',
      msg.canRetry ? 'retry' : 'noretry',
      isGroupedAt(index) ? 'grouped' : 'solo',
    ].join('|');
  }

  function setTypingPlaceholder(speakerName: string | null, visible: boolean, shouldScrollToBottom = false) {
    const normalizedSpeaker = speakerName?.trim() ? speakerName.trim() : null;
    const changed = typingPlaceholderVisible !== visible || typingPlaceholderSpeakerName !== normalizedSpeaker;
    typingPlaceholderVisible = visible;
    typingPlaceholderSpeakerName = normalizedSpeaker;

    if (changed) {
      refreshVirtualizer(shouldScrollToBottom, 'auto');
    } else if (shouldScrollToBottom) {
      requestBottomScroll('auto');
    }
  }

  function requestBottomScroll(behavior: 'auto' | 'smooth' | 'instant' = 'auto') {
    if (getVirtualItemCount() === 0) return;
    pendingBottomScrollBehavior = behavior;
    if (bottomScrollRaf != null) return;

    bottomScrollRaf = requestAnimationFrame(() => {
      bottomScrollRaf = null;
      const nextBehavior = pendingBottomScrollBehavior || 'auto';
      pendingBottomScrollBehavior = null;
      ignoreScrollTrackingUntil = performance.now() + 120;
      rowVirtualizer.scrollToIndex(getVirtualItemCount() - 1, {
        align: 'end',
        behavior: isGenerating ? 'auto' : nextBehavior,
      });
    });
  }

  function scheduleVirtualRender() {
    if (virtualRenderRaf != null) return;

    virtualRenderRaf = requestAnimationFrame(() => {
      virtualRenderRaf = null;
      renderVirtualItems(rowVirtualizer);

      if (pendingRenderShouldStickToBottom && getVirtualItemCount() > 0) {
        const behavior = pendingBottomScrollBehavior || 'auto';
        pendingRenderShouldStickToBottom = false;
        requestBottomScroll(behavior);
      }
    });
  }

  function refreshVirtualizer(shouldScrollToBottom = false, scrollBehavior: 'auto' | 'smooth' | 'instant' = 'auto') {
    rowVirtualizer.setOptions(buildVirtualizerOptions());
    rowVirtualizer._willUpdate();
    pendingRenderShouldStickToBottom = pendingRenderShouldStickToBottom || shouldScrollToBottom || isStickToBottom;
    if (shouldScrollToBottom) {
      pendingBottomScrollBehavior = scrollBehavior;
    } else if (!pendingBottomScrollBehavior && isStickToBottom) {
      pendingBottomScrollBehavior = 'auto';
    }
    scheduleVirtualRender();
  }

  function clearRetryFlags(shouldScrollToBottom = false) {
    let changed = false;
    for (const msg of allMessages) {
      if (msg.canRetry) {
        msg.canRetry = false;
        changed = true;
      }
    }

    if (changed) {
      refreshVirtualizer(shouldScrollToBottom, 'auto');
    }
  }

  function setRetryFlag(index: number | null) {
    clearRetryFlags(false);
    if (index == null || !allMessages[index]?.isUser) return;
    allMessages[index].canRetry = true;
    refreshVirtualizer(false, 'auto');
  }

  function isTypingPlaceholderGrouped() {
    if (!typingPlaceholderVisible || !typingPlaceholderSpeakerName || allMessages.length === 0) return false;
    const prev = allMessages[allMessages.length - 1];
    return !prev.isUser && prev.name === typingPlaceholderSpeakerName;
  }

  function createTypingPlaceholderElement(index: number): HTMLElement {
    const isGrouped = isTypingPlaceholderGrouped();
    const speakerName = typingPlaceholderSpeakerName || 'Council';

    const row = document.createElement('div');
    row.style.cssText = `
      width:100%;box-sizing:border-box;padding-top:${getItemTopSpacing(index)}px;
    `;

    const wrap = document.createElement('div');
    wrap.className = 'chatroom-msg';
    wrap.style.cssText = `
      display:flex;gap:10px;align-items:flex-start;max-width:85%;
      margin-right:auto;
    `;

    const avatarWrap = document.createElement('div');
    avatarWrap.style.cssText = `flex-shrink:0;width:32px;height:32px;${isGrouped ? 'visibility:hidden;' : ''}`;
    const initial = speakerName.charAt(0).toUpperCase() || 'C';
    avatarWrap.innerHTML = `<div style="width:32px;height:32px;border-radius:50%;background:${memberColor(speakerName)};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:white;">${initial}</div>`;
    wrap.appendChild(avatarWrap);

    const col = document.createElement('div');
    col.style.cssText = 'display:flex;flex-direction:column;gap:2px;min-width:0;align-items:flex-start;';

    if (!isGrouped) {
      const nameEl = document.createElement('div');
      nameEl.style.cssText = 'font-size:var(--lcs-chat-name-font-size);font-weight:700;padding:0 6px;';
      nameEl.style.color = memberColor(speakerName);
      nameEl.textContent = speakerName;
      col.appendChild(nameEl);
    }

    const bubble = document.createElement('div');
    bubble.style.cssText = `
      padding:10px 14px;border-radius:18px;border-bottom-left-radius:4px;
      font-size:var(--lcs-chat-message-font-size);line-height:1.45;word-break:break-word;
      background:var(--lumiverse-fill-subtle);color:var(--lumiverse-text-dim);
      display:flex;align-items:center;gap:8px;font-style:italic;
    `;
    bubble.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1.5s linear infinite;flex-shrink:0;">
        <line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line>
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
        <line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line>
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
      </svg>
      <span>${getTypingIndicatorLabel()}</span>
    `;
    col.appendChild(bubble);
    wrap.appendChild(col);
    row.appendChild(wrap);
    return row;
  }

  function createMessageElement(index: number): HTMLElement {
    const msg = allMessages[index];
    const isGrouped = isGroupedAt(index);
    const isUser = msg.isUser;

    const row = document.createElement('div');
    row.dataset.messageId = msg.messageId;
    row.style.cssText = `
      width:100%;box-sizing:border-box;padding-top:${getItemTopSpacing(index)}px;
    `;

    const wrap = document.createElement('div');
    wrap.className = 'chatroom-msg';
    wrap.style.cssText = `
      display:flex;gap:10px;align-items:flex-start;max-width:85%;
      ${isUser ? 'margin-left:auto;flex-direction:row-reverse;' : 'margin-right:auto;'}
    `;
    if (!animatedMessageIds.has(msg.messageId)) {
      wrap.classList.add('chatroom-msg-entering');
      animatedMessageIds.add(msg.messageId);
    }

    // Avatar (only show if not grouped)
    const avatarWrap = document.createElement('div');
    avatarWrap.style.cssText = `flex-shrink:0;width:32px;height:32px;${isGrouped ? 'visibility:hidden;' : ''}`;
    if (msg.avatarUrl) {
      avatarWrap.innerHTML = `<img src="${msg.avatarUrl}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">`;
    } else {
      const displayName = isUser ? (userPersona?.name || 'You') : msg.name;
      const initial = displayName.charAt(0).toUpperCase();
      const bg = isUser ? 'var(--lumiverse-primary)' : memberColor(msg.name);
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
      nameEl.style.cssText = 'font-size:var(--lcs-chat-name-font-size);font-weight:700;padding:0 6px;';
      nameEl.style.color = isUser ? 'var(--lumiverse-primary)' : memberColor(msg.name);
      nameEl.textContent = isUser ? (userPersona?.name || 'You') : (msg.username || msg.name);
      col.appendChild(nameEl);
    }

    // Bubble
    const bubble = document.createElement('div');
    bubble.className = 'chatroom-rich';
    bubble.style.cssText = `
      padding:10px 14px;border-radius:18px;font-size:var(--lcs-chat-message-font-size);
      line-height:1.45;word-break:break-word;
      ${isUser
        ? 'background:var(--lumiverse-primary);color:white;border-bottom-right-radius:4px;'
        : 'background:var(--lumiverse-fill-subtle);color:var(--lumiverse-text);border-bottom-left-radius:4px;'}
    `;
    bubble.innerHTML = formatMessageContent(msg.content);
    col.appendChild(bubble);

    // Actions
    const metaRow = document.createElement('div');
    metaRow.style.cssText = `display:flex;align-items:center;gap:4px;padding:0 6px;${isUser ? 'flex-direction:row-reverse;' : ''}`;

    const copyBtn = document.createElement('button');
    makeInteractive(copyBtn);
    copyBtn.className = 'chatroom-copy-btn';
    copyBtn.type = 'button';
    copyBtn.title = 'Copy message';
    copyBtn.setAttribute('aria-label', 'Copy message');
    copyBtn.style.cssText = `
      width:20px;height:20px;border:none;border-radius:999px;cursor:pointer;
      display:flex;align-items:center;justify-content:center;padding:0;
      background:transparent;color:${isUser ? 'rgba(255,255,255,0.9)' : 'var(--lumiverse-text-dim)'};
    `;
    copyBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
    copyBtn.addEventListener('click', async () => {
      const prevLabel = copyBtn.getAttribute('aria-label') || 'Copy message';
      try {
        await copyToClipboard(msg.content);
        copyBtn.setAttribute('aria-label', 'Copied');
        copyBtn.title = 'Copied';
      } catch {
        copyBtn.setAttribute('aria-label', 'Copy failed');
        copyBtn.title = 'Copy failed';
      }

      window.setTimeout(() => {
        copyBtn.setAttribute('aria-label', prevLabel);
        copyBtn.title = 'Copy message';
      }, 1200);
    });
    metaRow.appendChild(copyBtn);

    if (msg.isUser && msg.canRetry) {
      const retryBtn = document.createElement('button');
      makeInteractive(retryBtn);
      retryBtn.type = 'button';
      retryBtn.textContent = 'Retry';
      retryBtn.title = 'Retry council response';
      retryBtn.style.cssText = `
        border:none;background:transparent;cursor:pointer;padding:0 4px;
        font-size:var(--lcs-chat-meta-font-size);font-weight:600;color:${isUser ? 'rgba(255,255,255,0.92)' : 'var(--lumiverse-primary)'};
        opacity:.82;
      `;
      retryBtn.addEventListener('click', () => {
        if (isGenerating) return;
        clearRetryFlags(false);
        pendingUserRetryCandidateIndex = index;
        currentGenerationRetryCandidateIndex = index;
        ctx.sendToBackend({ type: 'retry_last_user_message' });
      });
      metaRow.appendChild(retryBtn);
    }

    // Timestamp
    const timeEl = document.createElement('div');
    timeEl.style.cssText = 'font-size:var(--lcs-chat-meta-font-size);color:var(--lumiverse-text-dim);';
    const ts = new Date(msg.timestamp);
    timeEl.textContent = ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    metaRow.appendChild(timeEl);
    col.appendChild(metaRow);

    wrap.appendChild(col);
    row.appendChild(wrap);
    return row;
  }

  function buildVirtualizerOptions() {
    return {
      count: getVirtualItemCount(),
      getScrollElement: () => messageList,
      estimateSize: (index: number) => msgHeightCache.get(getVirtualItemKey(index)) || ESTIMATED_MSG_HEIGHT,
      getItemKey: getVirtualItemKey,
      overscan: VIRTUAL_OVERSCAN,
      paddingStart: VIRTUAL_LIST_PADDING,
      paddingEnd: VIRTUAL_LIST_PADDING,
      observeElementRect,
      observeElementOffset,
      scrollToFn: elementScroll,
      useAnimationFrameWithResizeObserver: true,
      onChange: (instance: Virtualizer<HTMLDivElement, HTMLElement>, sync: boolean) => {
        scheduleVirtualRender();
        if (!sync && isStickToBottom && getVirtualItemCount() > 0 && pendingBottomScrollBehavior == null) {
          pendingRenderShouldStickToBottom = true;
          pendingBottomScrollBehavior = 'auto';
        }
      },
    };
  }

  const rowVirtualizer = new Virtualizer<HTMLDivElement, HTMLElement>(buildVirtualizerOptions());
  const destroyVirtualizer = rowVirtualizer._didMount();
  rowVirtualizer.shouldAdjustScrollPositionOnItemSizeChange = (item, _delta, instance) => {
    if (isStickToBottom) return false;
    return item.start < (instance.scrollOffset ?? 0);
  };
  rowVirtualizer._willUpdate();

  function renderVirtualItems(instance: Virtualizer<HTMLDivElement, HTMLElement>) {
    const items = instance.getVirtualItems();
    virtualContent.style.height = `${instance.getTotalSize()}px`;

    if (items.length === 0) {
      virtualContent.replaceChildren();
      renderedRows.clear();
      rowVirtualizer.measureElement(null);
      return;
    }

    const desiredRows: HTMLElement[] = [];
    const rows: HTMLElement[] = [];
    const activeKeys = new Set<string>();

    for (const item of items) {
      const key = String(item.key);
      const signature = getVirtualItemSignature(item.index);
      let row = renderedRows.get(key);

      if (!row || row.dataset.vsig !== signature) {
        row = isTypingPlaceholderIndex(item.index)
          ? createTypingPlaceholderElement(item.index)
          : createMessageElement(item.index);
        renderedRows.set(key, row);
        rows.push(row);
        dirtyMeasurementKeys.add(key);
      }

      row.setAttribute('data-index', String(item.index));
      row.dataset.vkey = key;
      row.dataset.vsig = signature;
      row.style.position = 'absolute';
      row.style.top = '0';
      row.style.left = '0';
      row.style.width = '100%';
      row.style.transform = `translateY(${item.start}px)`;
      desiredRows.push(row);
      activeKeys.add(key);
    }

    for (const [key, row] of renderedRows) {
      if (!activeKeys.has(key)) {
        row.remove();
        renderedRows.delete(key);
      }
    }

    let cursor = virtualContent.firstChild;
    for (const row of desiredRows) {
      if (row !== cursor) {
        virtualContent.insertBefore(row, cursor);
      } else {
        cursor = cursor?.nextSibling || null;
      }
      cursor = row.nextSibling;
    }

    while (cursor) {
      const next = cursor.nextSibling;
      virtualContent.removeChild(cursor);
      cursor = next;
    }

    for (const row of desiredRows) {
      const key = row.dataset.vkey;
      if (!key || (!dirtyMeasurementKeys.has(key) && msgHeightCache.has(key))) continue;
      rowVirtualizer.measureElement(row);
      const index = Number.parseInt(row.getAttribute('data-index') || '-1', 10);
      if (index >= 0) {
        msgHeightCache.set(getVirtualItemKey(index), row.offsetHeight);
        dirtyMeasurementKeys.delete(key);
      }
    }
  }

  messageList.addEventListener('scroll', () => {
    if (performance.now() < ignoreScrollTrackingUntil) return;
    isStickToBottom = messageList.scrollHeight - messageList.scrollTop - messageList.clientHeight <= 24;
  });

  // ── Controls ──
  const controls = document.createElement('div');
  controls.style.cssText = `
    padding:12px 16px;border-top:1px solid var(--lumiverse-border);
    background:var(--lumiverse-bg);display:flex;flex-direction:column;gap:10px;flex-shrink:0;
  `;

  const mentionPopover = document.createElement('div');
  mentionPopover.className = 'chatroom-mention-popover chatroom-scroll';

  const inputRow = document.createElement('div');
  inputRow.style.cssText = 'display:flex;gap:10px;align-items:flex-end;';

  const inputShell = document.createElement('div');
  inputShell.className = 'chatroom-input-shell';
  inputShell.style.cssText = 'background:var(--lumiverse-fill-subtle);box-shadow:inset 0 0 0 1px var(--lumiverse-border);';

  const mirrorLayer = document.createElement('div');
  mirrorLayer.className = 'chatroom-textarea-mirror';
  mirrorLayer.setAttribute('aria-hidden', 'true');

  const inputField = document.createElement('textarea');
  makeInteractive(inputField);
  inputField.className = 'chatroom-textarea';
  inputField.placeholder = 'Type a message…';
  inputField.rows = 1;
  const INPUT_MAX_VISIBLE_LINES = 4;
  inputField.style.cssText = `
    font-size:${isMobile ? 'var(--lcs-chat-input-font-size-mobile)' : 'var(--lcs-chat-input-font-size)'};min-width:0;
  `;

  let inputIsComposing = false;
  let mentionQuery: string | null = null;
  let mentionStartIndex = 0;
  let mentionActiveIndex = 0;
  let mentionResults: Array<{ name: string; avatarUrl: string | null; slug: string }> = [];

  function resetInputHeight() {
    inputField.style.height = '40px';
    inputField.style.overflowY = 'hidden';
    mirrorLayer.style.height = '40px';
  }

  function syncMirrorScroll() {
    mirrorLayer.scrollTop = inputField.scrollTop;
  }

  function adjustInputHeight() {
    inputField.style.height = 'auto';
    const lineHeight = parseFloat(getComputedStyle(inputField).lineHeight) || 20;
    const verticalPadding = 20;
    const maxHeight = Math.round(lineHeight * INPUT_MAX_VISIBLE_LINES + verticalPadding);
    const nextHeight = Math.min(inputField.scrollHeight, maxHeight);
    inputField.style.height = `${nextHeight}px`;
    inputField.style.overflowY = inputField.scrollHeight > maxHeight ? 'auto' : 'hidden';
    mirrorLayer.style.height = `${nextHeight}px`;
    syncMirrorScroll();
  }

  function renderMirrorContent() {
    const text = inputField.value;
    const slugSet = new Set(councilMembers.map(member => member.slug));
    const parts: string[] = [];
    const pattern = /(^|\s)@([a-z0-9][a-z0-9-]*)(?=\s|$|[.,!?;:])/gi;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const lead = match[1] || '';
      const rawSlug = (match[2] || '').toLowerCase();
      if (!slugSet.has(rawSlug)) continue;
      const tagStart = match.index + lead.length;
      const tagEnd = tagStart + 1 + rawSlug.length;
      if (tagStart > lastIndex) {
        parts.push(escapeHtml(text.slice(lastIndex, tagStart)));
      }
      parts.push(`<span class="chatroom-mention-pill">${escapeHtml(text.slice(tagStart, tagEnd))}</span>`);
      lastIndex = tagEnd;
    }

    if (lastIndex < text.length) {
      parts.push(escapeHtml(text.slice(lastIndex)));
    }

    parts.push('\u200B');
    mirrorLayer.innerHTML = parts.join('');
  }

  function closeMentionPopover() {
    mentionQuery = null;
    mentionResults = [];
    mentionActiveIndex = 0;
    mentionPopover.dataset.open = 'false';
    mentionPopover.replaceChildren();
  }

  function renderMentionPopover() {
    if (mentionQuery == null || mentionResults.length === 0) {
      closeMentionPopover();
      return;
    }

    mentionPopover.dataset.open = 'true';
    mentionPopover.replaceChildren();

    mentionResults.forEach((member, index) => {
      const option = document.createElement('button');
      makeInteractive(option);
      option.type = 'button';
      option.className = 'chatroom-mention-option';
      option.dataset.active = index === mentionActiveIndex ? 'true' : 'false';
      option.addEventListener('mousedown', (event) => {
        event.preventDefault();
      });
      option.addEventListener('click', () => {
        insertMention(member);
      });

      const avatar = document.createElement('span');
      avatar.className = 'chatroom-mention-avatar';
      if (member.avatarUrl) {
        avatar.innerHTML = `<img src="${escapeHtml(member.avatarUrl)}" alt="">`;
      } else {
        avatar.textContent = member.name.charAt(0).toUpperCase() || 'L';
        avatar.style.background = memberColor(member.name);
        avatar.style.color = 'white';
      }

      const meta = document.createElement('span');
      meta.className = 'chatroom-mention-meta';

      const name = document.createElement('span');
      name.className = 'chatroom-mention-name';
      name.textContent = member.name;

      const slug = document.createElement('span');
      slug.className = 'chatroom-mention-slug';
      slug.textContent = `@${member.slug}`;

      meta.appendChild(name);
      meta.appendChild(slug);
      option.appendChild(avatar);
      option.appendChild(meta);
      mentionPopover.appendChild(option);
    });
  }

  function refreshMentionResults() {
    if (mentionQuery == null) {
      closeMentionPopover();
      return;
    }

    const normalizedQuery = mentionQuery.toLowerCase();
    mentionResults = councilMembers
      .filter(member => !normalizedQuery || member.slug.includes(normalizedQuery) || member.name.toLowerCase().includes(normalizedQuery))
      .sort((left, right) => {
        const leftStarts = left.slug.startsWith(normalizedQuery) || left.name.toLowerCase().startsWith(normalizedQuery);
        const rightStarts = right.slug.startsWith(normalizedQuery) || right.name.toLowerCase().startsWith(normalizedQuery);
        if (leftStarts !== rightStarts) return leftStarts ? -1 : 1;
        return left.name.localeCompare(right.name);
      })
      .slice(0, 6);

    if (mentionResults.length === 0) {
      closeMentionPopover();
      return;
    }

    mentionActiveIndex = Math.max(0, Math.min(mentionActiveIndex, mentionResults.length - 1));
    renderMentionPopover();
  }

  function runMentionDetection() {
    const value = inputField.value;
    const cursorPos = inputField.selectionStart ?? value.length;
    const textBeforeCursor = value.slice(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');

    if (atIndex < 0) {
      closeMentionPopover();
      return;
    }

    const charBefore = atIndex > 0 ? textBeforeCursor[atIndex - 1] : ' ';
    if (atIndex !== 0 && !/\s/.test(charBefore)) {
      closeMentionPopover();
      return;
    }

    const fragment = textBeforeCursor.slice(atIndex + 1);
    if (/[^a-z0-9-]/i.test(fragment)) {
      closeMentionPopover();
      return;
    }

    mentionQuery = fragment;
    mentionStartIndex = atIndex;
    mentionActiveIndex = 0;
    refreshMentionResults();
  }

  function updateComposerDecorations() {
    renderMirrorContent();
    adjustInputHeight();
  }

  function insertMention(member: { name: string; avatarUrl: string | null; slug: string }) {
    const value = inputField.value;
    const selectionEnd = inputField.selectionEnd ?? value.length;
    const nextValue = `${value.slice(0, mentionStartIndex)}@${member.slug} ${value.slice(selectionEnd)}`;
    const nextCaret = mentionStartIndex + member.slug.length + 2;
    inputField.value = nextValue;
    inputField.setSelectionRange(nextCaret, nextCaret);
    closeMentionPopover();
    updateComposerDecorations();
    inputField.focus();
  }

  resetInputHeight();
  renderMirrorContent();
  closeMentionPopover();

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

  inputShell.appendChild(mirrorLayer);
  inputShell.appendChild(inputField);
  inputRow.appendChild(inputShell);
  inputRow.appendChild(sendButton);
  controls.appendChild(mentionPopover);
  controls.appendChild(inputRow);

  const toolsRow = document.createElement('div');
  toolsRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;';

  const autoToggleLabel = document.createElement('div');
  autoToggleLabel.style.cssText = 'display:flex;gap:8px;font-size:13px;color:var(--lumiverse-text-dim);align-items:center;user-select:none;';
  const autoToggleMount = document.createElement('div');
  autoToggleLabel.appendChild(autoToggleMount);
  autoToggleLabel.appendChild(document.createTextNode('Auto-reply'));
  const autoToggle = ctx.components.mountSwitch(autoToggleMount, {
    checked: false,
    size: 'sm',
    ariaLabel: 'Auto-reply',
    onChange: (checked) => {
      ctx.sendToBackend({ type: 'set_auto_reply', enabled: checked });
      if (triggerMode === 'time') {
        if (checked) startAutoTimer();
        else stopAutoTimer();
      }
    },
  });

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

  header.dataset.chatroomRegion = 'header';
  body.dataset.chatroomRegion = 'body';
  controls.dataset.chatroomRegion = 'controls';
  inputField.dataset.chatroomRegion = 'input';
  genButton.dataset.chatroomRegion = 'action';

  function applyWidgetTheme() {
    const glassEnabled = document.documentElement.hasAttribute('data-glass');

    shell.style.background = glassEnabled
      ? 'color-mix(in srgb, var(--lcs-glass-bg, var(--lumiverse-bg)) 88%, transparent)'
      : 'var(--lumiverse-bg)';
    shell.style.border = glassEnabled
      ? '1px solid var(--lcs-glass-border, var(--lumiverse-border))'
      : '1px solid var(--lumiverse-border)';
    shell.style.boxShadow = glassEnabled
      ? '0 18px 48px rgba(0,0,0,0.22), 0 4px 14px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.05)'
      : '0 20px 60px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)';
    shell.style.backdropFilter = glassEnabled ? 'blur(6px) saturate(1.03)' : 'none';
    (shell.style as CSSStyleDeclaration & { webkitBackdropFilter?: string }).webkitBackdropFilter = glassEnabled
      ? 'blur(6px) saturate(1.03)'
      : 'none';

    header.style.background = glassEnabled
      ? 'linear-gradient(180deg, color-mix(in srgb, var(--lcs-glass-bg, var(--lumiverse-fill-subtle)) 78%, transparent) 0%, color-mix(in srgb, var(--lumiverse-fill, var(--lumiverse-bg-elevated)) 72%, transparent) 100%)'
      : 'linear-gradient(180deg, var(--lumiverse-fill-subtle) 0%, var(--lumiverse-fill) 100%)';
    header.style.borderBottomColor = glassEnabled
      ? 'var(--lcs-glass-border, var(--lumiverse-border))'
      : 'var(--lumiverse-border)';

    body.style.background = glassEnabled
      ? 'color-mix(in srgb, var(--lumiverse-bg) 90%, transparent)'
      : 'transparent';
    controls.style.background = glassEnabled
      ? 'color-mix(in srgb, var(--lumiverse-bg) 84%, transparent)'
      : 'var(--lumiverse-bg)';
    controls.style.borderTopColor = glassEnabled
      ? 'var(--lcs-glass-border, var(--lumiverse-border))'
      : 'var(--lumiverse-border)';

    inputShell.style.background = glassEnabled
      ? 'color-mix(in srgb, var(--lumiverse-fill-subtle) 82%, var(--lcs-glass-bg, transparent) 18%)'
      : 'var(--lumiverse-fill-subtle)';
    inputShell.style.boxShadow = glassEnabled
      ? 'inset 0 0 0 1px var(--lcs-glass-border, var(--lumiverse-border))'
      : 'inset 0 0 0 1px var(--lumiverse-border)';

    genButton.style.background = glassEnabled
      ? 'color-mix(in srgb, var(--lumiverse-fill-subtle) 84%, var(--lcs-glass-bg, transparent) 16%)'
      : 'var(--lumiverse-fill-subtle)';
    genButton.style.borderColor = glassEnabled
      ? 'var(--lcs-glass-border, var(--lumiverse-border))'
      : 'var(--lumiverse-border)';
  }

  let themeSyncRaf: number | null = null;
  function syncWidgetVisualPreferences() {
    if (themeSyncRaf != null) return;
    themeSyncRaf = requestAnimationFrame(() => {
      themeSyncRaf = null;
      applyWidgetTheme();
      if (applyWidgetPreferenceVars()) {
        invalidateVirtualMeasurements(false);
      }
    });
  }

  syncWidgetVisualPreferences();

  const rootThemeObserver = new MutationObserver(() => syncWidgetVisualPreferences());
  rootThemeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-glass', 'data-theme-mode', 'style', 'class'],
  });

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
    sizedWidget.setSize?.(shell.offsetWidth, shell.offsetHeight);
    expandedWidth = shell.offsetWidth;
    expandedHeight = shell.offsetHeight;
    syncHostWrapperSize();
    persistWidgetState();
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
  function syncHostWrapperSize() {
    if (syncFullscreenStateFromHost()) return;
    const w = Math.round(shell.getBoundingClientRect().width);
    const h = Math.round(shell.getBoundingClientRect().height);
    const hostW = Math.round(hostWrapper.getBoundingClientRect().width);
    const hostH = Math.round(hostWrapper.getBoundingClientRect().height);
    if (w > 0 && hostW !== w) hostWrapper.style.setProperty('width', w + 'px', 'important');
    if (h > 0 && hostH !== h) hostWrapper.style.setProperty('height', h + 'px', 'important');
  }

  function updateCollapse() {
    if (isCollapsed) {
      body.style.pointerEvents = 'none';
      body.style.opacity = '0';
      body.style.transform = 'translateY(-10px) scale(0.985)';
      collapseBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
      collapseBtn.title = 'Expand';
      setWidgetSize(shell.offsetWidth, header.offsetHeight);
      syncHostWrapperSize();
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
        badge.style.display = 'block';
      }
    } else {
      body.style.pointerEvents = 'auto';
      body.style.opacity = '1';
      body.style.transform = 'translateY(0) scale(1)';
      collapseBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`;
      collapseBtn.title = 'Collapse';
      if (!isFullscreen) setWidgetSize(expandedWidth, expandedHeight);
      syncHostWrapperSize();
      badge.style.display = 'none';
      unreadCount = 0;
    }
    // After the height changes the widget may have slid partially off-screen.
    requestAnimationFrame(() => clampWidgetToViewport());
  }

  collapseBtn.addEventListener('click', () => {
    // If we're fullscreen, exit fullscreen before collapsing so the host
    // doesn't fight our height override.
    if (syncFullscreenStateFromHost()) {
      fsBtn.click();
    }
    if (!isCollapsed) {
      expandedHeight = shell.offsetHeight;
      expandedWidth = shell.offsetWidth;
    }
    isCollapsed = !isCollapsed;
    updateCollapse();
    persistWidgetState();
  });

  const supportsNativeFullscreen = typeof (widget as any).setFullscreen === 'function';

  fsBtn.addEventListener('click', () => {
    syncFullscreenStateFromHost();
    if (isFullscreen) {
      // Exit fullscreen
      isFullscreen = false;
      if (supportsNativeFullscreen) {
        (widget as any).setFullscreen(false);
      } else {
        const props = ['position', 'left', 'top', 'right', 'bottom', 'width', 'height', 'margin', 'transform'];
        props.forEach(p => hostWrapper.style.removeProperty(p));
        if (preFullscreenState) {
          widget.moveTo(preFullscreenState.x, preFullscreenState.y);
        }
      }
      if (preFullscreenState) {
        expandedWidth = preFullscreenState.w;
        expandedHeight = preFullscreenState.h;
        setWidgetSize(preFullscreenState.w, preFullscreenState.h);
      }
      shell.style.removeProperty('border-radius');
      // Re-sync the host wrapper to the restored shell size so it doesn't stay
      // stretched at the fullscreen 100vw/100vh footprint.
      if (!supportsNativeFullscreen) syncHostWrapperSize();
      syncHeaderSafeAreaPadding();
      updateCollapse();
      fsBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`;
      fsBtn.title = 'Fullscreen';
    } else {
      // Enter fullscreen — snap the widget to the full viewport
      preFullscreenState = { w: shell.offsetWidth, h: shell.offsetHeight, x: widget.getPosition().x, y: widget.getPosition().y };
      isFullscreen = true;
      isCollapsed = false;
      persistCollapsedState();

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
      syncHeaderSafeAreaPadding();
      updateCollapse();

      fsBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>`;
      fsBtn.title = 'Exit Fullscreen';
    }
  });

  hideBtn.addEventListener('click', () => setWidgetVisible(false));

  window.addEventListener('resize', () => {
    syncHeaderSafeAreaPadding();
    if (isFullscreen && !supportsNativeFullscreen) {
      // Keep manual fullscreen shell synced to viewport
      shell.style.setProperty('width', window.innerWidth + 'px', 'important');
      shell.style.setProperty('height', window.innerHeight + 'px', 'important');
      return;
    }
    if (isFullscreen) return;

    // Clamp widget to viewport for both expanded and collapsed states
    const pos = widget.getPosition();
    const rect = shell.getBoundingClientRect();
    let nx = pos.x, ny = pos.y;
    const pad = 8;
    if (nx < pad) nx = pad;
    if (nx + rect.width > window.innerWidth - pad) nx = Math.max(pad, window.innerWidth - rect.width - pad);
    if (ny < pad) ny = pad;
    if (ny + rect.height > window.innerHeight - pad) ny = Math.max(pad, window.innerHeight - rect.height - pad);
    if (nx !== pos.x || ny !== pos.y) widget.moveTo(nx, ny);
  });

  function normalizeOutgoingMentions(rawText: string) {
    const slugToMember = new Map(councilMembers.map(member => [member.slug, member]));
    const mentionedMemberNames: string[] = [];
    const seen = new Set<string>();
    const content = rawText.replace(/(^|\s)@([a-z0-9][a-z0-9-]*)(?=\s|$|[.,!?;:])/gi, (_match, lead: string, rawSlug: string) => {
      const member = slugToMember.get(rawSlug.toLowerCase());
      if (!member) return `${lead}@${rawSlug}`;
      if (!seen.has(member.slug)) {
        seen.add(member.slug);
        mentionedMemberNames.push(member.name);
      }
      return `${lead}@${member.name}`;
    });

    return { content, mentionedMemberNames };
  }

  const sendMessage = () => {
    if (isGenerating) return;
    const rawText = inputField.value.trim();
    if (!rawText) return;
    const { content, mentionedMemberNames } = normalizeOutgoingMentions(rawText);
    const clientMessageId = createLocalUserMessageId();
    inputField.value = '';
    inputField.rows = 1;
    resetInputHeight();
    renderMirrorContent();
    closeMentionPopover();
    appendMessage(
      userPersona?.name || 'You',
      userPersona?.name || 'You',
      content,
      userPersona?.avatarUrl || null,
      true,
      clientMessageId,
    );
    ctx.sendToBackend({ type: 'user_message', content, clientMessageId, mentionedMemberNames });
  };
  sendButton.addEventListener('click', sendMessage);
  inputField.addEventListener('input', () => {
    updateComposerDecorations();
    if (!inputIsComposing) {
      runMentionDetection();
    }
  });
  inputField.addEventListener('scroll', syncMirrorScroll);
  inputField.addEventListener('compositionstart', () => {
    inputIsComposing = true;
  });
  inputField.addEventListener('compositionend', () => {
    inputIsComposing = false;
    updateComposerDecorations();
    runMentionDetection();
  });
  inputField.addEventListener('focus', () => {
    chatInputFocused = true;
    // Refresh in case the keyboard was already up before we gained focus.
    lastKeyboardState = ctx.ui.events.getKeyboardState();
    reconcileKeyboardAdjustment();
  });
  inputField.addEventListener('blur', () => {
    chatInputFocused = false;
    // Restore the widget as soon as our input loses focus, even if the host
    // keyboard stays visible for another field.
    reconcileKeyboardAdjustment();
    window.setTimeout(() => {
      if (document.activeElement !== inputField) {
        closeMentionPopover();
      }
    }, 0);
  });
  inputField.addEventListener('keydown', (e) => {
    if (mentionQuery != null && mentionResults.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        mentionActiveIndex = (mentionActiveIndex + 1) % mentionResults.length;
        renderMentionPopover();
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        mentionActiveIndex = (mentionActiveIndex - 1 + mentionResults.length) % mentionResults.length;
        renderMentionPopover();
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(mentionResults[mentionActiveIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMentionPopover();
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  genButton.addEventListener('click', () => {
    if (isGenerating) return;
    ctx.sendToBackend({ type: 'trigger_generation' });
  });

  // ── Append message ──
  function appendMessage(name: string, username: string, content: string, avatarUrl: string | null, isUser: boolean = false, clientMessageId?: string, messageId?: string, shouldAnimate = true) {
    if (!isUser && typingPlaceholderVisible) {
      setTypingPlaceholder(null, false, false);
    }

    const nextMessageId = messageId || createLocalMessageId(isUser ? 'user' : (name === 'System' ? 'system' : 'assistant'));
    if (!shouldAnimate) {
      animatedMessageIds.add(nextMessageId);
    }

    allMessages.push({
      messageId: nextMessageId,
      name,
      username,
      content,
      avatarUrl,
      isUser,
      timestamp: Date.now(),
      canRetry: false,
      clientMessageId,
    });
    lastSenderId = isUser ? '__user__' : name;

    if (isUser) {
      pendingUserRetryCandidateIndex = allMessages.length - 1;
    } else {
      pendingUserRetryCandidateIndex = null;
      clearRetryFlags(false);
    }

    if (isUser) {
      isStickToBottom = true;
    }

    const shouldScroll = isUser || isStickToBottom;
    refreshVirtualizer(shouldScroll, isUser ? 'smooth' : 'auto');

    if (isCollapsed) {
      unreadCount++;
      badge.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
      badge.style.display = 'block';
    }
  }

  function reconcileUserMessage(clientMessageId: string, name: string, username: string, content: string, avatarUrl: string | null) {
    const index = allMessages.findIndex((msg) => msg.isUser && msg.clientMessageId === clientMessageId);
    if (index === -1) {
      appendMessage(name, username, content, avatarUrl, true, clientMessageId);
      return;
    }

    const msg = allMessages[index];
    const changed = msg.name !== name
      || msg.username !== username
      || msg.content !== content
      || msg.avatarUrl !== avatarUrl;

    msg.name = name;
    msg.username = username;
    msg.content = content;
    msg.avatarUrl = avatarUrl;
    msg.clientMessageId = clientMessageId;

    if (changed) {
      refreshVirtualizer(index === allMessages.length - 1 && isStickToBottom, 'auto');
    }
  }

  function clearMessages() {
    allMessages = [];
    msgHeightCache.clear();
    animatedMessageIds.clear();
    renderedRows.clear();
    lastSenderId = null;
    unreadCount = 0;
    pendingUserRetryCandidateIndex = null;
    currentGenerationRetryCandidateIndex = null;
    typingPlaceholderVisible = false;
    typingPlaceholderSpeakerName = null;
    refreshVirtualizer(false, 'auto');
  }

  function loadHistory(history: any[]) {
    allMessages = [];
    msgHeightCache.clear();
    animatedMessageIds.clear();
    renderedRows.clear();
    for (const msg of history) {
      const messageId = createLocalMessageId(msg.isUser ? 'user' : 'assistant');
      animatedMessageIds.add(messageId);
      allMessages.push({
        messageId,
        name: msg.name,
        username: msg.username,
        content: msg.content,
        avatarUrl: msg.avatarUrl,
        isUser: msg.isUser,
        timestamp: msg.timestamp || Date.now(),
        canRetry: false,
        clientMessageId: undefined,
      });
    }
    lastSenderId = allMessages.length > 0
      ? (allMessages[allMessages.length - 1].isUser ? '__user__' : allMessages[allMessages.length - 1].name)
      : null;
    pendingUserRetryCandidateIndex = allMessages.length > 0 && allMessages[allMessages.length - 1].isUser
      ? allMessages.length - 1
      : null;
    currentGenerationRetryCandidateIndex = null;
    typingPlaceholderVisible = false;
    typingPlaceholderSpeakerName = null;
    isStickToBottom = true;
    refreshVirtualizer(true, 'auto');
  }

  const unsubBackend = ctx.onBackendMessage((payload: any) => {
    if (payload.type === 'settings_loaded') {
      triggerModeSelect.update({ value: payload.triggerMode ?? 'time' });
      messageIntervalInput.update({ value: payload.messageInterval ?? 10 });
      randomToggleCheckbox.update({ checked: payload.randomIntervalEnabled ?? true });
      intervalMinInput.update({ value: payload.intervalMin ?? 5 });
      intervalMaxInput.update({ value: payload.intervalMax ?? 15 });
      messageCountInput.update({ value: payload.messageCount ?? 5 });
      randomMessageCountCheckbox.update({ checked: payload.randomMessageCountEnabled ?? true });
      messageCountMinInput.update({ value: payload.messageCountMin ?? 3 });
      messageCountMaxInput.update({ value: payload.messageCountMax ?? 7 });
      contextInput.update({ value: payload.contextLimit ?? 10 });
      maxContextTokensInput.update({ value: payload.maxContextTokens ?? 4096 });
      temperatureInput.update({ value: payload.temperature ?? null });
      topPInput.update({ value: payload.topP ?? null });
      topKEnabledCheckbox.update({ checked: payload.topKEnabled ?? false });
      topKInput.update({ value: payload.topK ?? 0 });
      maxResponseTokensInput.update({ value: payload.maxResponseTokens ?? null });

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
      updateTopKVisibility();

      if (payload.userPersona) {
        userPersona = payload.userPersona;
      }

      setCouncilMembers(Array.isArray(payload.councilMembers) ? payload.councilMembers : []);
      renderMirrorContent();
      if (mentionQuery != null) {
        refreshMentionResults();
      }

      chatroomNameInput.update({ value: payload.chatroomName ?? '' });
      headerTitle.textContent = payload.chatroomName?.trim() || 'Council Chatroom';

      autoToggle.update({ checked: payload.autoReply ?? false });
      if (payload.autoReply && triggerMode === 'time') {
        startAutoTimer();
      } else if (!payload.autoReply && autoTimer) {
        stopAutoTimer();
      }

      connectionSelect.update({
        options: Array.isArray(payload.connections)
          ? payload.connections.map((c: { id: string; name: string; provider: string }) => ({
              value: c.id,
              label: `${c.name} (${c.provider})`,
            }))
          : [],
        value: payload.connectionId || '',
      });

      personaSelect.update({
        options: Array.isArray(payload.personas)
          ? payload.personas.map((p: { id: string; name: string; title: string; avatarUrl: string | null }) => {
              const initial = (p.name?.[0] || '?').toUpperCase();
              return {
                value: p.id,
                label: p.name,
                sublabel: p.title || undefined,
                leading: p.avatarUrl
                  ? { type: 'image' as const, src: p.avatarUrl, fallback: { text: initial } }
                  : { type: 'initial' as const, text: initial },
              };
            })
          : [],
        value: typeof payload.personaId === 'string' ? payload.personaId : '',
      });

      otherChattersSelect.update({
        options: Array.isArray(payload.characters)
          ? payload.characters.map((c: { id: string; name: string; avatarUrl: string | null }) => {
              const initial = (c.name?.[0] || '?').toUpperCase();
              return {
                value: c.id,
                label: c.name,
                leading: c.avatarUrl
                  ? { type: 'image' as const, src: c.avatarUrl, fallback: { text: initial } }
                  : { type: 'initial' as const, text: initial },
              };
            })
          : [],
        value: Array.isArray(payload.characterIds) ? payload.characterIds : [],
      });

      const shouldShowWidget = Boolean((payload.history && payload.history.length > 0) || payload.hasActiveChat);

      if (payload.history && payload.history.length > 0) {
        loadHistory(payload.history);
      } else if (payload.hasActiveChat) {
        clearMessages();
      } else {
        clearMessages();
      }

      // Restore persisted widget position/size (desktop only)
      if (!isMobile && payload.widgetX != null && payload.widgetY != null) {
        widget.moveTo(payload.widgetX, payload.widgetY);
        userWidgetState.x = payload.widgetX;
        userWidgetState.y = payload.widgetY;
      }
      if (!isMobile && payload.widgetW != null && payload.widgetH != null) {
        setWidgetSize(payload.widgetW, payload.widgetH);
        expandedHeight = payload.widgetH;
        expandedWidth = payload.widgetW;
        userWidgetState.w = payload.widgetW;
        userWidgetState.h = payload.widgetH;
        syncHostWrapperSize();
      }

      isCollapsed = payload.widgetCollapsed ?? false;
      updateCollapse();
      setWidgetVisible(shouldShowWidget);
    } else if (payload.type === 'hide_widget') {
      setWidgetVisible(false);
      stopAutoTimer();
      autoToggle.update({ checked: false });
    } else if (payload.type === 'chat_changed') {
      setWidgetVisible(true);
      setCouncilMembers(Array.isArray(payload.councilMembers) ? payload.councilMembers : []);
      if (Array.isArray(payload.characterIds)) {
        otherChattersSelect.update({ value: payload.characterIds });
      }
      renderMirrorContent();
      if (mentionQuery != null) {
        refreshMentionResults();
      }
      headerTitle.textContent = payload.chatroomName?.trim() || 'Council Chatroom';
      if (payload.history && payload.history.length > 0) {
        loadHistory(payload.history);
      } else {
        clearMessages();
      }
    } else if (payload.type === 'members_updated') {
      setCouncilMembers(Array.isArray(payload.councilMembers) ? payload.councilMembers : []);
      renderMirrorContent();
      if (mentionQuery != null) {
        refreshMentionResults();
      }
    } else if (payload.type === 'generation_started') {
      isGenerating = true;
      genButton.disabled = true;
      genButton.style.opacity = '0.5';
      clearRetryFlags(false);
      currentGenerationRetryCandidateIndex = pendingUserRetryCandidateIndex;
      setTypingPlaceholder(null, true, true);
    } else if (payload.type === 'typing_status') {
      setTypingPlaceholder(payload.speakerName || null, Boolean(payload.speakerName), isStickToBottom);
    } else if (payload.type === 'generation_ended') {
      isGenerating = false;
      genButton.disabled = false;
      genButton.style.opacity = '1';
      setTypingPlaceholder(null, false, false);
      const retryIndex = currentGenerationRetryCandidateIndex ?? pendingUserRetryCandidateIndex;
      if (payload.failed && (payload.responseCount ?? 0) === 0 && retryIndex != null) {
        setRetryFlag(retryIndex);
      } else {
        clearRetryFlags(false);
      }
      currentGenerationRetryCandidateIndex = null;
    } else if (payload.type === 'new_message') {
      if (payload.isUser && payload.clientMessageId) {
        reconcileUserMessage(
          payload.clientMessageId,
          payload.name,
          payload.username || payload.name,
          payload.content,
          payload.avatarUrl,
        );
      } else {
        appendMessage(payload.name, payload.username || payload.name, payload.content, payload.avatarUrl, payload.isUser);
      }
    } else if (payload.type === 'error') {
      appendMessage('System', 'System', `Error: ${payload.message}`, null);
    }
  });

  ctx.sendToBackend({ type: 'load_settings' });

  return () => {
    if (autoTimer) clearTimeout(autoTimer);
    if (widgetVisibilityTimer != null) window.clearTimeout(widgetVisibilityTimer);
    if (themeSyncRaf != null) cancelAnimationFrame(themeSyncRaf);
    window.removeEventListener('pointerdown', onWindowPointerDown, true);
    window.removeEventListener('popstate', syncRouteVisibility);
    window.removeEventListener('hashchange', syncRouteVisibility);
    window.history.pushState = originalPushState;
    window.history.replaceState = originalReplaceState;
    rootThemeObserver.disconnect();
    shellResizeObserver.disconnect();
    destroyVirtualizer();
    unsubBackend();
    unsubKeyboard();
    for (const handle of [
      chatroomNameInput,
      connectionSelect,
      personaSelect,
      triggerModeSelect,
      messageIntervalInput,
      randomToggleCheckbox,
      intervalMinInput,
      intervalMaxInput,
      messageCountInput,
      randomMessageCountCheckbox,
      messageCountMinInput,
      messageCountMaxInput,
      contextInput,
      maxContextTokensInput,
      temperatureInput,
      topPInput,
      topKEnabledCheckbox,
      topKInput,
      maxResponseTokensInput,
      autoToggle,
    ]) {
      handle.destroy();
    }
    widget.destroy();
    tab.destroy();
    ctx.dom.cleanup();
  };
}
