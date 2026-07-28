// src/tema.js
import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const styles = {
  global: {
    'html, body': {
      bg: '#0f131c',
      color: '#e2e8f0',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      lineHeight: '1.6',
    },
    'h1, h2, h3, h4, h5, h6': {
      fontFamily: "'Outfit', 'Inter', system-ui, -apple-system, sans-serif",
      fontWeight: '700',
      color: '#f8fafc',
    },
    '*::selection': {
      bg: 'teal.500',
      color: 'white',
    },
    '::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '::-webkit-scrollbar-track': {
      bg: '#0f131c',
    },
    '::-webkit-scrollbar-thumb': {
      bg: '#263147',
      borderRadius: '4px',
    },
    '::-webkit-scrollbar-thumb:hover': {
      bg: '#334155',
    },
  },
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: '600',
      borderRadius: 'lg',
    },
    defaultProps: {
      colorScheme: 'teal',
    },
  },
  Modal: {
    baseStyle: {
      dialog: {
        bg: '#161c28',
        borderColor: '#263147',
        borderWidth: '1px',
        borderRadius: 'xl',
      },
    },
  },
  Input: {
    defaultProps: {
      focusBorderColor: 'teal.400',
    },
  },
  Select: {
    defaultProps: {
      focusBorderColor: 'teal.400',
    },
  },
  Textarea: {
    defaultProps: {
      focusBorderColor: 'teal.400',
    },
  },
};

const tema = extendTheme({
  config,
  styles,
  components,
});

export default tema;
