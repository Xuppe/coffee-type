// setup variables
const wordsContainer = document.querySelector('.words-container');
const wordsInput = document.querySelector('.words-input');
const wordsDisplay = document.querySelector('.words-display');

const wordList = "Hello how Yes are you i'm good what about you yes very great nice to see because limited time against clock";

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
wordsInput.oninput = function(e) {
  // letter input checking
  // set the current letter as the letter that the user has just typed
  let currentLetter = e.data;
  // console.log(currentLetter); // Debugging keystroke
  // space input, checking if the user has entered at least one letter in the current word
  if (currentLetter === ' ' && letterCounter > 0) {
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
    // clear input box
    wordsInput.value = '';
  } else if (currentLetter === wordsArray[wordCounter][letterCounter].innerText && currentLetter !== ' ' && currentLetter !== null) {
    // checking if correct letter has been entered, if so, move caret forward and style test accordingly
    wordsArray[wordCounter][letterCounter].classList.add('correct');
    wordsArray[wordCounter][letterCounter + 1].classList.add('caret');
    wordsArray[wordCounter][letterCounter].classList.remove('caret');
    correctLetters++;
    letterCounter++;
  } else if (currentLetter !== wordsArray[wordCounter][letterCounter].innerText && currentLetter !== ' ' && currentLetter !== null) {
    // checking if incorrect or extra letter
    if (letterCounter !== wordsArray[wordCounter].length - 1){
      wordsArray[wordCounter][letterCounter].classList.add('incorrect');
      wordsArray[wordCounter][letterCounter].setAttribute('typed-letter', currentLetter);
      wordsArray[wordCounter][letterCounter + 1].classList.add('caret');
      wordsArray[wordCounter][letterCounter].classList.remove('caret');
      incorrectLetters++;
      letterCounter++;
    } else if (wordsArray[wordCounter].length < 20) {
      // insert extra word
      let extraLetter = document.createElement('span');
      extraLetter.innerText = currentLetter;
      extraLetter.classList.add('extra-letter');
      wordsArray[wordCounter][letterCounter].parentNode.insertBefore(extraLetter, wordsArray[wordCounter][letterCounter]);
      wordsArray[wordCounter].splice(letterCounter, 0, extraLetter);
      // count extra
      letterCounter++;
    } else {
      // if too many extra letters have been added already, don't add anymore, and remove further extras from input box
      wordsInput.value = wordsInput.value.slice(0, 19);
    }
  }
}

wordsInput.onkeydown = function(e) {
  // backspace input
  if (e.code === 'Backspace') {
    if (letterCounter != 0) {
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
          // remove extra letter
          wordsArray[wordCounter][letterCounter - 1].remove();
          wordsArray[wordCounter].splice(letterCounter - 1, 1);
          // move caret foward and count extra
          letterCounter--;
        }
      }
    } else {
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
