// 用户类型
export interface User {
  id: string;
  name: string;
  avatar?: string;
  isHost?: boolean;
}

// 游戏状态类型
export enum GameStatus {
  WAITING = 'waiting',
  READING = 'reading',
  INVESTIGATION = 'investigation',
  DISCUSSION = 'discussion',
  VOTING = 'voting',
  ENDING = 'ending'
}

// 房间类型
export interface Room {
  id: string;
  name: string;
  hostId: string;
  users: User[];
  script?: any;
  gameStatus: GameStatus;
  assignedCharacters: Record<string, string>;
  currentScene: string;
  foundClues: string[];
  votes: Record<string, string>;
}

// 消息类型
export interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp: number;
  type: 'chat' | 'system' | 'ai';
}

// AI响应类型
export interface AIResponse {
  text: string;
  type: 'narrator' | 'character' | 'system';
  characterId?: string;
}
