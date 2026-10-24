import React from 'react';

export default function ConvenienceSection() {
  const features = [
    {
      title: 'Ready in Minutes',
      image: '/images/features/ready-in-minutes.webp',
      description: 'Quick lunches, late dinners, and busy workdays — warm up delicious authentic food in minutes without cooking hassle.'
    },
    {
      title: 'No Refrigeration Required',
      image: '/images/features/no-refrigeration.webp',
      description: 'Advanced retort packaging keeps meals safely fresh at room temperature until opened. Perfect for pantry storage and travel.'
    },
    {
      title: 'Authentic Flavours',
      image: '/images/features/authentic-flavours.webp',
      description: 'Crafted with traditional Kerala spices, roasted coconut, and native culinary heritage that tastes just like homemade food.'
    },
    {
      title: 'Made with Care',
      image: '/images/features/made-with-care.webp',
      description: 'Every recipe is cooked with premium ingredients, strict hygiene, and thoughtful care from our kitchen to your table.'
    }
  ];

  return (
    <section className="convenience-section" id="convenience">
      <div className="section-container">
        <div className="heading-row">
          <h2 className="display-title">Why Choose Us</h2>
          <span className="heading-rule" aria-hidden="true" />
        </div>
        <p className="section-subtitle">
          Authentic food crafted for real everyday life without compromising on taste.
        </p>

        <div className="why-grid">
          <div className="why-photo">
            <img
              src="/images/brand/hero-banner.webp"
              alt="Fudcy ready-to-eat Kerala meals"
              loading="lazy"
            />
          </div>

          <div className="convenience-grid">
            {features.map((feat) => (
              <div key={feat.title} className="convenience-card">
                <div className="convenience-img-box">
                  <img
                    src={feat.image}
                    alt=""
                    className="convenience-icon-img"
                    loading="lazy"
                  />
                </div>
                <h3 className="convenience-card-title">{feat.title}</h3>
                <p className="convenience-card-desc">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
