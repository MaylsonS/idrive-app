import { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Edit2, Mail, Phone, FileText, Star } from 'lucide-react';
import { perfilService } from '../../services/perfilService';
import { aulaService } from '../../services/aulaService';
import type { PerfilPublicoDTO } from '../../services/perfilService';
import type { AulaResponseDTO } from '../../services/aulaService';
import './Perfil.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getRoleText(tipoPerfil: string): string {
  return tipoPerfil === 'ALUNO' ? 'Aluno IDrive' : 'Instrutor IDrive';
}

function getInitials(nome: string): string {
  if (!nome) return 'ID';
  return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).replace('.', '');
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function Perfil() {
  const [perfil, setPerfil] = useState<PerfilPublicoDTO | null>(null);
  const [historico, setHistorico] = useState<AulaResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function carregarDados() {
    setLoading(true);
    setError(null);

    try {
      const [dadosPerfil, minhasAulas] = await Promise.all([
        perfilService.meuPerfil(),
        aulaService.listarMinhasAulas()
      ]);

      setPerfil(dadosPerfil);

      const aulasConcluidas = minhasAulas
        .filter(a => a.status === 'CONCLUIDA')
        .sort((a, b) => new Date(b.fim).getTime() - new Date(a.fim).getTime())
        .slice(0, 3);

      setHistorico(aulasConcluidas);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar perfil.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  return (
    <div className="layout-app">
      <Sidebar itemAtivo="PERFIL" />

      <main className="conteudo-perfil">

        {loading && (
          <div style={{ padding: '40px', color: '#595C5E', fontSize: '14px' }}>
            Carregando perfil...
          </div>
        )}

        {error && !loading && (
          <div style={{ padding: '40px', color: '#991B1B', fontSize: '14px' }}>
            {error}
            <br /><br />
            <button onClick={carregarDados} className="btn-editar-perfil" style={{ width: 'auto' }}>
              Tentar novamente
            </button>
          </div>
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
                      <span className="contato-label">E-MAIL</span>
                      <span className="contato-valor">{perfil.email || 'Não informado'}</span>
                    </div>
                  </div>

                  <div className="contato-item">
                    <div className="contato-icone"><Phone size={16} /></div>
                    <div className="contato-textos">
                      <span className="contato-label">TELEFONE</span>
                      <span className="contato-valor">{perfil.telefone || 'Não informado'}</span>
                    </div>
                  </div>
                </div>
              </aside>

              {/* COLUNA DIREITA */}
              <div className="coluna-direita">

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
                        <span className="badge-pendente">EM DESENVOLVIMENTO</span>
                      </div>
                      <div className="doc-item">
                        <div className="doc-info">
                          <FileText size={18} className="doc-icone" />
                          <span className="doc-nome">Residência</span>
                        </div>
                        <span className="badge-pendente">EM DESENVOLVIMENTO</span>
                      </div>
                      <div className="doc-item">
                        <div className="doc-info">
                          <FileText size={18} className="doc-icone" />
                          <span className="doc-nome">Exame Médico</span>
                        </div>
                        <span className="badge-pendente">EM DESENVOLVIMENTO</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* LINHA DE BAIXO: HISTÓRICO REAL */}
                <div className="card-base card-historico">
                  <div className="historico-header">
                    <p className="eyebrow-title doc-eyebrow" style={{ margin: 0 }}>
                      HISTÓRICO RECENTE
                    </p>
                    <a href="/minhas-aulas" className="link-ver-todos">Ver todas</a>
                  </div>

                  <div className="lista-historico">
                    {historico.length === 0 ? (
                      <p style={{ fontSize: '14px', color: '#666' }}>Nenhuma aula concluída ainda.</p>
                    ) : (
                      historico.map((aula, index) => {
                        const nomeOutro = aula.coAutor || aula.autor;
                        return (
                          <div key={aula.id} className="historico-item">
                            <div className="hist-info">
                              <div className="hist-avatar hist-avatar-initials">
                                {getInitials(nomeOutro)}
                              </div>
                              <div className="hist-textos">
                                <h4>{aula.descricao || `Aula Prática #${perfil.totalAulas - index}`}</h4>
                                <p>{nomeOutro} • {formatarData(aula.fim)}</p>
                              </div>
                            </div>
                            <div className="hist-nota">
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534', background: '#DCFCE7', padding: '2px 6px', borderRadius: '4px' }}>
                                CONCLUÍDA
                              </span>
                            </div>
                          </div>
                        );
                      })
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