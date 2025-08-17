import axios from "axios";
import "dotenv/config";
import { OpenAI } from "openai";
import { exec } from "child_process";

const client = new OpenAI();

const SYSTEM_PROMPT = `
  You are an AI assistant who works on START, THINK and OUTPUT format.
  For a given user query first think and breakdown the problem into sub problems.
  You should always keep thinking and thinking before giving the actual output.

  Also, before outputting the final result to user you must check once if everything is correct.
  You also have list of available tools that you can call based on user query.
    
  For every tool call that you make, wait for the OBSERVATION from the tool which is the response from the tool that you called.

  Available Tools:
  - getWeatherDetailsByCityName(cityName: string): Returns the current weather data of the city.
  - getGithubUserInfoByUsername(username: string): Returns the github user info of the username.
  - executeCommand(command: string): Takes a linux / unix command as arg and executes the command on user's machine and returns the output

  Rules:
  - Strictly follow the output JSON format
  - Always follow the output in sequence that is START, THINK, OBSERVE and OUTPUT.
  - Always perform only one step at a time and wait for other step.
  - Alway make sure to do multiple steps of thinking before giving out output.
  - For every tool call always wait for the OBSERVE which contains the output from tool

  Output JSON Format:
  { "step": "START | THINK | OUTPUT | OBSERVE | TOOL" , "content": "string", "tool_name": "string", "input": "STRING" }

  Example:
  Example:
  User: Hey, can you tell me weather of Jaipur?
  ASSISTANT: { "step": "START", "content": "The user is interested in the current weather details about Jaipur" } 
  ASSISTANT: { "step": "THINK", "content": "Let me see if there is any available tool for this query" } 
  ASSISTANT: { "step": "THINK", "content": "I see that there is a tool available getWeatherDetailsByCityName which returns current weather data" } 
  ASSISTANT: { "step": "THINK", "content": "I need to call getWeatherDetailsByCityName for city jaipur to get weather details" }
  ASSISTANT: { "step": "TOOL", "input": "jaipur", "tool_name": "getWeatherDetailsByCityName" }
  DEVELOPER: { "step": "OBSERVE", "content": "The weather of jaipur is cloudy with 27 Cel" }
  ASSISTANT: { "step": "THINK", "content": "Great, I got the weather details of Jaipur" }
  ASSISTANT: { "step": "OUTPUT", "content": "The weather in Jaipur is 27 C with little cloud. Please make sure to carry an umbrella with you. ☔️" }
`;

// Agent tool to fetch weather details by city name
async function getWeatherDetailsByCityName(cityName) {
  const url = `https://wttr.in/${cityName.toLowerCase()}?format=%C+%t`;
  const { data } = await axios.get(url, { responseType: "text" });

  return `The current weather in ${cityName} is ${data}`;
}

// Agent tool to fetch github user info by username
async function getGithubUserInfoByUsername(username = "") {
  const url = `https://api.github.com/users/${username.toLowerCase()}`;
  const { data } = await axios.get(url);

  return JSON.stringify({
    login: data.login,
    id: data.id,
    name: data.name,
    location: data.location,
    twitter_username: data.twitter_username,
    public_repos: data.public_repos,
    public_gists: data.public_gists,
    user_view_type: data.user_view_type,
    followers: data.followers,
    following: data.following,
  });
}

// Agent tool to create code like cursor
const executeCommand = (cmd = "") => {
  return new Promise((res, rej) => {
    exec(cmd, (error, data) => {
      if (error) {
        return res(`Error running command ${error}`);
      } else {
        res(data);
      }
    });
  });
};

const TOOL_MAP = {
  getWeatherDetailsByCityName: getWeatherDetailsByCityName,
  getGithubUserInfoByUsername: getGithubUserInfoByUsername,
  executeCommand: executeCommand,
};

async function main() {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content:
        "Hey, commit the code to github with the message feat: l03 - intro to agents",
    },
  ];

  while (true) {
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: messages,
    });

    const rawContent = response.choices[0].message.content;
    const parsedContent = JSON.parse(rawContent);

    messages.push({
      role: "assistant",
      content: JSON.stringify(parsedContent),
    });

    if (parsedContent.step === "START") {
      console.log(`🔥`, parsedContent.content);
      continue;
    }

    if (parsedContent.step === "THINK") {
      console.log(`🧠`, parsedContent.content);
      continue;
    }

    if (parsedContent.step === "TOOL") {
      const toolToCall = parsedContent.tool_name;
      console.log("\t🛠️ >>>>", toolToCall);
      if (!TOOL_MAP[toolToCall]) {
        messages.push({
          role: "developer",
          content: `There is no such tool as ${toolToCall}`,
        });
        continue;
      }

      const responseFromTool = await TOOL_MAP[toolToCall](parsedContent.input);
      console.log(
        `🛠️: ${toolToCall}(${parsedContent.input}) = `,
        responseFromTool
      );

      messages.push({
        role: "developer",
        content: JSON.stringify({ step: "OBSERVE", content: responseFromTool }),
      });
      continue;
    }

    if (parsedContent.step === "OUTPUT") {
      console.log(`🤖`, parsedContent.content);
      break;
    }
  }

  console.log("Done...");
}

main();
