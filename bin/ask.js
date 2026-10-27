"use strict";

const readline = require("readline");

/** Asks a yes/no question; an empty answer is "yes". */
function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      resolve(!/^n/i.test(answer.trim()));
    })
  );
}

module.exports = { ask };
