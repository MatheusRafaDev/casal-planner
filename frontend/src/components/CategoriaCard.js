import React, { useState } from 'react';
import Item from './Item';
import './CategoriaCard.css';

const CategoriaCard = ({ 
  categoria, 
  itens, 
  onAddItem, 
  onUpdateItem, 
  onDeleteItem,
  onDeleteCategoria,
  onMoveItem 
}) => {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const itemId = e.dataTransfer.getData('itemId');
    if (itemId) {
      onMoveItem(itemId, categoria.id);
    }
  };

  return (
    <div className="categoria-card">
      <div 
        className="card-header" 
        style={{ 
          backgroundColor: categoria.bg,
          color: categoria.text
        }}
      >
        <span className="card-title">{categoria.nome}</span>
        <span className="item-count">{itens.length} itens</span>
        {!categoria.isPadrao && (
          <button 
            className="btn-delete-categoria"
            onClick={() => onDeleteCategoria(categoria.id)}
            title="Remover categoria"
          >
            🗑️
          </button>
        )}
      </div>
      
      <div 
        className={`card-items ${dragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {itens.length === 0 ? (
          <div className="empty-message">Nenhum item ainda</div>
        ) : (
          itens.map(item => (
            <Item
              key={item.id}
              item={item}
              onUpdate={onUpdateItem}
              onDelete={onDeleteItem}
            />
          ))
        )}
      </div>
      
      <div className="card-footer">
        <button 
          className="btn-add-item"
          onClick={() => onAddItem(categoria.id)}
        >
          ➕ Adicionar item
        </button>
      </div>
    </div>
  );
};

export default CategoriaCard;