import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "./ui/Footer";

const Layout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Nội dung các trang */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer luôn có */}
      <Footer />
    </div>
  );
};

export default Layout;
