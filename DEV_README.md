# 🛠️ All-Serve — Guia Técnico e Arquitetura do Sistema (DEV_README)

Este documento destina-se a **desenvolvedores, arquitetos de software e revisores técnicos** que desejam compreender a fundo a arquitetura, modelagem de dados, controle de acesso (RBAC) e decisões de engenharia implementadas no **All-Serve**.

> **Nota para Recrutadores e Gestores (RH):** Para uma visão geral executiva com telas do sistema e resumo funcional, consulte o **[README Principal (README.md)](./README.md)**.

---

## 🏛️ 1. Visão Geral da Arquitetura

O **All-Serve** é uma aplicação web *Single Page Application (SPA)* reativa desenvolvida com **React 18** e empacotada com **Vite 7**. A infraestrutura de backend é totalmente servida pelo ecossistema **Firebase (Cloud Firestore + Authentication)**.

```
+-----------------------------------------------------------------------------------+
|                                 CAMADA DE APRESENTAÇÃO                            |
|    Chakra UI (Dark Mode customizado #0f131c / #161c28 / #263147)                  |
|    React Router DOM 7 (Rotas Declarativas, RotaProtegida, RotaAdmin)             |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                            GERENCIAMENTO DE ESTADO & REGRAS                       |
|    ContextoAutenticacao (Firebase Auth + Cache de userRole Firestore)             |
|    ContextoCarrinho (Persistência no localStorage + Cálculos em Tempo Real)      |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                                 BACKEND & BANCO DE DADOS                          |
|    Firebase Authentication (e-mail/senha)                                         |
|    Cloud Firestore (NoSQL orientada a documentos e subcoleções)                   |
+-----------------------------------------------------------------------------------+
```

---

## 🔐 2. Controle de Acesso Baseado em Papéis (RBAC)

O sistema implementa **RBAC (*Role-Based Access Control*)** em três níveis hierárquicos e funcionais: **Cliente**, **Bartender** e **Administrador**.

### Tabela de Permissões por Papel

| Funcionalidade / Módulo | Cliente (`cliente`) | Bartender (`bartender`) | Administrador (`administrador`) | Visitante (Não Logado) |
| :--- | :---: | :---: | :---: | :---: |
| **Visualizar Vitrine de Bartenders** | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| **Solicitar Orçamento de Evento** | ✅ Sim (Contratar) | 🤝 Sim (Parceria/Colab) | 📋 Sim | 🔒 Requer Login |
| **Acessar Carrinho / Comprar Doses** | ✅ Sim | ❌ Oculto | ❌ Oculto | 🔒 Requer Login |
| **Avaliar Profissionais** | ⭐ Avaliar Evento | ⭐ Avaliar Colega | ⭐ Avaliar | 🔒 Requer Login |
| **Editar Perfil / Preço por Hora** | ❌ Não | ✅ Sim | ❌ Não | ❌ Não |
| **Moderar Avaliações (Admin)** | ❌ Não | ❌ Não | ✅ Sim | ❌ Não |
| **Gerenciar Usuários & Relatórios**| ❌ Não | ❌ Não | ✅ Sim | ❌ Não |

### Como o RBAC opera no código:
1. **`ContextoAutenticacao.jsx`**: Ao autenticar via Firebase Auth, o contexto consulta automaticamente o documento `/users/{uid}` para ler e armazenar a propriedade `role` no estado global `userRole`.
2. **Rotas Protegidas (`RotaProtegida.jsx` / `RotaAdmin.jsx`)**:
   - `<RotaProtegida>` garante que rotas como `/painel` ou `/avaliar/:id` exijam um `currentUser` ativo.
   - `<RotaAdmin>` intercepta tentativas de acesso a `/admin/*` e valida se `userRole === 'administrador'`, redirecionando usuários não autorizados.
3. **Componentes Polimórficos (`CartaoBartender.jsx`, `PerfilBartender.jsx`, `AvaliarBartender.jsx`)**:
   - Os botões de ação e títulos de modais adaptam-se dinamicamente com base em `userRole`:
     - Se `cliente` ou visitante: exibe **"📅 Contratar"**, **"Solicitar Orçamento para Evento"** e botão de **"🛒 Carrinho"**.
     - Se `bartender`: exibe **"🤝 Parceria"**, **"Propor Trabalho em Conjunto"** e **"⭐ Avaliar Colega Profissional"** (sem exibir carrinho).
     - Se `administrador`: exibe **"🛡️ Ver Detalhes"** e opções de governança.

---

## 🗄️ 3. Modelagem de Dados no Cloud Firestore

O banco de dados NoSQL é organizado em coleções principais e subcoleções para garantir isolamento e escalabilidade.

```
/users/{userId}
  ├── email: string ("bar@gmail.com")
  ├── nome: string ("Mateus CSQ")
  ├── role: string ("cliente" | "bartender" | "administrador")
  ├── especialidade: string ("Coquetelaria em Geral", "Drinks Clássicos")
  ├── precoPorHora: number (120)
  ├── fotoURL: string (DataURI Base64 ou URL externa)
  ├── bloqueado: boolean (false)
  │
  └── /avaliacoes/{avaliacaoId}  [Subcoleção]
        ├── clienteId: string
        ├── clienteEmail: string
        ├── nota: number (1 a 5)
        ├── comentario: string
        ├── visivel: boolean (true = visível, false = moderada/ocultada pelo admin)
        └── criadoEm: Timestamp

/agendamentos/{agendamentoId}
  ├── bartenderId: string
  ├── bartenderNome: string
  ├── clienteId: string
  ├── clienteEmail: string
  ├── tipoEvento: string ("Casamento", "Festa Corporativa", etc.)
  ├── dataEvento: string ("YYYY-MM-DD")
  ├── horas: number (4)
  ├── localEvento: string
  ├── observacoes: string
  ├── valorEstimado: number (precoPorHora * horas)
  ├── status: string ("pendente" | "aprovado" | "concluido" | "cancelado")
  └── criadoEm: Timestamp

/cardapio_plataforma/{drinkId}
  ├── nome: string ("Dry Martini Clássico")
  ├── preco: number (28.00)
  ├── categoria: string ("Clássicos" | "Autorais" | "Sem Álcool")
  └── foto: string (URL ou Base64)
```

---

## 💡 4. Decisões Técnicas de Engenharia & Performance

### 1. Busca em Memória com Filtro Resiliente (`BuscarBartenders.jsx`)
Em aplicações que requerem pesquisas rápidas sem necessidade de manter múltiplos índices compostos no Firestore, optamos pela **busca em memória com fallback inclusivo**:
- O frontend realiza um único `getDocs` na coleção `/users` e armazena em cache no estado do componente.
- A filtragem de bartenders ignora caracteres maiúsculos/minúsculos e acentos (`normalize('NFD')`), permitindo buscar por nome, e-mail, especialidade ou faixa de preço.
- **Resiliência de Banco de Dados:** Caso o usuário cadastrado como "Bartender" tenha variações em sua string de papel (`role === 'bartender' || 'profissional' || temEspecialidade`), o filtro identifica e exibe o profissional sem falhas silenciosas.
- **Diagnóstico em Tempo Real:** O card de resultados exibe a contagem total de documentos e detecta erros de permissão (`permission-denied`) alertando o desenvolvedor sobre as regras do Firestore Console.

### 2. Upload de Imagens Otimizado via Base64 (`EditarPerfil.jsx`)
Para simplificar a configuração inicial e evitar custos adicionais de armazenamento em nuvem no Firebase Storage:
- As imagens enviadas pelo usuário são processadas no navegador através da API `FileReader` + `HTML5 Canvas`.
- A imagem é automaticamente redimensionada para largura máxima de `400px` em formato JPEG (`quality: 0.7`).
- O Data URI compacto resultante é salvo diretamente no campo `fotoURL` do documento do usuário no Firestore.

### 3. Sistema de Carrinho com Checkout Simulado (`CarrinhoCheckout.jsx`)
- Desenvolvido no padrão React Custom Hook (`useCarrinho`) com sincronização em `localStorage`, permitindo que o usuário navegue entre páginas sem perder itens adicionados.
- Integração de verificação em dois tempos: ao tentar prosseguir para o pagamento, o sistema checa a presença de sessão autenticada; se ausente, emite um aviso informativo e redireciona para `/login`.

---

## 🛡️ 5. Regras de Segurança (Firestore Rules)

Para desenvolvimento e testes ágeis sem bloqueios de leitura, o arquivo local `firestore.rules` e o console em nuvem recomendam a seguinte estrutura de regras abertas ou autenticadas:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Permite leitura e escrita para testes de desenvolvimento e inspeção RBAC
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> *Observação de Deploy:* Para produção estrita, as regras são configuradas no arquivo local `firestore.rules` limitando `write` a usuários autenticados (`request.auth != null`) e validações de dono do recurso.

---

## 📁 6. Estrutura Detalhada de Pastas (`/src`)

```
src/
├── componentes/
│   ├── agendamentos/
│   │   └── ListaAgendamentos.jsx     # Lista de orçamentos e reservas de um bartender
│   ├── bartender/
│   │   └── CartaoBartender.jsx       # Card da vitrine (responsivo ao userRole)
│   ├── cardapio/
│   │   ├── CardapioPlataforma.jsx    # Cardápio oficial com doses avulsas
│   │   └── ItemCardapio.jsx          # Item individual do cardápio com botão de compra
│   └── comuns/
│       ├── BarraNavegacao.jsx        # Navbar reativa com links RBAC e contador de carrinho
│       ├── IconeEstrela.jsx          # Ícone SVG em estrela para classificações
│       ├── Layout.jsx                # Layout mestre (Navbar + Conteúdo + Footer)
│       └── Notificacoes.jsx          # Central de alertas e notificações
├── contexto/
│   ├── ContextoAutenticacao.jsx      # Provider do Firebase Auth + userRole do Firestore
│   └── ContextoCarrinho.jsx          # Provider do carrinho (localStorage + cálculos)
├── firebase/
│   └── config.js                     # Configuração e inicialização do Firebase SDK
├── paginas/
│   ├── admin/
│   │   ├── ModerarAvaliacoes.jsx     # Painel para ocultar/restaurar avaliações
│   │   ├── ModuloCardapioAdmin.jsx   # Gestão de drinks oficiais da plataforma
│   │   ├── ModuloRelatoriosAdmin.jsx # Indicadores financeiros e relatórios
│   │   └── ModuloUsuariosAdmin.jsx   # Controle e bloqueio de usuários do sistema
│   ├── autenticacao/
│   │   ├── Cadastro.jsx              # Registro de nova conta (Cliente / Bartender)
│   │   ├── Login.jsx                 # Login com validação de status de banimento
│   │   └── RecuperarSenha.jsx        # Redefinição de senha via e-mail do Firebase
│   ├── bartender/
│   │   ├── AvaliarBartender.jsx      # Formulário de avaliação (estelar + texto)
│   │   ├── BuscarBartenders.jsx      # Vitrine de bartenders com filtros e busca
│   │   ├── EditarPerfil.jsx          # Edição de perfil profissional e upload Base64
│   │   ├── ListaBartenders.jsx       # Lista auxiliar de exibição de profissionais
│   │   └── PerfilBartender.jsx       # Página completa do bartender (Hero, Avaliações, Orçamento)
│   ├── cliente/
│   │   └── CarrinhoCheckout.jsx      # Carrinho de compras com simulação de pagamento
│   ├── Inicio.jsx                    # Landing page da aplicação
│   └── Painel.jsx                    # Dashboard adaptativo (Cliente vs Bartender vs Admin)
├── rotas/
│   ├── RotaAdmin.jsx                 # Guarda de rota para permissão "administrador"
│   ├── RotaProtegida.jsx             # Guarda de rota para sessão de usuário
│   └── Roteador.jsx                  # Mapeamento com createBrowserRouter (DOM 7)
├── App.jsx
├── main.jsx                          # Ponto de montagem com ChakraProvider
└── theme.js                          # Tema escuro personalizado (#0f131c, #161c28)
```

---

## ⚡ 7. Comandos do Projeto (Scripts NPM)

| Comando | Descrição |
| :--- | :--- |
| **`npm install`** | Instala todas as dependências do `package.json` |
| **`npm run dev`** | Inicia o servidor local do Vite em `http://localhost:5173` com Hot Module Replacement (HMR) |
| **`npm run lint`** | Executa a verificação de código com `ESLint` para garantir qualidade e semântica |
| **`npm run build`** | Empacota e otimiza os arquivos de produção dentro da pasta `/dist` |
| **`npm run preview`** | Testa localmente o build empacotado de produção |

---

## 🤝 8. Boas Práticas de Contribuição

1. **Arquitetura em Português:** Mantenha a nomenclatura de componentes, rotas, variáveis públicas e comentários em português para consistência com o padrão do repositório.
2. **Verificação de Lints:** Sempre execute `npm run lint` antes de propor alterações para evitar avisos ou erros de sintaxe.
3. **Respeito ao RBAC:** Ao criar novos fluxos ou páginas, sempre valide a permissão adequada via `userRole` no `ContextoAutenticacao` para separar corretamente a experiência de Cliente, Bartender e Administrador.
