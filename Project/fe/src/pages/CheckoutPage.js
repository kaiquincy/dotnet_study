import React from 'react';
import { Flex, Box, Heading } from '@chakra-ui/react';
import CheckoutForm from '../components/Order/CheckoutForm';

function CheckoutPage() {
  return (
    <Flex minH="100vh">
      {/* Bên trái: Ảnh checkout */}
      <Box position="relative" width={{ base: "100%", md: "50%" }} minH="400px">
        <Box
          backgroundImage="url('payment.jpg')"
          backgroundPosition="center"
          backgroundSize="cover"
          height="90%"
        />
        {/* Gradient overlay làm mờ dần hình ảnh về bên phải */}
        <Box
          position="absolute"
          top="0"
          right="0"
          height="100%"
          width="50%"
          bgGradient="linear(to-r, transparent, white)"
        />
      </Box>

      {/* Bên phải: Form thanh toán */}
      <Box flex="1" p={8}>
        <Heading mb={6}>STEP 3: Checkout</Heading>
        <CheckoutForm />
      </Box>
    </Flex>
  );
}

export default CheckoutPage;
