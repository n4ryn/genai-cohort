import "dotenv/config";
import { OpenAI } from "openai";

const client = new OpenAI();

async function init() {
  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: "What is the meaning of life?",
    encoding_format: "float",
  });

  console.log(response.data[0]);
  console.log(response.data[0].embedding.length);
}

init();
