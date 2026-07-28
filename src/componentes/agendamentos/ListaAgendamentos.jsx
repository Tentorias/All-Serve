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
  Icon,
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

  const fetchAgendamentos = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const campoBusca = role === 'bartender' ? 'bartenderId' : 'clienteId';
      const q = query(
        collection(db, 'agendamentos'),
        where(campoBusca, '==', currentUser.uid)
      );

      const querySnapshot = await getDocs(q);
      const lista = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      // Ordenar por data de evento de forma simples no lado do cliente
      lista.sort((a, b) => (a.dataEvento > b.dataEvento ? 1 : -1));
      setAgendamentos(lista);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a lista de agendamentos.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
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
        return <Badge colorScheme="green" px={2} py={1} borderRadius="md">Aceito</Badge>;
      case 'recusado':
        return <Badge colorScheme="red" px={2} py={1} borderRadius="md">Recusado</Badge>;
      case 'cancelado':
        return <Badge colorScheme="gray" px={2} py={1} borderRadius="md">Cancelado</Badge>;
      default:
        return <Badge colorScheme="yellow" px={2} py={1} borderRadius="md">Pendente</Badge>;
    }
  };

  if (loading) {
    return (
      <Center p={8}>
        <Spinner size="lg" color="teal.500" />
      </Center>
    );
  }

  return (
    <Box mt={6}>
      <HStack justify="space-between" mb={4}>
        <Heading size="md" color="teal.700">
          {role === 'bartender'
            ? '📅 Solicitações de Orçamento / Agendamento Recebidas'
            : '📅 Meus Orçamentos e Reservas Solicitadas'}
        </Heading>
        <Button size="sm" onClick={fetchAgendamentos} variant="ghost" colorScheme="teal">
          🔄 Atualizar
        </Button>
      </HStack>

      {agendamentos.length === 0 ? (
        <Box p={6} borderWidth={1} borderRadius="lg" bg="gray.50" textAlign="center">
          <Text color="gray.600">
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
              p={6}
              className="glacial-card"
              position="relative"
            >
              <HStack justify="space-between" mb={3}>
                <Text fontWeight="900" fontSize="lg" color="teal.900">
                  🍸 {item.tipoEvento || 'Evento Especial'}
                </Text>
                {renderBadgeStatus(item.status)}
              </HStack>

              <Divider my={2} />

              <VStack align="start" spacing={1.5} fontSize="sm" color="gray.700">
                <Text>
                  <strong>{role === 'bartender' ? 'Cliente:' : 'Bartender:'}</strong>{' '}
                  {role === 'bartender'
                    ? item.clienteEmail
                    : item.bartenderNome || item.bartenderEmail}
                </Text>
                <Text>
                  <strong>Data do Evento:</strong> {item.dataEvento || 'Não informada'}
                </Text>
                <Text>
                  <strong>Duração:</strong> {item.horas || 0} hora(s)
                </Text>
                <Text>
                  <strong>Local:</strong> {item.localEvento || 'A combinar'}
                </Text>
                <Text fontWeight="bold" color="teal.600" fontSize="md">
                  <strong>Valor Estimado:</strong> R$ {item.valorEstimado?.toFixed(2) || '0.00'}
                </Text>
                {item.observacoes && (
                  <Text fontStyle="italic" color="gray.600" mt={1}>
                    "{item.observacoes}"
                  </Text>
                )}
              </VStack>

              {/* Botões de Ação para o Bartender em solicitações pendentes */}
              {role === 'bartender' && item.status === 'pendente' && (
                <HStack spacing={3} mt={4} pt={2} borderTopWidth={1}>
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

              {/* Botão de cancelar para o Cliente caso ainda esteja pendente */}
              {role === 'cliente' && item.status === 'pendente' && (
                <HStack mt={4} pt={2} borderTopWidth={1}>
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
