const fs = require('fs');
const content = fs.readFileSync('server/server.js', 'utf8');

let braces = 0;
let parens = 0;
let stack = [];

for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '{') { braces++; stack.push('{'); }
    if (char === '}') { braces--; if (stack.pop() !== '{') console.log('Mismatch at ' + i); }
    if (char === '(') { parens++; stack.push('('); }
    if (char === ')') { parens--; if (stack.pop() !== '(') console.log('Mismatch at ' + i); }
}

console.log(`Final Braces: ${braces}`);
console.log(`Final Parens: ${parens}`);
if (braces === 0 && parens === 0) console.log("Balanced!");
else console.log("IMBALANCED!");
