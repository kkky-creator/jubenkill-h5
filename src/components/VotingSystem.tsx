import React from 'react';
import { Card, Button, List, Toast } from 'antd-mobile';
import { useStore } from '../store';
import { Character } from '../types';
import { socketService } from '../services/socket';

interface VotingSystemProps {
  characters: Character[];
  totalPlayers: number;
}

const VotingSystem: React.FC<VotingSystemProps> = ({ characters, totalPlayers }) => {
  const { currentUser, votes, addVote } = useStore();

  if (!currentUser) return null;

  // 检查玩家是否已经投票
  const hasVoted = Object.keys(votes).includes(currentUser.id);

  // 计算投票结果
  const voteResults = characters.map(character => {
    const count = Object.values(votes).filter(v => v === character.id).length;
    const percentage = totalPlayers > 0 ? (count / totalPlayers) * 100 : 0;
    
    return {
      character,
      count,
      percentage
    };
  });

  // 处理投票
  const handleVote = (characterId: string) => {
    if (hasVoted) {
      Toast.show('你已经投过票了');
      return;
    }

    addVote(currentUser.id, characterId);
    socketService.vote(characterId);
    Toast.show('投票成功');
  };

  // 结束投票
  const handleEndVoting = () => {
    // 这里需要实现结束投票逻辑
    Toast.show('投票结束');
  };

  return (
    <Card title="投票系统" className="mb-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">投票阶段</h3>
      
      <div className="mb-4">
        <Button color="primary" className="w-full mb-2">
          开始投票
        </Button>
        <Button className="w-full">
          结束投票
        </Button>
      </div>
      
      <h3 className="text-lg font-semibold mb-3 text-gray-700">投票结果</h3>
      <List>
        {voteResults.map(({ character, count, percentage }) => (
          <List.Item
            key={character.id}
            title={character.name}
            description={
              <div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{count} 票</span>
              </div>
            }
            arrow={!hasVoted ? 'horizontal' : undefined}
            onClick={!hasVoted ? () => handleVote(character.id) : undefined}
          />
        ))}
      </List>
      
      {hasVoted && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <p className="text-center text-green-700">
            你已经完成投票，等待其他玩家投票...
          </p>
        </div>
      )}
      
      {Object.keys(votes).length === totalPlayers && (
        <div className="mt-4">
          <Button color="primary" className="w-full" onClick={handleEndVoting}>
            结束投票并公布结果
          </Button>
        </div>
      )}
    </Card>
  );
};

export default VotingSystem;