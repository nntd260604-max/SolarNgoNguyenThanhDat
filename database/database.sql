-- =============================================================================
-- CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ HOÀNG GIANG SOLAR
-- ĐỀ TÀI THỰC TẬP TỐT NGHIỆP: XÂY DỰNG HỆ THỐNG HỖ TRỢ TIẾP NHẬN & QUẢN LÝ YÊU CẦU KHÁCH HÀNG
-- Sinh viên: Ngô Nguyễn Thành Đạt - MSSV: 2224801030332 - Lớp: D22KTPM03
-- Giảng viên hướng dẫn: Lê Minh Tiến | Cán bộ hướng dẫn: Võ Hoàng Nhật
-- Cơ sở dữ liệu: MySQL 8.0 InnoDB (Hỗ trợ ACID Transaction & Foreign Keys)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `hoang_giang_solar_db`
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `hoang_giang_solar_db`;

-- -----------------------------------------------------------------------------
-- 1. BẢNG USERS: Quản lý người dùng, định danh và phân quyền (RBAC)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `response_logs`;
DROP TABLE IF EXISTS `support_requests`;
DROP TABLE IF EXISTS `installed_equipment`;
DROP TABLE IF EXISTS `knowledge_base`;
DROP TABLE IF EXISTS `suppliers`;
DROP TABLE IF EXISTS `service_categories`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
    `user_id` INT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(100) NOT NULL COMMENT 'Họ và tên người dùng',
    `phone` VARCHAR(15) NOT NULL UNIQUE COMMENT 'Số điện thoại liên hệ chính',
    `email` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Địa chỉ email đăng nhập',
    `password_hash` VARCHAR(255) NOT NULL COMMENT 'Mật khẩu đã băm bằng bcrypt',
    `role` ENUM('ADMIN', 'SUPPORT', 'CLIENT') NOT NULL DEFAULT 'CLIENT' COMMENT 'Vai trò người dùng',
    `status` ENUM('ACTIVE', 'LOCKED') NOT NULL DEFAULT 'ACTIVE' COMMENT 'Trạng thái tài khoản',
    `address` VARCHAR(255) DEFAULT NULL COMMENT 'Địa chỉ công trình/nhà ở',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_users_phone` (`phone`),
    INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. BẢNG SERVICE_CATEGORIES: Danh mục nhóm dịch vụ điện mặt trời & camera
-- -----------------------------------------------------------------------------
CREATE TABLE `service_categories` (
    `category_id` INT AUTO_INCREMENT PRIMARY KEY,
    `category_code` VARCHAR(30) NOT NULL UNIQUE COMMENT 'Mã danh mục viết tắt',
    `category_name` VARCHAR(150) NOT NULL COMMENT 'Tên nhóm dịch vụ',
    `description` TEXT DEFAULT NULL COMMENT 'Mô tả chi tiết nhóm dịch vụ',
    `icon` VARCHAR(50) DEFAULT 'fa-solar-panel' COMMENT 'Tên icon FontAwesome đại diện',
    `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1: Hoạt động, 0: Tạm ngưng',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. BẢNG SUPPLIERS: Đối tác & Nhà cung cấp thiết bị kỹ thuật
-- -----------------------------------------------------------------------------
CREATE TABLE `suppliers` (
    `supplier_id` INT AUTO_INCREMENT PRIMARY KEY,
    `supplier_name` VARCHAR(150) NOT NULL COMMENT 'Tên nhà cung cấp / đối tác',
    `contact_name` VARCHAR(100) DEFAULT NULL COMMENT 'Người đại diện liên hệ',
    `phone` VARCHAR(20) DEFAULT NULL,
    `email` VARCHAR(100) DEFAULT NULL,
    `address` VARCHAR(255) DEFAULT NULL,
    `product_type` VARCHAR(100) DEFAULT 'Solar Equipment',
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. BẢNG INSTALLED_EQUIPMENT: Hồ sơ thiết bị đã lắp đặt & Tra cứu bảo hành
-- -----------------------------------------------------------------------------
CREATE TABLE `installed_equipment` (
    `equipment_id` INT AUTO_INCREMENT PRIMARY KEY,
    `serial_number` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Số Serial nhà sản xuất (Solis, Deye, Hikvision)',
    `device_name` VARCHAR(150) NOT NULL COMMENT 'Tên thiết bị (VD: Inverter Solis 5kW, Pin Deye 5.12kWh)',
    `user_id` INT NOT NULL COMMENT 'Khóa ngoại khách hàng sở hữu',
    `customer_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(15) NOT NULL,
    `installed_date` DATE NOT NULL COMMENT 'Ngày bàn giao nghiệm thu',
    `warranty_years` INT NOT NULL DEFAULT 5 COMMENT 'Số năm bảo hành cam kết',
    `warranty_expires` DATE NOT NULL COMMENT 'Hạn bảo hành',
    `status` ENUM('ACTIVE', 'EXPIRED', 'MAINTENANCE') NOT NULL DEFAULT 'ACTIVE',
    `capacity_kwp` VARCHAR(50) DEFAULT NULL,
    `panels_info` VARCHAR(255) DEFAULT NULL,
    `battery_info` VARCHAR(255) DEFAULT NULL,
    `address` VARCHAR(255) DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_equip_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
    INDEX `idx_equip_serial` (`serial_number`),
    INDEX `idx_equip_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. BẢNG KNOWLEDGE_BASE: Thư viện tra cứu mã lỗi Inverter & Camera
-- -----------------------------------------------------------------------------
CREATE TABLE `knowledge_base` (
    `kb_id` INT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(30) NOT NULL UNIQUE COMMENT 'Mã lỗi (AL01, AL08, F13, F20...)',
    `brand` VARCHAR(50) NOT NULL COMMENT 'Hãng sản xuất (Solis, Deye, Hikvision)',
    `title` VARCHAR(200) NOT NULL COMMENT 'Tên lỗi kỹ thuật',
    `cause` TEXT NOT NULL COMMENT 'Nguyên nhân kỹ thuật',
    `solution` TEXT NOT NULL COMMENT 'Quy trình xử lý an toàn',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. BẢNG SUPPORT_REQUESTS: Phiếu tiếp nhận yêu cầu hỗ trợ khách hàng
-- -----------------------------------------------------------------------------
CREATE TABLE `support_requests` (
    `request_id` INT AUTO_INCREMENT PRIMARY KEY,
    `request_code` VARCHAR(30) NOT NULL UNIQUE COMMENT 'Mã tham chiếu yêu cầu duy nhất, VD: HGS-2026-001',
    `user_id` INT NOT NULL COMMENT 'Khóa ngoại liên kết người dùng tạo yêu cầu',
    `category_id` INT NOT NULL COMMENT 'Khóa ngoại liên kết nhóm dịch vụ',
    `customer_name` VARCHAR(100) NOT NULL COMMENT 'Họ tên người liên hệ',
    `phone` VARCHAR(15) NOT NULL COMMENT 'Số điện thoại nhận hỗ trợ',
    `email` VARCHAR(100) DEFAULT NULL COMMENT 'Email liên hệ',
    `address` VARCHAR(255) DEFAULT NULL COMMENT 'Địa điểm lắp đặt công trình',
    `title` VARCHAR(200) NOT NULL COMMENT 'Tiêu đề tóm tắt yêu cầu',
    `content` TEXT NOT NULL COMMENT 'Nội dung mô tả sự cố hoặc nhu cầu tư vấn',
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM' COMMENT 'Mức độ ưu tiên',
    `status` ENUM('PENDING', 'PROCESSING', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'PENDING' COMMENT 'Trạng thái xử lý',
    `attachment_url` VARCHAR(255) DEFAULT NULL COMMENT 'Đường dẫn ảnh/tệp đính kèm mô tả lỗi',
    `assigned_to` INT DEFAULT NULL COMMENT 'Mã nhân viên phụ trách xử lý',
    `assigned_technician_name` VARCHAR(100) DEFAULT NULL COMMENT 'Tên kỹ sư được phân công',
    `sla_deadline` DATETIME DEFAULT NULL COMMENT 'Thời hạn cam kết xử lý theo SLA',
    `rating_score` TINYINT DEFAULT NULL COMMENT 'Đánh giá mức độ hài lòng khách hàng (1-5 sao CSAT)',
    `rating_comment` TEXT DEFAULT NULL COMMENT 'Nhận xét của khách hàng',
    `rated_at` DATETIME DEFAULT NULL COMMENT 'Thời điểm khách hàng gửi đánh giá',
    `is_deleted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0: Hoạt động, 1: Đã xóa mềm',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_requests_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_requests_category` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`category_id`),
    CONSTRAINT `fk_requests_assigned` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
    INDEX `idx_requests_phone` (`phone`),
    INDEX `idx_requests_status` (`status`),
    INDEX `idx_requests_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. BẢNG RESPONSE_LOGS: Nhật ký phản hồi và lịch sử tương tác (ACID Transaction)
-- -----------------------------------------------------------------------------
CREATE TABLE `response_logs` (
    `response_id` INT AUTO_INCREMENT PRIMARY KEY,
    `request_id` INT NOT NULL COMMENT 'Khóa ngoại liên kết phiếu yêu cầu',
    `responder_id` INT NOT NULL COMMENT 'Khóa ngoại liên kết tài khoản phản hồi (Admin/Support/Client)',
    `response_content` TEXT NOT NULL COMMENT 'Nội dung phản hồi giải đáp / hướng dẫn kỹ thuật',
    `previous_status` ENUM('PENDING', 'PROCESSING', 'RESOLVED', 'CLOSED') DEFAULT NULL COMMENT 'Trạng thái trước khi phản hồi',
    `new_status` ENUM('PENDING', 'PROCESSING', 'RESOLVED', 'CLOSED') DEFAULT NULL COMMENT 'Trạng thái mới sau khi phản hồi',
    `is_internal_note` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1: Ghi chú nội bộ kỹ thuật, 0: Gửi cho khách hàng',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_logs_request` FOREIGN KEY (`request_id`) REFERENCES `support_requests` (`request_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_logs_responder` FOREIGN KEY (`responder_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT,
    INDEX `idx_logs_request` (`request_id`),
    INDEX `idx_logs_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- DỮ LIỆU KHỞI TẠO (SEED DATA)
-- =============================================================================

INSERT INTO `users` (`user_id`, `full_name`, `phone`, `email`, `password_hash`, `role`, `status`, `address`) VALUES
(1, 'Võ Hoàng Nhật', '0913704141', 'admin@hoanggiangsolar.vn', '$2a$10$wT0XkHhL1qJ1xR9k8Yp1be8nS2b4c1uB0mHqW5jK8uE7pI8yN6Aee', 'ADMIN', 'ACTIVE', '762 Quốc lộ 13, Thới Hòa, Bến Cát, Bình Dương'),
(2, 'Ngô Nguyễn Thành Đạt', '0918765432', 'support@hoanggiangsolar.vn', '$2a$10$wT0XkHhL1qJ1xR9k8Yp1be8nS2b4c1uB0mHqW5jK8uE7pI8yN6Aee', 'SUPPORT', 'ACTIVE', 'Thủ Dầu Một, Bình Dương'),
(3, 'Nguyễn Văn An', '0908123456', 'nguyenvanan@gmail.com', '$2a$10$wT0XkHhL1qJ1xR9k8Yp1be8nS2b4c1uB0mHqW5jK8uE7pI8yN6Aee', 'CLIENT', 'ACTIVE', 'Phường Thới Hòa, Bến Cát, Bình Dương'),
(4, 'Trần Thị Bích', '0937888999', 'tranthibich@gmail.com', '$2a$10$wT0XkHhL1qJ1xR9k8Yp1be8nS2b4c1uB0mHqW5jK8uE7pI8yN6Aee', 'CLIENT', 'ACTIVE', 'Khu dân cư Mỹ Phước 3, Bến Cát, Bình Dương');

INSERT INTO `service_categories` (`category_id`, `category_code`, `category_name`, `description`, `icon`, `is_active`) VALUES
(1, 'TU_VAN_KHAO_SAT', 'Tư vấn giải pháp & Khảo sát công trình', 'Khảo sát diện tích mái, hướng nắng, tư vấn công suất lắp đặt hệ thống điện mặt trời gia đình và doanh nghiệp.', 'fa-compass-drafting', 1),
(2, 'BAO_GIA_LAP_DAT', 'Báo giá lắp đặt trọn gói hệ thống điện mặt trời', 'Cung cấp phương án chi phí hệ thống hòa lưới (On-grid), Hybrid có lưu trữ và Độc lập (Off-grid).', 'fa-file-invoice-dollar', 1),
(3, 'BAO_DUONG_VE_SINH', 'Bảo dưỡng định kỳ & Vệ sinh tấm pin', 'Vệ sinh bề mặt tấm pin chuyên dụng, kiểm tra đo điện áp dây dẫn, siết ốc dàn khung giá đỡ.', 'fa-broom', 1),
(4, 'SUA_CHUA_INVERTER', 'Sửa chữa sự cố kỹ thuật & Biến tần Inverter', 'Khắc phục lỗi mất kết nối Wi-Fi Inverter Solis, Deye, báo lỗi rò điện, ngắt cầu dao CB tủ điện.', 'fa-screwdriver-wrench', 1),
(5, 'CAMERA_AN_NINH', 'Thiết bị Camera giám sát an ninh & Thông minh', 'Lắp đặt camera Hikvision, cấu hình xem qua điện thoại từ xa, khắc phục lỗi đầu ghi ổ cứng.', 'fa-video', 1),
(6, 'GOP_Y_BAO_HANH', 'Khiếu nại bảo hành & Góp ý chất lượng dịch vụ', 'Tiếp nhận phản ánh chất lượng phục vụ, yêu cầu bảo hành thiết bị theo hợp đồng cam kết.', 'fa-comments', 1);

INSERT INTO `installed_equipment` (`equipment_id`, `serial_number`, `device_name`, `user_id`, `customer_name`, `phone`, `installed_date`, `warranty_years`, `warranty_expires`, `status`, `capacity_kwp`, `panels_info`, `address`) VALUES
(1, 'SOLIS-2024-5K-8891', 'Biến tần hòa lưới Solis 5kW 1 Pha', 3, 'Nguyễn Văn An', '0908123456', '2024-06-15', 5, '2029-06-15', 'ACTIVE', '5.4 kWp', '10 tấm Longi 540W', 'Phường Thới Hòa, Bến Cát, Bình Dương'),
(2, 'DEYE-HYB-10K-4420', 'Biến tần Hybrid Deye 10kW kèm 2 Pin Lithium', 4, 'Trần Thị Bích', '0937888999', '2025-04-20', 5, '2030-04-20', 'ACTIVE', '11.0 kWp', '20 tấm Jinko 550W', 'Khu dân cư Mỹ Phước 3, Bến Cát, Bình Dương');

INSERT INTO `knowledge_base` (`kb_id`, `code`, `brand`, `title`, `cause`, `solution`) VALUES
('1', 'AL01', 'Solis Inverter', 'Grid Overvoltage (Quá áp lưới điện)', 'Điện áp lưới điện EVN vượt quá ngưỡng an toàn (>253V)', 'Kiểm tra điện áp hiển thị trên Inverter, kiểm tra tiết diện dây AC hoặc liên hệ kỹ thuật để chỉnh thông số.'),
('2', 'AL08', 'Solis Inverter', 'DC Insulation Fault (Lỗi cách điện DC)', 'Rò rỉ dòng điện DC từ tấm pin xuống đất do mưa ẩm', 'Tắt DC switch, dùng đồng hồ Megohm kiểm tra cách điện chuỗi pin.'),
('3', 'F13', 'Deye Hybrid', 'Grid Absent (Mất điện lưới)', 'Cúp điện lưới quốc gia hoặc nhảy cầu dao CB AC', 'Kiểm tra CB AC tủ điện, hệ thống tự cấp điện EPS cho tải ưu tiên.'),
('4', 'F20', 'Deye Hybrid', 'BMS Comm Fault (Lỗi giao tiếp pin Lithium)', 'Mất kết nối cáp CAN giữa Inverter và Pin Lithium', 'Kiểm tra cáp mạng RJ45 cổng CAN và gạt mã Switch trên pin.');

INSERT INTO `support_requests` (`request_id`, `request_code`, `user_id`, `category_id`, `customer_name`, `phone`, `email`, `address`, `title`, `content`, `priority`, `status`, `attachment_url`, `assigned_to`, `assigned_technician_name`, `sla_deadline`, `rating_score`, `rating_comment`, `created_at`) VALUES
(1, 'HGS-2026-001', 3, 4, 'Nguyễn Văn An', '0908123456', 'nguyenvanan@gmail.com', 'Phường Thới Hòa, Bến Cát, Bình Dương', 'Inverter Solis 5kW báo đèn đỏ và mất kết nối Wi-Fi', 'Chào công ty, hệ thống hòa lưới 5kW lắp tháng 6/2024 của tôi sáng nay thấy biến tần Solis chớp đèn Alarm màu đỏ.', 'HIGH', 'RESOLVED', 'assets/images/solar_fields.jpeg', 1, 'Võ Hoàng Nhật', '2026-10-16 08:30:00', 5, 'Kỹ thuật viên Võ Hoàng Nhật xử lý rất nhanh, 5 sao!', '2026-10-15 08:30:00'),
(2, 'HGS-2026-002', 4, 2, 'Trần Thị Bích', '0937888999', 'tranthibich@gmail.com', 'Khu dân cư Mỹ Phước 3, Bến Cát, Bình Dương', 'Cần tư vấn báo giá hệ Hybrid 10kW có pin lưu trữ', 'Gia đình tôi tiền điện mỗi tháng khoảng 3.5 triệu, muốn lắp hệ thống Hybrid Deye có lưu trữ.', 'MEDIUM', 'RESOLVED', NULL, 2, 'Ngô Nguyễn Thành Đạt', '2026-10-20 10:15:00', 5, 'Tư vấn nhiệt tình, bảng tính công suất chi tiết.', '2026-10-18 10:15:00');

INSERT INTO `response_logs` (`response_id`, `request_id`, `responder_id`, `response_content`, `previous_status`, `new_status`, `is_internal_note`, `created_at`) VALUES
(1, 1, 1, 'Chào anh An, Kỹ thuật viên đã kiểm tra và xử lý bấm lại đầu cos MC4 và cài lại mạng Wi-Fi lúc 11h30. Hiện hệ thống đã phát điện bình thường 4.8kW.', 'PENDING', 'RESOLVED', 0, '2026-10-15 11:45:00'),
(2, 2, 2, 'Kính chào chị Bích, Phòng Kinh doanh đã gửi dự toán hệ thống Hybrid 10kW Deye qua email tranthibich@gmail.com. Chị kiểm tra hòm thư nhé ạ.', 'PENDING', 'RESOLVED', 0, '2026-10-18 14:30:00');
