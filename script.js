// setup variables
const wordsInput = document.querySelector('.words-input');
const wordsDisplay = document.querySelector('.words-display');
const resetButton = document.querySelector('.reset-button');
const scoreContainer = document.querySelector('.score-container');

const wordList = "Hello how Yes are you i'm good what about you yes very great nice to see because limited time against clock";

let started = false;
let finished = false;

let words = 15;
let wordsArray;
let letterCounter;
let wordCounter;
let startTime;
let endTime;

let correctLetters;
let incorrectLetters;
let extraLetters;
let missedLetters;


// utility functions
function random(min, max) {
  const num = Math.floor(Math.random() * (max - min + 1)) + min;
  return num;
}

function wpmCalc(startTime, endTime, wordsArray) {
  let totalCharacters = 0;
  let correctLetters = 0;
  let incorrectLetters = 0;
  let extraLetters = 0;
  let missedLetters = 0;

  for (let i = 0; i < wordsArray.length; i++) {
    for (let j = 0; j < wordsArray[i].length; j++) {
      totalCharacters++;
      if (wordsArray[i][j].classList.contains('correct')) {
        correctLetters++;
      } else if (wordsArray[i][j].classList.contains('incorrect')) {
        incorrectLetters++;
      } else if (wordsArray[i][j].classList.contains('extra-letter')) {
        extraLetters++;
      }
    }
  }
  // add spaces to correct letters count
  // adjust total letters count for disregared end space
  correctLetters += words - 1;
  totalCharacters -= 1;
  missedLetters = totalCharacters - (correctLetters + incorrectLetters + extraLetters);

  let time = endTime - startTime;
  time = time / 1000 / 60;
  let grossWPM = ((totalCharacters - extraLetters) / 5) / time;
  return `🎉 WPM: ${grossWPM.toFixed(0)}`;
}


// setup typing function
function setup() {

  // reset variables
  wordsArray = [];
  correctLetters = 0;
  incorrectLetters = 0;
  extraLetters = 0;
  missedLetters = 0;
  letterCounter = 0;
  wordCounter = 0;

  started = false;
  finished = false;

  scoreContainer.classList.remove('score-visible');

  // clear existing words
  while (wordsDisplay.firstChild) {
    wordsDisplay.firstChild.remove();
  }

  // build and display words list
  let splitWords = wordList.split(' ');

  // add letters to display and letters array
  for (let i = 0; i < words; i ++) {
    let randomSelector = random(0, splitWords.length - 1);
    let letters = [];
    let word = document.createElement('span');
    for (let j = 0; j < splitWords[randomSelector].length; j++) {
      let letter = document.createElement('span');
      letter.innerText = splitWords[randomSelector][j];
      word.appendChild(letter);
      letters.push(letter);
    }
    // add spacing span at the end of every word
    let spacing = document.createElement('span');
    spacing.innerText = ' ';
    word.appendChild(spacing);
    letters.push(spacing);
    wordsArray.push(letters);
    wordsDisplay.appendChild(word);
  }
  wordsArray[0][0].classList.add('caret');
}

// first time setup
setup();

// words input focus
wordsDisplay.onclick = function() {
  wordsInput.focus();
}
wordsInput.onblur = function() {
  wordsArray[wordCounter][letterCounter].classList.remove('caret');
}
wordsInput.onfocus = function() {
  if (!finished){
    wordsArray[wordCounter][letterCounter].classList.add('caret');
  }
}

// tab key focus on reset button
window.onkeydown = function(e) {
  if (e.code === "Tab") {
    e.preventDefault();
    resetButton.focus();
  }
}

// reset button function click
resetButton.onclick = function() {
  // reset focus to the input box and call the setup function
  wordsInput.focus();
  setup();
}

// keystroke checking
wordsInput.oninput = function(e) {
  // check if the test is running, if not, record the time the user starts typing
  if (!started) {
    started = true;
    startTime = Date.now();
  }
  // if the game has stopped, return
  if (finished){
    return;
  }
  // letter input checking
  // set the current letter as the letter that the user has just typed
  let currentLetter = e.data;
  // space input, checking if the user has entered at least one letter in the current word
  if (currentLetter === ' ' && letterCounter > 0) {
    // move caret to the next word and set letter selector back to zero, if the word is the last one, end the game
    wordsArray[wordCounter][letterCounter].classList.remove('caret');
    // end the test if the current word is the last one
    if (wordCounter === wordsArray.length - 1) {
      finished = true;
      endTime = Date.now();
      scoreContainer.firstElementChild.innerText = wpmCalc(startTime, endTime, wordsArray);
      scoreContainer.classList.add('score-visible');
      return;
    }
    // otherwise contiunue and move caret to the next word and check previous for errors
    wordCounter++;
    letterCounter = 0;
    wordsArray[wordCounter][letterCounter].classList.add('caret');
    // check if previous word has incorrect or missing letters, if so, add appropirate class
    for (let i = 0; i < wordsArray[wordCounter - 1].length - 1; i++) {
      if (!wordsArray[wordCounter - 1][i].classList.contains('correct')) {
        for (let j = 0; j < wordsArray[wordCounter - 1].length - 1; j++) {
          wordsArray[wordCounter - 1][j].classList.add('incorrect-word');
        }
      }
    }
    // clear input box
    wordsInput.value = '';
  } else if (currentLetter === wordsArray[wordCounter][letterCounter].innerText && currentLetter !== ' ' && currentLetter !== null) {
    // checking if correct letter has been entered, if so, move caret forward and style test accordingly, and check if it was the last character, ending the test
    wordsArray[wordCounter][letterCounter].classList.add('correct');
    wordsArray[wordCounter][letterCounter].classList.remove('caret');
    // end the test if the current letter is corrent and the last letter of the last word
    if (letterCounter === wordsArray[wordCounter].length - 2 && wordCounter === wordsArray.length - 1) {
      finished = true;
      endTime = Date.now();
      scoreContainer.firstElementChild.innerText = wpmCalc(startTime, endTime, wordsArray);
      scoreContainer.classList.add('score-visible');
      return;
    }
    // otherwise contiunue and move caret forward and increment letterCounter;
    wordsArray[wordCounter][letterCounter + 1].classList.add('caret');
    letterCounter++;
  } else if (currentLetter !== wordsArray[wordCounter][letterCounter].innerText && currentLetter !== ' ' && currentLetter !== null) {
    // checking if incorrect or extra letter
    if (letterCounter !== wordsArray[wordCounter].length - 1){
      wordsArray[wordCounter][letterCounter].classList.add('incorrect');
      wordsArray[wordCounter][letterCounter].setAttribute('typed-letter', currentLetter);
      wordsArray[wordCounter][letterCounter + 1].classList.add('caret');
      wordsArray[wordCounter][letterCounter].classList.remove('caret');
      letterCounter++;
    } else if (wordsArray[wordCounter].length < 20) {
      // insert extra word
      let extraLetter = document.createElement('span');
      extraLetter.innerText = currentLetter;
      extraLetter.classList.add('extra-letter');
      wordsArray[wordCounter][letterCounter].parentNode.insertBefore(extraLetter, wordsArray[wordCounter][letterCounter]);
      wordsArray[wordCounter].splice(letterCounter, 0, extraLetter);
      letterCounter++;
    } else {
      // if too many extra letters have been added already, don't add anymore, and remove further extras from input box
      wordsInput.value = wordsInput.value.slice(0, 19);
    }
  }
}

wordsInput.onkeydown = function(e) {
  // if the game has stopped, return
  if (finished){
    return;
  }
  // backspace input
  if (e.code === 'Backspace') {
    if (letterCounter !== 0) {
      // remove styling from incorrect letter, or remove extra letter
      if (!wordsArray[wordCounter][letterCounter - 1].classList.contains('extra-letter')) {
        wordsArray[wordCounter][letterCounter - 1].classList.remove('correct');
        wordsArray[wordCounter][letterCounter - 1].classList.remove('incorrect');
        wordsArray[wordCounter][letterCounter - 1].removeAttribute('typed-letter');
        wordsArray[wordCounter][letterCounter].classList.remove('caret');
        letterCounter--;
        wordsArray[wordCounter][letterCounter].classList.add('caret');
      } else {
        // if letter is an extra added to the end of the word, remove it
        if (wordsArray[wordCounter][letterCounter - 1].classList.contains('extra-letter')) {
          // remove extra letter and decrement the letters counter
          wordsArray[wordCounter][letterCounter - 1].remove();
          wordsArray[wordCounter].splice(letterCounter - 1, 1);
          letterCounter--;
        }
      }
    } else if (wordCounter !== 0) {
      // return to the previous word if it contains incorrect lettering, or added letters
      // prevent default behaviour of backspacing the inputbox after adding the previous word in,
      // otherwise there would always be a letter at the end missing
      e.preventDefault();
      // check if there are any errors in the previous word, if so, backspace to the appropriate letter
      for (let i = 0; i < wordsArray[wordCounter - 1].length - 1; i++) {
        // check if any letters are incorrect
        if (!wordsArray[wordCounter - 1][i].classList.contains('correct')) {
          let rollbackLetter;
          for (let j = 0; j < wordsArray[wordCounter - 1].length - 1 ; j++) {
            wordsArray[wordCounter - 1][j].classList.remove('incorrect-word');
            // checking what the closent entered letter in the last word was, and setting that as the rollback destination
            if (wordsArray[wordCounter - 1][j].classList.contains('correct') ||
            wordsArray[wordCounter - 1][j].classList.contains('incorrect') ||
            wordsArray[wordCounter - 1][j].classList.contains('extra-letter')) {
              rollbackLetter = j;
              // if the previous words letters were typed incorreclty, at the original wrongly typed characters back into the input
              if(wordsArray[wordCounter - 1][j].hasAttribute('typed-letter')) {
                wordsInput.value += wordsArray[wordCounter - 1][j].getAttribute('typed-letter');
              } else {
                wordsInput.value += wordsArray[wordCounter - 1][j].innerText;
              }
            }
          }
          // set caret to the correct rollback position
          wordsArray[wordCounter][letterCounter].classList.remove('caret');
          wordCounter--;
          if (rollbackLetter === undefined) {
            letterCounter = 0;
            wordsInput.value = '';
          } else {
            letterCounter = rollbackLetter + 1;
          }
          wordsArray[wordCounter][letterCounter].classList.add('caret');
          return;
        }
      }
    }
  }
}
