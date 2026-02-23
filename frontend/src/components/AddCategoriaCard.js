import React from 'react';
import './AddCategoriaCard.css';

const AddCategoriaCard = ({ onClick }) => {
  return (
    <div className="add-categoria-card" onClick={onClick}>
      <div className="add-icon">➕</div>
      <div className="add-text">Nova Categoria</div>
      <div className="add-subtext">Clique para criar</div>
    </div>
  );
};

export default AddCategoriaCard;