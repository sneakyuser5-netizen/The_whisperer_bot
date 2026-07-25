const fs = require('fs');
const path = require('path');

const commandsPath = path.join(__dirname, '../commands');
const dictPath = path.join(__dirname, '../language/dictionary.js');
const outputEn = path.join(__dirname, '../language/generated-en.js');
const outputFr = path.join(__dirname, '../language/generated-fr.js');

const dict = require(dictPath);
let created = 0;
let skipped = 0;
const missing = [];

function getAllFiles(dir) {
  let files = [];
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(getAllFiles(fullPath));
    } else if (file.endsWith('.js')) {
      files.push(fullPath);
    }
  });
  return files;
}

const files = getAllFiles(commandsPath);
const en = {};
const fr = {};

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const nameMatch = content.match(/name:\s*["']([^"']+)["']/);
    if (!nameMatch) {
      console.log(`Skipped: ${path.basename(file)} - no name export`);
      skipped++;
      return;
    }
    const name = nameMatch[1];
    
    if (dict[name]) {
      fr[name] = dict[name];
      en[name] = dict[name];
      console.log(`Created: ${name}`);
      created++;
    } else {
      console.log(`Skipped: ${path.basename(file)}`);
      missing.push(name);
      skipped++;
    }
  } catch (e) {
    console.log(`Error in ${file}: ${e.message}`);
  }
});

fs.writeFileSync(outputEn, `module.exports = ${JSON.stringify(en, null, 2)};`);
fs.writeFileSync(outputFr, `module.exports = ${JSON.stringify(fr, null, 2)};`);

console.log(`\nDone!\n\nCommands found: ${files.length}\n\nCreated:\n${Object.keys(fr).length} commands`);
if(missing.length > 0) console.log(`Missing French translations:\n${missing.join('\n')}`);
