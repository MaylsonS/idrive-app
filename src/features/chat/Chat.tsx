import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { api } from '../../services/api';
import { perfilService } from '../../services/perfilService';
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
  const nomeContatoNovo = location.state?.nomeContato || '';

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<MessageEntity[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const stompClientRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchUserAndRooms() {
      try {
        const [perfil, roomsResponse] = await Promise.all([
          perfilService.meuPerfil(),
          api.get<ChatRoom[]>('/api/chat/rooms'),
        ]);
        setCurrentUser(perfil.nome);
        setRooms(roomsResponse.data);
      } catch {
        setCurrentUser('Usuário');
      }
    }
    fetchUserAndRooms();
  }, []);

  // CORREÇÃO: quando a sala não está na lista (ex: sala recém-criada sem mensagens),
  // busca o nome do contato no endpoint /info em vez de mostrar "Novo Contato".
  useEffect(() => {
    if (!roomId) {
      setActiveRoom(null);
      return;
    }

    const found = rooms.find(r => r.id === roomId);
    if (found) {
      setActiveRoom(found);
      return;
    }

    // Se veio com nome via navigation state, usa imediatamente enquanto carrega
    if (nomeContatoNovo) {
      setActiveRoom({
        id: roomId,
        name: nomeContatoNovo,
        lastMessage: 'Envie uma mensagem para começar.',
        time: '',
      });
    }

    // Busca o nome oficial no backend (funciona mesmo após F5)
    api.get<{ name: string }>(`/api/chat/${roomId}/info`)
      .then(res => {
        setActiveRoom({
          id: roomId,
          name: res.data.name,
          lastMessage: 'Envie uma mensagem para começar.',
          time: '',
        });
      })
      .catch(() => {
        // Mantém o nome do state se a requisição falhar
        if (!nomeContatoNovo) {
          setActiveRoom({
            id: roomId,
            name: 'Usuário',
            lastMessage: '',
            time: '',
          });
        }
      });
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
          // CORREÇÃO: o backend agora retorna MessageEntity (com id e timestamp corretos)
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

  const filteredRooms = rooms.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="layout-app">
      <Sidebar itemAtivo="CHAT" />

      <main className="conteudo-principal" style={{ padding: 0, height: '100vh', display: 'flex', flexDirection: 'column' }}>

        <div className="chat-container" style={{ flex: 1, margin: 0, borderRadius: 0, border: 'none', maxWidth: '100%' }}>

          {/* SIDEBAR DE CONVERSAS */}
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

          {/* JANELA DE MENSAGENS */}
          {activeRoom ? (
            <div className="chat-window">
              <div className="chat-header">
                <div className="active-user-info">
                  <div className="avatar small">{activeRoom.name.charAt(0)}</div>
                  <div className="user-status">
                    <h3>{activeRoom.name}</h3>
                  </div>
                </div>
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
                      <path
                        d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
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