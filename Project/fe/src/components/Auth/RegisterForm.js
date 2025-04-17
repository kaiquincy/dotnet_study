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

function RegisterForm() {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    let errs = {};
    if (!email) {
      errs.email = 'Email is required';
    }
    if (!password) {
      errs.password = 'Password is required';
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      register(email, password);
      toast({
        title: "Registered successfully",
        status: "success",
        duration: 2000,
        isClosable: true
      });
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <FormControl id="email" isInvalid={errors.email} mb={4}>
        <FormLabel>Email</FormLabel>
        <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter email" />
        {errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
      </FormControl>
      <FormControl id="password" isInvalid={errors.password} mb={4}>
        <FormLabel>Password</FormLabel>
        <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" />
        {errors.password && <FormErrorMessage>{errors.password}</FormErrorMessage>}
      </FormControl>
      <FormControl id="confirmPassword" isInvalid={errors.confirmPassword} mb={6}>
        <FormLabel>Confirm Password</FormLabel>
        <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm password" />
        {errors.confirmPassword && <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>}
      </FormControl>
      <Button type="submit" colorScheme="blue" width="full">Register</Button>
    </Box>
  );
}

export default RegisterForm;
