import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useChatWindow } from '../../contexts/ChatWindowContext';

// Icons
const ChatIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a9.954 9.954 0 01-4.951-1.322A3.5 3.5 0 013 13.5V7a4 4 0 014-4h9a4 4 0 014 4v5z" />
  </svg>
);

const PinIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const CloseIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SendIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const ChatWindow = () => {
  const { sidebarDarkMode } = useTheme();
  const { isOpen, isPinned, width, toggleChat, togglePin, closeChatAndUnpin, setWindowWidth } = useChatWindow();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! How can I help you with your accounting today?",
      sender: "assistant",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const messagesEndRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(width);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: message,
        sender: "user",
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      
      // Simulate assistant response
      setTimeout(() => {
        const assistantMessage = {
          id: messages.length + 2,
          text: "I understand your query. Let me help you with that.",
          sender: "assistant",
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePin = () => {
    togglePin();
  };

  const handleMouseDown = (e) => {
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(width);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;
    
    const deltaX = startX - e.clientX;
    const newWidth = startWidth + deltaX;
    setWindowWidth(newWidth);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  // Add event listeners for mouse move and up
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, startX, startWidth]);

  // Update startWidth when width changes
  useEffect(() => {
    setStartWidth(width);
  }, [width]);

  if (!isOpen) return null;

  const chatClasses = sidebarDarkMode
    ? 'bg-[#21263C] text-white border-gray-700'
    : 'bg-white text-gray-900 border-gray-200';

  const inputClasses = sidebarDarkMode
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500';

  return (
    <>
      {/* Overlay backdrop for non-pinned mode */}
      {!isPinned && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={toggleChat}
        />
      )}
      
      {/* Chat Window */}
      <div 
        className={`
          fixed z-50 flex flex-col
          ${isPinned 
            ? 'right-0 top-0 h-full border-l' 
            : 'right-4 top-4 bottom-4 rounded-lg border shadow-xl'
          }
          ${chatClasses}
          transition-all duration-300 ease-in-out
        `}
        style={{
          width: `${width}px`
        }}
      >
        {/* Resize Handle - Only show when not in floating mode */}
        {isPinned && (
          <div
            className={`absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-blue-500 transition-colors ${
              sidebarDarkMode ? 'bg-gray-600' : 'bg-gray-300'
            }`}
            onMouseDown={handleMouseDown}
            style={{ left: '-2px', width: '4px' }}
          />
        )}
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          sidebarDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-2">
            <ChatIcon className="w-5 h-5 text-blue-500" />
            <h3 className="font-medium">AI Assistant</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePin}
              className={`p-1.5 rounded-md transition-colors ${
                isPinned 
                  ? 'bg-blue-100 text-blue-600' 
                  : sidebarDarkMode 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
              title={isPinned ? 'Unpin chat' : 'Pin chat'}
            >
              <PinIcon className="w-4 h-4" />
            </button>
            <button
              onClick={closeChatAndUnpin}
              className={`p-1.5 rounded-md transition-colors ${
                sidebarDarkMode 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : sidebarDarkMode
                      ? 'bg-gray-700 text-gray-100'
                      : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className={`text-xs mt-1 opacity-70`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className={`p-4 border-t ${
          sidebarDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                inputClasses
              }`}
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <SendIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatWindow;