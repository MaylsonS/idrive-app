import { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { aulaService, type AulaResponseDTO } from '../../services/aulaService';
import { useAuthContext } from '../../contexts/AuthContext';
import './Anuncios.css';

function formatarHora(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatarData(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function calcularDuracao(inicio: string, fim: string) {
    const diff = (new Date(fim).getTime() - new Date(inicio).getTime()) / 60000;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return h > 0 ? `${h}h${m > 0 ? 'min' : ''}` : `${m}min`;
}

const FILTROS = ['Todos', 'Câmbio Manual', 'Câmbio Automático', 'Veículos Elétricos', 'Direção Defensiva'];

export default function Anuncios() {
    const [anuncios, setAnuncios] = useState<AulaResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [filtroAtivo, setFiltroAtivo] = useState('Todos');
    const { tipoPerfil } = useAuthContext();

    useEffect(() => {
        aulaService.listarAnunciosPublicos()
            .then(data => setAnuncios(data))
            .catch(() => setErro('Não foi possível carregar os anúncios.'))
            .finally(() => setLoading(false));
    }, []);

    const isInstrutor = tipoPerfil === 'INSTRUTOR';

    return (
        <div className="layout-app">
            <Sidebar itemAtivo="ANUNCIOS" />

            <main className="conteudo-principal">

                <section className="hero-anuncios">
                    <div className="hero-overlay" />
                    <div className="hero-gradient" />
                    <div className="hero-content">
                        <p className="hero-eyebrow">DISPONÍVEL HOJE</p>
                        <h1 className="hero-titulo">
                            {isInstrutor
                                ? 'Encontre alunos que\nprecisam de você.'
                                : 'Encontre seu instrutor\nperfeito e pegue a estrada.'}
                        </h1>
                        <p className="hero-subtitulo">
                            {isInstrutor
                                ? 'Veja os pedidos de alunos buscando um instrutor na sua cidade.'
                                : 'Escolha entre mais de 150 instrutores certificados com as maiores notas de segurança na sua cidade.'}
                        </p>
                    </div>
                </section>

                <div className="filtros-row">
                    {FILTROS.map(f => (
                        <button
                            key={f}
                            className={`filtro-chip ${filtroAtivo === f ? 'ativo' : ''}`}
                            onClick={() => setFiltroAtivo(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Estados */}
                {loading && (
                    <div className="estado-centralizado">
                        <div className="spinner" />
                        <p>Carregando anúncios...</p>
                    </div>
                )}

                {!loading && erro && (
                    <div className="estado-centralizado erro">
                        <p>⚠️ {erro}</p>
                        <button onClick={() => window.location.reload()} className="btn-tentar-novamente">
                            Tentar novamente
                        </button>
                    </div>
                )}

                {!loading && !erro && anuncios.length === 0 && (
                    <div className="estado-centralizado">
                        <p style={{ fontSize: '48px' }}>📭</p>
                        <p>Nenhum anúncio disponível no momento.</p>
                    </div>
                )}

                {/* Grid de cards */}
                {!loading && !erro && anuncios.length > 0 && (
                    <div className="anuncios-grid">
                        {anuncios.map(anuncio => (
                            <CardAnuncio
                                key={anuncio.id}
                                anuncio={anuncio}
                                isInstrutor={isInstrutor}
                            />
                        ))}
                    </div>
                )}

            </main>
        </div>
    );
}

function CardAnuncio({ anuncio, isInstrutor }: { anuncio: AulaResponseDTO; isInstrutor: boolean }) {
    // Gera cor de avatar baseada no nome
    const cores = ['#4F7BEF', '#E16B34', '#10B981', '#8B5CF6', '#F59E0B'];
    const cor = cores[anuncio.autor.charCodeAt(0) % cores.length];

    // Especialidade mock baseada na descrição (futuramente virá do back)
    const especialidade = anuncio.descricao
        ? anuncio.descricao.split(' ').slice(0, 3).join(' ') + '...'
        : isInstrutor ? 'Buscando instrutor' : 'Manual & Auto';

    return (
        <div className="card-anuncio">

            {/* Topo: avatar + nome + rating */}
            <div className="card-topo">
                <div className="card-avatar-wrap">
                    <div className="card-avatar" style={{ background: cor }}>
                        {anuncio.autor.charAt(0).toUpperCase()}
                    </div>
                </div>
                <div className="card-info">
                    <h3 className="card-nome">{anuncio.autor}</h3>
                    <div className="card-rating">
                        <span className="estrela">★</span>
                        <span className="nota">
                            {/* Nota virá do back futuramente */}
                            {(4.5 + Math.random() * 0.5).toFixed(1)}
                        </span>
                        <span className="avaliacoes">(--)</span>
                    </div>
                    <span className="card-tag">{especialidade.toUpperCase()}</span>
                </div>
            </div>

            {/* Descrição */}
            <p className="card-descricao">
                {anuncio.descricao || (isInstrutor
                    ? 'Aluno buscando instrutor para aulas práticas.'
                    : 'Instrutor disponível para aulas na data indicada.'
                )}
            </p>

            {/* Divisor + Valor + Botões */}
            <div className="card-rodape">
                <div className="card-preco">
                    <span className="preco-label">POR AULA</span>
                    <span className="preco-valor">
                        R$<br />
                        {anuncio.valor.toFixed(2).replace('.', ',')}
                    </span>
                </div>
                <div className="card-acoes">
                    <button className="btn-ver-perfil">
                        Ver<br />Perfil
                    </button>
                    <button className="btn-agendar">
                        {isInstrutor ? 'Aceitar' : 'Agendar'}<br />Aula
                    </button>
                </div>
            </div>

        </div>
    );
}
