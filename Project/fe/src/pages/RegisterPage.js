import React from 'react';
import { Box, Heading } from '@chakra-ui/react';
import RegisterForm from '../components/Auth/RegisterForm';

function RegisterPage() {
  return (
    <Box maxW="md" mx="auto">
      <Heading mb={6}>Register</Heading>
      <RegisterForm />
    </Box>
  );
}

export default RegisterPage;
