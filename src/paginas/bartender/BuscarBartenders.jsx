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
  Button,
} from '@chakra-ui/react';
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  startAfter,
} from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import CartaoBartender from '../../componentes/bartender/CartaoBartender.jsx';

const TAMANHO_PAGINA = 8;

export default function BuscarBartenders() {
  const [bartenders, setBartenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [ultimoDoc, setUltimoDoc] = useState(null);
  const [temMais, setTemMais] = useState(false);

  // Estados para os filtros
  const [filtroEspecialidade, setFiltroEspecialidade] = useState('');
  const [ordenacao, setOrdenacao] = useState('relevancia');

  // Função auxiliar para enriquecer bartenders com notas médias
  const processarAvaliacoes = async (listaBartenders) => {
    for (let bartender of listaBartenders) {
      try {
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
      } catch (error) {
        console.error(`Erro ao buscar avaliações para ${bartender.id}:`, error);
        bartender.mediaAvaliacao = 0;
        bartender.totalAvaliacoes = 0;
      }
    }
    return listaBartenders;
  };

  // Função para ordenar a lista
  const aplicarOrdenacao = (lista, critério) => {
    const listaOrdenada = [...lista];
    if (critério === 'preco_asc') {
      listaOrdenada.sort((a, b) => (a.precoPorHora || 0) - (b.precoPorHora || 0));
    } else if (critério === 'preco_desc') {
      listaOrdenada.sort((a, b) => (b.precoPorHora || 0) - (a.precoPorHora || 0));
    } else if (critério === 'avaliacao_desc') {
      listaOrdenada.sort((a, b) => (b.mediaAvaliacao || 0) - (a.mediaAvaliacao || 0));
    }
    return listaOrdenada;
  };

  // Função para buscar o primeiro lote dos bartenders (com paginação)
  const fetchBartenders = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'bartender'),
        limit(TAMANHO_PAGINA)
      );
      const querySnapshot = await getDocs(q);
      let bartendersList = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      // Armazena o último doc para paginação
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
      setUltimoDoc(lastVisible);
      setTemMais(querySnapshot.docs.length >= TAMANHO_PAGINA);

      // Processa avaliações
      bartendersList = await processarAvaliacoes(bartendersList);

      // Filtro em memória pelo termo digitado
      if (filtroEspecialidade) {
        bartendersList = bartendersList.filter(b =>
          b.especialidade?.toLowerCase().includes(filtroEspecialidade.toLowerCase())
        );
      }

      setBartenders(aplicarOrdenacao(bartendersList, ordenacao));
    } catch (error) {
      console.error("Erro ao buscar bartenders:", error);
    } finally {
      setLoading(false);
    }
  }, [filtroEspecialidade, ordenacao]);

  useEffect(() => {
    fetchBartenders();
  }, [fetchBartenders]);

  // Função para carregar mais itens (paginação no Firestore)
  const handleCarregarMais = async () => {
    if (!ultimoDoc || carregandoMais) return;
    setCarregandoMais(true);
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'bartender'),
        startAfter(ultimoDoc),
        limit(TAMANHO_PAGINA)
      );
      const querySnapshot = await getDocs(q);
      let novosBartenders = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
      setUltimoDoc(lastVisible);
      setTemMais(querySnapshot.docs.length >= TAMANHO_PAGINA);

      novosBartenders = await processarAvaliacoes(novosBartenders);

      let combinados = [...bartenders, ...novosBartenders];
      if (filtroEspecialidade) {
        combinados = combinados.filter(b =>
          b.especialidade?.toLowerCase().includes(filtroEspecialidade.toLowerCase())
        );
      }

      setBartenders(aplicarOrdenacao(combinados, ordenacao));
    } catch (error) {
      console.error("Erro ao carregar mais bartenders:", error);
    } finally {
      setCarregandoMais(false);
    }
  };

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
          <>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
              {bartenders.length > 0 ? (
                bartenders.map((bartender) => (
                  <CartaoBartender key={bartender.id} bartender={bartender} />
                ))
              ) : (
                <Text>Nenhum bartender encontrado com esses critérios.</Text>
              )}
            </SimpleGrid>

            {/* Botão de Paginação "Carregar Mais" */}
            {temMais && (
              <Center mt={8}>
                <Button
                  colorScheme="teal"
                  variant="outline"
                  size="lg"
                  onClick={handleCarregarMais}
                  isLoading={carregandoMais}
                  loadingText="Carregando..."
                >
                  Carregar Mais Bartenders
                </Button>
              </Center>
            )}
          </>
        )}
      </VStack>
    </Box>
  );
}
