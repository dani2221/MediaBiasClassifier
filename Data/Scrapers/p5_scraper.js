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

const genUrls = () => {
    const urls = [];
    for(let i=1;i<=1500;i++){
        urls.push(`https://www.slobodenpecat.mk/wp-admin/admin-ajax.php?page=${i}&cat=57&action=load_subcategory_posts`);
    }
    return urls;
}
const getData = async () => {
    let enu = 0;
    for(let url of genUrls()){
        const res = await fetch(url,{method:'POST'});
        const content = await res.text();
        const dom = new jsdom.JSDOM(content,{contentType:"text/html"});
        let items = []; 
        for(let child of dom.window.document.getElementsByClassName('read-more')){
            items.push(child.children[0])
        }
        let promises = items.map(item => promiseTimeout(30000,fetch(item.href)))
        if(promises.length > 10){
            promises = promises.slice(0,10);
        }
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
            let textElement = articleDom.window.document.getElementsByClassName('post-body-inner')[0];
            let textContent="";
            try{
                let ps = textElement.getElementsByTagName('p');
                for(let p of ps){
                    if(p.textContent.length>0){
                        textContent +=" "+ p.textContent;
                    }
                }
            }catch(e){
                console.log("PARSE ERROR");
                continue;
            }
            textContent = textContent.trim();
            textContent = textContent.substring(textContent.indexOf('\n')+1)
            textContent = textContent.replace(/\n/g,' ')
            batch.push({url:items[dat.indexOf(result)].href,content:textContent});
        }
        let cont = fs.readFileSync('../mega_contents10.json');
        let prevObj = JSON.parse(cont);
        prevObj = prevObj.concat(batch);
        const d = JSON.stringify(prevObj);
        fs.writeFileSync('../mega_contents10.json', d, (err) => {
            if (err) {
                throw err;
            }
        });
        console.log("Fetched: "+(++enu*10));
    }
}
getData();
