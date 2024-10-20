import { say } from "./shared/cli.ts";
import { promptDalle, promptGPT } from "./shared/openai.ts";

say("Welcom to the future Gadget Designer store!");

async function getGadgetInput() {
  const purpose = await prompt("What is the purpose of the futuristic gadget?");
  const features = await prompt("What are the key features of this gadget?");
  
  return { purpose, features };
}


function createGPTPrompt(details) {
  return `
    You are a futuristic engineer designing a gadget that serves the purpose of ${details.purpose}. 
    The gadget includes the following key features: ${details.features}. 
    Provide a brief description of how the gadget works and underline its appearance and key components according to the information provided above. 
    Make the response futuristc, reasonable and in 70 words in one paragraph and only the description.
    Your response should complete the sentence "The object is..."
  `;
}

const gadgetDetails = await getGadgetInput();
const promptToGPT = createGPTPrompt(gadgetDetails);
const gptResponse = await promptGPT (promptToGPT, {temperature: 0.8, max_tokens: 512});
;
say("The Gadget Description is:");
say(`${gptResponse}`);

const imageResponse = await promptDalle(gptResponse + " Fantasy Art Digital Painting.");
say(imageResponse.url);


