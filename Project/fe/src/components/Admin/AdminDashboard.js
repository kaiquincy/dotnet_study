import React, { useEffect, useState } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, Button, Text } from '@chakra-ui/react';

function AdminDashboard() {
  const [pendingOrders, setPendingOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('http://127.0.0.1:5000/admin/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setPendingOrders(data.orders || []);
      } catch (error) {
        console.error("Error fetching orders", error);
      }
    };
    fetchOrders();
  }, []);

  const handleProcess = async (orderId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://127.0.0.1:5000/admin/orders/${orderId}/process`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        // Cập nhật UI: loại bỏ đơn hàng đã xử lý khỏi danh sách
        setPendingOrders(pendingOrders.filter(order => order.order_id !== orderId));
      } else {
        const errData = await response.json();
        console.error("Error processing order:", errData.message);
      }
    } catch (error) {
      console.error("Error processing order", error);
    }
  };

  if (pendingOrders.length === 0) {
    return <Text>No pending orders.</Text>;
  }

  return (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Order #</Th>
          <Th>User Email</Th>
          <Th>Total</Th>
          <Th>Payment Method</Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {pendingOrders.map((order, index) => (
          <Tr key={index}>
            <Td>{order.order_id}</Td>
            <Td>{order.userEmail || "N/A"}</Td>
            <Td>${order.total.toFixed(2)}</Td>
            <Td>{order.paymentMethod}</Td>
            <Td>
              <Button
                size="sm"
                colorScheme="green"
                onClick={() => handleProcess(order.order_id)}
              >
                Mark as Processed
              </Button>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

export default AdminDashboard;
