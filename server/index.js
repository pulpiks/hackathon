// const fs = require('fs');
import express from 'express';
import 'dotenv/config'
// const OpenAI = require('openai');

const MODEL = {
    GPT_3_5: 'gpt-35-turbo',
    GPT_3_5_0301: 'gpt-3.5-turbo-0301',
    GPT_3_5_0613: 'gpt-3.5-turbo-0613',
    GPT_3_5_1106: 'gpt-3.5-turbo-1106',
    GPT_3_5_16k: 'gpt-3.5-turbo-16k',
    GPT_3_5_16k_0613: 'gpt-3.5-turbo-16k-0613',
    GPT_3_5_instruct: 'gpt-3.5-turbo-instruct',
    GPT_3_5_instruct_0914: 'gpt-3.5-turbo-instruct-0914',
    GPT_4: 'gpt-4',
    GPT_4_0613: 'gpt-4-0613',
    GPT_4_1106_preview: 'gpt-4-1106-preview',
    GPT_4_vision_preview: 'gpt-4-vision-preview'
};


// https://wep01openaiservices03.openai.azure.com/
// {
//     "messages": [
//       {
//         "role": "system",
//         "content": "You are an AI assistant that helps people find information."
//       }
//     ],
//     "temperature": 0.7,
//     "top_p": 0.95,
//     "frequency_penalty": 0,
//     "presence_penalty": 0,
//     "max_tokens": 800,
//     "stop": null
//   }

console.log(process.env.OPENAI_API_KEY, process.env.OPEN_API_ENDPOINT);

const messages = [
  { role: "system", content: "You are a helpful assistant. You will talk like a pirate." },
  { role: "user", content: "Can you help me?" },
  { role: "assistant", content: "Arrrr! Of course, me hearty! What can I do for ye?" },
  { role: "user", content: "What type of insurance can you recommend me to use in NN.nl?" },
];

const deploymentId = "gpt-35-turbo";

const app = express();
app.use(express.json());

import { OpenAIClient } from "@azure/openai";
import { AzureKeyCredential } from "@azure/core-auth";

const endpoint = process.env.OPEN_API_ENDPOINT;
const key = process.env.OPENAI_API_KEY;

async function streamMain() {
  const client = new OpenAIClient(
      endpoint,
      new AzureKeyCredential(process.env.OPENAI_API_KEY));
  
  const events = await client.streamChatCompletions(deploymentId, messages, { maxTokens: 128 });
  for await (const event of events) {
    for (const choice of event.choices) {
      const delta = choice.delta?.content;
      if (delta !== undefined) {
        console.log(`Chatbot: ${delta}`);
      }
    }
  }
}

// streamMain().catch(err => console.error('err', err))

async function main(){
  // Replace with your Azure OpenAI key
  const client = new OpenAIClient(endpoint, new AzureKeyCredential(key));

  const examplePrompts = [
    "How are you today?",
    "What is Azure OpenAI?",
    "Why do children love dinosaurs?",
    "Generate a proof of Euler's identity",
    "Describe in single words only the good things that come into your mind about your mother.",
  ];


  let promptIndex = 0;
  const { choices } = await client.getCompletions(deploymentId, examplePrompts);
  for (const choice of choices) {
    const completion = choice.text;
    console.log(`Input: ${examplePrompts[promptIndex++]}`);
    console.log(`Chatbot: ${completion}`);
  }
}

main().catch(err => console.error(err))

// const credential = new AzureKeyCredential(process.env.OPENAI_API_KEY);

// const completion = async () => {
//   const deploymentName = MODEL.GPT_3_5;
//   const client = new OpenAIClient(endpoint, key);
//   const { id, created, choices, usage } = await client.getCompletions(deploymentName, ["hello"], {
//     maxTokens: 120
//   });
//   console.log(id, created, choices, usage);

// }

// completion().catch(err => console.error('err', err));

// const { choices } = await client.getCompletions(
//     "GPT_3_5", // assumes a matching model deployment or model name
//     ["Hello, world!"]);

//   for (const choice of choices) {
//     console.log(choice.text);
//   }

// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
// });

// console.log(openai);

// const prompt = fs.readFileSync('./prompt.txt', 'utf8');

// const handler = async (req, res) => {
//     const payload = {
//         method: req.method,
//         endpoint: req.originalUrl,
//         body: req.body
//     };

//     try {
//         const chatCompletion = await openai.chat.completions.create({
//             messages: [
//                 { role: 'system', content: prompt },
//                 { role: 'user', content: JSON.stringify(payload) }
//             ],
//             model: MODEL.GPT_3_5,
//         });

//         const response = chatCompletion?.choices?.[0]?.message?.content;
//         const jsonResponse = JSON.parse(response);

//         console.log(JSON.stringify({ ...payload, response: jsonResponse }, null, 2));

//         res.setHeader('Content-Type', 'application/json');
//         res.send(JSON.stringify(jsonResponse, null, 2));
//     } catch (error) {
//         console.error(error);
//         res.status(400).send(error);
//     }
// };

const handler = () => {}

app.get('/favicon.ico', (req, res) => res.status(404).send());

app.get('*', handler);
app.post('*', handler);

const port = process.env.PORT;

// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });
