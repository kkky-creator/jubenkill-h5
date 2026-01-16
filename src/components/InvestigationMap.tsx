import React from 'react';
import { Card, Button, Toast } from 'antd-mobile';
import { Scene, Clue } from '../types';

interface InvestigationMapProps {
  scenes: Scene[];
  clues: Clue[];
  currentScene: Scene;
  onSceneChange: (scene: Scene) => void;
  onClueFound: (clue: Clue) => void;
  foundClues: string[];
}

const InvestigationMap: React.FC<InvestigationMapProps> = ({
  scenes,
  clues,
  currentScene,
  onSceneChange,
  onClueFound,
  foundClues
}) => {


  // 地图场景数据（简化版）
  const mapScenes = [
    { id: 'scene1', name: '客厅', x: 100, y: 100, width: 200, height: 150 },
    { id: 'scene2', name: '卧室', x: 350, y: 100, width: 200, height: 150 },
    { id: 'scene3', name: '厨房', x: 100, y: 300, width: 200, height: 150 },
    { id: 'scene4', name: '花园', x: 350, y: 300, width: 200, height: 150 }
  ];

  // 处理场景点击
  const handleSceneClick = (sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (scene) {
      onSceneChange(scene);
    }
  };

  // 处理线索点击
  const handleClueClick = (clue: Clue) => {
    if (foundClues.includes(clue.id)) {
      Toast.show('该线索已被发现');
      return;
    }
    onClueFound(clue);
    Toast.show('发现新线索！');
  };

  return (
    <Card title="搜证地图" className="mb-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">当前场景: {currentScene.name}</h3>
      
      {/* 简易地图 */}
      <div className="relative w-full h-80 bg-gray-100 rounded-lg mb-4 overflow-hidden">
        <svg width="100%" height="100%" viewBox="0 0 600 500">
          {/* 绘制场景区域 */}
          {mapScenes.map(mapScene => {
            const isCurrent = mapScene.id === currentScene.id;
            const sceneClues = clues.filter(c => c.location === mapScene.name);
            
            return (
              <g key={mapScene.id} onClick={() => handleSceneClick(mapScene.id)}>
                {/* 场景矩形 */}
                <rect
                  x={mapScene.x}
                  y={mapScene.y}
                  width={mapScene.width}
                  height={mapScene.height}
                  fill={isCurrent ? '#3b82f6' : '#94a3b8'}
                  stroke="#1e293b"
                  strokeWidth="2"
                  opacity={0.7}
                  cursor="pointer"
                />
                {/* 场景名称 */}
                <text
                  x={mapScene.x + mapScene.width / 2}
                  y={mapScene.y + mapScene.height / 2}
                  textAnchor="middle"
                  fill="white"
                  fontWeight="bold"
                  fontSize="16"
                >
                  {mapScene.name}
                </text>
                {/* 线索标记 */}
                {sceneClues.map((clue, index) => {
                  const isFound = foundClues.includes(clue.id);
                  const offsetX = (index % 3 - 1) * 20;
                  const offsetY = Math.floor(index / 3) * 20;
                  
                  return (
                    <circle
                      key={clue.id}
                      cx={mapScene.x + 20 + offsetX}
                      cy={mapScene.y + 20 + offsetY}
                      r="8"
                      fill={isFound ? '#10b981' : '#ef4444'}
                      stroke="white"
                      strokeWidth="2"
                      cursor="pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClueClick(clue);
                      }}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* 场景列表 */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {scenes.map(scene => {
          const isActive = scene.id === currentScene.id;
          
          return (
            <Button
              key={scene.id}
              color={isActive ? 'primary' : undefined}
              className="h-16"
              onClick={() => onSceneChange(scene)}
            >
              {scene.name}
            </Button>
          );
        })}
      </div>
      
      {/* 当前场景线索 */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-700">当前场景线索</h3>
        <div className="grid grid-cols-2 gap-2">
          {clues
            .filter(clue => clue.location === currentScene.location)
            .map(clue => {
              const isFound = foundClues.includes(clue.id);
              
              return (
                <div
                  key={clue.id}
                  className={`p-3 rounded-lg border-2 ${isFound ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}
                  onClick={() => handleClueClick(clue)}
                >
                  <div className="font-semibold mb-1">{clue.name}</div>
                  <div className="text-sm text-gray-600">
                    {isFound ? clue.description.substring(0, 30) + '...' : '???'}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </Card>
  );
};

export default InvestigationMap;