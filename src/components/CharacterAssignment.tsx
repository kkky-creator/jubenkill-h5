import React from 'react';
import { Card, Button, List, Toast } from 'antd-mobile';
import { useStore } from '../store';
import { Character, User } from '../types';
import { socketService } from '../services/socket';

interface CharacterAssignmentProps {
  characters: Character[];
  users: User[];
}

const CharacterAssignment: React.FC<CharacterAssignmentProps> = ({ characters, users }) => {
  const { currentUser, assignCharacter, assignedCharacters } = useStore();

  if (!currentUser) return null;

  const isHost = users.find(u => u.id === currentUser.id)?.isHost;

  // 显示角色选择弹窗
  const showCharacterSelect = (userId: string) => {
    // 这里需要实现角色选择弹窗
    // 暂时使用alert模拟
    const availableCharacters = characters.filter(c => 
      !Object.values(assignedCharacters).includes(c.id)
    );
    
    if (availableCharacters.length === 0) {
      Toast.show('没有可用角色');
      return;
    }
    
    // 这里应该使用模态框让房主选择角色
    // 暂时简单处理，分配第一个可用角色
    handleAssignCharacter(userId, availableCharacters[0].id);
  };

  const handleAssignCharacter = (userId: string, characterId: string) => {
    if (!isHost) {
      Toast.show('只有房主可以分配角色');
      return;
    }

    assignCharacter(userId, characterId);
    socketService.assignCharacter(userId, characterId);
    Toast.show('角色分配成功');
  };

  return (
    <Card title="角色分配" className="mb-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">玩家列表</h3>
      <List>
        {users.map(user => {
          const assignedCharacter = assignedCharacters[user.id];
          const characterName = characters.find(c => c.id === assignedCharacter)?.name || '未分配';
          
          return (
            <List.Item
              key={user.id}
              title={user.name}
              description={`角色: ${characterName}`}
              arrow={isHost ? 'horizontal' : undefined}
              onClick={isHost ? () => {
                // 显示角色选择弹窗
                showCharacterSelect(user.id);
              } : undefined}
            />
          );
        })}
      </List>
      
      {isHost && (
        <div className="mt-4">
          <Button color="primary" className="w-full">
            随机分配角色
          </Button>
        </div>
      )}
    </Card>
  );
};

export default CharacterAssignment;