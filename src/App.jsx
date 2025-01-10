import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ChatScreen from "./screens/chat-screen/ChatScreen";
import Introduction from "./screens/introduction-screen/Introduction-screen";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <Routes>
        <Route path="/introduction" element={<Introduction />} />
        <Route path="/chat" element={<ChatScreen />} />
        <Route path="*" element={<Navigate to="/introduction" />} />
      </Routes>
    </Router>
  );
}

export default App;
