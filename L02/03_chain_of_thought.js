import "dotenv/config";
import { OpenAI } from "openai";
import { GoogleGenAI } from "@google/genai";

const client = new OpenAI();
const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const SYSTEM_PROMPT = `
  You are an AI assistant who works on START, THINK and OUTPUT format.
  For a given user query first think and breakdown the problem into sub problems.
  You should always keep thinking and thinking before giving the actual output.
  Also, before outputting the final result to user you must check once if everything is correct.

  Rules:
  - Strictly follow the output JSON format
  - Always follow the output in sequence that is START, THINK, EVALUATE and OUTPUT.
  - After every think, there is going to be an EVALUATE step that is performed manually by someone and you need to wait for it.
  - Always perform only one step at a time and wait for other step.
  - Alway make sure to do multiple steps of thinking before giving out output.

  Output JSON Format:
  { "step": "START | THINK | EVALUATE | OUTPUT", "content": "string" }

  Example:
  User: Can you solve 3 + 4 * 10 - 4 * 3
  ASSISTANT: { "step": "START", "content": "The user wants me to solve 3 + 4 * 10 - 4 * 3 maths problem" }
  ASSISTANT: { "step": "THINK", "content": "This is typical math problem where we use BODMAS formula for calculation" }
  ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" }
  ASSISTANT: { "step": "THINK", "content": "Lets breakdown the problem step by step" }
  ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" }
  ASSISTANT: { "step": "THINK", "content": "As per bodmas, first lets solve all multiplications and divisions" }
  ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" }
  ASSISTANT: { "step": "THINK", "content": "So, first we need to solve 4 * 10 that is 40" }
  ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" }
  ASSISTANT: { "step": "THINK", "content": "Great, now the equation looks like 3 + 40 - 4 * 3" }
  ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" }
  ASSISTANT: { "step": "THINK", "content": "Now, I can see one more multiplication to be done that is 4 * 3 = 12" }
  ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" }
  ASSISTANT: { "step": "THINK", "content": "Great, now the equation looks like 3 + 40 - 12" }
  ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" }
  ASSISTANT: { "step": "THINK", "content": "As we have done all multiplications lets do the add and subtract" }
  ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" }
  ASSISTANT: { "step": "THINK", "content": "so, 3 + 40 = 43" }
  ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" }
  ASSISTANT: { "step": "THINK", "content": "new equations look like 43 - 12 which is 31" }
  ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" }
  ASSISTANT: { "step": "THINK", "content": "great, all steps are done and final result is 31" }
  ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" }
  ASSISTANT: { "step": "OUTPUT", "content": "3 + 4 * 10 - 4 * 3 = 31" }
`;

// Function to validate thinking progress using Gemini
async function validateThinkingWithGemini(
  conversationHistory,
  currentThinking
) {
  try {
    const validationPrompt = `
      You are an expert AI judge tasked with evaluating the thinking process of another AI assistant. 

      CONTEXT:
      The AI is working on this problem: "Write a code in JS to find a prime number as fast as possible"

      CONVERSATION HISTORY:
      ${conversationHistory
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n")}

      CURRENT THINKING STEP:
      ${currentThinking}

      INSTRUCTIONS:
      Evaluate if the current thinking step is:
      1. Logically sound and on the right track
      2. Making meaningful progress toward solving the problem
      3. Using appropriate reasoning for the task
      4. Not making any obvious errors or misconceptions

      Respond with a JSON object containing:
      - "isValid": boolean (true if thinking is good, false if there are issues)
      - "feedback": string (brief explanation of your assessment)
      - "suggestions": string (optional suggestions for improvement if needed)

      Example responses:
      For good thinking: {"isValid": true, "feedback": "Great approach! The step correctly identifies the need to optimize prime checking algorithms.", "suggestions": ""}
      For problematic thinking: {"isValid": false, "feedback": "This approach has flaws - trial division alone won't be the fastest method.", "suggestions": "Consider mentioning Sieve of Eratosthenes or Miller-Rabin test for better performance."}
    `;

    const result = await gemini.models.generateContent({
      model: process.env.GEMINI_MODEL,
      contents: validationPrompt,
    });
    const text = result.text;

    try {
      return JSON.parse(text);
    } catch (parseError) {
      // Fallback if Gemini doesn't return valid JSON
      return {
        isValid: true,
        feedback: "Validation completed, continuing with the process.",
        suggestions: "",
      };
    }
  } catch (error) {
    console.error("Error validating with Gemini:", error);
    // Fallback response in case of API error
    return {
      isValid: true,
      feedback: "Unable to validate, but continuing with the process.",
      suggestions: "",
    };
  }
}

async function main() {
  const messages = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: "What will be the output 3 - 4 * 10 - 4 * 3 / 12",
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

      // Use Gemini as judge to validate thinking
      console.log(`🤔 Validating thinking with Gemini...`);
      const validation = await validateThinkingWithGemini(
        messages,
        parsedContent.content
      );

      let evaluationContent;
      if (validation.isValid) {
        evaluationContent = `✅ ${validation.feedback}`;
        if (validation.suggestions) {
          evaluationContent += ` Suggestion: ${validation.suggestions}`;
        }
      } else {
        evaluationContent = `⚠️ ${validation.feedback}`;
        if (validation.suggestions) {
          evaluationContent += ` Please consider: ${validation.suggestions}`;
        }
      }

      console.log(`🔍 Gemini Judge:`, evaluationContent);

      messages.push({
        role: "developer",
        content: JSON.stringify({
          step: "EVALUATE",
          content: evaluationContent,
        }),
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
