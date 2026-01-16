import OpenAI from 'openai';
import { AIResponse, Script, Scene, Character } from '../types';

class AIService {
  private openai: OpenAI | null = null;

  constructor() {
    // 使用默认值代替环境变量，避免编译错误
    const apiKey = ''; // 实际项目中应使用环境变量
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  // 初始化AI服务
  init(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  // 生成场景描述
  async generateSceneDescription(scene: Scene, script: Script): Promise<AIResponse> {
    if (!this.openai) {
      throw new Error('AI service not initialized');
    }

    const prompt = `
你是一位专业的剧本杀主持人，请根据以下场景信息，生成一段生动的场景描述：

剧本名称：${script.title}
场景名称：${scene.name}
场景地点：${scene.location}
场景时间：${scene.time}
场景描述：${scene.description}

请生成一段引人入胜的场景描述，让玩家能够身临其境地感受到场景氛围。
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      return {
        text: response.choices[0].message.content || '',
        type: 'narrator'
      };
    } catch (error) {
      console.error('Error generating scene description:', error);
      throw error;
    }
  }

  // 生成角色对话
  async generateCharacterDialogue(character: Character, context: string): Promise<AIResponse> {
    if (!this.openai) {
      throw new Error('AI service not initialized');
    }

    const prompt = `
你是剧本杀中的角色${character.name}，请根据以下信息生成一段符合角色性格和背景的对话：

角色名称：${character.name}
角色背景：${character.background}
角色秘密：${character.secrets.join(', ')}
当前上下文：${context}

请生成一段符合角色身份和性格的对话，不要透露过多秘密，但可以适当暗示。
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
      });

      return {
        text: response.choices[0].message.content || '',
        type: 'character',
        characterId: character.id
      };
    } catch (error) {
      console.error('Error generating character dialogue:', error);
      throw error;
    }
  }

  // 推进剧情
  async advancePlot(currentScene: Scene, script: Script, gameState: any): Promise<AIResponse> {
    if (!this.openai) {
      throw new Error('AI service not initialized');
    }

    const prompt = `
你是一位专业的剧本杀主持人，请根据以下信息推进剧情：

剧本名称：${script.title}
当前场景：${currentScene.name}
场景描述：${currentScene.description}
当前游戏状态：${JSON.stringify(gameState)}

请根据当前游戏状态，生成一段剧情推进的描述，引导玩家进行下一步行动。
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      return {
        text: response.choices[0].message.content || '',
        type: 'narrator'
      };
    } catch (error) {
      console.error('Error advancing plot:', error);
      throw error;
    }
  }

  // 回答玩家问题
  async answerPlayerQuestion(question: string, character: Character, script: Script): Promise<AIResponse> {
    if (!this.openai) {
      throw new Error('AI service not initialized');
    }

    const prompt = `
你是剧本杀中的角色${character.name}，请根据以下信息回答玩家的问题：

角色名称：${character.name}
角色背景：${character.background}
角色秘密：${character.secrets.join(', ')}
剧本信息：${script.title} - ${script.description}
玩家问题：${question}

请以角色的身份回答问题，保持角色的性格和秘密，不要透露过多不应透露的信息。
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      return {
        text: response.choices[0].message.content || '',
        type: 'character',
        characterId: character.id
      };
    } catch (error) {
      console.error('Error answering player question:', error);
      throw error;
    }
  }

  // 生成结局
  async generateEnding(script: Script, votes: Record<string, string>, foundClues: string[]): Promise<AIResponse> {
    if (!this.openai) {
      throw new Error('AI service not initialized');
    }

    const prompt = `
你是一位专业的剧本杀主持人，请根据以下信息生成游戏结局：

剧本名称：${script.title}
玩家投票：${JSON.stringify(votes)}
发现的线索：${foundClues.join(', ')}

请根据玩家的投票结果和发现的线索，生成一段符合逻辑的游戏结局，包括真凶揭晓、动机解释和角色命运。
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      return {
        text: response.choices[0].message.content || '',
        type: 'system'
      };
    } catch (error) {
      console.error('Error generating ending:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();