import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useChatWindow } from '../../contexts/ChatWindowContext';
import Sidebar from '../organisms/Sidebar.jsx';
import Navbar from '../organisms/Navbar.jsx';
import Footer from '../organisms/Footer.jsx';
import ChatWindow from '../organisms/ChatWindow.jsx';

const MainLayout = () => {
  const { user, loading } = useAuth();
  const { isPinned, width } = useChatWindow();
  
  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        forceCollapsed={isPinned}
      />
      
      {/* Main Content */}
      <div 
        className={`flex flex-col flex-1 overflow-hidden transition-all duration-300`}
        style={{
          marginRight: isPinned ? `${width}px` : '0'
        }}
      >
        {/* Navbar */}
        <Navbar />
        
        {/* Page Content with Footer */}
        <div className="flex-1 overflow-y-auto bg-background flex flex-col">
          <main className="flex-1 pb-8">
            <Outlet />
          </main>
          
          {/* Footer */}
          <Footer />
        </div>
      </div>
      
      {/* Chat Window */}
      <ChatWindow />
    </div>
  );
};

export default MainLayout;