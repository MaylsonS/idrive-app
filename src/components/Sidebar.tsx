// src/components/Sidebar.tsx
import './Sidebar.css';
import { Home, Calendar, MessageSquare, User, Settings, LogOut, Bell } from 'lucide-react';
import iconLogo from '../assets/icons/icon-logo.svg';

interface SidebarProps {
  itemAtivo: 'INICIO' | 'AULAS' | 'CHAT' | 'PERFIL' | 'CONFIGURACAO' | 'SOLICITACOES';
  perfilUsuario: 'ALUNO' | 'INSTRUTOR';
}

export function Sidebar({ itemAtivo, perfilUsuario }: SidebarProps) {
  return (
    <aside className="sidebar-container">
      <div className="sidebar-logo">
        <h1 className="logo-texto">
          <img src={iconLogo} alt="Logo IDrive" className="icon-logo" />
          IDrive
        </h1>
        <span style={{ fontSize: '12px', color: '#666', marginLeft: '45px' }}>
          Portal do {perfilUsuario === 'INSTRUTOR' ? 'Instrutor' : 'Aluno'}
        </span>
      </div>

      <nav className="sidebar-nav">
        <a href="#" className={`nav-item ${itemAtivo === 'INICIO' ? 'ativo' : ''}`}>
          <Home size={20} /> <span>Início</span>
        </a>

        <a href="#" className={`nav-item ${itemAtivo === 'AULAS' ? 'ativo' : ''}`}>
          <Calendar size={20} />
          <span>{perfilUsuario === 'INSTRUTOR' ? 'Gerenciar Horários' : 'Minhas Aulas'}</span>
        </a>

        <a href="#" className={`nav-item ${itemAtivo === 'CHAT' ? 'ativo' : ''}`}>
          <MessageSquare size={20} /> <span>Chat</span>
        </a>

        {perfilUsuario === 'INSTRUTOR' && (
          <a href="#" className={`nav-item ${itemAtivo === 'SOLICITACOES' ? 'ativo' : ''}`}>
            <Bell size={20} /> <span>Solicitações</span>
          </a>
        )}

        <a href="#" className={`nav-item ${itemAtivo === 'PERFIL' ? 'ativo' : ''}`}>
          <User size={20} /> <span>Perfil</span>
        </a>
      </nav>

      <div className="sidebar-footer">
        <button className="btn-sair" title="Sair da conta" style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
          <LogOut size={20} /> Sair
        </button>
      </div>
    </aside>
  );
}