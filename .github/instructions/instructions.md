---
applyTo: '**'
---
# Hướng dẫn tùy chỉnh cho GitHub Copilot

## Giao tiếp với Copilot (Cách Copilot trò chuyện)

- **Ngôn ngữ phản hồi:** Khi giải thích code, gỡ lỗi, hoặc trả lời bất kỳ câu hỏi nào, hãy **luôn phản hồi bằng tiếng Việt**.
- **Phong cách:** Giải thích rõ ràng, súc tích và đi thẳng vào vấn đề.

---

## Nguyên tắc chung (Design Rules)

- **Ngôn ngữ:** Luôn viết code bằng cú pháp ES6+ (ví dụ: `const`, `let`, arrow functions, `async/await`).
- **Comments (Ghi chú):** Luôn thêm ghi chú giải thích cho các hàm (functions) và các khối logic quan trọng/phức tạp. **Ghi chú phải được viết bằng tiếng Việt.**
- **Async/Await:** Ưu tiên sử dụng `async/await` thay vì `.then()`/`.catch()` cho các tác vụ bất đồng bộ.
- **Error Handling:** Luôn bọc code `await` trong khối `try...catch`.
- **API Response:** Giữ cấu trúc hiện tại: trả JSON dạng `{ message: string, ...payload }`. Khi có dữ liệu kèm theo, đặt dưới khóa tương ứng (`user`, `token`, `data`, v.v.); khi lỗi trả `{ message, error? }` với HTTP status phù hợp.
- **Naming Convention (Quy tắc đặt tên):**
    - Toàn bộ tên biến, tên hàm, tên class... **đều phải bằng tiếng Anh**.
    - Sử dụng `camelCase` cho biến và hàm (ví dụ: `myVariable`, `getUser`).
    - Sử dụng `PascalCase` cho class và components React (ví dụ: `UserService`, `ButtonComponent`).
- **Simplicity:** Ưu tiên các giải pháp đơn giản, dễ đọc.

---

## Backend: NodeJS

- **Framework:** Chúng ta sử dụng **Express.js** làm framework chính.
- **Biến môi trường:** Luôn sử dụng `process.env` (ví dụ: `process.env.PORT`, `process.env.DB_URL`) để lấy các giá trị cấu hình. Không hard-code credentials.
- **Cấu trúc:**
    - `routes/`: Định nghĩa các API endpoints.
    - `controllers/`: Xử lý logic nghiệp vụ (business logic) cho mỗi route.
    - `models/`: Định nghĩa Mongoose schemas.
    - `middleware/`: Chứa các middleware (ví dụ: `authMiddleware`, `errorMiddleware`).
- **Error Handling:** Sử dụng một middleware xử lý lỗi (error-handling middleware) tập trung ở cuối tệp `app.js` hoặc `server.js`.
- **Responses:** Gửi phản hồi JSON nhất quán (xem phần RESTful API).

---

## Frontend: React TypeScript

- **TypeScript:** Tất cả component phải là `.tsx`.
- **Components:** Chỉ dùng Functional Components với React Hooks.
- **Typing:** Định nghĩa `interface`/`type` cho props, state, context; tránh `any`.
- **State:** `useState` cho state cục bộ, `useContext` (kèm `useReducer` nếu cần) cho state toàn cục.
- **Styling:** Sử dụng Tailwind CSS; tái sử dụng class utility theo hệ thống màu, đổ bóng, bo góc của dự án. Không trộn CSS inline trừ trường hợp bất khả kháng.
- **Simplicity:** Ưu tiên các giải pháp đơn giản, dễ đọc.
- **Icon & SVG:** Không tự vẽ SVG thủ công hoặc dùng Unicode emoji; luôn chọn icon từ thư viện (Heroicons, Lucide, react-icons, v.v.).
- **Imports:** Sắp xếp theo thứ tự: React → thư viện ngoài → import nội bộ (components, hooks, utils…).
---

## Database: MongoDB

- **ODM:** Chúng ta sử dụng **Mongoose**.
- **Schema:**
    - Mọi Mongoose Schema phải được định nghĩa trong thư mục `models/`.
    - Luôn bật `timestamps: true` trong schema options.
    - Định nghĩa kiểu dữ liệu (ví dụ: `String`, `Number`, `ObjectId`) rõ ràng. Sử dụng `required: true` nếu cần.
    - Sử dụng `ref` để liên kết (populate) với các model khác. Ví dụ: `author: { type: Schema.Types.ObjectId, ref: 'User' }`.
- **Queries:** Ưu tiên sử dụng các phương thức Mongoose (ví dụ: `Model.find()`, `Model.findById()`, `Model.findOneAndUpdate()`).

---

## RESTful API

- **HTTP Methods:** Sử dụng đúng các HTTP verb:
    - `GET`: Lấy dữ liệu.
    - `POST`: Tạo mới tài nguyên.
    - `PUT`/`PATCH`: Cập nhật tài nguyên.
    - `DELETE`: Xóa tài nguyên.
- **Endpoints:** Tên endpoints phải là danh từ số nhiều (ví dụ: `GET /users`, `POST /products`).
- **Status Codes:** Sử dụng đúng HTTP status codes:
    - `200 OK`, `201 Created`, `204 No Content`
    - `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`
    - `500 Internal Server Error`
