import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Spinner,
  useColorModeValue,
  Circle,
  VStack,
  Image,
  Divider,
  Badge,
  Tooltip,
} from '@chakra-ui/react';
import { CheckIcon, TimeIcon } from '@chakra-ui/icons';
import { useSearchParams } from 'react-router-dom';

function TrackingOrder() {
  const [searchParams] = useSearchParams();
  const order_id = searchParams.get("id");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const primaryColor = useColorModeValue('blue.500', 'blue.300');
  const secondaryColor = useColorModeValue('gray.300', 'gray.600');
  const statusColorMap = {
    pending: 'orange',
    processed: 'yellow',
    shipping: 'blue',
    delivered: 'green',
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`http://127.0.0.1:5000/orders/${order_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch order');
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [order_id]);

  if (loading) {
    return (
      <Flex align="center" justify="center" minH="100vh" bg={bg}>
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!order) {
    return (
      <Flex align="center" justify="center" minH="100vh" bg={bg}>
        <Heading color="red.400">Order Not Found</Heading>
      </Flex>
    );
  }

  const statusObj = order.order_status;
  const computedStatus =
    !statusObj.isApproved ? 'pending' :
    !statusObj.isShipping ? 'processed' :
    !statusObj.isDelivered ? 'shipping' : 'delivered';

  const isApproved = computedStatus !== 'pending';
  const isShipping = computedStatus === 'shipping' || computedStatus === 'delivered';
  const isDelivered = computedStatus === 'delivered';

  const StepIcon = ({ completed }) => (
    <Tooltip label={completed ? "Completed" : "Pending"} hasArrow>
      <Circle size="50px" bg={completed ? primaryColor : secondaryColor} color="white">
        {completed ? <CheckIcon boxSize={6} /> : <TimeIcon boxSize={6} />}
      </Circle>
    </Tooltip>
  );

  return (
    <Box bg={bg} minH="100vh" py={10} px={4}>
      <Box mb={10} textAlign="center">
        <Heading fontSize="3xl">🧾 Track Your Order</Heading>
        <Text mt={2} color="gray.500">
          Monitor your order progress in real-time
        </Text>
      </Box>

      <Box maxW="900px" mx="auto" p={8} bg={cardBg} borderRadius="xl" boxShadow="xl">
        <Text fontSize="sm" color="gray.400" textAlign="center" mb={4}>
          Order ID: <strong>{order.order_id.slice(0, 20)}</strong>
        </Text>

        {/* Status */}
        <Flex justify="center" mb={6}>
          <Badge colorScheme={statusColorMap[computedStatus]} fontSize="md" px={4} py={1} borderRadius="md">
            Status: {computedStatus.toUpperCase()}
          </Badge>
        </Flex>

        {/* Order Progress */}
        <Flex align="center" justify="space-between" mb={4}>
          <StepIcon completed={isApproved} />
          <Box flex="1" borderBottom="2px" mx={2} borderColor={isShipping ? primaryColor : secondaryColor} />
          <StepIcon completed={isShipping} />
          <Box flex="1" borderBottom="2px" mx={2} borderColor={isDelivered ? primaryColor : secondaryColor} />
          <StepIcon completed={isDelivered} />
        </Flex>
        <Flex justify="space-between" px={2} mb={6}>
          <Text fontSize="sm" flex="1" textAlign="center">Approved</Text>
          <Text fontSize="sm" flex="1" textAlign="center">Shipping</Text>
          <Text fontSize="sm" flex="1" textAlign="center">Delivered</Text>
        </Flex>

        <Divider my={4} />

        {/* Order Info */}
        <VStack spacing={6} align="stretch">
          <Box>
            <Heading size="md" mb={2}>Order Information</Heading>
            <Text><strong>Order Date:</strong> {new Date(order.order_date).toLocaleString()}</Text>
            <Text><strong>Total Amount:</strong> ${order.total_amount.toFixed(2)}</Text>
          </Box>

          {/* Uploaded Images */}
          {order.order_details?.length > 0 && (
            <Box>
              <Heading size="md" mb={4}>Uploaded Images</Heading>
              <Flex wrap="wrap" gap={5} justify="flex-start">
                {order.order_details.map((detail, idx) => (
                  <Box
                    key={idx}
                    p={3}
                    bg="gray.100"
                    borderRadius="lg"
                    boxShadow="md"
                    _hover={{ transform: 'scale(1.05)' }}
                    transition="0.2s ease"
                  >
                    {/* <Image
                      src={`http://127.0.0.1:5000/static/${detail.image_id}.png`}
                      alt={`Image ${idx + 1}`}
                      borderRadius="md"
                      maxW="120px"
                      maxH="120px"
                      objectFit="cover"
                      mb={2}
                    /> */}
                    <img
                      src={`http://127.0.0.1:5000/static/${detail.image_id}.png`}
                      alt={`Image ${idx + 1}`}
                      style={{
                        border: "2px solid #ccc",     // tạo khung cho ảnh
                        borderRadius: "8px",            // bo góc cho ảnh
                        padding: "4px",                 // khoảng cách giữa ảnh và viền
                        maxWidth: "100px",
                        maxHeight: "100px"
                      }}
                    />
                    <Text fontSize="sm"><strong>Quantity:</strong> {detail.quantity}</Text>
                    <Text fontSize="sm"><strong>Size:</strong> {detail.size}</Text>
                    <Text fontSize="sm"><strong>Subtotal:</strong> ${detail.sub_total.toFixed(2)}</Text>
                  </Box>
                ))}
              </Flex>
            </Box>
          )}
        </VStack>
      </Box>
    </Box>
  );
}

export default TrackingOrder;
