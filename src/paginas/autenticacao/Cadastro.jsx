// src/paginas/autenticacao/Cadastro.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  VStack,
  useToast,
  InputGroup,
  InputLeftAddon,
} from '@chakra-ui/react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from '../../firebase/config.js';

export default function Cadastro() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('cliente');
  
  // Novos estados para os campos do bartender
  const [especialidade, setEspecialidade] = useState('');
  const [precoPorHora, setPrecoPorHora] = useState('');
  const [fotoURL, setFotoURL] = useState('');

  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Monta o objeto do usuário com base no papel
      let userData = {
        uid: user.uid,
        email: user.email,
        role: role,
      };

      if (role === 'bartender') {
        userData = {
          ...userData,
          especialidade,
          precoPorHora: Number(precoPorHora), 
          fotoURL,
          nome: email, 
        };
      }

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, userData);

      toast({
        title: "Conta criada.",
        description: "Cadastro realizado com sucesso!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      navigate('/login');

    } catch (error) {
      console.error("Erro no cadastro:", error);
      toast({
        title: "Erro no cadastro.",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      p={8}
      maxWidth="500px"
      borderWidth={1}
      borderColor="#263147"
      bg="#161c28"
      borderRadius="xl"
      boxShadow="2xl"
      margin="auto"
      mt={10}
    >
      <VStack spacing={6}>
        <Heading size="lg" color="white">Criar Nova Conta</Heading>
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
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Eu sou</FormLabel>
              <Select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="cliente">Cliente</option>
                <option value="bartender">Bartender</option>
                <option value="administrador">Administrador</option>
              </Select>
            </FormControl>

            {/* Campos que aparecem apenas para bartenders */}
            {role === 'bartender' && (
              <>
                <FormControl isRequired>
                  <FormLabel>Especialidade Principal</FormLabel>
                  <Input
                    type="text"
                    placeholder="Ex: Drinks Clássicos, Mixologia Molecular"
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
                <FormControl>
                  <FormLabel>URL da Foto de Perfil</FormLabel>
                  <Input
                    type="text"
                    placeholder="https://exemplo.com/sua-foto.jpg"
                    value={fotoURL}
                    onChange={(e) => setFotoURL(e.target.value)}
                  />
                </FormControl>
              </>
            )}

            <Button type="submit" colorScheme="teal" width="full">
              Cadastrar
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
}
