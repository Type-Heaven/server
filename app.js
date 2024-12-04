const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
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
    ChatController.handlerConnection(io, socket);
    socket.on("player/answer", (args) => {
        console.log("message :", args.message);
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

const ScoreController = require("./controllers/ScoreController");
const ChatController = require("./controllers/ChatController");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("<h1>Hello world</h1>");
});
// Endpoint untuk menghitung skor
app.post("/calculate-score", ScoreController.score);

// Start server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
