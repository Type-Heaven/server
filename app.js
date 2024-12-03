const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const app = express();
const server = createServer(app);
const io = new Server(server);

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

const players = [
  {
    name: "test_user",
    point: 100,
  },
];

io.on("connection", (socket) => {
  console.log("user connected");
  io.emit("player/points", players);
  socket.on("player/answer", (args) => {
    console.log("message :", args);
    players[0].point += 100;
    io.emit("player/points", players);
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
