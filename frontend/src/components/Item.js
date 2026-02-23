import React, { useState } from 'react';
import './Item.css';

const Item = ({ item, onUpdate, onDelete }) => {
  const [dragging, setDragging] = useState(false);

  const handleDragStart = (e) => {
    setDragging(true);
    e.dataTransfer.setData('itemId', item.id);
  };

  const handleDragEnd = () => {
    setDragging(false);
  };

  const handleCheckboxChange = () => {
    onUpdate(item.id, { comprado: !item.comprado });
  };

  const formatarPreco = (valor) => {
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div 
      className={`item ${item.comprado ? 'item-comprado' : ''} ${dragging ? 'dragging' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <input
        type="checkbox"
        className="item-checkbox"
        checked={item.comprado}
        onChange={handleCheckboxChange}
      />
      
      <div className="item-info">
        <span className="item-nome">{item.nome}</span>
        <div className="item-detalhes">
          {item.marca && <span className="item-marca">{item.marca}</span>}
          <span className="item-preco">R$ {formatarPreco(item.preco)}</span>
          <span className="item-qtd">{item.quantidade} {item.quantidade === 1 ? 'un' : 'uns'}</span>
          <span className={`pagamento-badge ${item.pagamento}`}>
            {item.pagamento === 'vr' ? '🍽️ VR' : '💵'}
          </span>
        </div>
      </div>
      
      <div className="item-actions">
        <button 
          className="btn-icon-small"
          onClick={() => onUpdate(item.id, { edit: true })}
          title="Editar"
        >
          ✏️
        </button>
        <button 
          className="btn-icon-small"
          onClick={() => onDelete(item.id)}
          title="Remover"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default Item;