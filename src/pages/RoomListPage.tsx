import React, { useState, useEffect } from 'react';
import { Button, Input, List, Toast } from 'antd-mobile';
import { useStore } from '../store';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { socketService } from '../services/socket';
import { Room } from '../types';

const RoomListPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomName, setRoomName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [roomId, setRoomId] = useState('');
  const { currentRoom } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // 监听currentRoom变化，自动跳转到房间页面
  useEffect(() => {
    if (currentRoom) {
      navigate('/room');
    }
  }, [currentRoom, navigate]);
  
  // 检查URL参数中的错误信息
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'room_not_found') {
      Toast.show({
        content: '房间不存在，请检查房间ID',
        position: 'top',
      });
    }
  }, [searchParams]);
  
  // 页面加载时初始化socket事件监听
  useEffect(() => {
    // 监听房间列表更新事件
    socketService.socket?.on('rooms_updated', (updatedRooms: Room[]) => {
      setRooms(updatedRooms);
    });
    
    // 监听房间更新事件（用于当前房间的实时更新）
    socketService.socket?.on('room_updated', (updatedRoom: Room) => {
      // 这里可以处理当前房间的更新
      console.log('Room updated:', updatedRoom);
    });
    
    // 从后端获取初始房间列表
    fetch('http://localhost:3001/api/rooms')
      .then(response => response.json())
      .then(data => setRooms(data))
      .catch(error => console.error('Failed to load rooms:', error));
    
    return () => {
      // 清理事件监听
      socketService.socket?.off('rooms_updated');
      socketService.socket?.off('room_updated');
    };
  }, []);
  
  // 创建房间
  const handleCreateRoom = () => {
    if (!roomName.trim()) {
      Toast.show({
        content: '请输入房间名称',
        position: 'top',
      });
      return;
    }

    socketService.createRoom(roomName.trim());
    Toast.show({
      content: '房间创建中...',
      position: 'top',
    });
    setRoomName('');
    setShowCreateForm(false);
  };

  // 加入房间
  const handleJoinRoom = () => {
    if (!roomId.trim()) {
      Toast.show({
        content: '请输入房间ID',
        position: 'top',
      });
      return;
    }

    socketService.joinRoom(roomId.trim());
    Toast.show({
      content: '加入房间中...',
      position: 'top',
    });
  };

  // 直接加入房间
  const handleDirectJoin = (room: Room) => {
    socketService.joinRoom(room.id);
    Toast.show({
      content: '加入房间中...',
      position: 'top',
    });
  };

  // 退出登录
  const handleLogout = () => {
    useStore.getState().setCurrentUser(null);
    useStore.getState().leaveRoom();
    Toast.show({
      content: '已退出登录',
      position: 'top',
    });
    navigate('/login');
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">房间列表</h1>
        <div className="flex gap-2">
          <Button onClick={handleLogout}>
            退出登录
          </Button>
          <Button color="primary" onClick={() => setShowCreateForm(!showCreateForm)}>
            创建房间
          </Button>
        </div>
      </div>

      {/* 创建房间表单 */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">创建房间</h2>
          <Input
            placeholder="房间名称"
            value={roomName}
            onChange={setRoomName}
            className="mb-4"
          />
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateForm(false)}>
              取消
            </Button>
            <Button color="primary" onClick={handleCreateRoom}>
              确定
            </Button>
          </div>
        </div>
      )}

      {/* 快速加入 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">快速加入</h2>
        <div className="flex gap-2">
          <Input
            placeholder="房间ID"
            value={roomId}
            onChange={setRoomId}
            className="flex-1"
          />
          <Button color="primary" onClick={handleJoinRoom}>
            加入
          </Button>
        </div>
      </div>

      {/* 房间列表 */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">可用房间</h2>
        {rooms.length > 0 ? (
          <List>
            {rooms.map((room) => (
              <List.Item
                key={room.id}
                title={room.name}
                description={`房主: ${room.hostId} | 玩家: ${room.users.length}`}
                onClick={() => handleDirectJoin(room)}
                arrow="horizontal"
              />
            ))}
          </List>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <p>暂无可用房间</p>
            <p className="mt-2">请创建新房间或输入房间ID加入</p>
          </div>
        )}
      </div>

      {/* 创建房间弹窗 - 暂时注释掉，antd-mobile 5.x的Modal API不同 */}
      {/* <Modal
        visible={showCreateModal}
        title="创建房间"
        onClose={() => setShowCreateModal(false)}
        footer={[
          {
            text: '取消',
            onPress: () => setShowCreateModal(false),
          },
          {
            text: '确定',
            onPress: handleCreateRoom,
          },
        ]}
      >
        <div className="p-4">
          <Input
            placeholder="房间名称"
            value={roomName}
            onChange={setRoomName}
            className="mb-4"
          />
        </div>
      </Modal> */}
    </div>
  );
};

export default RoomListPage;