// Import ask from the shared CLI module
import { ask, say } from "./shared/cli.ts";  // Importing 'ask' for user input handling
import { colors } from "https://deno.land/x/cliffy@v1.0.0-rc.4/ansi/colors.ts";

export async function askUntilValid(question) {
  let response = '';
  do {
    const orange = colors.bold.rgb24;
    response = await ask(orange(question,0xFF8410)); 
    if (!response.trim()) {
      console.log("Please provide a valid input.");
    }
  } while (!response.trim());
  return response;
}

export function parseYesNo(input) {
  const normalizedInput = input.trim().toLowerCase();
  const yesResponses = ["yes", "y", "yeah", "sure", "yep", "ok", "okay"];
  const noResponses = ["no", "n", "nah", "nope", "not really", "no, not really", "not at all"];

  if (yesResponses.includes(normalizedInput)) {
    return "yes";
  } else if (noResponses.includes(normalizedInput)) {
    return "no";
  } else {
    return "unknown";
  }
}

export async function modifyAnswers(answers) {
  const modify = await askUntilValid("Would you like to change any of the answers? (yes/no)");
  if (parseYesNo(modify) === "yes") {
    const questionKeys = Object.keys(answers);
    console.log("Here are the questions you answered:");
    questionKeys.forEach((key, index) => {
      console.log(`${index + 1}. ${key.replace(/([A-Z])/g, ' $1')}: ${answers[key]}`);
    });

    const questionNumber = await askUntilValid("Enter the number of the question you'd like to change:");
    const questionIndex = parseInt(questionNumber) - 1;
    if (questionIndex >= 0 && questionIndex < questionKeys.length) {
      const questionKey = questionKeys[questionIndex];
      const newAnswer = await askUntilValid(`Please enter a new answer for ${questionKey.replace(/([A-Z])/g, ' $1')}:`);
      answers[questionKey] = newAnswer;
    } else {
      console.log("Invalid number. No changes made.");
    }
  }
}

export async function askCuisinePreference(answers) {
  let validResponse = false;

  while (!validResponse) {
    const singleCuisineResponse = await askUntilValid("Do you want the menu to be single cuisine or not?");
    answers.singleCuisine = parseYesNo(singleCuisineResponse);

    if (answers.singleCuisine === "yes") {
      answers.cuisine = await askUntilValid("What type of cuisine do you prefer?");
      validResponse = true;
    } else if (answers.singleCuisine === "no") {
      answers.cuisine = await askUntilValid("Which cuisines do you prefer (mix of cuisines)?");
      validResponse = true;
    } else {
      console.log("I didn't understand that. Please respond with 'yes' or 'no'.");
    }
  }
}