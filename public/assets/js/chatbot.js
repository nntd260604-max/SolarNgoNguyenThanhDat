/**
 * AI SOLAR CHATBOT ASSISTANT
 * CÔNG TY TNHH TM DV HOÀNG GIANG SOLAR
 * Trợ lý ảo tư vấn kỹ thuật & chăm sóc khách hàng điện mặt trời
 * Sinh viên thực hiện: Ngô Nguyễn Thành Đạt - MSSV: 2224801030332 - Lớp: D22KTPM03
 */

(function () {
  // Knowledge Base & NLP Engine của AI Chatbot
  const ChatbotEngine = {
    // Thư viện kiến thức chuyên sâu về Hoàng Giang Solar
    intents: [
      {
        id: 'greetings',
        patterns: ['chào', 'hello', 'hi', 'alo', 'bạn là ai', 'giúp', 'xin chào', 'ad', 'admin'],
        reply: `Dạ chào Quý khách! Em là **Trợ lý AI Hoàng Giang Solar** ☀️. 
Em có thể hỗ trợ Quý khách:
- 💡 **Dự toán công suất & hoàn vốn** điện mặt trời theo hóa đơn tiền điện.
- ⚡ **Khắc phục mã lỗi Inverter** Solis (AL01, AL08...) & Deye (F13, F20...).
- 🛡️ **Tra cứu thời hạn bảo hành** thiết bị theo số Serial.
- 🔋 **Tư vấn hệ thống Hybrid** có pin lưu trữ Lithium Deye.
- 📋 **Hướng dẫn gửi phiếu yêu cầu hỗ trợ** kỹ thuật tận nơi.

Quý khách cần em hỗ trợ vấn đề gì ạ?`,
        suggestions: ['💡 Tính tiền điện mặt trời', '⚠️ Biến tần báo lỗi', '🔋 Hệ Hybrid Deye là gì?', '🛡️ Bảo hành bao lâu?', '📞 Hotline công ty']
      },
      {
        id: 'solar_roi',
        patterns: ['tiền điện', 'chi phí', 'giá bao nhiêu', 'báo giá', 'hoàn vốn', 'bao nhiêu tiền', '1kwp', '5kw', '10kw', 'dự toán', 'on-grid', 'hòa lưới'],
        reply: `Dạ, về **chi phí và hiệu quả đầu tư điện mặt trời** tại Bình Dương & Miền Nam:

- **Hệ Hòa lưới (On-grid):** Suất đầu tư khoảng **13.5 triệu VNĐ / 1 kWp**. Phù hợp gia đình dùng nhiều điện ban ngày. Hoàn vốn nhanh trong **3.5 - 4 năm**.
- **Hệ Hybrid lưu trữ (ESS):** Suất đầu tư khoảng **22 triệu VNĐ / 1 kWp** (đã bao gồm Inverter Deye và pin Lithium). Dùng được cả ngày lẫn đêm, cúp điện vẫn có điện.
- **Hiệu suất phát điện:** 1 kWp phát trung bình **125 kWh (số điện)/tháng**.

👉 *Ví dụ: Hóa đơn 3.5 triệu/tháng nên lắp hệ **10 kWp** (khoảng 19 tấm pin 550W, diện tích mái ~50m²).*

<div class="mt-2">
  <a href="#calculator" class="btn btn-sm btn-primary text-white" onclick="document.querySelector('#calculator')?.scrollIntoView({behavior: 'smooth'})">
    <i class="fa-solid fa-calculator me-1"></i>Mở Công Cụ Tính Solar ROI
  </a>
</div>`,
        suggestions: ['🔋 Tư vấn hệ Hybrid Deye', '📋 Hướng dẫn nhận báo giá', '🏠 Diện tích mái cần bao nhiêu?']
      },
      {
        id: 'hybrid_battery',
        patterns: ['hybrid', 'pin lưu trữ', 'ắc quy', 'lithium', 'deye', 'ban đêm', 'cúp điện', 'mất điện', 'lưu trữ'],
        reply: `Dạ, **Hệ thống Điện mặt trời Hybrid** là giải pháp cao cấp nhất hiện nay của Hoàng Giang Solar:

1. **Nguyên lý hoạt động:** Điện mặt trời sinh ra vào ban ngày sẽ cấp cho tải gia đình sử dụng, phần dư thừa nạp vào **Pin Lithium Deye**, ban đêm tự động xả điện ra dùng mà không tốn tiền điện lưới EVN.
2. **Tự động chuyển mạch khi cúp điện (EPS):** Khi lưới điện quốc gia bị cắt, Inverter Deye chuyển sang chế độ dự phòng trong **10 mili-giây** (không làm tắt máy tính, camera hay tủ lạnh).
3. **Tuổi thọ vượt trội:** Pin Lithium Deye đạt trên **6,000 chu kỳ sạc xả** (tương đương 10 - 15 năm sử dụng).

Quý khách có thể gửi yêu cầu để kỹ sư bên em khảo sát và lên phương án chi tiết nhé ạ!`,
        suggestions: ['💡 Dự toán chi phí hệ Hybrid', '📋 Tạo phiếu tư vấn', '📞 Liên hệ kỹ sư']
      },
      {
        id: 'inverter_faults',
        patterns: ['mã lỗi', 'lỗi', 'đèn đỏ', 'alarm', 'chớp đèn', 'al01', 'al08', 'f13', 'f20', 'solis', 'sự cố', 'không phát điện', 'bảo trì'],
        reply: `Dạ, nếu Inverter của Quý khách đang chớp đèn **Alarm đỏ**, dưới đây là các mã lỗi thường gặp:

- ⚠️ **Lỗi AL01 (OV-G-V01):** Quá áp lưới điện EVN (>253V) vào giờ trưa nắng to. *Xử lý: Kiểm tra điện áp lưới trên màn hình Inverter, liên hệ kỹ thuật để chỉnh dải bảo vệ.*
- ⚠️ **Lỗi AL08 (ISO-PRO01):** Lỗi rò rỉ cách điện DC (thường do ẩm giắc nối MC4 hoặc chuột cắn dây). *Xử lý: Gạt công tắc DC Switch bên hông máy về OFF và gọi kỹ thuật.*
- ⚠️ **Lỗi F13 (Deye):** Mất điện lưới hoặc nhảy CB AC tủ điện.
- ⚠️ **Lỗi F20 (Deye):** Lỗi giao tiếp cáp CAN giữa Inverter và Pin Lithium.

<div class="mt-2">
  <a href="#knowledge-base" class="btn btn-sm btn-warning text-dark fw-bold" onclick="document.querySelector('#knowledge-base')?.scrollIntoView({behavior: 'smooth'})">
    <i class="fa-solid fa-book-open me-1"></i>Xem Thư Viện Tra Cứu Mã Lỗi
  </a>
</div>`,
        suggestions: ['⚠️ Lỗi AL01 là gì?', '⚠️ Lỗi AL08 xử lý sao?', '📞 Hotline kỹ thuật khẩn cấp']
      },
      {
        id: 'warranty',
        patterns: ['bảo hành', 'thời hạn', 'bao lâu', 'hợp đồng', 'chính sách', 'serial', 'hư', 'đổi trả'],
        reply: `Dạ, **Chính sách bảo hành chính hãng** của Hoàng Giang Solar cam kết như sau:

- ☀️ **Tấm pin quang điện (Longi / Jinko Tier 1):** Bảo hành vật lý **12 năm**, bảo hành hiệu suất tuyến tính **25 năm** (sau 25 năm hiệu suất vẫn đạt >80%).
- ⚡ **Biến tần Inverter (Solis / Deye):** Bảo hành đổi mới & sửa chữa chính hãng **5 năm**.
- 🔋 **Pin lưu trữ Lithium Deye:** Bảo hành **5 - 10 năm** theo hợp đồng.
- 📷 **Hệ thống Camera Hikvision:** Bảo hành chính hãng **2 năm**.

Quý khách có thể nhập mã Serial hoặc Số điện thoại để tra cứu bảo hành ngay trên trang web:
<div class="mt-2">
  <a href="#warranty-check" class="btn btn-sm btn-success text-white" onclick="document.querySelector('#warranty-check')?.scrollIntoView({behavior: 'smooth'})">
    <i class="fa-solid fa-shield-halved me-1"></i>Tra Cứu Bảo Hành Ngay
  </a>
</div>`,
        suggestions: ['🔍 Tra cứu bảo hành', '📞 Hotline bảo hành: 0913 704 141']
      },
      {
        id: 'camera',
        patterns: ['camera', 'hikvision', 'colorvu', 'ngoại tuyến', 'offline', 'không xem được', 'thẻ nhớ', 'đầu ghi'],
        reply: `Dạ, về hệ thống **Camera giám sát Hikvision ColorVu**:
- Dòng camera có màu ban đêm 24/7 siêu nét, chuẩn kháng nước IP67.
- **Nếu camera báo Ngoại tuyến (Offline):**
  1. Kiểm tra đèn nguồn camera có sáng không.
  2. Khởi động lại modem Wi-Fi nhà Quý khách.
  3. Rút nguồn camera 15 giây rồi cắm lại. Mở app **Hik-Connect** quét lại mã QR.
- Nếu vẫn không kết nối được, Quý khách gửi phiếu để kỹ thuật viên kết nối từ xa hỗ trợ nhé!`,
        suggestions: ['📋 Gửi yêu cầu sửa camera', '📞 Gọi kỹ thuật']
      },
      {
        id: 'request_sla',
        patterns: ['phiếu', 'yêu cầu', 'hỗ trợ', 'tạo phiếu', 'sla', 'bao lâu', 'tiếp nhận', 'thời gian'],
        reply: `Dạ, Quý khách có thể gửi yêu cầu hỗ trợ kỹ thuật trực tiếp tại **Cổng Dịch vụ Khách hàng** với cam kết thời gian SLA:
- 🚨 **Khẩn cấp (Urgent):** Xử lý trong vòng **4 giờ** (chập cháy, mất điện hoàn toàn).
- ⚡ **Ưu tiên Cao (High):** Xử lý trong vòng **24 giờ** (Inverter dừng phát, báo đèn đỏ).
- 🛠️ **Trung bình (Medium):** Xử lý trong vòng **48 giờ** (Báo giá, khảo sát, vệ sinh pin).
- 💬 **Tiêu chuẩn (Low):** Xử lý trong vòng **72 giờ** (Hỏi đáp, bảo trì định kỳ).

<div class="mt-2">
  <a href="index.html" class="btn btn-sm btn-primary text-white">
    <i class="fa-solid fa-paper-plane me-1"></i>Vào Cổng Gửi Phiếu Hỗ Trợ
  </a>
</div>`,
        suggestions: ['📋 Xem danh sách phiếu của tôi', '⭐ Đánh giá CSAT']
      },
      {
        id: 'company_info',
        patterns: ['công ty', 'địa chỉ', 'ở đâu', 'hotline', 'số điện thoại', 'giám đốc', 'võ hoàng nhật', 'thành đạt', 'sinh viên', 'đại học', 'tdmu', 'liên hệ'],
        reply: `Dạ, thông tin chính thức của đơn vị:

- 🏢 **CÔNG TY TNHH TM DV HOÀNG GIANG SOLAR**
- 📍 **Địa chỉ:** 762 Quốc lộ 13, Phường Thới Hòa, TX. Bến Cát, Tỉnh Bình Dương
- 📞 **Hotline / Zalo kỹ thuật:** **0913 704 141** (Hỗ trợ 24/7)
- ✉️ **Email:** cskh@hoanggiangsolar.vn / admin@hoanggiangsolar.vn
- 👨‍💼 **Giám đốc / Cán bộ hướng dẫn:** Kỹ sư **Võ Hoàng Nhật**
- 🎓 **Sinh viên thực hiện đề tài:** **Ngô Nguyễn Thành Đạt** (MSSV: 2224801030332 - Lớp: D22KTPM03 - Trường ĐH Thủ Dầu Một).`,
        suggestions: ['💡 Tính tiền điện mặt trời', '⚠️ Hỗ trợ sự cố kỹ thuật', '🛡️ Tra cứu bảo hành']
      }
    ],

    // Hàm phân tích câu hỏi người dùng
    processMessage(userText) {
      const clean = userText.toLowerCase().trim();
      if (!clean) {
        return {
          reply: 'Quý khách vui lòng nhập câu hỏi cần hỗ trợ ạ!',
          suggestions: ['💡 Tính tiền điện mặt trời', '⚠️ Biến tần báo lỗi', '📞 Thông tin công ty']
        };
      }

      // Tìm intent phù hợp nhất theo trọng số điểm từ khóa
      let bestIntent = null;
      let maxScore = 0;

      for (const intent of this.intents) {
        let score = 0;
        for (const pattern of intent.patterns) {
          if (clean.includes(pattern)) {
            score += pattern.length; // Từ khóa dài hơn có trọng số cao hơn
          }
        }
        if (score > maxScore) {
          maxScore = score;
          bestIntent = intent;
        }
      }

      if (bestIntent && maxScore > 0) {
        return {
          reply: bestIntent.reply,
          suggestions: bestIntent.suggestions
        };
      }

      // Phản hồi mặc định nếu không khớp
      return {
        reply: `Dạ em đã ghi nhận câu hỏi của Quý khách: *" ${userText} "*.

Để được tư vấn chính xác và nhanh chóng nhất, Quý khách có thể:
1. Sử dụng **Công cụ Dự toán Solar ROI** tại trang chủ.
2. Tra cứu mã lỗi Inverter Solis/Deye tại **Thư viện sự cố**.
3. Gọi trực tiếp Hotline kỹ thuật: **0913 704 141** (Kỹ sư Võ Hoàng Nhật hỗ trợ 24/7).
4. Hoặc gửi phiếu yêu cầu hỗ trợ tại Cổng dịch vụ khách hàng.`,
        suggestions: [
          '💡 Tính tiền điện mặt trời',
          '⚠️ Tra cứu mã lỗi Inverter',
          '🔋 Hệ Hybrid Deye là gì?',
          '📞 Hotline: 0913 704 141'
        ]
      };
    }
  };

  // Khởi tạo Giao diện HTML của AI Chatbot
  function injectChatbotUI() {
    if (document.getElementById('ai-solar-chatbot')) return;

    const chatbotHTML = `
      <!-- AI Chatbot Launcher Button -->
      <div id="ai-solar-chatbot" class="ai-chatbot-container">
        <button id="chatbot-launcher-btn" class="chatbot-launcher" aria-label="Mở Trợ lý AI Hoàng Giang Solar" title="Hỏi Trợ lý AI Hoàng Giang Solar">
          <div class="chatbot-launcher-icon">
            <i class="fa-solid fa-robot"></i>
          </div>
          <span class="chatbot-pulse"></span>
          <span class="chatbot-badge">AI Solar ☀️</span>
        </button>

        <!-- Chatbot Window -->
        <div id="chatbot-window" class="chatbot-window d-none">
          <!-- Header -->
          <div class="chatbot-header">
            <div class="d-flex align-items-center gap-2">
              <div class="chatbot-avatar">
                <i class="fa-solid fa-solar-panel"></i>
              </div>
              <div>
                <div class="chatbot-title">Trợ lý AI Hoàng Giang Solar</div>
                <div class="chatbot-status">
                  <span class="status-indicator"></span> Trực tuyến 24/7 • Hỗ trợ kỹ thuật
                </div>
              </div>
            </div>
            <div class="chatbot-controls">
              <button id="chatbot-reset-btn" class="btn-chat-control" title="Làm mới cuộc trò chuyện">
                <i class="fa-solid fa-rotate-right"></i>
              </button>
              <button id="chatbot-close-btn" class="btn-chat-control" title="Đóng cửa sổ">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>

          <!-- Messages Body -->
          <div id="chatbot-messages" class="chatbot-body">
            <!-- Tin nhắn chào mừng ban đầu -->
            <div class="chat-msg bot-msg">
              <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
              <div class="msg-bubble">
                <div class="msg-content">
                  Xin chào Quý khách! 👋 Em là <strong>Trợ lý AI Hoàng Giang Solar</strong>. 
                  Em sẵn sàng giải đáp thắc mắc về điện mặt trời hòa lưới, hệ Hybrid Deye, tra cứu bảo hành và hướng dẫn khắc phục sự cố Inverter.
                </div>
                <div class="msg-time">Vừa xong</div>
              </div>
            </div>

            <!-- Gợi ý câu hỏi nhanh ban đầu -->
            <div id="chatbot-suggestions" class="chatbot-suggestions">
              <div class="suggestion-label"><i class="fa-regular fa-lightbulb me-1"></i>Gợi ý câu hỏi nhanh:</div>
              <div class="suggestion-chips">
                <button class="chip-btn" data-query="Tính tiền điện mặt trời và thời gian hoàn vốn">💡 Tính tiền điện mặt trời</button>
                <button class="chip-btn" data-query="Biến tần Inverter Solis báo đèn đỏ lỗi AL01">⚠️ Inverter báo lỗi AL01</button>
                <button class="chip-btn" data-query="Tư vấn hệ thống Hybrid có pin lưu trữ Deye">🔋 Hệ Hybrid Deye là gì?</button>
                <button class="chip-btn" data-query="Chính sách bảo hành thiết bị bao lâu?">🛡️ Bảo hành bao lâu?</button>
                <button class="chip-btn" data-query="Thông tin liên hệ và địa chỉ Hoàng Giang Solar">📞 Hotline & Địa chỉ công ty</button>
              </div>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div id="chatbot-typing" class="chatbot-typing d-none">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="ms-1 small text-muted">AI đang suy nghĩ...</span>
          </div>

          <!-- Input Footer -->
          <form id="chatbot-form" class="chatbot-footer">
            <div class="input-group">
              <input type="text" id="chatbot-input" class="form-control" placeholder="Nhập câu hỏi (VD: Chi phí hệ 5kW, lỗi AL01...)" autocomplete="off">
              <button class="btn btn-primary" type="submit" id="chatbot-send-btn">
                <i class="fa-solid fa-paper-plane"></i>
              </button>
            </div>
            <div class="chatbot-footnote">
              Đề tài Báo cáo tốt nghiệp: Ngô Nguyễn Thành Đạt (MSSV: 2224801030332)
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    setupChatbotEvents();
  }

  // Gắn sự kiện tương tác
  function setupChatbotEvents() {
    const launcherBtn = document.getElementById('chatbot-launcher-btn');
    const closeBtn = document.getElementById('chatbot-close-btn');
    const resetBtn = document.getElementById('chatbot-reset-btn');
    const chatWindow = document.getElementById('chatbot-window');
    const chatForm = document.getElementById('chatbot-form');
    const chatInput = document.getElementById('chatbot-input');
    const messagesContainer = document.getElementById('chatbot-messages');
    const typingIndicator = document.getElementById('chatbot-typing');

    // Toggle đóng / mở cửa sổ chat
    launcherBtn.addEventListener('click', () => {
      chatWindow.classList.toggle('d-none');
      if (!chatWindow.classList.contains('d-none')) {
        chatInput.focus();
        scrollToBottom();
      }
    });

    closeBtn.addEventListener('click', () => {
      chatWindow.classList.add('d-none');
    });

    // Reset cuộc trò chuyện
    resetBtn.addEventListener('click', () => {
      messagesContainer.innerHTML = `
        <div class="chat-msg bot-msg">
          <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
          <div class="msg-bubble">
            <div class="msg-content">
              Cuộc trò chuyện đã được làm mới. Em có thể giúp gì thêm cho Quý khách về giải pháp điện mặt trời Hoàng Giang Solar ạ?
            </div>
            <div class="msg-time">Vừa xong</div>
          </div>
        </div>
        <div id="chatbot-suggestions" class="chatbot-suggestions">
          <div class="suggestion-chips">
            <button class="chip-btn" data-query="Tính tiền điện mặt trời và thời gian hoàn vốn">💡 Tính tiền điện mặt trời</button>
            <button class="chip-btn" data-query="Biến tần Inverter Solis báo đèn đỏ lỗi AL01">⚠️ Inverter báo lỗi AL01</button>
            <button class="chip-btn" data-query="Tư vấn hệ thống Hybrid có pin lưu trữ Deye">🔋 Hệ Hybrid Deye là gì?</button>
            <button class="chip-btn" data-query="Chính sách bảo hành thiết bị bao lâu?">🛡️ Bảo hành bao lâu?</button>
          </div>
        </div>
      `;
      bindSuggestionChips();
    });

    // Xử lý gửi tin nhắn
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;

      appendUserMessage(text);
      chatInput.value = '';

      // Hiển thị typing và phản hồi
      typingIndicator.classList.remove('d-none');
      scrollToBottom();

      setTimeout(async () => {
        let response = null;

        // Thử gọi backend API nếu có mạng/server, fallback sang client NLP engine
        if (window.location.protocol.startsWith('http')) {
          try {
            const apiRes = await fetch('/api/v1/chatbot', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: text })
            });
            if (apiRes.ok) {
              const resData = await apiRes.json();
              if (resData.success && resData.reply) {
                response = resData;
              }
            }
          } catch {
            // Server offline, tiếp tục dùng local engine
          }
        }

        if (!response) {
          response = ChatbotEngine.processMessage(text);
        }

        typingIndicator.classList.add('d-none');
        appendBotMessage(response.reply, response.suggestions);
        scrollToBottom();
      }, 500);
    });

    // Bắt sự kiện click vào các chip gợi ý
    function bindSuggestionChips() {
      document.querySelectorAll('.chip-btn').forEach(btn => {
        btn.addEventListener('click', function () {
          const query = this.getAttribute('data-query');
          if (query) {
            chatInput.value = query;
            chatForm.dispatchEvent(new Event('submit'));
          }
        });
      });
    }

    bindSuggestionChips();

    // Thêm tin nhắn của Khách hàng
    function appendUserMessage(text) {
      const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const msgHTML = `
        <div class="chat-msg user-msg">
          <div class="msg-bubble">
            <div class="msg-content">${escapeHTML(text)}</div>
            <div class="msg-time">${timeStr}</div>
          </div>
          <div class="msg-avatar"><i class="fa-solid fa-user"></i></div>
        </div>
      `;
      messagesContainer.insertAdjacentHTML('beforeend', msgHTML);
      scrollToBottom();
    }

    // Thêm tin nhắn của AI Bot
    function appendBotMessage(replyHTML, suggestions = []) {
      const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      let chipsHTML = '';
      if (suggestions && suggestions.length > 0) {
        chipsHTML = `
          <div class="suggestion-chips mt-2">
            ${suggestions.map(s => `<button class="chip-btn" data-query="${s}">${s}</button>`).join('')}
          </div>
        `;
      }

      // Format markdown dạng gạch đầu dòng và in đậm cơ bản
      let formatted = replyHTML
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');

      const msgHTML = `
        <div class="chat-msg bot-msg">
          <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
          <div class="msg-bubble">
            <div class="msg-content">${formatted}</div>
            ${chipsHTML}
            <div class="msg-time">${timeStr}</div>
          </div>
        </div>
      `;
      messagesContainer.insertAdjacentHTML('beforeend', msgHTML);
      bindSuggestionChips();
      scrollToBottom();
    }

    function scrollToBottom() {
      setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }, 50);
    }

    function escapeHTML(str) {
      return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
      );
    }
  }

  // Tự động khởi chạy khi trang nạp xong DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectChatbotUI);
  } else {
    injectChatbotUI();
  }
})();

