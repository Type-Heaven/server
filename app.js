const express = require("express");
const app = express();

const ScoreController = require("./controllers/ScoreController");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Endpoint untuk menghitung skor
app.post("/calculate-score", ScoreController.score);

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
