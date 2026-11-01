function Hero({ onExplore }) {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-badge">
          ✨ Freshly prepared
        </div>

        <h2>
          Good food,
          <br />
          <span>good mood.</span>
        </h2>

        <p>
          Deliciously comforting food, freshly prepared
          and served with love.
        </p>

        <button className="primary-button" onClick={onExplore}>
          Explore Menu
        </button>
      </div>

      <div className="hero-food">
        <div className="hero-circle">
          🫓
        </div>

        <div className="floating-card card-one">
          <span>🔥</span>
          Fresh
        </div>

        <div className="floating-card card-two">
          <span>❤️</span>
          Made with love
        </div>
      </div>
    </section>
  );
}

export default Hero;