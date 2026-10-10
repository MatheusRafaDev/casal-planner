const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/rafae/Documents/GitHub/casal-planner/frontend/src';

function replaceInDir(currentDir) {
  const files = fs.readdirSync(currentDir);
  for (const file of files) {
    const fullPath = path.join(currentDir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      replaceInDir(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content;
      newContent = newContent.replace(/shadow-warm|shadow-elegant|shadow-soft|mask-gradient-x|bg-glass-dark|bg-glass|shadow-glass/g, '');
      newContent = newContent.replace(/bg-gradient-primary/g, 'bg-primary');
      newContent = newContent.replace(/bg-gradient-warm/g, 'bg-muted/30');
      newContent = newContent.replace(/bg-gradient-hero/g, 'bg-muted/10');
      
      // Cleanup multiple spaces in className strings
      newContent = newContent.replace(/className="([^"]+)"/g, (match, p1) => {
        return `className="${p1.replace(/\s+/g, ' ').trim()}"`;
      });
      newContent = newContent.replace(/className=\{([^}]+)\}/g, (match, p1) => {
        return `className={${p1.replace(/"([^"]+)"/g, (m2, p2) => `"${p2.replace(/\s+/g, ' ').trim()}"`)}}`;
      });

      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Replaced in ${fullPath}`);
      }
    }
  }
}

replaceInDir(dir);
console.log("Done");
