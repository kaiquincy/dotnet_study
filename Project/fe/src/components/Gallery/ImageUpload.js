import React, { useRef } from 'react';
import { Box, Button, Text, useToast } from '@chakra-ui/react';
import { useOrder } from '../../context/OrderContext';

function ImageUpload() {
  const { addImages } = useOrder();
  const inputRef = useRef(null);
  const toast = useToast();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const jpegFiles = files.filter(file => file.type === "image/jpeg");
    if (jpegFiles.length !== files.length) {
      toast({
        title: "Only JPEG images are allowed.",
        status: "warning",
        duration: 2000,
        isClosable: true
      });
    }
    // Tạo URL preview và khởi tạo dữ liệu hình ảnh
    const imageData = jpegFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      previewUrl: URL.createObjectURL(file),
      size: "",
      quantity: 1
    }));
    addImages(imageData);
    e.target.value = null;  // Reset file input
  };

  return (
    <Box textAlign="center">
      <input
        type="file"
        accept="image/jpeg"
        multiple
        style={{ display: 'none' }}
        ref={inputRef}
        onChange={handleFileChange}
      />
      <Button onClick={() => inputRef.current.click()} colorScheme="teal" size="lg">
        Upload JPEG Images
      </Button>
      <Text mt={2} color="gray.500">
        You can upload one or multiple JPEG images.
      </Text>
    </Box>
  );
}

export default ImageUpload;
