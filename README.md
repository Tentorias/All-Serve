# All-Serve - Sistema de Bartenders e Autenticação com Papéis (RBAC)

Este repositório contém o código-fonte do **All-Serve**, uma aplicação web full-stack que implementa um sistema completo de autenticação, controle de acesso por papéis (RBAC), busca de profissionais e avaliação de serviços de bartenders.

A aplicação permite o cadastro de usuários com diferentes perfis (**Cliente**, **Bartender** e **Administrador**) e gerencia dinamicamente o acesso a páginas, rotas e componentes de acordo com a permissão de cada perfil.

---

## 🚀 Tecnologias Utilizadas

- **Frontend:** React 18 (com Vite), React Router DOM 7
- **Backend & Banco de Dados:** Firebase Authentication e Cloud Firestore
- **Interface e Estilização:** Chakra UI + Design System **Glacial Aero / Frutiger Aero Moderno** (efeitos *glassmorphic acrylic blur*, botões *glossy*, reflexos de água/cristal e paleta ciano/turquesa)
- **Gerenciamento de Estado:** React Context API (`ContextoAutenticacao`)

---

## 📁 Estrutura de Pastas do Projeto

O projeto adota uma arquitetura modular, clara e totalmente em português:

```
All-Serve/
├── src/
│   ├── componentes/
│   │   ├── comuns/            # Componentes gerais (Layout, BarraNavegacao, IconeEstrela)
│   │   ├── bartender/         # Componentes do bartender (CartaoBartender)
│   │   └── admin/             # Componentes administrativos (PainelAdmin)
│   ├── paginas/
│   │   ├── autenticacao/      # Login, Cadastro e Recuperação de Senha
│   │   ├── bartender/         # BuscarBartenders, ListaBartenders, PerfilBartender, AvaliarBartender
│   │   ├── admin/             # ModerarAvaliacoes
│   │   ├── Inicio.jsx         # Página inicial
│   │   └── Painel.jsx         # Painel principal do usuário
│   ├── rotas/
│   │   ├── Roteador.jsx       # Configuração geral de rotas
│   │   ├── RotaProtegida.jsx  # Proteção de rotas para usuários autenticados
│   │   └── RotaAdmin.jsx      # Proteção de rotas para administradores
│   ├── contexto/
│   │   └── ContextoAutenticacao.jsx # Provedor do Firebase Auth
│   ├── firebase/
│   │   └── config.js          # Credenciais e inicialização do Firebase
│   ├── App.jsx
│   └── main.jsx
├── public/
├── package.json
└── README.md
```

---

## ⚙️ Configuração e Execução Local

### 1. Pré-requisitos
- **Node.js** (versão 18 ou superior instalada na máquina).

### 2. Instalar as Dependências
Na raiz do repositório, execute:
```bash
npm install
```

### 3. Configurar as Chaves do Firebase
As credenciais do projeto estão centralizadas no arquivo `src/firebase/config.js`. Caso deseje utilizar o seu próprio projeto do Firebase:
1. Abra `src/firebase/config.js`.
2. Substitua os dados do objeto `firebaseConfig` pelas credenciais do seu aplicativo no [Firebase Console](https://console.firebase.google.com/).

### 4. Executar a Aplicação
Inicie o servidor de desenvolvimento:
```bash
npm run dev
```
O terminal mostrará um endereço local (por padrão `http://localhost:5173/`). Abra-o em seu navegador.

---

## 🧪 Demonstração de Funcionalidades

### 1. Rota Protegida (Usuário Não Autenticado)
- **Ação:** Tente acessar a URL `/painel` (ou `/dashboard`) diretamente no navegador sem fazer login.
- **Resultado:** A aplicação redirecionará automaticamente para a página de `/login`.

### 2. Cadastro com Diferentes Perfis
- **Ação:**
  1. Acesse `/cadastro` (ou clique em "Criar Conta").
  2. Cadastre um usuário selecionando o perfil **Cliente**.
  3. Cadastre um usuário selecionando o perfil **Bartender** (preencha especialidade, preço por hora e foto de perfil).
  4. Cadastre um usuário selecionando o perfil **Administrador**.
- **Resultado no Firebase:**
  - Em **Authentication**, os usuários estarão registrados com os respectivos e-mails.
  - Em **Firestore**, na coleção `users`, cada usuário terá seu documento contendo o campo `role` (`cliente`, `bartender` ou `administrador`).

### 3. Busca e Filtro de Bartenders
- **Ação:**
  1. Logado como cliente, acesse **"Buscar Bartenders"** na barra de navegação (ou vá em `/buscar`).
  2. Filtre por especialidade ou ordene por menor preço, maior preço ou melhor avaliação.
- **Resultado:** O sistema exibe cartões interativos dos bartenders cadastrados com média de notas em estrelas.

### 4. Avaliação e Comentários
- **Ação:**
  1. Na página do bartender, clique em **Avaliar**.
  2. Selecione uma nota de 1 a 5 estrelas (ícones SVG customizados) e deixe um comentário.
- **Resultado:** A avaliação é salva no Firestore e a nota média do profissional é atualizada automaticamente em seu perfil público.

### 5. Moderação Administrativa (RBAC)
- **Ação:**
  1. Faça login com o usuário com papel de **Administrador**.
  2. No painel, clique em **Moderar Avaliações** (`/admin/moderar-avaliacoes`).
- **Resultado:** O administrador pode visualizar todos os comentários e ocultar/exibir qualquer avaliação do sistema.

### 6. Edição de Perfil e Upload Gratuito de Foto (Sem Firebase Storage)
- **Ação:**
  1. Logado como bartender, acesse **"✏️ Editar meu Perfil"** no Painel (ou vá em `/bartender/editar`).
  2. Selecione uma imagem diretamente do seu celular ou computador (a imagem é redimensionada e otimizada pelo navegador em Base64 leve, sem nenhum custo de servidor ou armazenamento pago), ou informe uma URL externa.
  3. Altere seu preço por hora, especialidade ou nome e clique em **Salvar Alterações**.
- **Resultado:** Os dados são atualizados em tempo real no documento do Firestore no plano gratuito Spark e refletidos na busca e no perfil público.

### 7. Fluxo de Agendamento e Solicitação de Orçamentos
- **Ação:**
  1. Logado como cliente, acesse o perfil público de um bartender e clique em **"📅 Solicitar Orçamento / Reserva"**.
  2. Preencha o tipo de evento (Casamento, Aniversário, Corporativo, etc.), data, duração em horas (com cálculo automático em tempo real do **Valor Estimado** com base no preço por hora do profissional), local e observações.
  3. No seu **Painel** (`/painel`), acompanhe o status da solicitação (`Pendente`, `Aceito`, `Recusado` ou `Cancelado`).
  4. Logado como o bartender requisitado, acesse o **Painel** para visualizar os pedidos recebidos e clique em **Aceitar Orçamento** ou **Recusar**.
- **Resultado:** As solicitações são armazenadas de forma reativa no Firestore (`agendamentos`) e o status muda em tempo real para ambas as partes.

### 8. Paginação Escalável no Firestore ("Carregar Mais")
- **Ação:**
  1. Na página **Buscar Bartenders** (`/buscar`), o sistema busca os profissionais em lotes paginados (utilizando `limit` e `startAfter` do Firestore).
  2. Caso existam mais profissionais disponíveis além do primeiro lote, um botão **"Carregar Mais Bartenders"** aparece na parte inferior da tela.
- **Resultado:** Redução drástica nas leituras simultâneas do banco de dados, mantendo a performance da aplicação alta e econômica mesmo com milhares de bartenders cadastrados.
