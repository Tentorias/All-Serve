// src/paginas/autenticacao/RecuperarSenha.jsx

import { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Heading, Input, VStack, useToast, Text } from '@chakra-ui/react';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../../firebase/config.js';

export default function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const toast = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "E-mail enviado.",
        description: "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Erro ao enviar e-mail de recuperação:", error);
      toast({
        title: "Erro.",
        description: "Ocorreu um problema ao tentar enviar o e-mail.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={8} maxWidth="500px" borderWidth={1} borderRadius={8} boxShadow="lg" margin="auto" mt={10}>
      <VStack spacing={4}>
        <Heading>Recuperar Senha</Heading>
        <Text textAlign="center">Digite seu e-mail e enviaremos um link para você voltar a acessar sua conta.</Text>
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
            <Button type="submit" colorScheme="teal" width="full">
              Enviar e-mail de recuperação
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
}
