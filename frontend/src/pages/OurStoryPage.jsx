import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandStory from '../components/BrandStory';
import ConvenienceSection from '../components/ConvenienceSection';
import AlsoAvailableSection from '../components/AlsoAvailableSection';
import TrustBanner from '../components/TrustBanner';

export default function OurStoryPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="our-story-page-wrap">
      {/* Breadcrumb Bar */}
      <div className="section-container" style={{ paddingBottom: 0, paddingTop: '24px' }}>
        <nav className="shop-breadcrumb" aria-label="Breadcrumb">
          <Link to="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">Our Story</span>
        </nav>
      </div>

      {/* Brand Story Section */}
      <BrandStory onExploreMeals={() => navigate('/shop')} />

      {/* Convenience Highlights */}
      <ConvenienceSection />

      {/* Also Available On Section */}
      <AlsoAvailableSection />

      {/* Trust & Guarantee Banner */}
      <TrustBanner onTrackOrderClick={() => navigate('/track-order')} />
    </div>
  );
}
