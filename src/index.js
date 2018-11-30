import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import ErrorBoundaryPage from './components/ErrorBoundaryPage';
import './index.css'
import registerServiceWorker from './registerServiceWorker';

if (!('localStorage' in window)) {
    alert('Sorry :( \nThis app will not work with this browser because it has no localStorage support.')
}

ReactDOM.render(
    <ErrorBoundaryPage><BrowserRouter basename={process.env.PUBLIC_URL}><App /></BrowserRouter></ErrorBoundaryPage>,
    document.getElementById('root')
);
registerServiceWorker();

let clickedElemPath = [];

document.addEventListener('focus', e => {
    if (e.target !== document && !clickedElemPath.includes(e.target)) e.target.classList.add('focused')
}, true)

document.addEventListener('blur', e => {
    if (e.target !== document) e.target.classList.remove('focused')
}, true)

document.addEventListener('mousedown', e => {
    clickedElemPath = e.path || [];
    if (e.target.classList.contains('focused')) e.target.classList.remove('focused')
})

// For labeled elements in case of click on label
document.addEventListener('click', e => {
    if (e.target.classList.contains('focused')) e.target.classList.remove('focused')
})

document.addEventListener('mouseup', () => {
    clickedElemPath = [];
})

document.getElementById('root').style.minHeight = window.innerHeight + 'px'

window.addEventListener('resize', () => document.getElementById('root').style.minHeight = window.innerHeight + 'px')
