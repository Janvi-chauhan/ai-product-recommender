
import { useEffect, useState } from "react";
import {
  Sparkles,
  Search,
  Star,
  ArrowRight,
  ShoppingBag,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

fetch(`${API_URL}/api/products`);

const EXAMPLES = [
  "A phone under $500 with a great camera",
  "Headphones under $200 for music",
  "A tablet for reading and watching videos",
];

function ProductCard({ product, reason, recommended }) {
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
        {recommended && (
          <span className="recommend-badge">
            <Sparkles size={13} />
            AI Pick
          </span>
        )}
      </div>

      <div className="product-details">
        <span className="product-category">{product.category}</span>
        <h3>{product.name}</h3>
        <p className="product-description">{product.description}</p>

        <div className="product-meta">
          <span className="rating">
            <Star size={15} fill="currentColor" />
            {product.rating}
          </span>
          <span className="product-price">
            ${product.price.toLocaleString("en-US")}
          </span>
        </div>

        {reason && <p className="recommend-reason">{reason}</p>}
      </div>
    </article>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [preferences, setPreferences] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch(`${API_URL}/products`);

        if (!response.ok) {
          throw new Error("Could not load products.");
        }

        setProducts(await response.json());
      } catch {
        setError(
          "Unable to connect to the server. Please check that the backend is running."
        );
      }
    }

    loadProducts();
  }, []);

  async function handleRecommend(event) {
    event.preventDefault();

    const query = preferences.trim();

    if (!query || loading) return;

    setLoading(true);
    setError("");
    setMessage("");
    setRecommendations([]);
    setHasSearched(true);

    try {
      const response = await fetch(`${API_URL}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: query }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Recommendation failed.");
      }

      // Only display catalog products returned by the backend.
      const productMap = new Map(
        products.map((product) => [product.id, product])
      );

      const matched = data.recommendations
        .filter((item) => productMap.has(item.id))
        .map((item) => ({
          ...productMap.get(item.id),
          reason: item.reason,
        }));

      setRecommendations(matched);
      setMessage(data.message);
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function resetSearch() {
    setPreferences("");
    setRecommendations([]);
    setMessage("");
    setError("");
    setHasSearched(false);
  }

  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#" aria-label="PickWise home">
          <span className="brand-icon">
            <ShoppingBag size={22} />
          </span>
          <span>PickWise<span className="brand-dot">.</span></span>
        </a>

        <a className="nav-link" href="#products">
          Explore products
          <ArrowRight size={15} />
        </a>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <div className="eyebrow">
              <Sparkles size={15} />
              YOUR PERSONAL AI SHOPPING ASSISTANT
            </div>

            <h1>
              Find what you need.
              <br />
              <span>Love what you choose.</span>
            </h1>

            <p className="hero-description">
              Tell us what you are looking for, your budget,
              and what matters most. Let AI help you find the
              right product.
            </p>

            <form className="search-form" onSubmit={handleRecommend}>
              <label htmlFor="preferences" className="sr-only">
                Describe the product you want
              </label>

              <Search className="search-icon" size={21} />

              <textarea
                id="preferences"
                value={preferences}
                onChange={(event) =>
                  setPreferences(event.target.value.slice(0, 500))
                }
                placeholder="e.g. I need a phone under $500 with a good camera..."
                rows={2}
                maxLength={500}
                required
              />

              <button
                type="submit"
                className="recommend-button"
                disabled={loading || !preferences.trim()}
              >
                {loading ? (
                  <>
                    <LoaderCircle size={18} className="spin" />
                    Finding...
                  </>
                ) : (
                  <>
                    Find my match
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <div className="example-prompts">
              <span>Try:</span>
              {EXAMPLES.map((example) => (
                <button
                  type="button"
                  key={example}
                  className="example-chip"
                  onClick={() => setPreferences(example)}
                >
                  {example}
                </button>
              ))}
            </div>

            <p className="privacy-note">
              <Sparkles size={13} />
              Personalized suggestions, selected from our catalog.
            </p>
          </div>
        </section>

        <section className="catalog-section" id="products">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                {hasSearched ? "YOUR RESULTS" : "THE COLLECTION"}
              </span>
              <h2>
                {hasSearched ? "Your recommendations" : "Explore products"}
              </h2>
              <p>
                {hasSearched
                  ? "Products selected to match your preferences."
                  : "Discover products for your everyday needs."}
              </p>
            </div>

            {hasSearched && (
              <button className="reset-button" onClick={resetSearch}>
                <RotateCcw size={15} />
                View all products
              </button>
            )}
          </div>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          {loading && (
            <div className="loading-message" role="status">
              <LoaderCircle className="spin" size={24} />
              <span>Finding the best products for you...</span>
            </div>
          )}

          {!loading && !error && hasSearched && (
            <div className="result-message" aria-live="polite">
              <div className="result-icon">
                <Sparkles size={19} />
              </div>
              <div>
                <strong>
                  {recommendations.length
                    ? "Your AI shopping guide"
                    : "No matching products found"}
                </strong>
                <p>
                  {message ||
                    "Try adjusting your budget or product preferences."}
                </p>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="product-grid">
              {(hasSearched
                ? recommendations
                : products
              ).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  reason={hasSearched ? product.reason : ""}
                  recommended={hasSearched}
                />
              ))}
            </div>
          )}

          {!loading &&
            !error &&
            !hasSearched &&
            products.length === 0 && (
              <p className="empty-message">Loading your catalog...</p>
            )}
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#">
          <ShoppingBag size={19} />
          <span>PickWise<span className="brand-dot">.</span></span>
        </a>
        <p>Smarter choices, made simple.</p>
        <span>AI Product Recommendation Assessment</span>
      </footer>
    </div>
  );
}

export default App;
