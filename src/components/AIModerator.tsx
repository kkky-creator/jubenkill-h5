import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Toast } from 'antd-mobile';
import { aiService } from '../services/ai';
import { Script, Scene, Character, AIResponse } from '../types';

interface AIModeratorProps {
  script: Script;
  currentScene: Scene;
  currentCharacter?: Character;
  onAIResponse: (response: AIResponse) => void;
}

const AIModerator: React.FC<AIModeratorProps> = ({
  script,
  currentScene,
  currentCharacter,
  onAIResponse
}) => {
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');

  // 生成场景描述
  const generateSceneDescription = async () => {
    setIsGenerating(true);
    try {
      const response = await aiService.generateSceneDescription(currentScene, script);
      setAiResponse(response);
      onAIResponse(response);
    } catch (error) {
      console.error('生成场景描述失败:', error);
      Toast.show('生成场景描述失败');
    } finally {
      setIsGenerating(false);
    }
  };

  // 推进剧情
  const advancePlot = async () => {
    setIsGenerating(true);
    try {
      const gameState = {
        currentScene: currentScene.id,
        // 这里需要传入实际的游戏状态
      };
      const response = await aiService.advancePlot(currentScene, script, gameState);
      setAiResponse(response);
      onAIResponse(response);
    } catch (error) {
      console.error('推进剧情失败:', error);
      Toast.show('推进剧情失败');
    } finally {
      setIsGenerating(false);
    }
  };

  // 回答玩家问题
  const answerQuestion = async () => {
    if (!userQuestion.trim() || !currentCharacter) {
      Toast.show('请输入问题');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await aiService.answerPlayerQuestion(userQuestion, currentCharacter, script);
      setAiResponse(response);
      onAIResponse(response);
      setUserQuestion('');
    } catch (error) {
      console.error('回答问题失败:', error);
      Toast.show('回答问题失败');
    } finally {
      setIsGenerating(false);
    }
  };

  // 组件挂载时生成场景描述
  useEffect(() => {
    generateSceneDescription();
  }, [currentScene.id]);

  return (
    <div className="mb-4">
      <Card title="AI主持人" className="mb-4">
        {aiResponse && (
          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <div className="font-semibold mb-2">
              {aiResponse.type === 'narrator' && '主持人'}
              {aiResponse.type === 'character' && currentCharacter?.name}
              {aiResponse.type === 'system' && '系统消息'}
            </div>
            <div>{aiResponse.text}</div>
          </div>
        )}

        {isGenerating && (
          <div className="text-center py-4 text-gray-500">
            AI正在思考中...
          </div>
        )}

        <Space direction="vertical" className="w-full">
          <Button
            color="primary"
            onClick={advancePlot}
            loading={isGenerating}
            className="w-full"
          >
            推进剧情
          </Button>

          {currentCharacter && (
            <div>
              <div className="mb-2">向{currentCharacter.name}提问:</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="输入你的问题"
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                  disabled={isGenerating}
                />
                <Button
                  color="primary"
                  onClick={answerQuestion}
                  loading={isGenerating}
                >
                  提问
                </Button>
              </div>
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default AIModerator;