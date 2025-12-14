const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Tạo reset token ngẫu nhiên
const generateResetToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

// Hash reset token để lưu vào database
const hashResetToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Gửi email reset mật khẩu
const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    // Kiểm tra cấu hình email
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Cấu hình email bị thiếu');
    }

    // Tạo transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Kiểm tra kết nối email
    await transporter.verify();
    
    // Tạo URL reset (dùng FRONTEND_URL để deploy đúng, fallback về CLIENT_URL)
    const baseUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password/${resetToken}`;
    
    // Nội dung email
    const mailOptions = {
      from: `"Nền tảng học tiếng Anh" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Yêu cầu đặt lại mật khẩu - Nền tảng học tiếng Anh',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">Yêu cầu đặt lại mật khẩu</h2>
          <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình trên Nền tảng học tiếng Anh.</p>
          <p>Vui lòng nhấp vào nút bên dưới để đặt lại mật khẩu:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Đặt lại mật khẩu
            </a>
          </div>
          <p>Hoặc copy link này vào trình duyệt:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p style="color: #999; font-size: 14px;">
            Liên kết này sẽ hết hạn trong vòng 1 giờ.
          </p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Nền tảng học tiếng Anh - Trường Đại học Văn Lang
          </p>
        </div>
      `
    };
    
    // Gửi email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email đã gửi thành công:', info.messageId);
    
    return { success: true, message: 'Gửi email reset mật khẩu thành công' };
    
  } catch (error) {
    console.error('Lỗi gửi email:', error.message);
    return { 
      success: false, 
      message: 'Gửi email thất bại: ' + error.message
    };
  }
};

module.exports = {
  generateResetToken,
  hashResetToken,
  sendPasswordResetEmail
};
