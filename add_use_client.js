const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./app').filter(f => f.endsWith('.tsx'));
files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (/(useEffect|useState|useRef)/.test(content) && !content.includes('use client')) {
        fs.writeFileSync(file, '"use client";\n' + content);
        console.log('Fixed:', file);
    }
});
