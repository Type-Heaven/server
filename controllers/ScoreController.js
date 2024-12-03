module.exports = class ScoreController {
    static async score(req, res) {
        try {
            const { target, userInput, startTime, endTime } = req.body;

            // ! Validasi input
            if (!target || !userInput || !startTime || !endTime) {
                return res.status(400).json({ error: "Invalid input data" });
            }

            // 1. Hitung Akurasi
            let correctChars = 0;
            for (
                let i = 0;
                i < Math.min(target.length, userInput.length);
                i++
            ) {
                if (target[i] === userInput[i]) {
                    correctChars++;
                }
            }
            const accuracy = (correctChars / target.length) * 100;

            // 2. Hitung Kecepatan (Words Per Minute)
            const timeTaken = endTime - startTime; // waktu dalam detik
            const wpm = userInput.split(" ").length / (timeTaken / 60); // kata per menit

            // 3. Skor Berbasis Akurasi dan Kecepatan
            const maxPoints = 100; // Skor maksimal
            const accuracyScore = (accuracy / 100) * (maxPoints * 0.6); // 60% bobot dari akurasi
            const speedScore = Math.min(wpm, 100) * ((maxPoints * 0.4) / 100); // 40% bobot dari kecepatan
            const totalScore = accuracyScore + speedScore;

            // 4. Kirimkan hasil
            return res.status(200).json({
                accuracy: accuracy.toFixed(2),
                wordsPerMinute: wpm.toFixed(2),
                totalScore: totalScore.toFixed(2),
            });
        } catch (error) {
            console.error("🚀 ~ ScoreController ~ score ~ error:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
};
