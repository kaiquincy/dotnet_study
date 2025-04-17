import React from 'react';
import {
  Box,
  Image,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  IconButton,
  Button,
  SimpleGrid,
  Flex,
  Text
} from '@chakra-ui/react';
import { useOrder } from '../../context/OrderContext';
import prices from '../../data/prices.json';
import { CloseIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';

function ImageGallery() {
  const { images, updateImage } = useOrder();

  const handleSizeChange = (index, size) => {
    updateImage(index, { size });
  };

  const handleQuantityChange = (index, value) => {
    updateImage(index, { quantity: value });
  };

  const handleRemove = (index) => {
    // Đánh dấu ảnh đã xóa bằng cách thêm flag remove
    updateImage(index, { remove: true });
  };

  const validImages = images.filter(img => !img.remove);

  if (validImages.length === 0) {
    return (
      <Box mt={4} textAlign="center" color="gray.600">
        No images uploaded yet.
      </Box>
    );
  }

  return (
    <>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={4}>
        {validImages.map((img, index) => (
          <Box key={index} borderWidth="1px" borderRadius="md" p={4} boxShadow="sm">
            <Flex justify="end">
              <IconButton
                icon={<CloseIcon />}
                variant="ghost"
                colorScheme="red"
                onClick={() => handleRemove(index)}
                aria-label="Remove image"
                size="sm"
              />
            </Flex>
            <Image
              src={img.previewUrl}
              objectFit="cover"
              borderRadius="md"
              mb={4}
              w="100%"
              h="150px"
            />
            <Box>
              <Text mb={1} fontWeight="semibold">
                Select Size:
              </Text>
              <Select
                placeholder="Select size"
                value={img.size}
                onChange={e => handleSizeChange(index, e.target.value)}
                mb={3}
              >
                {Object.keys(prices).map((size, idx) => (
                  <option key={idx} value={size}>
                    {size} (${prices[size]})
                  </option>
                ))}
              </Select>
            </Box>
            <Box>
              <Text mb={1} fontWeight="semibold">
                Quantity:
              </Text>
              <NumberInput
                min={1}
                value={img.quantity}
                onChange={(valueString, valueNumber) =>
                  handleQuantityChange(index, valueNumber)
                }
                size="sm"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Box>
          </Box>
        ))}
      </SimpleGrid>

      <Box mt={6} textAlign="center">
        <Link to="/order-summary">
          <Button colorScheme="blue" size="lg">
            Order Summary
          </Button>
        </Link>
      </Box>
    </>
  );
}

export default ImageGallery;
