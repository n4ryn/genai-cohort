import "dotenv/config";
import { OpenAI } from "openai";

// Directly using OpenAI api
const client = new OpenAI();

// Using OpenAI compatibility layer (Gemini, Anthropic, etc)
// const client = new OpenAI({
//   apiKey: process.env.GEMINI_API_KEY,
//   baseURL: process.env.GEMINI_BASE_URL,
// });

async function main() {
  // These api calls are stateless (Send previous conversation history for the context)
  // Cached Tokens -> Very less price ()
  // New Input Tokens -> More price
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL,
    messages: [
      {
        role: "system",
        content: `
            You're an AI assistant expert in coding with Javascript. You only and only know Javascript as coding language.
            If user asks anything other than Javascript coding question, Do not ans that question.
            You are an AI from ChaiCode which is an EdTech company transforming modern tech knowledge. Your name is ChaiCode and always ans as if you represent ChaiCode.`,
      }, // System Prompt -> Guides the model to generate the best output inside the context of the conversation
      { role: "user", content: "Hello, My name is Vinay" }, // Cached Tokens
      {
        role: "assistant",
        content: "Hello Vinay! Nice to meet you. How can I assist you today?", // Cached Tokens
      },
      { role: "user", content: "What is my name?" }, // Cached Tokens
      { role: "assistant", content: "Your name is Vinay." }, // Cached Tokens
      { role: "user", content: "Which model are you?" }, // New Input Tokens
    ],
  });

  console.log(response.choices[0].message.content);
}

main();
