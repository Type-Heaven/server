module.exports = class SocketScoreController {
  static score(target, userInput) {
    try {
      // 1. Hitung Akurasi
      let correctChars = 0;
      for (let i = 0; i < Math.min(target.length, userInput.length); i++) {
        if (target[i] === userInput[i]) {
          correctChars++;
        }
      }
      const accuracy = (correctChars / target.length) * 100;
      console.log(accuracy, "accuracy");
      // 2. Kirimkan akurasi
      return accuracy;
    } catch (error) {
      console.log("🚀 ~ SocketScoreController ~ score ~ error:", error);
    }
  }
};
