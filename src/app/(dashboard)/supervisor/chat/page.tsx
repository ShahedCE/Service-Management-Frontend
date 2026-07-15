'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useChatStore } from '@/store/chat.store';
import { useChatSocket } from '@/hooks/useChatSocket';
import { getActiveChats, getChatHistory } from '@/services/chat.service';

export default function SupervisorChatPage() {
  const { user } = useAuthStore();
  const {
    activeChats,
    setActiveChats,
    messages,
    setMessages,
    selectedOperatorId,
    setSelectedOperatorId,
    unreadCounts,
    clearUnread,
  } = useChatStore();

  const { sendMessage } = useChatSocket();
  const [content, setContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch active chats initially
    getActiveChats().then((chats) => {
      setActiveChats(chats);
    });
  }, [setActiveChats]);

  useEffect(() => {
    // Fetch history when an operator is selected
    if (selectedOperatorId && !messages[selectedOperatorId]) {
      getChatHistory(selectedOperatorId).then((history) => {
        setMessages(selectedOperatorId, history);
      });
    }
  }, [selectedOperatorId, messages, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedOperatorId]);

  if (!user || user.role !== 'SUPERVISOR') {
    return <div className="p-6">Access Denied</div>;
  }

  const currentMessages = selectedOperatorId ? messages[selectedOperatorId] || [] : [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !selectedOperatorId) return;

    sendMessage(selectedOperatorId, content);
    setContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as unknown as React.FormEvent);
    }
  };

  const handleSelectChat = (operatorId: string) => {
    setSelectedOperatorId(operatorId);
    clearUnread(operatorId);
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-4 p-4">
      {/* Sidebar: Active Chats */}
      <div className="w-1/3 max-w-sm bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-semibold text-gray-800">Active Conversations</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {activeChats.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">No active chats</div>
          ) : (
            activeChats.map((chat) => (
              <div
                key={chat.operator.id}
                onClick={() => handleSelectChat(chat.operator.id)}
                className={`p-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-blue-50/50 ${selectedOperatorId === chat.operator.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'
                  }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-sm text-gray-900">{chat.operator.name}</h3>
                  {unreadCounts[chat.operator.id] > 0 && (
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCounts[chat.operator.id]}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{chat.latestMessage.content}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        {selectedOperatorId ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-semibold text-gray-800">
                {activeChats.find(c => c.operator.id === selectedOperatorId)?.operator.name || 'Operator'}
              </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
              {currentMessages.map((msg, index) => {
                const isMine = msg.senderId === user.id;
                return (
                  <div key={msg.id || index} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl p-3 shadow-sm ${isMine
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                      }`}>
                      {!isMine && msg.sender?.name && (
                        <p className="text-xs text-gray-500 mb-1 font-medium">{msg.sender.name}</p>
                      )}
                      <p className="text-sm break-words leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-white flex gap-3 items-end">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none min-h-[40px] max-h-[120px]"
              />
              <button
                type="submit"
                disabled={!content.trim()}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-sm font-medium text-sm flex items-center justify-center gap-2"
              >
                Send
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50 flex-col gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
