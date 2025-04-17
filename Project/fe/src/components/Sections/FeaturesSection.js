import React from 'react';
import { Box, Heading, Text, Image, Stack } from '@chakra-ui/react';

const FeaturesSection = () => {
  const features = [
    {
      title: 'Easy Photo Upload',
      description: 'Quickly select and upload your photos from your device.',
      image: 'upload.png', // placeholder, thay bằng hình ảnh của bạn
    },
    {
      title: 'Customizable Print Options',
      description: 'Choose print sizes and quantities with ease.',
      image: 'custom.png',
    },
    {
      title: 'Secure Payment',
      description: 'Fast and safe payment options to complete your order.',
      image: 'secure.png',
    },
  ];

  return (
    <Box py={10} px={4}>
      <Heading as="h2" size="xl" textAlign="center" mb={6}>
        Our Features
      </Heading>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={8} align="center">
        {features.map((feature, index) => (
          <Box
            key={index}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            shadow="md"
            textAlign="center"
            maxW="sm"
          >
            <Image
              src={feature.image}
              alt={feature.title}
              boxSize="150px"
              objectFit="cover"
              mx="auto"
              mb={4}
              borderRadius="full"
            />
            <Heading as="h3" size="md" mb={2}>
              {feature.title}
            </Heading>
            <Text>{feature.description}</Text>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default FeaturesSection;
