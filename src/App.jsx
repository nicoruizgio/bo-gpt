import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import RatingScreen from "./screens/rating-screen/RatingScreen";
import Introduction from "./screens/introduction-screen/Introduction-screen";
import RecommenderScreen from "./screens/recommender-screen/RecommenderScreen";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <Routes>
        <Route path="/introduction" element={<Introduction />} />
        <Route path="/rating" element={<RatingScreen />} />
        <Route path="/recommender" element={<RecommenderScreen />} />
        <Route path="*" element={<Navigate to="/introduction" />} />
      </Routes>
    </Router>
  );
}

export default App;
