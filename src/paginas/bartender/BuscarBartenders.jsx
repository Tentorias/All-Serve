// src/paginas/bartender/BuscarBartenders.jsx

import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import CartaoBartender from '../../componentes/bartender/CartaoBartender.jsx';

const TAMANHO_PAGINA = 8;

export default function BuscarBartenders() {
  const [todosBartenders, setTodosBartenders] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [loading, setLoading] = useState(true);

  // Estados de debug/informativo para o usuário
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [banidosCount, setBanidosCount] = useState(0);
  const [erroPermissao, setErroPermissao] = useState(false);

  // Estados para os filtros
  const [filtroEspecialidade, setFiltroEspecialidade] = useState('');
  const [ordenacao, setOrdenacao] = useState('relevancia');

  // Função auxiliar para enriquecer bartenders com notas médias
  const processarAvaliacoes = async (listaBartenders) => {
    const listaEnriquecida = await Promise.all(
      listaBartenders.map(async (bartender) => {
        try {
          const avaliacoesRef = collection(
            db,
            'users',
            bartender.id,
            'avaliacoes'
          );
          const avaliacoesSnap = await getDocs(avaliacoesRef);
          const avaliacoes = avaliacoesSnap.docs.map((doc) => doc.data());

          let mediaAvaliacao = 0;
          let totalAvaliacoes = 0;

          if (avaliacoes.length > 0) {
            const totalNotas = avaliacoes.reduce(
              (acc, curr) => acc + (Number(curr.nota) || 5),
              0
            );
            mediaAvaliacao = totalNotas / avaliacoes.length;
            totalAvaliacoes = avaliacoes.length;
          }

          return {
            ...bartender,
            mediaAvaliacao,
            totalAvaliacoes,
          };
        } catch (error) {
          console.error(`Erro ao buscar avaliações para ${bartender.id}:`, error);
          return {
            ...bartender,
            mediaAvaliacao: 0,
            totalAvaliacoes: 0,
          };
        }
      })
    );
    return listaEnriquecida;
  };

  // Função para ordenar a lista
  const aplicarOrdenacao = (lista, criterio) => {
    const listaOrdenada = [...lista];
    if (criterio === 'preco_asc') {
      listaOrdenada.sort(
        (a, b) => (a.precoPorHora || 0) - (b.precoPorHora || 0)
      );
    } else if (criterio === 'preco_desc') {
      listaOrdenada.sort(
        (a, b) => (b.precoPorHora || 0) - (a.precoPorHora || 0)
      );
    } else if (criterio === 'avaliacao_desc') {
      listaOrdenada.sort(
        (a, b) => (b.mediaAvaliacao || 0) - (a.mediaAvaliacao || 0)
      );
    }
    return listaOrdenada;
  };

  // Carrega todos os bartenders do Firestore com filtro flexível e super inclusivo
  const fetchBartenders = useCallback(async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      setErroPermissao(false);
      setTotalUsersCount(querySnapshot.docs.length);

      let countBanidos = 0;
      let bartendersList = querySnapshot.docs
        .map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
        .filter((b) => {
          if (b.status === 'banido') {
            countBanidos++;
            return false;
          }
          const roleStr = (b.role || '').toLowerCase().trim();
          // Aceita como Bartender: se o papel for bartender/profissional, ou se tiver especialidade/preço/foto, ou se NÃO for cliente nem admin
          const eBartender =
            roleStr === 'bartender' ||
            roleStr === 'bartenders' ||
            roleStr === 'profissional' ||
            b.especialidade !== undefined ||
            b.precoPorHora !== undefined ||
            b.fotoURL !== undefined ||
            (roleStr !== 'cliente' && roleStr !== 'administrador');
          return eBartender;
        });

      setBanidosCount(countBanidos);

      try {
        bartendersList = await processarAvaliacoes(bartendersList);
      } catch (err) {
        console.error('Erro no processamento de avaliações:', err);
      }

      setTodosBartenders(bartendersList);
      setPaginaAtual(1);
    } catch (error) {
      console.error('Erro ao buscar bartenders:', error);
      if (
        error.code === 'permission-denied' ||
        error.message?.includes('permission') ||
        error.message?.includes('permissions') ||
        error.message?.includes('Missing or insufficient permissions')
      ) {
        setErroPermissao(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBartenders();
  }, [fetchBartenders]);

  // Lista filtrada e ordenada em memória
  const bartendersFiltrados = useMemo(() => {
    let lista = [...todosBartenders];
    if (filtroEspecialidade) {
      lista = lista.filter((b) =>
        b.especialidade
          ?.toLowerCase()
          .includes(filtroEspecialidade.toLowerCase())
      );
    }
    return aplicarOrdenacao(lista, ordenacao);
  }, [todosBartenders, filtroEspecialidade, ordenacao]);

  const bartendersExibidos = useMemo(() => {
    return bartendersFiltrados.slice(0, paginaAtual * TAMANHO_PAGINA);
  }, [bartendersFiltrados, paginaAtual]);

  const temMais = bartendersExibidos.length < bartendersFiltrados.length;

  const handleCarregarMais = () => {
    setPaginaAtual((prev) => prev + 1);
  };

  return (
    <Box p={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="xl" color="white">
            Profissionais de Coquetelaria & Parcerias
          </Heading>
          <Text mt={2} color="gray.400" maxW="2xl" mx="auto">
            Explore nossa rede de bartenders para eventos, casamentos e colaborações
            profissionais. Filtre por especialidade e ordene como preferir.
          </Text>
        </Box>

        {erroPermissao && (
          <Box
            p={6}
            bg="rgba(229, 62, 62, 0.15)"
            border="1px solid"
            borderColor="red.400"
            borderRadius="xl"
            textAlign="center"
          >
            <Text color="red.300" fontWeight="bold" fontSize="lg">
              ⚠️ Permissão Negada pelo Firebase Firestore
            </Text>
            <Text color="gray.300" fontSize="sm" mt={2} maxW="3xl" mx="auto">
              As regras de segurança no console do Firebase estão bloqueando a
              leitura pública da coleção <b>users</b>. No console do Firebase
              (Firestore &gt; Regras), adicione a permissão de leitura:
            </Text>
            <Box
              bg="blackAlpha.600"
              p={3}
              mt={3}
              borderRadius="md"
              fontFamily="monospace"
              fontSize="sm"
              color="teal.200"
              display="inline-block"
            >
              match /users/&#123;userId&#125; &#123; allow read, write: if true; &#125;
            </Box>
          </Box>
        )}

        {/* Barra de Filtros */}
        <HStack spacing={4} justify="center" flexWrap="wrap">
          <Input
            placeholder="Filtrar por especialidade..."
            value={filtroEspecialidade}
            onChange={(e) => {
              setFiltroEspecialidade(e.target.value);
              setPaginaAtual(1);
            }}
            maxWidth="400px"
            bg="#161c28"
            borderColor="#263147"
          />
          <Select
            value={ordenacao}
            onChange={(e) => {
              setOrdenacao(e.target.value);
              setPaginaAtual(1);
            }}
            maxWidth="250px"
            bg="#161c28"
            borderColor="#263147"
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
            <Spinner size="xl" color="teal.300" />
          </Center>
        ) : (
          <>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
              {bartendersExibidos.length > 0 ? (
                bartendersExibidos.map((bartender) => (
                  <CartaoBartender key={bartender.id} bartender={bartender} />
                ))
              ) : (
                <Box
                  gridColumn="1 / -1"
                  textAlign="center"
                  py={12}
                  px={6}
                  bg="#161c28"
                  borderRadius="xl"
                  border="1px dashed"
                  borderColor="#263147"
                >
                  <Text fontSize="lg" color="gray.300" fontWeight="bold">
                    Nenhum bartender disponível com esses critérios 🍸
                  </Text>
                  <Text fontSize="sm" color="gray.400" mt={2}>
                    No momento, o banco de dados possui{' '}
                    <Text as="span" fontWeight="bold" color="teal.300">
                      {totalUsersCount} usuário(s)
                    </Text>{' '}
                    cadastrado(s)
                    {banidosCount > 0 && ` (${banidosCount} com status banido)`}.
                  </Text>
                  {totalUsersCount === 0 && (
                    <Text
                      fontSize="sm"
                      color="yellow.300"
                      mt={3}
                      fontWeight="bold"
                    >
                      ⚡ Seu banco de dados está vazio! Para ver os profissionais
                      aqui, clique em &quot;Entrar / Cadastrar&quot; no topo da
                      página e crie uma conta com o papel &quot;Bartender&quot;.
                    </Text>
                  )}
                  {totalUsersCount > 0 && (
                    <Text fontSize="xs" color="gray.500" mt={3}>
                      💡 Se você criou uma conta de Bartender mas ela não aparece,
                      certifique-se de que não selecionou &quot;Cliente&quot; no
                      cadastro ou limpe o filtro de especialidade.
                    </Text>
                  )}
                </Box>
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
                >
                  Carregar Mais Bartenders (
                  {bartendersFiltrados.length - bartendersExibidos.length} restantes)
                </Button>
              </Center>
            )}
          </>
        )}
      </VStack>
    </Box>
  );
}
