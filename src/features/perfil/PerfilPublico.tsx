import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { perfilService, type PerfilPublicoDTO } from '../../services/perfilService';
import { useAuthContext } from '../../contexts/AuthContext';

// ── Tipos internos ──────────────────────────────────────────
interface AvaliacaoDTO {
  id: string;
  autorNome: string;
  autorFoto?: string;
  data: string;
  nota: number;
  comentario: string;
}

interface DisponibilidadeDTO {
  data: string;        // "2024-11-04"
  horarios: string[];  // ["08:00", "10:00"]
  ocupados: string[];  // ["18:00"]
}

// ── Calendar helpers ────────────────────────────────────────
const DAYS_SHORT = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const MONTH_NAMES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

function pad(n: number) { return String(n).padStart(2, '0'); }
function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y: number, m: number)    { return new Date(y, m, 1).getDay(); }

// ── Sub-components ──────────────────────────────────────────
function Stars({ count = 5, size = 10, color = '#994100' }: { count?: number; size?: number; color?: string }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 10 10" fill="none">
          <path d="M5 0.5L6.18 3.57H9.51L6.83 5.43L7.95 8.5L5 6.54L2.05 8.5L3.17 5.43L0.49 3.57H3.82L5 0.5Z" fill={color} />
        </svg>
      ))}
    </div>
  );
}

function Avatar({ name, foto, size = 40, radius = '50%' }: { name: string; foto?: string; size?: number; radius?: number | string }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  if (foto) {
    return <img src={foto} alt={name} style={{ width: size, height: size, borderRadius: radius, objectFit: 'cover', flexShrink: 0 }} />;
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      background: 'linear-gradient(135deg, #9F3B02 0%, #C95A1A 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 800, fontSize: size * 0.35, fontFamily: 'Manrope, sans-serif',
    }}>
      {initials}
    </div>
  );
}

// ── Calendar component ──────────────────────────────────────
function AvailabilityCalendar({
  disponibilidade,
  onSelectSlot,
}: {
  disponibilidade: DisponibilidadeDTO[];
  onSelectSlot?: (data: string, horario: string) => void;
}) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(
    disponibilidade[0]?.data ?? null
  );
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth  = getDaysInMonth(year, month);
  const firstDay     = getFirstDay(year, month);
  const prevMonthLen = getDaysInMonth(year, month - 1);

  const leading  = Array.from({ length: firstDay },        (_, i) => ({ day: prevMonthLen - firstDay + i + 1, current: false }));
  const current  = Array.from({ length: daysInMonth },     (_, i) => ({ day: i + 1,                          current: true  }));
  const total    = leading.length + current.length;
  const trailing = Array.from({ length: total % 7 === 0 ? 0 : 7 - (total % 7) }, (_, i) => ({ day: i + 1, current: false }));
  const cells    = [...leading, ...current, ...trailing];

  // Build lookup from API data
  const slotMap: Record<string, string[]>  = {};
  const bookedMap: Record<string, string[]> = {};
  disponibilidade.forEach(d => {
    slotMap[d.data]   = d.horarios;
    bookedMap[d.data] = d.ocupados;
  });

  const activeSlots  = selectedDate ? slotMap[selectedDate]   ?? [] : [];
  const bookedSlots  = selectedDate ? bookedMap[selectedDate] ?? [] : [];
  const selectedDay  = selectedDate ? parseInt(selectedDate.split('-')[2]) : null;

  function handleSelectSlot(slot: string) {
    setSelectedSlot(slot);
    if (selectedDate) onSelectSlot?.(selectedDate, slot);
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h3 style={{ margin: 0, fontWeight: 700, fontSize: 20, color: '#2C2F31', fontFamily: 'Manrope, sans-serif' }}>
          Disponibilidade
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#595C5E', fontSize: 18, padding: '2px 6px', borderRadius: 6 }}>‹</button>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#595C5E', fontFamily: 'Manrope, sans-serif', minWidth: 130, textAlign: 'center' }}>
            {MONTH_NAMES[month]} {year}
          </span>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#595C5E', fontSize: 18, padding: '2px 6px', borderRadius: 6 }}>›</button>
        </div>
      </div>

      <div style={{ background: '#EEF1F3', borderRadius: 12, padding: 24 }}>
        {/* Day-of-week headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
          {DAYS_SHORT.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 900, color: '#595C5E', letterSpacing: -0.5, textTransform: 'uppercase', fontFamily: 'Manrope, sans-serif', padding: '4px 0' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {cells.map((cell, idx) => {
            const dateKey  = cell.current ? `${year}-${pad(month + 1)}-${pad(cell.day)}` : null;
            const hasSlots = dateKey && slotMap[dateKey];
            const isSelected = cell.current && cell.day === selectedDay;

            return (
              <button key={idx}
                onClick={() => { if (cell.current && hasSlots) { setSelectedDate(dateKey); setSelectedSlot(null); } }}
                style={{
                  width: '100%', aspectRatio: '1', border: 'none', borderRadius: 8, minHeight: 40,
                  cursor: cell.current && hasSlots ? 'pointer' : 'default',
                  background: isSelected ? '#9F3B02' : cell.current ? '#FFFFFF' : 'transparent',
                  color: isSelected ? '#FFEFEA' : !cell.current ? 'rgba(89,92,94,0.3)' : '#2C2F31',
                  fontWeight: 700, fontSize: 14, fontFamily: 'Manrope, sans-serif',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isSelected ? '0px 0px 0px 4px rgba(159,59,2,0.2), 0px 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
                  opacity: cell.current && !hasSlots && !isSelected ? 0.4 : 1,
                  transition: 'all 0.15s ease',
                }}>
                {cell.day}
              </button>
            );
          })}
        </div>

        {/* Time slots */}
        {activeSlots.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', color: '#595C5E', marginBottom: 12, fontFamily: 'Manrope, sans-serif' }}>
              Horários Disponíveis ({selectedDate ? `${pad(parseInt(selectedDate.split('-')[2]))} ${MONTH_NAMES[parseInt(selectedDate.split('-')[1]) - 1].slice(0, 3)}` : ''})
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {activeSlots.map(slot => {
                const isBooked = bookedSlots.includes(slot);
                const isActive = selectedSlot === slot;
                return (
                  <button key={slot}
                    onClick={() => !isBooked && handleSelectSlot(slot)}
                    style={{
                      padding: '12px 24px', borderRadius: 8, border: 'none',
                      cursor: isBooked ? 'not-allowed' : 'pointer',
                      background: isActive ? '#9F3B02' : isBooked ? 'rgba(255,255,255,0.5)' : '#FFFFFF',
                      color: isActive ? '#FFEFEA' : isBooked ? 'rgba(89,92,94,0.5)' : '#2C2F31',
                      fontWeight: 700, fontSize: 14, fontFamily: 'Manrope, sans-serif',
                      boxShadow: isActive ? '0px 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.15s ease',
                    }}>
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────
export default function PerfilPublico() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tipoPerfil: meuTipoPerfil } = useAuthContext();

  const [perfil, setPerfil]               = useState<PerfilPublicoDTO | null>(null);
  const [avaliacoes, setAvaliacoes]        = useState<AvaliacaoDTO[]>([]);
  const [disponibilidade, setDisponibilidade] = useState<DisponibilidadeDTO[]>([]);
  const [loading, setLoading]             = useState(true);
  const [erro, setErro]                   = useState<string | null>(null);

  const [agendando, setAgendando]          = useState(false);
  const [slotSelecionado, setSlotSelecionado] = useState<{ data: string; horario: string } | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setErro(null);

    perfilService.buscarPorId(id)
      .then(data => {
        setPerfil(data);

        // Buscar avaliações e disponibilidade em paralelo (endpoints a implementar)
        // Se ainda não existirem no back, basta comentar as duas linhas abaixo.
        // Promise.all([
        //   api.get(`/perfil/${id}/avaliacoes`).then(r => setAvaliacoes(r.data)),
        //   api.get(`/perfil/${id}/disponibilidade`).then(r => setDisponibilidade(r.data)),
        // ]).catch(console.error);
      })
      .catch(() => setErro('Não foi possível carregar o perfil.'))
      .finally(() => setLoading(false));
  }, [id]);

  const isInstrutor     = perfil?.tipoPerfil === 'INSTRUTOR';
  const euSouInstrutor  = meuTipoPerfil === 'INSTRUTOR';

  // Badge label
  const badge = isInstrutor ? 'Instrutor Verificado' : 'Aluno Ativo';

  // "totalAulas" como info de experiência para instrutor
  const experiencia = isInstrutor
    ? `${perfil?.totalAulas ?? 0} aulas ministradas`
    : `${perfil?.totalAulas ?? 0} aulas realizadas`;

  function handleAgendar() {
    if (!slotSelecionado) return;
    // TODO: chamar aulaService.solicitarAula(id, slotSelecionado.data, slotSelecionado.horario)
    navigate(`/agendar/${id}`, { state: slotSelecionado });
  }

  // ── Render ──
  return (
    <div className="layout-app" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <Sidebar itemAtivo="PERFIL" />

      <main style={{ flex: 1, background: '#F5F7F9', minHeight: '100vh', overflowY: 'auto' }}>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
            <div style={{ width: 36, height: 36, border: '3px solid #EEF1F3', borderTopColor: '#9F3B02', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: '#595C5E', fontSize: 14 }}>Carregando perfil...</p>
          </div>
        ) : erro || !perfil ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
            <p style={{ color: '#9F3B02', fontWeight: 700, fontSize: 16 }}>{erro ?? 'Perfil não encontrado.'}</p>
            <button onClick={() => navigate(-1)} style={{ color: '#9F3B02', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, textDecoration: 'underline' }}>
              Voltar
            </button>
          </div>
        ) : (
          <div style={{ maxWidth: 1024, margin: '0 auto', padding: '32px 24px 80px' }}>

            {/* ── HERO ── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isInstrutor ? '1fr 336px' : '1fr',
              gap: 24,
              marginBottom: 32,
            }}>
              {/* Profile card */}
              <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 32, display: 'flex', gap: 32, alignItems: 'flex-start', position: 'relative', overflow: 'hidden' }}>
                {/* Decorative circle */}
                <div style={{ position: 'absolute', width: 256, height: 256, right: -128, top: -128, background: 'rgba(159,59,2,0.05)', borderRadius: '50%', pointerEvents: 'none' }} />

                {/* Avatar */}
                <div style={{ width: 192, height: 192, borderRadius: 16, overflow: 'hidden', flexShrink: 0, boxShadow: '0px 1px 2px rgba(0,0,0,0.05)', zIndex: 1 }}>
                  <Avatar name={perfil.nome} size={192} radius={16} />
                </div>

                {/* Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, zIndex: 2, minWidth: 0 }}>
                  {/* Badge + rating */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ background: 'rgba(159,59,2,0.1)', color: '#9F3B02', fontSize: 10, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', padding: '4px 12px', borderRadius: 9999 }}>
                      {badge}
                    </span>
                    {isInstrutor && perfil.notaMedia != null && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Stars count={1} size={11} />
                        <span style={{ fontWeight: 700, fontSize: 14, color: '#994100' }}>{perfil.notaMedia.toFixed(1)}</span>
                        <span style={{ fontSize: 14, color: '#595C5E' }}>({avaliacoes.length} avaliações)</span>
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <h1 style={{ margin: 0, fontSize: 36, fontWeight: 800, color: '#2C2F31', letterSpacing: -0.9, lineHeight: '40px' }}>
                    {perfil.nome}
                  </h1>

                  {/* Descrição / especialidade */}
                  {perfil.descricao && (
                    <p style={{ margin: 0, fontSize: 16, color: '#595C5E', lineHeight: '26px', maxWidth: 576 }}>
                      {perfil.descricao}
                    </p>
                  )}

                  {/* Meta */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {/* Clock icon */}
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path fillRule="evenodd" clipRule="evenodd" d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8C1.5 11.59 4.41 14.5 8 14.5C11.59 14.5 14.5 11.59 14.5 8C14.5 4.41 11.59 1.5 8 1.5ZM8 3C8.55 3 9 3.45 9 4V7.59L10.71 9.29C11.1 9.68 11.1 10.31 10.71 10.7C10.32 11.09 9.69 11.09 9.3 10.7L7.3 8.7C7.11 8.51 7 8.26 7 8V4C7 3.45 7.45 3 8 3Z" fill="#9F3B02"/>
                      </svg>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#2C2F31' }}>{experiencia}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Avaliações recentes (só instrutor) */}
              {isInstrutor && avaliacoes.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h3 style={{ margin: 0, fontWeight: 700, fontSize: 20, color: '#2C2F31' }}>Avaliações Recentes</h3>
                  <div style={{ background: '#EEF1F3', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {avaliacoes.slice(0, 2).map(av => (
                      <div key={av.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Avatar name={av.autorNome} foto={av.autorFoto} size={40} />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 14, color: '#2C2F31' }}>{av.autorNome}</div>
                              <div style={{ fontSize: 10, color: '#595C5E', marginTop: 2 }}>{av.data}</div>
                            </div>
                          </div>
                          <Stars count={av.nota} size={10} />
                        </div>
                        <p style={{ margin: 0, fontSize: 14, color: '#595C5E', lineHeight: '23px' }}>{av.comentario}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Placeholder avaliações vazio (só instrutor) */}
              {isInstrutor && avaliacoes.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h3 style={{ margin: 0, fontWeight: 700, fontSize: 20, color: '#2C2F31' }}>Avaliações Recentes</h3>
                  <div style={{ background: '#EEF1F3', borderRadius: 12, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
                    <p style={{ margin: 0, fontSize: 14, color: '#595C5E' }}>Nenhuma avaliação ainda.</p>
                  </div>
                </div>
              )}
            </div>

            {/* ── DETAILS ── */}
            <div style={{ display: 'grid', gridTemplateColumns: isInstrutor ? '1fr 1fr' : '1fr', gap: 24, alignItems: 'start' }}>

              {/* Sobre */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: 20, color: '#2C2F31' }}>
                  {isInstrutor ? 'Sobre o Instrutor' : 'Sobre o Aluno'}
                </h3>
                <div style={{ background: '#FFFFFF', borderRadius: 12, padding: 24, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: '#9F3B02', borderRadius: '12px 0 0 12px' }} />
                  <p style={{ margin: 0, fontSize: 16, color: '#595C5E', lineHeight: '26px', paddingLeft: 4 }}>
                    {perfil.descricao ?? 'Sem descrição.'}
                  </p>
                </div>
              </div>

              {/* Calendário (só instrutor, só se eu for aluno) */}
              {isInstrutor && !euSouInstrutor && (
                <AvailabilityCalendar
                  disponibilidade={disponibilidade}
                  onSelectSlot={(data, horario) => setSlotSelecionado({ data, horario })}
                />
              )}
            </div>

            {/* CTA agendar */}
            {isInstrutor && !euSouInstrutor && (
              <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleAgendar}
                  disabled={!slotSelecionado || agendando}
                  style={{
                    background: slotSelecionado ? '#9F3B02' : '#CBD5E1',
                    color: slotSelecionado ? '#FFEFEA' : '#94A3B8',
                    border: 'none', borderRadius: 8, padding: '14px 32px',
                    fontWeight: 700, fontSize: 16, fontFamily: 'Manrope, sans-serif',
                    cursor: slotSelecionado ? 'pointer' : 'not-allowed',
                    boxShadow: slotSelecionado ? '0px 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s ease',
                  }}>
                  {agendando ? 'Agendando...' : 'Agendar Aula'}
                </button>
              </div>
            )}

          </div>
        )}

        {/* Footer */}
        <footer style={{ borderTop: '1px solid #F1F5F9', padding: '48px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1024, margin: '0 auto' }}>
          <span style={{ fontSize: 12, color: '#64748B' }}>© 2024 IDrive Kinetic. Todos os direitos reservados.</span>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Suporte', 'Privacidade', 'Termos', 'Ajuda'].map(link => (
              <a key={link} href="#" style={{ fontSize: 12, color: '#94A3B8', textDecoration: 'none' }}>{link}</a>
            ))}
          </div>
        </footer>

        {/* Spinner keyframe */}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    </div>
  );
}