import React, { useEffect, useState, useRef } from 'react';
import './ChatBox.css';
import { CircleUserRound, SendHorizonal, X } from 'lucide-react';
import { io } from 'socket.io-client';
import axios from 'axios';

const ChatBox = ({ open, onClose, assignmentId, currentUser, otherUser, socketUrl = "http://localhost:4000" }) => {
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);
  const [text, setText] = useState("")
  const endRef = useRef(null)

  // to close on pressing escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // to load history on mount
  useEffect(() => {
    if (!open || !assignmentId) return;
    (async () => {
      try {
        const token = localStorage.getItem('expertToken');
        console.log("🔍 Fetching chat history for assignment:", assignmentId);
        
        const res = await axios.get(`http://localhost:4000/api/chats/${assignmentId}/messages`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log("✅ Chat history fetched - count:", res.data?.length);
        console.log("📝 Messages:", res.data);
        setMessages(res.data || []);
      } catch (err) {
        console.error("❌ Failed to fetch chat history:", err);
        setMessages([]);
      }
    })();
  }, [open, assignmentId]);

  // connect socket when chat opens
  useEffect(() => {
    if (!open || !socketUrl || !assignmentId) return;

    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("joinRoom", assignmentId);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("message", (msg) => {
      console.log("📨 Received message via socket:", msg);
      
      // Don't add if it's from current user (already added optimistically)
      const msgSenderId = msg.sender || msg.senderId?._id || msg.senderId;
      if (msgSenderId?.toString() === currentUser._id?.toString()) {
        console.log("⚠️ Own message received via socket, skipping (already in UI)");
        return;
      }
      
      // For other users' messages, check for duplicates
      setMessages((prev) => {
        const isDuplicate = prev.some(m => {
          const mSenderId = m.sender || m.senderId?._id || m.senderId;
          const msgText = m.text || m.message;
          const incomingText = msg.text || msg.message;
          return msgText === incomingText && 
                 mSenderId?.toString() === msgSenderId?.toString() &&
                 Math.abs(new Date(m.timestamp || m.createdAt) - new Date(msg.timestamp || msg.createdAt)) < 1000;
        });
        
        if (isDuplicate) {
          console.log("⚠️ Duplicate message detected, skipping");
          return prev;
        }
        console.log("✅ Adding new message to UI");
        return [...prev, msg];
      });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
      socketRef.current = null;
    };
  }, [open, assignmentId, socketUrl]);

  // auto scroll in chat
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send handler
  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const newMsg = {
      _id: tempId,
      assignmentId,
      sender: currentUser._id,
      senderName: currentUser.name,
      senderModel: currentUser.role === "expert" ? "Expert" : "Student",
      text: trimmed,
      timestamp: new Date().toISOString(),
    };

    // Optimistically add message to UI
    setMessages((prev) => [...prev, newMsg]);
    setText("");

    // Save via REST (for persistence)
    try {
      const token = localStorage.getItem('expertToken');
      const response = await axios.post(
        `http://localhost:4000/api/chats/${assignmentId}/messages`,
        { message: newMsg.text },
        { 
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          } 
        }
      );

      // Replace temp message with real one from server
      setMessages((prev) => prev.map(m => 
        m._id === tempId ? { ...response.data, text: response.data.message || response.data.text } : m
      ));

      console.log("Message saved successfully");

      // Emit via socket (for other users only)
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("chatMessage", response.data);
        console.log("Message emitted via socket");
      }

    } catch (err) {
      console.error("Failed to save message:", err);
      setMessages((prev) => prev.filter(m => m._id !== tempId));
      alert("Failed to send message. Please try again.");
    }
  };

  // UI
  if (!open) return null;
  return (
    <div className='chat-overlay'>
      <div className='chat-box'>
        {/* Header */}
        <div className='chat-box-header'>
          <div className='chat-box-header-left'>
            <CircleUserRound className='chat-user-icon icon' />
            <span className='chat-user-name'>{otherUser}</span>
          </div>
          <div className='chat-box-header-right'>
            <button className='chat-close-btn' onClick={onClose}>
              <X className='chat-close-icon icon' />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className='chat-box-body'>
          {/* Actual chatting part */}
          <div className="chatting-area">
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((m, idx) => {
                // Handle different message formats
                const senderId = m.sender || m.senderId?._id || m.senderId;
                const mine = senderId?.toString() === currentUser._id?.toString();
                const displayName = m.senderName || m.senderId?.name || m.senderId?.username || 'User';
                const messageText = m.text || m.message || '';
                const messageTime = m.timestamp || m.createdAt;
                
                return (
                  <div
                    key={m._id || idx}
                    className={`chat-message ${mine ? "mine" : "theirs"}`}
                  >
                    {!mine && <div className="sender">{displayName}</div>}
                    <div className="text">{messageText}</div>
                    <div className="time">
                      {messageTime ? new Date(messageTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }) : ''}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={endRef} />
          </div>

          {/* Chat footer */}
          <div className="chat-footer">
            <form
              action=""
              className='chat-form'
              onSubmit={handleSend}
            >
              <input
                type="text"
                placeholder='Write a message...'
                className='message-input'
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
              <button className='send-btn'><SendHorizonal size={20} className='send-icon' /></button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatBox