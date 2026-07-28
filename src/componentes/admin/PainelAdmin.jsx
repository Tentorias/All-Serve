// src/componentes/admin/PainelAdmin.jsx

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  SimpleGrid,
  Button,
  Input,
  Select,
  Badge,
  Divider,
  Spinner,
  Center,
  useToast,
  Switch,
  FormControl,
  FormLabel,
  Textarea,
  InputGroup,
  InputLeftAddon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
} from 'firebase/firestore';
import { db } from '../../firebase/config.js';

export default function PainelAdmin() {
  const [loading, setLoading] = useState(true);
  const [errorPermission, setErrorPermission] = useState(false);
  const toast = useToast();

  // Estados para Gerenciar Usuários
  const [usuarios, setUsuarios] = useState([]);
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [salvandoUsuarioId, setSalvandoUsuarioId] = useState(null);

  // Estados para Relatórios de Vendas
  const [agendamentos, setAgendamentos] = useState([]);

  // Estados para Modificar Cardápio
  const [cardapio, setCardapio] = useState([]);
  const [nomeDrink, setNomeDrink] = useState('');
  const [categoriaDrink, setCategoriaDrink] = useState('Clássicos');
  const [precoDrink, setPrecoDrink] = useState('');
  const [descricaoDrink, setDescricaoDrink] = useState('');
  const [criandoDrink, setCriandoDrink] = useState(false);

  // Estados para Moderar Avaliações
  const [avaliacoes, setAvaliacoes] = useState([]);

  // Carregar Dados Gerais
  const carregarDadosAdmin = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Carregar Usuários
      const usersSnap = await getDocs(collection(db, 'users'));
      const listaUsers = usersSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setUsuarios(listaUsers);

      // 2. Carregar Agendamentos/Vendas
      const agendSnap = await getDocs(collection(db, 'agendamentos'));
      const listaAgend = agendSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setAgendamentos(listaAgend);

      // 3. Carregar Cardápio
      const cardSnap = await getDocs(collection(db, 'cardapio_plataforma'));
      const listaCard = cardSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setCardapio(listaCard);

      // 4. Carregar Avaliações de todos os Bartenders (sem precisar do índice de collectionGroup)
      const bartenders = listaUsers.filter((u) => u.role === 'bartender');
      let todasAv = [];
      for (const bart of bartenders) {
        try {
          const avSnap = await getDocs(
            collection(db, 'users', bart.id, 'avaliacoes')
          );
          const avs = avSnap.docs.map((d) => ({
            id: d.id,
            bartenderId: bart.id,
            bartenderEmail: bart.email || 'Bartender',
            ...d.data(),
          }));
          todasAv = [...todasAv, ...avs];
        } catch {
          // Ignores se não houver coleção de avaliações para este bartender
        }
      }
      setAvaliacoes(todasAv);
    } catch (error) {
      console.error('Erro ao carregar dados do admin:', error);
      if (
        error.code === 'permission-denied' ||
        error.message?.includes('permission') ||
        error.message?.includes('Missing or insufficient permissions')
      ) {
        setErrorPermission(true);
      }
      toast({
        title: 'Erro ao carregar painel admin',
        description: error.message || 'Verifique suas permissões no Firestore.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    carregarDadosAdmin();
  }, [carregarDadosAdmin]);

  // AÇÃO: Atualizar Role do Usuário
  const alterarRoleUsuario = async (userId, novaRole) => {
    setSalvandoUsuarioId(userId);
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: novaRole,
      });
      setUsuarios((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: novaRole } : u))
      );
      toast({
        title: 'Função atualizada!',
        description: `O usuário agora possui a função "${novaRole}".`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao atualizar função do usuário:', error);
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSalvandoUsuarioId(null);
    }
  };

  // AÇÃO: Banir/Reativar Usuário
  const toggleBanirUsuario = async (userId, statusAtual, email) => {
    const novoStatus = statusAtual === 'banido' ? 'ativo' : 'banido';
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: novoStatus,
      });
      setUsuarios((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: novoStatus } : u))
      );
      toast({
        title:
          novoStatus === 'banido'
            ? '🚫 Usuário Banido!'
            : '✅ Usuário Reativado!',
        description: `O usuário ${email || userId} foi ${
          novoStatus === 'banido'
            ? 'banido da plataforma'
            : 'reativado com sucesso'
        }.`,
        status: novoStatus === 'banido' ? 'warning' : 'success',
        duration: 3500,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      toast({
        title: 'Erro ao alterar status',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  // AÇÃO: Excluir Usuário permanentemente
  const excluirUsuario = async (userId, email) => {
    if (
      !window.confirm(
        `Tem certeza que deseja EXCLUIR permanentemente o usuário ${
          email || userId
        }?`
      )
    ) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsuarios((prev) => prev.filter((u) => u.id !== userId));
      toast({
        title: 'Usuário excluído',
        description: 'Registro removido com sucesso do sistema.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: 'Erro ao excluir usuário',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  // AÇÃO: Cadastrar Drink no Cardápio
  const handleAdicionarDrink = async (e) => {
    e.preventDefault();
    if (!nomeDrink.trim() || !precoDrink) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Informe pelo menos o nome e preço do drink.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setCriandoDrink(true);
    try {
      const novoDrink = {
        nome: nomeDrink.trim(),
        categoria: categoriaDrink,
        precoSugestao: parseFloat(precoDrink),
        descricao: descricaoDrink.trim(),
        criadoEm: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, 'cardapio_plataforma'), novoDrink);
      setCardapio((prev) => [...prev, { id: docRef.id, ...novoDrink }]);
      setNomeDrink('');
      setPrecoDrink('');
      setDescricaoDrink('');
      toast({
        title: 'Drink adicionado ao cardápio da plataforma!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao criar drink:', error);
      toast({
        title: 'Erro ao cadastrar drink',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setCriandoDrink(false);
    }
  };

  // AÇÃO: Remover Drink do Cardápio
  const handleRemoverDrink = async (id) => {
    try {
      await deleteDoc(doc(db, 'cardapio_plataforma', id));
      setCardapio((prev) => prev.filter((c) => c.id !== id));
      toast({
        title: 'Drink removido com sucesso.',
        status: 'info',
        duration: 2500,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao remover drink:', error);
      toast({
        title: 'Erro ao remover',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  // AÇÃO: Inicializar Cardápio Padrão (quando estiver vazio)
  const inicializarCardapioPadrao = async () => {
    const drinksPadrao = [
      {
        nome: 'Caipirinha Gourmet Artesanal',
        categoria: 'Clássicos Brasileiros',
        precoSugestao: 25.0,
        descricao:
          'Cachaça envelhecida em amburana, limão taiti selecionado, gelo translúcido e açúcar demerara.',
      },
      {
        nome: 'Negroni Clássico',
        categoria: 'Aperitivos Clássicos',
        precoSugestao: 38.0,
        descricao:
          'Gin London Dry, Campari, Vermute Rosso e casca flambada de laranja bahia.',
      },
      {
        nome: 'Gin Tônica Botânica Premium',
        categoria: 'Gin & Tonics',
        precoSugestao: 35.0,
        descricao:
          'Gin artesanal com zimbro, cardamomo, anis estrelado, rodela de grapefruit e tônica premium.',
      },
      {
        nome: 'Mojito Cubano Clássico',
        categoria: 'Refrescantes',
        precoSugestao: 28.0,
        descricao:
          'Rum branco cubano, hortelã fresca pisada levemente, suco fresco de limão e água com gás.',
      },
    ];

    setCriandoDrink(true);
    try {
      const novos = [];
      for (const item of drinksPadrao) {
        const ref = await addDoc(collection(db, 'cardapio_plataforma'), item);
        novos.push({ id: ref.id, ...item });
      }
      setCardapio(novos);
      toast({
        title: '4 Drinks Padrões adicionados com sucesso!',
        status: 'success',
        duration: 3500,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao inicializar cardápio:', error);
      toast({
        title: 'Erro ao inicializar',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setCriandoDrink(false);
    }
  };

  // AÇÃO: Moderar Visibilidade da Avaliação
  const toggleVisibilidadeAvaliacao = async (
    bartenderId,
    avaliacaoId,
    visivelAtual
  ) => {
    try {
      await updateDoc(
        doc(db, 'users', bartenderId, 'avaliacoes', avaliacaoId),
        {
          visivel: !visivelAtual,
        }
      );
      setAvaliacoes((prev) =>
        prev.map((av) =>
          av.id === avaliacaoId ? { ...av, visivel: !visivelAtual } : av
        )
      );
      toast({
        title: 'Visibilidade da avaliação alterada!',
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao alterar visibilidade:', error);
      toast({
        title: 'Erro ao alterar visibilidade',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  // Cálculos de Relatórios
  const totalReceita = agendamentos
    .filter((a) => a.status === 'aceito')
    .reduce((acc, curr) => acc + (curr.valorEstimado || 0), 0);
  const totalAceitos = agendamentos.filter((a) => a.status === 'aceito').length;
  const totalPendentes = agendamentos.filter(
    (a) => a.status === 'pendente'
  ).length;

  // Filtragem de Usuários
  const usuariosFiltrados = usuarios.filter((u) => {
    const busca = filtroUsuario.toLowerCase();
    return (
      (u.email && u.email.toLowerCase().includes(busca)) ||
      (u.role && u.role.toLowerCase().includes(busca)) ||
      (u.especialidade && u.especialidade.toLowerCase().includes(busca))
    );
  });

  const renderBadgeRole = (role) => {
    switch (role) {
      case 'administrador':
        return <Badge colorScheme="red">Administrador</Badge>;
      case 'bartender':
        return <Badge colorScheme="teal">Bartender</Badge>;
      default:
        return <Badge colorScheme="blue">Cliente</Badge>;
    }
  };

  if (loading) {
    return (
      <Center p={10}>
        <Spinner size="xl" color="red.400" />
      </Center>
    );
  }

  return (
    <Box
      mt={8}
      p={6}
      borderWidth={1}
      borderRadius="xl"
      borderColor="#263147"
      bg="#161c28"
      width="full"
      boxShadow="2xl"
    >
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" flexWrap="wrap">
          <Heading size="lg" color="red.300">
            🛡️ Painel Administrativo do Sistema
          </Heading>
          <Button
            size="sm"
            colorScheme="red"
            variant="outline"
            onClick={carregarDadosAdmin}
          >
            🔄 Atualizar Dados
          </Button>
        </HStack>

        <Divider borderColor="#263147" />

        {errorPermission && (
          <Box
            p={6}
            borderWidth={1}
            borderColor="yellow.500"
            borderRadius="xl"
            bg="rgba(236, 201, 75, 0.1)"
            color="yellow.200"
          >
            <Heading size="sm" mb={2}>
              ⚠️ Permissões do Firestore Necessárias no Firebase Console
            </Heading>
            <Text fontSize="sm" mb={3}>
              Para o Painel Admin conseguir listar os usuários, vendas, cardápio e avaliações,
              atualize as <strong>Regras de Segurança (Rules)</strong> lá no Firebase Console com o código abaixo:
            </Text>
            <Box
              p={4}
              bg="#11151f"
              borderRadius="md"
              fontFamily="monospace"
              fontSize="xs"
              color="teal.300"
              mb={3}
              whiteSpace="pre-wrap"
            >
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`}
            </Box>
            <Text fontSize="xs" color="gray.400">
              Acesse o <strong style={{ color: '#fff' }}>Firebase Console</strong> &gt; seu projeto &gt; <strong style={{ color: '#fff' }}>Firestore Database</strong> &gt; aba <strong style={{ color: '#fff' }}>Regras (Rules)</strong>, cole o bloco acima e clique em <strong style={{ color: '#fff' }}>Publicar (Publish)</strong>.
            </Text>
          </Box>
        )}

        <Tabs variant="soft-rounded" colorScheme="red" isLazy>
          <TabList mb={6} flexWrap="wrap" gap={2}>
            <Tab
              color="gray.400"
              _selected={{ color: 'white', bg: 'red.600' }}
              fontSize="sm"
            >
              👥 Gerenciar Usuários ({usuarios.length})
            </Tab>
            <Tab
              color="gray.400"
              _selected={{ color: 'white', bg: 'red.600' }}
              fontSize="sm"
            >
              📊 Relatórios de Vendas ({agendamentos.length})
            </Tab>
            <Tab
              color="gray.400"
              _selected={{ color: 'white', bg: 'red.600' }}
              fontSize="sm"
            >
              🍸 Modificar Cardápio ({cardapio.length})
            </Tab>
            <Tab
              color="gray.400"
              _selected={{ color: 'white', bg: 'red.600' }}
              fontSize="sm"
            >
              ⭐ Moderar Avaliações ({avaliacoes.length})
            </Tab>
          </TabList>

          <TabPanels>
            {/* ABA 1: GERENCIAR USUÁRIOS */}
            <TabPanel p={0}>
              <VStack spacing={4} align="stretch">
                <Input
                  placeholder="Filtrar por email, função ou especialidade..."
                  value={filtroUsuario}
                  onChange={(e) => setFiltroUsuario(e.target.value)}
                  bg="#11151f"
                  borderColor="#263147"
                />

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {usuariosFiltrados.map((u) => (
                    <Box
                      key={u.id}
                      p={5}
                      borderWidth={1}
                      borderColor="#263147"
                      borderRadius="lg"
                      bg="#11151f"
                    >
                      <HStack justify="space-between" mb={2}>
                        <Text fontWeight="bold" color="white" noOfLines={1}>
                          {u.email || 'Email não informado'}
                        </Text>
                        <HStack spacing={2}>
                          {u.status === 'banido' && (
                            <Badge colorScheme="red" variant="solid">
                              🚫 BANIDO
                            </Badge>
                          )}
                          {renderBadgeRole(u.role)}
                        </HStack>
                      </HStack>
                      <Text fontSize="xs" color="gray.400" mb={3}>
                        ID: {u.id}
                      </Text>
                      {u.especialidade && (
                        <Text fontSize="sm" color="teal.300" mb={3}>
                          Especialidade: {u.especialidade}
                        </Text>
                      )}

                      <Divider borderColor="#263147" mb={3} />

                      <FormControl mb={3}>
                        <FormLabel fontSize="xs" color="gray.400">
                          Alterar Função do Usuário:
                        </FormLabel>
                        <HStack>
                          <Select
                            size="sm"
                            value={u.role || 'cliente'}
                            onChange={(e) =>
                              alterarRoleUsuario(u.id, e.target.value)
                            }
                            bg="#161c28"
                            borderColor="#263147"
                            disabled={salvandoUsuarioId === u.id}
                          >
                            <option value="cliente">Cliente</option>
                            <option value="bartender">Bartender</option>
                            <option value="administrador">Administrador</option>
                          </Select>
                          {salvandoUsuarioId === u.id && (
                            <Spinner size="sm" color="red.400" />
                          )}
                        </HStack>
                      </FormControl>

                      <HStack justify="space-between" pt={2} borderTop="1px solid" borderColor="#263147">
                        <Button
                          size="xs"
                          colorScheme={u.status === 'banido' ? 'green' : 'orange'}
                          variant="outline"
                          onClick={() => toggleBanirUsuario(u.id, u.status, u.email)}
                        >
                          {u.status === 'banido' ? '✅ Reativar Usuário' : '🚫 Banir / Suspender'}
                        </Button>
                        <Button
                          size="xs"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => excluirUsuario(u.id, u.email)}
                        >
                          🗑️ Excluir
                        </Button>
                      </HStack>
                    </Box>
                  ))}
                </SimpleGrid>
              </VStack>
            </TabPanel>

            {/* ABA 2: RELATÓRIOS DE VENDAS & AGENDAMENTOS */}
            <TabPanel p={0}>
              <VStack spacing={6} align="stretch">
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                  <Stat
                    p={4}
                    bg="#11151f"
                    borderWidth={1}
                    borderColor="#263147"
                    borderRadius="lg"
                  >
                    <StatLabel color="gray.400">Total de Orçamentos</StatLabel>
                    <StatNumber color="white">{agendamentos.length}</StatNumber>
                    <StatHelpText color="gray.400">Na plataforma</StatHelpText>
                  </Stat>

                  <Stat
                    p={4}
                    bg="#11151f"
                    borderWidth={1}
                    borderColor="#263147"
                    borderRadius="lg"
                  >
                    <StatLabel color="gray.400">Faturamento Estimado</StatLabel>
                    <StatNumber color="teal.300">
                      R$ {totalReceita.toFixed(2)}
                    </StatNumber>
                    <StatHelpText color="teal.200">Eventos aceitos</StatHelpText>
                  </Stat>

                  <Stat
                    p={4}
                    bg="#11151f"
                    borderWidth={1}
                    borderColor="#263147"
                    borderRadius="lg"
                  >
                    <StatLabel color="gray.400">Eventos Aceitos</StatLabel>
                    <StatNumber color="green.300">{totalAceitos}</StatNumber>
                    <StatHelpText color="green.200">Confirmados</StatHelpText>
                  </Stat>

                  <Stat
                    p={4}
                    bg="#11151f"
                    borderWidth={1}
                    borderColor="#263147"
                    borderRadius="lg"
                  >
                    <StatLabel color="gray.400">Orçamentos Pendentes</StatLabel>
                    <StatNumber color="yellow.300">
                      {totalPendentes}
                    </StatNumber>
                    <StatHelpText color="yellow.200">Aguardando resposta</StatHelpText>
                  </Stat>
                </SimpleGrid>

                <Heading size="md" color="white" pt={2}>
                  Histórico de Agendamentos da Plataforma
                </Heading>

                {agendamentos.length === 0 ? (
                  <Text color="gray.400">
                    Nenhum agendamento registrado até o momento.
                  </Text>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {agendamentos.map((item) => (
                      <Box
                        key={item.id}
                        p={4}
                        bg="#11151f"
                        borderWidth={1}
                        borderColor="#263147"
                        borderRadius="lg"
                      >
                        <HStack justify="space-between" mb={2}>
                          <Text fontWeight="bold" color="white">
                            {item.tipoEvento || 'Evento Especial'}
                          </Text>
                          <Badge
                            colorScheme={
                              item.status === 'aceito'
                                ? 'green'
                                : item.status === 'recusado' ||
                                  item.status === 'cancelado'
                                ? 'red'
                                : 'yellow'
                            }
                          >
                            {item.status || 'pendente'}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.300">
                          <strong>Cliente:</strong> {item.clienteEmail}
                        </Text>
                        <Text fontSize="sm" color="gray.300">
                          <strong>Bartender:</strong>{' '}
                          {item.bartenderNome || item.bartenderEmail}
                        </Text>
                        <Text fontSize="sm" color="gray.300">
                          <strong>Data:</strong>{' '}
                          {item.dataEvento || 'Não informada'} ({item.horas || 0}h)
                        </Text>
                        <Text fontWeight="bold" color="teal.300" mt={2}>
                          Valor Estimado: R${' '}
                          {item.valorEstimado?.toFixed(2) || '0.00'}
                        </Text>
                      </Box>
                    ))}
                  </SimpleGrid>
                )}
              </VStack>
            </TabPanel>

            {/* ABA 3: MODIFICAR CARDÁPIO DA PLATAFORMA */}
            <TabPanel p={0}>
              <VStack spacing={6} align="stretch">
                {cardapio.length === 0 && (
                  <Box
                    p={6}
                    bg="rgba(49, 151, 149, 0.15)"
                    borderWidth={1}
                    borderColor="teal.500"
                    borderRadius="lg"
                    textAlign="center"
                  >
                    <Text color="teal.200" mb={4}>
                      O cardápio da plataforma está vazio. Você pode carregar
                      nossos 4 drinks clássicos iniciais com um clique!
                    </Text>
                    <Button
                      colorScheme="teal"
                      onClick={inicializarCardapioPadrao}
                      isLoading={criandoDrink}
                    >
                      ✨ Inicializar Cardápio Padrão (4 Drinks)
                    </Button>
                  </Box>
                )}

                {/* Formulário de Adicionar Drink */}
                <Box
                  p={5}
                  bg="#11151f"
                  borderWidth={1}
                  borderColor="#263147"
                  borderRadius="lg"
                >
                  <Heading size="sm" color="white" mb={4}>
                    + Adicionar Novo Drink ao Cardápio Oficial
                  </Heading>
                  <form onSubmit={handleAdicionarDrink}>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
                      <FormControl isRequired>
                        <FormLabel fontSize="sm" color="gray.300">
                          Nome do Drink
                        </FormLabel>
                        <Input
                          placeholder="Ex: Moscow Mule Premium"
                          value={nomeDrink}
                          onChange={(e) => setNomeDrink(e.target.value)}
                          bg="#161c28"
                          borderColor="#263147"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm" color="gray.300">
                          Categoria
                        </FormLabel>
                        <Select
                          value={categoriaDrink}
                          onChange={(e) => setCategoriaDrink(e.target.value)}
                          bg="#161c28"
                          borderColor="#263147"
                        >
                          <option value="Clássicos">Clássicos</option>
                          <option value="Gin & Tonics">Gin & Tonics</option>
                          <option value="Autorais">Autorais</option>
                          <option value="Sem Álcool">Sem Álcool</option>
                        </Select>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel fontSize="sm" color="gray.300">
                          Preço Sugerido (R$)
                        </FormLabel>
                        <InputGroup>
                          <InputLeftAddon bg="#263147" color="gray.300">
                            R$
                          </InputLeftAddon>
                          <Input
                            type="number"
                            step="0.5"
                            placeholder="32.00"
                            value={precoDrink}
                            onChange={(e) => setPrecoDrink(e.target.value)}
                            bg="#161c28"
                            borderColor="#263147"
                          />
                        </InputGroup>
                      </FormControl>
                    </SimpleGrid>

                    <FormControl mb={4}>
                      <FormLabel fontSize="sm" color="gray.300">
                        Descrição e Ingredientes
                      </FormLabel>
                      <Textarea
                        placeholder="Ex: Vodka premium, espuma de gengibre artesanal, limão taiti e gelo picado."
                        value={descricaoDrink}
                        onChange={(e) => setDescricaoDrink(e.target.value)}
                        bg="#161c28"
                        borderColor="#263147"
                      />
                    </FormControl>

                    <Button
                      type="submit"
                      colorScheme="red"
                      isLoading={criandoDrink}
                    >
                      + Cadastrar no Cardápio
                    </Button>
                  </form>
                </Box>

                {/* Lista de Drinks */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {cardapio.map((drink) => (
                    <Box
                      key={drink.id}
                      p={5}
                      bg="#11151f"
                      borderWidth={1}
                      borderColor="#263147"
                      borderRadius="lg"
                    >
                      <HStack justify="space-between" mb={1}>
                        <Text fontWeight="bold" color="white" fontSize="lg">
                          {drink.nome}
                        </Text>
                        <Badge colorScheme="purple">{drink.categoria}</Badge>
                      </HStack>
                      <Text
                        fontWeight="bold"
                        color="teal.300"
                        fontSize="md"
                        mb={2}
                      >
                        R$ {drink.precoSugestao?.toFixed(2) || '0.00'}
                      </Text>
                      {drink.descricao && (
                        <Text fontSize="sm" color="gray.400" mb={4}>
                          {drink.descricao}
                        </Text>
                      )}
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        color="red.300"
                        borderColor="red.500"
                        _hover={{
                          bg: 'rgba(245, 101, 101, 0.15)',
                          color: 'white',
                        }}
                        onClick={() => handleRemoverDrink(drink.id)}
                      >
                        🗑️ Remover Drink
                      </Button>
                    </Box>
                  ))}
                </SimpleGrid>
              </VStack>
            </TabPanel>

            {/* ABA 4: MODERAR AVALIAÇÕES */}
            <TabPanel p={0}>
              <VStack spacing={4} align="stretch">
                {avaliacoes.length === 0 ? (
                  <Box
                    p={6}
                    borderWidth={1}
                    borderColor="#263147"
                    borderRadius="lg"
                    bg="#11151f"
                    textAlign="center"
                  >
                    <Text color="gray.400">
                      Nenhuma avaliação registrada no sistema até o momento.
                    </Text>
                  </Box>
                ) : (
                  avaliacoes.map((av) => (
                    <Box
                      key={av.id}
                      p={5}
                      borderWidth={1}
                      borderColor="#263147"
                      borderRadius="lg"
                      bg={av.visivel !== false ? '#11151f' : '#1a1d29'}
                      opacity={av.visivel !== false ? 1 : 0.6}
                    >
                      <HStack justify="space-between" mb={2}>
                        <Text fontWeight="bold" color="white">
                          ⭐ {av.nota} / 5
                        </Text>
                        <Badge
                          colorScheme={av.visivel !== false ? 'green' : 'red'}
                        >
                          {av.visivel !== false ? 'Visível' : 'Oculto'}
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.300">
                        <strong>Bartender:</strong> {av.bartenderEmail} (ID:{' '}
                        {av.bartenderId})
                      </Text>
                      <Text fontSize="sm" color="gray.300">
                        <strong>Cliente:</strong> {av.clienteEmail}
                      </Text>
                      <Text
                        fontSize="md"
                        color="gray.200"
                        mt={2}
                        p={3}
                        bg="#161c28"
                        borderRadius="md"
                        fontStyle="italic"
                      >
                        "{av.comentario}"
                      </Text>

                      <FormControl
                        display="flex"
                        alignItems="center"
                        justifyContent="flex-end"
                        mt={4}
                      >
                        <FormLabel
                          htmlFor={`switch-${av.id}`}
                          mb="0"
                          fontSize="sm"
                          color="gray.300"
                        >
                          {av.visivel !== false ? 'Visível no site' : 'Oculto do site'}
                        </FormLabel>
                        <Switch
                          id={`switch-${av.id}`}
                          colorScheme="green"
                          isChecked={av.visivel !== false}
                          onChange={() =>
                            toggleVisibilidadeAvaliacao(
                              av.bartenderId,
                              av.id,
                              av.visivel !== false
                            )
                          }
                        />
                      </FormControl>
                    </Box>
                  ))
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  );
}
