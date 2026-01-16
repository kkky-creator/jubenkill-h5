import React, { useState } from 'react';
import { useStore } from '../store';
import AIModerator from '../components/AIModerator';
import CharacterAssignment from '../components/CharacterAssignment';
import ChatComponent from '../components/ChatComponent';
import ClueSearch from '../components/ClueSearch';
import InvestigationMap from '../components/InvestigationMap';
import VotingSystem from '../components/VotingSystem';
import { AIResponse, Scene, Clue } from '../types';

const GamePage: React.FC = () => {
  const { currentRoom, addFoundClue } = useStore();
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);

  if (!currentRoom || !currentRoom.script) {
    return <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">加载中...</div>;
  }

  // 初始化当前场景
  if (!currentScene) {
    setCurrentScene(currentRoom.script.scenes[0] || {
      id: 'default_scene',
      name: '默认场景',
      description: '暂无场景描述',
      location: '未知地点',
      time: '未知时间',
      clues: []
    });
    return null;
  }

  const handleAIResponse = (response: AIResponse) => {
    // 处理AI响应，例如发送到聊天记录
    console.log('AI响应:', response);
  };

  // 处理场景切换
  const handleSceneChange = (scene: Scene) => {
    setCurrentScene(scene);
  };

  // 处理线索发现
  const handleClueFound = (clue: Clue) => {
    addFoundClue(clue.id);
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{currentRoom.script.title}</h1>
      
      {/* AI主持人 */}
      <AIModerator
        script={currentRoom.script}
        currentScene={currentScene}
        onAIResponse={handleAIResponse}
      />
      
      {/* 角色分配 */}
      <CharacterAssignment
        characters={currentRoom.script.characters}
        users={currentRoom.users}
      />
      
      {/* 聊天系统 */}
      <ChatComponent />
      
      {/* 搜证系统 */}
      <ClueSearch
        clues={currentRoom.script.clues}
        scenes={currentRoom.script.scenes}
        currentScene={currentScene}
        onSceneChange={handleSceneChange}
      />
      
      {/* 搜证地图 */}
      <InvestigationMap
        scenes={currentRoom.script.scenes}
        clues={currentRoom.script.clues}
        currentScene={currentScene}
        onSceneChange={handleSceneChange}
        onClueFound={handleClueFound}
        foundClues={currentRoom.foundClues}
      />
      
      {/* 投票系统 */}
      <VotingSystem
        characters={currentRoom.script.characters}
        totalPlayers={currentRoom.users.length}
      />
      
      {/* 当前场景信息 */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">当前场景</h2>
        <p className="mb-2"><strong>场景名称:</strong> {currentScene.name}</p>
        <p className="mb-2"><strong>地点:</strong> {currentScene.location}</p>
        <p className="mb-2"><strong>时间:</strong> {currentScene.time}</p>
        <p className="mb-2"><strong>描述:</strong> {currentScene.description}</p>
      </div>
    </div>
  );
};

export default GamePage;