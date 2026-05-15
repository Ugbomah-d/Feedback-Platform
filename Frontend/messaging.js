document.addEventListener("DOMContentLoaded", function () {
  const messageInput = document.getElementById("messageInput");
  const sendButton = document.getElementById("sendButton");
  const messagesContainer = document.querySelector(".messages");
  const contactCards = Array.from(document.querySelectorAll(".contact-card"));
  const searchInput = document.getElementById("search");
  const activeName = document.getElementById("activeName");
  const activeStatus = document.getElementById("activeStatus");
  const activeAvatar = document.getElementById("activeAvatar");
  const mobileBack = document.querySelector(".mobile-back");

  const socket = typeof io === "function" ? io() : null;

  if (socket) {
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("chat message", (message) => {
      const body = typeof message === "string" ? message : message.body;
      if (body) addMessage(body, false);
    });
  }

  function getActiveContact() {
    return document.querySelector(".contact-card.active");
  }

  function currentTime() {
    return new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function addMessage(content, isUser = true) {
    const row = document.createElement("div");
    row.className = isUser ? "message-row user" : "message-row other";

    if (!isUser) {
      const avatar = document.createElement("span");
      avatar.className = "mini-avatar";
      avatar.textContent = activeAvatar.textContent.trim() || "TM";
      row.appendChild(avatar);
    }

    const messageDiv = document.createElement("div");
    messageDiv.className = isUser
      ? "message user-message"
      : "message other-message";

    const text = document.createElement("p");
    text.textContent = content;

    const time = document.createElement("small");
    time.textContent = currentTime();

    messageDiv.appendChild(text);
    messageDiv.appendChild(time);
    row.appendChild(messageDiv);
    messagesContainer.appendChild(row);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    addMessage(message);
    socket?.emit("chat message", message);
    messageInput.value = "";
    messageInput.focus();
  }

  function selectContact(card, openMobile = true) {
    if (!card) return;

    contactCards.forEach((item) => item.classList.remove("active"));
    card.classList.add("active");

    const name = card.dataset.name || "Conversation";
    const role = card.dataset.role || "";
    const initials = card.dataset.initials || "TM";
    const online = card.dataset.online === "true";

    activeName.textContent = name;
    activeStatus.textContent = online ? "Active now" : role;
    activeAvatar.textContent = initials;
    activeAvatar.classList.toggle("online", online);
    messageInput.placeholder = `Message ${name.split(" ")[0]}...`;

    if (openMobile) {
      document.body.classList.add("show-chat");
    }
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  sendButton.addEventListener("click", sendMessage);

  messageInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  });

  contactCards.forEach((card) => {
    card.addEventListener("click", () => selectContact(card));
  });

  searchInput.addEventListener("input", function () {
    const query = searchInput.value.trim().toLowerCase();

    contactCards.forEach((card) => {
      const haystack = `${card.dataset.name || ""} ${card.textContent || ""}`.toLowerCase();
      card.classList.toggle("hidden", query && !haystack.includes(query));
    });
  });

  mobileBack.addEventListener("click", function () {
    document.body.classList.remove("show-chat");
  });

  selectContact(getActiveContact() || contactCards[0], false);
});
