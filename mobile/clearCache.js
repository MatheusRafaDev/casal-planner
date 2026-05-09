const fs = require('fs');
const path = require('path');

const dirs = ['.expo', 'node_modules/.cache'];

dirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log(`Deleted ${fullPath}`);
  }
});
console.log('Cache cleared!');
