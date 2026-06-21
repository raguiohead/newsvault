import React from 'react';

export default function AboutModal({ onClose }) {
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
          maxWidth: '500px',
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

        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--text-primary)' }}>Sobre o NewsVault</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
          O NewsVault é um aplicativo 100% focado na privacidade para catalogar e ler newsletters em PDF, processando tudo localmente no seu navegador utilizando IndexedDB. Nenhuma informação é enviada para a nuvem.
        </p>

        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-primary)' }}>Desenvolvedor</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Criado por Guilherme Pereira.
            <br />
            <a
              href="https://github.com/raguiohead"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 'bold' }}
            >
              Visite meu perfil no GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
