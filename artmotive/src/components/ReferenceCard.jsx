import { useState } from 'react';

export function ReferenceCard({ item, isFavorite, toggleFavorite }) {
  return (
    <div className="ref-card">
      <div className="img-container">
        <img src={item.image} alt={item.title} />
      </div>
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{item.title}</h3>
          <button 
            className={`fav-btn ${isFavorite ? 'active' : ''}`}
            onClick={() => toggleFavorite(item.id)}
            title="Marcar como favorito"
          >
            {isFavorite ? '★' : '☆'}
          </button>
        </div>
        <p className="card-explanation">{item.explanation}</p>
        <span className="category-tag">{item.category}</span>
      </div>
    </div>
  );
}
