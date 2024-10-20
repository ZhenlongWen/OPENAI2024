import { ask, say } from "./shared/cli.ts";
import { promptGPT } from "./shared/openai.ts";
import { LogLevel, setLogLevel } from "./shared/logger.ts";

// Hide DEBUG and INFO logs
setLogLevel(LogLevel.LOG);

// parse yes/no input
function parseYesNo(input) {
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

// Helper function to ensure non-empty input
async function askUntilValid(question) {
  let response = '';
  do {
    response = await ask(question);
    if (!response.trim()) {
      say("Please provide a valid input.");
    }
  } while (!response.trim());
  return response;
}

// Function to extract arrays from the response string
function extractArrays(responseText) {
  const appetizersMatch = responseText.match(/appetizers:\s*\[(.*?)\]/s);
  const mainCoursesMatch = responseText.match(/mainCourses:\s*\[(.*?)\]/s);
  const dessertsMatch = responseText.match(/desserts:\s*\[(.*?)\]/s);

  // Function to parse array and ensure items stay on one line
  const parseArray = (match) => {
    return match ? match[1]
      .split(',')
      .map(item => item.trim().replace(/\s*\n\s*/g, ' ').replace(/['"]+/g, ''))  // Clean up newlines and quotes
      : [];
  };

  const appetizers = parseArray(appetizersMatch);
  const mainCourses = parseArray(mainCoursesMatch);
  const desserts = parseArray(dessertsMatch);

  return { appetizers, mainCourses, desserts };
}

// Function to center-align text in a fixed width
function centerText(text, width = 50) {
  const padding = Math.max(0, Math.floor((width - text.length) / 2));
  return ' '.repeat(padding) + text;
}

// Function to print the menu with centered title, dashes, and content
function printMenu(appetizers, mainCourses, desserts) {
  const divider = '-'.repeat(30); // Shorter divider with 30 dashes

  console.log(centerText("Dinner Menu", 50));  // Centered title
  console.log(centerText(divider, 50));  // Centered divider

  if (appetizers.length > 0) {
    console.log(centerText("Appetizers", 50));  // Centered section title
    appetizers.forEach((item) => {
      console.log(centerText(item, 50));  // Centering each appetizer with dietary info
    });
    console.log(centerText(divider, 50));  // Centered divider
  }

  if (mainCourses.length > 0) {
    console.log(centerText("Main Courses", 50));  // Centered section title
    mainCourses.forEach((item) => {
      console.log(centerText(item, 50));  // Centering each main course with dietary info
    });
    console.log(centerText(divider, 50));  // Centered divider
  }

  if (desserts.length > 0) {
    console.log(centerText("Desserts", 50));  // Centered section title
    desserts.forEach((item) => {
      console.log(centerText(item, 50));  // Centering each dessert with dietary info
    });
    console.log(centerText(divider, 50));  // Centered divider
  }
}

// Function to display and modify the responses
async function modifyAnswers(answers) {
  let modify = await askUntilValid("Would you like to change any of the answers? (yes/no)");
  if (parseYesNo(modify) === "yes") {
    const questionKeys = Object.keys(answers);
    say("Here are the questions you answered:");
    questionKeys.forEach((key, index) => {
      say(`${index + 1}. ${key.replace(/([A-Z])/g, ' $1')}: ${answers[key]}`);
    });

    const questionNumber = await askUntilValid("Enter the number of the question you'd like to change:");
    const questionIndex = parseInt(questionNumber) - 1;
    if (questionIndex >= 0 && questionIndex < questionKeys.length) {
      const questionKey = questionKeys[questionIndex];
      const newAnswer = await askUntilValid(`Please enter a new answer for ${questionKey.replace(/([A-Z])/g, ' $1')}:`);
      answers[questionKey] = newAnswer;
    } else {
      say("Invalid number. No changes made.");
    }
  }
}

// Function to ask about cuisine preferences (to prevent restarting the whole process)
async function askCuisinePreference(answers) {
  let validResponse = false;
  
  while (!validResponse) {
    const singleCuisineResponse = await askUntilValid("Do you want the menu to be single cuisine or not?");
    answers.singleCuisine = parseYesNo(singleCuisineResponse);

    if (answers.singleCuisine === "yes") {
      answers.cuisine = await askUntilValid("What type of cuisine do you prefer?");
      validResponse = true;  // Valid response received, exit loop
    } else if (answers.singleCuisine === "no") {
      answers.cuisine = await askUntilValid("Which cuisines do you prefer (mix of cuisines)?");
      validResponse = true;  // Valid response received, exit loop
    } else {
      say("I didn't understand that. Please respond with 'yes' or 'no'.");
    }
  }
}

async function main() {
  // Store answers in an object
  const answers = {};

  // Greeting
  say("Welcome to the Menu Generator");

  // Ask for information using the validation function
  answers.totalGuests = await ask("How many people are you expecting approximately?");
  
  // Ask the user about cuisine preference (single or mixed)
  await askCuisinePreference(answers);

  answers.vegetarian = await askUntilValid("How many vegetarians are there?");
  answers.vegan = await askUntilValid("How many vegans are there?");
  answers.nonPorkEater = await askUntilValid("How many people do not eat pork?");
  answers.dairyFree = await askUntilValid("How many people cannot eat dairy?");
  answers.dietaryRestrictions = await askUntilValid("Are there any other dietary restrictions? If so, please indicate how many people.");
  answers.specificDish = await askUntilValid("Are there any dishes you want to include specifically?");
  answers.specificIngredients = await askUntilValid("Are there any ingredients you want to include specifically? If so, please list them.");

  // Modify answers if needed
  await modifyAnswers(answers);

  // Prompt engineering
  const prompt = `Generate a dinner menu for ${answers.totalGuests} people. 
  There are ${answers.vegan} vegans, ${answers.vegetarian} vegetarians (excluding vegans), ${answers.nonPorkEater} people who avoid pork (excluding vegetarians and vegans), and ${answers.dairyFree} people who cannot have dairy.
  Additional dietary restrictions are: ${answers.dietaryRestrictions}.
  Please provide a variety of appetizers, main courses, and desserts based on the number of people and the information above that will accommodate everyone's dietary needs.
  Include ${answers.specificDish} (dish) in the menu and use ${answers.specificIngredients} as an ingredient in a dish or more.
  Include ${answers.cuisine} cuisine.

  If there are vegetarians/vegans/non-pork eaters/dairy-free people, do not make the whole menu without those ingredients, just include very few dishes that are suitable for them according to their numbers.
  Please only output the dishes as three JavaScript arrays of strings like this:
  appetizers: [
    "dish1(VG)",
    "dish2(V/DF)",
    ...
  ],
  mainCourses: [
    "dish1 (V/GF)",
    "dish2 ",
    ...
  ],
  desserts: [
    "dish1(DF)",
    ...
  ]`;

  const response = await promptGPT(prompt, { max_tokens: 1024, temperature: 0.7 });

  // Extract arrays using custom extraction function
  const { appetizers, mainCourses, desserts } = extractArrays(response);

  // Print the menu in a styled and centered format
  printMenu(appetizers, mainCourses, desserts);

  // Ask if they want to generate another menu
  const continueGenerating = await askUntilValid("Do you want to generate another menu? (yes/no): ");
  
  if (parseYesNo(continueGenerating) === "yes") {
    await main();
  } else {
    // Ask if they need ingredient suggestions
    const needSuggestions = await askUntilValid("Do you need suggestions for ingredient quantities? (yes/no): ");
    
    if (parseYesNo(needSuggestions) === "yes") {
      const menuAsString = `
      Appetizers: ${appetizers.join(', ')}
      Main Courses: ${mainCourses.join(', ')}
      Desserts: ${desserts.join(', ')}
      `;
      
      const suggestionPrompt = `Based on the following menu and serving ${answers.totalGuests} guests, do not be wasteful and try to reduce the quantity as much as possible. provide a consolidated list of ingredients with total quantities needed for each ingredient, combining duplicate ingredients, only output the ingredients and their quantity:
      ${menuAsString}`;
      const ingredientResponse = await promptGPT(suggestionPrompt, { max_tokens: 1024, temperature: 0.7 });
      
      say(`Ingredient Suggestions:\n${ingredientResponse}`);
    }

    // Exit message
    say("Thank you for using the Menu Generator!");
  }
}

main();