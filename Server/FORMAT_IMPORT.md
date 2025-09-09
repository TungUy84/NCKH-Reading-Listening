# Format file Word để import bài kiểm tra

## Cấu trúc file Word yêu cầu:

```
Test Nghe hiểu cơ bản - Listening Skills
Bài kiểm tra đầu vào cho kỹ năng nghe hiểu tiếng Anh cơ bản
listening
45
Đọc kỹ câu hỏi trước khi nghe
Mỗi đoạn audio sẽ được phát 2 lần
Chọn đáp án đúng nhất cho mỗi câu hỏi
Không được trao đổi trong quá trình làm bài
---
Q1: What time does the library close on weekdays? (Level: AV2, Skill: listening, Points: 1)
A) 5:00 PM
B) 6:00 PM *
C) 7:00 PM
D) 8:00 PM

Q2: Where is the meeting taking place? (Level: AV3, Skill: listening, Points: 1)
A) Conference room A
B) Conference room B *
C) Main office
D) Reception area

Q3: What is the main topic of the conversation? (Level: AV3, Skill: listening, Points: 2)
Passage: The speakers discuss their weekend plans and upcoming work projects.
A) Weekend activities *
B) Work schedules *
C) Holiday plans
D) Office policies

Q4: Complete the sentence: The train will arrive at _____ station. (Level: AV1, Skill: listening, Points: 1)
Central

Q5: How many people attended the conference? (Level: AV4, Skill: listening, Points: 2)
A) 150
B) 200 *
C) 250
D) 300
```

## Quy tắc format:

1. **Dòng 1**: Tiêu đề bài test
2. **Dòng 2**: Mô tả bài test
3. **Dòng 3**: Loại bài test (listening/reading/general)
4. **Dòng 4**: Thời gian làm bài (phút)
5. **Dòng 5+**: Các hướng dẫn (mỗi dòng một hướng dẫn)
6. **Dòng ---**: Dấu phân cách giữa hướng dẫn và câu hỏi
7. **Câu hỏi**: Format Q[số]: [nội dung] (Level: AV1-AV7, Skill: listening/reading/grammar/vocabulary, Points: [điểm])
8. **Đáp án**: A), B), C), D) - đáp án đúng có dấu *
9. **Đoạn văn** (tùy chọn): Passage: [nội dung đoạn văn]
10. **Câu trả lời ngắn**: Không có A), B), C), D) - chỉ có câu trả lời đúng

## Loại câu hỏi được hỗ trợ:

- **Single choice**: 1 đáp án đúng (có dấu *)
- **Multiple choice**: Nhiều đáp án đúng (nhiều dấu *)
- **Fill blank**: Không có A), B), C), D) - chỉ có câu trả lời đúng

## Level hỗ trợ:
- AV1, AV2, AV3, AV4, AV5, AV6, AV7

## Skill hỗ trợ:
- listening, reading, grammar, vocabulary
