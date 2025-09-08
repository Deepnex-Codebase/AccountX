import React, { createContext, useContext, useState } from 'react';

const ChatWindowContext = createContext();

export const useChatWindow = () => {
  const context = useContext(ChatWindowContext);
  if (!context) {
    throw new Error('useChatWindow must be used within a ChatWindowProvider');
  }
  return context;
};

export const ChatWindowProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [width, setWidth] = useState(320); // Default width in pixels

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  const closeChatAndUnpin = () => {
    setIsOpen(false);
    setIsPinned(false);
  };

  const togglePin = () => {
    setIsPinned(prev => !prev);
  };

  const openChat = () => {
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const pinChat = () => {
    setIsPinned(true);
  };

  const unpinChat = () => {
    setIsPinned(false);
  };

  const setWindowWidth = (newWidth) => {
    // Minimum width: 280px, Maximum width: 600px
    const clampedWidth = Math.max(280, Math.min(600, newWidth));
    setWidth(clampedWidth);
  };

  const resetWidth = () => {
    setWidth(320);
  };

  const value = {
    isOpen,
    isPinned,
    width,
    toggleChat,
    togglePin,
    openChat,
    closeChat,
    closeChatAndUnpin,
    pinChat,
    unpinChat,
    setWindowWidth,
    resetWidth
  };

  return (
    <ChatWindowContext.Provider value={value}>
      {children}
    </ChatWindowContext.Provider>
  );
};

export default ChatWindowContext;