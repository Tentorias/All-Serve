// src/rotas/Roteador.jsx

import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Inicio from '../paginas/Inicio.jsx';
import Login from '../paginas/autenticacao/Login.jsx';
import Cadastro from '../paginas/autenticacao/Cadastro.jsx';
import RecuperarSenha from '../paginas/autenticacao/RecuperarSenha.jsx';
import Painel from '../paginas/Painel.jsx';
import RotaProtegida from './RotaProtegida.jsx';
import RotaAdmin from './RotaAdmin.jsx';
import Layout from '../componentes/comuns/Layout.jsx';
import ListaBartenders from '../paginas/bartender/ListaBartenders.jsx';
import AvaliarBartender from '../paginas/bartender/AvaliarBartender.jsx';
import PerfilBartender from '../paginas/bartender/PerfilBartender.jsx';
import ModerarAvaliacoes from '../paginas/admin/ModerarAvaliacoes.jsx';
import BuscarBartenders from '../paginas/bartender/BuscarBartenders.jsx';

const rotas = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Inicio />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'cadastro',
        element: <Cadastro />,
      },
      {
        path: 'signup', // alias de compatibilidade
        element: <Navigate to="/cadastro" replace />,
      },
      {
        path: 'recuperar-senha',
        element: <RecuperarSenha />,
      },
      {
        path: 'forgot-password', // alias de compatibilidade
        element: <Navigate to="/recuperar-senha" replace />,
      },
      {
        path: 'painel',
        element: (
          <RotaProtegida>
            <Painel />
          </RotaProtegida>
        ),
      },
      {
        path: 'dashboard', // alias de compatibilidade
        element: <Navigate to="/painel" replace />,
      },
      {
        path: 'buscar',
        element: (
          <RotaProtegida>
            <BuscarBartenders />
          </RotaProtegida>
        ),
      },
      {
        path: 'bartenders',
        element: (
          <RotaProtegida>
            <ListaBartenders />
          </RotaProtegida>
        ),
      },
      {
        path: 'bartender/:bartenderId',
        element: (
          <RotaProtegida>
            <PerfilBartender />
          </RotaProtegida>
        ),
      },
      {
        path: 'avaliar/:bartenderId',
        element: (
          <RotaProtegida>
            <AvaliarBartender />
          </RotaProtegida>
        ),
      },
      {
        path: 'admin/moderar-avaliacoes',
        element: (
          <RotaProtegida>
            <RotaAdmin>
              <ModerarAvaliacoes />
            </RotaAdmin>
          </RotaProtegida>
        ),
      },
    ],
  },
]);

export default function Roteador() {
  return <RouterProvider router={rotas} />;
}
