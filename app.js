if (process.env.NODE_ENV !== "production") require("dotenv").config();
const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const ChatController = require("./controllers/ChatController");
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
let wordOffset = 0;

let countdown = 5; // Waktu countdown 30 detik
let countdownInterval;
let gameStarted = false; // Flag untuk memeriksa apakah game sudah dimulai
let waitingPlayers = []; // Menyimpan pemain yang masih menunggu game dimulai

// Fungsi untuk memulai countdown
function startCountdown() {
  countdownInterval = setInterval(() => {
    countdown--;
    io.emit("countdown", countdown); // Kirim countdown yang tersisa ke semua pemain

    // Jika countdown selesai, mulai permainan
    if (countdown <= 0) {
      clearInterval(countdownInterval); // Menghentikan countdown
      gameStarted = true; // Set gameStarted ke true
      // io.emit("gameStarted", { gameStarted });
      startGame(); // Mulai permainan
    }
  }, 1000); // countdown setiap detik
}

// Fungsi untuk memulai permainan
async function startGame() {
  // Menghasilkan soal baru
  question = await generateQuestion();
  wordsQuestion = question.split(" ");
  wordOffset = 0;

  // Kirim soal pertama ke semua pemain
  io.emit("gameStarted");

  // Kirim soal pertama dan pembaruan pemain ke semua pemain
  io.emit("wordQuestion", { word: wordsQuestion[0], offset: wordOffset });
  io.emit("player", { players });
}

io.on("connection", (socket) => {
  console.log("user connected");

  // Menolak pemain baru jika game sudah dimulai
  if (gameStarted) {
    socket.emit("gameStarted", {
      message: "Game has already started. Please wait for the next round.",
    });
    socket.disconnect(); // Disconnect pemain yang mencoba bergabung setelah game dimulai
    return;
  }

  // Menambahkan pemain baru
  socket.on("player/name", async (args) => {
    if (gameStarted) {
      socket.emit("gameStarted", {
        message: "Game has already started. Please wait for the next round.",
      });
      socket.disconnect();
      return;
    }
    io.emit("question", { question });

    players.push({
      name: args.name,
      point: 0,
    });
    console.log("player added", args);

    // Menyimpan ID socket pemain yang bergabung
    waitingPlayers.push(socket.id);

    // Memulai countdown hanya jika pemain pertama bergabung
    if (waitingPlayers.length === 1 && !gameStarted) {
      startCountdown();
    }

    // Kirim countdown ke semua pemain
    io.emit("countdown", countdown);
  });

  // Chat player
  ChatController.handlerConnection(io, socket);

  //get player answer
  // Mendapatkan jawaban pemain
  socket.on("player/answer", (args) => {
    console.log("answer :", args);
    const answer = args.answer;

    const player = players.find((player) => player.name == args.name);
    console.log("current player", player);
    console.log("list players", players);
    console.log("offset", wordOffset);

    //check player answer

    if (wordOffset < wordsQuestion.length) {
      if (answer) {
        player.point += SocketScoreController.score(
          wordsQuestion[wordOffset],
          answer,
          wordsQuestion.length
        );
      }
      wordOffset++;
      io.emit("wordQuestion", {
        word: wordsQuestion[wordOffset],
        offset: wordOffset,
      });
      io.emit("player", { players });
    } else {
      io.emit("wordQuestion", {
        word: "Game is Done",
        offset: wordOffset,
      });
    }
  });

  // Logout player
  socket.on("logout", () => {
    console.log("user logout");
    players = [{ name: "test_user", point: 100 }];
    wordOffset = 0;
    question = "";
    wordsQuestion = [];
    gameStarted = false;
    countdown = 5; // Reset countdown
    waitingPlayers = []; // Reset pemain yang menunggu
  });

  // Disconnect player
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// Server start
server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
