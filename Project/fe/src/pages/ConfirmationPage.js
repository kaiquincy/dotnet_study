import React from 'react';
import { Box } from '@chakra-ui/react';
import Confirmation from '../components/Order/Confirmation';

function ConfirmationPage() {
  return (
    <Box maxW="md" mx="auto">
      <Confirmation />
    </Box>
  );
}

export default ConfirmationPage;
