// setup variables
const wordsContainer = document.querySelector('.words-container');
const wordsInput = document.querySelector('.words-input');
const wordsDisplay = document.querySelector('.words-display');

const wordList = 'hello how are you im good what about you yes very great nice to see because limited time against clock';

let started = false;
let finished = false;

let words = 15;
let wordsArray;
let letterCounter;
let wordCounter;
let startTime;

let correctLetters;
let incorrectLetters;
let extraLetters;
let missedLetters;


// utility functions
function random(min, max) {
  const num = Math.floor(Math.random() * (max - min + 1)) + min;
  return num;
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
    // add spacing span at the end of every word but the last one
    if (i != wordsArray.length - 1) {
      let spacing = document.createElement('span');
      spacing.innerText = ' ';
      word.appendChild(spacing);
      letters.push(spacing);
    }
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
  wordsArray[wordCounter][letterCounter].classList.add('caret');
}


// keystroke checking
wordsInput.onkeydown = function(e) {
  // letter input checking
  if (e.code.slice(3).toLowerCase() === wordsArray[wordCounter][letterCounter].innerText) {
    wordsArray[wordCounter][letterCounter].classList.add('correct');
    wordsArray[wordCounter][letterCounter + 1].classList.add('caret');
    wordsArray[wordCounter][letterCounter].classList.remove('caret');
    correctLetters++;
    letterCounter++;
  } else if (e.code.includes('Key') && e.code.slice(3).toLowerCase !== wordsArray[wordCounter][letterCounter].innerText) {
    // checking if incorrect or extra letter
    if (letterCounter !== wordsArray[wordCounter].length - 1){
      wordsArray[wordCounter][letterCounter].classList.add('incorrect');
      wordsArray[wordCounter][letterCounter + 1].classList.add('caret');
      wordsArray[wordCounter][letterCounter].classList.remove('caret');
      incorrectLetters++;
      letterCounter++;
    } else if (wordsArray[wordCounter].length < 20) {
      // insert extra word
      let extraLetter = document.createElement('span');
      extraLetter.innerText = e.code.slice(3).toLowerCase();
      extraLetter.classList.add('extra-letter');
      wordsDisplay
      wordsArray[wordCounter][letterCounter].parentNode.insertBefore(extraLetter, wordsArray[wordCounter][letterCounter]);
      wordsArray[wordCounter].splice(letterCounter, 0, extraLetter);
      // count extra
      letterCounter++;
    }
  }
  // space input
  // check if the user has entered at least one letter in the current word
  if (e.code === 'Space' && letterCounter > 0) {
    // move caret to the next word and set letter selector back to zero
    wordsArray[wordCounter][letterCounter].classList.remove('caret');
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
  }
  // backspace input
  if (e.code === 'Backspace') {
    if (letterCounter != 0) {
      // remove styling or remove extra letter
      if (!wordsArray[wordCounter][letterCounter - 1].classList.contains('extra-letter')) {
        wordsArray[wordCounter][letterCounter - 1].classList.remove('correct');
        wordsArray[wordCounter][letterCounter - 1].classList.remove('incorrect');
        wordsArray[wordCounter][letterCounter].classList.remove('caret');
        letterCounter--;
        wordsArray[wordCounter][letterCounter].classList.add('caret');
      } else {
        if (wordsArray[wordCounter][letterCounter - 1].classList.contains('extra-letter')) {
          // remove extra letter
          wordsArray[wordCounter][letterCounter - 1].remove();
          wordsArray[wordCounter].splice(letterCounter - 1, 1);
          // move caret foward and count extra
          letterCounter--;
        }
      }
    } else {
      // check if there are any errors in the previous word, if so, backspace to the appropriate letter
      for (let i = 0; i < wordsArray[wordCounter - 1].length - 1; i++) {
        // check if any letters are incorrect
        if (!wordsArray[wordCounter - 1][i].classList.contains('correct')) {
          let rollbackLetter;
          for (let j = wordsArray[wordCounter - 1].length - 1; j >= 0 ; j--) {
            wordsArray[wordCounter - 1][j].classList.remove('incorrect-word');
            // checking what the closent entered letter in the last word was, and setting that as the rollback destination
            if ((wordsArray[wordCounter - 1][j].classList.contains('correct') ||
            wordsArray[wordCounter - 1][j].classList.contains('incorrect') ||
            wordsArray[wordCounter - 1][j].classList.contains('extra-letter')) &&
            rollbackLetter === undefined) {
              rollbackLetter = j;
            }
          }
          wordsArray[wordCounter][letterCounter].classList.remove('caret');
          wordCounter--;
          if (rollbackLetter === undefined) {
            letterCounter = 0;
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
