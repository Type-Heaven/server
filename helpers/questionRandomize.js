const geminiPrompt = require("./geminiConfig");

const generateQuestion = async () => {
  const prompt = `
  Create a unique paragraph with 10 words to 30 word but current trending vocab but with solid and contextual sentences
    `;
  let result = await geminiPrompt(prompt);
  return result.response.text();
};

module.exports = generateQuestion;
