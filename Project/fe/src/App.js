import React from 'react';
import { Routes, Route, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  Button,
  HStack,
  Link,
  Text,
  useColorMode,
  useColorModeValue,
  IconButton,
  Image,
  Stack,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  Container,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UploadPage from './pages/UploadPage';
import OrderSummaryPage from './pages/OrderSummaryPage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';
import AdminPage from './pages/AdminPage';
import { useAuth } from './context/AuthContext';
import ChatWithSupport from './components/More/ChatWithSupport';
import TrackingOrder from './pages/TrackingOrder';
import MyOrders from './pages/MyOrders';

function App() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Màu sắc cơ bản và active cho link
  const baseLinkColor = useColorModeValue('blue.600', 'blue.300');
  const baseHoverColor = useColorModeValue('blue.800', 'blue.100');
  const activeLinkColor = useColorModeValue('white', 'gray.800');
  const activeBg = useColorModeValue('blue.600', 'blue.300');

  // Danh sách menu với một số link chỉ hiển thị cho admin hoặc khách chưa đăng nhập
  const menuLinks = [
    { to: '/', label: 'Home' },
    { to: '/upload', label: 'Upload' },
    { to: '/order-summary', label: 'Order Summary' },
    { to: '/myorders', label: 'My Orders' },
    { to: '/admin', label: 'Admin', adminOnly: true },
    { to: '/login', label: 'Login', guestOnly: true },
    { to: '/register', label: 'Register', guestOnly: true },
  ];

  // Kiểm tra active link dựa trên pathname
  const isLinkActive = (to) => location.pathname === to;

  // Hàm render các liên kết menu (dùng trong Drawer cho mobile)
  const renderMenuLinks = () => (
    <Stack spacing={4}>
      {menuLinks.map((link) => {
        if (link.adminOnly && (!user || !user.isAdmin)) return null;
        if (link.guestOnly && user) return null;

        const active = isLinkActive(link.to);

        return (
          <Link
            as={RouterLink}
            key={link.to}
            to={link.to}
            fontWeight="medium"
            color={active ? activeLinkColor : baseLinkColor}
            px={3}
            py={2}
            borderRadius="md"
            bg={active ? activeBg : 'transparent'}
            transition="all 0.2s"
            _hover={{
              color: baseHoverColor,
              textDecoration: 'underline',
            }}
            onClick={onClose} // Đóng menu sau khi click trong Drawer
          >
            {link.label}
          </Link>
        );
      })}
    </Stack>
  );

  return (
    <Box bg={useColorModeValue('gray.50', 'gray.900')} minH="100vh">
      <Container maxW="container.xl">
        {/* Navigation Bar */}
        <Flex
          as="nav"
          align="center"
          justify="space-between"
          wrap="wrap"
          padding={4}
          bg={useColorModeValue('white', 'gray.800')}
          boxShadow="md"
          borderRadius="md"
          mb={6}
        >
          {/* Logo và tiêu đề */}
          <Flex align="center" mr={5}>
            <Image
              src="logo.png"
              alt="MyImage Logo"
              boxSize="50px"
              objectFit="contain"
              mr={2}
            />
            <Text fontSize="2xl" fontWeight="bold" color={baseLinkColor}>
              MyImage
            </Text>
          </Flex>
          {/* Nút hamburger cho Mobile */}
          <IconButton
            aria-label="Toggle Menu"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            display={{ base: 'block', md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
          {/* Menu Links cho Desktop */}
          <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
            {menuLinks.map((link) => {
              if (link.adminOnly && (!user || !user.isAdmin)) return null;
              if (link.guestOnly && user) return null;

              const active = isLinkActive(link.to);

              return (
                <Link
                  as={RouterLink}
                  key={link.to}
                  to={link.to}
                  fontWeight="medium"
                  color={active ? activeLinkColor : baseLinkColor}
                  px={3}
                  py={2}
                  borderRadius="md"
                  bg={active ? activeBg : 'transparent'}
                  transition="all 0.2s"
                  _hover={{
                    color: baseHoverColor,
                    textDecoration: 'underline',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </HStack>
          {/* Các nút thao tác: chuyển đổi chế độ và logout */}
          <HStack spacing={4}>
            <IconButton
              aria-label="Toggle Color Mode"
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="ghost"
            />
            {user && (
              <Button colorScheme="red" size="sm" onClick={logout} _hover={{ opacity: 0.8 }}>
                Logout
              </Button>
            )}
          </HStack>
        </Flex>

        {/* Drawer cho navigation trên mobile */}
        <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px">Navigation</DrawerHeader>
            <DrawerBody>{renderMenuLinks()}</DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Nội dung chính */}
        <Box p={4} bg={useColorModeValue('white', 'gray.800')} borderRadius="md" boxShadow="sm">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/order-summary" element={<OrderSummaryPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/tracking" element={<TrackingOrder />} />
            <Route path="/myorders" element={<MyOrders />} />
            </Routes>
        </Box>
        <ChatWithSupport />
      </Container>
    </Box>
  );
}

export default App;
