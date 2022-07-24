import fs from 'fs'
import { Parser } from 'json2csv';
import JSONStream from "JSONStream"

let file = fs.readFileSync('../mega_contents.json');
let file1 = fs.readFileSync('../mega_contents1.json');
let file2 = fs.readFileSync('../mega_contents2.json');
let file3 = fs.readFileSync('../mega_contents3.json');
let file4 = fs.readFileSync('../mega_contents4.json');
let file5 = fs.readFileSync('../mega_contents5.json');
let file6 = fs.readFileSync('../mega_contents6.json');
let file7 = fs.readFileSync('../mega_contents7.json');
let file8 = fs.readFileSync('../mega_contents8.json');
let file9 = fs.readFileSync('../mega_contents9.json');
let file10 = fs.readFileSync('../mega_contents10.json');
file = JSON.parse(file);
file1 = JSON.parse(file1);
file2 = JSON.parse(file2);
file3 = JSON.parse(file3);
file4 = JSON.parse(file4);
file5 = JSON.parse(file5);
file6 = JSON.parse(file6);
file7 = JSON.parse(file7);
file8 = JSON.parse(file8);
file9 = JSON.parse(file9);
file10 = JSON.parse(file10);
file = file.concat(file1);
file = file.concat(file2);
file = file.concat(file3);
file = file.concat(file4);
file = file.concat(file5);
file = file.concat(file6);
file = file.concat(file7);
file = file.concat(file8);
console.log(file.length)
file = file.concat(file9);
file = file.concat(file10);
console.log(file.length)
console.log(file9.length)
console.log(file10.length)
file = [...new Map(file.map(v => [v.url, v])).values()]
console.log(file.length)
let urls = fs.readFileSync("../mega_links.json")
urls = JSON.parse(urls)
const fetched_urls = file.map(el => el.url);
console.log(fetched_urls.filter(x => x.includes('sdk.mk'))[0])
console.log("MISSING")
console.log(urls.length)
console.log(fetched_urls.length)
function *setMinus(A, B) {
    const setA = new Set(A);
    const setB = new Set(B);

    for (const v of setB.values()) {
      if (!setA.delete(v)) {
          yield v;
      }
    }

    for (const v of setA.values()) {
      yield v;
    }
  }

let missing = Array.from(setMinus(urls, fetched_urls))
missing = Array.from(missing);
console.log(missing.length)
const obj = new Object()
for(let el of fetched_urls){
    const split = el.split('//')[1].split('/')[0]
    if(obj[split] == undefined){
        obj[split] = 1;
    }
    else{
        obj[split]++;
    }
}
console.log(obj);
let transformStream = JSONStream.stringify();
let outputStream = fs.createWriteStream("../giga_contents.json" );
transformStream.pipe( outputStream );    
file.forEach( transformStream.write );
transformStream.end();

outputStream.on(
    "finish",
    function handleFinish() {
        console.log("Done");
    }
);