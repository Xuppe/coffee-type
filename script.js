// setup variables
const wordsInput = document.querySelector('.words-input');
const wordsDisplay = document.querySelector('.words-display');
const resetButton = document.querySelector('.reset-button');
const scoreContainer = document.querySelector('.score-container');
const header = document.querySelector('header');
const personalBest = document.querySelector('.personal-best')

const caret = document.querySelector('.caret-element');

const wordSet1 = "hello how yes are you good what about very great nice to see because limited time against clock";
const wordSet2 = "welcome fantasy yell fall summer season second minute angle mind happy go ready please send message";

// word selection variables
let words = 25;
let wordList = wordSet1;

let started = false;
let finished = false;

let wordsArray;
let letterCounter;
let wordCounter;
let startTime;
let endTime;

let correctLetters;
let incorrectLetters;
let extraLetters;
let missedLetters;



function random(min, max) {
  const num = Math.floor(Math.random() * (max - min + 1)) + min;
  return num;
}

function dimToggle(toggle) {
  if (toggle === true) {
    header.style.opacity = '0.1';
    resetButton.style.opacity = '0.1';
  } else if (toggle === false) {
    header.style.opacity = '1.0';
    resetButton.style.opacity = '1.0';
  }
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

  // calculate words per minute
  let time = endTime - startTime;
  time = time / 1000 / 60;
  let grossWPM = ((totalCharacters) / 5) / time;
  let adjustedWPM = grossWPM - ((incorrectLetters + missedLetters + extraLetters)/time);

  // check against WPM score against stored personal best
  if (!localStorage.getItem('pb')) {
    localStorage.setItem('pb', adjustedWPM);
  } else {
    let pb = localStorage.getItem('pb');
    if (pb < adjustedWPM) {
      localStorage.setItem('pb', adjustedWPM);
      personalBest.innerText = "🎉 New Personal Best";
    } else {
      personalBest.innerText = "Personal best WPM: " + Number(pb).toFixed(0);
    }
  }

  // return score
  return `⏲ WPM: ${adjustedWPM.toFixed(0)}`;
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

  // update caret position and display
  updateCaret();
}

// first time setup
setup();

// move carret to new posision based on reference element with caret class
// if there is no element with the caret class, than hide the caret element
function updateCaret() {
  if (!document.querySelector('.caret')) {
    caret.style.opacity = '0';
  } else {
    let caretElementReference = document.querySelector('.caret');
    let elementPos = caretElementReference.getBoundingClientRect();
    caret.style.height = elementPos.height + 'px';
    caret.style.width = elementPos.width + 'px';
    caret.style.left = elementPos.left + 'px';
    caret.style.top = elementPos.top + 'px';
    caret.style.opacity = '1';
  }
}

// reposition caret when window is resized
window.onresize = updateCaret;

// words input focus
wordsDisplay.onclick = function() {
  wordsInput.focus();
}
wordsInput.onblur = function() {
  wordsArray[wordCounter][letterCounter].classList.remove('caret');
  updateCaret();
}
wordsInput.onfocus = function() {
  if (!finished){
    wordsArray[wordCounter][letterCounter].classList.add('caret');
    updateCaret();
  }
}

// tab key focus on reset button
window.onkeydown = function(e) {
  if (e.code === "Tab") {
    e.preventDefault();
    dimToggle(false);
    resetButton.focus();
  }
}

// reset button function click
resetButton.onclick = function() {
  // reset focus to the input box and call the setup function
  wordsInput.focus();
  dimToggle(false);
  setup();
}

// when moving the mouse, toggle the dimming effect
document.onmousemove = function() {
  dimToggle(false);
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
  } else {
    // dim header and controls when typing
    dimToggle(true);
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
      dimToggle(false);
      scoreContainer.classList.add('score-visible');
      return;
    }
    // otherwise contiunue and move caret to the next word and check previous for errors
    wordCounter++;
    letterCounter = 0;
    wordsArray[wordCounter][letterCounter].classList.add('caret');
    updateCaret();
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
    updateCaret();
    // end the test if the current letter is corrent and the last letter of the last word
    if (letterCounter === wordsArray[wordCounter].length - 2 && wordCounter === wordsArray.length - 1) {
      finished = true;
      endTime = Date.now();
      scoreContainer.firstElementChild.innerText = wpmCalc(startTime, endTime, wordsArray);
      dimToggle(false);
      scoreContainer.classList.add('score-visible');
      return;
    }
    // otherwise contiunue and move caret forward and increment letterCounter;
    wordsArray[wordCounter][letterCounter + 1].classList.add('caret');
    updateCaret();
    letterCounter++;
  } else if (currentLetter !== wordsArray[wordCounter][letterCounter].innerText && currentLetter !== ' ' && currentLetter !== null) {
    // checking if incorrect or extra letter
    if (letterCounter !== wordsArray[wordCounter].length - 1){
      wordsArray[wordCounter][letterCounter].classList.add('incorrect');
      wordsArray[wordCounter][letterCounter].setAttribute('typed-letter', currentLetter);
      wordsArray[wordCounter][letterCounter + 1].classList.add('caret');
      wordsArray[wordCounter][letterCounter].classList.remove('caret');
      updateCaret();
      letterCounter++;
    } else if (wordsArray[wordCounter].length < 20) {
      // insert extra word
      let extraLetter = document.createElement('span');
      extraLetter.innerText = currentLetter;
      extraLetter.classList.add('extra-letter');
      wordsArray[wordCounter][letterCounter].parentNode.insertBefore(extraLetter, wordsArray[wordCounter][letterCounter]);
      wordsArray[wordCounter].splice(letterCounter, 0, extraLetter);
      updateCaret();
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
        updateCaret();
      } else {
        // if letter is an extra added to the end of the word, remove it
        if (wordsArray[wordCounter][letterCounter - 1].classList.contains('extra-letter')) {
          // remove extra letter and decrement the letters counter
          wordsArray[wordCounter][letterCounter - 1].remove();
          wordsArray[wordCounter].splice(letterCounter - 1, 1);
          updateCaret();
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
          updateCaret();
          return;
        }
      }
    }
  }
}
