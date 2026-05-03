const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

async function extractText(filePath) {
  const safePath = path.resolve(filePath);
  const dataBuffer = fs.readFileSync(safePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

module.exports = { extractText };
