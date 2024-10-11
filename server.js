// server.js

const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const port = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Array of colors to assign to new users
let colors = [
  "#e6194b",
  "#3cb44b",
  "#ffe119",
  "#4363d8",
  "#f58231",
  "#911eb4",
  "#46f0f0",
  "#f032e6",
];
let userColors = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Assign a unique color to the new user
  let assignedColor = colors.shift() || getRandomColor();
  userColors[socket.id] = assignedColor;

  // Send the assigned color to the user
  socket.emit("assign_color", assignedColor);

  // Broadcast to others that a new user has joined (optional)
  // socket.broadcast.emit('user_joined', { id: socket.id, color: assignedColor });

  // Listen for drawing events
  socket.on("drawing", (data) => {
    io.emit("drawing", data);
  });

  // Listen for clear canvas events
  socket.on("clear_canvas", () => {
    io.emit("clear_canvas");
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Return the color back to the pool
    colors.push(userColors[socket.id]);
    delete userColors[socket.id];
  });
});

// Start the server
http.listen(port, "0.0.0.0", () => {
  console.log("Server is running on port", port);
});

// Function to generate a random color if colors array is exhausted
function getRandomColor() {
  let letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
