import React from 'react';
import { Box, Heading, Button } from '@chakra-ui/react';
import OrderSummary from '../components/Order/OrderSummary';
import { useNavigate } from 'react-router-dom';

function OrderSummaryPage() {
  const navigate = useNavigate();
  
  return (
    <Box>
      <Heading mb={4}>STEP 2: Order Summary</Heading>
      <OrderSummary />
      <Button colorScheme="blue" onClick={() => navigate('/checkout')} mt={4}>
        Proceed to Checkout
      </Button>
    </Box>
  );
}

export default OrderSummaryPage;
