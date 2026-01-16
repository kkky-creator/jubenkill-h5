import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

// 用户类型
interface User {
  id: string;
  name: string;
  avatar?: string;
  isHost?: boolean;
}

// 游戏状态类型
enum GameStatus {
  WAITING = "waiting",
  READING = "reading",
  INVESTIGATION = "investigation",
  DISCUSSION = "discussion",
  VOTING = "voting",
  ENDING = "ending"
}

// 房间类型
interface Room {
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
interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp: number;
  type: "chat" | "system" | "ai";
}

// AI响应类型
interface AIResponse {
  text: string;
  type: "narrator" | "character" | "system";
  characterId?: string;
}

// 创建Express应用
const app = express();
// 创建HTTP服务器
const server = http.createServer(app);
// 创建Socket.io服务器
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 使用CORS中间件
app.use(cors());
// 使用JSON中间件
app.use(express.json());

// 维护一个房间列表
const rooms = new Map<string, Room>();
// 维护用户与socket的映射
const userSocketMap = new Map<string, string>();

// 生成唯一ID
const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// API路由
// 获取所有房间
app.get("/api/rooms", (req, res) => {
  res.json(Array.from(rooms.values()));
});

// 创建房间
app.post("/api/rooms", (req, res) => {
  const { roomName, userId, userName } = req.body;
  if (!roomName || !userId || !userName) {
    return res.status(400).json({ error: "缺少必要参数" });
  }

  const roomId = generateId();
  const user: User = {
    id: userId,
    name: userName,
    isHost: true
  };

  const room: Room = {
    id: roomId,
    name: roomName,
    hostId: userId,
    users: [user],
    gameStatus: GameStatus.WAITING,
    assignedCharacters: {},
    currentScene: "",
    foundClues: [],
    votes: {}
  };

  rooms.set(roomId, room);
  res.json(room);
});

// 获取房间详情
app.get("/api/rooms/:roomId", (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  if (!room) {
    return res.status(404).json({ error: "房间不存在" });
  }
  res.json(room);
});

// Socket.io事件处理
io.on("connection", (socket) => {
  console.log("客户端连接:", socket.id);

  // 连接事件
  socket.on("connect_user", (data: { userId: string; userName: string }) => {
    userSocketMap.set(data.userId, socket.id);
    console.log(`用户 ${data.userName} (${data.userId}) 连接`);
  });

  // 创建房间
  socket.on("create_room", (data: { roomName: string; userId: string; userName: string; script?: any }) => {
    const { roomName, userId, userName, script } = data;
    const roomId = generateId();
    const user: User = {
      id: userId,
      name: userName,
      isHost: true
    };

    const room: Room = {
      id: roomId,
      name: roomName,
      hostId: userId,
      users: [user],
      script,
      gameStatus: GameStatus.WAITING,
      assignedCharacters: {},
      currentScene: "",
      foundClues: [],
      votes: {}
    };

    rooms.set(roomId, room);
    socket.join(roomId);
    socket.emit("room_created", room);
    io.emit("rooms_updated", Array.from(rooms.values()));
    console.log(`房间 ${roomName} (${roomId}) 由用户 ${userName} 创建`);
  });

  // 加入房间
  socket.on("join_room", (data: { roomId: string; userId: string; userName: string }) => {
    const { roomId, userId, userName } = data;
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit("room_not_found", { roomId });
      return;
    }

    // 检查用户是否已在房间中
    const existingUser = room.users.find(user => user.id === userId);
    if (existingUser) {
      socket.join(roomId);
      socket.emit("room_joined", room);
      io.to(roomId).emit("room_updated", room);
      return;
    }

    // 添加新用户到房间
    const user: User = {
      id: userId,
      name: userName,
      isHost: false
    };

    room.users.push(user);
    rooms.set(roomId, room);
    socket.join(roomId);
    socket.emit("room_joined", room);
    io.to(roomId).emit("room_updated", room);
    io.emit("rooms_updated", Array.from(rooms.values()));
    console.log(`用户 ${userName} (${userId}) 加入房间 ${room.name} (${roomId})`);
  });

  // 离开房间
  socket.on("leave_room", (data: { roomId: string; userId: string }) => {
    const { roomId, userId } = data;
    const room = rooms.get(roomId);
    
    if (!room) {
      return;
    }

    // 从房间中移除用户
    room.users = room.users.filter(user => user.id !== userId);

    if (room.users.length === 0) {
      // 房间空了，删除房间
      rooms.delete(roomId);
      io.emit("rooms_updated", Array.from(rooms.values()));
      console.log(`房间 ${room.name} (${roomId}) 已删除，因为没有用户了`);
    } else {
      // 检查原房主是否离开，如果是，重新分配房主
      if (room.hostId === userId) {
        room.hostId = room.users[0].id;
        room.users[0].isHost = true;
      }
      rooms.set(roomId, room);
      socket.leave(roomId);
      io.to(roomId).emit("room_updated", room);
      io.emit("rooms_updated", Array.from(rooms.values()));
      console.log(`用户 ${userId} 离开房间 ${room.name} (${roomId})`);
    }
  });

  // 发送消息
  socket.on("send_message", (data: { roomId: string; userId: string; content: string; type: "chat" | "system" | "ai" }) => {
    const { roomId, userId, content, type = "chat" } = data;
    const room = rooms.get(roomId);
    
    if (!room) {
      return;
    }

    const message: Message = {
      id: generateId(),
      userId,
      content,
      timestamp: Date.now(),
      type
    };

    io.to(roomId).emit("message_received", message);
    console.log(`房间 ${room.name} (${roomId}) 收到消息: ${content}`);
  });

  // 开始游戏
  socket.on("start_game", (data: { roomId: string }) => {
    const { roomId } = data;
    const room = rooms.get(roomId);
    
    if (!room) {
      return;
    }

    room.gameStatus = GameStatus.READING;
    rooms.set(roomId, room);
    io.to(roomId).emit("room_updated", room);
    console.log(`房间 ${room.name} (${roomId}) 游戏开始`);
  });

  // 分配角色
  socket.on("assign_character", (data: { roomId: string; userId: string; characterId: string }) => {
    const { roomId, userId, characterId } = data;
    const room = rooms.get(roomId);
    
    if (!room) {
      return;
    }

    // 更新房间中的角色分配
    room.assignedCharacters[userId] = characterId;
    rooms.set(roomId, room);
    io.to(roomId).emit("room_updated", room);
    console.log(`房间 ${room.name} (${roomId}) 中，用户 ${userId} 被分配角色 ${characterId}`);
  });

  // 发现线索
  socket.on("find_clue", (data: { roomId: string; clueId: string }) => {
    const { roomId, clueId } = data;
    const room = rooms.get(roomId);
    
    if (!room) {
      return;
    }

    // 如果线索不在已发现列表中，添加它
    if (!room.foundClues.includes(clueId)) {
      room.foundClues.push(clueId);
      rooms.set(roomId, room);
      io.to(roomId).emit("room_updated", room);
      console.log(`房间 ${room.name} (${roomId}) 中发现了新线索: ${clueId}`);
    }
  });

  // 投票
  socket.on("vote", (data: { roomId: string; userId: string; characterId: string }) => {
    const { roomId, userId, characterId } = data;
    const room = rooms.get(roomId);
    
    if (!room) {
      return;
    }

    // 更新房间中的投票
    room.votes[userId] = characterId;
    rooms.set(roomId, room);
    io.to(roomId).emit("room_updated", room);
    console.log(`房间 ${room.name} (${roomId}) 中，用户 ${userId} 投票给了角色 ${characterId}`);
  });

  // 断开连接
  socket.on("disconnect", () => {
    console.log("客户端断开连接:", socket.id);
    // 查找断开连接的用户ID
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        console.log(`用户 ${userId} 断开连接`);
        break;
      }
    }
  });
});

// 启动服务器
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
