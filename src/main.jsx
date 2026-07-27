// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { ProvedorAutenticacao } from './contexto/ContextoAutenticacao.jsx';

const theme = extendTheme({});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      {/* Contexto de autenticação */}
      <ProvedorAutenticacao>
        <App />
      </ProvedorAutenticacao>
    </ChakraProvider>
  </React.StrictMode>
);
