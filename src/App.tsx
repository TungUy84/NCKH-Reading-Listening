import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import Layout from "./components/Layout";

import Home from "./pages/Home";
import PlacementTest from "./pages/PlacementTest";
import Practice from "./pages/Practice";
import MockTest from "./pages/MockTest";
import Lessons from "./pages/Lessons";
import Blog from "./pages/Blog";
import LearningPath from "./pages/LearningPath";
import Auth from "./pages/Auth";
import Contact from "./pages/Contact";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  return (
    <Router>
      <div className="min-h-screen bg-white">
        {/* Navbar luôn hiển thị */}
        <Navbar
          isLoggedIn={isLoggedIn}
          user={user}
          onLogin={setIsLoggedIn}
          onSetUser={setUser}
        />

        {/* Khai báo route */}
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Dùng index thay cho path="/" để tránh bị lồng route */}
            <Route index element={<Home />} />
            <Route path="placement" element={<PlacementTest />} />
            <Route path="practice" element={<Practice />} />
            <Route path="mock-test" element={<MockTest />} />
            <Route path="lessons" element={<Lessons />} />
            <Route
              path="blog"
              element={
                <Blog
                  isLoggedIn={isLoggedIn}
                  user={user}
                  onLogin={setIsLoggedIn}
                  onSetUser={setUser}
                />
              }
            />
            <Route path="learning-path" element={<LearningPath />} />
            <Route
              path="auth"
              element={<Auth onLogin={setIsLoggedIn} onSetUser={setUser} />}
            />
            <Route path="contact" element={<Contact />} />
          </Route>
        </Routes>

        {/* ToastContainer để hiển thị thông báo */}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;
