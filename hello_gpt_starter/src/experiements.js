import { Select, Input } from "https://deno.land/x/cliffy@v1.0.0-rc.4/prompt/mod.ts";

// Example answers object to hold user inputs
let answers = {
  totalGuests: "10",
  cuisine: "Italian",
  vegetarian: "2",
  vegan: "1",
  nonPorkEater: "1",
  dairyFree: "0",
};

// Function to let the user select which answer to change
async function changeAnswer() {
  // Present the user with a menu to choose which answer to change
  const selectedAnswer = await Select.prompt({
    message: "Which answer would you like to change?",
    options: [
      { name: `Total Guests: ${answers.totalGuests}`, value: "totalGuests" },
      { name: `Cuisine: ${answers.cuisine}`, value: "cuisine" },
      { name: `Vegetarians: ${answers.vegetarian}`, value: "vegetarian" },
      { name: `Vegans: ${answers.vegan}`, value: "vegan" },
      { name: `Non-Pork Eaters: ${answers.nonPorkEater}`, value: "nonPorkEater" },
      { name: `Dairy-Free People: ${answers.dairyFree}`, value: "dairyFree" },
    ],
  });

  // Once the user selects an answer to change, ask for the new value
  const newValue = await Input.prompt(`Enter new value for ${selectedAnswer}:`);

  // Update the corresponding answer
  answers[selectedAnswer] = newValue;

  console.log("\nUpdated Answers:", answers);
}

// Initial question prompt
console.log("Initial Answers:", answers);

// Call the changeAnswer function
await changeAnswer();