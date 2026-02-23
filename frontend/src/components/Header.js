import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Header.css';

const Header = ({ onExport, onImport }) => {
  const { usuario, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const fileInputRef = React.useRef();

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImport(file);
    }
  };

  return (
    <header className="header">
      <div className="titulo">
        <h1>CasalPlanner</h1>
        <p>olá, {usuario?.nome} • organizando o lar a dois</p>
      </div>
      <div className="header-actions">
        <button className="btn-icon" onClick={toggleTheme}>
          {darkMode ? '☀️' : '🌓'}
        </button>
        <button className="btn-icon" onClick={onExport}>
          📥 Exportar
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          style={{ display: 'none' }}
        />
        <button className="btn-icon" onClick={handleImportClick}>
          📤 Importar
        </button>
        <button className="btn-icon" onClick={logout}>
          🚪 Sair
        </button>
      </div>
    </header>
  );
};

export default Header;