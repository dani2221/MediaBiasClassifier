import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import Stats from './Stats';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});
const firebaseConfig = {
  apiKey: "AIzaSyDmDN6dYJXf-pHAZmLaDpFUNCWneF8BV20",
  authDomain: "pristrasnost.firebaseapp.com",
  projectId: "pristrasnost",
  storageBucket: "pristrasnost.appspot.com",
  messagingSenderId: "308503659515",
  appId: "1:308503659515:web:1ad314d3540e8ba3f7415e",
  measurementId: "G-XY64EHNBW7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <ThemeProvider theme={darkTheme}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path='/stats' element={<Stats />} />
      </Routes>
    </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
