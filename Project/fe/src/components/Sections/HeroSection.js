import React, { useState, useEffect } from 'react';
import {
  Flex,
  Box,
  Heading,
  Text,
  Button,
  Image,
  IconButton,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

const imageList = [
  'hero.jpg',
  'hero2.jpg',
  'hero3.jpg',
  'hero4.jpg',
];

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const dotInactiveColor = useColorModeValue('whiteAlpha.600', 'whiteAlpha.600');
  const dotActiveColor = useColorModeValue('white', 'gray.800');

  // Chuyển slide tự động mỗi 5 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % imageList.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      (prevIndex - 1 + imageList.length) % imageList.length
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % imageList.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <Flex
      align="center"
      justify="space-between"
      direction={{ base: 'column', md: 'row' }}
      py={10}
      px={4}
      bg={bgColor}
    >
      {/* Phần thông tin chính */}
      <Box flex="1" mr={{ md: 6 }} textAlign={{ base: 'center', md: 'left' }}>
        <Heading as="h1" size="2xl" mb={4}>
          Welcome to MyImage
        </Heading>
        <Text fontSize="lg" mb={6}>
          Your online solution for digital photo printing. Upload your photos and create beautiful prints at the click of a button.
        </Text>
        <Button as={RouterLink} to="/upload" colorScheme="blue" size="lg">
          Get Started
        </Button>
      </Box>

      {/* Phần slider ảnh */}
      <Box flex="1" mt={{ base: 6, md: 0 }} position="relative">
        <Image
          src={imageList[currentIndex]}
          alt="Digital photo printing illustration"
          borderRadius="md"
          boxShadow="lg"
          width="100%"
          height="auto"
        />
        {/* Nút chuyển slide bên trái */}
        <IconButton
          icon={<ChevronLeftIcon />}
          position="absolute"
          top="50%"
          left="2"
          transform="translateY(-50%)"
          onClick={prevSlide}
          variant="ghost"
          colorScheme="blue"
          aria-label="Previous Slide"
        />
        {/* Nút chuyển slide bên phải */}
        <IconButton
          icon={<ChevronRightIcon />}
          position="absolute"
          top="50%"
          right="2"
          transform="translateY(-50%)"
          onClick={nextSlide}
          variant="ghost"
          colorScheme="blue"
          aria-label="Next Slide"
        />
        {/* Dot indicator */}
        <HStack spacing={2} position="absolute" bottom="4" left="50%" transform="translateX(-50%)">
          {imageList.map((_, index) => (
            <Box
              key={index}
              as="button"
              height="10px"
              width="10px"
              borderRadius="full"
              bg={currentIndex === index ? dotActiveColor : dotInactiveColor}
              onClick={() => goToSlide(index)}
            />
          ))}
        </HStack>
      </Box>
    </Flex>
  );
};

export default HeroSection;
