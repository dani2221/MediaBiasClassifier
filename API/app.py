from flask import Flask, request, jsonify
import joblib
import gensim
from bs4 import BeautifulSoup
from gensim.models.doc2vec import TaggedDocument
from _stopwords import _stopwords
import nltk
nltk.download('punkt')
import pandas as pd
import re
import requests

app = Flask(__name__)

@app.route('/', methods=['GET'])
def index():
    return "Hello"

@app.route('/predict_html', methods=['POST'])
def predict_html():
    data = request.get_json()
    html = data['html']
    return parse_predict(html)

@app.route('/predict_url', methods=['POST'])
def get_url_prediction():
    url = request.json['url']
    try:
        data = requests.get(url, headers={'User-agent': 'Some fancy thing'})
        html = data.text
    except Exception as e:
        return jsonify({'error': str(e), 'result': ''})
    return parse_predict(html);

def parse_predict(html):
    soup = BeautifulSoup(html, 'html.parser')
    text_element = soup.find('post-body-inner')
    if text_element is None:
        text_element = soup.find('article-text')
    if text_element is None:
        text_element = soup.find('entry-content')
    if text_element is None:
        text_element = soup.find('post-content')
    if text_element is None:
        text_element = soup.find('td-post-content')
    if text_element is None:
        text_element = soup.find('article_content')
    if text_element is None:
        text_element = soup.find('field-item')
    if text_element is None:
        text_element = soup
    ps = text_element.find_all('p')
    text = ''
    for p in ps:
        to_add = p.text
        to_add = re.sub(r'[a-zA-Z]', '', to_add)
        text += to_add
    print(text)
    if(len(text)<50):
        return jsonify({'error': 'Not enough text','result': ''})
    result = get_prediction(text)
    if(result == 'ERROR'):
        return jsonify({'error': 'Model not loaded','result': ''})
    return jsonify({'result': str(result),'error': ''})


@app.route('/prediction', methods=['POST'])
def predict():
    text = request.json['text']
    result = get_prediction(text)
    if(result == 'ERROR'):
        return jsonify({'error': 'Model not loaded','result': ''})
    return jsonify({'result': str(result),'error': ''})

def get_prediction(text):
    vocab = gensim.models.Word2Vec.load('./doc2vec_articles_0.model') 
    model = joblib.load('./svc_0') 
    if vocab and model:
        testData = pd.DataFrame([[text,0]],columns=['content','bias'])
        testData['content'] = testData['content'].apply(clean)
        testData['content'] = testData['content'].map(remove_stopwords)
        tg = testData.apply(lambda r: TaggedDocument(words=tokenize_text(r['content']), tags=[r.bias]), axis=1)
        tr, _ = vec_for_learning(vocab,tg)
        final = model.predict(tr)[0]
        return final
    else:
        return 'ERROR'

def vec_for_learning(model, tagged_docs):
    sents = tagged_docs.values
    classes, features = zip(*[(doc.tags[0], model.infer_vector(doc.words, steps=20)) for doc in sents])
    return features, classes
def tokenize_text(text):
    tokens = []
    for sent in nltk.sent_tokenize(text):
        for word in nltk.word_tokenize(sent):
            if len(word) < 2:
                continue
            tokens.append(word.lower())
    return tokens
def clean(text):
    text = BeautifulSoup(text, "lxml").text
    text = re.sub(r'\|\|\|', r' ', text) 
    text = text.replace('„','')
    text = text.replace('“','')
    text = text.replace('"','')
    text = text.replace('\'','')
    text = text.replace('-','')
    text = text.lower()
    return text
def remove_stopwords(content):
    for word in _stopwords:
        content = content.replace(' '+word+' ',' ')
    return content
if __name__ == "__main__":
    app.run()
