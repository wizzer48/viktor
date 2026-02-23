
const fs = require('fs');
const path = require('path');
const file = path.join('c:/Bond/test_output.txt');
try {
    const content = fs.readFileSync(file, 'utf16le');
    console.log(content);
} catch (e) {
    console.error(e);
}
