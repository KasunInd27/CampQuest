/* eslint-disable react-refresh/only-export-components */
// context/OrderContext.tsx
import React, { useState, createContext, useContext } from 'react';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  reviews: number;
  rating: number;
}

interface DeliveryAddress {
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharges: number;
  totalAmount: number;
  status: string;
  orderDate: Date;
  estimatedDeliveryDate: Date;
  deliveryAddress: DeliveryAddress;
  paymentMethod: string;
  paymentId: string;
}

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  createOrder: (items: OrderItem[], address: DeliveryAddress, paymentMethod: string, paymentId: string) => Order;
  getOrderById: (id: string) => Order | undefined;
  updateOrderStatus: (id: string, status: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD-20231105-001',
      items: [
        {
          id: '1',
          name: 'Portable Camping Stove',
          price: 89.99,
          image: 'https://uploadthingy.s3.us-west-1.amazonaws.com/gFzUPEiiyGQMoU8tcXjokv/image.png',
          quantity: 2,
          reviews: 86,
          rating: 4,
        },
      ],
      subtotal: 179.98,
      deliveryCharges: 450,
      totalAmount: 629.98,
      status: 'delivered',
      orderDate: new Date('2023-11-05'),
      estimatedDeliveryDate: new Date('2023-11-10'),
      deliveryAddress: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        street: '123 Main St',
        city: 'Camptown',
        state: 'CA',
        zipCode: '12345',
        phone: '(555) 123-4567',
      },
      paymentMethod: 'Credit Card',
      paymentId: 'PAY-123456789',
    },
    {
      id: 'ORD-20240220-002',
      items: [
        {
          id: '3',
          name: '4-Person Camping Tent',
          price: 199.99,
          image: 'https://uploadthingy.s3.us-west-1.amazonaws.com/bSemA9iKNYU9ATtfUAPE57/WhatsApp_Image_2025-09-02_at_12.41.03_31cb9f28.jpg',
          quantity: 1,
          reviews: 124,
          rating: 5,
        },
        {
          id: '7',
          name: 'Sleeping Bag',
          price: 79.99,
          image: 'https://images.unsplash.com/photo-1520699049698-acd2fccb8cc8?q=80&w=800&auto=format&fit=crop',
          quantity: 2,
          reviews: 98,
          rating: 4,
        },
      ],
      subtotal: 359.97,
      deliveryCharges: 450,
      totalAmount: 809.97,
      status: 'delivered',
      orderDate: new Date('2024-02-20'),
      estimatedDeliveryDate: new Date('2024-02-25'),
      deliveryAddress: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        street: '123 Main St',
        city: 'Camptown',
        state: 'CA',
        zipCode: '12345',
        phone: '(555) 123-4567',
      },
      paymentMethod: 'PayPal',
      paymentId: 'PAY-987654321',
    },
  ]);

  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const createOrder = (items: OrderItem[], address: DeliveryAddress, paymentMethod: string, paymentId: string): Order => {
    const subtotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
    const deliveryCharges = 450;
    const totalAmount = subtotal + deliveryCharges;
    
    const today = new Date();
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(today.getDate() + 5); // 5 days from now
    
    const orderNumber = `ORD-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-${String(orders.length + 1).padStart(3, '0')}`;

    const newOrder = {
      id: orderNumber,
      items,
      subtotal,
      deliveryCharges,
      totalAmount,
      status: 'processing',
      orderDate: today,
      estimatedDeliveryDate,
      deliveryAddress: address,
      paymentMethod,
      paymentId,
    };

    setOrders((prev) => [...prev, newOrder]);
    setCurrentOrder(newOrder);
    return newOrder;
  };

  const getOrderById = (id: string): Order | undefined => {
    return orders.find((order) => order.id === id);
  };

  const updateOrderStatus = (id: string, status: string): void => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? {
              ...order,
              status,
            }
          : order,
      ),
    );

    if (currentOrder?.id === id) {
      setCurrentOrder((prev) =>
        prev
          ? {
              ...prev,
              status,
            }
          : null,
      );
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        currentOrder,
        createOrder,
        getOrderById,
        updateOrderStatus,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder(): OrderContextType {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}