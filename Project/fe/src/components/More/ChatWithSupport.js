// ChatWithSupport.js
import React, { useState } from 'react';
import { Box, IconButton, Input, Button, Text } from '@chakra-ui/react';
import { ChatIcon } from '@chakra-ui/icons';

const ChatWithSupport = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSend = () => {
    if (message.trim() !== '') {
      setMessages([...messages, { text: message }]);
      setMessage('');
    }
  };

  return (
    <Box position="fixed" bottom="4" right="4" zIndex="1000">
      <Box position="relative">
        {isOpen && (
          <Box
            bg="white"
            borderWidth="1px"
            borderRadius="md"
            boxShadow="md"
            p={4}
            width="300px"
            maxHeight="400px"
            overflowY="auto"
            mb={2}
          >
            <Text fontWeight="bold" mb={2}>
              Support Chat
            </Text>
            {messages.length === 0 ? (
              <Text color="gray.500" fontSize="sm">
                No messages yet.
              </Text>
            ) : (
              messages.map((msg, index) => (
                <Box
                  key={index}
                  mb={2}
                  p={2}
                  bg="gray.100"
                  borderRadius="md"
                  fontSize="sm"
                >
                  {msg.text}
                </Box>
              ))
            )}
            <Box display="flex" mt={2}>
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                mr={2}
                size="sm"
              />
              <Button onClick={handleSend} colorScheme="blue" size="sm">
                Send
              </Button>
            </Box>
          </Box>
        )}
        <IconButton
          icon={<ChatIcon />}
          colorScheme="blue"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Chat with support"
          borderRadius="full"
          size="lg"
        />
      </Box>
    </Box>
  );
};

export default ChatWithSupport;
