// Sinh màu avatar cố định dựa trên tên người dùng
export const getAvatarColor = (name: string): string => {
  const colors = [
    'bg-red-500',
    'bg-blue-500', 
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500'
  ];
  
  // Tạo hash đơn giản từ tên
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Lấy chỉ số màu trong danh sách
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// Lấy chữ cái viết tắt để hiển thị trong avatar
export const getUserInitials = (user: any): string => {
  if (user?.firstName && user?.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }
  return user?.username?.charAt(0).toUpperCase() || 'U';
};

// Ưu tiên hiển thị họ tên, fallback sang username
export const getUserDisplayName = (user: any): string => {
  if (user?.firstName && user?.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user?.username || 'User';
};

// Xử lý URL avatar
export const getAvatarUrl = (avatarPath: string | undefined): string | undefined => {
  if (!avatarPath) return undefined;
  if (avatarPath.startsWith('http') || avatarPath.startsWith('data:')) return avatarPath;
  
  const apiUrl = process.env.REACT_APP_API_URL || '';
  // Remove /api suffix if present to get base URL
  const baseUrl = apiUrl.replace(/\/api\/?$/, '');
  
  // Ensure path doesn't start with /
  const cleanPath = avatarPath.startsWith('/') ? avatarPath.slice(1) : avatarPath;
  
  return `${baseUrl}/${cleanPath}`;
};
