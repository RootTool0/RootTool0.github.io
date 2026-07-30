const PUZZLES_DATABASE = [
  [ ["const", "int", "*", "const", "*"], "Указатель на константный указатель на константный int" ],
  [ ["volatile", "char", "*", "const", "*"], "Константный указатель на указатель на volatile char" ],
  [ ["inline", "void", "*", "const", "*"], "Константный указатель на указатель на void в inline-контексте" ],
  [ ["const", "char", "*", "const", "*"], "Указатель на константный указатель на константный char" ],
  [ ["int", "*", "const", "*", "const"], "Константный указатель на константный указатель на обычный int" ],
  [ ["volatile", "int", "*", "volatile", "*"], "Volatile-указатель на указатель на volatile int" ],
  [ ["const", "float", "*", "const", "*"], "Указатель на константный указатель на константный float" ],
  [ ["inline", "int", "*", "*", "const"], "Константный указатель на двойной указатель на int в функции inline" ],
  [ ["const", "void", "*", "const", "*"], "Константный указатель на константный указатель на void" ],
  [ ["char", "*", "const", "*", "const"], "Константный указатель на константный указатель на char" ],
  [ ["volatile", "float", "*", "const", "*"], "Константный указатель на указатель на volatile float" ],
  [ ["inline", "char", "*", "const", "*"], "Константный указатель на указатель на char внутри inline-кода" ],
  [ ["const", "int", "*", "*", "const"], "Константный указатель на двойной указатель на константный int" ],
  [ ["float", "*", "const", "*", "const"], "Константный указатель на константный указатель на float" ],
  [ ["volatile", "void", "*", "const", "*"], "Константный указатель на указатель на volatile void" ],
  [ ["const", "float", "*", "*", "const"], "Константный указатель на двойной указатель на константный float" ],
  [ ["inline", "int", "*", "const", "*"], "Константный указатель на указатель на int в inline-контексте" ],
  [ ["char", "*", "*", "*", "const"], "Константный указатель на тройной указатель на char" ],
  [ ["const", "void", "*", "*", "const"], "Константный указатель на двойной указатель на константный void" ],
  [ ["volatile", "int", "*", "*", "const"], "Константный указатель на двойной указатель на volatile int" ]
];

function cIsValidSyntax(guess) {
  const types = ["int", "char", "float", "void"];

  const typeCount = guess.filter(token => types.includes(token)).length;

  if (typeCount === 0) {
    return { valid: false, reason: "decl-specifier-missing", msg: "data type specifier is missing (need int, char, float or void)" };
  }
  if (typeCount > 1) {
    return { valid: false, reason: "two-or-more-data-types", msg: "two or more data types in declaration specifiers" };
  }

  const typeIndex = guess.findIndex(token => types.includes(token));

  const inlineIndex = guess.indexOf("inline");
  if (inlineIndex > 0) {
    return { valid: false, reason: "inline-wrong-position", msg: "'inline' can only appear at the very beginning of declaration" };
  }

  const firstAsteriskIndex = guess.indexOf("*");
  if (firstAsteriskIndex !== -1 && firstAsteriskIndex < typeIndex) {
    return { valid: false, reason: "pointer-before-type", msg: "expected type specifier before '*' token" };
  }

  return { valid: true };
}

function cUpdateConsoleWarning(guess, answer) {
  const output = document.getElementById("console-output");
  
  output.className = "console-output";
  output.innerHTML = "";
  
  const codeLine = guess.join(" ");
  let offset = 0;
  let count = 0;
  for (let elementIndex = 0; elementIndex < guess.length; elementIndex++) {
    if (answer[elementIndex] === "absent") { // 71
      const headerText = `pointerle.c:${gameStateGetCurrentIndex().guessIndex}:${offset + 1}: `;
      output.innerHTML += `${headerText}unused specifier '${guess[elementIndex]}' in declaration context [-Wunused-modifier]\n`;
      output.innerHTML += `${" ".repeat(headerText.length)}${codeLine} p;\n`;
      output.innerHTML += `${" ".repeat(headerText.length)}${"~".repeat(offset)}^${"~".repeat(codeLine.length - offset - 1)}\n`;
      output.innerHTML += "\n";
      ++count;
    }
    
    offset += guess[elementIndex].length + 1;
  }

  if (count !== 0) {
    output.className = "console-output warning";
    output.innerHTML += `${count} warning generated.\n`;
  }
}

function cUpdateConsoleWin(guess) {
  const output = document.getElementById("console-output");

  output.className = "console-output success";
  output.innerHTML = "";
  
  output.innerHTML += `pointerle.c:${gameStateGetCurrentIndex().guessIndex}:1: note: code compiled successfully (0ms)\n`;
  output.innerHTML += `pointerle.c:${gameStateGetCurrentIndex().guessIndex}:1: note: expected signature: '${gameStateGet().secretCode.join(" ")}'\n`;
  output.innerHTML += `pointerle.c:${gameStateGetCurrentIndex().guessIndex}:1: note: signature description: '${gameStateGet().secretDescription}'\n`;
  output.innerHTML += `Build Success. Status: 0 errors, 0 warnings. C++ Master!`;
}

function cUpdateConsoleFail(guess, syntax) {
  const output = document.getElementById("console-output");

  output.className = "console-output error";
  output.innerHTML = "";

  const headerText = `pointerle.c:${gameStateGetCurrentIndex().guessIndex}:${gameStateGetCurrentIndex().guessIndex + 1}: `;
  output.innerHTML += `${headerText}error: ${syntax.msg}\n`;
}
