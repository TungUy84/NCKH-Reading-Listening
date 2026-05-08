const cron = require('node-cron');
const User = require('../models/User');
const { sendEmail } = require('./email');

// Thời gian không hoạt động trước khi gửi email (ngày)
const INACTIVITY_DAYS = 7;

/**
 * Gửi email nhắc nhở cho người dùng không đăng nhập
 * Chạy vào 9:00 sáng Thứ 2 hàng tuần
 */
const scheduleInactivityNotifications = () => {
  // Biểu thức cron: 0 9 * * 1 = 09:00 Thứ 2 hàng tuần
  // Chỉ chạy trên production hoặc khi được bật qua env variable
  if (process.env.ENABLE_NOTIFICATIONS !== 'true') {
    console.log('[Notification Scheduler] Thông báo bị vô hiệu hóa');
    return;
  }

  cron.schedule('0 9 * * 1', async () => {
    console.log('[Notification Scheduler] Bắt đầu gửi thông báo không hoạt động lúc 09:00 Thứ 2');
    await sendInactivityNotifications();
  });

  console.log('[Notification Scheduler] Lịch gửi thông báo đã khởi động (09:00 Thứ 2 hàng tuần)');
};

/**
 * Gửi email tới người dùng không hoạt động
 */
const sendInactivityNotifications = async () => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - INACTIVITY_DAYS);

    const notificationCutoffDate = new Date();
    notificationCutoffDate.setDate(notificationCutoffDate.getDate() - 7); // 1 tuần 1 lần

    // Tìm những người dùng không đăng nhập trong vòng INACTIVITY_DAYS ngày
    // và chưa được gửi thông báo trong 14 ngày qua
    const inactiveUsers = await User.find({
      lastLogin: { $lt: cutoffDate },
      isActive: true,
      $or: [
        { lastNotificationSent: { $lt: notificationCutoffDate } },
        { lastNotificationSent: { $exists: false } }
      ]
    }).select('_id email firstName lastName lastLogin');

    if (inactiveUsers.length === 0) {
      return;
    }


    let successCount = 0;
    let failureCount = 0;

    // Gửi email cho từng người dùng
    for (const user of inactiveUsers) {
      try {
        const emailContent = generateInactivityEmailContent(user);

        await sendEmail({
          to: user.email,
          subject: emailContent.subject,
          html: emailContent.html
        });

        // Cập nhật thời gian gửi thông báo cuối cùng
        await User.findByIdAndUpdate(user._id, {
          lastNotificationSent: new Date()
        });

        successCount++;
        console.log(`[Notification] Gửi thông báo thành công cho ${user.email}`);
      } catch (error) {
        failureCount++;
        console.error(`[Notification] Lỗi gửi email cho ${user.email}:`, error.message);
      }
    }

    console.log(`[Notification] Hoàn tất: ${successCount} thành công, ${failureCount} thất bại`);
  } catch (error) {
    console.error('[Notification Scheduler] Lỗi khi gửi thông báo:', error);
  }
};

/**
 * Tạo nội dung email nhắc nhở
 */
const generateInactivityEmailContent = (user) => {
  const userName = user.firstName || 'Bạn';
  const lastLoginDate = new Date(user.lastLogin).toLocaleDateString('vi-VN');

  return {
    subject: '🎓 Hãy tiếp tục học tập với UNSkills!',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Chúng tôi nhớ bạn! 👋</h1>
        </div>

        <!-- Main Content -->
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            Xin chào <strong>${userName}</strong>,
          </p>

          <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 20px;">
            Chúng tôi nhận thấy bạn chưa hoạt động trên UNSkills trong vài ngày qua (lần đăng nhập cuối cùng: <strong>${lastLoginDate}</strong>).
          </p>

          <div style="background-color: #f0f4ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #333;">
              <strong>💡 Gợi ý:</strong> Hãy tiếp tục học tập để đạt được mục tiêu của bạn! Mỗi ngày học một chút sẽ giúp bạn tiến bộ nhanh hơn.
            </p>
          </div>

          <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 20px;">
            Tại UNSkills, bạn có thể:
          </p>

          <ul style="font-size: 14px; color: #555; line-height: 1.8; margin-bottom: 20px;">
            <li>📚 Học các bài học lý thuyết</li>
            <li>✏️ Thực hành với các bài tập</li>
            <li>🎯 Làm bài kiểm tra để đánh giá trình độ</li>
            <li>📊 Theo dõi tiến độ học tập của bạn</li>
          </ul>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; transition: transform 0.3s ease;">
              🚀 Quay lại học tập ngay
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

          <p style="font-size: 13px; color: #888; line-height: 1.6;">
            Nếu bạn không muốn nhận những email nhắc nhở này, bạn có thể tắt thông báo trong cài đặt tài khoản.
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
          <p style="margin: 0; font-size: 12px; color: #999;">
            © UNSkills - Nền tảng học tiếng Anh hiệu quả
          </p>
        </div>
      </div>
    `
  };
};

module.exports = {
  scheduleInactivityNotifications,
  sendInactivityNotifications
};
