const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;
const outputFile = path.join(projectRoot, 'all_code.txt');

const ignoredDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'public'];
const allowedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css', '.scss', '.sql'];
const ignoredFiles = ['package-lock.json', 'collect_code.js', 'all_code.txt'];

let outputContent = '';

function traverseDir(currentPath) {
    const files = fs.readdirSync(currentPath);

    for (const file of files) {
        const fullPath = path.join(currentPath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!ignoredDirs.includes(file)) {
                traverseDir(fullPath);
            }
        } else {
            if (ignoredFiles.includes(file)) {
                continue;
            }
            const ext = path.extname(file);
            if (allowedExtensions.includes(ext) || file === '.env') {
                const relativePath = path.relative(projectRoot, fullPath);
                outputContent += `\n\n================================================================================\n`;
                outputContent += `File: ${relativePath}\n`;
                outputContent += `================================================================================\n\n`;
                outputContent += fs.readFileSync(fullPath, 'utf-8');
                outputContent += `\n`;
            }
        }
    }
}

traverseDir(projectRoot);

fs.writeFileSync(outputFile, outputContent, 'utf-8');
console.log(`Successfully collected all code into ${outputFile}`);
