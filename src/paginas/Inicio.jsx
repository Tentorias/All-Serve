// src/paginas/Inicio.jsx

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Button,
  Container,
  Flex,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexto/ContextoAutenticacao.jsx';

export default function Inicio() {
  const { currentUser } = useAuth();

  return (
    <Box py={12} px={4}>
      <Container maxW="1150px">
        {/* Hero Section Glacial Aero */}
        <VStack spacing={8} textAlign="center" py={10}>
          {/* Tag estilo gota d'água */}
          <Box className="glacial-badge" px={4} py={1.5} fontSize="sm">
            ✨ A Revolução Glacial na Coquetelaria de Eventos
          </Box>

          <Heading
            as="h1"
            fontSize={{ base: '3xl', md: '5xl', lg: '6xl' }}
            fontWeight="900"
            lineHeight="1.1"
            maxW="850px"
            color="teal.900"
          >
            Bartenders Exclusivos.{' '}
            <Text as="span" className="glacial-text-gradient">
              Experiências Refrescantes.
            </Text>
          </Heading>

          <Text
            fontSize={{ base: 'lg', md: 'xl' }}
            color="gray.700"
            maxW="700px"
            fontWeight="500"
            lineHeight="1.7"
          >
            Conectamos anfitriões exigentes aos melhores profissionais de coquetelaria do mercado. 
            Orçamentos transparentes, notas reais e agendamentos instantâneos com a pureza e o brilho do design Frutiger Aero.
          </Text>

          {/* Botões de Ação */}
          <Flex
            gap={4}
            direction={{ base: 'column', sm: 'row' }}
            pt={4}
            justify="center"
            width={{ base: '100%', sm: 'auto' }}
          >
            <Button
              as={RouterLink}
              to="/buscar"
              size="lg"
              className="glacial-btn"
              px={8}
              py={7}
              fontSize="lg"
            >
              🔍 Encontrar Bartenders
            </Button>
            {!currentUser && (
              <Button
                as={RouterLink}
                to="/cadastro"
                size="lg"
                variant="outline"
                colorScheme="teal"
                px={8}
                py={7}
                fontSize="lg"
                bg="rgba(255, 255, 255, 0.65)"
                border="2px solid"
                borderColor="teal.400"
                _hover={{
                  bg: 'rgba(255, 255, 255, 0.95)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0, 180, 216, 0.25)',
                }}
              >
                🍸 Sou Bartender
              </Button>
            )}
          </Flex>
        </VStack>

        {/* Destaques em Cartões de Vidro Acrílico (Glassmorphism) */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} mt={14} mb={10}>
          <Box className="glacial-card" p={8} textAlign="left">
            <Text fontSize="4xl" mb={3}>🧊</Text>
            <Heading size="md" mb={2} color="teal.900">
              Cristal & Gelo
            </Heading>
            <Text color="gray.700" fontSize="sm">
              Profissionais especializados em coquetelaria molecular, drinks clássicos 
              e apresentações impecáveis em taças e copos de cristal.
            </Text>
          </Box>

          <Box className="glacial-card" p={8} textAlign="left">
            <Text fontSize="4xl" mb={3}>💎</Text>
            <Heading size="md" mb={2} color="teal.900">
              Orçamentos sem Burocracia
            </Heading>
            <Text color="gray.700" fontSize="sm">
              Calcule estimativas por hora de forma automática em tempo real e envie 
              solicitações de reserva direto pelo perfil público de cada bartender.
            </Text>
          </Box>

          <Box className="glacial-card" p={8} textAlign="left">
            <Text fontSize="4xl" mb={3}>🌐</Text>
            <Heading size="md" mb={2} color="teal.900">
              Transparência & RBAC
            </Heading>
            <Text color="gray.700" fontSize="sm">
              Avaliações autênticas em estrelas, comentários moderados e controle 
              de acesso seguro em nuvem alimentado pelo Firebase.
            </Text>
          </Box>
        </SimpleGrid>

        {/* Banner Inferior Acrílico */}
        <Box
          className="glacial-card"
          p={{ base: 8, md: 12 }}
          mt={12}
          textAlign="center"
          position="relative"
          overflow="hidden"
        >
          <VStack spacing={4}>
            <Heading size="lg" color="teal.900">
              Pronto para transformar sua celebração?
            </Heading>
            <Text color="gray.700" maxW="550px">
              Explore nossa seleção de profissionais ou cadastre seus serviços na comunidade mais brilhante da coquetelaria.
            </Text>
            <Button
              as={RouterLink}
              to="/buscar"
              className="glacial-btn"
              size="md"
              px={8}
              mt={2}
            >
              Explorar Catálogo Agora ✨
            </Button>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
