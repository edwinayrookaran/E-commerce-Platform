import React from 'react';
import { ArrowRight, Clock, ShieldCheck, Flame } from 'lucide-react';

export default function Hero({ onShopClick, onExploreClick, onSelectCategory }) {
  function pickCategory(catId) {
    if (onSelectCategory) onSelectCategory(catId);
    else if (onShopClick) onShopClick();
  }

  return (
    <section className="stool-hero" id="home">
      <h1 className="hero-headline">
        <span className="hero-kicker">Authentic Food. Ready for Real life</span>
        <span className="hero-giant">FUDCY FOODS</span>
      </h1>

      <div className="hero-stage">
        {/* Left: intro copy + category tags */}
        <div className="hero-left">
          <p className="hero-subtext">
            Delicious ready-to-eat meals made for busy days, quick lunches, and
            whenever you&rsquo;re hungry for something good.
          </p>

          <div className="hero-tags">
            <button type="button" className="hero-tag" onClick={() => pickCategory('VEG')}>
              Veg specialties
            </button>
            <button type="button" className="hero-tag" onClick={() => pickCategory('CHICKEN')}>
              Chicken meals
            </button>
            <button type="button" className="hero-tag" onClick={() => pickCategory('FISH & PRAWNS')}>
              Fish &amp; prawns
            </button>
            <img
              src="/images/cutouts/fish-vattichathu.png"
              alt=""
              aria-hidden="true"
              className="hero-tilted-pouch"
            />
          </div>
        </div>

        {/* Centre: featured product on a soft circle */}
        <div className="hero-center">
          <div className="hero-circle" aria-hidden="true" />
          <img
            src="/images/cutouts/buffalo-roast.png"
            alt="Kerala Buffalo Meat Roast 200g"
            className="hero-product"
            fetchPriority="high"
          />
        </div>

        {/* Right: yellow arch + collection blurb */}
        <div className="hero-right">
          <div className="hero-arch">
            <span className="hero-arch-badge">20% off launch sale</span>
            <img
              src="/images/cutouts/tikka-masala.png"
              alt="Chicken Tikka Masala 200g"
              className="hero-arch-img"
            />
          </div>

          <div className="hero-collection-info">
            <h3 className="hero-collection-title">Explore our collection</h3>
            <p className="hero-collection-text">
              Slow-cooked with Tellicherry black pepper, caramelised shallots &amp;
              toasted coconut &mdash; our top pick, Kerala Buffalo Meat Roast 200g, is{' '}
              <strong>₹232.00</strong> <del>₹290.00</del>.
            </p>
            <button type="button" className="hero-outline-btn" onClick={onExploreClick}>
              <span>Explore Fudcy</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="hero-cta">
        <button type="button" className="pill-btn-black hero-order-btn" onClick={onShopClick}>
          Order Now
        </button>

        <ul className="hero-trust">
          <li>
            <Clock size={15} />
            <span>Ready in 3–5 mins</span>
          </li>
          <li>
            <ShieldCheck size={15} />
            <span>No refrigeration needed</span>
          </li>
          <li>
            <Flame size={15} />
            <span>Authentic spices</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
