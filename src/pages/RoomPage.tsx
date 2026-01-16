import React, { useState, useEffect } from 'react';
import { Button, List, Toast } from 'antd-mobile';
import { useStore } from '../store';
import { socketService } from '../services/socket';
import { GameStatus, Room } from '../types';

const RoomPage: React.FC = () => {
  const { currentRoom, currentUser, setGameStatus } = useStore();
  const [isUploading, setIsUploading] = useState(false);

  if (!currentRoom) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h1 className="text-xl font-bold text-gray-800 mb-4">房间不存在或已关闭</h1>
          <p className="text-gray-600 mb-6">请返回房间列表重新加入或创建房间</p>
          <Button
            color="primary"
            onClick={() => { window.location.href = '/rooms'; }}
            className="w-full"
            size="large"
          >
            返回房间列表
          </Button>
        </div>
      </div>
    );
  }

  const isHost = currentUser?.id === currentRoom.hostId;

  // 监听房间更新事件，实时更新房间成员列表
  useEffect(() => {
    const handleRoomUpdated = (updatedRoom: Room) => {
      useStore.getState().setCurrentRoom(updatedRoom);
    };

    // 监听socket事件
    socketService.socket?.on('room_updated', handleRoomUpdated);

    return () => {
      // 清理事件监听
      socketService.socket?.off('room_updated', handleRoomUpdated);
    };
  }, []);

  // 开始游戏
  const handleStartGame = () => {
    if (!currentRoom.script) {
      Toast.show({
        content: '请先导入剧本',
        position: 'top',
      });
      return;
    }

    socketService.startGame();
    setGameStatus(GameStatus.READING);
    Toast.show({
      content: '游戏开始',
      position: 'top',
    });
    // 导航到游戏页面
    setTimeout(() => {
      window.location.href = '/game';
    }, 1000);
  };

  // 处理剧本上传
  const handleScriptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const { parseScriptByFileType } = await import('../utils/scriptParser');
      const script = await parseScriptByFileType(file);
      
      // 更新房间的剧本信息
      const { setCurrentScript } = useStore();
      setCurrentScript(script);
      
      Toast.show({
        content: '剧本导入成功',
        position: 'top',
      });
      setIsUploading(false);
      // 重置文件输入
      if (e.target) {
        e.target.value = '';
      }
    } catch (error) {
      console.error('剧本解析失败:', error);
      Toast.show({
        content: '剧本导入失败',
        position: 'top',
      });
      setIsUploading(false);
    }
  };

  // 退出房间
  const handleLeaveRoom = () => {
    // 调用socketService的leaveRoom方法，处理房间删除逻辑
    socketService.leaveRoom(currentRoom.id);
    // 更新store状态
    useStore.getState().leaveRoom();
    Toast.show({
      content: '已退出房间',
      position: 'top',
    });
    window.location.href = '/rooms';
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{currentRoom.name}</h1>
            <p className="text-gray-600">房间ID: {currentRoom.id}</p>
          </div>
          <Button onClick={handleLeaveRoom}>
            退出房间
          </Button>
        </div>
        
        {isHost && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">导入剧本</h2>
            <div className="flex flex-col items-center">
              <input
                type="file"
                accept=".txt,.csv,.xlsx,.pdf"
                onChange={handleScriptUpload}
                className="mb-2 p-2 border border-gray-300 rounded-lg w-full"
                disabled={isUploading}
              />
              {isUploading && (
                <div className="text-gray-500 text-sm">
                  正在上传...
                </div>
              )}
            </div>
          </div>
        )}
        
        {isHost && currentRoom.script && (
          <Button
            color="primary"
            onClick={handleStartGame}
            className="w-full"
            size="large"
          >
            开始游戏
          </Button>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">房间成员</h2>
        <List>
          {currentRoom.users.map((user) => (
            <List.Item
              key={user.id}
              title={user.name}
              description={user.isHost ? '房主' : '玩家'}
            />
          ))}
        </List>
      </div>
    </div>
  );
};

export default RoomPage;