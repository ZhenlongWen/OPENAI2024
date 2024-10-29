import { askUntilValid, parseYesNo, askCuisinePreference, modifyAnswers } from "./cliUtils.js";
import { promptGPT } from "./shared/openai.ts";
import { printMenu, extractArrays } from "./menuUtils.js";
import { setLogLevel, LogLevel } from "./shared/logger.ts";
import { ask, say } from "./shared/cli.ts";
import { colors } from "https://deno.land/x/cliffy@v1.0.0-rc.4/ansi/colors.ts";
import boxen from "npm:boxen";

// Hide DEBUG and INFO logs
setLogLevel(LogLevel.LOG);

function printWelcomeMessage() {
  // Create the orange color for the title
  const orangeTitle = colors.bold.rgb24('           Welcome to the Menu Generator', 0xFF8410);

  // Use boxen to create a double-style frame with the specified width
  const framedMessage = boxen(orangeTitle, {
    padding: 1,  // Add padding inside the box
    margin: 0,   // Add margin around the box
    borderStyle: 'double',  // Use double-line border
    borderColor: '#FF8410',  // Set border color to orange
    textAlighment: 'center',
    width: 60   // Set the width of the box to 60 characters
  });

  // Print the framed message
  console.log(framedMessage);
}



async function main() {
  const answers = {};

  // Greeting
  printWelcomeMessage();
  console.log("\n");

  // Ask for information
  answers.totalGuests = await askUntilValid("How many people are you expecting approximately?");
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

  // Prompt GPT for menu
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
  ]`; // (Your full prompt here)
  const response = await promptGPT(prompt, { max_tokens: 1024, temperature: 0.7 });
  const { appetizers, mainCourses, desserts } = extractArrays(response);

  // Print the menu
  console.log('\n');

  printMenu(appetizers, mainCourses, desserts);

  // Ask for another menu
  const continueGenerating = await askUntilValid("Do you want to generate another menu? (yes/no): ");
if (parseYesNo(continueGenerating) === "yes") {
  await main();
} else {
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
    
    // Clean the response to remove unwanted hyphens or bullet points
    let cleanedIngredientResponse = ingredientResponse.replace(/^- /gm, '').trim();

    // Use boxen to create a frame with a fixed width
    
    const framedIngredients = boxen(cleanedIngredientResponse, {
      title:'Ingredient Suggestion',
      titleAlignment:'left',
      padding: 1,
      margin: 0,
      borderColor: "#FF8410",  // Set the border color
      borderStyle: "double",   // Use rounded corners for the box
      width: 60               // Set the width of the box
    });

    console.log(`\n${framedIngredients}`);
  }
  const lastLine = colors.bold.italic.bgRgb24;
  console.log("\n");
  console.log(lastLine("Thank you for using the Menu Generator, Bon Appétit!", 0xff9e3d));
}
}

main();