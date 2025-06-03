const { GoogleGenerativeAI } = require("@google/generative-ai");

require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyCM3YREWyUtk2HoWJ8Gvv59B3xwXOiY06Y");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const modelProduct = require("../models/products.model");

// Store conversation history for each user session
const conversationHistory = new Map();

// Helper function to format product specifications
function formatProductSpecs(product) {
  let specsText = "";
  
  if (product.specifications && product.specifications.size > 0) {
    // Convert Map to array of entries and sort by key
    const sortedSpecs = Array.from(product.specifications.entries())
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
    
    specsText = sortedSpecs
      .map(([key, value]) => `- ${key}: ${value}`)
      .join('\n');
  }
  
  return specsText;
}

async function askQuestion(question, sessionId = "default") {
  try {
    // Initialize conversation history if it doesn't exist
    if (!conversationHistory.has(sessionId)) {
      conversationHistory.set(sessionId, []);
    }
    
    // Get conversation history
    const history = conversationHistory.get(sessionId);
    
    // Fetch products from database
    const products = await modelProduct.find({ isActive: true });
    
    // Format product data
    const productData = products
      .map(product => {
        // Format price with discount if available
        const priceText = product.priceDiscount > 0 
          ? `${product.price.toLocaleString("vi-VN")}đ (Giảm giá: ${product.priceDiscount.toLocaleString("vi-VN")}đ)`
          : `${product.price.toLocaleString("vi-VN")}đ`;
        
        // Get formatted specifications
        const specsText = formatProductSpecs(product);
        
        return `
        Tên: ${product.name}
        Giá: ${priceText}
        Số lượng còn lại: ${product.stock}
        Thông số kỹ thuật:
${specsText}
        `;
      })
      .join("\n----------------------------------------\n");

    // Build prompt with conversation history
    const historyText = history.length > 0 
      ? `Lịch sử cuộc trò chuyện:\n${history.map(item => `${item.role}: ${item.content}`).join('\n')}\n\n`
      : '';
    
    const prompt = `
        Bạn là một chuyên viên tư vấn laptop chuyên nghiệp. 
        ${historyText}
        Đây là danh sách laptop hiện có trong cửa hàng:
        ${productData}

        Câu hỏi của khách hàng: "${question}"
        
        Hãy tư vấn một cách chuyên nghiệp, thân thiện và chi tiết:
        1. Phân tích nhu cầu của khách hàng
        2. Đề xuất các laptop phù hợp từ danh sách trên (chỉ đề xuất những laptop có sẵn trong kho)
        3. Giải thích lý do đề xuất và so sánh ưu/nhược điểm
        4. Đưa ra lời khuyên cuối cùng
        
        Trả lời bằng tiếng Việt, sử dụng từ ngữ dễ hiểu.
        Đảm bảo thông tin về giá cả và thông số kỹ thuật chính xác theo dữ liệu được cung cấp.
        
        QUAN TRỌNG: Định dạng câu trả lời bằng HTML để dễ đọc hơn, sử dụng:
        - Thẻ <p> cho đoạn văn
        - Thẻ <strong> hoặc <b> cho nội dung quan trọng
        - Thẻ <ul> và <li> cho danh sách
        - Thẻ <table>, <tr>, <th>, <td> cho bảng so sánh
        - Thẻ <h3> hoặc <h4> cho tiêu đề phần
        
        Khi so sánh thông số kỹ thuật, hãy sử dụng bảng HTML để hiển thị rõ ràng.
        Khi đề xuất sản phẩm, hãy in đậm tên sản phẩm và giá.
        `;

    // Generate response
    const result = await model.generateContent(prompt);
    const answer = result.response.text();
    
    // Update conversation history (limit to last 5 exchanges to avoid token limits)
    history.push({ role: "User", content: question });
    history.push({ role: "Assistant", content: answer });
    
    // Keep only the last 10 messages (5 exchanges)
    if (history.length > 10) {
      history.splice(0, 2);
    }
    
    conversationHistory.set(sessionId, history);
    
    return answer;
  } catch (error) {
    console.error("Chatbot error:", error);
    return "Xin lỗi, đã có lỗi xảy ra trong quá trình xử lý câu hỏi của bạn.";
  }
}

// Clear conversation history for a session
function clearConversation(sessionId = "default") {
  conversationHistory.delete(sessionId);
  return true;
}

module.exports = { askQuestion, clearConversation };
