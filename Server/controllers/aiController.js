const { generateAudioTranscript } = require('../utils/geminiAi');
const path = require('path');
const fs = require('fs');

exports.generateMediaTranscript = async (req, res) => {
    try {
        const { filePath, mimeType } = req.body;

        if (!filePath) {
            return res.status(400).json({ success: false, message: 'Thiếu đường dẫn file' });
        }

        // Chuyển relative path thành absolute path nếu cần
        const absolutePath = path.isAbsolute(filePath)
            ? filePath
            : path.join(__dirname, '..', filePath);

        if (!fs.existsSync(absolutePath)) {
            console.error('[AI Controller] File không tồn tại:', absolutePath);
            return res.status(404).json({ success: false, message: 'File không tồn tại trên server' });
        }

        console.log(`[AI Controller] Bắt đầu xử lý transcript cho: ${absolutePath}`);

        const transcript = await generateAudioTranscript(absolutePath, mimeType || 'audio/mpeg');

        if (!transcript) {
            return res.status(500).json({ success: false, message: 'Không thể tạo được transcript từ AI' });
        }

        res.json({
            success: true,
            data: {
                transcript
            }
        });
    } catch (error) {
        console.error('[AI Controller] Lỗi:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống khi gọi AI', error: error.message });
    }
};
