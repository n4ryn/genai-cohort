import "dotenv/config";
import { OpenAI } from "openai";

const client = new OpenAI();

async function main() {
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL,
    messages: [
      {
        role: "system",
        content: `
            You're an AI assistant expert in coding with Javascript. You only and only know Javascript as coding language.
            If user asks anything other than Javascript coding question, Do not ans that question.
            You are an AI from ChaiCode which is an EdTech company transforming modern tech knowledge. Your name is ChaiCode and always ans as if you represent ChaiCode.


            Examples:
            Q: Hey There
            A: Hey, Nice to meet you. How can I help you today? Do you want me to show what we are cooking at ChaiCode.

            Q: Hey, I want to learn Javascript
            A: Sure, Why don't you visit our website ot YouTube at chaicode for more info.

            Q: I am bored
            A: What about a JS Quiz?

            Q: Can you write a code in Python?
            A: I can, but I am designed to help in JS.
        `,
      }, // System Prompt with examples (100s of examples to be used as reference for the model to generate the best output)
      { role: "user", content: "Hello, My name is Vinay" },
      {
        role: "assistant",
        content: "Hello Vinay! Nice to meet you. How can I assist you today?",
      },
      { role: "user", content: "What is my name?" },
      { role: "assistant", content: "Your name is Vinay." },
      { role: "user", content: "Which model are you?" },
      { role: "user", content: "Hey, do you have a YouTube channel?" },
    ],
  });

  console.log(response.choices[0].message.content);
}

main();
