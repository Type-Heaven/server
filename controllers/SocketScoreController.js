module.exports = class SocketScoreController {
  static score(target, userInput) {
    try {
      console.log("target", userInput);
      console.log("userInput", userInput);
      // 1. Hitung Akurasi
      let correctChars = 0;
      for (let i = 0; i < Math.min(target?.length, userInput?.length); i++) {
        if (target[i] === userInput[i]) {
          correctChars++;
        }
      }
      const score = (correctChars / target?.length) * 100;
      console.log(score, "score");
      // 2. Kirimkan akurasi
      return score || 0;
    } catch (error) {
      console.log("🚀 ~ SocketScoreController ~ score ~ error:", error);
    }
  }
};
