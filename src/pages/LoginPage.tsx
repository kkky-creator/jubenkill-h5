import React, { useState } from 'react';
import { Button, Input, Space, Toast } from 'antd-mobile';
import { useStore } from '../store';
import { socketService } from '../services/socket';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [userName, setUserName] = useState('');
  const { setCurrentUser } = useStore();
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!userName.trim()) {
      Toast.show({
        content: '请输入用户名',
        position: 'top',
      });
      return;
    }

    const user = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: userName.trim(),
      isHost: false
    };

    setCurrentUser(user);
    
    // 连接Socket.io
    socketService.connect(user.id, user.name);
    
    Toast.show({
      content: '登录成功',
      position: 'top',
    });
    
    // 登录成功后重定向到房间列表页面
    navigate('/rooms');
  };

  const handleGuestLogin = () => {
    const guestName = `游客_${Math.floor(Math.random() * 10000)}`;
    const user = {
      id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: guestName,
      isHost: false
    };

    setCurrentUser(user);
    
    // 连接Socket.io
    socketService.connect(user.id, user.name);
    
    Toast.show({
      content: '游客登录成功',
      position: 'top',
    });
    
    // 登录成功后重定向到房间列表页面
    navigate('/rooms');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">剧本杀H5</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">登录</h2>
          
          <Space direction="vertical" className="w-full">
            <Input
              placeholder="请输入用户名"
              value={userName}
              onChange={setUserName}
              className="w-full"
            />
            
            <Button
              color="primary"
              onClick={handleLogin}
              className="w-full"
              size="large"
            >
              登录
            </Button>
            
            <Button
              onClick={handleGuestLogin}
              className="w-full"
              size="large"
            >
              游客登录
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;