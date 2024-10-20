import { promptGPT } from "./shared/openai.ts";
import { colors } from "https://deno.land/x/cliffy@v1.0.0-rc.4/ansi/colors.ts";
import boxen from "npm:boxen";

export function extractArrays(responseText) {
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

  export function centerText(text, width) {
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    const extraSpace = (width - text.length) % 2 === 0 ? '' : ' ';  // Add extra space if the text length is odd
    return ' '.repeat(padding) + text + ' '.repeat(padding) + extraSpace;
  }
  
  // Function to print the menu using boxen
  export function printMenu(appetizers, mainCourses, desserts) {
    const frameWidth = 60; // Set the width for the frame
    const divider = '-'.repeat(30);
    const italic = colors.bold.italic.yellow;
    
    // Center and format each section of the menu
    let menuContent = '';
    
    menuContent += centerText("Dinner Menu", frameWidth) + '\n';
    menuContent += centerText(divider, frameWidth) + '\n';
    
    if (appetizers.length > 0) {
      menuContent += '\n' + centerText(italic("Appetizers"), frameWidth) + '\n\n';
      appetizers.forEach((item) => {
        menuContent += centerText(item, frameWidth) + '\n';
      });
      menuContent += '\n' + centerText(divider, frameWidth) + '\n';
    }
  
    if (mainCourses.length > 0) {
      menuContent += '\n' + centerText(italic("Main Courses"), frameWidth) + '\n\n';
      mainCourses.forEach((item) => {
        menuContent += centerText(item, frameWidth) + '\n';
      });
      menuContent += '\n' + centerText(divider, frameWidth) + '\n';
    }
  
    if (desserts.length > 0) {
      menuContent += '\n' + centerText(italic("Desserts"), frameWidth) + '\n\n';
      desserts.forEach((item) => {
        menuContent += centerText(item, frameWidth) + '\n';
      });
      menuContent += '\n' + centerText(divider, frameWidth) + '\n';
    }
    
    // Add a colored title using cliffy colors
    const title = colors.bold.rgb24(' Your Menu ', 0xFF8410);  // Orange title
    
    // Use boxen to create a frame with the styled title and menu content
    const framedMenu = boxen(menuContent, {
      padding: 1,
      margin: 0,
      borderColor: "#FF8410",  // Set the border color
      borderStyle: "double", // Use a classic border style
      title: 'Your Menu',           // Add the title
      titleAlignment: 'left',  // Center the title
      textAlignment: 'center',
      width: 60   // Adjust width to account for padding
    });
  
    console.log(framedMenu);
  }