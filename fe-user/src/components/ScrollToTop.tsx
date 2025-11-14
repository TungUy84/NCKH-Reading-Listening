import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Tự động cuộn lên đầu trang mỗi khi đổi route
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Đổi path thì cuộn lên đầu trang để tránh giữ vị trí cũ
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
