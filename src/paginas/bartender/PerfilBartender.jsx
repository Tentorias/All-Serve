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
  Avatar,
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

  const valorEstimadoCalculado = ((Number(bartender?.precoPorHora) || 0) * (Number(horas) || 1)).toFixed(2);

  return (
    <Box p={{ base: 4, md: 8 }} maxWidth="960px" margin="auto">
      {bartender ? (
        <VStack spacing={8} align="stretch">
          {/* Cabeçalho do Perfil - Hero Card */}
          <Box
            bg="#161c28"
            borderWidth={1}
            borderColor="#263147"
            borderRadius="2xl"
            boxShadow="2xl"
            overflow="hidden"
          >
            {/* Banner superior decorativo */}
            <Box
              h="140px"
              bgGradient="linear(to-r, teal.900, #161c28, blue.900)"
              position="relative"
            />

            {/* Conteúdo principal do card de perfil */}
            <Box p={{ base: 6, md: 8 }} pt={0}>
              <Flex
                direction={{ base: 'column', md: 'row' }}
                justify="space-between"
                align={{ base: 'center', md: 'flex-end' }}
                mt="-60px"
                mb={4}
                gap={6}
                flexWrap="wrap"
              >
                {/* Avatar + Informações do Bartender */}
                <Flex direction={{ base: 'column', sm: 'row' }} align="center" gap={6}>
                  <Avatar
                    size="2xl"
                    name={bartender.nome || bartender.email}
                    src={bartender.fotoURL}
                    border="4px solid"
                    borderColor="#161c28"
                    boxShadow="xl"
                    bg="teal.600"
                    color="white"
                  />
                  <VStack align={{ base: 'center', sm: 'flex-start' }} spacing={2} pt={{ base: 0, sm: 12 }}>
                    <Heading size="lg" color="white" textAlign={{ base: 'center', sm: 'left' }}>
                      {bartender.nome || bartender.email}
                    </Heading>
                    <HStack spacing={2} flexWrap="wrap" justify={{ base: 'center', sm: 'flex-start' }}>
                      <Badge colorScheme="teal" px={3} py={1} borderRadius="full" fontSize="sm">
                        {bartender.especialidade || 'Coquetelaria Especializada'}
                      </Badge>
                      {bartender.precoPorHora !== undefined && (
                        <Text fontWeight="bold" fontSize="lg" color="teal.300">
                          R$ {bartender.precoPorHora}/hora
                        </Text>
                      )}
                    </HStack>
                    <HStack spacing={2} pt={1}>
                      <Icon as={IconeEstrela} color="gold" boxSize={5} />
                      <Text fontSize="lg" fontWeight="bold" color="white">{media.toFixed(1)}</Text>
                      <Text color="gray.400" fontSize="sm">
                        ({avaliacoes.length} {avaliacoes.length === 1 ? 'avaliação' : 'avaliações'})
                      </Text>
                    </HStack>
                  </VStack>
                </Flex>

                {/* Ações do Perfil (Botões bem alinhados sem sobrepor ou estourar a caixa) */}
                <Flex
                  direction={{ base: 'column', sm: 'row' }}
                  gap={3}
                  width={{ base: 'full', md: 'auto' }}
                  pt={{ base: 4, md: 8 }}
                >
                  {currentUser && currentUser.uid === bartenderId ? (
                    <Button
                      as={RouterLink}
                      to="/bartender/editar"
                      colorScheme="teal"
                      size="md"
                      px={6}
                      boxShadow="lg"
                      width={{ base: 'full', sm: 'auto' }}
                    >
                      ✏️ Editar Meu Perfil
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={onOpen}
                        colorScheme="teal"
                        size="md"
                        px={6}
                        boxShadow="lg"
                        fontWeight="bold"
                        width={{ base: 'full', sm: 'auto' }}
                      >
                        📅 Solicitar Reserva / Parceria
                      </Button>
                      <Button
                        as={RouterLink}
                        to={`/avaliar/${bartenderId}`}
                        colorScheme="teal"
                        variant="outline"
                        size="md"
                        px={6}
                        width={{ base: 'full', sm: 'auto' }}
                      >
                        ⭐ Avaliar Bartender / Colega
                      </Button>
                    </>
                  )}
                </Flex>
              </Flex>
            </Box>
          </Box>

          <Divider borderColor="#263147" />

          {/* Seção de Comentários e Avaliações */}
          <Box>
            <Heading size="md" mb={4} color="white">
              Avaliações de Clientes e Colegas Profissionais
            </Heading>
            {avaliacoes.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {avaliacoes.map((avaliacao) => (
                  <Box
                    key={avaliacao.id}
                    p={5}
                    borderWidth={1}
                    borderColor="#263147"
                    borderRadius="xl"
                    boxShadow="md"
                    bg="#161c28"
                  >
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="bold" color="teal.300">
                        {avaliacao.clienteEmail}
                      </Text>
                      <HStack spacing={1}>
                        {[...Array(5)].map((_, i) => (
                          <Icon
                            key={i}
                            as={IconeEstrela}
                            color={i < avaliacao.nota ? 'gold' : 'gray.600'}
                          />
                        ))}
                      </HStack>
                    </HStack>
                    {avaliacao.comentario && (
                      <Text fontStyle="italic" color="gray.300">
                        "{avaliacao.comentario}"
                      </Text>
                    )}
                  </Box>
                ))}
              </VStack>
            ) : (
              <Box
                p={8}
                textAlign="center"
                borderWidth={1}
                borderColor="#263147"
                borderRadius="xl"
                bg="#161c28"
              >
                <Icon as={IconeEstrela} color="gray.600" boxSize={10} mb={3} />
                <Text color="gray.400" fontSize="md" fontWeight="medium">
                  Este bartender ainda não recebeu avaliações.
                </Text>
                <Text color="gray.500" fontSize="sm" mt={1}>
                  Seja o primeiro a contratar e avaliar o serviço!
                </Text>
              </Box>
            )}
          </Box>

          {/* Modal de Solicitação de Orçamento / Agendamento em Modo Escuro */}
          <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay backdropFilter="blur(4px)" />
            <ModalContent
              as="form"
              onSubmit={handleSolicitarOrçamento}
              bg="#161c28"
              borderColor="#263147"
              borderWidth={1}
              color="white"
              borderRadius="xl"
            >
              <ModalHeader>Solicitar Orçamento / Reserva</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4} align="stretch">
                  <Text fontSize="sm" color="gray.300">
                    Preencha os dados do seu evento para enviar um pedido a{' '}
                    <strong style={{ color: '#fff' }}>{bartender.nome || bartender.email}</strong>.
                  </Text>

                  <FormControl isRequired>
                    <FormLabel>Tipo de Evento</FormLabel>
                    <Select
                      value={tipoEvento}
                      onChange={(e) => setTipoEvento(e.target.value)}
                      bg="#11151f"
                      borderColor="#263147"
                    >
                      <option value="Casamento" style={{ backgroundColor: '#161c28' }}>Casamento</option>
                      <option value="Aniversário" style={{ backgroundColor: '#161c28' }}>Aniversário</option>
                      <option value="Festa Corporativa" style={{ backgroundColor: '#161c28' }}>Festa Corporativa</option>
                      <option value="Confraternização" style={{ backgroundColor: '#161c28' }}>Confraternização</option>
                      <option value="Evento Particular" style={{ backgroundColor: '#161c28' }}>Evento Particular</option>
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Data Prevista do Evento</FormLabel>
                    <Input
                      type="date"
                      value={dataEvento}
                      onChange={(e) => setDataEvento(e.target.value)}
                      bg="#11151f"
                      borderColor="#263147"
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
                      bg="#11151f"
                      borderColor="#263147"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Local / Cidade do Evento</FormLabel>
                    <Input
                      placeholder="Ex: Espaço Villa Lobos, São Paulo - SP"
                      value={localEvento}
                      onChange={(e) => setLocalEvento(e.target.value)}
                      bg="#11151f"
                      borderColor="#263147"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Observações ou Pedidos Especiais</FormLabel>
                    <Textarea
                      placeholder="Ex: Preferência por drinks sem álcool e clássicos reformulados."
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      bg="#11151f"
                      borderColor="#263147"
                    />
                  </FormControl>

                  <Box
                    p={4}
                    bg="rgba(49, 151, 149, 0.1)"
                    borderRadius="lg"
                    borderWidth={1}
                    borderColor="teal.500"
                  >
                    <Text fontSize="sm" color="teal.300">
                      <strong>Preço por Hora:</strong> R$ {bartender.precoPorHora || 0}
                    </Text>
                    <Text fontSize="md" fontWeight="bold" color="white" mt={1}>
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
        <Text color="gray.400">Bartender não encontrado.</Text>
      )}
    </Box>
  );
}

