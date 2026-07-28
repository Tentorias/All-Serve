// src/componentes/agendamentos/ListaAgendamentos.jsx

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  Spinner,
  Center,
  useToast,
  Divider,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import { useAuth } from '../../contexto/ContextoAutenticacao.jsx';

export default function ListaAgendamentos({ role }) {
  const { currentUser } = useAuth();
  const toast = useToast();
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processandoId, setProcessandoId] = useState(null);
  const [errorPermissao, setErrorPermissao] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchAgendamentos = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrorPermissao(false);
    setErrorMessage(null);
    try {
      const roleNormalized = (role || 'cliente').toLowerCase().trim();
      const campoBusca = roleNormalized === 'bartender' ? 'bartenderId' : 'clienteId';
      const q = query(
        collection(db, 'agendamentos'),
        where(campoBusca, '==', currentUser.uid)
      );

      const querySnapshot = await getDocs(q);
      const lista = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      lista.sort((a, b) => {
        const dataA = a.dataEvento || '';
        const dataB = b.dataEvento || '';
        return dataA > dataB ? 1 : -1;
      });
      setAgendamentos(lista);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      if (
        error.code === 'permission-denied' ||
        error.message?.toLowerCase().includes('permission') ||
        error.message?.toLowerCase().includes('permiss')
      ) {
        setErrorPermissao(true);
        toast({
          title: 'Permissão Negada no Firestore',
          description:
            "O Firebase bloqueou a leitura da coleção 'agendamentos'. Verifique as Regras de Segurança no Firebase Console.",
          status: 'error',
          duration: 6000,
          isClosable: true,
        });
      } else {
        setErrorMessage(error.message || 'Não foi possível carregar a lista de agendamentos.');
        toast({
          title: 'Erro de Leitura',
          description: error.message || 'Não foi possível carregar a lista de agendamentos.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser, role, toast]);

  useEffect(() => {
    fetchAgendamentos();
  }, [fetchAgendamentos]);

  const atualizarStatus = async (agendamentoId, novoStatus) => {
    setProcessandoId(agendamentoId);
    try {
      const docRef = doc(db, 'agendamentos', agendamentoId);
      await updateDoc(docRef, { status: novoStatus });

      setAgendamentos((prev) =>
        prev.map((item) =>
          item.id === agendamentoId ? { ...item, status: novoStatus } : item
        )
      );

      toast({
        title: 'Status Atualizado',
        description: `O agendamento foi marcado como "${novoStatus}".`,
        status: novoStatus === 'aceito' ? 'success' : 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status da solicitação.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setProcessandoId(null);
    }
  };

  const renderBadgeStatus = (status) => {
    switch (status) {
      case 'aceito':
        return <Badge colorScheme="green" px={2.5} py={1} borderRadius="md">Aceito</Badge>;
      case 'recusado':
        return <Badge colorScheme="red" px={2.5} py={1} borderRadius="md">Recusado</Badge>;
      case 'cancelado':
        return <Badge colorScheme="gray" px={2.5} py={1} borderRadius="md">Cancelado</Badge>;
      default:
        return <Badge colorScheme="yellow" px={2.5} py={1} borderRadius="md">Pendente</Badge>;
    }
  };

  if (loading) {
    return (
      <Center p={8}>
        <Spinner size="lg" color="teal.400" />
      </Center>
    );
  }

  return (
    <Box mt={6}>
      <HStack justify="space-between" mb={4}>
        <Heading size="md" color="white">
          {role === 'bartender'
            ? '📅 Solicitações de Orçamento / Agendamento Recebidas'
            : '📅 Meus Orçamentos e Reservas Solicitadas'}
        </Heading>
        <Button size="sm" onClick={fetchAgendamentos} variant="outline" colorScheme="teal">
          🔄 Atualizar
        </Button>
      </HStack>

      {errorPermissao ? (
        <Box
          p={6}
          borderWidth={1}
          borderColor="orange.500"
          bg="rgba(221, 107, 32, 0.1)"
          borderRadius="xl"
          color="white"
          mb={6}
        >
          <Heading size="sm" color="orange.300" mb={2}>
            ⚠️ Permissão Negada pelas Regras do Firestore (Rules)
          </Heading>
          <Text fontSize="sm" color="gray.300" mb={3}>
            O Firebase bloqueou a leitura da coleção <strong>agendamentos</strong>. Para resolver em 10 segundos, acesse o <strong>Firebase Console &gt; Firestore Database &gt; Regras (Rules)</strong> e certifique-se de permitir leitura/escrita na coleção <code>agendamentos</code>:
          </Text>
          <Box
            as="pre"
            p={4}
            bg="#0f131c"
            borderRadius="md"
            borderWidth={1}
            borderColor="#263147"
            fontSize="xs"
            color="teal.300"
            overflowX="auto"
          >
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if true;
    }
    match /users/{userId}/avaliacoes/{avaliacaoId} {
      allow read, write: if true;
    }
    match /agendamentos/{agendamentoId} {
      allow read, write: if request.auth != null;
    }
  }
}`}
          </Box>
        </Box>
      ) : errorMessage ? (
        <Box
          p={6}
          borderWidth={1}
          borderColor="red.500"
          bg="rgba(229, 62, 62, 0.1)"
          borderRadius="xl"
          color="white"
          mb={6}
        >
          <Heading size="sm" color="red.300" mb={2}>
            ⚠️ Não foi possível carregar a lista de agendamentos
          </Heading>
          <Text fontSize="sm" color="gray.300">
            <strong>Motivo/Detalhes:</strong> {errorMessage}
          </Text>
        </Box>
      ) : agendamentos.length === 0 ? (
        <Box
          p={6}
          borderWidth={1}
          borderColor="#263147"
          borderRadius="lg"
          bg="#161c28"
          textAlign="center"
        >
          <Text color="gray.400">
            {role === 'bartender'
              ? 'Você ainda não recebeu nenhuma solicitação de orçamento ou agendamento.'
              : 'Você ainda não fez nenhuma solicitação de agendamento com um bartender.'}
          </Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {agendamentos.map((item) => (
            <Box
              key={item.id}
              p={5}
              borderWidth={1}
              borderColor="#263147"
              borderRadius="xl"
              boxShadow="lg"
              bg="#161c28"
            >
              <HStack justify="space-between" mb={2}>
                <Text fontWeight="bold" fontSize="lg" color="white">
                  {item.tipoEvento || 'Evento Especial'}
                </Text>
                {renderBadgeStatus(item.status)}
              </HStack>

              <Divider borderColor="#263147" my={2} />

              <VStack align="start" spacing={1.5} fontSize="sm" color="gray.300">
                <Text>
                  <strong style={{ color: '#fff' }}>{role === 'bartender' ? 'Cliente:' : 'Bartender:'}</strong>{' '}
                  {role === 'bartender'
                    ? item.clienteEmail
                    : item.bartenderNome || item.bartenderEmail}
                </Text>
                <Text>
                  <strong style={{ color: '#fff' }}>Data do Evento:</strong> {item.dataEvento || 'Não informada'}
                </Text>
                <Text>
                  <strong style={{ color: '#fff' }}>Duração:</strong> {item.horas || 0} hora(s)
                </Text>
                <Text>
                  <strong style={{ color: '#fff' }}>Local:</strong> {item.localEvento || 'A combinar'}
                </Text>
                <Text fontWeight="bold" color="teal.300" fontSize="md" pt={1}>
                  Valor Estimado: R$ {item.valorEstimado?.toFixed(2) || '0.00'}
                </Text>
                {item.observacoes && (
                  <Text fontStyle="italic" color="gray.400" mt={1}>
                    "{item.observacoes}"
                  </Text>
                )}
              </VStack>

              {role === 'bartender' && item.status === 'pendente' && (
                <HStack spacing={3} mt={4} pt={3} borderTop="1px solid" borderColor="#263147">
                  <Button
                    size="sm"
                    colorScheme="green"
                    isLoading={processandoId === item.id}
                    onClick={() => atualizarStatus(item.id, 'aceito')}
                  >
                    Aceitar Orçamento
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    isLoading={processandoId === item.id}
                    onClick={() => atualizarStatus(item.id, 'recusado')}
                  >
                    Recusar
                  </Button>
                </HStack>
              )}

              {role === 'cliente' && item.status === 'pendente' && (
                <HStack mt={4} pt={3} borderTop="1px solid" borderColor="#263147">
                  <Button
                    size="sm"
                    colorScheme="gray"
                    variant="outline"
                    isLoading={processandoId === item.id}
                    onClick={() => atualizarStatus(item.id, 'cancelado')}
                  >
                    Cancelar Solicitação
                  </Button>
                </HStack>
              )}
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
