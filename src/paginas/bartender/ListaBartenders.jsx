// src/paginas/bartender/ListaBartenders.jsx

import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  VStack,
  Text,
  Spinner,
  Center,
  SimpleGrid,
  Button,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config.js';

export default function ListaBartenders() {
  const [bartenders, setBartenders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBartenders = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'bartender'));
        const querySnapshot = await getDocs(q);
        const bartendersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBartenders(bartendersList);
      } catch (error) {
        console.error('Erro ao buscar bartenders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBartenders();
  }, []);

  if (loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box p={8}>
      <VStack spacing={6}>
        <Heading>Bartenders</Heading>
        <Text>Selecione um bartender para ver o perfil ou deixar uma avaliação.</Text>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} width="full">
          {bartenders.length > 0 ? (
            bartenders.map((bartender) => (
              <Box
                key={bartender.id}
                p={6}
                borderWidth={1}
                borderColor="#263147"
                bg="#161c28"
                borderRadius="xl"
                boxShadow="lg"
                textAlign="center"
              >
                <Heading size="md" color="white">{bartender.email}</Heading>
                <Text mt={2} color="gray.400" fontSize="sm">ID: {bartender.id}</Text>
                <ChakraLink as={RouterLink} to={`/bartender/${bartender.id}`}>
                  <Button mt={4} colorScheme="teal" variant="outline">
                    Ver Perfil
                  </Button>
                </ChakraLink>
                <ChakraLink as={RouterLink} to={`/avaliar/${bartender.id}`}>
                  <Button mt={4} ml={2} colorScheme="teal">
                    Avaliar
                  </Button>
                </ChakraLink>
              </Box>
            ))
          ) : (
            <Text>Nenhum bartender encontrado.</Text>
          )}
        </SimpleGrid>
      </VStack>
    </Box>
  );
}
