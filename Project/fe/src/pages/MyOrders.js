// src/pages/MyOrders.js
import React, { useEffect, useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Spinner,
  Button,
  Text,
  Center
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('http://127.0.0.1:5000/orders', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, []);

  if (loading) {
    return (
      <Center py={10}>
        <Spinner size="xl" />
      </Center>
    );
  }

  if (orders.length === 0) {
    return (
      <Box p={6} textAlign="center">
        <Heading size="md" mb={4}>You have no orders yet.</Heading>
        <Text>Upload some images and place your first order!</Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Heading mb={6}>My Orders</Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Order ID</Th>
            <Th>Order Date</Th>
            <Th isNumeric>Total</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {orders.map((order) => (
            <Tr key={order.order_id}>
              <Td fontFamily="mono" fontSize="sm">{order.order_id}</Td>
              <Td>{new Date(order.order_date).toLocaleString()}</Td>
              <Td isNumeric>${order.total_amount.toFixed(2)}</Td>
              <Td textTransform="capitalize">{order.status}</Td>
              <Td>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={() => navigate(`/tracking?id=${order.order_id}`)}
                >
                  Track
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}

export default MyOrders;
