// src/componentes/comuns/Layout.jsx

import { Outlet } from 'react-router-dom';
import BarraNavegacao from './BarraNavegacao.jsx';
import { Box } from '@chakra-ui/react';

export default function Layout() {
  return (
    <Box>
      <BarraNavegacao />
      <main>
        {/* Outlet mostra o conteúdo da rota atual */}
        <Outlet />
      </main>
    </Box>
  );
}
