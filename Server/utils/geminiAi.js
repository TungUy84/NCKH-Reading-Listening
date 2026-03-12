const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server');

// Hàm tạo transcript sử dụng inlineData (không qua File API)
const generateAudioTranscript = async (filePath, mimeType) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn('[Gemini AI] Thiếu GEMINI_API_KEY trong .env');
        return '';
    }

    try {
        // Khởi tạo SDK bên trong để đảm bảo env đã load
        const genAI = new GoogleGenerativeAI(apiKey);
        console.log(`[Gemini AI] Đang đọc file audio và chuyển đổi sang Base64...`);
        const audioBuffer = fs.readFileSync(filePath);
        const base64Audio = audioBuffer.toString('base64');

        // Khởi tạo Model
        console.log(`[Gemini AI] Bắt đầu gọi model gemini-3-flash-preview để tạo transcript (Inline Data)...`);
        const model = genAI.getGenerativeModel({
            model: 'gemini-3-flash-preview',
        });

        const result = await model.generateContent([
            {
                inlineData: {
                    data: base64Audio,
                    mimeType: mimeType
                }
            },
            { text: "Please provide a highly accurate transcript of this English audio. Do not include any extra commentary, just the text spoken, maintaining paragraphs if it's long. Response in plain text." },
        ]);

        const transcript = result.response.text();
        console.log(`[Gemini AI] Đã lấy được Transcript thành công (${transcript.length} ký tự).`);

        return transcript.trim();
    } catch (error) {
        console.error('[Gemini AI] Lỗi khi tạo transcript:', error.message || error);
        return '';
    }
};

module.exports = {
    generateAudioTranscript,
};
