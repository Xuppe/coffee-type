// - - - - - - - - - - - - variables setup - - - - - - - - - - - -

// dom references
const wordsInput = document.querySelector('.words-input');
const wordsDisplay = document.querySelector('.words-display');
const resetButton = document.querySelector('.reset-button');
const scoreContainer = document.querySelector('.score-container');
const header = document.querySelector('header');
const personalBest = document.querySelector('.personal-best')
const caret = document.querySelector('.caret-element');

// colour theme button references
const colourButton = document.querySelector('.colour-button');
const colourMenu = document.querySelector('.colour-selection-container');
const buttonBanana = document.querySelector('.b-banana');
const buttonMango = document.querySelector('.b-mango');
const buttonMilkshake = document.querySelector('.b-milkshake');
const buttonMochi = document.querySelector('.b-mochi');
const buttonClassic = document.querySelector('.b-classic');


// colour theme variables
const colourBanana = 50;
const colourMango = 23;
const colourMilkshake = 329;
const colourApple = 360;
const colourMochi = 162;

// word selection variables
const wordSet1 = "hello how yes are you good what about very great nice to see because limited time against clock";
const wordSet2 = "welcome fantasy yell fall summer season second minute angle mind happy go ready please send message";

let totalLetters;
let progressBars = [];

let words = 15;
let wordList = wordSet1;

let started = false;
let finished = false;

// application variables
let wordsArray;
let letterCounter;
let wordCounter;
let startTime;
let endTime;

let correctLetters;
let incorrectLetters;
let extraLetters;
let missedLetters;


// - - - - - - - - - - - - functions setup - - - - - - - - - - - -

//  return random number function
// - - - - - - - - - - - -
function random(min, max) {
  const num = Math.floor(Math.random() * (max - min + 1)) + min;
  return num;
}

// interface dimming function
// - - - - - - - - - - - -
function dimInterface(toggle) {
  if (toggle === true) {
    header.style.opacity = '0.1';
    resetButton.style.opacity = '0.1';
    document.documentElement.style.cursor = 'none';
  } else if (toggle === false) {
    header.style.opacity = '1.0';
    resetButton.style.opacity = '1.0';
    document.documentElement.style.cursor = 'auto';
  }
}

// update caret function
// - - - - - - - - - - - -
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

// create progress bars function
// - - - - - - - - - - - -
function createProgressBars() {
  let barsContainer = document.querySelector('.progress-bars-container');
  let newBar = document.createElement('div');
  newBar.classList.add('progress-bar');
  barsContainer.appendChild(newBar);
  progressBars.push(newBar);
}

// update progress bars function
// - - - - - - - - - - - -
function updateProgressBars() {
  let correctLetters = 0;
  for (let i = 0; i < wordsArray.length; i++) {
    for (let j = 0; j < wordsArray[i].length; j++) {
      if ((wordsArray[i][j].classList.contains('correct')
      || wordsArray[i][j].classList.contains('incorrect-word')
      || wordsArray[i][j].classList.contains('correct-space')
      || wordsArray[i][j].classList.contains('incorrect'))
      && !wordsArray[i][j].classList.contains('extra-letter')) {
        correctLetters++;
      }
    }
  }
  let currentProgress = (((correctLetters / totalLetters) * 100) + 1).toFixed(2);
  progressBars[0].style.width = currentProgress + '%';
}

// reset progress bars function
// - - - - - - - - - - - -
function resetProgressBars() {
  progressBars[0].style.width = 0 + '%';
}

// finish test function
// - - - - - - - - - - - -
function finishTest() {
  finished = true;
  endTime = Date.now();
  scoreContainer.firstElementChild.innerText = wpmCalc(startTime, endTime, wordsArray);
  dimInterface(false);
  scoreContainer.classList.add('score-visible');
}

// update locally stored person best
// - - - - - - - - - - - -
function updatePersonalBest(wpm) {
  // check against WPM score against stored personal best
  if (!localStorage.getItem('pb')) {
    localStorage.setItem('pb', wpm);
  } else {
    let pb = localStorage.getItem('pb');
    if (pb < wpm) {
      localStorage.setItem('pb', wpm.toFixed(0));
      personalBest.innerText = "🎉 New Personal Best";
    } else {
      personalBest.innerText = "Personal best WPM: " + Number(pb).toFixed(0);
    }
  }
}

// update locally stored theme colour
// - - - - - - - - - - - -
function updateTheme(colour) {
  document.documentElement.style.setProperty('--incorrect-letter-colour', `hsl(${colour}, 63%, 51%)`);
  document.documentElement.style.setProperty('--extra-letter-colour', `hsl(${colour}, 63%, 30%)`);
  document.documentElement.style.setProperty('--incorrect-word-colour', `hsl(${colour}, 63%, 51%)`);
  document.documentElement.style.setProperty('--progress-colour', `hsl(${colour}, 63%, 51%)`);
  document.documentElement.style.setProperty('--background-colour', `hsl(${colour}, 8%, 11%)`);
  localStorage.setItem('themeColour', colour);
}

// calculate and return words per minute function
// - - - - - - - - - - - -
function wpmCalc(startTime, endTime, wordsArray) {
  let correctLetters = 0;
  let incorrectLetters = 0;
  let extraLetters = 0;
  let missedLetters = 0;

  for (let i = 0; i < wordsArray.length; i++) {
    for (let j = 0; j < wordsArray[i].length; j++) {
      if ((wordsArray[i][j].classList.contains('correct') || wordsArray[i][j].classList.contains('correct-space'))
      && !wordsArray[i][j].classList.contains('incorrect-word')) {
        correctLetters++;
      } else if (wordsArray[i][j].classList.contains('incorrect')) {
        incorrectLetters++;
      } else if (wordsArray[i][j].classList.contains('extra-letter')) {
        extraLetters++;
      } else if (wordsArray[i][j].classList.contains('incorrect-word') && !wordsArray[i][j].classList.contains('correct') && !wordsArray[i][j].classList.contains('incorrect-letter')) {
        missedLetters++;
      }
    }
  }

  // calculate words per minute
  let time = (endTime - startTime) / 1000 / 60;
  let grossWPM = (correctLetters / 5) / time;
  let adjustedWPM = grossWPM - ((incorrectLetters + extraLetters + missedLetters) / time);
  updatePersonalBest(adjustedWPM);
  return `⏲ WPM: ${adjustedWPM.toFixed(0)}`;
}


// - - - - - - - - - - - - main program setup function - - - - - - - - - - - -

function setup() {

  // reset variables
  wordsArray = [];
  letterCounter = 0;
  wordCounter = 0;
  totalLetters = 0;
  started = false;
  finished = false;

  dimInterface(false);
  colourMenu.style.visibility = 'hidden';

  scoreContainer.classList.remove('score-visible');

  // clear existing words
  while (wordsDisplay.firstChild) {
    wordsDisplay.firstChild.remove();
  }

  // use saved theme if available
  if (localStorage.getItem('themeColour')) {
    updateTheme(localStorage.getItem('themeColour'));
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
      totalLetters++;
    }

    // add spacing span at the end of every word
    let spacing = document.createElement('span');
    spacing.innerText = ' ';
    word.appendChild(spacing);
    letters.push(spacing);
    wordsArray.push(letters);
    wordsDisplay.appendChild(word);
    totalLetters++;
  }
  wordsArray[0][0].classList.add('caret');

  // update caret position and display progress bars
  if (progressBars[0]) {
    resetProgressBars();
  } else {
    createProgressBars();
  }
  updateCaret();
  caret.style.transitionDuration = '0.12s';
}


// - - - - - - - - - - - - input event responses setup - - - - - - - - - - - -

// reposition caret when window is resized
window.onresize = updateCaret;

// words input on focus
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
    dimInterface(false);
    resetButton.focus();
  }
}

// reset button function click
resetButton.onclick = function() {
  // reset focus to the input box and call the setup function
  wordsInput.focus();
  dimInterface(false);
  setup();
}

// when moving the mouse, toggle the dimming effect
document.onmousemove = function() {
  dimInterface(false);
}


// - - - - - - - - - - - - main application input checking - - - - - - - - - - - -

wordsInput.oninput = function(e) {
  // check if the test is running, if not, record the time the user starts typing
  if (!started) {
    started = true;
    startTime = Date.now();
    // change the progress bar colour when a new test is started
  }
  // if the test has finished, return
  if (finished){
    return;
  } else {
    // dim user interface
    dimInterface(true);
  }
  // letter input checking
  // set the current letter as the letter that the user has just typed
  let currentLetter = e.data;
  // space input, checking if the user has entered at least one letter in the current word
  if (currentLetter === ' ' && letterCounter > 0) {
    // move caret to the next word and set letter selector back to zero, if the word is the last one, end the game
    wordsArray[wordCounter][letterCounter].classList.remove('caret');
    if (letterCounter === wordsArray[wordCounter].length - 1) {
      wordsArray[wordCounter][letterCounter].classList.add('correct-space');
    }
    // check if word has incorrect or missing letters, if so, add appropirate class
    for (let i = 0; i < wordsArray[wordCounter].length - 1; i++) {
      if (!wordsArray[wordCounter][i].classList.contains('correct')) {
        for (let j = 0; j < wordsArray[wordCounter].length - 1; j++) {
          wordsArray[wordCounter][j].classList.add('incorrect-word');
        }
        wordsArray[wordCounter][wordsArray[wordCounter].length - 1].classList.remove('correct-space');
      }
    }
    updateProgressBars();
    // end the test if the current word is the last one
    if (wordCounter === wordsArray.length - 1) {
      finishTest();
      return;
    }
    // otherwise contiunue and iterate selector values
    wordCounter++;
    letterCounter = 0;
    // update caret position and clear input box
    wordsArray[wordCounter][letterCounter].classList.add('caret');
    updateCaret();
    wordsInput.value = '';
  } else if (currentLetter === wordsArray[wordCounter][letterCounter].innerText && currentLetter !== ' ' && currentLetter !== null) {
    // checking if correct letter has been entered, if so, move caret forward and style test accordingly, and check if it was the last character, ending the test
    wordsArray[wordCounter][letterCounter].classList.add('correct');
    wordsArray[wordCounter][letterCounter].classList.remove('caret');
    updateCaret();
    updateProgressBars();
    // end the test if the current letter is corrent and the last letter of the last word
    if (letterCounter === wordsArray[wordCounter].length - 2 && wordCounter === wordsArray.length - 1) {
      finishTest();
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
      updateProgressBars();
      updateCaret();
      letterCounter++;
    } else if (wordsArray[wordCounter].length < 20) {
      // insert extra letter
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
        wordsArray[wordCounter][letterCounter - 1].classList.add('caret');
        wordsArray[wordCounter][letterCounter].classList.remove('caret');
        letterCounter--;
        updateCaret();
        updateProgressBars();
      } else {
        // if letter is an extra added to the end of the word, remove it
        if (wordsArray[wordCounter][letterCounter - 1].classList.contains('extra-letter')) {
          // remove extra letter and decrement the letters counter
          wordsArray[wordCounter][letterCounter - 1].remove();
          wordsArray[wordCounter].splice(letterCounter - 1, 1);
          letterCounter--;
          updateCaret();
          updateProgressBars();
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
          updateProgressBars();
          return;
        }
      }
    }
  }
}


// - - - - - - - - - - - - colour theme button functions - - - - - - - - - - - -

colourButton.onclick = function() {
  colourMenu.style.visibility = 'visible';
  colourMenu.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
}

colourMenu.onclick = function() {
  colourMenu.style.visibility = 'hidden';
  colourMenu.style.backgroundColor = 'rgba(0, 0, 0, 0.0)';
}

buttonBanana.onclick = function() {
  wordsInput.focus();
  updateTheme(colourBanana);
  colourMenu.style.visibility = 'hidden';
  colourMenu.style.backgroundColor = 'rgba(0, 0, 0, 0.0)';
}

buttonMango.onclick = function() {
  wordsInput.focus();
  updateTheme(colourMango);
  colourMenu.style.visibility = 'hidden';
  colourMenu.style.backgroundColor = 'rgba(0, 0, 0, 0.0)';
}

buttonMilkshake.onclick = function() {
  wordsInput.focus();
  updateTheme(colourMilkshake);
  colourMenu.style.visibility = 'hidden';
  colourMenu.style.backgroundColor = 'rgba(0, 0, 0, 0.0)';
}

buttonMochi.onclick = function() {
  wordsInput.focus();
  updateTheme(colourMochi);
  colourMenu.style.visibility = 'hidden';
  colourMenu.style.backgroundColor = 'rgba(0, 0, 0, 0.0)';
}

buttonClassic.onclick = function() {
  wordsInput.focus();
  document.documentElement.style.setProperty('--incorrect-letter-colour', `hsl(0, 0%, 30%)`);
  document.documentElement.style.setProperty('--extra-letter-colour', `hsl(0, 0%, 30%)`);
  document.documentElement.style.setProperty('--incorrect-word-colour', `hsl(0, 0%, 51%)`);
  document.documentElement.style.setProperty('--progress-colour', `hsl(0, 0%, 51%)`);
  document.documentElement.style.setProperty('--background-colour', `hsl(0, 0%, 11%)`);
  localStorage.removeItem('themeColour');
  colourMenu.style.visibility = 'hidden';
  colourMenu.style.backgroundColor = 'rgba(0, 0, 0, 0.0)';
}

// - - - - - - - - - - - - call setup to initialise program - - - - - - - - - - - -

setup();
