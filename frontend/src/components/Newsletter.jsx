import React, { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';

export default function Newsletter({ onOpenContact }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    // Front-end only for now (same approach as the Contact modal): no backend endpoint exists yet.
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  }

  return (
    <section className="newsletter-section" id="newsletter">
      <div className="section-container">
        <h2 className="newsletter-title">
          <span className="newsletter-kicker">Subscribe Our</span>
          <span className="newsletter-giant">Newsletter</span>
        </h2>

        <div className="newsletter-panel">
          <img
            src="/images/cutouts/pepper-chicken.png"
            alt=""
            aria-hidden="true"
            className="newsletter-product"
          />

          <p className="newsletter-text">
            Join our newsletter for the latest updates on our ready-to-eat Kerala meals.
            Have questions or need assistance?{' '}
            <button type="button" className="newsletter-contact-link" onClick={onOpenContact}>
              Contact our friendly customer support team
            </button>
            .
          </p>

          {subscribed ? (
            <p className="newsletter-success" role="status">
              <CheckCircle size={16} />
              <span>Thanks for subscribing!</span>
            </p>
          ) : (
            <form className="newsletter-form" onSubmit={handleSubmit}>
              <input
                type="email"
                required
                placeholder="Enter Email Address"
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="newsletter-send" aria-label="Subscribe">
                <Send size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
