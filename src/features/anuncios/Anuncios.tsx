import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { aulaService, type AulaResponseDTO } from '../../services/aulaService';
import { perfilService } from '../../services/perfilService';
import { useAuthContext } from '../../contexts/AuthContext';
import './Anuncios.css';

function gerarRoomId(idA: string, idB: string): string {
    return [idA, idB].sort().join('_');
}

const FILTROS = ['Todos', 'Motocicletas', 'Câmbio Manual', 'Câmbio Automático', 'Veículos Elétricos', 'Direção Defensiva'];

export default function Anuncios() {
    const [anuncios, setAnuncios] = useState<AulaResponseDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [filtroAtivo, setFiltroAtivo] = useState('Todos');
    const [meuId, setMeuId] = useState<string | null>(null);
    const { tipoPerfil } = useAuthContext();

    useEffect(() => {
        // Busca o id do usuário logado uma única vez via /perfil/me
        perfilService.meuPerfil().then(p => setMeuId(p.id));
    }, []);

    useEffect(() => {
        aulaService.listarAnunciosPublicos()
            .then(data => setAnuncios(data))
            .catch(() => setErro('Não foi possível carregar os anúncios.'))
            .finally(() => setLoading(false));
    }, []);

    const isInstrutor = tipoPerfil === 'INSTRUTOR';

    const anunciosFiltrados = filtroAtivo === 'Todos'
        ? anuncios
        : anuncios.filter(a =>
            a.descricao?.toLowerCase().includes(filtroAtivo.toLowerCase())
        );

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

                {!loading && !erro && anunciosFiltrados.length === 0 && (
                    <div className="estado-centralizado">
                        <p style={{ fontSize: '48px' }}>📭</p>
                        <p>Nenhum anúncio disponível no momento.</p>
                    </div>
                )}

                {!loading && !erro && anunciosFiltrados.length > 0 && (
                    <div className="anuncios-grid">
                        {anunciosFiltrados.map(anuncio => (
                            <CardAnuncio
                                key={anuncio.id}
                                anuncio={anuncio}
                                isInstrutor={isInstrutor}
                                meuId={meuId}
                            />
                        ))}
                    </div>
                )}

            </main>
        </div>
    );
}

function CardAnuncio({
    anuncio,
    isInstrutor,
    meuId
}: {
    anuncio: AulaResponseDTO;
    isInstrutor: boolean;
    meuId: string | null;
}) {
    const navigate = useNavigate();

    const cores = ['#4F7BEF', '#E16B34', '#10B981', '#8B5CF6', '#F59E0B'];
    const cor = cores[anuncio.autor.charCodeAt(0) % cores.length];

    const especialidade = anuncio.descricao
        ? anuncio.descricao.split(' ').slice(0, 3).join(' ') + '...'
        : isInstrutor ? 'Buscando instrutor' : 'Manual & Auto';

    function handleAgendar() {
        if (!meuId || !anuncio.autorId) return;
        const roomId = gerarRoomId(meuId, anuncio.autorId.toString());
        navigate(`/chat/${roomId}`);
    }

    return (
        <div className="card-anuncio">

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
                            {(4.5 + Math.random() * 0.5).toFixed(1)}
                        </span>
                        <span className="avaliacoes">(--)</span>
                    </div>
                    <span className="card-tag">{especialidade.toUpperCase()}</span>
                </div>
            </div>

            <p className="card-descricao">
                {anuncio.descricao || (isInstrutor
                    ? 'Aluno buscando instrutor para aulas práticas.'
                    : 'Instrutor disponível para aulas na data indicada.'
                )}
            </p>

            <div className="card-rodape">
                <div className="card-preco">
                    <span className="preco-label">POR AULA</span>
                    <span className="preco-valor">
                        R$<br />
                        {anuncio.valor.toFixed(2).replace('.', ',')}
                    </span>
                </div>
                <div className="card-acoes">
                    <button className="btn-ver-perfil" onClick={() => navigate(`/perfil/${anuncio.autorId}`)}>
                        Ver<br />Perfil
                    </button>
                    <button
                        className="btn-agendar"
                        onClick={handleAgendar}
                        disabled={!meuId}
                    >
                        {isInstrutor ? 'Aceitar' : 'Agendar'}<br />Aula
                    </button>
                </div>
            </div>

        </div>
    );
}