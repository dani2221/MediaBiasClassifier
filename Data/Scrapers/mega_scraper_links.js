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

const scrapeLinks = async (news) =>{
    let enu = 0;
    for(let i=1;i<=Math.max(...news.map(x => x.maxPage));i++){
        const valid = news.filter(x => x.maxPage>=i);
        const promises = valid.map(x => promiseTimeout(10000,fetch(x.url.replace("PAGE_ID",i),{method: x.method=='POST'?'POST':'GET'})));
        let data = [];
        try{
            const results = await Promise.allSettled(promises);
            const texts = results.map(el=>el.value!=undefined ? el.value.text():'');
            data = await Promise.allSettled(texts);
        }catch(e){
            console.log(e);
            continue;
        }
        let newData = [];
        for(let j=0;j<data.length;j++){
            const dom = new jsdom.JSDOM(data[j].value,{contentType:"text/html"});
            let items = dom.window.document.getElementsByClassName(valid[j].classNameOfLinks);
            if(!valid[j].directElement){
                const newItems = [];
                for(let item of items){
                    if(item.children[0].href==undefined){
                        if(!valid[j].url.includes('24.mk')) console.log(valid[j].url)
                        continue;
                    }
                    if(item.children[0].href.includes('http')){
                        newItems.push(item.children[0].href);
                    }else{
                        newItems.push(valid[j].url.split('//')[0] +'//'+ valid[j].url.split('//')[1].split('/')[0] + item.children[0].href);
                    }
                }
                items = newItems
            }else{
                const newItems = [];
                for(let item of items){
                    if(item.href==undefined){
                        console.log(valid[j].url)
                        continue;
                    }
                    if(item.href.includes('http')){
                        newItems.push(item.href);
                    }else{
                        newItems.push(valid[j].url.split('//')[0] +'//'+ valid[j].url.split('//')[1].split('/')[0] + item.href);
                    }
                }
                items = newItems
            }
            newData = newData.concat(items);
        }
        let old = fs.readFileSync('../mega_links.json');
        old = JSON.parse(old);
        old = old.concat(newData);
        old = new Set(old);
        const d = JSON.stringify(Array.from(old));
        fs.writeFileSync('../mega_links.json', d, (err) => {
            if (err) {
                throw err;
            }
        });
        console.log("Fetched: "+((++enu)*valid.reduce((acc,obj)=>acc+obj.articlesPerPage,0)));
    }
}

let news = fs.readFileSync('../scrape_init.json');
news = JSON.parse(news);
scrapeLinks(news);

