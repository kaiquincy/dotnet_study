import React from 'react';
import { Box, Heading, Container } from '@chakra-ui/react';
import ImageUpload from '../components/Gallery/ImageUpload';
import ImageGallery from '../components/Gallery/ImageGallery';

function UploadPage() {
  return (
    <Container maxW="container.md" py={8}>
      <Heading mb={6} textAlign="center">
        STEP 1: Upload Your Photos
      </Heading>
      <Box mb={6}>
        <ImageUpload />
      </Box>
      <ImageGallery />
    </Container>
  );
}

export default UploadPage;
