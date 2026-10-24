import { Star, Quote } from 'lucide-react';

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

        <div className="testimonials-grid">
          {testimonials.map((t) => (
            <div key={t.id} className="testimonial-card">
              <div className="quote-icon-wrap">
                <Quote size={18} />
              </div>

              <div className="rating-stars" aria-label={`${t.rating} out of 5 stars`}>
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="#F08A24" color="#F08A24" />
                ))}
              </div>

              <p className="testimonial-quote">“{t.quote}”</p>

              <div className="testimonial-author">
                <div className="author-avatar-initials">
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="author-name">{t.name}</h4>
                  <span className="author-meta">{t.role} • {t.dish}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
