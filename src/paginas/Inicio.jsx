// src/paginas/Inicio.jsx

import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Container,
  Badge,
  Icon,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import IconeEstrela from '../componentes/comuns/IconeEstrela.jsx';

export default function Inicio() {
  return (
    <Box>
      {/* Seção Principal (Hero) */}
      <Container maxW="container.lg" pt={{ base: 16, md: 24 }} pb={16} textAlign="center">
        <VStack spacing={6} align="center">
          <Badge
            colorScheme="teal"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="xs"
            letterSpacing="wider"
            textTransform="uppercase"
          >
            🍹 Coquetelaria Para Eventos Exclusivos
          </Badge>

          <Heading
            as="h1"
            size="2xl"
            fontWeight="800"
            lineHeight="1.2"
            maxW="750px"
            color="white"
          >
            Bartenders Profissionais Para o Seu Próximo Evento
          </Heading>

          <Text
            fontSize={{ base: 'md', md: 'lg' }}
            color="gray.400"
            maxW="600px"
            lineHeight="1.7"
          >
            Solicite orçamentos, confira avaliações reais e agende os melhores
            especialistas em coquetelaria da sua região com total tranquilidade.
          </Text>

          <HStack spacing={4} pt={4} justify="center" flexWrap="wrap">
            <Button
              as={RouterLink}
              to="/buscar"
              size="lg"
              colorScheme="teal"
              px={8}
              shadow="lg"
              _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
            >
              🔍 Explorar Bartenders
            </Button>
            <Button
              as={RouterLink}
              to="/cadastro"
              size="lg"
              variant="outline"
              colorScheme="teal"
              px={8}
              _hover={{ bg: 'rgba(45, 212, 191, 0.08)' }}
            >
              🍸 Sou Bartender
            </Button>
          </HStack>
        </VStack>
      </Container>

      {/* Seção de Diferenciais (Tranquilo e Dark) */}
      <Container maxW="container.xl" py={12}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          <Box
            p={6}
            bg="#161c28"
            borderWidth="1px"
            borderColor="#263147"
            borderRadius="xl"
            shadow="md"
            _hover={{ borderColor: 'teal.500', transform: 'translateY(-2px)' }}
            transition="all 0.2s"
          >
            <HStack spacing={2} mb={3}>
              <Icon as={IconeEstrela} color="gold" boxSize={5} />
              <Heading size="md" color="white">
                Avaliações Verificadas
              </Heading>
            </HStack>
            <Text color="gray.400" fontSize="sm">
              Escolha com confiança conferindo notas e comentários reais deixados por
              clientes que já contrataram cada profissional.
            </Text>
          </Box>

          <Box
            p={6}
            bg="#161c28"
            borderWidth="1px"
            borderColor="#263147"
            borderRadius="xl"
            shadow="md"
            _hover={{ borderColor: 'teal.500', transform: 'translateY(-2px)' }}
            transition="all 0.2s"
          >
            <Heading size="md" color="white" mb={3}>
              📅 Orçamento Prático
            </Heading>
            <Text color="gray.400" fontSize="sm">
              Solicite cotações e agende a data do seu evento rapidamente e sem burocracia
              diretamente pelo perfil público do bartender.
            </Text>
          </Box>

          <Box
            p={6}
            bg="#161c28"
            borderWidth="1px"
            borderColor="#263147"
            borderRadius="xl"
            shadow="md"
            _hover={{ borderColor: 'teal.500', transform: 'translateY(-2px)' }}
            transition="all 0.2s"
          >
            <Heading size="md" color="white" mb={3}>
              🍸 Especialistas Diversos
            </Heading>
            <Text color="gray.400" fontSize="sm">
              Encontre o estilo ideal para a sua celebração: coquetelaria clássica,
              mixologia molecular ou drinks sem álcool.
            </Text>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
