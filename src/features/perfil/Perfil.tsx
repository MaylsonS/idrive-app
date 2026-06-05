import { Sidebar } from '../../components/Sidebar';
import { useAuthContext } from '../../contexts/AuthContext';
import { Edit2, Mail, Phone, FileText, Star } from 'lucide-react';
import './Perfil.css';

export default function Perfil() {
  const { tipoPerfil } = useAuthContext();
  const isAluno = tipoPerfil === 'ALUNO';

  // Mock de dados para renderizar igual ao Figma
  const usuario = {
    nome: 'João Silva',
    email: 'joao.silva@email.com',
    telefone: '(11) 98765-4321',
    roleText: isAluno ? 'Aluno IDrive • Categoria B' : 'Instrutor IDrive',
    progressoAtual: 20,
    progressoTotal: 28,
    porcentagem: 71
  };

  return (
    <div className="layout-app">
      <Sidebar itemAtivo="PERFIL" />

      <main className="conteudo-perfil">
        <div className="perfil-wrapper">

          {/* HEADER */}
          <header className="header-perfil-top">
            <div className="header-titulos">
              <h2>Meu Perfil</h2>
              <p>Gerencie suas informações e acompanhe seu progresso.</p>
            </div>
            <button className="btn-editar-perfil">
              <Edit2 size={15} /> Editar Perfil
            </button>
          </header>

          {/* BENTO GRID */}
          <div className="perfil-bento-grid">

            {/* COLUNA ESQUERDA: PROFILE CARD */}
            <aside className="card-base card-perfil-lateral">
              <div className="avatar-wrapper">
                <div className="avatar-img">
                  {/* Foto Mockada */}
                  <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" />
                </div>
                <div className="btn-edit-avatar">
                  <Edit2 size={14} />
                </div>
              </div>

              <h3 className="perfil-nome">{usuario.nome}</h3>
              <p className="perfil-role">{usuario.roleText}</p>

              <div className="divisor-perfil"></div>

              <div className="perfil-contatos">
                <div className="contato-item">
                  <div className="contato-icone"><Mail size={16} /></div>
                  <div className="contato-textos">
                    <span className="contato-label">E-MAIL</span>
                    <span className="contato-valor">{usuario.email}</span>
                  </div>
                </div>

                <div className="contato-item">
                  <div className="contato-icone"><Phone size={16} /></div>
                  <div className="contato-textos">
                    <span className="contato-label">TELEFONE</span>
                    <span className="contato-valor">{usuario.telefone}</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* COLUNA DIREITA */}
            <div className="coluna-direita">

              {/* LINHA DE CIMA: PROGRESSO E DOCUMENTOS */}
              <div className="direita-topo">

                {/* PROGRESS CARD */}
                <div className="card-base card-progresso">
                  <div>
                    <p className="eyebrow-title">PROGRESSO ATUAL</p>
                    <div className="progresso-numeros">
                      <span className="numero-grande">{usuario.progressoAtual}</span>
                      <span className="numero-slash">/ {usuario.progressoTotal}</span>
                    </div>
                    <p className="progresso-label">Aulas Concluídas</p>
                  </div>

                  <div className="barra-wrapper">
                    <div className="barra-fundo">
                      <div className="barra-preenchimento" style={{ width: `${usuario.porcentagem}%` }}></div>
                    </div>
                    <div className="barra-legenda">{usuario.porcentagem}% DO CURSO</div>
                  </div>
                </div>

                {/* DOCUMENTS STATUS */}
                <div className="card-base card-documentos">
                  <p className="eyebrow-title doc-eyebrow">MEUS DOCUMENTOS</p>

                  <div className="lista-documentos">
                    <div className="doc-item">
                      <div className="doc-info">
                        <FileText size={18} className="doc-icone" />
                        <span className="doc-nome">RG / CPF</span>
                      </div>
                      <span className="badge-verificado">VERIFICADO</span>
                    </div>

                    <div className="doc-item">
                      <div className="doc-info">
                        <FileText size={18} className="doc-icone" />
                        <span className="doc-nome">Residência</span>
                      </div>
                      <span className="badge-verificado">VERIFICADO</span>
                    </div>

                    <div className="doc-item">
                      <div className="doc-info">
                        <FileText size={18} className="doc-icone" />
                        <span className="doc-nome">Exame Médico</span>
                      </div>
                      <span className="badge-pendente">PENDENTE</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* LINHA DE BAIXO: RECENT HISTORY */}
              <div className="card-base card-historico">
                <div className="historico-header">
                  <p className="eyebrow-title doc-eyebrow" style={{ margin: 0 }}>HISTÓRICO RECENTE</p>
                  <a href="#" className="link-ver-todos">Ver todos</a>
                </div>

                <div className="lista-historico">

                  <div className="historico-item">
                    <div className="hist-info">
                      <div className="hist-avatar">
                        <img src="https://i.pravatar.cc/150?img=5" alt="Instrutora" />
                      </div>
                      <div className="hist-textos">
                        <h4>Aula Prática #20</h4>
                        <p>Instrutora Carla Mendes • Ontem, 14:00</p>
                      </div>
                    </div>
                    <div className="hist-nota">
                      <Star size={12} fill="#F97316" stroke="none" /> 5.0
                    </div>
                  </div>

                  <div className="historico-item">
                    <div className="hist-info">
                      <div className="hist-avatar">
                        <img src="https://i.pravatar.cc/150?img=12" alt="Instrutor" />
                      </div>
                      <div className="hist-textos">
                        <h4>Aula Prática #19</h4>
                        <p>Instrutor Ricardo Alves • 12 Out, 09:00</p>
                      </div>
                    </div>
                    <div className="hist-nota">
                      <Star size={12} fill="#F97316" stroke="none" /> 4.8
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}