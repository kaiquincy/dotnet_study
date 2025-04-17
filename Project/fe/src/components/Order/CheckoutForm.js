import React, { useState } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  RadioGroup,
  Radio,
  Stack,
  FormErrorMessage,
  useToast,
  Image
} from '@chakra-ui/react';
import { useOrder } from '../../context/OrderContext';
import prices from '../../data/prices.json';
import { useNavigate } from 'react-router-dom';

function CheckoutForm() {
  const { images, createOrder, clearImages } = useOrder();
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const toast = useToast();

  const validImages = images.filter(img => !img.remove && img.size);
  const totalPrice = validImages.reduce((sum, img) => {
    const pricePerPrint = prices[img.size] || 0;
    return sum + pricePerPrint * img.quantity;
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errs = {};
    if (!address) errs.address = "Shipping address is required.";
    if (paymentMethod === 'Credit Card') {
      if (!cardNumber) errs.cardNumber = "Card number is required.";
      if (!expiry) errs.expiry = "Expiry is required.";
      if (!cvv) errs.cvv = "CVV is required.";
    }
    setErrors(errs);
    if (Object.keys(errs).length !== 0) return;

    // Simulate encryption (for demo, simply reverse the card number)
    let encryptedCard = null;
    if (paymentMethod === 'Credit Card') {
      encryptedCard = cardNumber.split('').reverse().join('');
    }
    const orderNumber = Date.now(); // Simple unique order number
    const orderData = {
      number: orderNumber,
      userEmail: "", // Could come from auth context
      items: validImages,
      total: totalPrice,
      paymentMethod,
      paymentDetails: paymentMethod === 'Credit Card' ? { encryptedCard, expiry, cvv } : {},
      shippingAddress: address,
      status: "pending"
    };

    createOrder(orderData);
    clearImages();
    toast({
      title: "Order placed successfully",
      description: `Your order number is ${orderNumber}`,
      status: "success",
      duration: 3000,
      isClosable: true
    });
    navigate('/confirmation');
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <FormControl id="address" isInvalid={errors.address} mb={4}>
        <FormLabel>Shipping Address</FormLabel>
        <Textarea
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="Enter shipping address"
        />
        {errors.address && <FormErrorMessage>{errors.address}</FormErrorMessage>}
      </FormControl>

      <FormControl as="fieldset" mb={4}>
        <FormLabel as="legend">Payment Method</FormLabel>
        <RadioGroup onChange={setPaymentMethod} value={paymentMethod}>
          <Stack direction="row">
            <Radio value="Credit Card">Credit Card</Radio>
            <Radio value="Branch Payment">Branch Payment</Radio>
          </Stack>
        </RadioGroup>
      </FormControl>

      {paymentMethod === 'Credit Card' && (
        <>
          <FormControl id="cardNumber" isInvalid={errors.cardNumber} mb={4}>
          <FormLabel display="flex" alignItems="center" justifyContent="space-between">
              Card Number
              <Box>
                <Image
                  src="visa.png"
                  alt="Visa logo"
                  width="100px"
                />
              </Box>
            </FormLabel>
            <Input
              type="text"
              value={cardNumber}
              onChange={e => setCardNumber(e.target.value)}
              placeholder="Enter card number"
            />
            {errors.cardNumber && <FormErrorMessage>{errors.cardNumber}</FormErrorMessage>}
          </FormControl>
          <FormControl id="expiry" isInvalid={errors.expiry} mb={4}>
            <FormLabel>Expiry Date</FormLabel>
            <Input
              type="text"
              value={expiry}
              onChange={e => setExpiry(e.target.value)}
              placeholder="MM/YY"
            />
            {errors.expiry && <FormErrorMessage>{errors.expiry}</FormErrorMessage>}
          </FormControl>
          <FormControl id="cvv" isInvalid={errors.cvv} mb={4}>
            <FormLabel>CVV</FormLabel>
            <Input
              type="password"
              value={cvv}
              onChange={e => setCvv(e.target.value)}
              placeholder="Enter CVV"
            />
            {errors.cvv && <FormErrorMessage>{errors.cvv}</FormErrorMessage>}
          </FormControl>
        </>
      )}

      <Button type="submit" colorScheme="blue" width="full">
        Place Order
      </Button>
    </Box>
  );
}

export default CheckoutForm;
