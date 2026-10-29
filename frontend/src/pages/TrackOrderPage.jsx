import React from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import TrackOrder from '../TrackOrder';
import { useShop } from '../context/ShopContext';

export default function TrackOrderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { orderId: paramOrderId } = useParams();
  const { currentUser } = useShop();

  const initialOrderId = paramOrderId || searchParams.get('orderId') || '';
  const initialPhone = searchParams.get('phone') || '';

  return (
    <div className="section-container" style={{ padding: '32px 16px' }}>
      <TrackOrder
        key={`track-${initialOrderId}-${initialPhone}-${currentUser?.id || 'guest'}`}
        onBack={() => navigate('/')}
        initialOrderId={initialOrderId}
        initialPhone={initialPhone}
        currentUser={currentUser}
        onSelectOrderDirect={(oid) => navigate(`/track-order/${oid}`)}
      />
    </div>
  );
}
