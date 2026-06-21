import React from 'react';

export default function SettingsModal({ onClose, theme, setTheme, bg, setBg, onClearDatabase }) {
  return (
    <div className="drawer-overlay" onClick={onClose} style={{ zIndex: 300, justifyContent: 'center', alignItems: 'center' }}>
      <div 
        className="about-modal"
        onClick={(e) => e.stopPropagation()} 
        style={{
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          width: '90%',
          maxWidth: '450px',
          boxShadow: 'var(--shadow-drawer)',
          position: 'relative'
        }}
      >
        <button 
          className="drawer-close-btn" 
          onClick={onClose} 
          style={{ position: 'absolute', top: '16px', right: '16px' }}
          aria-label="Fechar"
        >
          &times;
        </button>

        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: 'var(--text-primary)' }}>Configurações</h2>
        
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--text-primary)' }}>Aparência</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Tema:</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={`view-toggle-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                Escuro
              </button>
              <button 
                className={`view-toggle-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
              >
                Claro
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Plano de Fundo:</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button 
                className={`view-toggle-btn ${bg === 'default' ? 'active' : ''}`}
                onClick={() => setBg('default')}
              >
                Padrão (Glow)
              </button>
              <button 
                className={`view-toggle-btn ${bg === 'grid' ? 'active' : ''}`}
                onClick={() => setBg('grid')}
              >
                Grid
              </button>
              <button 
                className={`view-toggle-btn ${bg === 'dots' ? 'active' : ''}`}
                onClick={() => setBg('dots')}
              >
                Pontos
              </button>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--danger)' }}>Zona de Perigo</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Isso apagará permanentemente todos os artigos e dados armazenados no seu navegador. Você precisará importar tudo novamente.
          </p>
          <button 
            onClick={() => {
              if (confirm('Atenção: Isso apagará TODOS os artigos e dados. Tem certeza que deseja continuar?')) {
                onClearDatabase();
                onClose();
              }
            }}
            style={{
              background: 'rgba(255, 59, 48, 0.1)',
              color: 'var(--danger)',
              border: '1px solid rgba(255, 59, 48, 0.2)',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Limpar Toda a Base de Dados
          </button>
        </div>
      </div>
    </div>
  );
}
