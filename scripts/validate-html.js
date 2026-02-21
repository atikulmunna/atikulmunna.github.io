const fs = require('fs');
const path = require('path');
const { HtmlValidate } = require('html-validate');

const ROOT = process.cwd();
const htmlPath = path.join(ROOT, 'index.html');
const source = fs.readFileSync(htmlPath, 'utf8');
const htmlvalidate = new HtmlValidate({
  extends: ['html-validate:recommended']
});

async function run() {
  const rawReport = htmlvalidate.validateString(source);
  const report = await Promise.resolve(rawReport);
  const results = report && Array.isArray(report.results) ? report.results : [];

  if (!report || report.valid !== true) {
    if (results.length === 0) {
      console.error('HTML validation failed with no detailed report output.');
      process.exit(1);
    }

    results.forEach((result) => {
      result.messages.forEach((message) => {
        console.error(
          `${result.filePath || 'index.html'}:${message.line}:${message.column} ${message.ruleId} ${message.message}`
        );
      });
    });
    process.exit(1);
  }

  console.log('HTML validation passed.');
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
