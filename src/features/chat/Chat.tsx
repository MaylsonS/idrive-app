import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { api } from '../../services/api';
import { perfilService } from '../../services/perfilService';
import './Chat.css';

interface MessageEntity {
  id: number;
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
  online: boolean;
  avatar?: string;
}

const Chat: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<MessageEntity[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const stompClientRef = useRef<Stomp.Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserAndRooms = async () => {
      try {
        const [perfil, roomsResponse] = await Promise.all([
          perfilService.meuPerfil(),
          api.get<ChatRoom[]>('/api/chat/rooms')
        ]);
        setCurrentUser(perfil.nome);
        setRooms(roomsResponse.data);
      } catch (error) {
        setCurrentUser('Usuário');
      }
    };
    fetchUserAndRooms();
  }, []);

  useEffect(() => {
    if (roomId && rooms.length > 0) {
      const foundRoom = rooms.find(r => r.id === roomId);
      if (foundRoom) {
        setActiveRoom(foundRoom);
      }
    } else {
      setActiveRoom(null);
    }
  }, [roomId, rooms]);

  useEffect(() => {
    if (roomId) {
      loadHistory(roomId);
      const client = connectWebSocket(roomId);

      return () => {
        if (client) {
          client.disconnect(() => {});
        }
      };
    }
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHistory = async (id: string) => {
    try {
      const response = await api.get<MessageEntity[]>(`/api/chat/${id}/messages`);
      setMessages(response.data);
    } catch (error) {
      setMessages([]);
    }
  };

  const connectWebSocket = (id: string) => {
    const socket = new SockJS('http://localhost:8080/ws');
    const client = Stomp.over(socket);
    client.debug = () => {};

    client.connect({}, () => {
      stompClientRef.current = client;
      client.subscribe(`/topic/chat/${id}`, (message) => {
        const receivedMessage: MessageEntity = JSON.parse(message.body);
        setMessages((prev) => [...prev, receivedMessage]);
      });
    });

    return client;
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !stompClientRef.current || !roomId) return;

    const chatMessage: ChatMessage = {
      sender: currentUser,
      content: newMessage,
      roomId: roomId,
      timestamp: new Date().toISOString()
    };

    stompClientRef.current.send(
      `/app/chat/${roomId}/send`,
      {},
      JSON.stringify(chatMessage)
    );

    setNewMessage('');
  };

  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Mensagens</h2>
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>
        <div className="rooms-list">
          {filteredRooms.map((room) => (
            <div 
              key={room.id} 
              className={`room-item ${roomId === room.id ? 'active' : ''}`}
              onClick={() => navigate(`/chat/${room.id}`)}
            >
              <div className="avatar-container">
                <div className="avatar">
                  {room.name.charAt(0)}
                </div>
                {room.online && <div className="online-indicator" />}
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
          <div className="chat-header">
            <div className="active-user-info">
              <div className="avatar small">{activeRoom.name.charAt(0)}</div>
              <div className="user-status">
                <h3>{activeRoom.name}</h3>
                <span className={activeRoom.online ? 'online' : 'offline'}>
                  {activeRoom.online ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
            </div>
            <button className="btn-agendar">Agendar Aula</button>
          </div>

          <div className="messages-area">
            {messages.map((msg) => (
              <div 
                key={msg.id || Math.random()} 
                className={`message-bubble ${msg.sender === currentUser ? 'sent' : 'received'}`}
              >
                <div className="bubble-content">
                  {msg.content}
                </div>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={sendMessage}>
            <div className="input-wrapper">
              <button type="button" className="input-icon">📎</button>
              <button type="button" className="input-icon">🖼️</button>
              <input 
                type="text" 
                placeholder="Escreva sua mensagem..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="button" className="input-icon">😊</button>
              <button type="submit" className="btn-send">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
  );
};

export default Chat;
