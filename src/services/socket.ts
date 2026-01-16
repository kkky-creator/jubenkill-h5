import { User, Room, Message, GameStatus } from '../types/index';
import { useStore } from '../store';
import { io, Socket } from 'socket.io-client';
import { generateMockScript } from '../utils/scriptParser';

// 真实的Socket.io服务，连接到后端服务器
class SocketService {
  public socket: Socket | null = null;
  private baseUrl = 'http://localhost:3001';

  // 连接到服务器
  connect(userId: string, userName: string) {
    console.log('Connecting to socket server...');
    
    // 创建Socket.io连接
    this.socket = io(this.baseUrl, {
      transports: ['websocket'],
      query: {
        userId,
        userName
      }
    });

    // 连接成功事件
    this.socket.on('connect', () => {
      console.log('Socket connected', this.socket?.id);
      // 通知服务器当前用户信息
      this.socket?.emit('connect_user', { userId, userName });
    });

    // 连接错误事件
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // 断开连接事件
    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // 房间创建成功事件
    this.socket.on('room_created', (room: Room) => {
      console.log('Room created:', room);
      const store = useStore.getState();
      store.setCurrentRoom(room);
      store.setCurrentScript(room.script);
    });

    // 房间加入成功事件
    this.socket.on('room_joined', (room: Room) => {
      console.log('Room joined:', room);
      const store = useStore.getState();
      store.setCurrentRoom(room);
      store.setCurrentScript(room.script);
    });

    // 房间不存在事件
    this.socket.on('room_not_found', ({ roomId }: { roomId: string }) => {
      console.error('Room not found:', roomId);
      window.location.href = '/rooms?error=room_not_found';
    });

    // 房间更新事件
    this.socket.on('room_updated', (room: Room) => {
      console.log('Room updated:', room);
      const store = useStore.getState();
      store.setCurrentRoom(room);
    });

    // 房间列表更新事件
    this.socket.on('rooms_updated', (rooms: Room[]) => {
      console.log('Rooms updated:', rooms);
      // 这里可以更新房间列表，在RoomListPage中实现
    });

    // 消息接收事件
    this.socket.on('message_received', (message: Message) => {
      console.log('Message received:', message);
      const store = useStore.getState();
      store.addMessage(message);
    });
  }

  // 断开连接
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket disconnected');
    }
  }

  // 创建房间
  createRoom(roomName: string) {
    console.log('Creating room:', roomName);
    const currentUser = useStore.getState().currentUser;
    if (!currentUser || !this.socket) {
      console.error('Current user is not set or socket is not connected');
      return;
    }

    // 生成模拟剧本
    const mockScript = generateMockScript();

    this.socket.emit('create_room', {
      roomName,
      userId: currentUser.id,
      userName: currentUser.name,
      script: mockScript
    });
  }

  // 加入房间
  joinRoom(roomId: string) {
    console.log('Joining room:', roomId);
    const currentUser = useStore.getState().currentUser;
    if (!currentUser || !this.socket) {
      console.error('Current user is not set or socket is not connected');
      return;
    }

    this.socket.emit('join_room', {
      roomId,
      userId: currentUser.id,
      userName: currentUser.name
    });
  }

  // 退出房间
  leaveRoom(roomId: string) {
    console.log('Leaving room:', roomId);
    const currentUser = useStore.getState().currentUser;
    if (!currentUser || !this.socket) {
      console.error('Current user is not set or socket is not connected');
      return;
    }

    this.socket.emit('leave_room', {
      roomId,
      userId: currentUser.id
    });
  }

  // 发送消息
  sendMessage(content: string, type: 'chat' | 'system' | 'ai' = 'chat') {
    console.log('Sending message:', content, type);
    const currentUser = useStore.getState().currentUser;
    const currentRoom = useStore.getState().currentRoom;
    if (!currentUser || !currentRoom || !this.socket) {
      console.error('Current user, room or socket is not set');
      return;
    }

    this.socket.emit('send_message', {
      roomId: currentRoom.id,
      userId: currentUser.id,
      content,
      type
    });
  }

  // 开始游戏
  startGame() {
    console.log('Starting game');
    const currentRoom = useStore.getState().currentRoom;
    if (!currentRoom || !this.socket) {
      console.error('Current room or socket is not set');
      return;
    }

    this.socket.emit('start_game', {
      roomId: currentRoom.id
    });
  }

  // 分配角色
  assignCharacter(userId: string, characterId: string) {
    console.log('Assigning character:', userId, characterId);
    const currentRoom = useStore.getState().currentRoom;
    if (!currentRoom || !this.socket) {
      console.error('Current room or socket is not set');
      return;
    }

    this.socket.emit('assign_character', {
      roomId: currentRoom.id,
      userId,
      characterId
    });
  }

  // 发现线索
  findClue(clueId: string) {
    console.log('Finding clue:', clueId);
    const currentRoom = useStore.getState().currentRoom;
    if (!currentRoom || !this.socket) {
      console.error('Current room or socket is not set');
      return;
    }

    this.socket.emit('find_clue', {
      roomId: currentRoom.id,
      clueId
    });
  }

  // 投票
  vote(characterId: string) {
    console.log('Voting for:', characterId);
    const currentUser = useStore.getState().currentUser;
    const currentRoom = useStore.getState().currentRoom;
    if (!currentUser || !currentRoom || !this.socket) {
      console.error('Current user, room or socket is not set');
      return;
    }
    
    this.socket.emit('vote', {
      roomId: currentRoom.id,
      userId: currentUser.id,
      characterId
    });
  }
}

export const socketService = new SocketService();
