// src/contexto/ContextoCarrinho.jsx

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';

const CarrinhoContext = createContext();

export function ProvedorCarrinho({ children }) {
  const [itensCarrinho, setItensCarrinho] = useState(() => {
    try {
      const salvo = localStorage.getItem('allServe_carrinho');
      return salvo ? JSON.parse(salvo) : [];
    } catch {
      return [];
    }
  });

  const toast = useToast();

  useEffect(() => {
    try {
      localStorage.setItem('allServe_carrinho', JSON.stringify(itensCarrinho));
    } catch (e) {
      console.error('Erro ao salvar carrinho no localStorage:', e);
    }
  }, [itensCarrinho]);

  // Adicionar Item ao Carrinho
  const adicionarItem = useCallback(
    (item) => {
      setItensCarrinho((prev) => {
        const itemExistente = prev.find((i) => i.id === item.id);
        if (itemExistente) {
          return prev.map((i) =>
            i.id === item.id
              ? { ...i, quantidade: (i.quantidade || 1) + 1 }
              : i
          );
        }
        return [...prev, { ...item, quantidade: 1 }];
      });

      toast({
        title: 'Adicionado ao Carrinho! 🛒',
        description: `${item.nome} foi inserido no seu carrinho.`,
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
    },
    [toast]
  );

  // Remover Item do Carrinho
  const removerItem = useCallback(
    (id) => {
      setItensCarrinho((prev) => prev.filter((i) => i.id !== id));
      toast({
        title: 'Item removido',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    },
    [toast]
  );

  // Atualizar quantidade de um item (+ ou -)
  const atualizarQuantidade = useCallback((id, novaQuantidade) => {
    if (novaQuantidade <= 0) {
      setItensCarrinho((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setItensCarrinho((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantidade: novaQuantidade } : i
      )
    );
  }, []);

  // Limpar Carrinho
  const limparCarrinho = useCallback(() => {
    setItensCarrinho([]);
  }, []);

  // Totais
  const totalItens = itensCarrinho.reduce(
    (acc, item) => acc + (item.quantidade || 1),
    0
  );
  const valorTotal = itensCarrinho.reduce(
    (acc, item) => acc + (item.preco || 0) * (item.quantidade || 1),
    0
  );

  const value = {
    itensCarrinho,
    adicionarItem,
    removerItem,
    atualizarQuantidade,
    limparCarrinho,
    totalItens,
    valorTotal,
  };

  return (
    <CarrinhoContext.Provider value={value}>
      {children}
    </CarrinhoContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCarrinho() {
  return useContext(CarrinhoContext);
}
