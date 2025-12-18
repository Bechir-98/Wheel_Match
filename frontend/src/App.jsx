import { ThemeProvider } from 'next-themes';
import AppRoutes from './routes/AppRoutes';
import { ChatProvider } from './components/chat/ChatContext.jsx';
import ChatWidget from './components/chat/ChatWidget.jsx';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <ChatProvider>
        <>
          <AppRoutes />
          <ChatWidget />
        </>
      </ChatProvider>
    </ThemeProvider>
  );
}

export default App;
