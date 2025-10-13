import React, { useEffect, useState, useRef } from 'react';
import './ChatBox.css';
import { CircleUserRound, SendHorizonal, X } from 'lucide-react';
import io from 'socket.io-client';
import expertApi from '../../../config/expertApi';

// ✅ Single shared socket (same as ChatPage.js)
const socket = io('http://localhost:4000', {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

const ChatBox = ({ open, onClose, assignmentId, currentUser, otherUser }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const endRef = useRef(null);

  // 🔹 Close chat on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // 🔹 Fetch existing chat history
  useEffect(() => {
    if (!open || !assignmentId) return;
    (async () => {
      try {
        const token = localStorage.getItem('expertToken');
        console.log('🔍 Fetching chat history for assignment:', assignmentId);

        const res = await expertApi.get(`/chats/${assignmentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('✅ Chat history fetched:', res.data);
        const data = res.data.messages || res.data; // supports both formats
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('❌ Failed to fetch chat history:', err);
        setMessages([]);
      }
    })();
  }, [open, assignmentId]);

  // 🔹 Socket setup
  useEffect(() => {
    if (!open || !assignmentId) return;

    socket.emit('joinRoom', assignmentId);
    console.log(`✅ Joined socket room: ${assignmentId}`);

    socket.on('newMessage', (msg) => {
      console.log('📨 Incoming socket message:', msg);
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('newMessage');
    };
  }, [open, assignmentId]);

  // 🔹 Auto-scroll on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🔹 Send message
  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    const newMsg = {
      assignmentId,
      senderId: currentUser._id,
      senderModel: currentUser.role === 'expert' ? 'Expert' : 'Student',
      message: trimmed,
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, { ...newMsg, senderId: { name: currentUser.name } }]);
    setText('');

    try {
      // ✅ Emit directly to socket (this saves & broadcasts on backend)
      socket.emit('chatMessage', newMsg);
      console.log('📤 Sent via socket:', newMsg);
    } catch (err) {
      console.error('❌ Failed to send message via socket:', err);
      alert('Failed to send message. Please try again.');
    }
  };

  // 🔹 Don’t render when chat is closed
  if (!open) return null;

  return (
    <div className="chat-overlay">
      <div className="chat-box">
        {/* Header */}
        <div className="chat-box-header">
          <div className="chat-box-header-left">
            <CircleUserRound className="chat-user-icon icon" />
            <span className="chat-user-name">{otherUser}</span>
          </div>
          <div className="chat-box-header-right">
            <button className="chat-close-btn" onClick={onClose}>
              <X className="chat-close-icon icon" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="chat-box-body">
          <div className="chatting-area">
            {messages.length === 0 ? (
              <div
                style={{ textAlign: 'center', padding: '20px', color: '#999' }}
              >
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((m, idx) => {
                const mine = m.senderModel === 'Expert';
                const displayName =
                  m.senderName ||
                  m.senderId?.name ||
                  m.senderId?.username ||
                  'User';
                const messageText = m.message || m.text || '';
                const messageTime = m.createdAt || m.timestamp;

                return (
                  <div
                    key={m._id || idx}
                    className={`chat-message ${mine ? 'mine' : 'theirs'}`}
                  >
                    {!mine && <div className="sender">{displayName}</div>}
                    <div className="text">{messageText}</div>
                    <div className="time">
                      {messageTime
                        ? new Date(messageTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                        : ''}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={endRef} />
          </div>

          {/* Footer */}
          <div className="chat-footer">
            <form className="chat-form" onSubmit={handleSend}>
              <input
                type="text"
                placeholder="Write a message..."
                className="message-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
              <button className="send-btn" type="submit">
                <SendHorizonal size={20} className="send-icon" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
