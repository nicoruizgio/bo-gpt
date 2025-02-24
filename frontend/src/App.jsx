import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import RatingScreen from "./screens/rating-screen/RatingScreen";
import Introduction from "./screens/introduction-screen/Introduction-screen";
import RecommenderScreen from "./screens/recommender-screen/RecommenderScreen";
import LogInScreen from "./screens/log-in-screen/LogInScreen";
import SignUpScreen from "./screens/sign-up-screen/SingUpScreen";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Instruction from "./screens/instruction-screen/InstructionScreen";


function App() {
  return (
    <Router>

      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/log-in" element={<LogInScreen />} />
          <Route path="/sign-up" element={<SignUpScreen />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/introduction" element={<Introduction />} />
          <Route path="/rating" element={<RatingScreen />} />
          <Route path="/instruction" element={<Instruction />} />
          <Route path="/recommender" element={<RecommenderScreen />} />
        </Route>

        {/* Redirect unknown routes to Login */}
        <Route path="*" element={<Navigate to="/log-in" />} />
      </Routes>
    </Router>
  );
}

export default App;
