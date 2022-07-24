import fs from 'fs';
import { Parser } from 'json2csv';
let cont1 = fs.readFileSync('../p1.json');
cont1 = JSON.parse(cont1);
let cont2 = fs.readFileSync('../p2.json');
cont2 = JSON.parse(cont2);
let cont3 = fs.readFileSync('../p3.json');
cont3 = JSON.parse(cont3);
let cont4 = fs.readFileSync('../p4.json');
cont4 = JSON.parse(cont4);
let cont5 = fs.readFileSync('../p5.json');
cont5 = JSON.parse(cont5);
console.log(cont5.length)

function removeDuplicates(arr) {
    var originalArr = arr.slice(0);
    var i, len, val;
    arr.length = 0;

    for (i = 0, len = originalArr.length; i < len; ++i) {
        val = originalArr[i];
        if (!arr.some(function(item) { return item.url == val.url })) {
            arr.push(val);
        }
    }
}
let full = [];
cont1.forEach(x => full.push({...x,bias:"S"}));
cont2.forEach(x => full.push({...x,bias:"V"}));
cont3.forEach(x => full.push({...x,bias:"N"}));
cont4.forEach(x => full.push({...x,bias:"N"}));
cont5.forEach(x => full.push({...x,bias:"N"}));
console.log(full.length);
let checker = (arr, target) => target.every(v => arr.includes(v));
full = full.filter(x => !checker(x.content,['Скопје','Активни','Куманово','Битола','Прилеп','Тетово']))
full = full.filter(x => !x.content.length==0)
removeDuplicates(full);
console.log(full.length);
const fields = ['url', 'content', 'bias'];
const opts = { fields };
const parser = new Parser(opts);
const csv = parser.parse(full);
fs.writeFileSync('../dataset.csv', csv, (err) => {
    if (err) {
        throw err;
    }
});