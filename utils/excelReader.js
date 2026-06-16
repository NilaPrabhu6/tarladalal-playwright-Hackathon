const path = require('path');
const XLSX = require('xlsx');

function readIngredients(excelPath,sheetName) {
  const absolutePath = path.resolve(excelPath);
  const workbook = XLSX.readFile(absolutePath);
  const sheet = workbook.Sheets[sheetName] || workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  return rows
    .map(row => String(row.Ingredient || row.ingredient || '').trim())
    .filter(Boolean);
}

module.exports = { readIngredients };
