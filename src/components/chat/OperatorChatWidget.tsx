'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { useChatStore } from '../../store/chat.store';
import { useChatSocket } from '../../hooks/useChatSocket';
import { getChatHistory } from '../../services/chat.service';

export const OperatorChatWidget = () => {
  const { user } = useAuthStore();
  const { messages, setMessages, isChatOpen, setChatOpen, unreadCounts, clearUnread } = useChatStore();
  const { sendMessage } = useChatSocket();
  const [content, setContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const operatorId = user?.id;

  useEffect(() => {
    if (operatorId && isChatOpen && !messages[operatorId]) {
      getChatHistory(operatorId).then((history) => {
        setMessages(operatorId, history);
      });
    }
    if (isChatOpen && operatorId) {
      clearUnread(operatorId);
    }
  }, [operatorId, isChatOpen, messages, setMessages, clearUnread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, operatorId, isChatOpen]);

  if (!user || user.role !== 'OPERATOR') {
    return null;
  }

  const currentMessages = operatorId ? messages[operatorId] || [] : [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !operatorId) return;

    sendMessage(operatorId, content);
    setContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as unknown as React.FormEvent);
    }
  };

  const unreadCount = operatorId ? (unreadCounts[operatorId] || 0) : 0;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isChatOpen ? (
        <div className="bg-white rounded-lg shadow-xl w-80 h-96 flex flex-col border border-gray-200">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center shadow-sm">
            <h3 className="font-semibold text-sm">Supervisor Chat</h3>
            <button
              onClick={() => setChatOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
            {currentMessages.map((msg, index) => {
              const isMine = msg.senderId === user.id;
              return (
                <div key={msg.id || index} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 text-sm shadow-sm ${isMine
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                    }`}>
                    {!isMine && msg.sender?.name && (
                      <p className="text-xs text-gray-500 mb-1 font-medium">{msg.sender.name}</p>
                    )}
                    <p className="break-words leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>


          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 rounded-b-lg flex gap-2 items-end">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none min-h-[40px] max-h-[120px]"
            />
            <button
              type="submit"
              disabled={!content.trim()}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center min-w-[36px]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setChatOpen(true)}
          className="relative bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center"
        >
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-6 w-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm z-10">
              {unreadCount}
            </span>
          )}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 relative z-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}
    </div>
  );
};
