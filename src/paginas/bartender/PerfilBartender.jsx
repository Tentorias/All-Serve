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
} from '@chakra-ui/react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import IconeEstrela from '../../componentes/comuns/IconeEstrela.jsx';
import { useAuth } from '../../contexto/ContextoAutenticacao.jsx';

export default function PerfilBartender() {
  const { bartenderId } = useParams();
  const { currentUser } = useAuth();
  const [bartender, setBartender] = useState(null);
  const [avaliacoes, setAvaliations] = useState([]);
  const [media, setMedia] = useState(0);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  const placeholderImage = 'https://via.placeholder.com/300x200?text=Bartender';

  return (
    <Box p={8} maxWidth="900px" margin="auto">
      {bartender ? (
        <VStack spacing={8} align="stretch">
          {/* Cabeçalho do Perfil */}
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align="center"
            gap={6}
            p={6}
            borderWidth={1}
            borderRadius="lg"
            boxShadow="md"
            bg="white"
          >
            <Image
              src={bartender.fotoURL || placeholderImage}
              alt={`Foto de ${bartender.nome || bartender.email}`}
              boxSize="150px"
              objectFit="cover"
              borderRadius="full"
              border="3px solid"
              borderColor="teal.500"
            />
            <VStack align={{ base: 'center', md: 'flex-start' }} spacing={2} flex={1}>
              <Heading size="lg">{bartender.nome || bartender.email}</Heading>
              {bartender.especialidade && (
                <Badge colorScheme="teal" fontSize="0.9em" px={2} py={1}>
                  {bartender.especialidade}
                </Badge>
              )}
              {bartender.precoPorHora !== undefined && (
                <Text fontWeight="bold" fontSize="lg" color="teal.600">
                  R$ {bartender.precoPorHora}/hora
                </Text>
              )}
              <HStack spacing={1}>
                <Text fontSize="xl" fontWeight="bold">{media.toFixed(1)}</Text>
                <Icon as={IconeEstrela} color="gold" boxSize={6} />
                <Text color="gray.500">({avaliacoes.length} avaliações)</Text>
              </HStack>
            </VStack>

            {/* Ações: Botão Editar para o Próprio Bartender ou Botão Avaliar para Clientes */}
            <VStack>
              {currentUser && currentUser.uid === bartenderId ? (
                <Button
                  as={RouterLink}
                  to="/bartender/editar"
                  colorScheme="teal"
                  size="md"
                >
                  ✏️ Editar Perfil
                </Button>
              ) : (
                <Button
                  as={RouterLink}
                  to={`/avaliar/${bartenderId}`}
                  colorScheme="teal"
                  size="md"
                >
                  ⭐ Avaliar Bartender
                </Button>
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
        </VStack>
      ) : (
        <Text>Bartender não encontrado.</Text>
      )}
    </Box>
  );
}
