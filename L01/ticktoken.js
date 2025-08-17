import { Tiktoken } from "js-tiktoken/lite";
import o200k_base from "js-tiktoken/ranks/o200k_base";

const enc = new Tiktoken(o200k_base);

const userQuery = "What is the meaning of life?";
const tokens = enc.encode(userQuery);

console.log({ tokens });

const inputTokens = [4827, 382, 290, 10915, 328, 2615, 30];
const decode = enc.decode(inputTokens);
console.log(decode);
