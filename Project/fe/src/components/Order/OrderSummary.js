import React from 'react';
import { Table, Thead, Tbody, Tfoot, Tr, Th, Td } from '@chakra-ui/react';
import { useOrder } from '../../context/OrderContext';
import prices from '../../data/prices.json';

function OrderSummary() {
  const { images } = useOrder();
  const validImages = images.filter(img => !img.remove && img.size);

  const totalPrice = validImages.reduce((sum, img) => {
    const pricePerPrint = prices[img.size] || 0;
    return sum + pricePerPrint * img.quantity;
  }, 0);

  if (validImages.length === 0) {
    return (
      <div>
        No valid images selected for order. Please ensure each image has a selected size.
      </div>
    );
  }

  return (
    <>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Image</Th>
            <Th>Size</Th>
            <Th>Quantity</Th>
            <Th>Cost</Th>
          </Tr>
        </Thead>
        <Tbody>
          {validImages.map((img, index) => (
            <Tr key={index}>
              <Td>
                <img
                  src={img.url}
                  alt={`Image ${index + 1}`}
                  style={{
                    border: "2px solid #ccc",     // tạo khung cho ảnh
                    borderRadius: "8px",            // bo góc cho ảnh
                    padding: "4px",                 // khoảng cách giữa ảnh và viền
                    maxWidth: "100px",
                    maxHeight: "100px"
                  }}
                />
              </Td>
              <Td>{img.size}</Td>
              <Td>{img.quantity}</Td>
              <Td>${(prices[img.size] * img.quantity).toFixed(2)}</Td>
            </Tr>
          ))}
        </Tbody>
        <Tfoot>
          <Tr>
            {/* Tăng kích thước chữ cho dòng Total */}
            <Th colSpan="3" style={{ fontSize: "1.2rem" }}>Total</Th>
            <Th style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              ${totalPrice.toFixed(2)}
            </Th>
          </Tr>
        </Tfoot>
      </Table>
    </>
  );
}

export default OrderSummary;
