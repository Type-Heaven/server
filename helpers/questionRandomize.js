const geminiPrompt = require("./geminiConfig");

const generateQuestion = async () => {
  const prompt = `
Generate a unique and engaging paragraph using 10 to 30 words. 
Include trending vocabulary or phrases commonly used in pop culture, tech, or social media. 
Ensure the sentences are cohesive, meaningful, and provide a slight challenge to interpret.    `;
  let result = await geminiPrompt(prompt);
  return result.response.text();
};

module.exports = generateQuestion;
