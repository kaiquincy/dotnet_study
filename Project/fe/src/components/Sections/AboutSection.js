import React from 'react';
import { Flex, Box, Heading, Text, Button, Image, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const AboutSection = () => {
  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      align="center"
      py={10}
      px={4}
      bg={useColorModeValue('gray.50', 'gray.800')}
    >
      <Box flex="1" mb={{ base: 6, md: 0 }}>
        {/* Placeholder: thay bằng hình ảnh giới thiệu của bạn */}
        <Image
          src="about.jpg"
          alt="About MyImage"
          borderRadius="md"
          boxShadow="lg"
        />
      </Box>
      <Box flex="1" ml={{ md: 6 }}>
        <Heading as="h2" size="xl" mb={4}>
          About MyImage
        </Heading>
        <Text fontSize="lg" mb={4}>
          MyImage is dedicated to helping you create beautiful printed memories from your digital photos. Our platform is user-friendly, secure, and modern – designed to make your photo printing experience enjoyable and hassle-free.
        </Text>
        <Button as={RouterLink} to="/upload" colorScheme="blue">
          Learn More
        </Button>
      </Box>
    </Flex>
  );
};

export default AboutSection;
