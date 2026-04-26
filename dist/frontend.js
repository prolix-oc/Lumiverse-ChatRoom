// src/frontend.ts
function setup(ctx) {
  const tab = ctx.ui.registerDrawerTab({
    id: "chatroom_settings",
    title: "Council Chatroom",
    shortName: "Chatroom",
    description: "Configure the Council Chatroom overlay",
    iconSvg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`
  });
  const settingsContainer = document.createElement("div");
  settingsContainer.style.padding = "16px";
  settingsContainer.style.color = "var(--lumiverse-text)";
  settingsContainer.style.display = "flex";
  settingsContainer.style.flexDirection = "column";
  settingsContainer.style.gap = "20px";
  const titleEl = document.createElement("h3");
  titleEl.textContent = "Council Chatroom Overlay";
  titleEl.style.marginTop = "0";
  titleEl.style.marginBottom = "0px";
  titleEl.style.fontSize = "16px";
  settingsContainer.appendChild(titleEl);
  const descEl = document.createElement("p");
  descEl.textContent = "The Council Chatroom overlay appears automatically. You can toggle the floating widget visibility here or use the controls below.";
  descEl.style.fontSize = "13px";
  descEl.style.color = "var(--lumiverse-text-muted)";
  descEl.style.margin = "0";
  descEl.style.lineHeight = "1.4";
  settingsContainer.appendChild(descEl);
  function makeInteractive(el) {
    const stop = (e) => e.stopPropagation();
    el.addEventListener("mousedown", stop, true);
    el.addEventListener("mousedown", stop, false);
    el.addEventListener("touchstart", stop, { passive: true, capture: true });
    el.addEventListener("touchstart", stop, { passive: true, capture: false });
    el.addEventListener("pointerdown", stop, true);
    el.addEventListener("pointerdown", stop, false);
    el.addEventListener("click", stop, true);
    el.addEventListener("click", stop, false);
    el.addEventListener("keydown", stop, true);
    el.addEventListener("keydown", stop, false);
  }
  const toggleBtn = document.createElement("button");
  makeInteractive(toggleBtn);
  toggleBtn.textContent = "Toggle Overlay Visibility";
  toggleBtn.style.padding = "8px 12px";
  toggleBtn.style.background = "var(--lumiverse-fill-subtle)";
  toggleBtn.style.color = "var(--lumiverse-text)";
  toggleBtn.style.border = "1px solid var(--lumiverse-border)";
  toggleBtn.style.borderRadius = "var(--lumiverse-radius)";
  toggleBtn.style.cursor = "pointer";
  toggleBtn.style.fontSize = "13px";
  toggleBtn.addEventListener("click", () => {
    widget.setVisible(!widget.isVisible());
  });
  settingsContainer.appendChild(toggleBtn);
  const configSection = document.createElement("div");
  configSection.style.display = "flex";
  configSection.style.flexDirection = "column";
  configSection.style.gap = "12px";
  configSection.style.borderTop = "1px solid var(--lumiverse-border)";
  configSection.style.paddingTop = "16px";
  const configTitle = document.createElement("h4");
  configTitle.textContent = "Chatroom Configuration";
  configTitle.style.margin = "0";
  configTitle.style.fontSize = "14px";
  configSection.appendChild(configTitle);
  const connectionRow = document.createElement("div");
  connectionRow.style.display = "flex";
  connectionRow.style.flexDirection = "column";
  connectionRow.style.gap = "4px";
  const connectionLabel = document.createElement("label");
  connectionLabel.textContent = "Generation Connection Profile";
  connectionLabel.style.fontSize = "13px";
  connectionLabel.style.fontWeight = "500";
  connectionRow.appendChild(connectionLabel);
  const connectionSelect = document.createElement("select");
  makeInteractive(connectionSelect);
  connectionSelect.style.padding = "6px";
  connectionSelect.style.border = "1px solid var(--lumiverse-border)";
  connectionSelect.style.borderRadius = "var(--lumiverse-radius)";
  connectionSelect.style.background = "var(--lumiverse-fill)";
  connectionSelect.style.color = "var(--lumiverse-text)";
  connectionSelect.style.fontSize = "13px";
  connectionSelect.style.outline = "none";
  connectionRow.appendChild(connectionSelect);
  configSection.appendChild(connectionRow);
  const intervalRow = document.createElement("div");
  intervalRow.style.display = "flex";
  intervalRow.style.flexDirection = "column";
  intervalRow.style.gap = "4px";
  const intervalLabel = document.createElement("label");
  intervalLabel.textContent = "Auto-reply Interval Range (seconds)";
  intervalLabel.style.fontSize = "13px";
  intervalLabel.style.fontWeight = "500";
  intervalRow.appendChild(intervalLabel);
  const intervalInputs = document.createElement("div");
  intervalInputs.style.display = "flex";
  intervalInputs.style.gap = "8px";
  intervalInputs.style.alignItems = "center";
  const intervalMinInput = document.createElement("input");
  makeInteractive(intervalMinInput);
  intervalMinInput.type = "number";
  intervalMinInput.min = "1";
  intervalMinInput.max = "60";
  intervalMinInput.value = "5";
  intervalMinInput.style.width = "60px";
  intervalMinInput.style.padding = "6px";
  intervalMinInput.style.border = "1px solid var(--lumiverse-border)";
  intervalMinInput.style.borderRadius = "var(--lumiverse-radius)";
  intervalMinInput.style.background = "var(--lumiverse-fill)";
  intervalMinInput.style.color = "var(--lumiverse-text)";
  const intervalMaxInput = document.createElement("input");
  makeInteractive(intervalMaxInput);
  intervalMaxInput.type = "number";
  intervalMaxInput.min = "1";
  intervalMaxInput.max = "120";
  intervalMaxInput.value = "15";
  intervalMaxInput.style.width = "60px";
  intervalMaxInput.style.padding = "6px";
  intervalMaxInput.style.border = "1px solid var(--lumiverse-border)";
  intervalMaxInput.style.borderRadius = "var(--lumiverse-radius)";
  intervalMaxInput.style.background = "var(--lumiverse-fill)";
  intervalMaxInput.style.color = "var(--lumiverse-text)";
  intervalInputs.appendChild(intervalMinInput);
  intervalInputs.appendChild(document.createTextNode("to"));
  intervalInputs.appendChild(intervalMaxInput);
  intervalRow.appendChild(intervalInputs);
  configSection.appendChild(intervalRow);
  const contextRow = document.createElement("div");
  contextRow.style.display = "flex";
  contextRow.style.flexDirection = "column";
  contextRow.style.gap = "4px";
  const contextLabel = document.createElement("label");
  contextLabel.textContent = "Context Retrieval (number of messages)";
  contextLabel.style.fontSize = "13px";
  contextLabel.style.fontWeight = "500";
  contextRow.appendChild(contextLabel);
  const contextInput = document.createElement("input");
  makeInteractive(contextInput);
  contextInput.type = "number";
  contextInput.min = "1";
  contextInput.max = "50";
  contextInput.value = "10";
  contextInput.style.width = "80px";
  contextInput.style.padding = "6px";
  contextInput.style.border = "1px solid var(--lumiverse-border)";
  contextInput.style.borderRadius = "var(--lumiverse-radius)";
  contextInput.style.background = "var(--lumiverse-fill)";
  contextInput.style.color = "var(--lumiverse-text)";
  contextRow.appendChild(contextInput);
  configSection.appendChild(contextRow);
  const saveBtn = document.createElement("button");
  makeInteractive(saveBtn);
  saveBtn.textContent = "Save Configuration";
  saveBtn.style.padding = "8px 12px";
  saveBtn.style.background = "var(--lumiverse-primary)";
  saveBtn.style.color = "white";
  saveBtn.style.border = "none";
  saveBtn.style.borderRadius = "var(--lumiverse-radius)";
  saveBtn.style.cursor = "pointer";
  saveBtn.style.fontSize = "13px";
  saveBtn.style.fontWeight = "500";
  saveBtn.style.alignSelf = "flex-start";
  saveBtn.style.marginTop = "8px";
  saveBtn.addEventListener("click", () => {
    ctx.sendToBackend({
      type: "save_settings",
      intervalMin: parseInt(intervalMinInput.value, 10),
      intervalMax: parseInt(intervalMaxInput.value, 10),
      contextLimit: parseInt(contextInput.value, 10),
      connectionId: connectionSelect.value
    });
    ctx.dom.addStyle("");
  });
  configSection.appendChild(saveBtn);
  settingsContainer.appendChild(configSection);
  tab.root.appendChild(settingsContainer);
  const widget = ctx.ui.createFloatWidget({
    width: 340,
    height: 480,
    initialPosition: { x: window.innerWidth - 360, y: window.innerHeight - 500 },
    snapToEdge: true,
    tooltip: "Council Chatroom",
    chromeless: false
  });
  widget.root.style.display = "flex";
  widget.root.style.flexDirection = "column";
  widget.root.style.height = "100%";
  widget.root.style.background = "var(--lumiverse-bg)";
  widget.root.style.color = "var(--lumiverse-text)";
  widget.root.style.overflow = "hidden";
  const header = document.createElement("div");
  header.style.padding = "10px 14px";
  header.style.background = "var(--lumiverse-fill-subtle)";
  header.style.borderBottom = "1px solid var(--lumiverse-border)";
  header.style.fontWeight = "600";
  header.style.fontSize = "13px";
  header.style.display = "flex";
  header.style.alignItems = "center";
  header.style.gap = "8px";
  const headerIcon = document.createElement("div");
  headerIcon.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
  headerIcon.style.display = "flex";
  headerIcon.style.color = "var(--lumiverse-primary)";
  const headerText = document.createElement("span");
  headerText.textContent = "Council Chatroom";
  headerText.style.color = "var(--lumiverse-text)";
  header.appendChild(headerIcon);
  header.appendChild(headerText);
  widget.root.appendChild(header);
  const messageList = document.createElement("div");
  messageList.style.flex = "1";
  messageList.style.overflowY = "auto";
  messageList.style.padding = "12px";
  messageList.style.display = "flex";
  messageList.style.flexDirection = "column";
  messageList.style.gap = "14px";
  widget.root.appendChild(messageList);
  ctx.dom.addStyle(`
    @keyframes spin { 100% { transform: rotate(360deg); } }
  `);
  const loadingIndicator = document.createElement("div");
  loadingIndicator.style.display = "none";
  loadingIndicator.style.padding = "8px 12px";
  loadingIndicator.style.fontSize = "12px";
  loadingIndicator.style.color = "var(--lumiverse-text-dim)";
  loadingIndicator.style.fontStyle = "italic";
  loadingIndicator.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 2s linear infinite;">
        <line x1="12" y1="2" x2="12" y2="6"></line>
        <line x1="12" y1="18" x2="12" y2="22"></line>
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
        <line x1="2" y1="12" x2="6" y2="12"></line>
        <line x1="18" y1="12" x2="22" y2="12"></line>
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
      </svg>
      Council is typing...
    </div>
  `;
  messageList.appendChild(loadingIndicator);
  const controls = document.createElement("div");
  controls.style.padding = "10px 12px";
  controls.style.borderTop = "1px solid var(--lumiverse-border)";
  controls.style.background = "var(--lumiverse-bg)";
  controls.style.display = "flex";
  controls.style.flexDirection = "column";
  controls.style.gap = "8px";
  const inputRow = document.createElement("div");
  inputRow.style.display = "flex";
  inputRow.style.gap = "8px";
  const inputField = document.createElement("input");
  makeInteractive(inputField);
  inputField.type = "text";
  inputField.placeholder = "Type a message...";
  inputField.style.flex = "1";
  inputField.style.padding = "8px 12px";
  inputField.style.border = "1px solid var(--lumiverse-border)";
  inputField.style.borderRadius = "16px";
  inputField.style.background = "var(--lumiverse-fill-subtle)";
  inputField.style.color = "var(--lumiverse-text)";
  inputField.style.fontSize = "13px";
  inputField.style.outline = "none";
  inputField.style.userSelect = "text";
  inputField.style.pointerEvents = "auto";
  inputField.addEventListener("pointerdown", () => inputField.focus());
  const sendButton = document.createElement("button");
  makeInteractive(sendButton);
  sendButton.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
  sendButton.style.display = "flex";
  sendButton.style.alignItems = "center";
  sendButton.style.justifyContent = "center";
  sendButton.style.width = "32px";
  sendButton.style.height = "32px";
  sendButton.style.borderRadius = "50%";
  sendButton.style.background = "var(--lumiverse-primary)";
  sendButton.style.color = "white";
  sendButton.style.border = "none";
  sendButton.style.cursor = "pointer";
  sendButton.style.flexShrink = "0";
  sendButton.style.transition = "opacity 0.2s";
  sendButton.addEventListener("mouseenter", () => sendButton.style.opacity = "0.9");
  sendButton.addEventListener("mouseleave", () => sendButton.style.opacity = "1");
  let autoTimer = null;
  let intervalMin = 5;
  let intervalMax = 15;
  let isGenerating = false;
  const toolsRow = document.createElement("div");
  toolsRow.style.display = "flex";
  toolsRow.style.justifyContent = "space-between";
  toolsRow.style.alignItems = "center";
  toolsRow.style.marginTop = "4px";
  const autoToggleLabel = document.createElement("label");
  makeInteractive(autoToggleLabel);
  autoToggleLabel.style.display = "flex";
  autoToggleLabel.style.gap = "6px";
  autoToggleLabel.style.fontSize = "12px";
  autoToggleLabel.style.color = "var(--lumiverse-text-dim)";
  autoToggleLabel.style.alignItems = "center";
  autoToggleLabel.style.cursor = "pointer";
  autoToggleLabel.style.userSelect = "none";
  const autoToggle = document.createElement("input");
  autoToggle.type = "checkbox";
  autoToggleLabel.appendChild(autoToggle);
  autoToggleLabel.appendChild(document.createTextNode("Auto-reply interval"));
  const genButton = document.createElement("button");
  makeInteractive(genButton);
  genButton.textContent = "Generate";
  genButton.style.padding = "4px 10px";
  genButton.style.borderRadius = "var(--lumiverse-radius)";
  genButton.style.background = "var(--lumiverse-fill-subtle)";
  genButton.style.color = "var(--lumiverse-text)";
  genButton.style.border = "1px solid var(--lumiverse-border)";
  genButton.style.fontSize = "11px";
  genButton.style.fontWeight = "500";
  genButton.style.cursor = "pointer";
  genButton.style.transition = "background 0.2s";
  genButton.addEventListener("mouseenter", () => genButton.style.background = "var(--lumiverse-fill-hover)");
  genButton.addEventListener("mouseleave", () => genButton.style.background = "var(--lumiverse-fill-subtle)");
  autoToggle.addEventListener("change", (e) => {
    if (autoToggle.checked) {
      const scheduleNext = () => {
        const nextMs = intervalMin * 1000 + Math.random() * ((intervalMax - intervalMin) * 1000);
        autoTimer = setTimeout(() => {
          if (!isGenerating) {
            ctx.sendToBackend({ type: "trigger_generation" });
          }
          scheduleNext();
        }, nextMs);
      };
      scheduleNext();
    } else {
      if (autoTimer)
        clearTimeout(autoTimer);
    }
  });
  const sendMessage = () => {
    if (isGenerating)
      return;
    const text = inputField.value.trim();
    if (!text)
      return;
    inputField.value = "";
    ctx.sendToBackend({ type: "user_message", content: text });
  };
  sendButton.addEventListener("click", sendMessage);
  inputField.addEventListener("keydown", (e) => {
    if (e.key === "Enter")
      sendMessage();
  });
  genButton.addEventListener("click", () => {
    if (isGenerating)
      return;
    ctx.sendToBackend({ type: "trigger_generation" });
  });
  inputRow.appendChild(inputField);
  inputRow.appendChild(sendButton);
  controls.appendChild(inputRow);
  toolsRow.appendChild(autoToggleLabel);
  toolsRow.appendChild(genButton);
  controls.appendChild(toolsRow);
  widget.root.appendChild(controls);
  function appendMessage(name, username, content, avatarUrl, isUser = false) {
    const msgEl = document.createElement("div");
    msgEl.style.display = "flex";
    msgEl.style.gap = "10px";
    msgEl.style.alignItems = "flex-start";
    if (isUser) {
      msgEl.style.flexDirection = "row-reverse";
    }
    if (avatarUrl) {
      const img = document.createElement("img");
      img.src = avatarUrl;
      img.style.width = "30px";
      img.style.height = "30px";
      img.style.borderRadius = "var(--lumiverse-radius, 6px)";
      img.style.objectFit = "cover";
      img.style.flexShrink = "0";
      msgEl.appendChild(img);
    } else {
      const placeholder = document.createElement("div");
      placeholder.style.width = "30px";
      placeholder.style.height = "30px";
      placeholder.style.borderRadius = "var(--lumiverse-radius, 6px)";
      placeholder.style.background = isUser ? "var(--lumiverse-primary)" : "var(--lumiverse-fill-hover)";
      placeholder.style.display = "flex";
      placeholder.style.alignItems = "center";
      placeholder.style.justifyContent = "center";
      placeholder.style.flexShrink = "0";
      if (isUser) {
        placeholder.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
      }
      msgEl.appendChild(placeholder);
    }
    const contentDiv = document.createElement("div");
    contentDiv.style.flex = "1";
    contentDiv.style.minWidth = "0";
    contentDiv.style.display = "flex";
    contentDiv.style.flexDirection = "column";
    if (isUser) {
      contentDiv.style.alignItems = "flex-end";
    }
    const nameDiv = document.createElement("div");
    nameDiv.style.fontSize = "12px";
    nameDiv.style.display = "flex";
    nameDiv.style.gap = "6px";
    nameDiv.style.alignItems = "baseline";
    nameDiv.style.lineHeight = "1.2";
    nameDiv.style.marginBottom = "4px";
    const displayUsername = document.createElement("span");
    displayUsername.style.fontWeight = "600";
    displayUsername.style.color = isUser ? "var(--lumiverse-text)" : "var(--lumiverse-accent)";
    displayUsername.textContent = username;
    const realName = document.createElement("span");
    realName.style.fontSize = "10.5px";
    realName.style.color = "var(--lumiverse-text-dim)";
    realName.textContent = isUser ? "" : name;
    nameDiv.appendChild(displayUsername);
    if (!isUser && name.toLowerCase() !== username.toLowerCase()) {
      nameDiv.appendChild(realName);
    }
    contentDiv.appendChild(nameDiv);
    const textDiv = document.createElement("div");
    textDiv.style.fontSize = "13px";
    textDiv.style.lineHeight = "1.4";
    textDiv.style.color = isUser ? "white" : "var(--lumiverse-text)";
    textDiv.style.background = isUser ? "var(--lumiverse-primary)" : "transparent";
    if (isUser) {
      textDiv.style.padding = "8px 12px";
      textDiv.style.borderRadius = "16px";
      textDiv.style.borderTopRightRadius = "4px";
    }
    textDiv.style.wordBreak = "break-word";
    textDiv.textContent = content;
    contentDiv.appendChild(textDiv);
    msgEl.appendChild(contentDiv);
    messageList.insertBefore(msgEl, loadingIndicator);
    messageList.scrollTo({ top: messageList.scrollHeight, behavior: "smooth" });
  }
  const unsubBackend = ctx.onBackendMessage((payload) => {
    if (payload.type === "settings_loaded") {
      intervalMinInput.value = payload.intervalMin.toString();
      intervalMaxInput.value = payload.intervalMax.toString();
      contextInput.value = payload.contextLimit.toString();
      intervalMin = payload.intervalMin;
      intervalMax = payload.intervalMax;
      connectionSelect.innerHTML = '<option value="">Default Active Connection</option>';
      if (payload.connections) {
        for (const conn of payload.connections) {
          const opt = document.createElement("option");
          opt.value = conn.id;
          opt.textContent = `${conn.name} (${conn.provider})`;
          connectionSelect.appendChild(opt);
        }
      }
      connectionSelect.value = payload.connectionId || "";
      if (payload.history) {
        messageList.innerHTML = "";
        messageList.appendChild(loadingIndicator);
        for (const msg of payload.history) {
          appendMessage(msg.name, msg.username, msg.content, msg.avatarUrl, msg.isUser);
        }
      }
    } else if (payload.type === "generation_started") {
      isGenerating = true;
      genButton.disabled = true;
      genButton.style.opacity = "0.5";
      loadingIndicator.style.display = "block";
      messageList.appendChild(loadingIndicator);
      messageList.scrollTo({ top: messageList.scrollHeight, behavior: "smooth" });
    } else if (payload.type === "generation_ended") {
      isGenerating = false;
      genButton.disabled = false;
      genButton.style.opacity = "1";
      loadingIndicator.style.display = "none";
    } else if (payload.type === "new_message") {
      appendMessage(payload.name, payload.username || payload.name, payload.content, payload.avatarUrl, payload.isUser);
    } else if (payload.type === "error") {
      appendMessage("System", "System", `Error: ${payload.message}`, null);
    }
  });
  ctx.sendToBackend({ type: "load_settings" });
  return () => {
    if (autoTimer)
      clearTimeout(autoTimer);
    unsubBackend();
    widget.destroy();
    tab.destroy();
    ctx.dom.cleanup();
  };
}
export {
  setup
};
