import React, { useState } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  FormErrorMessage,
  useToast
} from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';

function LoginForm() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    let errs = {};
    if (!username) {
      errs.username = 'Username is required';
    }
    if (!password) {
      errs.password = 'Password is required';
    }
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      login(username, password);
      toast({
        title: "Logged in successfully",
        status: "success",
        duration: 2000,
        isClosable: true
      });
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <FormControl id="username" isInvalid={errors.username} mb={4}>
        <FormLabel>Username</FormLabel>
        <Input 
          type="text" 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          placeholder="Enter username" 
        />
        {errors.username && <FormErrorMessage>{errors.username}</FormErrorMessage>}
      </FormControl>
      <FormControl id="password" isInvalid={errors.password} mb={6}>
        <FormLabel>Password</FormLabel>
        <Input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          placeholder="Enter password" 
        />
        {errors.password && <FormErrorMessage>{errors.password}</FormErrorMessage>}
      </FormControl>
      <Button type="submit" colorScheme="blue" width="full">Login</Button>
    </Box>
  );
}

export default LoginForm;
