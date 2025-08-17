import "dotenv/config";
import { OpenAI } from "openai";

const client = new OpenAI();

async function main() {
  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: "Hello, My name is Vinay" },
      { role: "user", content: "What is my name?" },
      { role: "assistant", content: "Your name is Vinay." },
      { role: "user", content: "Which model are you?" },
    ],
  });

  console.log(response.choices[0].message.content);
}

main();
