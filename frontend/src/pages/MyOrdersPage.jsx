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
          if (params?.orderId) {
            const query = params.phone ? `?phone=${encodeURIComponent(params.phone)}` : '';
            navigate(`/track-order/${params.orderId}${query}`);
          } else {
            navigate('/track-order');
          }
        }}
        currentUser={currentUser}
      />
    </div>
  );
}
