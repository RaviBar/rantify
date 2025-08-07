const { Server } = require("socket.io");

// Initialize the Socket.IO server
const io = new Server({
  cors: {
    origin: "*", // Allow all origins for simplicity. In production, restrict this to your frontend's URL.
  },
});

console.log("Starting Socket.IO server on port 3001...");

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle joining a group chat
  socket.on("join-group", (groupId) => {
    socket.join(groupId);
    console.log(`User ${socket.id} joined group ${groupId}`);
  });

  // Handle sending a message to a group
  socket.on("group-message", ({ groupId, message, username }) => {
    // Broadcast the message to all clients in the group except the sender
    socket.to(groupId).emit("group-message", { message, username });
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

io.listen(3001);