import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { aulaService, type AulaResponseDTO } from '../../services/aulaService';
import { useAuthContext } from '../../contexts/AuthContext';
import './GestaoAula.css';

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).replace('.', '');
}

function formatarHora(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function faixa(ini: string, fim: string) {
  return `${formatarHora(ini)} — ${formatarHora(fim)}`;
}

const STATUS_CONFIG = {
  ACEITA:    { label: 'Confirmada',  bg: '#D8E3FB', color: '#475266' },
  CONCLUIDA: { label: 'Concluída',   bg: '#DCFCE7', color: '#166534' },
  CANCELADA: { label: 'Cancelada',   bg: '#FEE2E2', color: '#991B1B' },
} as const;

function Badge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || { label: status, bg: '#EEE', color: '#333' };
  return (
    <span
      className="badge-status"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

// ── Avatar ────────────────────────────────────────────
function PessoaAvatar({ nome }: { nome: string }) {
  const iniciais = nome ? nome.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : 'ID';
  return (
    <div className="pessoa-avatar">
      {iniciais}
    </div>
  );
}

// ── Card de aula ─────────────────────────────────────────────
interface CardProps {
  aula: AulaResponseDTO;
  onCancelar: (id: string) => void;
  loading: boolean;
  tipoPerfil: string | null;
}

function AulaCard({ aula, onCancelar, loading, tipoPerfil }: CardProps) {
  const isConfirmada = aula.status === 'ACEITA';
  const isCancelada = aula.status === 'CANCELADA';

  const isInstrutor = tipoPerfil === 'INSTRUTOR';
  const nomeExibicao = aula.coAutor ? (isInstrutor ? aula.coAutor : aula.autor) : aula.autor;

  // A MÁGICA ACONTECE AQUI: A regra das 24 horas foi removida.
  // Se a aula está ACEITA, o botão de cancelar fica sempre disponível.

  return (
    <div className={`aula-card ${isConfirmada ? 'confirmada' : ''} ${isCancelada ? 'cancelada' : ''}`}>
      <div className="card-inner">
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <PessoaAvatar nome={nomeExibicao} />
        </div>

        <div className="card-info-wrap">
          <div className="card-header-row">
            <div>
              <div className="card-nome">{nomeExibicao}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <span className="card-desc">{aula.descricao ?? 'Aula Prática'}</span>
              </div>
            </div>
            <Badge status={aula.status} />
          </div>

          <div className="datetime-box">
            <div>
              <div className="dt-label">Data</div>
              <div className="dt-value">{formatarData(aula.inicio)}</div>
            </div>
            <div className="dt-divider" />
            <div>
              <div className="dt-label">Horário</div>
              <div className="dt-value">{faixa(aula.inicio, aula.fim)}</div>
            </div>
          </div>

          <div className="card-acoes">
            {isConfirmada && (
              <button
                onClick={() => onCancelar(aula.id)}
                disabled={loading}
                className="btn-card btn-cancelar"
              >
                Cancelar Aula
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────
function EmptyState({ filtro }: { filtro: string }) {
  const msgs: Record<string, { titulo: string; sub: string }> = {
    TODAS:    { titulo: 'Nenhuma aula por aqui',       sub: 'As aulas acordadas no chat aparecerão aqui.' },
    ACEITA:   { titulo: 'Nenhuma aula confirmada',     sub: 'Você ainda não possui aulas marcadas.'       },
    CANCELADA:{ titulo: 'Nenhuma aula cancelada',      sub: 'Ótimo — nada foi cancelado por aqui.'        },
  };
  const { titulo, sub } = msgs[filtro] ?? msgs['TODAS'];
  return (
    <div className="empty-state">
      <div className="empty-icon">📋</div>
      <div className="empty-titulo">{titulo}</div>
      <div className="empty-sub">{sub}</div>
    </div>
  );
}

// ── Filtros ───────────────────────────────────────────────────
const FILTROS = [
  { key: 'TODAS',     label: 'Todas'      },
  { key: 'ACEITA',    label: 'Confirmadas'},
  { key: 'CANCELADA', label: 'Canceladas' },
] as const;

// ── Page principal ────────────────────────────────────────────
export default function GestaoAulas() {
  const { tipoPerfil } = useAuthContext();

  const [aulas, setAulas]       = useState<AulaResponseDTO[]>([]);
  const [loading, setLoading]   = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [filtro, setFiltro]     = useState<'TODAS' | 'ACEITA' | 'CANCELADA'>('TODAS');
  const [erro, setErro]         = useState<string | null>(null);

  useEffect(() => {
    aulaService.listarMinhasAulas()
      .then(data => {
        const aulasVinculadas = data.filter(a => a.status === 'ACEITA' || a.status === 'CANCELADA');
        setAulas(aulasVinculadas);
      })
      .catch(() => setErro('Não foi possível carregar as aulas.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleCancelar(id: string) {
    const confirmar = window.confirm("Tem certeza que deseja cancelar esta aula?");
    if (!confirmar) return;

    setActionId(id);
    try {
      await aulaService.cancelarAula(id);
      setAulas(prev => prev.map(a => a.id === id ? { ...a, status: 'CANCELADA' } : a));
      alert("Aula cancelada com sucesso.");
    } catch {
      setErro('Erro ao cancelar a aula. Tente novamente.');
    } finally {
      setActionId(null);
    }
  }

  const aulasFiltradas = filtro === 'TODAS'
    ? aulas
    : aulas.filter(a => a.status === filtro);

  const counts = {
    TODAS:     aulas.length,
    ACEITA:    aulas.filter(a => a.status === 'ACEITA').length,
    CANCELADA: aulas.filter(a => a.status === 'CANCELADA').length,
  };

  return (
    <div className="layout-app">
      <Sidebar itemAtivo="SOLICITACOES" />

      <main className="gestao-main">
        <div className="gestao-container">

          {/* ── Header ── */}
          <div className="gestao-header">
            <p className="gestao-eyebrow">Painel de Gestão</p>
            <h1 className="gestao-titulo">
              {tipoPerfil === 'INSTRUTOR' ? 'Gestão de ' : 'Minhas '}
              <span className="gestao-destaque">
                {tipoPerfil === 'INSTRUTOR' ? 'Aulas.' : 'Solicitações.'}
              </span>
            </h1>
            <p className="gestao-subtitulo">
              {tipoPerfil === 'INSTRUTOR'
                ? 'Gerencie as aulas que você já confirmou com seus alunos. Cancele apenas em casos de imprevistos.'
                : 'Acompanhe as aulas que os instrutores confirmaram com você. Você pode cancelar caso haja algum imprevisto.'}
            </p>
          </div>

          {/* ── Tabs de filtro ── */}
          <div className="gestao-filtros">
            {FILTROS.map(f => {
              const ativo = filtro === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFiltro(f.key)}
                  className={`tab-btn ${ativo ? 'ativo' : ''}`}
                >
                  {f.label}
                  <span className="tab-count">{counts[f.key]}</span>
                </button>
              );
            })}
          </div>

          {/* ── Erro ── */}
          {erro && (
            <div className="gestao-erro">
              {erro}
              <button onClick={() => setErro(null)} className="btn-fechar-erro">×</button>
            </div>
          )}

          {/* ── Conteúdo ── */}
          {loading ? (
            <div className="gestao-loading">
              <div className="spinner-gestao" />
              <p style={{ color: '#595C5E', fontSize: 14 }}>Carregando aulas...</p>
            </div>
          ) : (
            <div className="gestao-grid">
              {aulasFiltradas.length === 0
                ? <EmptyState filtro={filtro} />
                : aulasFiltradas.map(aula => (
                  <AulaCard
                    key={aula.id}
                    aula={aula}
                    onCancelar={handleCancelar}
                    loading={actionId === aula.id}
                    tipoPerfil={tipoPerfil}
                  />
                ))
              }
            </div>
          )}

        </div>
      </main>
    </div>
  );
}