if (process.env.NODE_ENV !== "production") require("dotenv").config();
const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const SocketScoreController = require("./controllers/SocketScoreController");
const generateQuestion = require("./helpers/questionRandomize");
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
let question = "";
let wordsQuestion = [];
(async () => {
  question = await generateQuestion();
  wordsQuestion = question.split(" ");
  console.log(wordsQuestion);
})();
let wordOffset = 1; //start from 1
io.on("connection", (socket) => {
  //generate question
  io.emit("question", { question });
  io.emit("wordQuestion", { word: wordsQuestion[0], offset: wordOffset });

  //show player & player score
  io.emit("player", { players });

  //add player name
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
    if (wordOffset != wordsQuestion.length) {
      players[0].point += SocketScoreController.score(
        wordsQuestion[wordOffset - 1],
        answer
      );
      wordOffset++;
      io.emit("wordQuestion", {
        word: wordsQuestion[wordOffset - 1],
        offset: wordOffset,
      });
      io.emit("player", { players });
    } else {
      io.emit("wordQuestion", { word: "Game is Done" });
    }
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
