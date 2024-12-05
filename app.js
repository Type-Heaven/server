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
let wordOffset = 1;
// (async () => {
//   question = await generateQuestion();
//   wordsQuestion = question.split(" ");
// })();

// (async () => {
//     // Start game
//     if (!question) {
//         question = await generateQuestion();
//         wordsQuestion = question.split(" ");
//     }
// })();

async function initializeGame() {
    // console.log("init question");
    if (!question) {
        // console.log("generate question");

        question = await generateQuestion();
        // console.log("question", question);

        wordsQuestion = question.split(" ").filter((word) => word !== "");
    }
}

io.on("connection", async (socket) => {
    console.log("user connected");

    //add player name
    socket.on("player/name", async (args) => {
        players.push({
            name: args.name,
            point: 0,
            wordOffset: 1,
        });
        console.log("player added", args);
        // question = await generateQuestion();
        // wordsQuestion = question.split(" ");
        // console.log(question);

        await initializeGame();
        //generate question
        io.emit("question", { question });
        io.emit("wordQuestion", { word: wordsQuestion[0], offset: 1 });

        //show player & player score
        io.emit("player", { players });
    });

    //players chat
    ChatController.handlerConnection(io, socket);

    //get player answer
    socket.on("player/answer", (args) => {
        console.log("answer :", args);
        const answer = args.answer;

        const player = players.find((player) => player.name === args.name);
        console.log("current player", player);
        console.log("list players", players);
        console.log("offset", player.wordOffset);
        //check player answer
        if (player && player.wordOffset < wordsQuestion.length) {
            if (answer) {
                player.point += SocketScoreController.score(
                    wordsQuestion[player.wordOffset - 1],
                    answer,
                    wordsQuestion.length
                );
            }
            player.wordOffset++;

            if (player && player.wordOffset < wordsQuestion.length) {
                io.emit("wordQuestion", {
                    word: wordsQuestion[player.wordOffset],
                    offset: player.wordOffset,
                });
            } else {
                io.emit("wordQuestion", {
                    word: "Game is Done",
                    offset: player.wordOffset,
                });
            }
            io.emit("player", { players });
        }

        //   io.emit("wordQuestion", {
        //     word: wordsQuestion[wordOffset - 1],
        //     offset: wordOffset,
        //   });
        //   io.emit("player", { players });
        // } else {
        //   io.emit("wordQuestion", {
        //     word: "Game is Done",
        //     offset: wordOffset,
        //   });
        // }
    });
    socket.on("logout", () => {
        console.log("user logout");
        //reset offset and question
        players = [
            {
                name: "test_user",
                point: 100,
            },
        ];
        wordOffset = 1;
        question = "";
        wordsQuestion = [];
    });
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});

server.listen(3000, () => {
    console.log("server running at http://localhost:3000");
});
