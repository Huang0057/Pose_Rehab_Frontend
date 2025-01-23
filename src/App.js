import "./App.css";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from './context/authContext';
import Home from "./pages/Home/Home";
import Games from "./pages/Games/Games";
import CheckIn from "./pages/CheckIn/CheckIn";
import Difficulty from "./pages/Difficulty/Difficulty";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Records from "./pages/Records/Records";
import GameDescription from "./pages/GameDescription/GameDescription";
import Footer from "./components/layout/Footer/Footer";
import Header from "./components/layout/Header/Header";
import PoseGame from "./pages/PoseGame/PoseGame";
import ArmGame from "./pages/ArmGame/ArmGame";
import FootGame from "./pages/FootGame/FootGame";
import EndGame from "./pages/EndGame/EndGame";

const App = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login" || location.pathname === "/";
  const isRegisterPage = location.pathname === "/register";

  return (
    <div>
      {!isLoginPage && !isRegisterPage && <Header />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/games" element={<Games />} />
        <Route path="/checkin" element={<CheckIn />} />
        <Route path="/difficulty" element={<Difficulty />} />
        <Route path="/records" element={<Records />} />
        <Route path="/description" element={<GameDescription />} />
        <Route path="/posegame" element={<PoseGame />} />
        <Route path="/footgame" element={<FootGame />} />
        <Route path="/armgame" element={<ArmGame />} />
        <Route path="/endgame" element={<EndGame />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      {!isLoginPage && !isRegisterPage && <Footer />}
    </div>
  );
};

const AppWrapper = () => (
  <AuthProvider>
    <Router>
      <App />
    </Router>
  </AuthProvider>
);

export default AppWrapper;