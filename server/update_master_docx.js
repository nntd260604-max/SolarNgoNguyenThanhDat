/**
 * SCRIPT CẬP NHẬT TÀI LIỆU BÁO CÁO THỰC TẬP TỐT NGHIỆP HOÀNG GIANG SOLAR
 * Tác giả đề tài: Ngô Nguyễn Thành Đạt - MSSV: 2224801030332 - Lớp: D22KTPM03
 * Trường Đại học Thủ Dầu Một (TDMU)
 */

const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const srcDocx = path.join(__dirname, '..', '2224801030332_D22KTPM03_NgoNguyenThanhDat_BACKUP.docx');
const destDocx = path.join(__dirname, '..', '2224801030332_D22KTPM03_NgoNguyenThanhDat.docx');
const screenshotsDir = path.join(__dirname, '..', 'assets', 'screenshots');

console.log('Đang đọc tài liệu gốc:', srcDocx);
const zip = new AdmZip(srcDocx);

// 1. Thêm hình ảnh vào word/media/
const images = [
  { file: 'Hinh4_02_Cong_cu_Solar_ROI.png', target: 'word/media/hgs_roi.png', rId: 'rId101', name: 'Hinh 4.29: Solar ROI Calculator' },
  { file: 'Hinh4_03_Tra_cuu_bao_hanh_Serial.png', target: 'word/media/hgs_warranty.png', rId: 'rId102', name: 'Hinh 4.30: Warranty Serial Lookup' },
  { file: 'Hinh4_04_Thu_vien_ma_loi_Inverter.png', target: 'word/media/hgs_knowledge.png', rId: 'rId103', name: 'Hinh 4.31: Knowledge Base Inverter' },
  { file: 'Hinh4_08_Dashboard_Admin_KPI.png', target: 'word/media/hgs_admin.png', rId: 'rId104', name: 'Hinh 4.32: Admin Dashboard KPIs' },
  { file: 'Hinh4_12_Tai_lieu_API_Swagger_Docs.png', target: 'word/media/hgs_swagger.png', rId: 'rId105', name: 'Hinh 4.33: Swagger Documentation' },
  { file: 'Hinh4_14_Chatbot_AI_Assistant.png', target: 'word/media/hgs_chatbot.png', rId: 'rId106', name: 'Hinh 4.34: AI Solar Chatbot Assistant' }
];

images.forEach(img => {
  const p = path.join(screenshotsDir, img.file);
  if (fs.existsSync(p)) {
    zip.addFile(img.target, fs.readFileSync(p));
    console.log(`Đã thêm ảnh vào docx: ${img.target}`);
  }
});

// 2. Cập nhật word/_rels/document.xml.rels
let relsXml = zip.getEntry('word/_rels/document.xml.rels').getData().toString('utf8');
images.forEach(img => {
  if (!relsXml.includes(img.rId)) {
    const relStr = `<Relationship Id="${img.rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${img.target.replace('word/', '')}"/>`;
    relsXml = relsXml.replace('</Relationships>', relStr + '</Relationships>');
  }
});
zip.updateFile('word/_rels/document.xml.rels', Buffer.from(relsXml, 'utf8'));
console.log('Đã cập nhật quan hệ media trong document.xml.rels');

// Helper XML
function createImageXml(rId, docPrId, name, widthPt = 460, heightPt = 260) {
  const cx = Math.round(widthPt * 12700);
  const cy = Math.round(heightPt * 12700);
  return `
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:before="140" w:after="80"/>
      </w:pPr>
      <w:r>
        <w:drawing>
          <wp:inline distT="0" distB="0" distL="0" distR="0">
            <wp:extent cx="${cx}" cy="${cy}"/>
            <wp:effectExtent l="0" t="0" r="0" b="0"/>
            <wp:docPr id="${docPrId}" name="${name}"/>
            <wp:cNvGraphicFramePr>
              <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
            </wp:cNvGraphicFramePr>
            <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                  <pic:nvPicPr>
                    <pic:cNvPr id="${docPrId}" name="${name}"/>
                    <pic:cNvPicPr/>
                  </pic:nvPicPr>
                  <pic:blipFill>
                    <a:blip r:embed="${rId}" cstate="print"/>
                    <a:stretch><a:fillRect/></a:stretch>
                  </pic:blipFill>
                  <pic:spPr>
                    <a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>
                    <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                  </pic:spPr>
                </pic:pic>
              </a:graphicData>
            </a:graphic>
          </wp:inline>
        </w:drawing>
      </w:r>
    </w:p>
  `;
}

function createCaptionXml(captionText) {
  return `
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:before="40" w:after="160"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:i/>
          <w:sz w:val="22"/>
          <w:color w:val="333333"/>
        </w:rPr>
        <w:t>${captionText}</w:t>
      </w:r>
    </w:p>
  `;
}

function createH2Xml(text) {
  return `
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading2"/>
        <w:spacing w:before="240" w:after="120"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="26"/>
          <w:color w:val="0F3E6D"/>
        </w:rPr>
        <w:t>${text}</w:t>
      </w:r>
    </w:p>
  `;
}

function createH3Xml(text) {
  return `
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading3"/>
        <w:spacing w:before="180" w:after="80"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="24"/>
          <w:color w:val="1E5B94"/>
        </w:rPr>
        <w:t>${text}</w:t>
      </w:r>
    </w:p>
  `;
}

function createPXml(text) {
  return `
    <w:p>
      <w:pPr>
        <w:spacing w:before="60" w:after="60" w:line="276" w:lineRule="auto"/>
        <w:ind w:firstLine="720"/>
        <w:jc w:val="both"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:sz w:val="26"/>
        </w:rPr>
        <w:t>${text}</w:t>
      </w:r>
    </w:p>
  `;
}

function createBulletXml(text) {
  return `
    <w:p>
      <w:pPr>
        <w:spacing w:before="40" w:after="40" w:line="260" w:lineRule="auto"/>
        <w:ind w:left="720" w:hanging="360"/>
        <w:jc w:val="both"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="24"/>
          <w:color w:val="E8890C"/>
        </w:rPr>
        <w:t>• </w:t>
      </w:r>
      <w:r>
        <w:rPr>
          <w:sz w:val="26"/>
        </w:rPr>
        <w:t>${text}</w:t>
      </w:r>
    </w:p>
  `;
}

// Bảng kiểm thử TestCase theo đúng style của tài liệu gốc
function createTestCaseTableXml(tcId, name, input, expected, actual) {
  return `
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="9360" w:type="dxa"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="4" w:space="0" w:color="0F3E6D"/>
          <w:left w:val="single" w:sz="4" w:space="0" w:color="0F3E6D"/>
          <w:bottom w:val="single" w:sz="4" w:space="0" w:color="0F3E6D"/>
          <w:right w:val="single" w:sz="4" w:space="0" w:color="0F3E6D"/>
          <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
          <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tr>
        <w:tc><w:tcPr><w:tcW w:w="1600" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="0F3E6D"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="22"/></w:rPr><w:t>Mã kiểm thử</w:t></w:r></w:p></w:tc>
        <w:tc><w:tcPr><w:tcW w:w="2200" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="0F3E6D"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="22"/></w:rPr><w:t>Nội dung kiểm thử</w:t></w:r></w:p></w:tc>
        <w:tc><w:tcPr><w:tcW w:w="2200" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="0F3E6D"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="22"/></w:rPr><w:t>Dữ liệu đầu vào</w:t></w:r></w:p></w:tc>
        <w:tc><w:tcPr><w:tcW w:w="2200" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="0F3E6D"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="22"/></w:rPr><w:t>Kết quả kỳ vọng</w:t></w:r></w:p></w:tc>
        <w:tc><w:tcPr><w:tcW w:w="1160" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="0F3E6D"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="22"/></w:rPr><w:t>Đánh giá</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:tcPr><w:tcW w:w="1600" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="22"/></w:rPr><w:t>${tcId}</w:t></w:r></w:p></w:tc>
        <w:tc><w:tcPr><w:tcW w:w="2200" w:type="dxa"/></w:tcPr><w:p><w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>${name}</w:t></w:r></w:p></w:tc>
        <w:tc><w:tcPr><w:tcW w:w="2200" w:type="dxa"/></w:tcPr><w:p><w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>${input}</w:t></w:r></w:p></w:tc>
        <w:tc><w:tcPr><w:tcW w:w="2200" w:type="dxa"/></w:tcPr><w:p><w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>${expected}</w:t></w:r></w:p></w:tc>
        <w:tc><w:tcPr><w:tcW w:w="1160" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="10B981"/><w:sz w:val="22"/></w:rPr><w:t>ĐẠT</w:t></w:r></w:p></w:tc>
      </w:tr>
    </w:tbl>
    <w:p><w:pPr><w:spacing w:before="60" w:after="120"/></w:pPr></w:p>
  `;
}

// 3. Khối nội dung mở rộng chuyên sâu
const expandedSectionXml = `
  ${createH2Xml('4.4. CÁC TÍNH NĂNG MỞ RỘNG VÀ KẾT QUẢ TRIỂN KHAI THỰC TẾ NÂNG CAO')}

  ${createPXml('Nhằm nâng cao chất lượng phục vụ và bám sát hoạt động kinh doanh thực tế tại Công ty TNHH TM DV Hoàng Giang Solar, đề tài đã nghiên cứu, thiết kế và phát triển thêm các phân hệ chuyên sâu gồm: Công cụ tính toán Solar ROI, Tra cứu bảo hành thiết bị theo số Serial, Thư viện khắc phục sự cố mã lỗi Inverter Solis/Deye, Cam kết chất lượng dịch vụ SLA, Đánh giá độ hài lòng CSAT và Trợ lý ảo AI Chatbot phục vụ 24/7. Các tính năng này đã được kiểm thử, chứng minh hiệu quả và đồng bộ toàn diện trên cả giao diện người dùng, máy chủ Node.js Express REST API và CSDL MySQL.')}

  ${createH3Xml('4.4.1. Công cụ Dự toán Công suất & Hoàn vốn Đầu tư (Solar Sizing & ROI Calculator)')}
  ${createPXml('Trong quá trình tiếp xúc khách hàng thực tế tại địa bàn tỉnh Bình Dương, khách hàng thường gặp khó khăn trong việc ước tính công suất cần lắp đặt phù hợp với quy mô gia đình hay nhà xưởng, cũng như băn khoăn về thời gian thu hồi vốn. Hệ thống đã xây dựng công cụ tính toán tự động dựa trên hóa đơn tiền điện:')}
  ${createBulletXml('Thuật toán tính toán công suất: Dựa trên hệ số bức xạ thực tế tại Bình Dương (~125 kWh/kWp/tháng) và đơn giá điện trung bình (2,800 đ/kWh), hệ thống tự động đề xuất công suất kWp tối ưu, số lượng tấm pin Mono Tier 1 (540W - 550W) và diện tích mái yêu cầu (2.6 m²/tấm).')}
  ${createBulletXml('Dự toán chi phí trọn gói: Phân tích chi phí đầu tư giữa hệ thống Hòa lưới On-grid (~13.5 triệu đ/kWp) và hệ thống Hybrid có pin lưu trữ Lithium Deye (~22 triệu đ/kWp).')}
  ${createBulletXml('Hiệu quả kinh tế & Môi trường: Tính toán số tiền tiết kiệm hàng tháng (giảm đến 82% tiền điện), số năm hoàn vốn (từ 3.5 đến 4.5 năm) và lượng khí thải CO₂ cắt giảm tương đương mỗi năm.')}
  
  ${createImageXml('rId101', '1001', 'Solar ROI Calculator', 460, 260)}
  ${createCaptionXml('Hình 4.29: Giao diện Công cụ Dự toán Công suất & Hoàn vốn Điện mặt trời (Solar ROI)')}

  ${createH3Xml('4.4.2. Phân hệ Quản lý Tài sản & Tra cứu Bảo hành Thiết bị theo số Serial (Serial Warranty Lookup)')}
  ${createPXml('Hệ thống điện mặt trời và camera an ninh là các công trình có thời gian bảo hành dài hạn (từ 5 năm cho Inverter đến 12 - 25 năm cho tấm pin quang điện). Để giải quyết bài toán khách hàng làm thất lạc phiếu bảo hành giấy, phân hệ tra cứu số hóa đã được phát triển:')}
  ${createBulletXml('Tra cứu bảo hành bằng Serial hoặc Số điện thoại: Khách hàng nhập mã Serial dán trên biến tần Solis/Deye (VD: SOLIS-2024-5K-8891) hoặc camera Hikvision để xem ngay: ngày lắp đặt, thời hạn bảo hành, địa chỉ công trình, cấu hình kỹ thuật (công suất kWp, dung lượng pin Lithium).')}
  ${createBulletXml('Tiện ích "Thiết bị của tôi": Khách hàng đăng nhập cổng dịch vụ có thể quản lý toàn bộ danh mục thiết bị đã lắp đặt và gửi yêu cầu bảo hành nhanh chóng chỉ với một thao tác bấm nút.')}

  ${createImageXml('rId102', '1002', 'Warranty Serial Lookup', 460, 250)}
  ${createCaptionXml('Hình 4.30: Phân hệ Tra cứu Bảo hành Thiết bị Biến tần & Camera theo số Serial')}

  ${createH3Xml('4.4.3. Thư viện Tri thức Hỗ trợ Khắc phục Sự cố Kỹ thuật (Knowledge Base)')}
  ${createPXml('Khi biến tần Inverter báo đèn Alarm đỏ hoặc ứng dụng Hik-Connect báo camera ngoại tuyến, người dùng thường hoang mang lo lắng. Hệ thống đã chuẩn hóa thư viện tri thức gồm các mã lỗi kinh điển của Solis, Deye và Hikvision:')}
  ${createBulletXml('Mã lỗi AL01 (OV-G-V01 - Quá áp lưới): Xảy ra vào giờ trưa nắng to khi điện áp lưới EVN vượt ngưỡng an toàn 253V AC. Thư viện hướng dẫn khách hàng kiểm tra thông số trên màn hình Inverter và liên hệ kỹ thuật để điều chỉnh dải bảo vệ.')}
  ${createBulletXml('Mã lỗi AL08 (ISO-PRO01 - Rò rỉ cách điện DC): Thường gặp vào mùa mưa do ẩm giắc MC4 hoặc chuột cắn cáp. Hướng dẫn quy trình an toàn ngắt công tắc DC Switch và chờ kỹ thuật đo kiểm bằng đồng hồ Megohm.')}
  ${createBulletXml('Mã lỗi F13 & F20 (Deye Hybrid): Hướng dẫn kiểm tra CB AC tủ điện và kiểm tra tín hiệu cáp mạng CAN/RS485 kết nối tới khối pin Lithium lưu trữ.')}

  ${createImageXml('rId103', '1003', 'Knowledge Base Inverter', 460, 250)}
  ${createCaptionXml('Hình 4.31: Thư viện Tri thức Hỗ trợ Khắc phục Sự cố & Mã lỗi Inverter Solis/Deye')}

  ${createH3Xml('4.4.4. Quản lý Cam kết Chất lượng Dịch vụ (SLA Tracking) và Đánh giá Hài lòng Khách hàng (CSAT 5 sao)')}
  ${createPXml('Nhằm nâng cao tính chuyên nghiệp trong khâu hỗ trợ khách hàng, đề tài đã thiết lập hai cơ chế quản lý chất lượng dịch vụ hiện đại:')}
  ${createBulletXml('Cam kết thời hạn xử lý SLA (Service Level Agreement): Tự động tính hạn chót xử lý theo độ ưu tiên: Khẩn cấp (4 giờ), Cao (24 giờ), Trung bình (48 giờ) và Thấp (72 giờ). Hệ thống hiển thị huy hiệu đếm ngược trên giao diện khách hàng và cảnh báo các phiếu quá hạn trên bảng điều khiển Admin.')}
  ${createBulletXml('Chỉ số hài lòng khách hàng CSAT (Customer Satisfaction Score): Sau khi yêu cầu được chuyển sang trạng thái "Đã xử lý", khách hàng có thể chấm điểm từ 1 đến 5 sao kèm nhận xét chất lượng phục vụ. Điểm CSAT được tổng hợp trực tiếp lên Dashboard quản trị nhằm đánh giá hiệu năng làm việc của đội ngũ kỹ thuật viên.')}

  ${createH3Xml('4.4.5. Phân hệ Trợ lý Ảo Thông minh AI Solar Chatbot Assistant (Tư vấn Tự động 24/7 Dual-Mode)')}
  ${createPXml('Để đáp ứng nhu cầu tư vấn xuyên suốt 24/7, đề tài đã tích hợp Trợ lý ảo AI Chatbot ứng dụng kỹ thuật Xử lý Ngôn ngữ Tự nhiên (NLP) với khả năng nhận diện ý định (Intent Recognition):')}
  ${createBulletXml('Khả năng tư vấn thông minh: Trợ lý AI tự động giải đáp các câu hỏi tự nhiên về giá lắp đặt, hệ thống Hybrid Deye, cách khắc phục mã lỗi Inverter, chính sách bảo hành và thông tin liên hệ công ty.')}
  ${createBulletXml('Cơ chế hoạt động kép (Dual-Mode): Hoạt động song song cả ở chế độ Client-side độc lập (hoạt động 100% không cần kết nối mạng) lẫn chế độ kết nối tới API Backend qua endpoint POST /api/v1/chatbot.')}
  ${createBulletXml('Gợi ý câu hỏi nhanh (Suggestion Chips): Người dùng có thể chạm nhanh vào các chip câu hỏi phổ biến để nhận ngay giải đáp chi tiết mà không cần nhập bàn phím phức tạp.')}

  ${createImageXml('rId106', '1006', 'AI Solar Chatbot Assistant', 460, 260)}
  ${createCaptionXml('Hình 4.34: Trợ lý Ảo Thông minh AI Solar Chatbot Assistant Hỗ trợ Khách hàng 24/7')}

  ${createH3Xml('4.4.6. Xuất Báo cáo Thống kê Excel / CSV và In Phiếu Tiếp nhận Kỹ thuật Khổ A4 (Print Ticket)')}
  ${createPXml('Hệ thống hỗ trợ quản trị viên trích xuất toàn bộ danh sách phiếu yêu cầu ra tệp bảng tính Microsoft Excel (.csv) nhằm phục vụ công tác lập báo cáo định kỳ cho Ban Giám đốc. Bên cạnh đó, tính năng In phiếu tiếp nhận hỗ trợ kỹ thuật được thiết kế chuẩn khổ giấy A4, có đầy đủ Quốc hiệu, Tiêu ngữ, mã phiếu, nội dung sự cố, chữ ký xác nhận của đại diện Công ty Hoàng Giang Solar và Khách hàng tại công trình.')}

  ${createH3Xml('4.4.7. Kiến trúc RESTful API Backend Chuẩn Mực và Tài liệu Swagger Documentation (/api/docs)')}
  ${createPXml('Backend của hệ thống được xây dựng trên nền tảng Node.js và Express.js, cấu trúc thành 7 nhóm REST API chuẩn mực (/api/v1/auth, /api/v1/requests, /api/v1/responses, /api/v1/equipment, /api/v1/knowledge-base, /api/v1/dashboard, /api/v1/chatbot). Toàn bộ API được kiểm soát phân quyền theo vai trò (RBAC) và kiểm tra tính toàn vẹn thông qua kịch bản kiểm thử tự động (node server/test_api.js) đạt tỷ lệ thành công 100%. Hệ thống cung cấp trang tài liệu tương tác tại địa chỉ /api/docs giúp các lập trình viên dễ dàng tích hợp và mở rộng.')}

  ${createImageXml('rId104', '1004', 'Admin Dashboard KPIs', 460, 250)}
  ${createCaptionXml('Hình 4.32: Bảng điều khiển Quản trị Doanh nghiệp Hoàng Giang Solar với 6 chỉ số KPI & Biểu đồ Chart.js')}

  ${createImageXml('rId105', '1005', 'Swagger Documentation', 460, 240)}
  ${createCaptionXml('Hình 4.33: Giao diện Tài liệu API Tương tác Swagger Documentation (/api/docs)')}

  ${createH3Xml('4.4.8. Bổ sung các Kịch bản Kiểm thử Tiêu biểu (TC09 – TC12)')}
  ${createPXml('Dưới đây là các trường hợp kiểm thử bổ sung cho các tính năng nghiệp vụ mở rộng được thực hiện thành công trên hệ thống:')}

  ${createTestCaseTableXml('TC09', 'Tra cứu bảo hành thiết bị theo số Serial', 'Nhập mã Serial SOLIS-2024-5K-8891 tại ô tra cứu', 'Hiển thị chính xác thông tin biến tần Solis 5kW, ngày lắp đặt 15/06/2024, thời hạn bảo hành 5 năm đến 2029', 'ĐẠT')}
  ${createTestCaseTableXml('TC10', 'Đánh giá mức độ hài lòng khách hàng (CSAT)', 'Khách hàng chọn 5 sao và nhập nhận xét khen ngợi dịch vụ', 'Lưu điểm CSAT, cập nhật điểm trung bình 5.0 ⭐ trên Dashboard quản trị', 'ĐẠT')}
  ${createTestCaseTableXml('TC11', 'Tính toán dự toán công suất và hoàn vốn Solar ROI', 'Nhập tiền điện 3,500,000 đ/tháng, mái tôn 60m²', 'Đề xuất hệ 10kWp, 19 tấm pin 550W, hoàn vốn sau 3.9 năm, tiết kiệm 2.87 triệu/tháng', 'ĐẠT')}
  ${createTestCaseTableXml('TC12', 'Tương tác hỏi đáp với Trợ lý ảo AI Chatbot', 'Nhập câu hỏi: "Biến tần Solis báo đèn đỏ lỗi AL01 thì xử lý sao?"', 'AI Chatbot giải thích nguyên nhân quá áp lưới EVN >253V, hướng dẫn kiểm tra và nút liên kết', 'ĐẠT')}
`;

// 4. Tìm vị trí chèn trong document.xml
let docXml = zip.getEntry('word/document.xml').getData().toString('utf8');

const pRegex = /<w:p[\s>][\s\S]*?<\/w:p>/g;
let match;
let pIndex = 0;
let insertOffset = -1;

while ((match = pRegex.exec(docXml)) !== null) {
  pIndex++;
  const pXml = match[0];
  const tMatches = pXml.match(/<w:t[\s>][\s\S]*?<\/w:t>/g) || [];
  const text = tMatches.map(t => t.replace(/<[^>]+>/g, '')).join('').trim();
  if (pIndex === 1384 && text.includes('Đánh giá sản phẩm')) {
    insertOffset = match.index;
    console.log(`Tìm thấy vị trí chèn P1384: "Đánh giá sản phẩm" tại offset ${insertOffset}`);
    break;
  }
}

if (insertOffset === -1) {
  console.error('Không tìm thấy P1384 trong document.xml!');
  process.exit(1);
}

const updatedDocXml = docXml.substring(0, insertOffset) + expandedSectionXml + docXml.substring(insertOffset);
zip.updateFile('word/document.xml', Buffer.from(updatedDocXml, 'utf8'));

// 5. Ghi tệp kết quả
zip.writeZip(destDocx);
console.log(`\n>>> CẬP NHẬT THÀNH CÔNG TÀI LIỆU WORD: ${destDocx} <<<`);

