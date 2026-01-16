import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Room, GameStatus, Script, Message } from '../types';

interface AppState {
  // 用户相关
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  
  // 房间相关
  currentRoom: Room | null;
  setCurrentRoom: (room: Room) => void;
  joinRoom: (room: Room) => void;
  leaveRoom: () => void;
  updateRoomUsers: (users: User[]) => void;
  
  // 剧本相关
  currentScript: Script | null;
  setCurrentScript: (script: Script) => void;
  
  // 游戏状态相关
  gameStatus: GameStatus;
  setGameStatus: (status: GameStatus) => void;
  
  // 角色分配相关
  assignCharacter: (userId: string, characterId: string) => void;
  assignedCharacters: Record<string, string>;
  
  // 聊天消息相关
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  
  // 线索相关
  foundClues: string[];
  addFoundClue: (clueId: string) => void;
  
  // 投票相关
  votes: Record<string, string>;
  addVote: (userId: string, characterId: string) => void;
  clearVotes: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // 用户相关
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      
      // 房间相关
      currentRoom: null,
      setCurrentRoom: (room) => set({ currentRoom: room }),
      joinRoom: (room) => set({ currentRoom: room }),
      leaveRoom: () => set({ currentRoom: null }),
      updateRoomUsers: (users) => set((state) => {
        if (!state.currentRoom) return state;
        return {
          currentRoom: {
            ...state.currentRoom,
            users
          }
        };
      }),
      
      // 剧本相关
      currentScript: null,
      setCurrentScript: (script) => set({ currentScript: script }),
      
      // 游戏状态相关
      gameStatus: GameStatus.WAITING,
      setGameStatus: (status) => set({ gameStatus: status }),
      
      // 角色分配相关
      assignedCharacters: {},
      assignCharacter: (userId, characterId) => set((state) => ({
        assignedCharacters: {
          ...state.assignedCharacters,
          [userId]: characterId
        }
      })),
      
      // 聊天消息相关
      messages: [],
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
      })),
      clearMessages: () => set({ messages: [] }),
      
      // 线索相关
      foundClues: [],
      addFoundClue: (clueId) => set((state) => ({
        foundClues: [...state.foundClues, clueId]
      })),
      
      // 投票相关
      votes: {},
      addVote: (userId, characterId) => set((state) => ({
        votes: {
          ...state.votes,
          [userId]: characterId
        }
      })),
      clearVotes: () => set({ votes: {} }),
    }),
    {
      name: 'jubenkill-storage', // 存储名称
      partialize: (state) => ({ 
        currentUser: state.currentUser,
        currentRoom: state.currentRoom,
        currentScript: state.currentScript
      }) // 持久化用户、房间和剧本状态
    }
  )
);
