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
  
      // Display the list of current answers
      questionKeys.forEach((key, index) => {
        console.log(`${index + 1}. ${key.replace(/([A-Z])/g, ' $1')}: ${answers[key]}`);
      });
  
      // Ask which questions they want to change, allowing multiple numbers
      const questionNumbers = await askUntilValid("Enter the numbers of the questions you'd like to change (comma-separated):");
      const questionIndexes = questionNumbers.split(",").map(num => parseInt(num.trim()) - 1);
  
      // Loop through the provided question numbers
      for (const questionIndex of questionIndexes) {
        if (questionIndex >= 0 && questionIndex < questionKeys.length) {
          const questionKey = questionKeys[questionIndex];
          
          // Ask for the new answer for each selected question
          const newAnswer = await askUntilValid(`Please enter a new answer for ${questionKey.replace(/([A-Z])/g, ' $1')}:`);
          answers[questionKey] = newAnswer; // Update the answer
        } else {
          console.log(`Invalid number: ${questionIndex + 1}. Skipping this question.`);
        }
      }
  
      console.log("All changes saved.");
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