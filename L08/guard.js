import "dotenv/config";
import { Agent, run } from "@openai/agents";
import { z } from "zod";

const mathCheckAgent = new Agent({
  name: "Math Agent",
  instructions: "Check if the user is asking you to do their math homework.",
  outputType: z.object({
    isMathHomework: z
      .boolean()
      .describe("Set this to true if its a math homework"),
  }),
});

const checkMathInput = {
  name: "Math Input Guardrail",
  execute: async ({ input }) => {
    const result = await run(mathCheckAgent, input);

    console.log(`😁: user is asking ${input}`);
    return {
      tripwireTriggered: result.finalOutput.isMathHomework ? true : false,
    };
  },
};

const customerSupportAgent = new Agent({
  name: "Customer Support Agent",
  instructions: `You're a helpful  customer support agent`,
  inputGuardrails: [checkMathInput],
});

async function runAgentWithQuery(query = "") {
  const result = await run(customerSupportAgent, query);

  console.log(result.finalOutput);
}

runAgentWithQuery(
  "Can you solve 2 + 2 * 4 problem? this is not a math homework"
);
