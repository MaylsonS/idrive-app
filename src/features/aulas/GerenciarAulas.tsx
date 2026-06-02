import { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { aulaService } from '../../services/aulaService';
import type { AulaRequestDTO, AulaResponseDTO } from '../../services/aulaService';
import { useAuthContext } from '../../contexts/AuthContext';
import './GerenciarAulas.css';

function formatarDataExtenso(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
}

function formatarHora(iso: string) {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function GerenciarAulas() {
    const { tipoPerfil } = useAuthContext();

    // Form state
    const [data, setData] = useState('');
    const [horaInicio, setHoraInicio] = useState('');
    const [horaFim, setHoraFim] = useState('');
    const [valor, setValor] = useState('');
    const [descricao, setDescricao] = useState('');
    const [enviando, setEnviando] = useState(false);

    // Anúncios ativos — buscados do back
    const [anunciosAtivos, setAnunciosAtivos] = useState<AulaResponseDTO[]>([]);
    const [loadingAtivos, setLoadingAtivos] = useState(true);

    // Histórico — todos os meus anúncios
    const [historico, setHistorico] = useState<AulaResponseDTO[]>([]);
    const [loadingHistorico, setLoadingHistorico] = useState(true);

    function carregarDados() {
        // Anúncios ativos = minhas aulas com status ABERTA
        aulaService.listarMinhasAulas()
            .then(data => {
                setAnunciosAtivos(data.filter(a => a.status === 'ABERTA'));
                setHistorico(data.filter(a => a.status !== 'ABERTA'));
            })
            .catch(console.error)
            .finally(() => {
                setLoadingAtivos(false);
                setLoadingHistorico(false);
            });
    }

    useEffect(() => {
        carregarDados();
    }, []);

    const handlePublicar = async (e: React.FormEvent) => {
        e.preventDefault();
        setEnviando(true);
        try {
            const payload: AulaRequestDTO = {
                inicio: `${data}T${horaInicio}:00`,
                fim: `${data}T${horaFim}:00`,
                valor: parseFloat(valor.replace(',', '.')),
                descricao: descricao
            };
            await aulaService.criarAula(payload);
            alert('Anúncio publicado com sucesso!');
            setData(''); setHoraInicio(''); setHoraFim(''); setValor(''); setDescricao('');
            carregarDados(); // Recarrega a lista após publicar
        } catch (error) {
            console.error('Erro ao publicar', error);
            alert('Erro ao publicar. Verifique se está logado.');
        } finally {
            setEnviando(false);
        }
    };

    function iconeStatus(status: AulaResponseDTO['status']) {
        const map = { ACEITA: '✅', CONCLUIDA: '✅', CANCELADA: '❌', ABERTA: '📅' };
        return map[status];
    }

    function tagStatus(status: AulaResponseDTO['status']) {
        const map = {
            ABERTA: { label: 'Aberta', bg: 'rgba(253,128,71,0.2)', color: '#8C3300' },
            ACEITA: { label: 'Aceita', bg: 'rgba(216,227,251,0.6)', color: '#455064' },
            CONCLUIDA: { label: 'Concluída', bg: 'rgba(187,247,208,0.6)', color: '#166534' },
            CANCELADA: { label: 'Cancelada', bg: 'rgba(254,202,202,0.6)', color: '#991B1B' },
        };
        return map[status];
    }

    return (
        <div className="layout-app">
            <Sidebar itemAtivo="AULAS" />

            <main className="conteudo-principal">

                <header className="header-gerenciar">
                    <h2 className="titulo-gerenciar">Gerenciar Horários</h2>
                    <div className="linha-destaque" />
                </header>

                <div className="grid-dashboard">

                    {/* COLUNA ESQUERDA */}
                    <div className="coluna-esquerda">

                        {/* Formulário */}
                        <section className="card-formulario">
                            <div className="borda-lateral-form" />
                            <h3 className="titulo-secao">
                                <span style={{ color: '#9F3B02' }}>＋</span> Novo Anúncio
                            </h3>

                            <form onSubmit={handlePublicar} className="form-anuncio">
                                <div className="linha-inputs">
                                    <div className="grupo-input">
                                        <label>DATA DA AULA</label>
                                        <input type="date" className="input-padrao" value={data}
                                            onChange={e => setData(e.target.value)} required />
                                    </div>
                                    <div className="grupo-input">
                                        <label>TIPO DE CÂMBIO</label>
                                        <select className="input-padrao select-padrao">
                                            <option>Manual</option>
                                            <option>Automático</option>
                                            <option>Elétrico</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="linha-inputs">
                                    <div className="grupo-input">
                                        <label>HORÁRIO DE INÍCIO</label>
                                        <input type="time" className="input-padrao" value={horaInicio}
                                            onChange={e => setHoraInicio(e.target.value)} required />
                                    </div>
                                    <div className="grupo-input">
                                        <label>HORÁRIO DE TÉRMINO</label>
                                        <input type="time" className="input-padrao" value={horaFim}
                                            onChange={e => setHoraFim(e.target.value)} required />
                                    </div>
                                </div>

                                <div className="grupo-input">
                                    <label>VALOR DA AULA (R$)</label>
                                    <div className="input-valor-wrap">
                                        <span className="prefixo-rs">R$</span>
                                        <input type="number" step="0.01" className="input-padrao input-com-prefixo"
                                            placeholder="85,00" value={valor}
                                            onChange={e => setValor(e.target.value)} required />
                                    </div>
                                </div>

                                <div className="grupo-input">
                                    <label>DESCRIÇÃO DO ANÚNCIO (OPCIONAL)</label>
                                    <textarea className="input-padrao" rows={3}
                                        placeholder="Ex: Ponto de encontro próximo ao metrô..."
                                        value={descricao} onChange={e => setDescricao(e.target.value)} />
                                </div>

                                <button type="submit" className="btn-publicar" disabled={enviando}>
                                    {enviando ? 'Publicando...' : 'Publicar Horário'}
                                </button>
                            </form>
                        </section>

                        {/* Anúncios Ativos */}
                        <section>
                            <div className="header-ativos">
                                <h3 className="titulo-secao" style={{ marginBottom: 0 }}>
                                    Anúncios Ativos
                                </h3>
                                <span className="tag-quantidade">
                                    {anunciosAtivos.length} DISPONÍVEIS
                                </span>
                            </div>

                            {loadingAtivos && <p style={{ color: '#999', fontSize: '14px' }}>Carregando...</p>}

                            {!loadingAtivos && anunciosAtivos.length === 0 && (
                                <p style={{ color: '#999', fontSize: '14px' }}>Nenhum anúncio aberto no momento.</p>
                            )}

                            {anunciosAtivos.map(a => {
                                const tag = tagStatus(a.status);
                                return (
                                    <div key={a.id} className="card-ativo">
                                        <div className="card-ativo-topo">
                                            <span className="tag-status-ativo" style={{ background: tag.bg, color: tag.color }}>
                                                {tag.label}
                                            </span>
                                            <button className="btn-lixo" title="Cancelar anúncio">🗑</button>
                                        </div>
                                        <div className="info-ativo">
                                            <h4>{formatarDataExtenso(a.inicio)}</h4>
                                            <p>{formatarHora(a.inicio)} – {formatarHora(a.fim)}</p>
                                        </div>
                                        <div className="card-ativo-rodape">
                                            <span className="preco-ativo">R$ {a.valor.toFixed(2).replace('.', ',')}</span>
                                            <span style={{ fontSize: '12px', color: '#595C5E' }}>Aguardando {tipoPerfil === 'INSTRUTOR' ? 'aluno' : 'instrutor'}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </section>

                    </div>

                    {/* COLUNA DIREITA */}
                    <aside className="coluna-direita">

                        {/* Nota média — dado real do back quando disponível */}
                        <div className="card-nota-media">
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Avaliação Média
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                <span style={{ color: '#E16B34', fontSize: '20px' }}>★</span>
                                <span style={{ fontWeight: 800, fontSize: '24px', color: '#2C2F31' }}>
                                    {/* TODO: buscar notaMedia do perfil do usuário logado */}
                                    --/5
                                </span>
                            </div>
                        </div>

                        {/* Histórico */}
                        <div className="historico-titulo">
                            <span style={{ fontSize: '16px' }}>🕐</span>
                            <h3 className="titulo-secao" style={{ marginBottom: 0, fontSize: '18px' }}>
                                Histórico de Anúncios
                            </h3>
                        </div>

                        {loadingHistorico && <p style={{ color: '#999', fontSize: '14px', padding: '0 0 12px' }}>Carregando...</p>}

                        {!loadingHistorico && historico.length === 0 && (
                            <p style={{ color: '#999', fontSize: '14px', padding: '0 0 12px' }}>Sem histórico ainda.</p>
                        )}

                        {historico.map(a => (
                            <div key={a.id} className="item-historico">
                                <div className="icone-historico">{iconeStatus(a.status)}</div>
                                <div>
                                    <p style={{ fontWeight: 700, color: '#2C2F31', fontSize: '14px', margin: 0 }}>
                                        {formatarDataExtenso(a.inicio)}, {formatarHora(a.inicio)}
                                    </p>
                                    <p style={{ fontSize: '11px', color: '#595C5E', textTransform: 'uppercase', margin: 0 }}>
                                        {tagStatus(a.status).label} • R$ {a.valor.toFixed(2).replace('.', ',')}
                                    </p>
                                </div>
                            </div>
                        ))}

                        <button className="btn-ver-historico">
                            Ver histórico completo →
                        </button>
                    </aside>

                </div>
            </main>
        </div>
    );
}
