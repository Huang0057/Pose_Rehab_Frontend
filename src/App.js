import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home/Home";
import GamesPage from "./pages/Games/Games";
import CheckinPage from "./pages/CheckIn/CheckIn";
import DifficultyPage from "./pages/Difficulty/Difficulty";
import LoginPage from "./pages/Login/Login";
import RecordsPage from "./pages/Records/Records";
import GameDescriptionPage from "./pages/GameDescription/GameDescription";
import Footer from "./components/layout/Footer/Footer";
import Header from "./components/layout/Header/Header";
import LoginFooter from "./components/layout/LoginFooter/LoginFooter";

const App = () => {
  const location = useLocation();
  const isLoginPage =
    location.pathname === "/login" || location.pathname === "/";
  return (
    <div>
      {!isLoginPage && <Header />}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/checkin" element={<CheckinPage />} />
        <Route path="/difficulty" element={<DifficultyPage />} />
        <Route path="/records" element={<RecordsPage />} />
        <Route path="/description" element={<GameDescriptionPage />} />
      </Routes>
      {isLoginPage && <LoginFooter />}
      {!isLoginPage && <Footer />}
    </div>
  );
};
const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);
export default AppWrapper;
