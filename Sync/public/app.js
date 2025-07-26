const socket = io();

const form = document.getElementById("form");
const input = document.getElementById("input");
const roomInput = document.getElementById("roomInput");
const joinBtn = document.getElementById("joinBtn");
const roomTabs = document.getElementById("roomTabs");
const roomsMessagesContainer = document.getElementById("roomsMessagesContainer");

// Store joined rooms and their messages
const joinedRooms = new Set();
const roomsMessages = {}; // roomName -> array of messages
let currentRoom = null;

// Function to create a tab for a room
function createRoomTab(room) {
  const tab = document.createElement("div");
  tab.classList.add("room-tab");
  tab.textContent = room;
  tab.dataset.room = room;

  tab.addEventListener("click", () => {
    switchRoom(room);
  });

  roomTabs.appendChild(tab);
}

// Function to create message list container per room
function createRoomMessagesContainer(room) {
  const ul = document.createElement("ul");
  ul.classList.add("room-messages");
  ul.id = `messages-${room}`;
  roomsMessagesContainer.appendChild(ul);
}

// Switch the UI to show messages for selected room
function switchRoom(room) {
  currentRoom = room;

  // Update active tab
  [...roomTabs.children].forEach(tab => {
    tab.classList.toggle("active", tab.dataset.room === room);
  });

  // Show the right message list, hide others
  [...roomsMessagesContainer.children].forEach(ul => {
    ul.classList.toggle("active", ul.id === `messages-${room}`);
  });

  input.focus();
}

// Add message to room UI and history
function addMessage(room, sender, message) {
  if (!roomsMessages[room]) roomsMessages[room] = [];
  roomsMessages[room].push({ sender, message });

  const ul = document.getElementById(`messages-${room}`);
  if (!ul) return;

  const li = document.createElement("li");
  li.textContent = `${sender}: ${message}`;
  ul.appendChild(li);

  // Scroll to bottom of message list
  ul.scrollTop = ul.scrollHeight;
}

// Join a room
joinBtn.addEventListener("click", () => {
  const room = roomInput.value.trim();
  if (!room) return;

  if (joinedRooms.has(room)) {
    alert(`Already joined room: ${room}`);
    switchRoom(room);
    roomInput.value = "";
    return;
  }

  socket.emit("joinRoom", room);
  joinedRooms.add(room);
  createRoomTab(room);
  createRoomMessagesContainer(room);

  // Switch to new room's tab
  switchRoom(room);

  alert(`Joined room: ${room}`);
  roomInput.value = "";
});

// Send message
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentRoom) {
    alert("Please join and select a room first.");
    return;
  }
  const message = input.value.trim();
  if (!message) return;

  socket.emit("chatMessage", { room: currentRoom, message });
  addMessage(currentRoom, "Me", message);

  input.value = "";
});

// Receive message from server
socket.on("chatMessage", (data) => {
  // data: {room, sender, message}
  if (!roomsMessages[data.room]) {
    // If we get a message from a room we haven't joined UI for, create UI
    joinedRooms.add(data.room);
    createRoomTab(data.room);
    createRoomMessagesContainer(data.room);
  }

  addMessage(data.room, data.sender, data.message);

  // Optional: if not current room, show a notification badge etc (not added here)
});
