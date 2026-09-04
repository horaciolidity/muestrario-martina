import { useState } from 'react';
import { Header } from './components/Header';
import { ReferenceCard } from './components/ReferenceCard';
import { PerspectiveLab } from './components/PerspectiveLab';
import { mockData, categories } from './data/mockData';
import { useLocalStorage } from './hooks/useLocalStorage';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' | 'lab'
  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useLocalStorage('artmotive_favorites', []);

  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const filteredData = activeCategory === 'all' 
    ? mockData 
    : mockData.filter(item => item.category === activeCategory);

  return (
    <div className="app-container">
      <Header />
      
      <div className="main-tabs">
        <button 
          className={`tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          Referencias
        </button>
        <button 
          className={`tab-btn ${activeTab === 'lab' ? 'active' : ''}`}
          onClick={() => setActiveTab('lab')}
        >
          Laboratorio 3D
        </button>
      </div>

      <main>
        {activeTab === 'gallery' && (
          <>
            <div className="category-filters">
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
              <button 
                className={`filter-btn ${activeCategory === 'favorites' ? 'active' : ''}`}
                onClick={() => setActiveCategory('favorites')}
              >
                ★ Favoritos
              </button>
            </div>

            <div className="reference-grid">
              {activeCategory === 'favorites' ? (
                mockData.filter(item => favorites.includes(item.id)).length > 0 ? (
                  mockData
                    .filter(item => favorites.includes(item.id))
                    .map(item => (
                      <ReferenceCard 
                        key={item.id} 
                        item={item} 
                        isFavorite={true}
                        toggleFavorite={toggleFavorite}
                      />
                    ))
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>Aún no tienes favoritos guardados.</p>
                )
              ) : (
                filteredData.map(item => (
                  <ReferenceCard 
                    key={item.id} 
                    item={item} 
                    isFavorite={favorites.includes(item.id)}
                    toggleFavorite={toggleFavorite}
                  />
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'lab' && <PerspectiveLab />}
      </main>
    </div>
  );
}

export default App;
