/**
 * Data Storage & Repository Module (Dual Data Engine)
 * LocalStorage + REST API Sync Support
 * Hoàng Giang Solar - Support Request Intake & Management
 * Author: Ngô Nguyễn Thành Đạt - D22KTPM03
 */

const STORAGE_KEYS = {
  USERS: 'hgs_users',
  CATEGORIES: 'hgs_categories',
  REQUESTS: 'hgs_requests',
  RESPONSE_LOGS: 'hgs_response_logs',
  SUPPLIERS: 'hgs_suppliers',
  EQUIPMENT: 'hgs_installed_equipment',
  KNOWLEDGE_BASE: 'hgs_knowledge_base',
  TECHNICIANS: 'hgs_technicians',
  CURRENT_USER: 'hgs_current_user',
  TOKEN: 'hgs_auth_token',
  RBAC_VERSION: 'hgs_rbac_separated_v2'
};

// Initial Seed Data matching report
const DEFAULT_SEED_DATA = {
  users: [
    {
      user_id: 1,
      full_name: 'Võ Hoàng Nhật',
      phone: '0913704141',
      email: 'admin@hoanggiangsolar.vn',
      password: 'admin123',
      role: 'ADMIN',
      status: 'ACTIVE',
      address: '762 Quốc lộ 13, Thới Hòa, Bến Cát, Bình Dương',
      created_at: '2026-08-15 08:00:00'
    },
    {
      user_id: 2,
      full_name: 'Ngô Nguyễn Thành Đạt',
      phone: '0918765432',
      email: 'support@hoanggiangsolar.vn',
      password: 'support123',
      role: 'SUPPORT',
      status: 'ACTIVE',
      address: 'Khu dân cư Phú Hòa, Thủ Dầu Một, Bình Dương',
      created_at: '2026-08-17 08:30:00'
    },
    {
      user_id: 3,
      full_name: 'Nguyễn Văn An',
      phone: '0908123456',
      email: 'nguyenvanan@gmail.com',
      password: '123456',
      role: 'CLIENT',
      status: 'ACTIVE',
      address: 'Phường Thới Hòa, Bến Cát, Bình Dương',
      created_at: '2026-09-01 09:00:00'
    },
    {
      user_id: 4,
      full_name: 'Trần Thị Bích',
      phone: '0937888999',
      email: 'tranthibich@gmail.com',
      password: '123456',
      role: 'CLIENT',
      status: 'ACTIVE',
      address: 'Khu dân cư Mỹ Phước 3, Bến Cát, Bình Dương',
      created_at: '2026-09-05 14:15:00'
    },
    {
      user_id: 5,
      full_name: 'Lê Hoàng Minh',
      phone: '0988654321',
      email: 'lehoangminh@gmail.com',
      password: '123456',
      role: 'CLIENT',
      status: 'ACTIVE',
      address: 'KCN Tân Bình, TP. Hồ Chí Minh',
      created_at: '2026-09-12 11:20:00'
    }
  ],

  categories: [
    {
      category_id: 1,
      category_code: 'TU_VAN_KHAO_SAT',
      category_name: 'Tư vấn giải pháp & Khảo sát công trình',
      description: 'Khảo sát diện tích mái, góc nghiêng đón nắng, tư vấn công suất lắp đặt hệ thống điện mặt trời gia đình và công nghiệp.',
      icon: 'fa-compass-drafting',
      is_active: 1
    },
    {
      category_id: 2,
      category_code: 'BAO_GIA_LAP_DAT',
      category_name: 'Báo giá lắp đặt hệ thống điện mặt trời',
      description: 'Lập dự toán chi phí trọn gói hệ thống hòa lưới (On-grid), Hybrid lưu trữ và Độc lập (Off-grid) theo nhu cầu sử dụng.',
      icon: 'fa-file-invoice-dollar',
      is_active: 1
    },
    {
      category_id: 3,
      category_code: 'BAO_DUONG_VE_SINH',
      category_name: 'Bảo dưỡng định kỳ & Vệ sinh tấm pin',
      description: 'Làm sạch bề mặt kính quang điện bằng máy xoay chuyên dụng, đo kiểm suy hao công suất, siết chặt khung nhôm giá đỡ.',
      icon: 'fa-broom',
      is_active: 1
    },
    {
      category_id: 4,
      category_code: 'SUA_CHUA_INVERTER',
      category_name: 'Sửa chữa sự cố kỹ thuật & Biến tần Inverter',
      description: 'Xử lý lỗi biến tần Solis, Deye báo đèn Alarm, mất kết nối Wi-Fi giám sát, ngắt CB tủ điện, lỗi cách điện DC.',
      icon: 'fa-screwdriver-wrench',
      is_active: 1
    },
    {
      category_id: 5,
      category_code: 'CAMERA_AN_NINH',
      category_name: 'Hệ thống Camera an ninh & Giám sát',
      description: 'Lắp đặt camera Hikvision chính hãng, cấu hình xem trực tiếp qua Cloud, sửa lỗi không ghi hình hoặc mất tín hiệu.',
      icon: 'fa-video',
      is_active: 1
    },
    {
      category_id: 6,
      category_code: 'GOP_Y_BAO_HANH',
      category_name: 'Khiếu nại bảo hành & Góp ý dịch vụ',
      description: 'Tiếp nhận phản hồi về chất lượng dịch vụ, khiếu nại thời hạn bảo hành thiết bị theo hợp đồng cam kết.',
      icon: 'fa-comments',
      is_active: 1
    }
  ],

  suppliers: [
    {
      supplier_id: 1,
      supplier_name: 'Solis Vietnam - Ginlong Technologies',
      contact_name: 'Kỹ thuật hỗ trợ Solis',
      phone: '1800 6868',
      email: 'service@ginlong.com',
      address: 'Khu công nghệ cao TP.HCM',
      product_type: 'Biến tần hòa lưới & Hybrid Solis',
      status: 'ACTIVE'
    },
    {
      supplier_id: 2,
      supplier_name: 'Deye ESS Technology Co.',
      contact_name: 'Phân phối Deye Miền Nam',
      phone: '0909 333 444',
      email: 'contact@deye.com.vn',
      address: 'Quận 7, TP. Hồ Chí Minh',
      product_type: 'Inverter Hybrid & Pin Lithium Deye',
      status: 'ACTIVE'
    },
    {
      supplier_id: 3,
      supplier_name: 'Hikvision Digital Technology Co.',
      contact_name: 'Trung tâm bảo hành Hikvision',
      phone: '1900 2828',
      email: 'support@hikvision.vn',
      address: 'Bình Thạnh, TP. Hồ Chí Minh',
      product_type: 'Camera giám sát & Đầu ghi DVR/NVR',
      status: 'ACTIVE'
    }
  ],

  // 1. Quản lý thiết bị đã lắp đặt & Tra cứu bảo hành (Serial Warranty Assets)
  installed_equipment: [
    {
      equipment_id: 1,
      serial_number: 'SOLIS-2024-5K-8891',
      device_name: 'Biến tần hòa lưới Solis 5kW 1 Pha (Solis-1P5K-4G)',
      customer_name: 'Nguyễn Văn An',
      phone: '0908123456',
      installed_date: '2024-06-15',
      warranty_years: 5,
      warranty_expires: '2029-06-15',
      status: 'ACTIVE',
      capacity_kwp: '5.4 kWp',
      panels_info: '10 tấm Longi Hi-MO 5 540W',
      address: 'Phường Thới Hòa, Bến Cát, Bình Dương'
    },
    {
      equipment_id: 2,
      serial_number: 'DEYE-HYB-10K-4420',
      device_name: 'Biến tần Hybrid Deye 10kW 3 Pha (SUN-10K-SG04LP3)',
      customer_name: 'Trần Thị Bích',
      phone: '0937888999',
      installed_date: '2025-04-20',
      warranty_years: 5,
      warranty_expires: '2030-04-20',
      status: 'ACTIVE',
      capacity_kwp: '11.0 kWp',
      panels_info: '20 tấm Jinko Tiger Pro 550W',
      battery_info: '2 Pack Pin Lithium Deye 5.12kWh (10.24kWh)',
      address: 'Khu dân cư Mỹ Phước 3, Bến Cát, Bình Dương'
    },
    {
      equipment_id: 3,
      serial_number: 'LONGI-40P-2024-9901',
      device_name: 'Dàn 40 tấm Pin Quang Điện Longi Solar 550W Nhà Xưởng',
      customer_name: 'Lê Hoàng Minh',
      phone: '0988654321',
      installed_date: '2024-01-10',
      warranty_years: 12,
      warranty_expires: '2036-01-10',
      status: 'ACTIVE',
      capacity_kwp: '22.0 kWp',
      panels_info: '40 tấm Longi 550W Tier 1',
      address: 'KCN Tân Bình, TP. Hồ Chí Minh'
    },
    {
      equipment_id: 4,
      serial_number: 'HIK-NVR-4K-7712',
      device_name: 'Bộ Đầu ghi & 4 Camera Hikvision ColorVu 4K Ban Đêm Có Màu',
      customer_name: 'Nguyễn Văn An',
      phone: '0908123456',
      installed_date: '2024-08-12',
      warranty_years: 2,
      warranty_expires: '2026-08-12',
      status: 'ACTIVE',
      panels_info: 'Đầu ghi 4 kênh + HDD 2TB chuyên dụng',
      address: 'Phường Thới Hòa, Bến Cát, Bình Dương'
    }
  ],

  // 2. Thư viện mã lỗi Inverter Solis/Deye & Camera Hikvision (Knowledge Base)
  knowledge_base: [
    {
      code: 'AL01',
      brand: 'Solis Inverter',
      title: 'OV-G-V01 (Grid Overvoltage - Quá áp lưới điện)',
      cause: 'Điện áp lưới điện EVN tại khu vực vượt quá giới hạn an toàn (>253V AC) do giờ cao điểm bức xạ mặt trời.',
      solution: '1. Kiểm tra màn hình Inverter hiển thị điện áp lưới hiện tại là bao nhiêu Volt.\n2. Kiểm tra tiết diện dây dẫn AC từ Inverter về tủ điện chính (nếu dây quá nhỏ sẽ gây sụt/tăng áp).\n3. Liên hệ Kỹ thuật Hoàng Giang Solar để điều chỉnh mở rộng dải điện áp hòa lưới trên Inverter hoặc báo Điện lực EVN.'
    },
    {
      code: 'AL08',
      brand: 'Solis Inverter',
      title: 'ISO-PRO01 (DC Insulation Fault - Lỗi cách điện DC)',
      cause: 'Rò rỉ dòng điện một chiều DC từ dàn pin mặt trời xuống đất, thường gặp vào mùa mưa khi đầu nối MC4 bị ẩm hoặc dây cáp bị chuột cắn.',
      solution: '1. Không chạm tay trần vào dây dẫn DC hoặc dàn khung nhôm.\n2. Tắt công tắc DC Switch bên hông Inverter.\n3. Kỹ thuật viên sẽ dùng đồng hồ Megohm kiểm tra độ cách điện từng chuỗi pin (String) để bọc lại vị trí rò rỉ.'
    },
    {
      code: 'F13',
      brand: 'Deye Hybrid',
      title: 'Grid Absent (Mất điện lưới hoặc đứt CB AC)',
      cause: 'Lưới điện quốc gia bị cắt điện hoặc cầu dao CB AC cấp nguồn cho Inverter bị ngắt.',
      solution: '1. Kiểm tra xem khu vực xung quanh có bị cúp điện không.\n2. Kiểm tra CB AC trong tủ điện Solar xem có bị nhảy không.\n3. Nếu gia đình có lắp Pin lưu trữ Lithium Deye, Inverter sẽ tự động chuyển mạch cấp điện cho tải ưu tiên (EPS) trong 10ms.'
    },
    {
      code: 'F20',
      brand: 'Deye Hybrid',
      title: 'BMS Communication Fault (Lỗi giao tiếp Pin Lithium)',
      cause: 'Mất tín hiệu kết nối CAN/RS485 giữa Inverter Deye và bộ xử lý BMS của ắc quy lưu trữ.',
      solution: '1. Kiểm tra giắc cắm cáp mạng RJ45 giữa cổng CAN trên Inverter và cổng CAN trên Pin Deye.\n2. Kiểm tra gạt mã Switch địa chỉ (Dip-switch) trên pin lưu trữ.\n3. Khởi động lại Pin Lithium trước, sau đó bật Inverter sau.'
    },
    {
      code: 'CAM-OFF',
      brand: 'Hikvision Camera',
      title: 'Thiết bị báo Ngoại tuyến (Device Offline)',
      cause: 'Router Wi-Fi nhà khách hàng bị đổi mật khẩu, đứt dây mạng LAN hoặc nguồn adapter camera bị lỏng.',
      solution: '1. Kiểm tra đèn nguồn trên camera có sáng không.\n2. Khởi động lại modem Wi-Fi nhà bạn.\n3. Rút nguồn camera 15 giây rồi cắm lại. Mở ứng dụng Hik-Connect để quét lại mã QR.'
    }
  ],

  // 3. Nhân sự Tư vấn & Kỹ thuật trực tiếp xử lý yêu cầu (Tách biệt với Admin điều phối)
  technicians: [
    { tech_id: 2, name: 'Ngô Nguyễn Thành Đạt', role: 'Nhân viên Tư vấn & Hỗ trợ KH', phone: '0918765432', specialty: 'Tư vấn giải pháp, Báo giá, Hỗ trợ kỹ thuật từ xa' },
    { tech_id: 3, name: 'Trần Quốc Tuấn', role: 'Kỹ thuật viên Sửa chữa Inverter', phone: '0977222333', specialty: 'Xử lý lỗi biến tần Solis/Deye, Sửa mạch điện' },
    { tech_id: 4, name: 'Lê Văn Dũng', role: 'Kỹ thuật viên Bảo trì & Camera', phone: '0966444555', specialty: 'Vệ sinh tấm pin, Lắp đặt camera Hikvision' }
  ],

  requests: [
    {
      request_id: 1,
      request_code: 'HGS-2026-001',
      user_id: 3,
      category_id: 4,
      customer_name: 'Nguyễn Văn An',
      phone: '0908123456',
      email: 'nguyenvanan@gmail.com',
      address: 'Phường Thới Hòa, Bến Cát, Bình Dương',
      title: 'Inverter Solis 5kW báo đèn đỏ và mất kết nối Wi-Fi',
      content: 'Chào công ty, hệ thống hòa lưới 5kW lắp tháng 6/2024 của tôi sáng nay thấy biến tần Solis chớp đèn Alarm màu đỏ, ứng dụng trên điện thoại báo Offline không ghi nhận sản lượng điện sinh ra. Nhờ kỹ thuật hỗ trợ kiểm tra gấp giúp gia đình.',
      priority: 'HIGH',
      status: 'RESOLVED',
      attachment_url: 'assets/images/solar_fields.jpeg',
      assigned_to: 2,
      assigned_technician_name: 'Ngô Nguyễn Thành Đạt',
      sla_deadline: '2026-10-16 08:30:00',
      sla_status: 'IN_SLA',
      rating_score: 5,
      rating_comment: 'Nhân viên hỗ trợ Ngô Nguyễn Thành Đạt tư vấn và hướng dẫn xử lý rất nhanh, bấm lại đầu cos MC4 và chỉnh lại Wi-Fi là máy chạy ngon lành. Đánh giá 5 sao!',
      rated_at: '2026-10-15 12:00:00',
      created_at: '2026-10-15 08:30:00',
      updated_at: '2026-10-15 11:45:00'
    },
    {
      request_id: 2,
      request_code: 'HGS-2026-002',
      user_id: 4,
      category_id: 2,
      customer_name: 'Trần Thị Bích',
      phone: '0937888999',
      email: 'tranthibich@gmail.com',
      address: 'Khu dân cư Mỹ Phước 3, Bến Cát, Bình Dương',
      title: 'Cần tư vấn báo giá hệ Hybrid 10kW có pin lưu trữ',
      content: 'Gia đình tôi tiền điện mỗi tháng khoảng 3.5 triệu, nhà có dùng 4 máy lạnh và tủ đông. Tôi muốn lắp hệ thống Hybrid có ắc quy lưu trữ để ban đêm vẫn xài được điện mặt trời. Xin gửi bảng báo giá chi tiết thiết bị Deye giúp tôi.',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      attachment_url: null,
      assigned_to: 2,
      assigned_technician_name: 'Ngô Nguyễn Thành Đạt',
      sla_deadline: '2026-10-20 10:15:00',
      sla_status: 'IN_SLA',
      rating_score: 5,
      rating_comment: 'Bảng tính công suất và phương án pin Deye rất chi tiết, tư vấn tận tình dễ hiểu.',
      rated_at: '2026-10-18 15:00:00',
      created_at: '2026-10-18 10:15:00',
      updated_at: '2026-10-18 14:30:00'
    },
    {
      request_id: 3,
      request_code: 'HGS-2026-003',
      user_id: 5,
      category_id: 3,
      customer_name: 'Lê Hoàng Minh',
      phone: '0988654321',
      email: 'lehoangminh@gmail.com',
      address: 'KCN Tân Bình, TP. Hồ Chí Minh',
      title: 'Đăng ký vệ sinh định kỳ 40 tấm pin áp mái nhà xưởng',
      content: 'Hệ thống điện mặt trời 20kWp trên mái tôn nhà xưởng sau mùa mưa có nhiều bụi bẩn và lá cây che phủ làm giảm hiệu suất phát điện. Xin đặt lịch vệ sinh tấm pin và đo kiểm dây dẫn an toàn vào cuối tuần này.',
      priority: 'MEDIUM',
      status: 'PROCESSING',
      attachment_url: null,
      assigned_to: 4,
      assigned_technician_name: 'Lê Văn Dũng',
      sla_deadline: '2026-10-24 14:00:00',
      sla_status: 'IN_SLA',
      created_at: '2026-10-22 14:00:00',
      updated_at: '2026-10-22 16:10:00'
    },
    {
      request_id: 4,
      request_code: 'HGS-2026-004',
      user_id: 3,
      category_id: 5,
      customer_name: 'Nguyễn Văn An',
      phone: '0908123456',
      email: 'nguyenvanan@gmail.com',
      address: 'Phường Thới Hòa, Bến Cát, Bình Dương',
      title: 'Camera Hikvision ngoài cổng không tua lại xem được video',
      content: 'Camera giám sát Hikvision nhìn ra cổng từ hôm qua đến nay không xem lại video lịch sử được, ứng dụng Hik-Connect báo thẻ nhớ có lỗi. Nhờ công ty hỗ trợ kỹ thuật kiểm tra từ xa giúp.',
      priority: 'LOW',
      status: 'PENDING',
      attachment_url: null,
      assigned_to: 2,
      assigned_technician_name: 'Ngô Nguyễn Thành Đạt',
      sla_deadline: '2026-10-28 09:20:00',
      sla_status: 'IN_SLA',
      created_at: '2026-10-25 09:20:00',
      updated_at: '2026-10-25 09:20:00'
    },
    {
      request_id: 5,
      request_code: 'HGS-2026-005',
      user_id: 4,
      category_id: 1,
      customer_name: 'Trần Thị Bích',
      phone: '0937888999',
      email: 'tranthibich@gmail.com',
      address: 'Khu dân cư Mỹ Phước 3, Bến Cát, Bình Dương',
      title: 'Khảo sát diện tích mái tôn chuẩn bị lắp điện mặt trời',
      content: 'Nhà tôi mái tôn diện tích khoảng 60m2 hướng Nam, muốn nhờ kỹ sư Hoàng Giang Solar qua đo đạc thực tế và tư vấn số lượng tấm pin có thể lắp tối đa trong tuần tới.',
      priority: 'MEDIUM',
      status: 'PENDING',
      attachment_url: null,
      assigned_to: null,
      assigned_technician_name: null,
      sla_deadline: '2026-10-28 16:45:00',
      sla_status: 'IN_SLA',
      created_at: '2026-10-26 16:45:00',
      updated_at: '2026-10-26 16:45:00'
    }
  ],

  response_logs: [
    {
      response_id: 1,
      request_id: 1,
      responder_id: 1,
      responder_name: 'Võ Hoàng Nhật (Admin Điều phối)',
      response_content: '[Lệnh điều phối nội bộ]: Phân công nhân viên Ngô Nguyễn Thành Đạt tiếp nhận và hỗ trợ khách hàng Nguyễn Văn An kiểm tra lỗi đèn Alarm đỏ biến tần Solis 5kW trong hạn SLA 24h.',
      previous_status: 'PENDING',
      new_status: 'PENDING',
      is_internal_note: 1,
      created_at: '2026-10-15 08:45:00'
    },
    {
      response_id: 2,
      request_id: 1,
      responder_id: 2,
      responder_name: 'Ngô Nguyễn Thành Đạt (Nhân viên Tư vấn & Hỗ trợ)',
      response_content: 'Chào anh An, bộ phận Hỗ trợ Hoàng Giang Solar đã gọi điện kiểm tra từ xa. Lỗi đèn Alarm đỏ do lỏng kết nối cáp DC ngõ vào và Wi-Fi router nhà anh đổi mật khẩu. Đã xử lý bấm lại đầu nối MC4 và cài lại mạng Wi-Fi lúc 11h30. Hiện hệ thống đã phát điện bình thường công suất 4.8kW.',
      previous_status: 'PENDING',
      new_status: 'RESOLVED',
      is_internal_note: 0,
      created_at: '2026-10-15 11:45:00'
    },
    {
      response_id: 3,
      request_id: 2,
      responder_id: 2,
      responder_name: 'Ngô Nguyễn Thành Đạt (Nhân viên Tư vấn & Hỗ trợ)',
      response_content: 'Kính chào chị Bích, bộ phận Tư vấn Hoàng Giang Solar đã gửi chi tiết bảng dự toán hệ thống Hybrid 10kW sử dụng Biến tần Deye 10kW 3 pha và 2 pack Pin Lithium Deye 5.12kWh qua email tranthibich@gmail.com. Đã liên hệ Zalo giải thích các hạng mục bảo hành 5 năm cho Inverter và 10 năm cho pin lưu trữ. Chị kiểm tra hòm thư nhé ạ.',
      previous_status: 'PENDING',
      new_status: 'RESOLVED',
      is_internal_note: 0,
      created_at: '2026-10-18 14:30:00'
    },
    {
      response_id: 4,
      request_id: 3,
      responder_id: 4,
      responder_name: 'Lê Văn Dũng (Kỹ thuật viên Bảo trì)',
      response_content: 'Chào anh Minh, đội bảo trì đã tiếp nhận yêu cầu vệ sinh 40 tấm pin nhà xưởng. Đội kỹ thuật thi công đã sắp xếp lịch vào thứ Bảy ngày 28/10 lúc 8h00 sáng mang theo chổi xoay chuyên dụng và máy bơm áp lực thấp an toàn cho tấm pin. Xin cảm ơn anh!',
      previous_status: 'PENDING',
      new_status: 'PROCESSING',
      is_internal_note: 0,
      created_at: '2026-10-22 16:10:00'
    }
  ],

  // Canned Responses (Mẫu phản hồi nhanh) cho quản trị viên
  canned_responses: [
    {
      title: 'Xác nhận tiếp nhận bảo dưỡng pin mặt trời',
      content: 'Chào Quý khách, Hoàng Giang Solar đã tiếp nhận yêu cầu bảo dưỡng định kỳ. Đội ngũ kỹ thuật sẽ liên hệ qua số điện thoại của Quý khách trong vòng 30 phút để chốt lịch vệ sinh cụ thể.'
    },
    {
      title: 'Hướng dẫn xử lý lỗi Inverter Solis/Deye',
      content: 'Kính chào Quý khách, để kiểm tra nhanh sự cố biến tần, xin vui lòng kiểm tra công tắc xoay DC bên hông Inverter đã ở vị trí ON chưa và đèn Alarm có chớp mã lỗi gì không. Kỹ thuật viên của chúng tôi đang kết nối giám sát từ xa để hỗ trợ ngay.'
    },
    {
      title: 'Thông báo gửi báo giá hệ thống điện mặt trời',
      content: 'Kính chào Quý khách, phòng Kinh doanh Hoàng Giang Solar đã hoàn tất bảng tính công suất và báo giá chi tiết kèm bản vẽ mô phỏng 3D. Chúng tôi đã gửi qua email và Zalo của Quý khách.'
    },
    {
      title: 'Hẹn lịch khảo sát mái thực tế',
      content: 'Chào Quý khách, kỹ sư khảo sát thực địa của công ty sẽ có mặt tại địa chỉ công trình theo lịch hẹn để đo đạc diện tích mái, kết cấu xà gồ và hướng bức xạ mặt trời tối ưu nhất.'
    },
    {
      title: 'Hỗ trợ reset camera giám sát Hikvision',
      content: 'Chào Quý khách, Quý khách vui lòng ngắt nguồn camera khoảng 10 giây sau đó cắm lại. Kỹ thuật viên sẽ gọi video hỗ trợ Quý khách thao tác kết nối lại qua ứng dụng Hik-Connect.'
    }
  ]
};

const DataRepository = {
  // Khởi tạo dữ liệu nếu chưa có trong localStorage (hoặc nâng cấp chuẩn phân quyền RBAC v2)
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.RBAC_VERSION)) {
      this.resetData();
      localStorage.setItem(STORAGE_KEYS.RBAC_VERSION, 'true');
      return;
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_SEED_DATA.users));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_SEED_DATA.categories));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(DEFAULT_SEED_DATA.requests));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RESPONSE_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.RESPONSE_LOGS, JSON.stringify(DEFAULT_SEED_DATA.response_logs));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
      localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(DEFAULT_SEED_DATA.suppliers));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EQUIPMENT)) {
      localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(DEFAULT_SEED_DATA.installed_equipment));
    }
    if (!localStorage.getItem(STORAGE_KEYS.KNOWLEDGE_BASE)) {
      localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_BASE, JSON.stringify(DEFAULT_SEED_DATA.knowledge_base));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TECHNICIANS)) {
      localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(DEFAULT_SEED_DATA.technicians));
    }
  },

  // Reset về dữ liệu ban đầu
  resetData() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_SEED_DATA.users));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_SEED_DATA.categories));
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(DEFAULT_SEED_DATA.requests));
    localStorage.setItem(STORAGE_KEYS.RESPONSE_LOGS, JSON.stringify(DEFAULT_SEED_DATA.response_logs));
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(DEFAULT_SEED_DATA.suppliers));
    localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(DEFAULT_SEED_DATA.installed_equipment));
    localStorage.setItem(STORAGE_KEYS.KNOWLEDGE_BASE, JSON.stringify(DEFAULT_SEED_DATA.knowledge_base));
    localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(DEFAULT_SEED_DATA.technicians));
    return true;
  },

  // Danh mục dịch vụ
  getCategories() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES)) || [];
    } catch {
      return DEFAULT_SEED_DATA.categories;
    }
  },

  getCategoryById(id) {
    const cats = this.getCategories();
    return cats.find(c => Number(c.category_id) === Number(id)) || null;
  },

  // Danh sách yêu cầu hỗ trợ (có hỗ trợ filter)
  getRequests(filters = {}) {
    this.init();
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS)) || [];
    } catch {
      list = DEFAULT_SEED_DATA.requests;
    }

    if (filters.userId) {
      list = list.filter(r => Number(r.user_id) === Number(filters.userId));
    }
    if (filters.status && filters.status !== 'ALL') {
      list = list.filter(r => r.status === filters.status);
    }
    if (filters.categoryId && filters.categoryId !== 'ALL') {
      list = list.filter(r => Number(r.category_id) === Number(filters.categoryId));
    }
    if (filters.priority && filters.priority !== 'ALL') {
      list = list.filter(r => r.priority === filters.priority);
    }
    // Phân quyền RBAC: Nhân viên Tư vấn (SUPPORT) chỉ xem phiếu được giao cho mình hoặc phiếu chưa ai nhận
    if (filters.forSupportUser) {
      const staffId = Number(filters.forSupportUser.user_id);
      const staffName = (filters.forSupportUser.full_name || '').trim().toLowerCase();
      list = list.filter(r =>
        !r.assigned_technician_name ||
        Number(r.assigned_to) === staffId ||
        r.assigned_technician_name.toLowerCase() === staffName
      );
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(r => 
        (r.phone && r.phone.toLowerCase().includes(q)) ||
        (r.request_code && r.request_code.toLowerCase().includes(q)) ||
        (r.customer_name && r.customer_name.toLowerCase().includes(q)) ||
        (r.title && r.title.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return list;
  },

  getRequestById(id) {
    const list = this.getRequests();
    return list.find(r => Number(r.request_id) === Number(id)) || null;
  },

  // Thêm mới yêu cầu hỗ trợ (tính toán hạn SLA tự động)
  createRequest(data) {
    this.init();
    const requests = this.getRequests();
    const newId = requests.length > 0 ? Math.max(...requests.map(r => r.request_id)) + 1 : 1;
    const year = new Date().getFullYear();
    const code = `HGS-${year}-${String(newId).padStart(3, '0')}`;

    // Tính toán hạn SLA cam kết dựa trên độ ưu tiên
    const now = new Date();
    const priority = data.priority || 'MEDIUM';
    let slaHours = 48;
    if (priority === 'URGENT') slaHours = 4;
    else if (priority === 'HIGH') slaHours = 24;
    else if (priority === 'LOW') slaHours = 72;

    const deadline = new Date(now.getTime() + slaHours * 3600 * 1000);
    const deadlineStr = deadline.toISOString().replace('T', ' ').substring(0, 19);

    // Yêu cầu mới từ khách hàng mặc định ở trạng thái Chờ Admin điều phối (chưa phân công)
    const assignedId = data.assigned_to ? Number(data.assigned_to) : null;
    const defaultTech = data.assigned_technician_name || null;

    const newReq = {
      request_id: newId,
      request_code: code,
      user_id: Number(data.user_id) || 3,
      category_id: Number(data.category_id) || 1,
      customer_name: data.customer_name || 'Khách hàng',
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      title: data.title || 'Yêu cầu hỗ trợ kỹ thuật',
      content: data.content || '',
      priority: priority,
      status: 'PENDING',
      attachment_url: data.attachment_url || null,
      assigned_to: assignedId,
      assigned_technician_name: defaultTech,
      sla_deadline: deadlineStr,
      sla_status: 'IN_SLA',
      created_at: now.toISOString().replace('T', ' ').substring(0, 19),
      updated_at: now.toISOString().replace('T', ' ').substring(0, 19)
    };

    requests.unshift(newReq);
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    return newReq;
  },

  // NGHIỆP VỤ RIÊNG CỦA ADMIN: Điều phối, phân công nhân sự phụ trách & giao chỉ đạo nội bộ
  dispatchRequestByAdmin(requestId, adminUser, assignedTechName, priority = null, directiveNote = '') {
    this.init();
    if (!adminUser || adminUser.role !== 'ADMIN') {
      throw new Error('Phân quyền RBAC (403 Forbidden): Chỉ Quản trị viên (Admin) mới có quyền điều phối và phân công nhân sự!');
    }

    const requests = this.getRequests();
    const reqIndex = requests.findIndex(r => Number(r.request_id) === Number(requestId));
    if (reqIndex === -1) {
      throw new Error('Không tìm thấy phiếu yêu cầu có ID: ' + requestId);
    }

    const currentReq = requests[reqIndex];
    const techs = this.getTechnicians();
    const foundTech = techs.find(t => t.name === assignedTechName);
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    currentReq.assigned_technician_name = assignedTechName;
    currentReq.assigned_to = foundTech ? foundTech.tech_id : 2;

    if (priority && priority !== currentReq.priority) {
      currentReq.priority = priority;
      let slaHours = 48;
      if (priority === 'URGENT') slaHours = 4;
      else if (priority === 'HIGH') slaHours = 24;
      else if (priority === 'LOW') slaHours = 72;
      const deadline = new Date(Date.now() + slaHours * 3600 * 1000);
      currentReq.sla_deadline = deadline.toISOString().replace('T', ' ').substring(0, 19);
    }
    currentReq.updated_at = nowStr;

    let logs = [];
    try {
      logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESPONSE_LOGS)) || [];
    } catch {
      logs = [];
    }

    const newLogId = logs.length > 0 ? Math.max(...logs.map(l => l.response_id)) + 1 : 1;
    const noteText = directiveNote && directiveNote.trim()
      ? `[Lệnh điều phối từ Admin]: Phân công cho ${assignedTechName}. Chỉ đạo: ${directiveNote.trim()}`
      : `[Lệnh điều phối từ Admin]: Đã phân công phiếu yêu cầu cho nhân viên ${assignedTechName} tiếp nhận và tư vấn khách hàng (Mức ưu tiên: ${currentReq.priority}).`;

    const dispatchLog = {
      response_id: newLogId,
      request_id: Number(requestId),
      responder_id: Number(adminUser.user_id),
      responder_name: `${adminUser.full_name} (Admin Điều phối)`,
      response_content: noteText,
      previous_status: currentReq.status,
      new_status: currentReq.status,
      is_internal_note: 1,
      created_at: nowStr
    };

    logs.push(dispatchLog);
    localStorage.setItem(STORAGE_KEYS.RESPONSE_LOGS, JSON.stringify(logs));
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));

    return { request: currentReq, log: dispatchLog };
  },

  // NGHIỆP VỤ RIÊNG CỦA NHÂN VIÊN TƯ VẤN (SUPPORT) & KHÁCH HÀNG (CLIENT): Phản hồi tư vấn & cập nhật tiến độ
  addResponseWithStatusUpdate(requestId, responderUser, content, newStatus = 'RESOLVED', isInternal = 0) {
    this.init();
    if (responderUser && responderUser.role === 'ADMIN') {
      throw new Error('Phân quyền RBAC (403 Forbidden): Quản trị viên (Admin) chỉ thực hiện điều phối & phân công nhân viên, không trực tiếp phản hồi tư vấn khách hàng!');
    }

    const requests = this.getRequests();
    const reqIndex = requests.findIndex(r => Number(r.request_id) === Number(requestId));
    if (reqIndex === -1) {
      throw new Error('Không tìm thấy yêu cầu hỗ trợ có ID: ' + requestId);
    }

    const currentReq = requests[reqIndex];

    // Kiểm tra nếu là SUPPORT thì chỉ được xử lý phiếu được giao cho mình hoặc phiếu chưa ai nhận
    if (responderUser && responderUser.role === 'SUPPORT') {
      const isAssignedToOther = currentReq.assigned_technician_name &&
        currentReq.assigned_technician_name.toLowerCase() !== responderUser.full_name.toLowerCase() &&
        Number(currentReq.assigned_to) !== Number(responderUser.user_id);
      if (isAssignedToOther) {
        throw new Error(`Phân quyền RBAC: Phiếu này đã được Admin phân công cho "${currentReq.assigned_technician_name}". Bạn không có quyền xử lý chồng chéo!`);
      }
    }

    let logs = [];
    try {
      logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESPONSE_LOGS)) || [];
    } catch {
      logs = [];
    }

    const newLogId = logs.length > 0 ? Math.max(...logs.map(l => l.response_id)) + 1 : 1;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newLog = {
      response_id: newLogId,
      request_id: Number(requestId),
      responder_id: Number(responderUser.user_id),
      responder_name: `${responderUser.full_name} (${responderUser.role === 'SUPPORT' ? 'Nhân viên Tư vấn & Hỗ trợ' : 'Khách hàng'})`,
      response_content: content,
      previous_status: currentReq.status,
      new_status: newStatus,
      is_internal_note: isInternal ? 1 : 0,
      created_at: nowStr
    };

    logs.push(newLog);
    currentReq.status = newStatus;
    currentReq.updated_at = nowStr;

    // Nếu phiếu chưa phân công mà Nhân viên Tư vấn vào trả lời thì tự động ghi nhận người tiếp nhận
    if (responderUser.role === 'SUPPORT' && !currentReq.assigned_technician_name) {
      currentReq.assigned_technician_name = responderUser.full_name;
      currentReq.assigned_to = responderUser.user_id;
    }

    localStorage.setItem(STORAGE_KEYS.RESPONSE_LOGS, JSON.stringify(logs));
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));

    return { request: currentReq, log: newLog };
  },

  // Khách hàng đánh giá chất lượng phục vụ (CSAT ⭐⭐⭐⭐⭐)
  rateRequest(requestId, score, comment) {
    this.init();
    const requests = this.getRequests();
    const req = requests.find(r => Number(r.request_id) === Number(requestId));
    if (!req) throw new Error('Không tìm thấy phiếu yêu cầu.');

    req.rating_score = Number(score);
    req.rating_comment = comment || '';
    req.rated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);

    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    return req;
  },

  // Tra cứu thiết bị & bảo hành theo SĐT hoặc Số Serial
  lookupEquipment(query) {
    this.init();
    let items = [];
    try {
      items = JSON.parse(localStorage.getItem(STORAGE_KEYS.EQUIPMENT)) || [];
    } catch {
      items = DEFAULT_SEED_DATA.installed_equipment;
    }

    if (!query) return items;
    const q = query.trim().toLowerCase();
    return items.filter(e => 
      e.serial_number.toLowerCase().includes(q) ||
      e.phone.toLowerCase().includes(q) ||
      e.customer_name.toLowerCase().includes(q) ||
      e.device_name.toLowerCase().includes(q)
    );
  },

  // Tra cứu mã lỗi kỹ thuật (Knowledge Base)
  lookupKnowledgeBase(query) {
    this.init();
    let kb = [];
    try {
      kb = JSON.parse(localStorage.getItem(STORAGE_KEYS.KNOWLEDGE_BASE)) || [];
    } catch {
      kb = DEFAULT_SEED_DATA.knowledge_base;
    }

    if (!query) return kb;
    const q = query.trim().toLowerCase();
    return kb.filter(item => 
      item.code.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.brand.toLowerCase().includes(q) ||
      item.cause.toLowerCase().includes(q)
    );
  },

  // Danh sách kỹ thuật viên
  getTechnicians() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.TECHNICIANS)) || [];
    } catch {
      return DEFAULT_SEED_DATA.technicians;
    }
  },

  // CÔNG CỤ TÍNH TOÁN CÔNG SUẤT ĐIỆN MẶT TRỜI (Solar Sizing & ROI Calculator)
  calculateSolarROI(monthlyBillVND, roofType = 'MAI_TON', roofAreaM2 = 50) {
    const bill = Number(monthlyBillVND) || 2000000;
    // Giá điện sinh hoạt trung bình bậc thang khoảng 2,800 đ/kWh
    const monthlyKWh = Math.round(bill / 2800);
    // Bức xạ Bình Dương / Miền Nam: 1 kWp phát khoảng 125 kWh/tháng
    const recommendedKWp = Math.max(3, Number((monthlyKWh / 125).toFixed(1)));
    // Mỗi tấm pin 550W (0.55 kWp)
    const panelCount = Math.ceil((recommendedKWp * 1000) / 550);
    // Diện tích cần khoảng 2.6m2/tấm
    const requiredArea = Math.round(panelCount * 2.6);

    // Dự toán chi phí ước tính (Hòa lưới khoảng 13tr/kWp, Hybrid khoảng 22tr/kWp)
    const costOnGrid = Math.round(recommendedKWp * 13500000);
    const costHybrid = Math.round(recommendedKWp * 22000000);

    // Tiết kiệm hàng tháng & hoàn vốn
    const monthlySavings = Math.round(bill * 0.82); // Giảm ~82% tiền điện
    const annualSavings = monthlySavings * 12;
    const paybackYearsOnGrid = Number((costOnGrid / annualSavings).toFixed(1));
    const paybackYearsHybrid = Number((costHybrid / annualSavings).toFixed(1));

    // Giảm phát thải CO2 (1 kWh ~ 0.85 kg CO2)
    const co2SavedKgYear = Math.round(recommendedKWp * 125 * 12 * 0.85);

    return {
      monthlyBill: bill,
      monthlyKWh,
      recommendedKWp,
      panelCount,
      requiredArea,
      costOnGrid,
      costHybrid,
      monthlySavings,
      annualSavings,
      paybackYearsOnGrid,
      paybackYearsHybrid,
      co2SavedKgYear,
      isAreaSufficient: roofAreaM2 >= requiredArea
    };
  },

  // Lấy nhật ký phản hồi của một yêu cầu
  getResponseLogs(requestId) {
    this.init();
    let logs = [];
    try {
      logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESPONSE_LOGS)) || [];
    } catch {
      logs = DEFAULT_SEED_DATA.response_logs;
    }
    if (requestId) {
      logs = logs.filter(l => Number(l.request_id) === Number(requestId));
    }
    logs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return logs;
  },

  updateStatus(requestId, newStatus, actorUser = null) {
    this.init();
    if (actorUser && actorUser.role === 'ADMIN') {
      throw new Error('Phân quyền RBAC: Quản trị viên (Admin) chỉ điều phối nhân sự, không trực tiếp cập nhật trạng thái xử lý nghiệp vụ của nhân viên tư vấn!');
    }
    const requests = this.getRequests();
    const req = requests.find(r => Number(r.request_id) === Number(requestId));
    if (!req) return null;
    if (actorUser && actorUser.role === 'SUPPORT' && !req.assigned_technician_name) {
      req.assigned_technician_name = actorUser.full_name;
      req.assigned_to = actorUser.user_id;
    }
    req.status = newStatus;
    req.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    return req;
  },

  deleteRequest(requestId, actorUser = null) {
    this.init();
    if (actorUser && actorUser.role !== 'ADMIN') {
      throw new Error('Phân quyền RBAC (403 Forbidden): Nhân viên tư vấn không có quyền xóa phiếu yêu cầu! Chỉ Quản trị viên (Admin) mới được phép xóa.');
    }
    let requests = this.getRequests();
    requests = requests.filter(r => Number(r.request_id) !== Number(requestId));
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    return true;
  },

  getUsers() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    } catch {
      return DEFAULT_SEED_DATA.users;
    }
  },

  getCannedResponses() {
    return DEFAULT_SEED_DATA.canned_responses;
  },

  getDashboardStats() {
    const requests = this.getRequests();
    const users = this.getUsers();
    const categories = this.getCategories();
    const equipment = this.lookupEquipment();

    const total = requests.length;
    const pending = requests.filter(r => r.status === 'PENDING').length;
    const processing = requests.filter(r => r.status === 'PROCESSING').length;
    const resolved = requests.filter(r => r.status === 'RESOLVED' || r.status === 'CLOSED').length;
    const clients = users.filter(u => u.role === 'CLIENT').length;

    // Tính điểm đánh giá CSAT trung bình
    const ratedReqs = requests.filter(r => r.rating_score && r.rating_score > 0);
    const avgRating = ratedReqs.length > 0 
      ? (ratedReqs.reduce((sum, r) => sum + r.rating_score, 0) / ratedReqs.length).toFixed(1)
      : '5.0';

    // Đếm số yêu cầu sắp quá hạn SLA
    const now = new Date();
    const overdueCount = requests.filter(r => 
      r.status !== 'RESOLVED' && r.status !== 'CLOSED' && r.sla_deadline && new Date(r.sla_deadline) < now
    ).length;

    const categoryStats = categories.map(c => ({
      name: c.category_name,
      count: requests.filter(r => Number(r.category_id) === Number(c.category_id)).length
    }));

    return {
      total,
      pending,
      processing,
      resolved,
      clients,
      avgRating,
      ratedCount: ratedReqs.length,
      overdueCount,
      equipmentCount: equipment.length,
      categoryStats
    };
  }
};

// Khởi chạy khởi tạo dữ liệu
DataRepository.init();
window.DataRepository = DataRepository;
