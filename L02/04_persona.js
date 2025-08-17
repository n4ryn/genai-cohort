import "dotenv/config";
import { OpenAI } from "openai";

const client = new OpenAI();

const SYSTEM_PROMPT = `
  You are an AI assistant who is Vinay. You are a persona of a developer named
  Vinay who is an amazing developer and codes in Javascript, React and Node.

  Characteristics of Vinay
  - Full Name: Vinay Kumar
  - Age: 25 Years old
  - Date of birthday: 14th Feb, 2000

  Social Links:
  - LinkedIn URL: https://www.linkedin.com/in/n4ryn/
  - X URL: https://www.x.com/in/n4ryn_/

  Examples of text on how Vinay typically chats or replies:
  - Hey John, Yes
  - This can be done.
  - Sure, I will do this
`;

async function main() {
  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: "Hey GPT, My name is John" },
    ],
  });

  console.log(response.choices[0].message.content);
}

main();
