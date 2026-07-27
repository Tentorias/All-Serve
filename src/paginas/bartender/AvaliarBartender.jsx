// src/paginas/bartender/AvaliarBartender.jsx

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Textarea,
  VStack,
  useToast,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import { useAuth } from '../../contexto/ContextoAutenticacao.jsx';
import IconeEstrela from '../../componentes/comuns/IconeEstrela.jsx';

export default function AvaliarBartender() {
  const { bartenderId } = useParams();
  const { currentUser } = useAuth();
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast({
        title: "Autenticação necessária",
        description: "Você precisa estar logado para avaliar.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (nota === 0) {
      toast({
        title: "Nota obrigatória",
        description: "Selecione ao menos 1 estrela.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      const avaliacaoRef = doc(collection(db, 'users', bartenderId, 'avaliacoes'));
      await setDoc(avaliacaoRef, {
        clienteId: currentUser.uid,
        clienteEmail: currentUser.email,
        nota,
        comentario,
        criadoEm: serverTimestamp(),
        visivel: true,
      });
      toast({
        title: 'Avaliação enviada!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/painel');
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar sua avaliação.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={8} maxWidth="600px" margin="auto" mt={10}>
      <VStack spacing={6}>
        <Heading>Avaliar Bartender</Heading>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Nota</FormLabel>
              <HStack spacing={1}>
                {[...Array(5)].map((_, index) => {
                  const ratingValue = index + 1;
                  return (
                    <Icon
                      key={ratingValue}
                      as={IconeEstrela}
                      boxSize={8}
                      color={ratingValue <= nota ? 'gold' : 'gray.300'}
                      cursor="pointer"
                      onClick={() => setNota(ratingValue)}
                    />
                  );
                })}
              </HStack>
            </FormControl>
            <FormControl>
              <FormLabel>Comentário (opcional)</FormLabel>
              <Textarea
                placeholder="Deixe seu feedback sobre o serviço..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              />
            </FormControl>
            <Button type="submit" colorScheme="teal" width="full">
              Enviar Avaliação
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
}
