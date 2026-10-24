import React from 'react';
import { useNavigate } from 'react-router-dom';
import MyOrders from '../MyOrders';
import { useShop } from '../context/ShopContext';

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const { currentUser } = useShop();

  return (
    <div className="section-container" style={{ padding: '32px 16px' }}>
      <MyOrders
        onBack={() => navigate('/')}
        onTrackOrder={(params) => {
          const query = params?.orderId
            ? `?orderId=${params.orderId}${params.phone ? '&phone=' + encodeURIComponent(params.phone) : ''}`
            : '';
          navigate(`/track-order${query}`);
        }}
        currentUser={currentUser}
      />
    </div>
  );
}
