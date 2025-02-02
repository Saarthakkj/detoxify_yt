import { GoogleGenerativeAI } from '@google/generative-ai';
import system_prompt from "./utils.js";
import 'dotenv/config';


const gemini = process.env.GEMINI_GENERATIVE_LANGUAGE_CLIENT_API;


const genai = new GoogleGenerativeAI(
    gemini
);

const genModel = genai.getGenerativeModel({
    model : "gemini-1.5-flash" , 
    systemInstruction : system_prompt
});
const prompt = "Explain how AI works";

const result = await genModel.generateContent(prompt);
console.log(result.response.text());
