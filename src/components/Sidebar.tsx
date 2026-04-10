import './Sidebar.css';
import { Home, Calendar, MessageSquare, User, Settings, LogOut } from 'lucide-react';
import iconLogo from '../assets/icons/icon-logo.svg';

interface SidebarProps {
  itemAtivo: 'INICIO' | 'AULAS' | 'CHAT' | 'PERFIL' | 'CONFIGURACAO';
}

export function Sidebar({ itemAtivo }: SidebarProps) {
  return (
    <aside className="sidebar-container">
      <div className="sidebar-logo">
        <h1 className="logo-texto">
        <img src={iconLogo} alt="Logo IDrive" className="icon-logo" />
             IDrive
        </h1>
      </div>

      <nav className="sidebar-nav">

        <a href="#" className={`nav-item ${itemAtivo === 'INICIO' ? 'ativo' : ''}`}>
          <Home size={20} />
          <span>Início</span>
        </a>

        <a href="#" className={`nav-item ${itemAtivo === 'AULAS' ? 'ativo' : ''}`}>
          <Calendar size={20} />
          <span>Minhas Aulas</span>
        </a>

        <a href="#" className={`nav-item ${itemAtivo === 'CHAT' ? 'ativo' : ''}`}>
          <MessageSquare size={20} />
          <span>Chat</span>
        </a>

        <a href="#" className={`nav-item ${itemAtivo === 'PERFIL' ? 'ativo' : ''}`}>
          <User size={20} />
          <span>Perfil</span>
        </a>

        <a href="#" className={`nav-item ${itemAtivo === 'CONFIGURACAO' ? 'ativo' : ''}`}>
          <Settings size={20} />
          <span>Configuração</span>
        </a>
      </nav>

      <div className="sidebar-footer">
        <div className="usuario-info">
          <div className="avatar-placeholder">JS</div>
          <div className="usuario-textos">
            <strong>João Silva</strong>
            <span>joao@email.com</span>
          </div>
        </div>
        <button className="btn-sair" title="Sair da conta">
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
}