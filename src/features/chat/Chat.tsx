import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { api } from '../../services/api';
import { perfilService } from '../../services/perfilService';
import { aulaService, type AulaResponseDTO } from '../../services/aulaService';
import { Sidebar } from '../../components/Sidebar';
import './Chat.css';

interface MessageEntity {
  id?: number;
  roomId: string;
  sender: string;
  content: string;
  timestamp: string;
}

interface ChatMessage {
  sender: string;
  content: string;
  roomId: string;
  timestamp?: string;
}

interface ChatRoom {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
}

const Chat: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const nomeContatoNovo = location.state?.nomeContato || 'Novo Contato';

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<MessageEntity[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Guardamos o ID do logado para saber quem é o outro na sala
  const [meuId, setMeuId] = useState<string>('');
  const [currentUser, setCurrentUser] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para guardar as aulas que o usuário logado tem ABERTAS
  const [minhasAulasAbertas, setMinhasAulasAbertas] = useState<AulaResponseDTO[]>([]);

  const stompClientRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Busca dados globais (Perfil + Salas + Aulas Abertas)
  useEffect(() => {
    async function fetchAllData() {
      try {
        const [perfil, roomsResponse, minhasAulas] = await Promise.all([
          perfilService.meuPerfil(),
          api.get<ChatRoom[]>('/api/chat/rooms'),
          aulaService.listarMinhasAulas()
        ]);

        setMeuId(perfil.id);
        setCurrentUser(perfil.nome);
        setRooms(roomsResponse.data);

        // Filtra apenas as aulas em que o usuário logado é o AUTOR e estão ABERTAS
        const abertas = minhasAulas.filter(a => a.status === 'ABERTA');
        setMinhasAulasAbertas(abertas);

      } catch {
        setCurrentUser('Usuário');
      }
    }
    fetchAllData();
  }, []);

  useEffect(() => {
    if (roomId) {
      const found = rooms.find(r => r.id === roomId);
      if (found) {
        setActiveRoom(found);
      } else {
        setActiveRoom({
          id: roomId,
          name: nomeContatoNovo,
          lastMessage: "Envie uma mensagem para começar.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    } else {
      setActiveRoom(null);
    }
  }, [roomId, rooms, nomeContatoNovo]);

  useEffect(() => {
    if (!roomId) return;
    loadHistory(roomId);
    const client = connectWebSocket(roomId);
    return () => {
      client.deactivate();
    };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadHistory(id: string) {
    try {
      const response = await api.get<MessageEntity[]>(`/api/chat/${id}/messages`);
      setMessages(response.data);
    } catch {
      setMessages([]);
    }
  }

  function connectWebSocket(id: string): Client {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws') as WebSocket,
      onConnect: () => {
        stompClientRef.current = client;
        client.subscribe(`/topic/chat/${id}`, (message) => {
          const received: MessageEntity = JSON.parse(message.body);
          setMessages(prev => [...prev, received]);
        });
      },
      debug: () => {},
    });

    client.activate();
    return client;
  }

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !stompClientRef.current || !roomId) return;

    const chatMessage: ChatMessage = {
      sender: currentUser,
      content: newMessage,
      roomId,
      timestamp: new Date().toISOString(),
    };

    stompClientRef.current.publish({
      destination: `/app/chat/${roomId}/send`,
      body: JSON.stringify(chatMessage),
    });

    setNewMessage('');
  }

  // ── MÁGICA: Função para aceitar o acordo ──
  async function handleAceitarAcordo() {
      if (!roomId || !meuId || minhasAulasAbertas.length === 0) return;

      // O RoomId é idA_idB. Tiramos o nosso ID para sobrar apenas o ID do interessado.
      const partes = roomId.split('_');
      const interessadoId = partes.find(id => id !== meuId);

      if (!interessadoId) return;

      // Pega o primeiro anúncio aberto do usuário (se ele tiver mais de um, simplificamos pegando o mais antigo/primeiro)
      const aulaPendente = minhasAulasAbertas[0];

      const confirmar = window.confirm(`Deseja fechar o acordo com ${activeRoom?.name} para o seu anúncio? Ele será movido para suas aulas confirmadas.`);
      if (!confirmar) return;

      try {
          await aulaService.aceitarAula(aulaPendente.id, interessadoId);
          alert('Acordo fechado com sucesso! A aula agora está Confirmada.');

          // Remove a aula da lista de abertas para o botão sumir automaticamente
          setMinhasAulasAbertas(prev => prev.filter(a => a.id !== aulaPendente.id));
      } catch (error) {
          console.error("Erro ao fechar acordo", error);
          alert("Erro ao aceitar o usuário. Tente novamente.");
      }
  }

  const filteredRooms = rooms.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="layout-app">
      <Sidebar itemAtivo="CHAT" />

      <main className="conteudo-principal" style={{ padding: 0, height: '100vh', display: 'flex', flexDirection: 'column' }}>

        <div className="chat-container" style={{ flex: 1, margin: 0, borderRadius: 0, border: 'none', maxWidth: '100%' }}>

          <div className="chat-sidebar">
            <div className="sidebar-header">
              <h2>Mensagens</h2>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <span className="search-icon">🔍</span>
              </div>
            </div>

            <div className="rooms-list">
              {filteredRooms.length === 0 && (
                <p className="rooms-vazio">Nenhuma conversa ainda.</p>
              )}
              {filteredRooms.map(room => (
                <div
                  key={room.id}
                  className={`room-item ${roomId === room.id ? 'active' : ''}`}
                  onClick={() => navigate(`/chat/${room.id}`)}
                >
                  <div className="avatar-container">
                    <div className="avatar">{room.name.charAt(0)}</div>
                  </div>
                  <div className="room-info">
                    <div className="room-top">
                      <span className="room-name">{room.name}</span>
                      <span className="room-time">{room.time}</span>
                    </div>
                    <div className="room-bottom">
                      <span className="last-message">{room.lastMessage}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {activeRoom ? (
            <div className="chat-window">
              <div className="chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                <div className="active-user-info">
                  <div className="avatar small">{activeRoom.name.charAt(0)}</div>
                  <div className="user-status">
                    <h3>{activeRoom.name}</h3>
                  </div>
                </div>

                {/* O BOTÃO SÓ APARECE SE O USUÁRIO LOGADO TIVER UM ANÚNCIO ABERTO */}
                {minhasAulasAbertas.length > 0 && (
                    <button
                        onClick={handleAceitarAcordo}
                        style={{
                            background: '#10B981', color: '#FFF', border: 'none', padding: '10px 20px',
                            borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '13px',
                            boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)'
                        }}
                    >
                        ✅ Fechar Acordo
                    </button>
                )}

              </div>

              <div className="messages-area">
                {messages.map((msg, idx) => (
                  <div
                    key={msg.id ?? `temp-${idx}`}
                    className={`message-bubble ${msg.sender === currentUser ? 'sent' : 'received'}`}
                  >
                    <div className="bubble-content">{msg.content}</div>
                    <span className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-input-area" onSubmit={sendMessage}>
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="Escreva sua mensagem..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                  />
                  <button type="submit" className="btn-send">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="chat-placeholder">
              <div className="placeholder-content">
                <div className="placeholder-icon">💬</div>
                <p>Selecione uma conversa para começar</p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Chat;