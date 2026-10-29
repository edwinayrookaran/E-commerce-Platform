import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import CravingCategories from '../components/CravingCategories';
import FudcyFavourites from '../components/FudcyFavourites';
import ConvenienceSection from '../components/ConvenienceSection';
import BrandStory from '../components/BrandStory';
import Testimonials from '../components/Testimonials';
import AlsoAvailableSection from '../components/AlsoAvailableSection';
import TrustBanner from '../components/TrustBanner';
import { useShop } from '../context/ShopContext';

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    products,
    cart,
    addToCart,
    setQuickViewProduct
  } = useShop();

  // Scroll reveal observer for entrance animations
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const elements = document.querySelectorAll('.scroll-reveal');

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      elements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: '0px 0px -40px 0px', threshold: 0.1 }
    );

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('is-visible');
      } else {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  // Handle navigating to Our Story section smoothly from any route or direct link
  useEffect(() => {
    if (location.hash === '#story' || location.state?.scrollTo === 'story') {
      const scrollToStory = (attempts = 0) => {
        const el = document.getElementById('story');
        if (el) {
          const header = document.querySelector('.site-header');
          const headerHeight = header ? header.offsetHeight : 70;
          const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = Math.max(0, elementPosition - headerHeight - 16);

          window.scrollTo({
            top: offsetPosition,
            behavior: attempts === 0 ? 'smooth' : 'auto',
          });
        } else if (attempts < 8) {
          setTimeout(() => scrollToStory(attempts + 1), 60);
        }
      };

      const timer = setTimeout(() => {
        scrollToStory(0);
      }, 80);

      return () => clearTimeout(timer);
    }
  }, [location.hash, location.state]);

  const handleHeroExplore = () => {
    const el = document.getElementById('story');
    if (el) {
      const header = document.querySelector('.site-header');
      const headerHeight = header ? header.offsetHeight : 70;
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = Math.max(0, elementPosition - headerHeight - 16);
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Hero Banner */}
      <Hero
        onShopClick={() => navigate('/shop')}
        onExploreClick={handleHeroExplore}
        onSelectCategory={(catId) => {
          navigate(`/shop?category=${encodeURIComponent(catId)}`);
        }}
      />

      {/* Craving Categories */}
      <CravingCategories
        onSelectCategory={(catId) => {
          navigate(`/shop?category=${encodeURIComponent(catId)}`);
        }}
        selectedCategory="All"
      />

      {/* Fudcy Favourites (Top 4 Featured Showcase) */}
      <FudcyFavourites
        products={products}
        onAddToCart={addToCart}
        onQuickView={(p) => setQuickViewProduct(p)}
        cart={cart}
        onViewAll={() => navigate('/shop')}
      />

      {/* Brand Story (Our Story Section) */}
      <BrandStory
        onExploreMeals={() => navigate('/shop')}
      />

      {/* Convenience Highlights */}
      <ConvenienceSection />

      {/* Customer Testimonials */}
      <Testimonials />

      {/* Also Available On Section (Amazon, Swiggy Instamart, JioMart) */}
      <AlsoAvailableSection />

      {/* Trust & Features Banner */}
      <TrustBanner onTrackOrderClick={() => navigate('/track-order')} />
    </>
  );
}
