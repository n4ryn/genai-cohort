import { Agent, run, tool } from "@openai/agents";
import "dotenv/config";
import { z } from "zod";
import { RECOMMENDED_PROMPT_PREFIX } from "@openai/agents-core/extensions";

const getCurrentTime = tool({
  name: "get_current_time",
  description: "This tool returns the current time",
  parameters: z.object({}),
  async execute() {
    return new Date().toString();
  },
});

const getMenuTool = tool({
  name: "get_menu",
  description: "Fetches and return the menu items",
  parameters: z.object({}),
  async execute() {
    return {
      Drinks: {
        Chai: "INR 50",
        Coffee: "INR 70",
      },
      Veg: {
        Dosa: "INR 100",
        "Daal Makhani": "INR 120",
      },
    };
  },
});

const cookingAgent = new Agent({
  name: "Cooking Agent",
  model: "gpt-4.1-mini",
  tools: [getCurrentTime, getMenuTool],
  instructions: `You're a helpful cooking assistant who is specialized in cooking food.
    You help the users with food options and recipes and help them cook food`,
});

const codingAgent = new Agent({
  name: "Coding Agent",
  model: "gpt-4.1-mini",
  instructions: `You are an expert coding assistant particularly in JavaScript.`,
});

const gatewayAgent = Agent.create({
  name: "Gateway Agent",
  model: "gpt-4.1-mini",
  instructions: RECOMMENDED_PROMPT_PREFIX,
  handoffs: [codingAgent, cookingAgent],
});

async function chatWithAgent(query) {
  const response = await run(gatewayAgent, query);
  console.log("history: ", response.history);
  console.log("Handoff: ", response.lastAgent.name);
  console.log("finalOutput: ", response.finalOutput);
}

chatWithAgent("How much is the Chai?");
