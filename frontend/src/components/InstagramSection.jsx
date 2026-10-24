
import { useState, useEffect, useRef } from 'react';

/**
 * Official Instagram profile URL for Fudcy Foods.
 * Keep this easy to update in one place.
 */
export const INSTAGRAM_PROFILE_URL = 'https://www.instagram.com/fudcyfoods/';

/**
 * Curated product/food showcases from existing project assets.
 */
const INSTAGRAM_POSTS = [
  {
    id: 'post-1',
    name: 'Kerala Buffalo Meat Roast',
    tag: '#FudcyFoods #KeralaRoast',
    image: '/images/cutouts/buffalo-roast.png',
    alt: 'Kerala Buffalo Meat Roast in retort packaging'
  },
  {
    id: 'post-2',
    name: 'Kottayam Fish Vattichathu',
    tag: '#FudcyFoods #FishCurry',
    image: '/images/cutouts/fish-vattichathu.png',
    alt: 'Kottayam Fish Vattichathu ready meal pouch'
  },
  {
    id: 'post-3',
    name: 'Pepper Chicken Masala',
    tag: '#FudcyFoods #PepperChicken',
    image: '/images/cutouts/pepper-chicken.png',
    alt: 'Pepper Chicken Masala meal pack'
  },
  {
    id: 'post-4',
    name: 'Chicken Tikka Masala',
    tag: '#FudcyFoods #TikkaMasala',
    image: '/images/cutouts/tikka-masala.png',
    alt: 'Chicken Tikka Masala meal pack'
  }
];

function InstagramIcon({ size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function InstagramSection() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    // Check if already in viewport
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            obs.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: '0px 0px -40px 0px', threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`instagram-section scroll-reveal ${isVisible ? 'is-visible' : ''}`}
      id="instagram"
      aria-label="Instagram Feed"
    >
      <div className="section-container">
        <div className="instagram-header">
          <a
            href={INSTAGRAM_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="instagram-handle-badge"
            title="Visit @fudcyfoods on Instagram"
          >
            <InstagramIcon size={15} className="instagram-badge-icon" />
            <span>@fudcyfoods</span>
          </a>

          <h2 className="instagram-title">A Little Taste of Fudcy</h2>

          <p className="instagram-description">
            Follow us on Instagram for delicious snacks, product updates, and more!
          </p>
        </div>

        <div className="instagram-grid">
          {INSTAGRAM_POSTS.map((post) => (
            <a
              key={post.id}
              href={INSTAGRAM_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="instagram-card"
              title={`View ${post.name} on Instagram`}
            >
              <div className="instagram-image-wrap">
                <img
                  src={post.image}
                  alt={post.alt}
                  className="instagram-card-img"
                  loading="lazy"
                />
              </div>

              <div className="instagram-card-overlay" aria-hidden="true">
                <InstagramIcon size={26} className="instagram-overlay-icon" />
                <span className="instagram-card-dish">{post.name}</span>
                <span className="instagram-card-tag">{post.tag}</span>
              </div>
            </a>
          ))}
        </div>

        <div className="instagram-cta-wrap">
          <a
            href={INSTAGRAM_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="instagram-follow-btn"
          >
            <InstagramIcon size={18} />
            <span>Follow Us on Instagram</span>
          </a>
        </div>
      </div>
    </section>
  );
}
