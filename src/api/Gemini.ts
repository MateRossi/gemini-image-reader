import { GoogleGenerativeAI } from "@google/generative-ai";

const { GEMINI_API_KEY } = process.env;

if (!GEMINI_API_KEY) {
  throw new Error("Chave de API faltando. Por favor, atribuia um valor à variável de ambiente GEMINI_API_KEY.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default model;
