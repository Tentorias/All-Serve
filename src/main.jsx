// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { ProvedorAutenticacao } from './contexto/ContextoAutenticacao.jsx';
import tema from './tema.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ColorModeScript initialColorMode={tema.config.initialColorMode} />
    <ChakraProvider theme={tema}>
      {/* Contexto de autenticação */}
      <ProvedorAutenticacao>
        <App />
      </ProvedorAutenticacao>
    </ChakraProvider>
  </React.StrictMode>
);
