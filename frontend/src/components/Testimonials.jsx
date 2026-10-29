import React, { useState, useRef } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: 'Emmanuel Johny',
      role: 'Verified Customer',
      rating: 5,
      dish: 'Kerala Ready Meals',
      quote: 'Unwrapping this meal feels like opening a treasure chest of authentic Kerala flavours. The aroma and taste instantly remind me of home-cooked food.'
    },
    {
      id: 2,
      name: 'Mary Thomas',
      role: 'Verified Customer',
      rating: 5,
      dish: 'Koorka Buffalo Meat Mix',
      quote: 'We enjoyed the delicious traditional buffalo meat curry. The tender meat, rich spice profile, and convenient preparation make it a regular at our house.'
    },
    {
      id: 3,
      name: 'Sandra K S',
      role: 'Verified Customer',
      rating: 5,
      dish: 'Kerala Buffalo Meat Roast',
      quote: 'I had the Fudcy Foods Kerala Buffalo Meat Roast — it is bursting with authentic spices, deeply satisfying, and remarkably convenient for busy workdays.'
    }
  ];

  const carouselRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Sync active indicator as user swipes or scrolls on mobile
  const handleScroll = () => {
    const container = carouselRef.current;
    if (!container) return;

    const cards = container.querySelectorAll('.testimonial-card');
    if (!cards || cards.length === 0) return;

    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    cards.forEach((card, idx) => {
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const distance = Math.abs(containerCenter - cardCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx;
      }
    });

    setActiveIndex(closestIndex);
  };

  const scrollToReview = (idx) => {
    const container = carouselRef.current;
    if (!container) return;

    const cards = container.querySelectorAll('.testimonial-card');
    if (cards[idx]) {
      const card = cards[idx];
      const targetScroll = card.offsetLeft - (container.clientWidth - card.clientWidth) / 2;
      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth'
      });
      setActiveIndex(idx);
    }
  };

  return (
    <section className="testimonials-section scroll-reveal" id="testimonials">
      <div className="section-container">
        <div className="heading-row">
          <h2 className="display-title">Loved by Busy Food Lovers</h2>
          <span className="heading-rule" aria-hidden="true" />
        </div>
        <p className="section-subtitle">
          Authentic customer reviews from our community across India.
        </p>

        {/* Customer Reviews: 3-column Grid on Desktop, Swipeable Carousel on Mobile */}
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          className="testimonials-grid testimonials-carousel"
          role="region"
          aria-label="Customer Reviews Carousel"
        >
          {testimonials.map((t, idx) => (
            <article
              key={t.id}
              className={`testimonial-card ${activeIndex === idx ? 'is-active-slide' : ''}`}
            >
              <div className="testimonial-card-header">
                <div className="rating-stars-badge">
                  <div className="rating-stars" aria-label={`${t.rating} out of 5 stars`}>
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={15} fill="#F08A24" color="#F08A24" />
                    ))}
                  </div>
                  <span className="rating-score-num">5.0</span>
                </div>
                <div className="quote-icon-wrap" aria-hidden="true">
                  <Quote size={15} />
                </div>
              </div>

              <p className="testimonial-quote">“{t.quote}”</p>

              <div className="testimonial-dish-tag">
                <span className="dish-pill-badge">{t.dish}</span>
              </div>

              <div className="testimonial-author">
                <div className="author-avatar-initials">
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="author-info">
                  <div className="author-name-row">
                    <h4 className="author-name">{t.name}</h4>
                    <span className="verified-badge">
                      <CheckCircle2 size={12} className="verified-icon" />
                      <span>Verified</span>
                    </span>
                  </div>
                  <span className="author-meta">{t.role}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Mobile-Only Carousel Controls (Arrows + Pagination Dots) */}
        <div className="testimonials-mobile-controls" aria-label="Customer reviews carousel pagination">
          <button
            type="button"
            className="review-arrow-btn prev"
            onClick={() => scrollToReview(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
            aria-label="Previous review"
          >
            <ChevronLeft size={17} />
          </button>

          <div className="review-dots-wrap" role="tablist" aria-label="Review indicators">
            {testimonials.map((t, idx) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={activeIndex === idx}
                aria-label={`View review ${idx + 1} from ${t.name}`}
                className={`review-dot-btn ${activeIndex === idx ? 'active' : ''}`}
                onClick={() => scrollToReview(idx)}
              />
            ))}
          </div>

          <button
            type="button"
            className="review-arrow-btn next"
            onClick={() => scrollToReview(Math.min(testimonials.length - 1, activeIndex + 1))}
            disabled={activeIndex === testimonials.length - 1}
            aria-label="Next review"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </section>
  );
}
