const fs = require('fs');
const path = require('path');

function addDynamicExport(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it's a client component and doesn't already have dynamic export
    if (content.includes('"use client"') && !content.includes('export const dynamic')) {
      const lines = content.split('\n');
      const useClientIndex = lines.findIndex(line => line.includes('"use client"'));
      
      if (useClientIndex !== -1) {
        // Insert dynamic export after "use client"
        lines.splice(useClientIndex + 1, 0, '', '// Force dynamic rendering', 'export const dynamic = \'force-dynamic\'');
        
        const newContent = lines.join('\n');
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Added dynamic export to: ${filePath}`);
      }
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        processDirectory(fullPath);
      } else if (item.endsWith('.tsx') && item !== 'layout.tsx') {
        addDynamicExport(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error.message);
  }
}

// Process all pages in the app directory
const appDir = path.join(__dirname, 'farmtally-frontend', 'src', 'app');
processDirectory(appDir);

console.log('Finished adding dynamic exports to client components');