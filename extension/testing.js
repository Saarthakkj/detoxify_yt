const { GoogleGenerativeAI } = require('@google/generative-ai');
const { system_prompt } = require('./utils.js');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const gemini = process.env.GEMINI_GENERATIVE_LANGUAGE_CLIENT_API;

const genai = new GoogleGenerativeAI(gemini);

const genModel = genai.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: system_prompt
});

async function main() {
    const prompt = "Explain how AI works";
    const result = await genModel.generateContent(prompt);
    console.log(result.response.text());
}

main().catch(console.error);
