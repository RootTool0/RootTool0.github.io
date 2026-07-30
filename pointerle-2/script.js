let gameState = {
  language: "c",
  c: {
    mode: "daily",
    daily:   { secretCode: [], secretDescription: "", attempts: [], lastPlayedDate: "" },
    endless: { secretCode: [], secretDescription: "", attempts: [] }
  },
  cpp: {
    mode: "daily",
    daily:   { secretCode: [], secretDescription: "", attempts: [], lastPlayedDate: "" },
    endless: { secretCode: [], secretDescription: "", attempts: [] }
  },
  rust: {
    mode: "daily",
    daily:   { secretCode: [], secretDescription: "", attempts: [], lastPlayedDate: "" },
    endless: { secretCode: [], secretDescription: "", attempts: [] }
  }
}

/*
gameState.rust.daily.secretCode = ["volatile", "float", "*"]
gameState.rust.daily.secretCode = ["volatile", "float", "*", "const", "*"]
gameState.rust.daily.secretCode = ["volatile", "float", "*", "const", "*", "const", "*"]
*/

const gameStateSave = () => localStorage.setItem('pointerle_game_state', JSON.stringify(gameState));
const gameStateGet = () => gameState[gameState.language][gameStateGetMode()];
const gameStateGetMode = () => gameState[gameState.language].mode;
const gameStateGetCurrentIndex = () => {
  let guessIndex = gameStateGet().attempts.findIndex(row => row.includes(""));
  if (guessIndex === -1) guessIndex = gameStateGet().attempts.length - 1;
  let elementIndex = gameStateGet().attempts[guessIndex].indexOf("");
  if (elementIndex === -1) elementIndex = gameStateGet().attempts[guessIndex].length - 1;
  return { guessIndex: guessIndex, elementIndex: elementIndex };
};

const guessIsEmpty = (guess) => guess.every(item => item === "");
const guessIsFull = (guess) => guess.at(-1) !== "";
const guessGetLastIndex = (guess) => guess.indexOf("") === -1 ? guess.length - 1 : guess.indexOf("");
const guessIsWin = (guess) => guess.every((token, i) => token === gameStateGet().secretCode[i]);

document.addEventListener("DOMContentLoaded", () => {
  initPointerle();
  initGrid();
  initLastPuzzle();
  initCurrentPuzzle();

  const keyboard = document.getElementById("keyboard");

  keyboard.addEventListener("click", (event) => {
    const target = event.target;

    if (!target.classList.contains("key")) return;

    const token = target.dataset.token;
    const action = target.dataset.action;

    if (token) handleTokenInput(token);
    else if (action) handleActionInput(action);
  });
});

function initPointerle() {
  const raw = localStorage.getItem('pointerle_game_state');
  
  if(raw) gameState = JSON.parse(raw);
  else gameStateSave();
  
  console.log(`Pointerle JSON:\n${JSON.stringify(gameState, null, 2)}`);
  
  function resizeArrayInPlace(arr, isNested, targetSize) {
    if(arr.length > targetSize) {
      arr.length = targetSize;
    } else {
      while (arr.length < targetSize)
        arr.push(isNested ? "" : []);
    }
  }
  
  const targetSize = gameStateGet().secretCode.length
  resizeArrayInPlace(gameStateGet().attempts, false, 6)
  resizeArrayInPlace(gameStateGet().attempts[0], true, targetSize)
  resizeArrayInPlace(gameStateGet().attempts[1], true, targetSize)
  resizeArrayInPlace(gameStateGet().attempts[2], true, targetSize)
  resizeArrayInPlace(gameStateGet().attempts[3], true, targetSize)
  resizeArrayInPlace(gameStateGet().attempts[4], true, targetSize)
  resizeArrayInPlace(gameStateGet().attempts[5], true, targetSize)
  gameStateSave();
}

function initGrid() {
  document.querySelector(".board").style.setProperty("--length", String(gameStateGet().secretCode.length));

  const wrappers = document.querySelectorAll(".row-wrapper");
  wrappers.forEach((wrapper) => {
    const tilesHTML = Array(gameStateGet().secretCode.length).fill('<div class="tile"></div>').join("");

    wrapper.innerHTML = `
      <div class="row">
        ${tilesHTML}
      </div>
      <div class="code-tail">p;</div>
    `;
  });
}

function initLastPuzzle() {
  for (let guessIndex = 0; guessIndex < gameStateGet().attempts.length; guessIndex++) {
    const guess = gameStateGet().attempts[guessIndex];
    if (guessIsEmpty(guess)) return;

    const tiles = document.querySelectorAll(".board .row")[guessIndex].children;

    for (let i = 0; i < guess.length; i++) {
      tiles[i].textContent = guess[i];
    }

    if(guessIsFull(guess)) {
      const answer = checkGuess(guess);

      for (let i = 0; i < guess.length; i++) {
        tiles[i].classList.add(answer[i]);
        updateKeyboardColor(guess[i], answer[i]);
      }
      cUpdateConsoleWarning(guess, answer);
      continue;
    }
    
    for (let i = 0; i < guessGetLastIndex(guess); i++) {
      tiles[i].classList.add("pop");
    }
  }
}

function initCurrentPuzzle() {
  if(gameStateGetMode() === "daily"){
    // TODO: Load New штуковины here...
  }
  
  // const randomIndex = Math.floor(Math.random() * PUZZLES_DATABASE.length);
  // gameStateGet().secretCode = PUZZLES_DATABASE[randomIndex][0];
  // gameStateGet().secretDescription = PUZZLES_DATABASE[randomIndex][1];
  // gameStateSave();
  
  console.log(`SECRET_CODE: ${gameStateGet().secretCode.join(" ")}\nSECRET_DESCRIPTION: ${gameStateGet().secretDescription}\n`);
}

function handleActionInput(action) {
  const rowElements = document.querySelectorAll(".board .row");

  if (action === "backspace") {
    let { guessIndex, elementIndex } = gameStateGetCurrentIndex();
    let guess = gameStateGet().attempts[guessIndex];

    if (guessIsEmpty(guess)) {
      if (guessIndex === 0) return;
      guessIndex = guessIndex - 1;
      guess = gameStateGet().attempts[guessIndex];
      elementIndex = guess.length - 1;
    }

    elementIndex = guess[elementIndex] !== "" ? elementIndex : elementIndex - 1;
    if (elementIndex < 0) return;

    const currentTileElement = rowElements[guessIndex].children[elementIndex];
    if (!currentTileElement.classList.contains("pop")) return;
    
    gameStateGet().attempts[guessIndex][elementIndex] = "";
    gameStateSave();
    
    currentTileElement.textContent = "";
    currentTileElement.classList.remove("pop");
  }
}

function handleTokenInput(token) {
  let { guessIndex, elementIndex } = gameStateGetCurrentIndex();
  const guess = gameStateGet().attempts[guessIndex];
  if (guessIndex === gameStateGet().attempts.length - 1 && guessIsFull(guess)) return;
  const tiles = document.querySelectorAll(".board .row")[guessIndex].children;
  
  if (guessIndex !== 0 && (document.querySelectorAll(".board .row")[guessIndex - 1].children[0].classList.contains("pop") || guessIsWin(gameStateGet().attempts[guessIndex - 1]))) 
      return;
  
  guess[elementIndex] = token;
  gameStateSave();
  
  const element = tiles[elementIndex];
  element.textContent = token;
  element.classList.add("pop");

  if (!guessIsFull(guess)) return;

  const syntax = isValidSyntax(guess);
  if (!syntax.valid) {
    cUpdateConsoleFail(guess, syntax);
    return;
  }

  const answer = checkGuess(guess);

  for (let i = 0; i < guess.length; i++) {
    const status = answer[i];

    setTimeout(() => {
      tiles[i].classList.remove("pop");
      tiles[i].classList.add(status);

      updateKeyboardColor(guess[i], status);
    }, i * 200);
  }
  
  setTimeout(() => {
    
    if (guessIsWin(guess)) {
      cUpdateConsoleWin(guess)
    } else {
      cUpdateConsoleWarning(guess, answer);
    }
    
  }, guess.length * 200);
}

function updateKeyboardColor(token, status) {
  const keyElement = document.querySelector(`.key[data-token="${token}"]`);
  if (!keyElement) return;

  if (keyElement.classList.contains("correct")) return;
  if (keyElement.classList.contains("present") && status === "absent") return;

  keyElement.classList.remove("correct", "present", "absent");
  keyElement.classList.add(status);
}

function isValidSyntax(guess){
  /**/ if(gameState.currentLanguage === "cpp") return cppIsValidSyntax(guess);
  else if(gameState.currentLanguage === "rust") return rustIsValidSyntax(guess);
  else return cIsValidSyntax(guess);
}

function checkGuess(guess){
  const answer = Array(guess.length).fill("absent");
  const secretCounts = {};

  for (let token of gameStateGet().secretCode) secretCounts[token] = (secretCounts[token] || 0) + 1;

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === gameStateGet().secretCode[i]) {
      answer[i] = "correct";
      secretCounts[guess[i]]--;
    }
  }

  for (let i = 0; i < guess.length; i++) {
    if (answer[i] === "correct") continue;

    const token = guess[i];
    if (secretCounts[token] && secretCounts[token] > 0) {
      answer[i] = "present";
      secretCounts[token]--;
    }
  }

  return answer;
}

function pointerleResetMap() {
  gameStateGet().attempts = gameStateGet().attempts.map(() => Array(gameStateGet().secretCode.length).fill(""));
  gameStateSave();
}

function pointerleResetStorage() {
  localStorage.clear(); 
  location.reload();
}

function pointerleSetLanguage(language) {
  gameState.language = language;
  gameStateSave();
}
