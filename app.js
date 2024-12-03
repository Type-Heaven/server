const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const SocketScoreController = require("./controllers/SocketScoreController");
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let players = [
  {
    name: "test_user",
    point: 100,
  },
];

const question = "Kabar";

io.on("connection", (socket) => {
  //show player & player score
  io.emit("player/points", { players });
  io.emit("question", { question });

  //change player name
  socket.on("player/name", (args) => {
    // console.log(args.name, "this args");
    players.push({
      name: args.name,
      point: 0,
    });
    // console.log("current user : ", players);
  });
  console.log("user connected");

  //get player answer
  socket.on("player/answer", (args) => {
    console.log("answer :", args.answer);
    const answer = args.answer;
    //check player answer
    // players[0].point += 100;
    players[0].point += SocketScoreController.score(question, answer);
    io.emit("player/points", { players });
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});

// const ScoreController = require("./controllers/ScoreController");

// app.use(express.urlencoded({ extended: false }));
// app.use(express.json());

// app.get("/", (req, res) => {
//   res.send("<h1>Hello world</h1>");
// });

// // Endpoint untuk menghitung skor
// app.post("/calculate-score", ScoreController.score);

// // Start server
// const PORT = 3001;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
