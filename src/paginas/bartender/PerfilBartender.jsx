// src/paginas/bartender/PerfilBartender.jsx 

import { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Spinner,
  Center,
  VStack,
  HStack,
  Icon,
  Divider,
  Image,
  Badge,
  Button,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import IconeEstrela from '../../componentes/comuns/IconeEstrela.jsx';
import { useAuth } from '../../contexto/ContextoAutenticacao.jsx';

export default function PerfilBartender() {
  const { bartenderId } = useParams();
  const { currentUser } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [bartender, setBartender] = useState(null);
  const [avaliacoes, setAvaliations] = useState([]);
  const [media, setMedia] = useState(0);
  const [loading, setLoading] = useState(true);

  // Estados do formulário de agendamento/orçamento
  const [tipoEvento, setTipoEvento] = useState('Casamento');
  const [dataEvento, setDataEvento] = useState('');
  const [horas, setHoras] = useState(4);
  const [localEvento, setLocalEvento] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [enviandoSolicitacao, setEnviandoSolicitacao] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bartenderDocRef = doc(db, 'users', bartenderId);
        const bartenderDoc = await getDoc(bartenderDocRef);
        if (bartenderDoc.exists()) setBartender(bartenderDoc.data());

        const q = query(collection(db, 'users', bartenderId, 'avaliacoes'), where('visivel', '==', true));
        const querySnapshot = await getDocs(q);
        const avaliacoesList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAvaliations(avaliacoesList);

        if (avaliacoesList.length > 0) {
          const totalNotas = avaliacoesList.reduce((acc, curr) => acc + curr.nota, 0);
          setMedia(totalNotas / avaliacoesList.length);
        }
      } catch (error) { 
        console.error('Erro ao buscar dados:', error); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, [bartenderId]);

  const handleSolicitarOrçamento = async (e) => {
    e.preventDefault();
    if (!currentUser || !bartender) return;

    setEnviandoSolicitacao(true);
    try {
      const precoPorHora = Number(bartender.precoPorHora) || 0;
      const qtdHoras = Number(horas) || 1;
      const valorEstimado = precoPorHora * qtdHoras;

      await addDoc(collection(db, 'agendamentos'), {
        bartenderId: bartenderId,
        bartenderEmail: bartender.email || '',
        bartenderNome: bartender.nome || bartender.email || '',
        clienteId: currentUser.uid,
        clienteEmail: currentUser.email || '',
        tipoEvento,
        dataEvento,
        horas: qtdHoras,
        localEvento,
        observacoes,
        valorEstimado,
        status: 'pendente',
        criadoEm: serverTimestamp(),
      });

      toast({
        title: 'Solicitação Enviada com Sucesso!',
        description: `Seu pedido de orçamento para ${tipoEvento} foi encaminhado ao bartender. Acompanhe em seu Painel!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onClose();
      // Limpar campos
      setDataEvento('');
      setLocalEvento('');
      setObservacoes('');
    } catch (error) {
      console.error('Erro ao salvar solicitação de agendamento:', error);
      toast({
        title: 'Erro no Envio',
        description: 'Não foi possível enviar a solicitação. Tente novamente.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setEnviandoSolicitacao(false);
    }
  };

  if (loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  const placeholderImage = 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80';
  const valorEstimadoCalculado = ((Number(bartender?.precoPorHora) || 0) * (Number(horas) || 1)).toFixed(2);

  return (
    <Box py={8} px={4} maxWidth="1000px" margin="auto">
      {bartender ? (
        <VStack spacing={8} align="stretch">
          {/* Cabeçalho do Perfil - Vidro Glacial Aero */}
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align="center"
            gap={8}
            p={8}
            className="glacial-card"
          >
            <Image
              src={bartender.fotoURL || placeholderImage}
              alt={`Foto de ${bartender.nome || bartender.email}`}
              boxSize="160px"
              objectFit="cover"
              borderRadius="full"
              className="glacial-avatar"
            />
            <VStack align={{ base: 'center', md: 'flex-start' }} spacing={3} flex={1}>
              <Heading size="xl" color="teal.900" fontWeight="900">
                {bartender.nome || bartender.email}
              </Heading>
              {bartender.especialidade && (
                <Box>
                  <span className="glacial-badge">
                    🍸 {bartender.especialidade}
                  </span>
                </Box>
              )}
              {bartender.precoPorHora !== undefined && (
                <Text fontWeight="900" fontSize="2xl" className="glacial-text-gradient">
                  R$ {bartender.precoPorHora}/h
                </Text>
              )}
              <HStack
                spacing={2}
                bg="rgba(255, 215, 0, 0.15)"
                px={3}
                py={1}
                borderRadius="full"
                border="1px solid rgba(255, 215, 0, 0.35)"
              >
                <Text fontSize="xl" fontWeight="800" color="gray.800">{media.toFixed(1)}</Text>
                <Icon as={IconeEstrela} color="yellow.500" boxSize={6} />
                <Text color="gray.600" fontSize="sm">({avaliacoes.length} avaliações)</Text>
              </HStack>
            </VStack>

            {/* Ações: Botão Editar para o Próprio Bartender ou Botão Glacial para Clientes */}
            <VStack spacing={3} width={{ base: 'full', md: 'auto' }}>
              {currentUser && currentUser.uid === bartenderId ? (
                <Button
                  as={RouterLink}
                  to="/bartender/editar"
                  className="glacial-btn"
                  size="md"
                  px={6}
                  py={5}
                >
                  ✏️ Editar Meu Perfil ✨
                </Button>
              ) : (
                <>
                  <Button
                    onClick={onOpen}
                    className="glacial-btn"
                    size="lg"
                    px={8}
                    py={6}
                    width="full"
                  >
                    📅 Solicitar Orçamento ✨
                  </Button>
                  <Button
                    as={RouterLink}
                    to={`/avaliar/${bartenderId}`}
                    colorScheme="teal"
                    variant="outline"
                    size="md"
                    width="full"
                  >
                    ⭐ Avaliar Bartender
                  </Button>
                </>
              )}
            </VStack>
          </Flex>

          <Divider />

          {/* Seção de Comentários e Avaliações */}
          <Box>
            <Heading size="md" mb={4}>Avaliações dos Clientes</Heading>
            {avaliacoes.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {avaliacoes.map((avaliacao) => (
                  <Box
                    key={avaliacao.id}
                    p={4}
                    borderWidth={1}
                    borderRadius={8}
                    boxShadow="sm"
                    bg="gray.50"
                  >
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="bold" color="teal.700">
                        {avaliacao.clienteEmail}
                      </Text>
                      <HStack spacing={1}>
                        {[...Array(5)].map((_, i) => (
                          <Icon
                            key={i}
                            as={IconeEstrela}
                            color={i < avaliacao.nota ? 'gold' : 'gray.300'}
                          />
                        ))}
                      </HStack>
                    </HStack>
                    {avaliacao.comentario && (
                      <Text fontStyle="italic" color="gray.700">
                        "{avaliacao.comentario}"
                      </Text>
                    )}
                  </Box>
                ))}
              </VStack>
            ) : (
              <Text color="gray.500">Este bartender ainda não recebeu avaliações.</Text>
            )}
          </Box>

          {/* Modal de Solicitação de Orçamento / Agendamento */}
          <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent as="form" onSubmit={handleSolicitarOrçamento}>
              <ModalHeader>Solicitar Orçamento / Reserva</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4} align="stretch">
                  <Text fontSize="sm" color="gray.600">
                    Preencha os dados do seu evento para enviar um pedido a{' '}
                    <strong>{bartender.nome || bartender.email}</strong>.
                  </Text>

                  <FormControl isRequired>
                    <FormLabel>Tipo de Evento</FormLabel>
                    <Select
                      value={tipoEvento}
                      onChange={(e) => setTipoEvento(e.target.value)}
                    >
                      <option value="Casamento">Casamento</option>
                      <option value="Aniversário">Aniversário</option>
                      <option value="Festa Corporativa">Festa Corporativa</option>
                      <option value="Confraternização">Confraternização</option>
                      <option value="Evento Particular">Evento Particular</option>
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Data Prevista do Evento</FormLabel>
                    <Input
                      type="date"
                      value={dataEvento}
                      onChange={(e) => setDataEvento(e.target.value)}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Duração Estimada (Horas)</FormLabel>
                    <Input
                      type="number"
                      min={1}
                      max={48}
                      value={horas}
                      onChange={(e) => setHoras(e.target.value)}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Local / Cidade do Evento</FormLabel>
                    <Input
                      placeholder="Ex: Espaço Villa Lobos, São Paulo - SP"
                      value={localEvento}
                      onChange={(e) => setLocalEvento(e.target.value)}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Observações ou Pedidos Especiais</FormLabel>
                    <Textarea
                      placeholder="Ex: Preferência por drinks sem álcool e clássicos reformulados."
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                    />
                  </FormControl>

                  <Box p={3} bg="teal.50" borderRadius="md" borderWidth={1} borderColor="teal.200">
                    <Text fontSize="sm" color="teal.800">
                      <strong>Preço por Hora:</strong> R$ {bartender.precoPorHora || 0}
                    </Text>
                    <Text fontSize="md" fontWeight="bold" color="teal.700" mt={1}>
                      Valor Estimado do Orçamento: R$ {valorEstimadoCalculado}
                    </Text>
                  </Box>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  colorScheme="teal"
                  type="submit"
                  isLoading={enviandoSolicitacao}
                  loadingText="Enviando..."
                >
                  Enviar Solicitação
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </VStack>
      ) : (
        <Text>Bartender não encontrado.</Text>
      )}
    </Box>
  );
}
