import { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { aulaService } from '../../services/aulaService';
import type { AulaRequestDTO } from '../../services/aulaService';
import './GerenciarAulas.css';

export default function GerenciarAulas() {
  const [data, setData] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');

  const handlePublicar = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const dataHoraInicio = `${data}T${horaInicio}:00`;
      const dataHoraFim = `${data}T${horaFim}:00`;

      const payload: AulaRequestDTO = {
        inicio: dataHoraInicio,
        fim: dataHoraFim,
        valor: parseFloat(valor.replace(',', '.')),
        descricao: descricao
      };

      await aulaService.criarAula(payload);
      alert("Horário publicado com sucesso!");

      setData(''); setHoraInicio(''); setHoraFim(''); setValor(''); setDescricao('');

      // TODO: Aqui chamaremos a função para recarregar a lista de "Anúncios Ativos" do backend

    } catch (error) {
      console.error("Erro ao publicar horário", error);
      alert("Erro ao publicar horário. Verifique se você está logado.");
    }
  };

  return (
    <div className="layout-app">
      <Sidebar itemAtivo="AULAS" />

      <main className="conteudo-principal">

        <header className="header-gerenciar">
          <h2 className="titulo-gerenciar">Gerenciar Horários</h2>
          <div className="linha-destaque"></div>
        </header>

        <div className="grid-dashboard">

          <div className="coluna-esquerda">

            <section className="card-formulario">
              <div className="borda-lateral-form"></div>
              <h3 className="titulo-secao">
                <span style={{color: '#9F3B02'}}>+</span> Novo Anúncio
              </h3>

              <form onSubmit={handlePublicar} className="form-anuncio">

                <div className="linha-inputs">
                  <div className="grupo-input">
                    <label>DATA DA AULA</label>
                    <input
                      type="date"
                      className="input-padrao"
                      value={data}
                      onChange={e => setData(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="linha-inputs">
                  <div className="grupo-input">
                    <label>HORÁRIO DE INÍCIO</label>
                    <input
                      type="time"
                      className="input-padrao"
                      value={horaInicio}
                      onChange={e => setHoraInicio(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grupo-input">
                    <label>HORÁRIO DE TÉRMINO</label>
                    <input
                      type="time"
                      className="input-padrao"
                      value={horaFim}
                      onChange={e => setHoraFim(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grupo-input">
                  <label>VALOR DA AULA (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-padrao"
                    placeholder="Ex: 85,00"
                    value={valor}
                    onChange={e => setValor(e.target.value)}
                    required
                  />
                </div>

                <div className="grupo-input">
                  <label>DESCRIÇÃO DO ANÚNCIO (OPCIONAL)</label>
                  <textarea
                    className="input-padrao"
                    placeholder="Ex: Aula Focada em aprender os conceitos básicos do transito na pratica..."
                    value={descricao}
                    onChange={e => setDescricao(e.target.value)}
                  ></textarea>
                </div>

                <button type="submit" className="btn-publicar">
                  Publicar Horário
                </button>
              </form>
            </section>

            <section>
              <div className="header-ativos">
                <h3 className="titulo-secao" style={{marginBottom: 0}}>Meus Anúncios Ativos</h3>
                <span className="tag-quantidade">2 ABERTOS</span>
              </div>

              {/* Mock de anúncios ativos - Depois faremos um .map() buscando do backend */}
              <div className="card-ativo">
                <div className="info-ativo">
                  <h4>24 de Outubro</h4>
                  <p>08:00 - 09:30</p>
                </div>
                <div className="preco-ativo">R$ 85,00</div>
              </div>

              <div className="card-ativo">
                <div className="info-ativo">
                  <h4>25 de Outubro</h4>
                  <p>10:00 - 11:30</p>
                </div>
                <div className="preco-ativo">R$ 100,00</div>
              </div>
            </section>

          </div>

          {/* COLUNA DIREITA (HISTÓRICO) */}
          <aside className="coluna-direita">

            <div className="historico-header">
              <h3 className="titulo-secao" style={{marginBottom: 0}}>Histórico</h3>
              {/* Avaliação média adicionada aqui! */}
              <div className="media-avaliacao">
                <span>★</span> 4.9 <span style={{fontSize: '11px', color: '#64748B'}}>(12)</span>
              </div>
            </div>

            {/* Mock de Histórico */}
            <div className="item-historico">
              <div className="icone-historico">📅</div>
              <div>
                <p style={{fontWeight: 700, color: '#2C2F31'}}>20 Out, 14:00</p>
                <p style={{fontSize: '11px', color: '#595C5E', textTransform: 'uppercase'}}>Reservado • R$ 85,00</p>
              </div>
            </div>

            <div className="item-historico">
              <div className="icone-historico">❌</div>
              <div>
                <p style={{fontWeight: 700, color: '#2C2F31'}}>19 Out, 09:00</p>
                <p style={{fontSize: '11px', color: '#595C5E', textTransform: 'uppercase'}}>Cancelado pelo Instrutor</p>
              </div>
            </div>

            <div className="item-historico">
              <div className="icone-historico">📅</div>
              <div>
                <p style={{fontWeight: 700, color: '#2C2F31'}}>18 Out, 16:30</p>
                <p style={{fontSize: '11px', color: '#595C5E', textTransform: 'uppercase'}}>Concluído • R$ 85,00</p>
              </div>
            </div>

          </aside>
        </div>
      </main>
    </div>
  );
}