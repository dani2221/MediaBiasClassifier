import React,{useEffect, useState} from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import './App.css';
import { Alert, CircularProgress, Dialog, DialogActions, DialogContent, Snackbar } from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Helmet from 'react-helmet';


function App() {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [warn, setWarn] = useState('');
  useEffect(()=>{
    axios.get('https://media-bias.azurewebsites.net/').then(res=>console.log(res));
  },[])

  const handleSubmit = () => {
    setResult('');
    if(url.length==0 && text.length==0){
      setError('Ве молиме внесете барем едно од полињата');
      return;
    }
    if(url.length>0 && text.length>0){
      setWarn('Во моментот имате внесено информации во две полиња. Ќе се изврши пребарувањето само по првото (за линк).')
    }
    if(url.length>0){
      console.log(url);
      
      if(!url.startsWith('http://') && !url.startsWith('https://')){
        setError('Ве молиме внесете валиден линк. Линкот мора да започнува со http:// или https://');
        return;
      }
      setOpenDialog(true);
      setLoading(true);
      axios.post('https://media-bias.azurewebsites.net/predict_url',{url:url}).then(res=>{
        setLoading(false);
        console.log(res.data);
        if(res.data.error){
          if(res.data.error.includes('403')){
            setError('Овој весник не дозволува преглед на содржината. Ве молиме копирајте ја содржината рачно и внесете да во долното поле');
            setOpenDialog(false);
            return;
          }
          if(res.data.error.includes('not known')){
            setError('Овој линк не постои. Ве молиме проверете го линкот и пробајте пак');
            setOpenDialog(false);
            return;
          }
          if(res.data.error=='Not enough text'){
            setError('Не успеавме да ја превземеме содржината на оваа вест. Ве молиме копирајте ја содржината рачно и внесете ја во долното поле');
            setOpenDialog(false);
            return;
          }

          setError(res.data.error);
          return;
        }
        setResult(res.data.result);
      }).catch(err=>{
        setLoading(false);
        setOpenDialog(false);
        setError(err.message);
      })
    }
    if(text.length>0){
      if(url.length>0){
        return;
      }
      if(text.replace(/[a-zA-Z]+/g, "").length<100){
        setError('Ве молиме внесете повеќе од 100 букви на кирилица');
        return;
      }
      setOpenDialog(true);
      setLoading(true);
      axios.post('https://media-bias.azurewebsites.net/prediction',{text:text}).then(res=>{
        setLoading(false);
        if(res.data.error){
          setError(res.data.error);
          setOpenDialog(false);
          return;
        }
        setResult(res.data.result);
      }).catch(err=>{
        setLoading(false);
        setOpenDialog(false);
        setError(err.message);
      })
    }
  }
  const handleClose = (event, reason,type) => {
    if (reason === 'clickaway') {
      return;
    }
    if(type=='error'){
      setError("");
    }
    else{
      setWarn("");
    }
  };

  return (
    <div className="App">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Одреди пристрасност на вест | Пристрасност</title>
        <link rel="description" content="Одреди политичка пристрасност на статија со помош на вештачка интелегенција" />
      </Helmet>
      <div style={{margin:'50px'}}>
        <h2 style={{color:'white'}}>Дознај дали веста е политички пристрасна со помош на вештачка интелегенција!</h2>
      </div>
      <div style={{padding:'0 5%',width:'90%'}}>
        <TextField 
          label="Внеси линк од вест" 
          fullWidth 
          value={url}
          onChange={e=>setUrl(e.target.value)}
          variant="outlined"  
          placeholder='пр. https://website.mk/vest/123'/>
      </div>
      <div style={{padding:'0 5%',width:'90%'}}>
        <Alert severity="warning">
          Линкот мора да сордржи македонска вест напишана на кирилица. Во спротивно резултатот е невалиден.
        </Alert>
      </div>
      <h2 style={{color:'white'}}>или</h2>
      <div style={{padding:'0 5%',width:'90%'}}>
        <TextField
          label="Внеси содржина на вест"
          placeholder='На кирилица'
          value={text}
          onChange={(e)=>setText(e.target.value)}
          multiline
          rows={7}
          fullWidth
          variant="outlined"
        />
      
      </div>
      <div style={{margin:'20px'}}>
        <Button variant="contained" size="large" onClick={handleSubmit}>Пресметај пристрасност</Button>
      </div>
      <div style={{color:'white'}}>
        <hr style={{margin:'30px'}}/>
        <span>Види ранкинг на пристрасност на весници <Link to='/stats'>тука</Link>.</span>
        <br/>
        <div style={{margin:'5px'}}>Пристрасност на вест се одредува со помош на модел на длабоко машинско учење истрениран со околу 6000 различни примероци на вести. Дознај повеќе <a href='https://medium.com/@danilo.najkov/detecting-political-bias-in-online-articles-using-nlp-and-classification-models-c1a40ec3989b'>тука</a>.</div>
        <br style={{margin:'50px'}}/>
      </div>
      <Snackbar open={warn.length>0} autoHideDuration={10000} onClose={(e,r)=>handleClose(e,r,'warn')} anchorOrigin={{ vertical:'top', horizontal:'center' }}>
        <Alert onClose={(e,r)=>handleClose(e,r,'warn')} severity="warning" sx={{ width: '100%' }}>
          {warn}
        </Alert>
      </Snackbar>
      <Snackbar open={error.length>0} autoHideDuration={10000} onClose={(e,r)=>handleClose(e,r,'error')} anchorOrigin={{ vertical:'top', horizontal:'center' }}>
        <Alert onClose={(e,r)=>handleClose(e,r,'error')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
  
      <Dialog open={openDialog} onClose={()=>setOpenDialog(false)} maxWidth={'sm'} fullWidth>
        <DialogContent>
          <div style={{padding:'10px',textAlign:'center'}}>
            <h2 style={{marginBottom:'40px'}}>Оваа вест е...</h2>
            {loading ?
              <CircularProgress /> :
              <div style={{color:result==0?'#90caf9':result==1?'white':'red', fontSize:30,fontWeight:'bold'}}>{result==0 || result==2 ? 'Политички пристрасна' : 'Политички непристрасна'}</div>
            }
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenDialog(false)}>Затвори</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}


export default App;
