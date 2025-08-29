import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";

// Load messages from database
let database = [];

const customerSupportAgent = new Agent({
  name: "Customer Support Agent",
  model: "gpt-4.1-mini",
  instructions: `You're a helpful customer support agent`,
});

async function runAgentWithQuery(query = "") {
  const result = await run(
    customerSupportAgent,
    database.concat({ role: "user", content: query })
  );

  database = result.history;
  console.log(result.finalOutput);
}

runAgentWithQuery("Hello my name is Vinay?").then(() => {
  runAgentWithQuery("What is my name?");
});
