import React from 'react';
import { ExternalLink, CheckCircle2 } from 'lucide-react';

const PLATFORMS = [
  {
    id: 'amazon',
    name: 'Amazon India',
    badge: 'Official Store',
    badgeType: 'official',
    url: 'https://www.amazon.in/l/27943762031?me=A1W9YC395N0IU6',
    logo: '/images/platforms/amazon.webp',
    logoAlt: 'Amazon Logo',
    description: 'Shop our authentic ready-to-eat pouches on Amazon with verified buyer protection and fast pan-India shipping.',
    highlights: ['Official Brand Store', 'Pan-India Delivery', 'Secure Ordering'],
    cta: 'Visit Amazon Store',
  },
  {
    id: 'swiggy-instamart',
    name: 'Swiggy Instamart',
    badge: 'Instant Delivery',
    badgeType: 'instant',
    url: 'https://instamart.in/collection-listing?collectionId=428607&share=true&brand=Fudcy%20Foods',
    logo: '/images/platforms/swiggy-instamart.png',
    logoAlt: 'Swiggy Instamart Logo',
    description: 'Craving an authentic Kerala meal right now? Get hot favourites delivered to your doorstep in minutes.',
    highlights: ['10–15 Min Delivery', 'Select Metro Cities', 'Fresh Stock'],
    cta: 'Order on Instamart',
  },
  {
    id: 'jiomart',
    name: 'JioMart',
    badge: 'Grocery & Essentials',
    badgeType: 'grocery',
    url: 'https://www.jiomart.com/products?brand=Fudcy+Foods',
    logo: '/images/platforms/jiomart.png',
    logoAlt: 'JioMart Logo',
    description: 'Explore and order Fudcy Foods retort-sealed curries and meals through JioMart’s wide grocery network.',
    highlights: ['Everyday Essentials', 'Reliable Delivery', 'Great Deals'],
    cta: 'Shop on JioMart',
  },
];

export default function AlsoAvailableSection() {
  return (
    <section className="also-available-section scroll-reveal" id="available-on">
      <div className="section-container">
        {/* Section Header */}
        <div className="section-header-centered">
          <span className="section-eyebrow">WHERE TO BUY</span>
          <div className="heading-row" style={{ justifyContent: 'center' }}>
            <h2 className="display-title">Also Available On</h2>
            <span className="heading-rule" aria-hidden="true" />
          </div>
          <p className="section-sub-caption">
            Prefer ordering from your favourite shopping app? Fudcy Foods ready-to-eat Kerala meals and curries are also available through verified marketplace partners across India.
          </p>
        </div>

        {/* Partners Grid / Mobile Cards */}
        <div className="partner-cards-grid">
          {PLATFORMS.map((platform) => (
            <article key={platform.id} className="partner-card">
              <div className="partner-card-top">
                <div className="partner-logo-box">
                  <img
                    src={platform.logo}
                    alt={platform.logoAlt}
                    className="partner-logo-img"
                    loading="lazy"
                  />
                </div>

                <div className="partner-title-group">
                  <span className={`partner-badge ${platform.badgeType}`}>
                    {platform.badge}
                  </span>
                  <h3 className="partner-name font-serif">{platform.name}</h3>
                </div>
              </div>

              <div className="partner-card-body">
                <p className="partner-desc">{platform.description}</p>

                <div className="partner-highlights-chips" aria-label={`${platform.name} features`}>
                  {platform.highlights.map((item, idx) => (
                    <span key={idx} className="partner-chip">
                      <CheckCircle2 size={12} className="highlight-check" />
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="partner-card-footer">
                <a
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="partner-cta-btn"
                  aria-label={`${platform.cta} (opens in new tab)`}
                >
                  <span>{platform.cta}</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
