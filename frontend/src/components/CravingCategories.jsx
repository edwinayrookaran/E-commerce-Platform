import { CATEGORIES } from '../catalogHelper';

export default function CravingCategories({ onSelectCategory, selectedCategory }) {
  // Filter out 'All' for the 6 official craving cards
  const cravingCategories = CATEGORIES.filter(c => c.id !== 'All');

  return (
    <section className="craving-section scroll-reveal" id="categories">
      <div className="section-container">
        <div className="heading-row">
          <h2 className="display-title">What Are You Craving?</h2>
          <span className="heading-rule" aria-hidden="true" />
        </div>
        <p className="section-subtitle">
          Explore our range of delicious ready-to-eat meals.
        </p>

        <div className="craving-grid">
          {cravingCategories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <div
                key={cat.id}
                className={`craving-card ${isSelected ? 'active-category-card' : ''}`}
                onClick={() => {
                  onSelectCategory(cat.id);
                  const el = document.getElementById('catalogue');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <div className="craving-image-wrap">
                  <img
                    src={cat.image}
                    alt={cat.displayName}
                    className="craving-image"
                    loading="lazy"
                  />
                  <div className="craving-count-badge">
                    {cat.count} {cat.count === 1 ? 'Dish' : 'Dishes'}
                  </div>
                </div>

                <div className="craving-info">
                  <h3 className="craving-name">{cat.displayName}</h3>
                  <p className="craving-tagline">{cat.tagline}</p>
                  <span className="craving-link">
                    <span>Explore category</span>
                    <span className="arrow-line" aria-hidden="true" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
