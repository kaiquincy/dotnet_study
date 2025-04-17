import React, { createContext, useContext, useState } from 'react';
import priceData from './../data/prices.json'; // Điều chỉnh đường dẫn phù hợp

const OrderContext = createContext();

export function OrderProvider({ children }) {
  // images: lưu trữ danh sách các đối tượng chứa thông tin file và các tùy chọn đi kèm.
  // Ví dụ, mỗi phần tử có cấu trúc: { file: File, size: "4x6", quantity: 2, unit_price: 0.10 (có thể undefined) }
  const [images, setImages] = useState([]);
  // order: đối tượng đơn hàng được tạo sau khi gửi thành công
  const [order, setOrder] = useState(null);
  // orders: danh sách các đơn hàng (có thể dùng cho admin, hoặc load lại sau khi tạo đơn hàng)
  const [orders, setOrders] = useState([]);

  const addImages = (newImages) => {
    setImages(prev => [...prev, ...newImages]);
  };

  const updateImage = (index, updatedData) => {
    setImages(prev =>
      prev.map((img, i) => (i === index ? { ...img, ...updatedData } : img))
    );
  };

  const clearImages = () => {
    setImages([]);
  };

  /**
   * createOrder: Gọi API backend để tạo đơn hàng.
   * - Backend nhận đơn hàng qua endpoint POST /orders.
   * - Yêu cầu các trường: order_note, order_items (JSON string)
   *   và các file đính kèm với key tương ứng (ví dụ: file0, file1, …)
   *
   * Unit_price: nếu không có giá từ data của ảnh, sẽ được lấy mặc định từ file price.json dựa theo size.
   *
   * @param {string} orderNote Ghi chú đơn hàng.
   */
  const createOrder = async (orderNote) => {
    try {
      // Lấy token từ localStorage (đã lưu khi đăng nhập)
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error("Chưa có token xác thực. Vui lòng đăng nhập lại.");
      }

      // Tạo FormData và thêm trường order_note
      const formData = new FormData();
      formData.append('order_note', orderNote);

      // Xây dựng mảng order_items: mỗi mục có file_field, size, quantity, unit_price.
      // Nếu unit_price không có trong đối tượng ảnh, dùng giá mặc định từ priceData theo kích cỡ.
      const orderItems = images.map((img, index) => {
        const unitPrice = img.unit_price !== undefined
          ? img.unit_price
          : priceData[img.size]; // Lấy giá mặc định từ file data/price.json, nếu size khớp.
        return {
          file_field: `file${index}`,
          size: img.size,
          quantity: img.quantity,
          unit_price: unitPrice
        };
      });
      formData.append('order_items', JSON.stringify(orderItems));

      // Đính kèm các file từ state images với key tương ứng: file0, file1, ...
      images.forEach((img, index) => {
        formData.append(`file${index}`, img.file);
      });

      // Gọi API POST /orders
      const response = await fetch('http://127.0.0.1:5000/orders', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token
          // Không cần set Content-Type cho multipart/form-data, trình duyệt sẽ tự set
        },
        body: formData
      });

      if (!response.ok) {
        // Nếu có lỗi, lấy thông báo lỗi từ API.
        const errorData = await response.json();
        throw new Error(errorData.message || 'Tạo đơn hàng thất bại');
      }

      // Nếu thành công, lấy dữ liệu đơn hàng trả về từ backend.
      const data = await response.json();
      // Giả sử backend trả về { message, order_id } hoặc thông tin đơn hàng khác.
      setOrder(data);
      setOrders(prev => [...prev, data]);
      clearImages();
      return data;
    } catch (error) {
      console.error("Lỗi tạo đơn hàng: ", error);
      throw error;
    }
  };

  // Hàm xử lý đơn hàng, ví dụ cập nhật trạng thái đơn hàng (cho admin)
  const processOrder = (orderNumber) => {
    setOrders(prev =>
      prev.map(o => (o.number === orderNumber ? { ...o, status: 'processed' } : o))
    );
  };

  return (
    <OrderContext.Provider
      value={{
        images,
        addImages,
        updateImage,
        clearImages,
        order,
        createOrder,
        orders,
        processOrder
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  return useContext(OrderContext);
}
