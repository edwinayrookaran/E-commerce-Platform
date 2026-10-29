import React, { useRef, useState } from 'react';
import { ShieldCheck, Truck, MapPin, Heart } from 'lucide-react';

export default function TrustBanner({ onTrackOrderClick }) {
  const trustItems = [
    {
      id: 'payments',
      icon: ShieldCheck,
      title: 'SECURE PAYMENTS',
      subtitle: 'Safe & Secure Checkouts',
      desc: 'Cash on delivery and trusted order processing.'
    },
    {
      id: 'delivery',
      icon: Truck,
      title: 'DELIVERY ACROSS INDIA',
      subtitle: 'Fast & Reliable Delivery',
      desc: 'Delivering authentic regional meals to your doorstep.'
    },
    {
      id: 'tracking',
      icon: MapPin,
      title: 'TRACK YOUR ORDER',
      subtitle: 'Stay Updated Always',
      desc: 'Real-time order stage updates with your phone number.',
      action: onTrackOrderClick
    },
    {
      id: 'quality',
      icon: Heart,
      title: 'QUALITY FOOD',
      subtitle: 'Made with Care & Love',
      desc: 'Authentic Kerala recipes with genuine ingredients.'
    }
  ];

  const scrollRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const items = el.querySelectorAll('.feature-highlight-item');
    if (!items.length) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let closest = 0;
    let minDiff = Infinity;
    items.forEach((item, idx) => {
      const itemCenter = item.offsetLeft + item.clientWidth / 2;
      const diff = Math.abs(center - itemCenter);
      if (diff < minDiff) {
        minDiff = diff;
        closest = idx;
      }
    });
    setActiveIdx(closest);
  };

  const scrollToIndex = (idx) => {
    const el = scrollRef.current;
    if (!el) return;
    const items = el.querySelectorAll('.feature-highlight-item');
    if (items[idx]) {
      const item = items[idx];
      const target = item.offsetLeft - (el.clientWidth - item.clientWidth) / 2;
      el.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
      setActiveIdx(idx);
    }
  };

  return (
    <section className="features-highlight-section trust-banner-section" id="features">
      <div className="section-container">
        {/* Horizontal Features Track */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="features-horizontal-row trust-banner-grid"
          role="region"
          aria-label="Feature Highlights"
        >
          {trustItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`feature-highlight-item trust-banner-card ${item.action ? 'clickable-feature clickable-card' : ''} ${activeIdx === idx ? 'is-active-feature' : ''}`}
                onClick={item.action}
                role={item.action ? 'button' : undefined}
                tabIndex={item.action ? 0 : undefined}
                onKeyDown={item.action ? (e) => (e.key === 'Enter' || e.key === ' ') && item.action() : undefined}
                aria-label={item.action ? `${item.title} - Click to track order` : undefined}
              >
                <div className="feature-icon-wrapper trust-card-icon-box" aria-hidden="true">
                  <Icon size={22} className="feature-icon" />
                </div>
                <div className="feature-text-content trust-card-content">
                  <span className="feature-title trust-card-title">{item.title}</span>
                  <strong className="feature-subtitle trust-card-sub">{item.subtitle}</strong>
                  <p className="feature-desc trust-card-desc">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Horizontal Scroll Dots */}
        <div className="features-mobile-dots" aria-hidden="true">
          {trustItems.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`feature-dot ${activeIdx === idx ? 'active' : ''}`}
              onClick={() => scrollToIndex(idx)}
              aria-label={`Go to feature ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
