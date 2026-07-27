// src/paginas/bartender/PerfilBartender.jsx 

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
} from '@chakra-ui/react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import IconeEstrela from '../../componentes/comuns/IconeEstrela.jsx';

export default function PerfilBartender() {
  const { bartenderId } = useParams();
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
      } catch (error) { console.error('Erro ao buscar dados:', error); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, [bartenderId]);

  if (loading) { return <Center h="50vh"><Spinner size="xl" /></Center>; }

  return (
    <Box p={8}>
      {bartender ? (
        <VStack spacing={6} align="flex-start">
          <Heading>{bartender.email}</Heading>
          <HStack>
            <Text fontSize="2xl" fontWeight="bold">{media.toFixed(1)}</Text>
            <Icon as={IconeEstrela} color="gold" boxSize={6} />
            <Text>({avaliacoes.length} avaliações)</Text>
          </HStack>
          <Divider />
          <Heading size="lg" mt={4}>Comentários</Heading>
          {avaliacoes.length > 0 ? (
            avaliacoes.map((avaliacao) => (
              <Box key={avaliacao.id} p={4} borderWidth={1} borderRadius={8} width="full">
                <HStack>
                  {[...Array(5)].map((_, i) => (
                    <Icon
                      key={i}
                      as={IconeEstrela}
                      color={i < avaliacao.nota ? 'gold' : 'gray.300'}
                    />
                  ))}
                </HStack>
                <Text mt={2}><strong>{avaliacao.clienteEmail}</strong></Text>
                <Text mt={1}>"{avaliacao.comentario}"</Text>
              </Box>
            ))
          ) : ( <Text>Este bartender ainda não recebeu avaliações.</Text> )}
        </VStack>
      ) : ( <Text>Bartender não encontrado.</Text> )}
    </Box>
  );
}
