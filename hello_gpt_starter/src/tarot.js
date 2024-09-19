import { ask, say } from "./shared/cli.ts";
import { promptGPT } from "./shared/openai.ts";
import { LogLevel, setLogLevel } from "./shared/logger.ts";

// Hide DEBUG and INFO logs
setLogLevel(LogLevel.LOG);

async function main() {
  // Greet the player
  const userName = prompt("Welcome to the Tarot Card Reading Game! What's your name?");
  say(`Hello, ${userName}! Let's explore your destiny through the Tarot.`);

  // Ask for the player's question or intention
  const question = await ask("What question or intention would you like to focus on for your Tarot reading?");

  // Ask the player to choose a tarot spread
  say("Please choose a tarot spread:");
  say("1. Single Card - A single card for a quick insight.");
  say("2. Three-Card Spread - Past, Present, and Future.");
  say("3. Celtic Cross - A comprehensive 10-card reading.");

  const spreadChoice = await ask("Enter the number of your chosen spread:");

  let spreadDescription;
  let numCards;
  
  // Determine the spread based on the player's choice
  switch (spreadChoice.trim()) {
    case "1":
      spreadDescription = "Single Card";
      numCards = 1;
      break;
    case "2":
      spreadDescription = "Three-Card Spread";
      numCards = 3;
      break;
    case "3":
      spreadDescription = "Celtic Cross";
      numCards = 10;
      break;
    default:
      say("Invalid choice. Please restart the game and choose a valid spread.");
      return;
  }

  say(`You've chosen the ${spreadDescription} spread. Shuffling the cards...`);

  // Draw the cards
  const tarotDraw = await promptGPT(
    `You are a Tarot reader. Draw ${numCards} tarot cards randomly and provide the name of each card and its position in the ${spreadDescription} spread. Only provide the card name and the position`,
    { max_tokens: 100, temperature: 0.7 }
  );

  say(`Here are the cards drawn:\n${tarotDraw}`);

  // Interpret the cards
  const interpretation = await promptGPT(
    `Interpret the following tarot reading based on the question: "${question}". The drawn cards are:

    ${tarotDraw}

    Provide key interpretation for the player. In 100 words`,
    { max_tokens: 1024, temperature: 0.4 }
  );

  say(`\nYour Tarot reading:\n${interpretation}`);

  // Ask if the player wants another reading
  const anotherReading = await ask("Would you like another reading? (yes/no)");
  if (anotherReading.trim().toLowerCase() === "yes") {
    main();  // Restart the game for another reading
  } else {
    say("Thank you for playing the Tarot Card Reading Game. May the cards guide you well!");
  }
}

main();