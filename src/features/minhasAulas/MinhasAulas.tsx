import { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { aulaService, type AulaResponseDTO } from '../../services/aulaService';
import { useAuthContext } from '../../contexts/AuthContext';
import './MinhasAulas.css';

// ── Constantes DETRAN ──────────────────────────────────────
const TOTAL_HORAS_AULA_DETRAN = 20;   // horas-aula exigidas
const MINUTOS_POR_HORA_AULA   = 50;   // 1 hora-aula = 50 min reais

// ── Helpers ────────────────────────────────────────────────
function duracaoMinutos(inicio: string, fim: string) {
    return (new Date(fim).getTime() - new Date(inicio).getTime()) / 60_000;
}

function formatarMes(iso: string) {
    return new Date(iso)
        .toLocaleDateString('pt-BR', { month: 'short' })
        .toUpperCase()
        .replace('.', '');
}

function formatarDia(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit' });
}

function formatarHora(iso: string) {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatarDataExtenso(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
}

// ── Componente ─────────────────────────────────────────────
export default function MinhasAulas() {
    const { tipoPerfil } = useAuthContext();
    const [aulas, setAulas]     = useState<AulaResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        aulaService.listarMinhasAulas()
            .then(setAulas)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Particionamento por status
    const proximas  = aulas.filter(a => a.status === 'ACEITA');
    const concluidas = aulas.filter(a => a.status === 'CONCLUIDA');

    // ── Cálculo de progresso DETRAN ──
    const minutosReais     = concluidas.reduce((acc, a) => acc + duracaoMinutos(a.inicio, a.fim), 0);
    const horasAula        = minutosReais / MINUTOS_POR_HORA_AULA;          // em horas-aula DETRAN
    const percentual       = Math.min((horasAula / TOTAL_HORAS_AULA_DETRAN) * 100, 100);
    const faltantes        = Math.max(0, TOTAL_HORAS_AULA_DETRAN - Math.floor(horasAula));

    const isInstrutor = tipoPerfil === 'INSTRUTOR';

    return (
        <div className="layout-app">
            <Sidebar itemAtivo="AULAS" />

            <main className="ma-main">

                {/* ── Header ── */}
                <header className="ma-header">
                    <h1 className="ma-titulo">Minhas Aulas</h1>
                    <p className="ma-subtitulo">
                        {isInstrutor
                            ? 'Acompanhe as aulas que você tem agendadas.'
                            : 'Acompanhe sua jornada rumo à excelência na direção.'}
                    </p>
                </header>

                {loading ? (
                    <div className="ma-loading">
                        <div className="spinner" />
                        <p>Carregando suas aulas...</p>
                    </div>
                ) : (
                    <div className="ma-bento">

                        {/* ── Card Progresso (large, left) ── */}
                        <div className="card-progresso">
                            <div className="card-progresso-bg-blur" />
                            <div className="progresso-inner">
                                <p className="prog-label">DASHBOARD</p>
                                <h2 className="prog-titulo">Seu Progresso de Maestria</h2>

                                <div className="prog-numeros-row">
                                    <div className="prog-col-horas">
                                        <div className="prog-horas-row">
                                            <span className="prog-horas-feitas">
                                                {horasAula.toFixed(1)}
                                            </span>
                                            <span className="prog-horas-total">
                                                / {TOTAL_HORAS_AULA_DETRAN} Horas
                                            </span>
                                        </div>
                                        <span className="prog-pct">{percentual.toFixed(0)}% Alcançado</span>

                                        <div className="prog-barra-wrap">
                                            <div
                                                className="prog-barra-fill"
                                                style={{ width: `${percentual}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="prog-faltantes-box">
                                        <span className="prog-faltantes-num">
                                            {String(faltantes).padStart(2, '0')}
                                        </span>
                                        <span className="prog-faltantes-label">FALTANTES</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Próximas Aulas (bottom-left) ── */}
                        <section className="secao-proximas">
                            <div className="secao-header">
                                <h3 className="secao-titulo">Próximas Aulas</h3>
                                <button className="btn-ver-todas">Ver todas</button>
                            </div>

                            <div className="lista-proximas">
                                {proximas.length === 0 && (
                                    <p className="ma-vazio">Nenhuma aula agendada no momento.</p>
                                )}
                                {proximas.map(a => (
                                    <div key={a.id} className="card-proxima">
                                        <div className="card-data-box">
                                            <span className="cdb-mes">{formatarMes(a.inicio)}</span>
                                            <span className="cdb-dia">{formatarDia(a.inicio)}</span>
                                        </div>
                                        <div className="card-info">
                                            <strong className="card-titulo-aula">
                                                {a.descricao || 'Aula Prática'}
                                            </strong>
                                            <span className="card-detalhe">
                                                {formatarHora(a.inicio)} - {formatarHora(a.fim)}
                                                {a.coAutor
                                                    ? ` • ${isInstrutor ? 'Aluno' : 'Instrutor'} ${a.coAutor}`
                                                    : ''}
                                            </span>
                                        </div>
                                        <button className="btn-tres-pontos">⋮</button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* ── Aulas Concluídas (bottom-right) ── */}
                        <section className="secao-concluidas">
                            <h3 className="secao-titulo">Aulas Concluídas</h3>

                            <div className="lista-concluidas">
                                {concluidas.length === 0 && (
                                    <p className="ma-vazio">Nenhuma aula concluída ainda.</p>
                                )}
                                {concluidas.map((a, i) => {
                                    const jaAvaliada = i % 2 !== 0; // mock visual — substituir por campo real
                                    return (
                                        <div
                                            key={a.id}
                                            className={`card-concluida ${jaAvaliada ? 'ja-avaliada' : ''}`}
                                        >
                                            <div className={`concl-icone ${jaAvaliada ? 'icone-cinza' : 'icone-laranja'}`}>
                                                {jaAvaliada
                                                    ? <span className="icone-check-cinza">✓</span>
                                                    : <span className="icone-check-laranja">✓</span>
                                                }
                                            </div>
                                            <div className="card-info">
                                                <strong className={`card-titulo-aula ${jaAvaliada ? 'riscado' : ''}`}>
                                                    {a.descricao || 'Aula Prática'}
                                                </strong>
                                                <span className="card-detalhe">
                                                    Concluída em {formatarDataExtenso(a.fim)}
                                                </span>
                                            </div>
                                            {jaAvaliada ? (
                                                <div className="estrelas">
                                                    {[1,2,3,4].map(n => (
                                                        <span key={n} className="estrela-on">★</span>
                                                    ))}
                                                    <span className="estrela-off">★</span>
                                                </div>
                                            ) : (
                                                <button className="btn-avaliar">
                                                    AVALIAR AULA
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                    </div>
                )}

                {/* ── Footer ── */}
                <footer className="ma-footer">
                    <span>© 2024 IDrive. Todos os direitos reservados.</span>
                    <div className="footer-links">
                        <a href="#">Suporte</a>
                        <a href="#">Privacidade</a>
                        <a href="#">Termos</a>
                        <a href="#">Ajuda</a>
                    </div>
                </footer>

            </main>
        </div>
    );
}
