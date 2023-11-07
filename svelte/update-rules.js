import fs from 'fs/promises';
import {existsSync, createWriteStream} from 'fs';
import http from 'https';

const branch = process.argv.length > 2 ? process.argv[2] : 'main';

console.log(`Branch: ${branch}`);

const url_root = `https://raw.githubusercontent.com/TailedApp/colorization-rules/${branch}/`;

if (await existsSync('./public/rules')) {
    await fs.rm('./public/rules', { recursive: true, force: true })
}

await fs.mkdir('./public/rules');
await download(`${url_root}index.json`, './public/rules/index.json');

const rules = JSON.parse(await fs.readFile('./public/rules/index.json'));

for (let r of rules) {
    await download(`${url_root}${r.filename}`, `./public/rules/${r.filename}`);
}

async function download(url, dest) {
    console.log(url);
    
    return new Promise((resolve, reject) => {
        try {
            const file = createWriteStream(dest);
            http.get(url, function(response) {
              response.pipe(file);
              file.on('finish', function() {
                file.close(resolve);
              });
            });
        }
        catch (e) {
            reject(e);
        }
    });
  }