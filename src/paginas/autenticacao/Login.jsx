// src/paginas/autenticacao/Login.jsx

import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, Heading, Input, VStack, useToast, Link, Flex } from '@chakra-ui/react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase/config.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login bem-sucedido.",
        description: `Bem-vindo de volta!`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      navigate('/painel');
    } catch (error) {
      console.error("Erro no login:", error.code, error.message);
      toast({
        title: "Erro no login.",
        description: "Email ou senha inválidos.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={8} maxWidth="500px" borderWidth={1} borderRadius={8} boxShadow="lg" margin="auto" mt={10}>
      <VStack spacing={4}>
        <Heading>Entrar</Heading>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input 
                type="email" 
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Senha</FormLabel>
              <Input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
              />
            </FormControl>
            
            <Button type="submit" colorScheme="teal" width="full">
              Entrar
            </Button>

            <Flex width="full" justify="flex-end">
              <Link as={RouterLink} to="/recuperar-senha" fontSize="sm" color="teal.500">
                Esqueci minha senha
              </Link>
            </Flex>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
}
