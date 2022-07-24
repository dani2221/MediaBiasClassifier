import fs from 'fs';
import fetch from "node-fetch"
import jsdom from "jsdom";

const promiseTimeout = (ms, promise)=>{
    let timeout = new Promise((resolve, reject) => {
      let id = setTimeout(() => {
        clearTimeout(id);
        reject('Timed out in '+ ms + 'ms.')
      }, ms)
    })
    return Promise.race([
      promise,
      timeout
    ])
}

const genUrls = () => {
    const urls = [];
    for(let i=0;i<3200;i+=10){
        urls.push(`https://www.vmro-dpmne.org.mk/index.php/vesti/soopstenija?start=${i}`);
    }
    return urls;
}
const getData = async () => {
    let enu = 0;
    for(let url of genUrls()){
        const res = await fetch(url);
        const content = await res.text();
        const dom = new jsdom.JSDOM(content,{contentType:"text/html"});
        let items = []; 
        for(let child of dom.window.document.getElementsByClassName('entry-header')){
            items.push(child.getElementsByTagName('h2')[0].children[0])
        }
        for(let i=0;i<10;i+=5){
            let promises = [
                promiseTimeout(10000,fetch(items[i].href)),
                promiseTimeout(10000,fetch(items[i+1].href)),
                promiseTimeout(10000,fetch(items[i+2].href)),
                promiseTimeout(10000,fetch(items[i+3].href)),
                promiseTimeout(10000,fetch(items[i+4].href))
            ]
            let results;
            let dat;
            try{
                results = await Promise.allSettled(promises);
                promises = [];
                promises = results.map(el=>el.value!=undefined ? el.value.text():'');
                dat = await Promise.allSettled(promises)
            }catch(e){
                console.log(e);
                continue;
            }
            const batch = [];
            let urlCount = 0;
            for(let result of dat){
                const articleDom = new jsdom.JSDOM(result.value,{contentType:"text/html"});
                let textElement = articleDom.window.document
                .getElementsByClassName('item item-page')[0].children[3]
                let textContent;
                try{
                    textContent = textElement.textContent;
                }catch(e){
                    console.log("PARSE ERROR");
                    continue;
                }
                textContent = textContent.trim();
                textContent = textContent.replace(/\n/g,' ')
                textContent = textContent.replace('Соопштение до јавноста','');
                if(!(textContent.toLowerCase().includes('javascript') || textContent.toLowerCase().includes('document') || textContent.toLowerCase().includes('function'))){
                    batch.push({url:items[i+(urlCount++)].href,content:textContent});
                }
            }
            let cont = fs.readFileSync('../p2.json');
            let prevObj = JSON.parse(cont);
            prevObj = prevObj.concat(batch);
            const d = JSON.stringify(prevObj);
            fs.writeFileSync('../p2.json', d, (err) => {
                if (err) {
                    throw err;
                }
            });
            console.log("Fetched: "+((enu)*10+i)+" : ");
        }
        enu++;
    }
}
getData();

