import React from 'react';
import { Box, Heading } from '@chakra-ui/react';
import AdminDashboard from '../components/Admin/AdminDashboard';

function AdminPage() {
  return (
    <Box>
      <Heading mb={4}>Admin Dashboard</Heading>
      <AdminDashboard />
    </Box>
  );
}

export default AdminPage;
