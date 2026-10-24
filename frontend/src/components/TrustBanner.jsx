import React from 'react';
import { ShieldCheck, Truck, MapPin, Sparkles } from 'lucide-react';

export default function TrustBanner({ onTrackOrderClick }) {
  const trustItems = [
    {
      icon: ShieldCheck,
      title: 'SECURE PAYMENTS',
      subtitle: 'Safe & Secure Checkouts',
      desc: 'Cash on delivery and trusted order processing'
    },
    {
      icon: Truck,
      title: 'DELIVERY ACROSS INDIA',
      subtitle: 'Fast & Reliable Delivery',
      desc: 'Delivering authentic regional meals to your doorstep'
    },
    {
      icon: MapPin,
      title: 'TRACK YOUR ORDER',
      subtitle: 'Stay Updated Always',
      desc: 'Real-time order stage updates with your phone number',
      action: onTrackOrderClick
    },
    {
      icon: Sparkles,
      title: 'QUALITY FOOD',
      subtitle: 'Made with Care & Love',
      desc: 'Authentic Kerala recipes with genuine ingredients'
    }
  ];

  return (
    <section className="trust-banner-section">
      <div className="section-container">
        <div className="trust-banner-grid">
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`trust-banner-card ${item.action ? 'clickable-card' : ''}`}
                onClick={item.action}
              >
                <div className="trust-card-icon-box">
                  <Icon size={22} />
                </div>
                <div className="trust-card-content">
                  <h4 className="trust-card-title">{item.title}</h4>
                  <strong className="trust-card-sub">{item.subtitle}</strong>
                  <p className="trust-card-desc">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
