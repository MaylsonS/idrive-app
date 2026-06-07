import { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Edit2, Mail, Phone, FileText, Star, AlertCircle } from 'lucide-react';
import { perfilService } from '../../services/perfilService';
import type { PerfilPublicoDTO } from '../../services/perfilService';
import './Perfil.css';

function PerfilSkeleton() {
  return (
    <div className="perfil-wrapper">
      <header className="header-perfil-top">
        <div className="header-titulos">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-subtitle" />
        </div>
      </header>
      <div className="perfil-bento-grid">
        <aside className="card-base card-perfil-lateral">
          <div className="avatar-wrapper">
            <div className="skeleton skeleton-avatar" />
          </div>
          <div className="skeleton skeleton-nome" />
          <div className="skeleton skeleton-role" />
          <div className="divisor-perfil" />
          <div className="perfil-contatos">
            <div className="skeleton skeleton-contato" />
            <div className="skeleton skeleton-contato" />
          </div>
        </aside>
        <div className="coluna-direita">
          <div className="direita-topo">
            <div className="card-base card-progresso skeleton-card" />
            <div className="card-base card-documentos skeleton-card" />
          </div>
          <div className="card-base card-historico skeleton-card" />
        </div>
      </div>
    </div>
  );
}

// ─── Error ────────────────────────────────────────────────────────────────────

function PerfilError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="perfil-error-state">
      <AlertCircle size={32} className="error-icon" />
      <h3>Não foi possível carregar o perfil</h3>
      <p>{message}</p>
      <button className="btn-editar-perfil" onClick={onRetry}>
        Tentar novamente
      </button>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRoleText(tipoPerfil: string): string {
  return tipoPerfil === 'ALUNO' ? 'Aluno IDrive • Categoria B' : 'Instrutor IDrive';
}

function getInitials(nome: string): string {
  return nome
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function Perfil() {
  const [perfil, setPerfil] = useState<PerfilPublicoDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function carregarPerfil() {
    setLoading(true);
    setError(null);

    try {
      const data = await perfilService.meuPerfil();
      setPerfil(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar perfil.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarPerfil();
  }, []);

  return (
    <div className="layout-app">
      <Sidebar itemAtivo="PERFIL" />

      <main className="conteudo-perfil">

        {loading && <PerfilSkeleton />}

        {error && !loading && (
          <PerfilError message={error} onRetry={carregarPerfil} />
        )}

        {perfil && !loading && (
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
                  <div className="avatar-img avatar-initials">
                    {getInitials(perfil.nome)}
                  </div>
                  <div className="btn-edit-avatar">
                    <Edit2 size={14} />
                  </div>
                </div>

                <h3 className="perfil-nome">{perfil.nome}</h3>
                <p className="perfil-role">{getRoleText(perfil.tipoPerfil)}</p>

                {perfil.notaMedia != null && (
                  <div className="perfil-nota-media">
                    <Star size={14} fill="#F97316" stroke="none" />
                    <span>{perfil.notaMedia.toFixed(1)}</span>
                  </div>
                )}

                {perfil.descricao && (
                  <p className="perfil-descricao">{perfil.descricao}</p>
                )}

                <div className="divisor-perfil" />

                <div className="perfil-contatos">
                  <div className="contato-item">
                    <div className="contato-icone"><Mail size={16} /></div>
                    <div className="contato-textos">
                      <span className="contato-label">TIPO</span>
                      <span className="contato-valor">{perfil.tipoPerfil}</span>
                    </div>
                  </div>

                  <div className="contato-item">
                    <div className="contato-icone"><Phone size={16} /></div>
                    <div className="contato-textos">
                      <span className="contato-label">AULAS CONCLUÍDAS</span>
                      <span className="contato-valor">{perfil.totalAulas}</span>
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
                        <span className="numero-grande">{perfil.totalAulas}</span>
                        <span className="numero-slash">aulas</span>
                      </div>
                      <p className="progresso-label">Aulas Concluídas</p>
                    </div>

                    {perfil.notaMedia != null && (
                      <div className="barra-wrapper">
                        <div className="barra-fundo">
                          <div
                            className="barra-preenchimento"
                            style={{ width: `${Math.min(perfil.notaMedia * 20, 100)}%` }}
                          />
                        </div>
                        <div className="barra-legenda">
                          NOTA MÉDIA: {perfil.notaMedia.toFixed(1)}
                        </div>
                      </div>
                    )}
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
                    <p className="eyebrow-title doc-eyebrow" style={{ margin: 0 }}>
                      HISTÓRICO RECENTE
                    </p>
                    <a href="#" className="link-ver-todos">Ver todos</a>
                  </div>

                  <div className="lista-historico">
                    <div className="historico-item">
                      <div className="hist-info">
                        <div className="hist-avatar hist-avatar-initials">CM</div>
                        <div className="hist-textos">
                          <h4>Aula Prática #{perfil.totalAulas}</h4>
                          <p>Instrutora Carla Mendes • Ontem, 14:00</p>
                        </div>
                      </div>
                      <div className="hist-nota">
                        <Star size={12} fill="#F97316" stroke="none" /> 5.0
                      </div>
                    </div>

                    {perfil.totalAulas > 1 && (
                      <div className="historico-item">
                        <div className="hist-info">
                          <div className="hist-avatar hist-avatar-initials">RA</div>
                          <div className="hist-textos">
                            <h4>Aula Prática #{perfil.totalAulas - 1}</h4>
                            <p>Instrutor Ricardo Alves • 12 Out, 09:00</p>
                          </div>
                        </div>
                        <div className="hist-nota">
                          <Star size={12} fill="#F97316" stroke="none" /> 4.8
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}