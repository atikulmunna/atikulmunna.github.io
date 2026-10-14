const fs = require('fs');
const path = require('path');
const { HtmlValidate } = require('html-validate');

const ROOT = process.cwd();
const PUBLICATIONS_DIR = path.join(ROOT, 'publications');
const htmlvalidate = new HtmlValidate({
  extends: ['html-validate:recommended']
});

// index.html plus the static publication pages.
function htmlFiles() {
  const files = ['index.html'];
  if (fs.existsSync(PUBLICATIONS_DIR)) {
    fs.readdirSync(PUBLICATIONS_DIR)
      .filter((name) => name.endsWith('.html'))
      .sort()
      .forEach((name) => files.push(path.join('publications', name)));
  }
  return files;
}

async function validate(relativePath) {
  const source = fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
  const report = await Promise.resolve(htmlvalidate.validateString(source));
  const results = report && Array.isArray(report.results) ? report.results : [];

  if (report && report.valid === true) return true;

  if (results.length === 0) {
    console.error(`${relativePath}: HTML validation failed with no detailed report output.`);
    return false;
  }

  results.forEach((result) => {
    result.messages.forEach((message) => {
      console.error(
        `${relativePath}:${message.line}:${message.column} ${message.ruleId} ${message.message}`
      );
    });
  });
  return false;
}

async function run() {
  let valid = true;
  for (const file of htmlFiles()) {
    valid = (await validate(file)) && valid;
  }

  if (!valid) process.exit(1);
  console.log('HTML validation passed.');
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
