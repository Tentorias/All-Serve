// src/paginas/bartender/BuscarBartenders.jsx

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Input,
  Select,
  SimpleGrid,
  Spinner,
  Center,
  Text,
} from '@chakra-ui/react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import CartaoBartender from '../../componentes/bartender/CartaoBartender.jsx';

export default function BuscarBartenders() {
  const [bartenders, setBartenders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para os filtros
  const [filtroEspecialidade, setFiltroEspecialidade] = useState('');
  const [ordenacao, setOrdenacao] = useState('relevancia');

  // Função para buscar e processar os dados dos bartenders
  const fetchBartenders = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Busca todos os usuários que são bartenders
      const q = query(collection(db, 'users'), where('role', '==', 'bartender'));
      const querySnapshot = await getDocs(q);
      let bartendersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // 2. Para cada bartender, busca suas avaliações para calcular a média
      for (let bartender of bartendersList) {
        const avaliacoesRef = collection(db, 'users', bartender.id, 'avaliacoes');
        const avaliacoesSnap = await getDocs(avaliacoesRef);
        const avaliacoes = avaliacoesSnap.docs.map(doc => doc.data());
        
        if (avaliacoes.length > 0) {
          const totalNotas = avaliacoes.reduce((acc, curr) => acc + curr.nota, 0);
          bartender.mediaAvaliacao = totalNotas / avaliacoes.length;
          bartender.totalAvaliacoes = avaliacoes.length;
        } else {
          bartender.mediaAvaliacao = 0;
          bartender.totalAvaliacoes = 0;
        }
      }

      // 3. Aplica o filtro de especialidade (se houver)
      if (filtroEspecialidade) {
        bartendersList = bartendersList.filter(b => 
          b.especialidade?.toLowerCase().includes(filtroEspecialidade.toLowerCase())
        );
      }

      // 4. Aplica a ordenação
      if (ordenacao === 'preco_asc') {
        bartendersList.sort((a, b) => (a.precoPorHora || 0) - (b.precoPorHora || 0));
      } else if (ordenacao === 'preco_desc') {
        bartendersList.sort((a, b) => (b.precoPorHora || 0) - (a.precoPorHora || 0));
      } else if (ordenacao === 'avaliacao_desc') {
        bartendersList.sort((a, b) => (b.mediaAvaliacao || 0) - (a.mediaAvaliacao || 0));
      }

      setBartenders(bartendersList);

    } catch (error) {
      console.error("Erro ao buscar bartenders:", error);
    } finally {
      setLoading(false);
    }
  }, [filtroEspecialidade, ordenacao]);

  useEffect(() => {
    fetchBartenders();
  }, [fetchBartenders]);

  return (
    <Box p={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="xl">Encontre o Bartender Perfeito</Heading>
          <Text mt={2}>Filtre por especialidade e ordene como preferir.</Text>
        </Box>
        
        {/* Barra de Filtros */}
        <HStack spacing={4} justify="center">
          <Input
            placeholder="Filtrar por especialidade..."
            value={filtroEspecialidade}
            onChange={(e) => setFiltroEspecialidade(e.target.value)}
            maxWidth="400px"
          />
          <Select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            maxWidth="250px"
          >
            <option value="relevancia">Relevância</option>
            <option value="preco_asc">Menor Preço</option>
            <option value="preco_desc">Maior Preço</option>
            <option value="avaliacao_desc">Melhor Avaliação</option>
          </Select>
        </HStack>
        
        {/* Grid de Resultados */}
        {loading ? (
          <Center h="300px">
            <Spinner size="xl" />
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
            {bartenders.length > 0 ? (
              bartenders.map(bartender => (
                <CartaoBartender key={bartender.id} bartender={bartender} />
              ))
            ) : (
              <Text>Nenhum bartender encontrado com esses critérios.</Text>
            )}
          </SimpleGrid>
        )}
      </VStack>
    </Box>
  );
}
