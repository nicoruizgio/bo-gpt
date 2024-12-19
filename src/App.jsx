import { useState } from "react";
import ChatScreen from "./screens/ChatScreen";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <ChatScreen />
    </>
  );
}

export default App;
