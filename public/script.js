const socket = io();
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let drawing = false;
let userColor = "#000";
let prevX = 0;
let prevY = 0;

// canvas size
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.6;

// update user color when assigned by the server
socket.on("assign_color", (color) => {
  userColor = color;
  document.getElementById("color-display").style.backgroundColor = userColor;
});

// drawing function
function startDrawing(e) {
  drawing = true;
  prevX = e.clientX - canvas.offsetLeft;
  prevY = e.clientY - canvas.offsetTop;
}

function draw(e) {
  if (!drawing) return;

  let currentX = e.clientX - canvas.offsetLeft;
  let currentY = e.clientY - canvas.offsetTop;

  // draw on canvas
  ctx.strokeStyle = userColor;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(prevX, prevY);
  ctx.lineTo(currentX, currentY);
  ctx.stroke();

  // send drawing data to server
  socket.emit("drawing", {
    prevX,
    prevY,
    currentX,
    currentY,
    color: userColor,
  });

  prevX = currentX;
  prevY = currentY;
}

function stopDrawing() {
  drawing = false;
}

// mouse events
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseleave", stopDrawing);

// touch events for mobile devices
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  startDrawing(e.touches[0]);
});
canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  draw(e.touches[0]);
});
canvas.addEventListener("touchend", (e) => {
  e.preventDefault();
  stopDrawing();
});

// receive drawing data from server
socket.on("drawing", (data) => {
  ctx.strokeStyle = data.color;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(data.prevX, data.prevY);
  ctx.lineTo(data.currentX, data.currentY);
  ctx.stroke();
});

// clear canvas
document.getElementById("clear-btn").addEventListener("click", () => {
  socket.emit("clear_canvas");
  clearCanvas();
});

socket.on("clear_canvas", () => {
  clearCanvas();
});

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
