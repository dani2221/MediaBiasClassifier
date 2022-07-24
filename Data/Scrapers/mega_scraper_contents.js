import fs from 'fs'
import fetch from 'node-fetch';
import jsdom from 'jsdom';


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

const scrapeContents = async (news) =>{
    for(let i=0; i<news.length; i+=5){
        let promises = [
            promiseTimeout(10000,fetch(news[i])),
            promiseTimeout(10000,fetch(news[i+1])),
            promiseTimeout(10000,fetch(news[i+2])),
            promiseTimeout(10000,fetch(news[i+3])),
            promiseTimeout(10000,fetch(news[i+4]))
        ]
        let results;
        let dat = [];
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
        for(let result of dat){
            const articleDom = new jsdom.JSDOM(result.value,{contentType:"text/html"});
            let textElement = articleDom.window.document.getElementsByClassName('post-body-inner');
            if(textElement.length==0)
                textElement = articleDom.window.document.getElementsByClassName('article-text');
            if(textElement.length==0)
                textElement = articleDom.window.document.getElementsByClassName('entry-content');
            if(textElement.length==0)
                textElement = articleDom.window.document.getElementsByClassName('post-content');
            if(textElement.length==0)
                textElement = articleDom.window.document.getElementsByClassName('td-post-content');
            if(textElement.length==0)
                textElement = articleDom.window.document.getElementsByClassName('article_content');
                if(textElement.length==0)
                textElement = articleDom.window.document.getElementsByClassName('field-item');
            if(textElement.length==0)
                textElement = articleDom.window.document;
            else{
                if(news[i+dat.indexOf(result)].includes('vocentar')){
                    textElement = textElement[1];
                }else{
                    textElement = textElement[0];
                }
            }
            let textContent="";
            try{
                let ps = textElement.getElementsByTagName('p');
                for(let p of ps){
                    if(p.textContent.length>0){
                        textContent +=" "+ p.textContent.replace(/[a-zA-Z]/g, '');
                    }
                }
            }catch(e){
                console.log("PARSE ERROR");
                continue;
            }
            textContent = textContent.trim();
            textContent = textContent.replace(/\n/g,' ')
            textContent = textContent.replace(/\t/g,' ')
            if(textContent.length<50){
                console.log("CONTENT TOO SHORT: "+news[i+dat.indexOf(result)]);
                continue;
            }
            batch.push({url:news[i+dat.indexOf(result)],content:textContent});
        }
        let cont = fs.readFileSync('../mega_contents9.json');
        let prevObj = JSON.parse(cont);
        prevObj = prevObj.concat(batch);
        const d = JSON.stringify(prevObj);
        fs.writeFileSync('../mega_contents9.json', d, (err) => {
            if (err) {
                throw err;
            }
        });
        console.log("Fetched: "+(i+5)+"/"+news.length);
        console.log("Real num: "+prevObj.length);
    }
}
let news = fs.readFileSync('../failed_urls.json');
news = JSON.parse(news);
scrapeContents(news);