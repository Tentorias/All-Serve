// src/paginas/admin/ModerarAvaliacoes.jsx

import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Spinner,
  Center,
  VStack,
  Switch,
  useToast,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { collectionGroup, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config.js';

export default function ModerarAvaliacoes() {
  const [avaliacoes, setAvaliations] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchAvaliations = async () => {
    try {
      const q = query(collectionGroup(db, 'avaliacoes'));
      const querySnapshot = await getDocs(q);
      const allAvaliations = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        bartenderId: doc.ref.parent.parent.id, // Pega o ID do bartender
        ...doc.data(),
      }));
      setAvaliations(allAvaliations);
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvaliations();
  }, []);

  const handleToggleVisibilidade = async (bartenderId, avaliacaoId, currentStatus) => {
    const avaliacaoRef = doc(db, 'users', bartenderId, 'avaliacoes', avaliacaoId);
    try {
      await updateDoc(avaliacaoRef, {
        visivel: !currentStatus,
      });
      // Atualiza o estado localmente para refletir a mudança
      setAvaliations((prev) =>
        prev.map((av) =>
          av.id === avaliacaoId ? { ...av, visivel: !currentStatus } : av
        )
      );
      toast({
        title: 'Visibilidade alterada com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao atualizar visibilidade:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar a visibilidade.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box p={8}>
      <Heading mb={6}>Moderar Avaliações</Heading>
      <VStack spacing={4} align="stretch">
        {avaliacoes.length > 0 ? (
          avaliacoes.map((avaliacao) => (
            <Box
              key={avaliacao.id}
              p={4}
              borderWidth={1}
              borderRadius={8}
              bg={avaliacao.visivel ? 'white' : 'gray.100'}
            >
              <Text>
                <strong>Bartender ID:</strong> {avaliacao.bartenderId}
              </Text>
              <Text>
                <strong>Cliente:</strong> {avaliacao.clienteEmail}
              </Text>
              <Text>
                <strong>Nota:</strong> {avaliacao.nota}
              </Text>
              <Text>
                <strong>Comentário:</strong> "{avaliacao.comentario}"
              </Text>
              <FormControl display="flex" alignItems="center" mt={4}>
                <FormLabel htmlFor={`switch-${avaliacao.id}`} mb="0">
                  {avaliacao.visivel ? 'Visível' : 'Oculto'}
                </FormLabel>
                <Switch
                  id={`switch-${avaliacao.id}`}
                  isChecked={avaliacao.visivel}
                  onChange={() =>
                    handleToggleVisibilidade(
                      avaliacao.bartenderId,
                      avaliacao.id,
                      avaliacao.visivel
                    )
                  }
                />
              </FormControl>
            </Box>
          ))
        ) : (
          <Text>Nenhuma avaliação encontrada para moderar.</Text>
        )}
      </VStack>
    </Box>
  );
}
