// src/paginas/bartender/EditarPerfil.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
  useToast,
  Image,
  Text,
  HStack,
  Divider,
  InputGroup,
  InputLeftAddon,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import { useAuth } from '../../contexto/ContextoAutenticacao.jsx';

// Função auxiliar para redimensionar a imagem e convertê-la para Base64 de tamanho reduzido (~15 KB)
const comprimirImagemBase64 = (file, maxWidth = 300, maxHeight = 300, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function EditarPerfil() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Estados dos campos
  const [nome, setNome] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [precoPorHora, setPrecoPorHora] = useState('');
  const [fotoURL, setFotoURL] = useState('');

  useEffect(() => {
    const fetchDados = async () => {
      if (!currentUser) return;
      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const dados = docSnap.data();
          setNome(dados.nome || dados.email || '');
          setEspecialidade(dados.especialidade || '');
          setPrecoPorHora(dados.precoPorHora || '');
          setFotoURL(dados.fotoURL || '');
        }
      } catch (error) {
        console.error('Erro ao carregar dados do bartender:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do seu perfil.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
  }, [currentUser, toast]);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Formato inválido',
        description: 'Por favor, selecione um arquivo de imagem (JPG, PNG, WEBP).',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    try {
      const imagemComprimida = await comprimirImagemBase64(file);
      setFotoURL(imagemComprimida);
      toast({
        title: 'Imagem carregada e otimizada!',
        description: 'A foto foi redimensionada e está pronta para ser salva no Firestore gratuitamente.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      toast({
        title: 'Erro no processamento',
        description: 'Não foi possível processar a imagem selecionada.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!currentUser) return;

    setSalvando(true);
    try {
      const docRef = doc(db, 'users', currentUser.uid);
      await updateDoc(docRef, {
        nome,
        especialidade,
        precoPorHora: Number(precoPorHora) || 0,
        fotoURL,
      });

      toast({
        title: 'Perfil atualizado!',
        description: 'Suas informações foram salvas com sucesso.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      navigate(`/bartender/${currentUser.uid}`);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  const placeholderImage = 'https://via.placeholder.com/300x200?text=Bartender';

  return (
    <Box
      p={8}
      maxWidth="650px"
      borderWidth={1}
      borderColor="#263147"
      bg="#161c28"
      borderRadius={12}
      boxShadow="lg"
      margin="auto"
      mt={8}
    >
      <VStack spacing={6} align="stretch">
        <Heading size="lg" color="white">Editar Meu Perfil de Bartender</Heading>
        <Text color="gray.400">
          Atualize seus dados profissionais, preço por hora e foto do perfil.
        </Text>
        <Divider borderColor="#263147" />

        <form onSubmit={handleSubmit}>
          <VStack spacing={5} align="stretch">
            {/* Pré-visualização da foto */}
            <HStack spacing={6} align="center">
              <Image
                src={fotoURL || placeholderImage}
                alt="Foto do perfil"
                boxSize="100px"
                objectFit="cover"
                borderRadius="full"
                border="2px solid"
                borderColor="teal.500"
              />
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold">Foto de Perfil</Text>
                <Text fontSize="sm" color="gray.500">
                  Envie uma imagem do seu dispositivo (será convertida em Base64 compacta e salva sem custo no Firestore) ou use uma URL externa.
                </Text>
              </VStack>
            </HStack>

            {/* Abas para Upload ou URL */}
            <Tabs variant="enclosed" colorScheme="teal" size="sm">
              <TabList>
                <Tab>Carregar do Dispositivo (Grátis)</Tab>
                <Tab>Colar URL Externa</Tab>
              </TabList>
              <TabPanels>
                <TabPanel px={0}>
                  <FormControl>
                    <FormLabel>Escolher foto no computador/celular</FormLabel>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      pt={1}
                    />
                  </FormControl>
                </TabPanel>
                <TabPanel px={0}>
                  <FormControl>
                    <FormLabel>URL da imagem</FormLabel>
                    <Input
                      type="text"
                      placeholder="https://exemplo.com/minha-foto.jpg"
                      value={fotoURL}
                      onChange={(e) => setFotoURL(e.target.value)}
                    />
                  </FormControl>
                </TabPanel>
              </TabPanels>
            </Tabs>

            <FormControl isRequired>
              <FormLabel>Nome de Exibição / Artístico</FormLabel>
              <Input
                type="text"
                placeholder="Como seus clientes verão seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Especialidade Principal</FormLabel>
              <Input
                type="text"
                placeholder="Ex: Drinks Clássicos, Mixologia Molecular, Coquetéis Sem Álcool"
                value={especialidade}
                onChange={(e) => setEspecialidade(e.target.value)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Preço por Hora</FormLabel>
              <InputGroup>
                <InputLeftAddon>R$</InputLeftAddon>
                <Input
                  type="number"
                  placeholder="50"
                  value={precoPorHora}
                  onChange={(e) => setPrecoPorHora(e.target.value)}
                />
              </InputGroup>
            </FormControl>

            <HStack spacing={4} pt={4}>
              <Button
                type="submit"
                colorScheme="teal"
                width="full"
                isLoading={salvando}
                loadingText="Salvando..."
              >
                Salvar Alterações
              </Button>
              <Button
                variant="outline"
                width="full"
                onClick={() => navigate('/painel')}
              >
                Cancelar
              </Button>
            </HStack>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
}
