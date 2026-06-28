const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules') replaceInDir(fullPath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('localhost:3000')) {
                console.log('Updating:', fullPath);
                content = content.replace(/localhost:3000/g, 'localhost:3001');
                fs.writeFileSync(fullPath, content);
            }
        }
    }
}

replaceInDir('./src');
