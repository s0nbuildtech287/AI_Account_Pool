# AI Account Pool Manager

AI Account Pool Manager là một ứng dụng web Single Page Application (SPA) viết bằng React (Vite) nhỏ gọn, tối giản và tiện lợi giúp quản lý và theo dõi trạng thái sử dụng của các tài khoản AI (như Cursor, ChatGPT, Claude, Gemini, Windsurf, v0, Lovable, Bolt, v.v.). Ứng dụng chạy hoàn toàn ở phía client (trình duyệt) và lưu trữ dữ liệu cục bộ.

---

## 🚀 Tính năng chính

- Quản lý trạng thái tài khoản: Theo dõi danh sách tài khoản dưới 3 trạng thái chính:
  - ✅ Ready: Sẵn sàng để sử dụng ngay.
  - ⏳ Đang chờ (Cooling): Đang trong thời gian chờ hồi chiêu (cooldown) kèm bộ đếm ngược thời gian thực.
  - ❌ Hết hạn (Expired): Đã hết hạn hoặc hết giới hạn sử dụng.
- Tự động đếm ngược: Hỗ trợ cấu hình thời gian cooldown (theo giờ, ngày, tuần) và tự động đếm ngược về trạng thái hết hạn hoặc sẵn sàng.
- Bộ lọc & Chế độ xem thông minh:
  - Lọc tài khoản nhanh theo Trạng thái (Tất cả, Ready, Đang chờ, Hết hạn).
  - Lọc tài khoản theo Platform cụ thể bằng thanh cuộn ngang tiện lợi.
  - Chuyển đổi giữa 2 chế độ hiển thị: Dạng lưới phẳng (Flat Grid) hoặc Gom nhóm theo Platform (Grouped View).
- Nhập/Xuất dữ liệu dễ dàng:
  - Hỗ trợ Import/Export dữ liệu dưới dạng JSON để sao lưu hoặc đồng bộ giữa các thiết bị.
  - Có chế độ Merge (chỉ thêm mới, bỏ qua trùng lặp) hoặc Replace (ghi đè toàn bộ dữ liệu hiện tại).
- Giao diện tối ưu và hiện đại:
  - Hỗ trợ chế độ Sáng/Tối (Light/Dark mode) tự động lưu lại cấu hình qua `localStorage`.
  - Tự động lấy logo của platform thông qua Google Favicon API nếu không khai báo logo tùy chỉnh.
  - Favicon động được sinh tự động bằng HTML5 Canvas từ logo chính của dự án.
  - Phím tắt tiện lợi: Nhấn phím `Esc` để đóng nhanh các hộp thoại (modal).

---

## 📁 Cấu trúc thư mục

```text
AI_Account_Pool/
├── logo/
│   └── logo-removebg-preview.png     # Logo chính của ứng dụng
├── src/
│   ├── App.jsx                       # Hợp phần React chính điều khiển toàn bộ logic ứng dụng
│   ├── index.css                     # Thiết kế giao diện (CSS) của dự án
│   └── main.jsx                      # Entrypoint khởi tạo React
├── index.html                        # HTML template của dự án
├── package.json                      # Cấu hình dependency
└── README.md                         # Tài liệu hướng dẫn sử dụng (file này)
```

---

## 🛠️ Công nghệ sử dụng

- React & Vite: Thư viện giao diện người dùng và công cụ xây dựng hiện đại, nhanh chóng.
- HTML5 & CSS3: Sử dụng CSS variables hỗ trợ chế độ Light/Dark, layout Responsive (Grid/Flexbox) hiển thị tốt trên cả máy tính và điện thoại di động.
- Tabler Icons: Bộ icon hiện đại, sắc nét tích hợp trực tiếp qua CDN.
- Google Fonts (Inter): Font chữ hiện đại, tối ưu cho giao diện quản trị.
- HTML5 Canvas: Tự động cắt ảnh logo và tạo favicon động cho trang web.

---

## 💻 Hướng dẫn chạy ứng dụng

Để cài đặt và chạy ứng dụng cục bộ:

1. Mở terminal tại thư mục dự án và chạy:
   ```bash
   npm install
   ```
2. Khởi chạy server phát triển cục bộ:
   ```bash
   npm run dev
   ```
3. Truy cập vào địa chỉ local hiển thị trên terminal (thường là `http://localhost:5173`).

---

## 📝 Lưu ý về dữ liệu

- Toàn bộ thông tin tài khoản được lưu trong bộ nhớ trình duyệt của bạn thông qua `localStorage` (key: `aip_v3`).
- Dữ liệu sẽ bị xóa nếu bạn xóa dữ liệu trang web hoặc dọn dẹp cache trình duyệt.
- Khuyến nghị thường xuyên sử dụng tính năng Export để tải về bản sao lưu dữ liệu dưới dạng file `.json` nhằm phòng tránh việc mất mát thông tin.

---

## 🤝 Góp ý & Phát triển

Dự án được tối ưu hóa cho mục đích cá nhân để quản lý nhanh các tài khoản làm việc hàng ngày. Mọi đóng góp hoặc ý tưởng cải tiến xin vui lòng cập nhật trực tiếp tại mã nguồn.
