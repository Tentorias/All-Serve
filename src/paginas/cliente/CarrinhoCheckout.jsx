// src/paginas/cliente/CarrinhoCheckout.jsx

import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Button,
  IconButton,
  Divider,
  Badge,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  Center,
  Spinner,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import { useCarrinho } from '../../contexto/ContextoCarrinho.jsx';
import { useAuth } from '../../contexto/ContextoAutenticacao.jsx';

export default function CarrinhoCheckout() {
  const {
    itensCarrinho,
    adicionarItem,
    removerItem,
    atualizarQuantidade,
    limparCarrinho,
    valorTotal,
  } = useCarrinho();
  const { currentUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Estados de Drinks Oficiais do Firestore para sugestão de compra
  const [drinksOficiais, setDrinksOficiais] = useState([]);
  const [carregandoDrinks, setCarregandoDrinks] = useState(true);

  // Estados do Gateway de Pagamento Simulado
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [processandoPagamento, setProcessandoPagamento] = useState(false);
  const [pedidoConcluido, setPedidoConcluido] = useState(null);

  // Campos do Cartão Simulado
  const [numeroCartao, setNumeroCartao] = useState('');
  const [nomeCartao, setNomeCartao] = useState('');
  const [validadeCartao, setValidadeCartao] = useState('');
  const [cvvCartao, setCvvCartao] = useState('');

  useEffect(() => {
    const fetchDrinks = async () => {
      try {
        const snap = await getDocs(collection(db, 'cardapio_plataforma'));
        const lista = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setDrinksOficiais(lista);
      } catch (error) {
        console.error('Erro ao buscar drinks da plataforma:', error);
      } finally {
        setCarregandoDrinks(false);
      }
    };
    fetchDrinks();
  }, []);

  const preencherCartaoTeste = () => {
    setNumeroCartao('4532 •••• •••• 1234');
    setNomeCartao('CLIENTE ALL SERVE');
    setValidadeCartao('12/30');
    setCvvCartao('789');
    toast({
      title: 'Cartão de teste preenchido!',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const simularPagamentoAprovado = async (metodo) => {
    setProcessandoPagamento(true);
    setTimeout(async () => {
      try {
        const numeroPedido = `AS-${Date.now().toString().slice(-6)}`;
        const pedidoData = {
          clienteId: currentUser?.uid || 'cliente-anonimo',
          clienteEmail: currentUser?.email || 'cliente@allserve.com',
          tipoEvento: `Pedido Checkout #${numeroPedido}`,
          dataEvento: new Date().toLocaleDateString('pt-BR'),
          horas: 1,
          status: 'aceito', // Já confirmado pelo pagamento
          pago: true,
          metodoPagamento: metodo,
          valorEstimado: valorTotal,
          itens: itensCarrinho,
          criadoEm: new Date().toISOString(),
        };

        await addDoc(collection(db, 'agendamentos'), pedidoData);

        setPedidoConcluido({
          numero: numeroPedido,
          valor: valorTotal,
          metodo,
          itensCount: itensCarrinho.length,
        });

        limparCarrinho();
        setProcessandoPagamento(false);
        onClose();

        toast({
          title: '🎉 Pagamento Aprovado com Sucesso!',
          description: `Pedido #${numeroPedido} confirmado na plataforma.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Erro ao salvar pedido:', error);
        setProcessandoPagamento(false);
        toast({
          title: 'Erro ao registrar pedido',
          description: error.message,
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      }
    }, 1500);
  };

  return (
    <Box
      minH="80vh"
      maxW="container.xl"
      margin="auto"
      py={10}
      px={6}
      color="gray.300"
    >
      <Heading size="lg" color="white" mb={2}>
        🛒 Carrinho de Compras & Contratações
      </Heading>
      <Text color="gray.400" mb={8}>
        Revise os itens e drinks do seu evento antes de prosseguir para o
        pagamento seguro.
      </Text>

      {/* MODAL DE CONFIRMAÇÃO DO PEDIDO (PÓS-PAGAMENTO) */}
      {pedidoConcluido && (
        <Box
          p={8}
          mb={8}
          borderWidth={1}
          borderColor="green.400"
          borderRadius="2xl"
          bg="rgba(72, 187, 120, 0.12)"
          textAlign="center"
          boxShadow="2xl"
        >
          <Heading size="md" color="green.300" mb={3}>
            🎉 Pedido #{pedidoConcluido.numero} Confirmado com Sucesso!
          </Heading>
          <Text fontSize="md" color="white" mb={2}>
            Seu pagamento de{' '}
            <strong style={{ color: '#81E6D9' }}>
              R$ {pedidoConcluido.valor.toFixed(2)}
            </strong>{' '}
            via <strong>{pedidoConcluido.metodo}</strong> foi processado e seu
            agendamento já foi registrado!
          </Text>
          <Text fontSize="sm" color="gray.300" mb={6}>
            Você pode acompanhar detalhes deste pedido na aba de agendamentos do
            seu painel.
          </Text>
          <HStack justify="center" spacing={4}>
            <Button
              as={RouterLink}
              to="/painel"
              colorScheme="teal"
              size="sm"
              fontWeight="bold"
            >
              📋 Ver Meus Agendamentos / Painel
            </Button>
            <Button
              size="sm"
              variant="outline"
              colorScheme="green"
              onClick={() => setPedidoConcluido(null)}
            >
              🔄 Fazer Novo Pedido
            </Button>
          </HStack>
        </Box>
      )}

      {itensCarrinho.length === 0 && !pedidoConcluido ? (
        <Box
          p={10}
          borderWidth={1}
          borderColor="#263147"
          borderRadius="2xl"
          bg="#161c28"
          textAlign="center"
          mb={10}
        >
          <Text fontSize="3xl" mb={3}>
            🛒
          </Text>
          <Heading size="md" color="white" mb={2}>
            Seu carrinho está vazio no momento
          </Heading>
          <Text color="gray.400" mb={6}>
            Explore nossos bartenders ou adicione os drinks oficiais da
            plataforma abaixo para começar!
          </Text>
          <Button
            as={RouterLink}
            to="/buscar"
            colorScheme="teal"
            size="md"
            fontWeight="bold"
          >
            🔍 Buscar Bartenders
          </Button>
        </Box>
      ) : null}

      {itensCarrinho.length > 0 && (
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8} mb={12}>
          {/* COLUNA ESQUERDA: LISTA DE ITENS */}
          <Box
            gridColumn={{ base: 'span 1', lg: 'span 2' }}
            p={6}
            bg="#161c28"
            borderWidth={1}
            borderColor="#263147"
            borderRadius="2xl"
            boxShadow="xl"
          >
            <HStack justify="space-between" mb={4}>
              <Heading size="md" color="white">
                Itens no Carrinho ({itensCarrinho.length})
              </Heading>
              <Button
                size="xs"
                colorScheme="red"
                variant="ghost"
                onClick={limparCarrinho}
              >
                🗑️ Limpar Carrinho
              </Button>
            </HStack>
            <Divider borderColor="#263147" mb={4} />

            <VStack spacing={4} align="stretch">
              {itensCarrinho.map((item) => (
                <HStack
                  key={item.id}
                  p={4}
                  bg="#11151f"
                  borderWidth={1}
                  borderColor="#263147"
                  borderRadius="xl"
                  justify="space-between"
                  flexWrap="wrap"
                >
                  <Box flex="1" minW="200px">
                    <HStack mb={1}>
                      <Badge colorScheme="teal">
                        {item.categoria || 'Serviço'}
                      </Badge>
                      {item.bartenderNome && (
                        <Text fontSize="xs" color="gray.400">
                          Bartender: {item.bartenderNome}
                        </Text>
                      )}
                    </HStack>
                    <Text fontWeight="bold" color="white" fontSize="md">
                      {item.nome}
                    </Text>
                    <Text fontSize="sm" color="teal.300">
                      R$ {item.preco?.toFixed(2) || '0.00'} / unid.
                    </Text>
                  </Box>

                  <HStack spacing={3}>
                    {/* CONTROLES DE QUANTIDADE */}
                    <HStack
                      bg="#161c28"
                      borderWidth={1}
                      borderColor="#263147"
                      borderRadius="lg"
                      p={1}
                    >
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() =>
                          atualizarQuantidade(
                            item.id,
                            (item.quantidade || 1) - 1
                          )
                        }
                      >
                        –
                      </Button>
                      <Text
                        fontWeight="bold"
                        color="white"
                        minW="24px"
                        textAlign="center"
                      >
                        {item.quantidade || 1}
                      </Text>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() =>
                          atualizarQuantidade(
                            item.id,
                            (item.quantidade || 1) + 1
                          )
                        }
                      >
                        +
                      </Button>
                    </HStack>

                    <Text fontWeight="bold" color="white" minW="90px" textAlign="right">
                      R${' '}
                      {(
                        (item.preco || 0) * (item.quantidade || 1)
                      ).toFixed(2)}
                    </Text>

                    <IconButton
                      aria-label="Remover item"
                      icon={<span>🗑️</span>}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => removerItem(item.id)}
                    />
                  </HStack>
                </HStack>
              ))}
            </VStack>
          </Box>

          {/* COLUNA DIREITA: RESUMO FINANCEIRO */}
          <Box
            p={6}
            bg="#161c28"
            borderWidth={1}
            borderColor="#263147"
            borderRadius="2xl"
            boxShadow="xl"
            alignSelf="start"
          >
            <Heading size="md" color="white" mb={4}>
              Resumo do Pedido
            </Heading>
            <Divider borderColor="#263147" mb={4} />

            <VStack spacing={3} align="stretch" mb={6}>
              <HStack justify="space-between">
                <Text color="gray.400">Subtotal de Itens:</Text>
                <Text color="white" fontWeight="bold">
                  R$ {valorTotal.toFixed(2)}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.400">Taxa All-Serve:</Text>
                <Text color="green.400" fontWeight="bold">
                  Grátis (R$ 0,00)
                </Text>
              </HStack>
              <Divider borderColor="#263147" my={2} />
              <HStack justify="space-between" fontSize="lg">
                <Text fontWeight="bold" color="white">
                  Total a Pagar:
                </Text>
                <Text fontWeight="800" color="teal.300" fontSize="xl">
                  R$ {valorTotal.toFixed(2)}
                </Text>
              </HStack>
            </VStack>

            <Button
              w="full"
              size="lg"
              colorScheme="teal"
              fontWeight="bold"
              onClick={() => {
                if (!currentUser) {
                  toast({
                    title: 'Login Necessário 💳',
                    description:
                      'Para finalizar seu pedido no checkout, por favor faça login ou crie sua conta grátis!',
                    status: 'info',
                    duration: 3500,
                    isClosable: true,
                  });
                  navigate('/login');
                  return;
                }
                onOpen();
              }}
              _hover={{ bg: 'teal.400', transform: 'translateY(-1px)' }}
              transition="all 0.2s"
            >
              💳 Ir para Pagamento Simulado
            </Button>
            <Text fontSize="xs" color="gray.500" textAlign="center" mt={3}>
              🔒 Ambiente de simulação interativa (Gateway All-Serve Pay).
            </Text>
          </Box>
        </SimpleGrid>
      )}

      {/* SUGESTÕES DE DRINKS DA PLATAFORMA PARA ADICIONAR AO CARRINHO */}
      <Box
        p={8}
        bg="#161c28"
        borderWidth={1}
        borderColor="#263147"
        borderRadius="2xl"
        boxShadow="xl"
      >
        <HStack justify="space-between" mb={2} flexWrap="wrap">
          <Box>
            <Heading size="md" color="white">
              🍹 Cardápio Oficial All-Serve (Drinks Padrões)
            </Heading>
            <Text color="gray.400" fontSize="sm">
              Adicione doses dos nossos drinks clássicos diretamente no seu
              evento
            </Text>
          </Box>
        </HStack>
        <Divider borderColor="#263147" my={4} />

        {carregandoDrinks ? (
          <Center p={8}>
            <Spinner color="teal.300" />
          </Center>
        ) : drinksOficiais.length === 0 ? (
          <Text color="gray.500" fontStyle="italic">
            Nenhum drink cadastrado no cardápio da plataforma no momento. (O
            Administrador pode carregar os clássicos no Painel Admin).
          </Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            {drinksOficiais.map((drink) => (
              <Box
                key={drink.id}
                p={5}
                bg="#11151f"
                borderWidth={1}
                borderColor="#263147"
                borderRadius="xl"
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
              >
                <Box mb={3}>
                  <Badge colorScheme="purple" mb={2}>
                    {drink.categoria || 'Drink'}
                  </Badge>
                  <Text fontWeight="bold" color="white" fontSize="md">
                    {drink.nome}
                  </Text>
                  <Text fontSize="xs" color="gray.400" noOfLines={2} mt={1}>
                    {drink.descricao || 'Ingredientes selecionados para evento.'}
                  </Text>
                </Box>
                <HStack justify="space-between" align="center" mt={3}>
                  <Text fontWeight="bold" color="teal.300">
                    R$ {drink.precoSugestao?.toFixed(2) || '25.00'}
                  </Text>
                  <Button
                    size="sm"
                    colorScheme="teal"
                    variant="outline"
                    onClick={() =>
                      adicionarItem({
                        id: drink.id,
                        nome: drink.nome,
                        preco: drink.precoSugestao || 25,
                        categoria: drink.categoria || 'Drink',
                      })
                    }
                  >
                    + 🛒 Adicionar
                  </Button>
                </HStack>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* MODAL DE GATEWAY DE PAGAMENTO SIMULADO (ALL-SERVE PAY) */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay backdropFilter="blur(6px)" />
        <ModalContent
          bg="#161c28"
          borderWidth={1}
          borderColor="#263147"
          color="white"
          borderRadius="2xl"
          boxShadow="2xl"
        >
          <ModalHeader borderBottom="1px solid" borderColor="#263147">
            💳 Gateway All-Serve Pay — Checkout Simulado
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody py={6}>
            <Text color="gray.300" fontSize="sm" mb={6}>
              Escolha um método de pagamento abaixo para testar a confirmação
              instantânea do seu pedido de{' '}
              <strong style={{ color: '#81E6D9' }}>
                R$ {valorTotal.toFixed(2)}
              </strong>
              .
            </Text>

            <Tabs variant="enclosed" colorScheme="teal" isLazy>
              <TabList mb={4} borderColor="#263147">
                <Tab
                  _selected={{ color: 'teal.300', borderColor: '#263147' }}
                  color="gray.400"
                >
                  💠 PIX Simulado
                </Tab>
                <Tab
                  _selected={{ color: 'teal.300', borderColor: '#263147' }}
                  color="gray.400"
                >
                  💳 Cartão de Crédito
                </Tab>
                <Tab
                  _selected={{ color: 'teal.300', borderColor: '#263147' }}
                  color="gray.400"
                >
                  📄 Boleto Simulado
                </Tab>
              </TabList>

              <TabPanels>
                {/* ABA 1: PIX SIMULADO */}
                <TabPanel p={4} bg="#11151f" borderRadius="xl">
                  <VStack spacing={4} align="stretch">
                    <Center
                      p={6}
                      bg="white"
                      borderRadius="lg"
                      flexDirection="column"
                    >
                      <Text
                        color="black"
                        fontWeight="900"
                        fontSize="sm"
                        mb={2}
                      >
                        [ PIX QR CODE SIMULADO ]
                      </Text>
                      <Text color="gray.600" fontSize="xs" textAlign="center">
                        Escaneie com seu app do banco ou use o código Pix
                        Copia e Cola abaixo.
                      </Text>
                    </Center>

                    <Input
                      readOnly
                      value="00020126580014br.gov.bcb.pix0136allserve-simulado-2026-checkout"
                      bg="#161c28"
                      borderColor="#263147"
                      fontSize="xs"
                      color="teal.300"
                    />

                    <Button
                      w="full"
                      colorScheme="teal"
                      size="lg"
                      isLoading={processandoPagamento}
                      onClick={() => simularPagamentoAprovado('PIX Instantâneo')}
                    >
                      🚀 Simular Pagamento PIX Aprovado (R${' '}
                      {valorTotal.toFixed(2)})
                    </Button>
                  </VStack>
                </TabPanel>

                {/* ABA 2: CARTÃO DE CRÉDITO */}
                <TabPanel p={4} bg="#11151f" borderRadius="xl">
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.300">
                        Insira um cartão ou use os dados de teste:
                      </Text>
                      <Button
                        size="xs"
                        colorScheme="purple"
                        variant="outline"
                        onClick={preencherCartaoTeste}
                      >
                        ✨ Preencher Cartão de Teste
                      </Button>
                    </HStack>

                    <FormControl>
                      <FormLabel fontSize="xs" color="gray.400">
                        Número do Cartão
                      </FormLabel>
                      <Input
                        placeholder="0000 0000 0000 0000"
                        value={numeroCartao}
                        onChange={(e) => setNumeroCartao(e.target.value)}
                        bg="#161c28"
                        borderColor="#263147"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="xs" color="gray.400">
                        Nome Impresso no Cartão
                      </FormLabel>
                      <Input
                        placeholder="NOME COMO ESTÁ NO CARTÃO"
                        value={nomeCartao}
                        onChange={(e) => setNomeCartao(e.target.value)}
                        bg="#161c28"
                        borderColor="#263147"
                      />
                    </FormControl>

                    <HStack spacing={4}>
                      <FormControl>
                        <FormLabel fontSize="xs" color="gray.400">
                          Validade (MM/AA)
                        </FormLabel>
                        <Input
                          placeholder="12/30"
                          value={validadeCartao}
                          onChange={(e) => setValidadeCartao(e.target.value)}
                          bg="#161c28"
                          borderColor="#263147"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="xs" color="gray.400">
                          CVV
                        </FormLabel>
                        <Input
                          placeholder="123"
                          value={cvvCartao}
                          onChange={(e) => setCvvCartao(e.target.value)}
                          bg="#161c28"
                          borderColor="#263147"
                        />
                      </FormControl>
                    </HStack>

                    <Button
                      w="full"
                      colorScheme="teal"
                      size="lg"
                      isLoading={processandoPagamento}
                      onClick={() =>
                        simularPagamentoAprovado('Cartão de Crédito')
                      }
                    >
                      🔒 Confirmar Pagamento com Cartão (R${' '}
                      {valorTotal.toFixed(2)})
                    </Button>
                  </VStack>
                </TabPanel>

                {/* ABA 3: BOLETO */}
                <TabPanel p={4} bg="#11151f" borderRadius="xl">
                  <VStack spacing={4} align="stretch" textAlign="center">
                    <Box p={4} bg="#161c28" borderRadius="md">
                      <Text fontFamily="monospace" fontSize="xs" color="gray.300">
                        34191.79001 01043.510047 91020.150008 1 935800000
                        {valorTotal.toFixed(0)}00
                      </Text>
                    </Box>
                    <Text fontSize="xs" color="gray.400">
                      Na vida real, boletos levam até 3 dias úteis para
                      compensar. Aqui você pode simular a confirmação imediata.
                    </Text>
                    <Button
                      w="full"
                      colorScheme="teal"
                      size="lg"
                      isLoading={processandoPagamento}
                      onClick={() =>
                        simularPagamentoAprovado('Boleto Simulado')
                      }
                    >
                      📄 Simular Compensação de Boleto
                    </Button>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor="#263147">
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
