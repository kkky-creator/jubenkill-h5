import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, List } from 'antd-mobile';
import { useStore } from '../store';
import { socketService } from '../services/socket';
import { Message } from '../types';

const ChatComponent: React.FC = () => {
  const { messages, addMessage, currentUser } = useStore();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (!currentUser) return null;

  // 发送消息
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUser.id,
      content: inputValue.trim(),
      timestamp: Date.now(),
      type: 'chat'
    };

    addMessage(message);
    socketService.sendMessage(inputValue.trim(), 'chat');
    setInputValue('');
  };

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Card title="聊天系统" className="mb-4">
      <div className="h-64 overflow-y-auto mb-4 p-2 bg-gray-50 rounded-lg">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            暂无消息，开始聊天吧！
          </div>
        ) : (
          <List>
            {messages.map(message => {
              const isCurrentUser = message.userId === currentUser.id;
              
              return (
                <List.Item
                  key={message.id}
                  className={`mb-2 ${isCurrentUser ? 'text-right' : 'text-left'}`}
                >
                  <div
                    className={`inline-block max-w-[80%] p-3 rounded-lg ${isCurrentUser ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-800'}`}
                  >
                    {message.content}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </List.Item>
              );
            })}
            <div ref={messagesEndRef} />
          </List>
        )}
      </div>
      
      <div className="flex gap-2">
        <Input
          placeholder="输入消息..."
          value={inputValue}
          onChange={setInputValue}
          className="flex-1"
        />
        <Button color="primary" onClick={handleSendMessage}>
          发送
        </Button>
      </div>
    </Card>
  );
};

export default ChatComponent;