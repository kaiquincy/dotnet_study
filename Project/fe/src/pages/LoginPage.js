import React from 'react';
import { Box, Heading } from '@chakra-ui/react';
import LoginForm from '../components/Auth/LoginForm';

function LoginPage() {
  return (
    <Box maxW="md" mx="auto">
      <Heading mb={6}>Login</Heading>
      <LoginForm />
    </Box>
  );
}

export default LoginPage;
