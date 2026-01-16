
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import LoginPage from './pages/LoginPage';
import RoomListPage from './pages/RoomListPage';
import RoomPage from './pages/RoomPage';
import GamePage from './pages/GamePage';
import './index.css';

// 完整版App组件，包含路由配置
function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

// 路由组件，用于内部使用useNavigate
function AppRoutes() {
  const { currentUser } = useStore();
  
  return (
    <Routes>
      {/* 登录页面 */}
      <Route 
        path="/login" 
        element={currentUser ? <Navigate to="/rooms" /> : <LoginPage />} 
      />
      
      {/* 房间列表页面 */}
      <Route 
        path="/rooms" 
        element={!currentUser ? <Navigate to="/login" /> : <RoomListPage />} 
      />
      
      {/* 房间页面 */}
      <Route 
        path="/room" 
        element={!currentUser ? <Navigate to="/login" /> : <RoomPage />} 
      />
      
      {/* 游戏页面 */}
      <Route 
        path="/game" 
        element={!currentUser ? <Navigate to="/login" /> : <GamePage />} 
      />
      
      {/* 根路径重定向，登录态用户到房间列表，未登录到登录页 */}
      <Route 
        path="/" 
        element={currentUser ? <Navigate to="/rooms" /> : <Navigate to="/login" />} 
      />
      
      {/* 默认路由重定向到登录页面 */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;