import './Sidebar.css';
import { Home, Calendar, MessageSquare, User, LogOut, Bell, Compass, Settings} from 'lucide-react';
import iconLogo from '../assets/icons/icon-logo.svg';
import { useAuthContext } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

interface SidebarProps {
    itemAtivo: 'INICIO' | 'AULAS' | 'CHAT' | 'PERFIL' | 'CONFIGURACAO' | 'SOLICITACOES' | 'ANUNCIOS';
}

export function Sidebar({ itemAtivo }: SidebarProps) {
    const { tipoPerfil, clearToken } = useAuthContext();
    const navigate = useNavigate();

    function handleSair() {
        clearToken();
        navigate('/login');
    }

    return (
        <aside className="sidebar-container">
            <div className="sidebar-logo">
                <h1 className="logo-texto">
                    <img src={iconLogo} alt="Logo IDrive" className="icon-logo" />
                    IDrive
                </h1>
                <span style={{ fontSize: '12px', color: '#666', marginLeft: '45px' }}>
                    Portal do {tipoPerfil === 'INSTRUTOR' ? 'Instrutor' : 'Aluno'}
                </span>
            </div>

            <nav className="sidebar-nav">
                <Link to="/anuncios" className={`nav-item ${itemAtivo === 'INICIO' ? 'ativo' : ''}`}>
                    <Compass size={20} /> <span>Início</span>
                </Link>



                <Link to="/aulas" className={`nav-item ${itemAtivo === 'AULAS' ? 'ativo' : ''}`}>
                    <Calendar size={20} />
                    <span>{tipoPerfil === 'INSTRUTOR' ? 'Gerenciar Horários' : 'Minhas Aulas'}</span>
                </Link>

                <Link to="/chat" className={`nav-item ${itemAtivo === 'CHAT' ? 'ativo' : ''}`}>
                    <MessageSquare size={20} /> <span>Chat</span>
                </Link>

                {tipoPerfil === 'INSTRUTOR' && (
                    <Link to="/solicitacoes" className={`nav-item ${itemAtivo === 'SOLICITACOES' ? 'ativo' : ''}`}>
                        <Bell size={20} /> <span>Solicitações</span>
                    </Link>
                )}

                <Link to="/perfil" className={`nav-item ${itemAtivo === 'PERFIL' ? 'ativo' : ''}`}>
                    <User size={20} /> <span>Perfil</span>
                </Link>

                <Link to="#" className={`nav-item ${itemAtivo === 'PERFIL' ? 'ativo' : ''}`}>
                      <Settings size={20} /> <span>Configuração</span>
                </Link>

            </nav>

            <div className="sidebar-footer">
                <button className="btn-sair" onClick={handleSair} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                    <LogOut size={20} /> Sair
                </button>
            </div>
        </aside>
    );
}
