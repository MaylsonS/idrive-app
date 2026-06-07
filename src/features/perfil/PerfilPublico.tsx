import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { perfilService, type PerfilPublicoDTO } from '../../services/perfilService';
import './PerfilPublico.css';

function getInitials(nome: string): string {
    return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function getCorAvatar(nome: string): string {
    const cores = ['#4F7BEF', '#E16B34', '#10B981', '#8B5CF6', '#F59E0B'];
    return cores[nome.charCodeAt(0) % cores.length];
}

const DIAS_SEMANA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

function gerarCalendario() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const totalDias = new Date(ano, mes + 1, 0).getDate();

    const cells: (number | null)[] = [];
    for (let i = 0; i < primeiroDia; i++) cells.push(null);
    for (let d = 1; d <= totalDias; d++) cells.push(d);

    return { cells, hoje: hoje.getDate(), mes, ano };
}

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

export default function PerfilPublico() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [perfil, setPerfil] = useState<PerfilPublicoDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);

    const { cells, hoje, mes, ano } = gerarCalendario();

    useEffect(() => {
        if (!id) return;
        perfilService.buscarPorId(id)
            .then(data => setPerfil(data))
            .catch(() => setErro('Não foi possível carregar o perfil.'))
            .finally(() => setLoading(false));
    }, [id]);

    return (
        <div className="layout-app">
            <Sidebar itemAtivo="ANUNCIOS" />

            <main className="conteudo-perfil-pub">

                {/* TOP BAR */}
                <header className="topbar-perfil-pub">
                    <h2 className="topbar-titulo">
                        Perfil do {perfil?.tipoPerfil === 'INSTRUTOR' ? 'Instrutor' : 'Aluno'}
                    </h2>
                    <div className="topbar-acoes">
                        <button className="btn-voltar-pub" onClick={() => navigate(-1)}>←</button>
                        <div className="topbar-avatar-placeholder" />
                    </div>
                </header>

                {loading && (
                    <div className="estado-pub estado-loading">
                        <div className="spinner-pub" />
                        <p>Carregando perfil...</p>
                    </div>
                )}

                {!loading && erro && (
                    <div className="estado-pub estado-erro">
                        <p>⚠️ {erro}</p>
                        <button onClick={() => navigate(-1)} className="btn-retry-pub">Voltar</button>
                    </div>
                )}

                {!loading && !erro && perfil && (
                    <div className="perfil-pub-inner">

                        {/* ── HERO BENTO ── */}
                        <section className="hero-bento">

                            {/* Profile Card (branco) */}
                            <div className="profile-card">
                                <div className="profile-card-kinetic-bg" />

                                <div className="profile-card-foto-wrap">
                                    <div
                                        className="profile-card-foto"
                                        style={{ background: getCorAvatar(perfil.nome) }}
                                    >
                                        {getInitials(perfil.nome)}
                                    </div>
                                </div>

                                <div className="profile-card-info">
                                    <div className="profile-card-topo">
                                        <span className="badge-verificado-pub">VERIFICADO</span>
                                        {perfil.notaMedia != null && (
                                            <div className="profile-rating">
                                                <span className="estrela-pub">★</span>
                                                <span className="nota-pub">{perfil.notaMedia.toFixed(1)}</span>
                                                <span className="avaliacoes-pub">({perfil.totalAulas} aulas)</span>
                                            </div>
                                        )}
                                    </div>

                                    <h1 className="profile-nome">{perfil.nome}</h1>

                                    {perfil.descricao && (
                                        <p className="profile-descricao">{perfil.descricao}</p>
                                    )}

                                    <div className="profile-meta">
                                        <div className="profile-meta-item">
                                            <span className="meta-icon">📍</span>
                                            <span>São Paulo - Zona Sul</span>
                                        </div>
                                        <div className="profile-meta-item">
                                            <span className="meta-icon">🛡</span>
                                            <span>{perfil.totalAulas}+ aulas concluídas</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </section>

                        {/* ── DETAILS GRID ── */}
                        <div className="details-grid">

                            {/* COLUNA ESQUERDA — Sobre */}
                            <div className="details-left">
                                <h3 className="details-heading">Sobre o {perfil.tipoPerfil === 'INSTRUTOR' ? 'Instrutor' : 'Aluno'}</h3>
                                <div className="sobre-card">
                                    <div className="sobre-borda" />
                                    <p className="sobre-texto">
                                        {perfil.descricao || 'Nenhuma descrição cadastrada.'}
                                    </p>
                                </div>
                            </div>

                            {/* COLUNA DIREITA — Disponibilidade + Avaliações */}
                            <div className="details-right">

                                {/* Disponibilidade */}
                                <div className="disponibilidade-section">
                                    <div className="disponibilidade-header">
                                        <h3 className="details-heading" style={{ margin: 0 }}>Disponibilidade</h3>
                                        <span className="mes-nav">‹ {MESES[mes]} {ano} ›</span>
                                    </div>

                                    <div className="calendario-card">
                                        {/* Cabeçalho dias semana */}
                                        <div className="cal-header">
                                            {DIAS_SEMANA.map(d => (
                                                <div key={d} className="cal-dia-label">{d}</div>
                                            ))}
                                        </div>

                                        {/* Grid de dias */}
                                        <div className="cal-grid">
                                            {cells.map((dia, i) => (
                                                <div
                                                    key={i}
                                                    className={[
                                                        'cal-cell',
                                                        dia === null ? 'cal-vazio' : '',
                                                        dia === hoje ? 'cal-hoje' : '',
                                                        dia === diaSelecionado ? 'cal-selecionado' : '',
                                                        dia !== null && dia < hoje ? 'cal-passado' : '',
                                                    ].join(' ')}
                                                    onClick={() => dia && dia >= hoje && setDiaSelecionado(dia)}
                                                >
                                                    {dia ?? ''}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Horários */}
                                        <div className="horarios-section">
                                            <p className="horarios-label">
                                                HORÁRIOS DISPONÍVEIS {diaSelecionado ? `(${diaSelecionado} ${MESES[mes].slice(0,3).toUpperCase()})` : ''}
                                            </p>
                                            <div className="horarios-row">
                                                {['08:00', '10:00', '14:00', '16:30'].map((h, i) => (
                                                    <button
                                                        key={h}
                                                        className={`btn-horario ${i === 1 ? 'btn-horario-ativo' : ''} ${i === 3 ? 'btn-horario-indisponivel' : ''}`}
                                                    >
                                                        {h}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Avaliações Recentes */}
                                <div className="avaliacoes-section">
                                    <h3 className="details-heading">Avaliações Recentes</h3>
                                    <div className="avaliacoes-card">
                                        <div className="avaliacao-item">
                                            <div className="avaliacao-topo">
                                                <div className="avaliacao-user">
                                                    <div className="avaliacao-avatar">MC</div>
                                                    <div>
                                                        <p className="avaliacao-nome">Mariana Costa</p>
                                                        <p className="avaliacao-data">Passou na prova em Out/2024</p>
                                                    </div>
                                                </div>
                                                <div className="avaliacao-estrelas">★★★★★</div>
                                            </div>
                                            <p className="avaliacao-texto">
                                                Em desenvolvimento — as avaliações serão exibidas aqui em breve.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* FOOTER */}
                        <footer className="footer-perfil-pub">
                            <span>© {ano} IDrive. Todos os direitos reservados.</span>
                            <div className="footer-links">
                                <a href="#">Suporte</a>
                                <a href="#">Privacidade</a>
                                <a href="#">Termos</a>
                                <a href="#">Ajuda</a>
                            </div>
                        </footer>

                    </div>
                )}
            </main>
        </div>
    );
}