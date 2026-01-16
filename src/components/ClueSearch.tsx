import React from 'react';
import { Card, Button, List, Toast } from 'antd-mobile';
import { useStore } from '../store';
import { Clue, Scene } from '../types';
import { socketService } from '../services/socket';

interface ClueSearchProps {
  clues: Clue[];
  scenes: Scene[];
  currentScene: Scene;
  onSceneChange?: (scene: Scene) => void;
}

const ClueSearch: React.FC<ClueSearchProps> = ({ clues, scenes, currentScene, onSceneChange }) => {
  const { currentUser, foundClues, addFoundClue } = useStore();

  if (!currentUser) return null;

  // 获取当前场景的线索
  const sceneClues = clues.filter(clue => clue.location === currentScene.location);

  // 搜索当前场景的线索
  const handleSearchScene = () => {
    // 随机发现1-2个线索
    const unfoundClues = sceneClues.filter(clue => !foundClues.includes(clue.id));
    if (unfoundClues.length === 0) {
      Toast.show('当前场景没有更多线索了');
      return;
    }

    const cluesToFind = Math.min(Math.floor(Math.random() * 2) + 1, unfoundClues.length);
    for (let i = 0; i < cluesToFind; i++) {
      const randomIndex = Math.floor(Math.random() * unfoundClues.length);
      const clueToFind = unfoundClues[randomIndex];
      addFoundClue(clueToFind.id);
      socketService.findClue(clueToFind.id);
      unfoundClues.splice(randomIndex, 1); // 避免重复发现
    }

    Toast.show(`发现了${cluesToFind}条线索`);
  };

  return (
    <Card title="搜证系统" className="mb-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">当前场景: {currentScene.name}</h3>
      
      <div className="mb-4">
        <Button 
          color="primary" 
          className="w-full mb-2"
          onClick={handleSearchScene}
        >
          搜索当前场景
        </Button>
        {onSceneChange && scenes.length > 1 && (
          <Button 
            className="w-full"
            onClick={() => {
              // 切换到下一个场景
              const currentIndex = scenes.findIndex(s => s.id === currentScene.id);
              const nextIndex = (currentIndex + 1) % scenes.length;
              onSceneChange(scenes[nextIndex]);
              Toast.show(`切换到场景: ${scenes[nextIndex].name}`);
            }}
          >
            切换场景
          </Button>
        )}
      </div>
      
      <h3 className="text-lg font-semibold mb-3 text-gray-700">场景线索</h3>
      <List>
        {sceneClues.map(clue => {
          const isFound = foundClues.includes(clue.id);
          
          return (
            <List.Item
              key={clue.id}
              title={clue.name}
              description={isFound ? clue.description : '???'}
              className={isFound ? 'bg-green-50' : 'bg-gray-50'}
            />
          );
        })}
      </List>
      
      <h3 className="text-lg font-semibold mb-3 text-gray-700 mt-4">已发现线索</h3>
      <List>
        {foundClues.length > 0 ? (
          foundClues.map(clueId => {
            const clue = clues.find(c => c.id === clueId);
            if (!clue) return null;
            
            return (
              <List.Item
                key={clueId}
                title={clue.name}
                description={clue.description}
              />
            );
          })
        ) : (
          <div className="text-center py-4 text-gray-500">
            暂无发现线索
          </div>
        )}
      </List>
      
      {/* 线索详情弹窗 - 暂时注释掉，antd-mobile 5.x的Modal组件API不同 */}
    </Card>
  );
};

export default ClueSearch;