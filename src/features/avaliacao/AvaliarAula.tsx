import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, ShieldCheck, MessageSquare, Star, CheckCircle } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { aulaService, type AulaResponseDTO } from '../../services/aulaService';
import { perfilService, type PerfilPublicoDTO } from '../../services/perfilService';
import { useAuthContext } from '../../contexts/AuthContext';
import './AvaliarAula.css';

// ── Critérios por perfil ───────────────────────────────────────────────────
const CRITsERIOS_INSTRUTOR = [
  {
    key: 'pontualidade',
    icon: <Clock size={20} />,
    titulo: 'Pontualidade',
    descricao: 'O instrutor chegou no horário combinado?',
  },
  {
    key: 'seguirRegrasDeTransito',
    icon: <ShieldCheck size={20} />,
    titulo: 'Seguir as Regras de Trânsito',
    descricao: 'O instrutor respeitou as leis e sinalizações?',
  },
  {
    key: 'clareza',
    icon: <MessageSquare size={20} />,
    titulo: 'Clareza na Explicação',
    descricao: 'As orientações foram fáceis de entender?',
  },
];

const CRITERIOS_ALUNO = [
  {
    key: 'pontualidade',
    icon: <Clock size={20} />,
    titulo: 'Pontualidade',
    descricao: 'O aluno chegou no horário combinado?',
  },
  {
    key: 'receptividade',
    icon: <MessageSquare size={20} />,
    titulo: 'Receptividade',
    descricao: 'O aluno foi atento e aberto às instruções?',
  },
];

// ── Componente de estrelas interativo ─────────────────────────────────────
function EstrelasInput({
  valor,
  onChange,
}: {
  valor: number;
  onChange: (n: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="estrelas-input">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          className={`estrela-btn ${n <= (hover || valor) ? 'ativa' : ''}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
        >
          <Star size={32} fill={n <= (hover || valor) ? '#E16B34' : 'none'} stroke={n <= (hover || valor) ? '#E16B34' : '#ABADAF'} />
        </button>
      ))}
    </div>
  );
}

// ── Componente de estrelas para critérios ─────────────────────────────────
function EstrelasLinhaInput({
  valor,
  onChange,
}: {
  valor: number;
  onChange: (n: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="estrelas-linha">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          className={`estrela-linha-btn ${n <= (hover || valor) ? 'ativa' : ''}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
        >
          <Star size={20} fill={n <= (hover || valor) ? '#E16B34' : 'none'} stroke={n <= (hover || valor) ? '#E16B34' : '#ABADAF'} />
        </button>
      ))}
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────
export default function AvaliarAula() {
  const { aulaId } = useParams<{ aulaId: string }>();
  const navigate = useNavigate();
  const { tipoPerfil } = useAuthContext();

  const [aula, setAula] = useState<AulaResponseDTO | null>(null);
  const [perfilCoAutor, setPerfilCoAutor] = useState<PerfilPublicoDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);

  // Notas dos critérios
  const [notaGeral, setNotaGeral] = useState(0);
  const [notas, setNotas] = useState<Record<string, number>>({});
  const [comentario, setComentario] = useState('');
  const [reportar, setReportar] = useState('');

  const isAluno = tipoPerfil === 'ALUNO';
  const criterios = isAluno ? CRITERIOS_INSTRUTOR : CRITERIOS_ALUNO;

  // Calcula nota geral automaticamente pela média dos critérios
  useEffect(() => {
    const valores = Object.values(notas).filter(v => v > 0);
    if (valores.length > 0) {
      const media = valores.reduce((a, b) => a + b, 0) / valores.length;
      setNotaGeral(Math.round(media));
    }
  }, [notas]);

  // Busca dados da aula e do perfil do coAutor
  useEffect(() => {
    if (!aulaId) return;
    aulaService.listarMinhasAulas()
      .then(aulas => {
        const found = aulas.find(a => a.id === aulaId);
        if (!found) throw new Error('Aula não encontrada');
        setAula(found);
        if (found.coAutorId) {
          return perfilService.buscarPorId(found.coAutorId);
        }
        return null;
      })
      .then(perfil => { if (perfil) setPerfilCoAutor(perfil); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [aulaId]);

  const handleSubmit = async () => {
    if (!aulaId) return;
    const todosCriteriosPreenchidos = criterios.every(c => (notas[c.key] ?? 0) > 0);
    if (!todosCriteriosPreenchidos) {
      alert('Por favor, avalie todos os critérios antes de concluir.');
      return;
    }

    setEnviando(true);
    try {
      if (isAluno) {
        const { avaliacaoService } = await import('../../services/avaliacaoService');
        await avaliacaoService.avaliarInstrutor({
          aulaId,
          pontualidade: notas['pontualidade'],
          seguirRegrasDeTransito: notas['seguirRegrasDeTransito'],
          clareza: notas['clareza'],
        });
      } else {
        const { avaliacaoService } = await import('../../services/avaliacaoService');
        await avaliacaoService.avaliarAluno({
          aulaId,
          pontualidade: notas['pontualidade'],
          receptividade: notas['receptividade'],
        });
      }
      setModalSucesso(true);
    } catch (error) {
      console.error('Erro ao enviar avaliação', error);
      alert('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="layout-app">
        <Sidebar itemAtivo="AULAS" />
        <main className="av-main">
          <div className="av-loading"><div className="spinner" /><p>Carregando...</p></div>
        </main>
      </div>
    );
  }

  return (
    <div className="layout-app">
      <Sidebar itemAtivo="AULAS" />

      <main className="av-main">

        {/* Header */}
        <header className="av-header">
          <h1 className="av-titulo">{isAluno ? 'Avaliar Instrutor' : 'Avaliar Aluno'}</h1>
          <p className="av-subtitulo">Como foi sua aula de hoje? Sua avaliação ajuda a manter nossa excelência.</p>
        </header>

        <div className="av-grid">

          {/* ── Coluna Esquerda ── */}
          <div className="av-col-esquerda">

            {/* Card do perfil */}
            <div className="card-perfil-av">
              <div className="perfil-av-foto">
                <div className="perfil-av-avatar">
                  {perfilCoAutor?.nome?.charAt(0).toUpperCase() ?? '?'}
                </div>
                <div className="perfil-av-badge"><CheckCircle size={12} color="#fff" /></div>
              </div>
              <h3 className="perfil-av-nome">{perfilCoAutor?.nome ?? aula?.coAutor ?? '—'}</h3>
              <p className="perfil-av-role">
                {isAluno ? 'Instrutor IDrive' : 'Aluno IDrive'} • Cat. B
              </p>

              <div className="perfil-av-divisor" />

              <div className="perfil-av-stats">
                <div className="stat-box">
                  <span className="stat-label">AULAS</span>
                  <span className="stat-valor">{perfilCoAutor?.totalAulas?.toLocaleString() ?? '—'}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">NOTA MÉDIA</span>
                  <span className="stat-valor">
                    {perfilCoAutor?.notaMedia != null
                      ? perfilCoAutor.notaMedia.toFixed(1)
                      : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card reportar problema */}
            <div className="card-reportar">
              <div className="reportar-titulo">
                <AlertTriangle size={18} color="#B31B25" />
                <span>Reportar Problema</span>
              </div>
              <p className="reportar-desc">
                Algo não saiu como esperado? Nos conte o que aconteceu para podermos intervir.
              </p>
              <textarea
                className="reportar-textarea"
                placeholder="Descreva brevemente o ocorrido..."
                value={reportar}
                onChange={e => setReportar(e.target.value)}
              />
              <button type="button" className="btn-reportar">
                <AlertTriangle size={14} /> Enviar Alerta
              </button>
            </div>

          </div>

          {/* ── Coluna Direita ── */}
          <div className="av-col-direita">
            <div className="card-avaliacao">

              {/* Avaliação geral */}
              <h3 className="av-secao-titulo">Avaliação Geral</h3>
              <EstrelasInput valor={notaGeral} onChange={setNotaGeral} />

              <div className="av-divisor" />

              {/* Critérios detalhados */}
              <div className="criterios-lista">
                {criterios.map(c => (
                  <div key={c.key} className="criterio-item">
                    <div className="criterio-info">
                      <div className="criterio-icone">{c.icon}</div>
                      <div>
                        <strong className="criterio-titulo">{c.titulo}</strong>
                        <p className="criterio-desc">{c.descricao}</p>
                      </div>
                    </div>
                    <EstrelasLinhaInput
                      valor={notas[c.key] ?? 0}
                      onChange={n => setNotas(prev => ({ ...prev, [c.key]: n }))}
                    />
                  </div>
                ))}
              </div>

              {/* Comentário */}
              <div className="av-comentario">
                <label className="av-label">Comentários Adicionais (Opcional)</label>
                <textarea
                  className="av-textarea"
                  placeholder="Conte mais sobre sua experiência com o instrutor..."
                  value={comentario}
                  onChange={e => setComentario(e.target.value)}
                />
              </div>

              {/* Botão submit */}
              <div className="av-actions">
                <button
                  type="button"
                  className="btn-concluir"
                  onClick={handleSubmit}
                  disabled={enviando}
                >
                  {enviando ? 'Enviando...' : 'Concluir Avaliação'}
                </button>
                <p className="av-aviso">
                  Ao concluir, sua nota será compartilhada com o instrutor anonimamente.
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* ── Modal de sucesso ── */}
      {modalSucesso && (
        <div className="modal-overlay">
          <div className="modal-sucesso">
            <div className="modal-icone">
              <CheckCircle size={48} color="#16A34A" />
            </div>
            <h2>Avaliação Concluída!</h2>
            <p>Obrigado pelo seu feedback. Ele ajuda a melhorar a experiência de todos.</p>
            <button
              type="button"
              className="btn-modal-ok"
              onClick={() => navigate('/minhas-aulas')}
            >
              Voltar para Minhas Aulas
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
