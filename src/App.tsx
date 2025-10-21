import { Outlet } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { Toaster } from '@/components/ui/sonner';
function App() {
  return (
    <Layout>
      <Outlet />
      <ChatWidget />
      <Toaster />
    </Layout>
  );
}
export default App;