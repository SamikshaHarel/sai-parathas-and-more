function CategoryTabs({ categories, activeCategory, onCategoryChange }) {
  return (
    <div className="category-wrapper">
      <div className="category-tabs">
        {categories.map((category) => (
          <button
            key={category}
            className={
              activeCategory === category
                ? "category-tab active"
                : "category-tab"
            }
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategoryTabs;