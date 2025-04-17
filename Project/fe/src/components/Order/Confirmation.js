import React from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { useOrder } from '../../context/OrderContext';
import { useNavigate } from 'react-router-dom';

function Confirmation() {
  const { order } = useOrder();
  const navigate = useNavigate();

  if (!order) {
    return <Box>No order details available.</Box>;
  }

  return (
    <Box textAlign="center">
      <Heading mb={4}>Thank You for Your Order!</Heading>
      <Text mb={2}>
        Your order ID is <strong>{order.order_id}</strong>.
      </Text>
      <Text mb={4}>Total Amount: ${order.total_amount.toFixed(2)}</Text>
      <Button
          colorScheme="blue"
          onClick={() => navigate(`/tracking?id=${order.order_id}`)}
        >
          Tracking My Orders
      </Button>
    </Box>
  );
}

export default Confirmation;
