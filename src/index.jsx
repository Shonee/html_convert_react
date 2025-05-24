import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <>
    <App />
    <ToastContainer position="bottom-right" autoClose={3000} />
  </>
);
