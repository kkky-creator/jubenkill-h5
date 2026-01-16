// 用户类型
export interface User {
  id: string;
  name: string;
  avatar?: string;
  isHost?: boolean;
}

// 角色类型
export interface Character {
  id: string;
  name: string;
  description: string;
  background: string;
  secrets: string[];
  relationships: Record<string, string>;
}

// 剧本类型
export interface Script {
  id: string;
  title: string;
  description: string;
  characters: Character[];
  scenes: Scene[];
  clues: Clue[];
  timeline: TimelineItem[];
}

// 场景类型
export interface Scene {
  id: string;
  name: string;
  description: string;
  location: string;
  time: string;
  clues: string[]; // 线索ID数组
}

// 线索类型
export interface Clue {
  id: string;
  name: string;
  description: string;
  location: string;
  relatedCharacter?: string; // 关联角色ID
  isFound?: boolean;
}

// 时间线类型
export interface TimelineItem {
  id: string;
  time: string;
  description: string;
  relatedCharacters: string[]; // 关联角色ID数组
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
  script: Script;
  gameStatus: GameStatus;
  assignedCharacters: Record<string, string>; // userId -> characterId
  currentScene: string;
  foundClues: string[];
  votes: Record<string, string>; // userId -> characterId
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