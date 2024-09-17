import { ask, say } from "./shared/cli.ts";
import { promptGPT } from "./shared/openai.ts";
import { LogLevel, setLogLevel } from "./shared/logger.ts";

// hide DEBUG and INFO logs
setLogLevel(LogLevel.LOG);


// Definition of 72 Tarot cards, including Major and Minor Arcana
const majorArcana = [
  "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor", 
  "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit", 
  "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance", 
  "The Devil", "The Tower", "The Star", "The Moon", "The Sun", "Judgement", "The World"
];

const minorArcana = [
  "Ace of Wands", "Two of Wands", "Three of Wands", "Four of Wands", "Five of Wands",
  "Six of Wands", "Seven of Wands", "Eight of Wands", "Nine of Wands", "Ten of Wands",
  "Page of Wands", "Knight of Wands", "Queen of Wands", "King of Wands",
  "Ace of Cups", "Two of Cups", "Three of Cups", "Four of Cups", "Five of Cups",
  "Six of Cups", "Seven of Cups", "Eight of Cups", "Nine of Cups", "Ten of Cups",
  "Page of Cups", "Knight of Cups", "Queen of Cups", "King of Cups",
  "Ace of Swords", "Two of Swords", "Three of Swords", "Four of Swords", "Five of Swords",
  "Six of Swords", "Seven of Swords", "Eight of Swords", "Nine of Swords", "Ten of Swords",
  "Page of Swords", "Knight of Swords", "Queen of Swords", "King of Swords",
  "Ace of Pentacles", "Two of Pentacles", "Three of Pentacles", "Four of Pentacles", 
  "Five of Pentacles", "Six of Pentacles", "Seven of Pentacles", "Eight of Pentacles", 
  "Nine of Pentacles", "Ten of Pentacles", "Page of Pentacles", "Knight of Pentacles", 
  "Queen of Pentacles", "King of Pentacles"
];

async function main() {
  // greet the player
  const userName = prompt("Hello, Love! I'm so glad you're here today. I know it can take a lot to seek guidance, and I'm honored to help you explore whatever's on your mind. What's your name?");
  say(`Ok, ${userName}! Remember The Tarot here is to offer insight, not answers set in stone, but reflections that may help you understand your potential and possibilities.`);
  
  // Ask for the player's question or intention
  const question = await ask(" What would you like to focus on today?");

    // Ask the player to choose a tarot spread
    say("Please choose a tarot spread:");
    say("1. Single Card - A single card for a quick insight.");
    say("2. Three-Card Spread - Three card combination analysis.");
    say("3. Celtic Cross - A comprehensive 10-card reading.");
    say("4. Lover's Pyramid Spread - A four-card spread focusing on relationship dynamics.");
    
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

  case "4":
    spreadDescription = "Lover's Pyramid Spread";
    numCards = 4;
    break;
    
  default:
    say("Invalid choice. Please restart the game and choose a valid spread.");
    return;
}

say(`You've chosen the ${spreadDescription} spread. Shuffling the cards...`);


// Draw tarot cards
const drawTarotCards = (numCards) => {
  // Combination of the Major and Minor Arcana
  const fullDeck = [...majorArcana, ...minorArcana];

  let drawnCards = [];
  for (let i = 0; i < numCards; i++) {
    const randomIndex = Math.floor(Math.random() * fullDeck.length);
    const card = fullDeck[randomIndex];
    
    // Randomly determine whether this card is upright or reversed
    const isReversed = Math.random() > 0.5 ? "(Reversed)" : "(Upright)";
    
    // Add the card and its direction
    drawnCards.push(`${card} ${isReversed}`);
    
    // After drawing, remove the card from the deck to avoid duplication
    fullDeck.splice(randomIndex, 1);
  }

  return drawnCards;
};

  // Draw the cards from the full deck (including both Major and Minor Arcana)
  const drawnCards = drawTarotCards(numCards);
  const tarotDraw = drawnCards.map((card, index) => `Card ${index + 1}: ${card}`).join("\n");

  say(`My Dear, here are the cards drawn:\n${tarotDraw}`);

// Special treatment of the Lovers' Pyramid card layout (each card in the Lovers' Pyramid card layout has a specific interpretation)
if (spreadDescription === "Lover's Pyramid Spread") {
  const loverPyramidReading = `
    Card 1 (Your attitude and state in the relationship): ${drawnCards[0]}
    Card 2 (Your partner's state): ${drawnCards[1]}
    Card 3 (The dynamic between you): ${drawnCards[2]}
    Card 4 (Future development): ${drawnCards[3]}
  `;
  say(`Here is your Lover's Pyramid reading:\n${loverPyramidReading}`);
} else {
  const tarotDraw = drawnCards.map((card, index) => `Card ${index + 1}: ${card}`).join("\n");
  say(`Here are the cards drawn:\n${tarotDraw}`);
}
  

// Interpret the cards
const interpretation = await promptGPT(
  `Interpret the following tarot reading based on the question: "${question}". Rather than explaining the meaning of the cards, focus more on the "${question}". The drawn cards are:

  ${tarotDraw}

  Provide key interpretation for the player. In 200 words`,
  { max_tokens: 1024, temperature: 0.7 }
);

say(`\nYour Tarot reading:\n${interpretation}`);

  // Ask if the player wants advice
  const needAdvice = await ask("Would you like to seek further advice from the Tarot? (yes/no)");

  if (needAdvice.trim().toLowerCase() === "yes") {
    say("Let me draw one more card to offer advice...");
    
    // Draw suggestion cards
    const adviceCard = drawTarotCards(1);
    const adviceCardDraw = adviceCard.map((card, index) => `Advice Card: ${card}`).join("\n");
    
    say(`Here is your advice card:\n${adviceCardDraw}`);

    // Inerpretation of the suggestion board
    const adviceInterpretation = await promptGPT(
      `Interpret the following advice card based on the question: "${question}". The advice card is:

      ${adviceCardDraw}

      Provide specific advice for the player in 100 words.`,
      { max_tokens: 512, temperature: 0.7 }
    );

    say(`\nMy Dear, here's your advice:\n${adviceInterpretation}`);
  }

// Ask if the player wants another reading
const anotherReading = await ask("Would you like to explore anything else today? (yes/no)");
if (anotherReading.trim().toLowerCase() === "yes") {
  main();  // Restart the game for another reading
} else {
  say("I'm happy to talk with you today. Trust that you are capable, and keep listening to your inner voice.");
}
}

main();
