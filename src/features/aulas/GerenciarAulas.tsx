// src/features/aulas/GerenciarAulas.tsx
import { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { aulaService} from '../../services/aulaService';
import type { AulaRequestDTO } from '../../services/aulaService';


export function GerenciarAulas() {
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
        valor: parseFloat(valor.replace(',', '.')), // Converte "85,00" para 85.00 numérico
        descricao: descricao
      };

      console.log("Enviando para o Java:", payload);

      const resposta = await aulaService.criarAula(payload);
      alert("Horário publicado com sucesso!");

      setData(''); setHoraInicio(''); setHoraFim(''); setValor(''); setDescricao('');

    } catch (error) {
      console.error("Erro ao publicar horário", error);
      alert("Erro ao publicar horário. Verifique se você está logado como Instrutor.");
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#F8F9FA' }}>
      {/* Exemplo mockado como INSTRUTOR */}
      <Sidebar itemAtivo="AULAS" perfilUsuario="INSTRUTOR" />

      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '24px', borderBottom: '3px solid #A83B0E', display: 'inline-block', paddingBottom: '5px' }}>
          Gerenciar Horários
        </h2>

        <div style={{ display: 'flex', gap: '24px' }}>

          {/* LADO ESQUERDO: O FORMULÁRIO */}
          <div style={{ flex: 2, backgroundColor: '#FFF', borderRadius: '12px', padding: '32px', boxShadow: '0px 4px 10px rgba(0,0,0,0.05)', borderLeft: '5px solid #A83B0E' }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>+ Novo Anúncio</h3>

            <form onSubmit={handlePublicar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>DATA DA AULA</label>
                  <input type="date" value={data} onChange={e => setData(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #DDD', backgroundColor: '#F2F2F2', marginTop: '5px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>HORÁRIO DE INÍCIO</label>
                  <input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #DDD', backgroundColor: '#F2F2F2', marginTop: '5px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>HORÁRIO DE TÉRMINO</label>
                  <input type="time" value={horaFim} onChange={e => setHoraFim(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #DDD', backgroundColor: '#F2F2F2', marginTop: '5px' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>VALOR DA AULA (R$)</label>
                <div style={{ position: 'relative', marginTop: '5px' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '12px', color: '#666' }}>R$</span>
                  <input type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)} required placeholder="85,00" style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #DDD', backgroundColor: '#F2F2F2' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>DESCRIÇÃO DO ANÚNCIO (OPCIONAL)</label>
                <textarea value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Ex: Ponto de encontro próximo ao metrô..." rows={3} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #DDD', backgroundColor: '#F2F2F2', marginTop: '5px', resize: 'none' }}></textarea>
              </div>

              <button type="submit" style={{ backgroundColor: '#D95C14', color: '#FFF', border: 'none', padding: '16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                Publicar Horário
              </button>

            </form>
          </div>

          {/* LADO DIREITO: HISTÓRICO DE ANÚNCIOS (MOCK) */}
          <div style={{ flex: 1, backgroundColor: '#F0F2F5', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', color: '#333', marginBottom: '20px' }}>Histórico de Anúncios</h3>
            {/* Aqui depois faremos um .map() buscando as aulas do instrutor! */}
            <div style={{ backgroundColor: '#FFF', padding: '16px', borderRadius: '8px', marginBottom: '10px', borderLeft: '4px solid #4CAF50' }}>
               <p style={{ fontWeight: 'bold', fontSize: '14px', margin: 0 }}>20 Out, 14:00</p>
               <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>RESERVADO • R$ 85,00</p>
            </div>
            <div style={{ backgroundColor: '#FFF', padding: '16px', borderRadius: '8px', marginBottom: '10px', borderLeft: '4px solid #F44336' }}>
               <p style={{ fontWeight: 'bold', fontSize: '14px', margin: 0 }}>19 Out, 09:00</p>
               <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>CANCELADO PELO INSTRUTOR</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}