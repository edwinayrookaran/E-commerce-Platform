import { ShieldCheck, HeartHandshake } from 'lucide-react';

export default function BrandStory({ onExploreMeals }) {
  return (
    <section className="brand-story-section scroll-reveal" id="story">
      <div className="section-container">
        <div className="heading-row">
          <h2 className="display-title story-heading">
            Authentic Taste of Home, Crafted for Modern Life
          </h2>
          <span className="heading-rule" aria-hidden="true" />
        </div>

        {/* 1. Our story: text left, image right */}
        <div className="story-row">
          <div className="story-text">
            <h3 className="story-step-title">1. Our Story</h3>
            <p>
              At <strong>Fudcy Foods</strong>, we believe delicious home-style food shouldn’t take hours of cooking or complex prep work. We bring Kerala's rich culinary tradition straight to your dining table with authentic ready-to-eat meals made for busy days and quick cravings.
            </p>
            <p>
              Using advanced <strong>retort packaging technology</strong>, each meal is cooked and sealed to preserve its natural aromas, vibrant spices, and wholesome texture — <strong>with no refrigeration required</strong>.
            </p>
          </div>

          <span className="story-arrow story-arrow-left" aria-hidden="true" />

          <figure className="story-tile">
            <img
              src="/images/products/fish-vattichathu-200g-front.webp"
              alt="Fish Vattichathu Ready Meal"
              className="story-pouch-preview"
              loading="lazy"
            />
            <figcaption>
              <strong>Retort Packaging</strong>
              <small>Fresh flavour locked in naturally</small>
            </figcaption>
          </figure>
        </div>

        {/* 2. Recipes & care: image left, text right */}
        <div className="story-row story-row-reverse">
          <figure className="story-tile story-tile-wide">
            <img
              src="/images/brand/hero-banner.webp"
              alt="Kerala traditional cooking feast"
              className="story-main-img"
              loading="lazy"
            />
            <figcaption>
              <strong>Kerala Inspired</strong>
              <small>Ready When You Are</small>
            </figcaption>
          </figure>

          <span className="story-arrow story-arrow-right" aria-hidden="true" />

          <div className="story-text">
            <h3 className="story-step-title">2. Craft &amp; Care</h3>
            <p>
              Whether it's the fiery tang of Fish Vattichathu, the slow-roasted richness of Kerala Buffalo Meat Roast, or comforting Paal Kappa, we make authentic food accessible anytime you're hungry for something genuine.
            </p>

            <div className="story-values-list">
              <div className="story-val-item">
                <div className="val-icon-wrap">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <strong>Utmost Hygiene &amp; Care</strong>
                  <span>Prepared in state-of-the-art facilities following strict food quality standards.</span>
                </div>
              </div>

              <div className="story-val-item">
                <div className="val-icon-wrap">
                  <HeartHandshake size={16} />
                </div>
                <div>
                  <strong>Time-Honoured Recipes</strong>
                  <span>Traditional cooking methods passed down through generations.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="story-action-row">
          <button
            type="button"
            className="pill-btn-black"
            onClick={onExploreMeals}
          >
            Explore the Catalogue
          </button>
        </div>
      </div>
    </section>
  );
}
