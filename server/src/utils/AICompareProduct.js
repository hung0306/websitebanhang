const { GoogleGenerativeAI } = require("@google/generative-ai");

require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY_GEMINI);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const modelProduct = require("../models/products.model");

async function compareProducts(productId1, productId2) {
  try {
    // Validate product IDs
    if (!productId1 || !productId2) {
      throw new Error("Thiếu ID sản phẩm để so sánh");
    }

    // Find products with error handling
    const product1 = await modelProduct.findById(productId1).catch(err => {
      console.error(`Error finding product with ID ${productId1}:`, err);
      return null;
    });
    
    const product2 = await modelProduct.findById(productId2).catch(err => {
      console.error(`Error finding product with ID ${productId2}:`, err);
      return null;
    });

    if (!product1 || !product2) {
      throw new Error("Không tìm thấy một hoặc cả hai sản phẩm");
    }

    let comparison;
    
    try {
      const prompt = `
        Bạn là một chuyên gia về smartphone, đặc biệt là iPhone. Hãy so sánh chi tiết hai iPhone sau và trả về kết quả dưới dạng HTML với các thẻ định dạng phù hợp. Không cần thêm CSS vào HTML.

        iPhone 1: ${product1.name}
        - Màn hình: ${product1.screen}
        - Bộ nhớ: ${product1.storage}
        - RAM: ${product1.ram}
        - Camera: ${product1.camera}
        - Pin: ${product1.battery}
        - Giá: ${product1.price.toLocaleString("vi-VN")} VND

        iPhone 2: ${product2.name}
        - Màn hình: ${product2.screen}
        - Bộ nhớ: ${product2.storage}
        - RAM: ${product2.ram}
        - Camera: ${product2.camera}
        - Pin: ${product2.battery}
        - Giá: ${product2.price.toLocaleString("vi-VN")} VND

        Hãy phân tích và so sánh các khía cạnh sau:
        1. Thiết kế và màn hình
        2. Hiệu năng và RAM
        3. Camera và khả năng chụp ảnh/quay video
        4. Thời lượng pin
        5. Giá trị đồng tiền
        6. Đối tượng người dùng phù hợp với từng sản phẩm
        7. Các tính năng đặc biệt của mỗi model (nếu có)
        
        Hãy trả lời một cách chuyên nghiệp, dễ hiểu và đưa ra lời khuyên cụ thể cho người dùng dựa trên nhu cầu sử dụng khác nhau.
        Nếu có thông tin về các tính năng độc quyền của iPhone hoặc những điểm nổi bật của từng model, hãy bổ sung vào phần so sánh.`;

      const result = await model.generateContent(prompt);
      comparison = result.response.text();
    } catch (aiError) {
      console.error("Lỗi khi gọi API Gemini:", aiError);
      // Fallback to basic comparison if AI fails
      comparison = generateBasicComparison(product1, product2);
    }

    // Wrap the comparison in a styled container
    const styledComparison = `
      <style>
        .comparison-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        
        .product-card {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .comparison-section {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        h2 {
          color: #2c3e50;
          border-bottom: 2px solid #eee;
          padding-bottom: 10px;
          margin-bottom: 15px;
          text-align: center;
        }
        
        h3 {
          color: #3498db;
          margin-top: 20px;
          border-left: 4px solid #3498db;
          padding-left: 10px;
        }
        
        h4 {
          color: #2c3e50;
          margin-top: 15px;
          border-bottom: 1px dashed #e0e0e0;
          padding-bottom: 5px;
          display: inline-block;
        }
        
        .highlight {
          background-color: #fff3cd;
          padding: 2px 5px;
          border-radius: 3px;
        }
        
        ul {
          list-style-type: none;
          padding-left: 0;
        }
        
        li {
          margin-bottom: 10px;
          padding-left: 20px;
          position: relative;
        }
        
        li:before {
          content: "•";
          color: #3498db;
          position: absolute;
          left: 0;
        }
        
        .conclusion {
          background: #e8f4f8;
          border-radius: 8px;
          padding: 15px;
          margin-top: 20px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          box-shadow: 0 1px 8px rgba(0, 0, 0, 0.05);
        }
        
        table, th, td {
          border: 1px solid #e0e0e0;
        }
        
        th, td {
          padding: 12px 15px;
          text-align: left;
        }
        
        th {
          background-color: #0A2647;
          color: white;
          font-weight: 600;
          text-align: center;
        }
        
        tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        
        .feature-winner {
          color: #2ecc71;
          font-weight: bold;
          position: relative;
        }
        
        .feature-winner:after {
          content: "✓";
          margin-left: 5px;
          color: #2ecc71;
        }
        
        p {
          margin-bottom: 15px;
          line-height: 1.6;
        }
        
        .conclusion ul {
          padding-left: 20px;
        }
        
        .conclusion ul li {
          margin-bottom: 8px;
        }
        
        .comparison-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .comparison-header .product {
          text-align: center;
          flex: 1;
        }
        
        .comparison-header .product h3 {
          margin-top: 10px;
          color: #2c3e50;
          border: none;
          padding: 0;
        }
        
        .comparison-header .product .price {
          color: #e74c3c;
          font-weight: bold;
          margin: 5px 0;
        }
        
        .comparison-header .vs {
          font-size: 24px;
          font-weight: bold;
          color: #95a5a6;
          margin: 0 20px;
          background: #f8f9fa;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        
        .product-image {
          width: 150px;
          height: 150px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 8px;
          background: #f8f9fa;
          border: 1px solid #e0e0e0;
        }
        
        .product-image img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        
        .no-image {
          color: #95a5a6;
          font-size: 14px;
        }
        
        @media (max-width: 768px) {
          table {
            font-size: 14px;
          }
          
          th, td {
            padding: 8px 10px;
          }
          
          .comparison-header {
            flex-direction: column;
          }
          
          .comparison-header .vs {
            margin: 15px 0;
          }
          
          .product-image {
            width: 120px;
            height: 120px;
          }
        }
      </style>
      <div class="comparison-container">
        ${comparison}
      </div>`;

    return styledComparison;
  } catch (error) {
    console.error("Lỗi khi so sánh sản phẩm:", error);
    throw error;
  }
}

// Fallback function to generate basic comparison when AI fails
function generateBasicComparison(product1, product2) {
  // Create a more detailed comparison with proper formatting
  const compareSpecs = (spec1, spec2, specName) => {
    let winner = '';
    
    // For specific comparisons based on spec type
    if (specName === 'Giá') {
      if (product1.price < product2.price) {
        winner = product1.name;
      } else if (product2.price < product1.price) {
        winner = product2.name;
      }
    }
    
    // Format the cells with winner highlight if applicable
    const cell1 = winner === product1.name ? 
      `<td class="feature-winner">${spec1}</td>` : 
      `<td>${spec1}</td>`;
      
    const cell2 = winner === product2.name ? 
      `<td class="feature-winner">${spec2}</td>` : 
      `<td>${spec2}</td>`;
      
    return `<tr>
      <td>${specName}</td>
      ${cell1}
      ${cell2}
    </tr>`;
  };

  // Extract key features for comparison
  const extractFeatures = (product) => {
    const features = [];
    
    // Price advantage
    if (product.price < (product === product1 ? product2.price : product1.price)) {
      features.push("Giá thành hợp lý hơn");
    }
    
    // Screen advantage - basic parsing
    if (product.screen && (product === product1 ? product2.screen : product1.screen)) {
      // Check for resolution or size advantages
      if (product.screen.includes("Super Retina") && !(product === product1 ? product2.screen : product1.screen).includes("Super Retina")) {
        features.push("Màn hình chất lượng cao hơn (Super Retina)");
      }
      
      // Try to extract screen size
      const sizeMatch = product.screen.match(/(\d+(\.\d+)?)\s*inch/i);
      const otherSizeMatch = (product === product1 ? product2.screen : product1.screen).match(/(\d+(\.\d+)?)\s*inch/i);
      
      if (sizeMatch && otherSizeMatch) {
        const size = parseFloat(sizeMatch[1]);
        const otherSize = parseFloat(otherSizeMatch[1]);
        
        if (size > otherSize) {
          features.push(`Màn hình lớn hơn (${size} inch so với ${otherSize} inch)`);
        }
      }
    }
    
    // Storage advantage
    if (product.storage && (product === product1 ? product2.storage : product1.storage)) {
      const storageMatch = product.storage.match(/(\d+)\s*(GB|TB)/i);
      const otherStorageMatch = (product === product1 ? product2.storage : product1.storage).match(/(\d+)\s*(GB|TB)/i);
      
      if (storageMatch && otherStorageMatch) {
        let storage = parseInt(storageMatch[1]);
        let otherStorage = parseInt(otherStorageMatch[1]);
        
        // Convert TB to GB if needed
        if (storageMatch[2].toUpperCase() === 'TB') storage *= 1024;
        if (otherStorageMatch[2].toUpperCase() === 'TB') otherStorage *= 1024;
        
        if (storage > otherStorage) {
          features.push(`Bộ nhớ lớn hơn (${product.storage})`);
        }
      }
    }
    
    // RAM advantage
    if (product.ram && (product === product1 ? product2.ram : product1.ram)) {
      const ramMatch = product.ram.match(/(\d+)\s*GB/i);
      const otherRamMatch = (product === product1 ? product2.ram : product1.ram).match(/(\d+)\s*GB/i);
      
      if (ramMatch && otherRamMatch) {
        const ram = parseInt(ramMatch[1]);
        const otherRam = parseInt(otherRamMatch[1]);
        
        if (ram > otherRam) {
          features.push(`RAM lớn hơn (${ram}GB so với ${otherRam}GB)`);
        }
      }
    }
    
    // If no specific advantages found
    if (features.length === 0) {
      features.push("Cân nhắc lựa chọn dựa trên thiết kế và thương hiệu yêu thích");
    }
    
    return features;
  };

  // Create comparison header with product images
  const comparisonHeader = `
    <div class="comparison-header">
      <div class="product">
        <div class="product-image">
          ${product1.images && product1.images.length > 0 ? 
            `<img src="${product1.images[0]}" alt="${product1.name}" />` : 
            '<div class="no-image">Không có ảnh</div>'}
        </div>
        <h3>${product1.name}</h3>
        <p class="price">${product1.price?.toLocaleString("vi-VN")} VND</p>
      </div>
      
      <div class="vs">VS</div>
      
      <div class="product">
        <div class="product-image">
          ${product2.images && product2.images.length > 0 ? 
            `<img src="${product2.images[0]}" alt="${product2.name}" />` : 
            '<div class="no-image">Không có ảnh</div>'}
        </div>
        <h3>${product2.name}</h3>
        <p class="price">${product2.price?.toLocaleString("vi-VN")} VND</p>
      </div>
    </div>
  `;

  return `
    <h2>So sánh chi tiết: ${product1.name} và ${product2.name}</h2>
    
    ${comparisonHeader}
    
    <div class="comparison-section">
      <h3>Bảng so sánh thông số kỹ thuật</h3>
      <table>
        <tr>
          <th>Thông số</th>
          <th>${product1.name}</th>
          <th>${product2.name}</th>
        </tr>
        ${compareSpecs(product1.screen || 'Không có thông tin', product2.screen || 'Không có thông tin', 'Màn hình')}
        ${compareSpecs(product1.storage || 'Không có thông tin', product2.storage || 'Không có thông tin', 'Bộ nhớ')}
        ${compareSpecs(product1.ram || 'Không có thông tin', product2.ram || 'Không có thông tin', 'RAM')}
        ${compareSpecs(product1.camera || 'Không có thông tin', product2.camera || 'Không có thông tin', 'Camera')}
        ${compareSpecs(product1.battery || 'Không có thông tin', product2.battery || 'Không có thông tin', 'Pin')}
        ${compareSpecs(product1.cpu || 'Không có thông tin', product2.cpu || 'Không có thông tin', 'CPU')}
        ${compareSpecs(product1.gpu || 'Không có thông tin', product2.gpu || 'Không có thông tin', 'GPU')}
        ${compareSpecs(product1.weight || 'Không có thông tin', product2.weight || 'Không có thông tin', 'Kích thước')}
        ${compareSpecs(product1.price?.toLocaleString("vi-VN") + ' VND' || 'Không có thông tin', 
                      product2.price?.toLocaleString("vi-VN") + ' VND' || 'Không có thông tin', 'Giá')}
      </table>
    </div>
    
    <div class="comparison-section">
      <h3>Phân tích so sánh</h3>
      
      <h4>Thiết kế và màn hình</h4>
      <p>
        ${product1.name} ${product1.screen ? `có màn hình ${product1.screen}` : ''}, 
        trong khi ${product2.name} ${product2.screen ? `được trang bị màn hình ${product2.screen}` : ''}.
        ${product1.weight || product2.weight ? `Về kích thước, ${product1.name} ${product1.weight ? `có kích thước ${product1.weight}` : ''} 
        và ${product2.name} ${product2.weight ? `có kích thước ${product2.weight}` : ''}.` : ''}
      </p>
      
      <h4>Hiệu năng và bộ nhớ</h4>
      <p>
        ${product1.name} ${product1.cpu ? `sử dụng ${product1.cpu}` : ''} ${product1.ram ? `với ${product1.ram} RAM` : ''} 
        và ${product1.storage ? `bộ nhớ trong ${product1.storage}` : ''}.
        ${product2.name} ${product2.cpu ? `được trang bị ${product2.cpu}` : ''} ${product2.ram ? `với ${product2.ram} RAM` : ''} 
        và ${product2.storage ? `bộ nhớ trong ${product2.storage}` : ''}.
      </p>
      
      <h4>Camera</h4>
      <p>
        ${product1.name} ${product1.camera ? `có hệ thống camera: ${product1.camera}` : 'không có thông tin chi tiết về camera'}.
        ${product2.name} ${product2.camera ? `có hệ thống camera: ${product2.camera}` : 'không có thông tin chi tiết về camera'}.
      </p>
      
      <h4>Pin và thời lượng sử dụng</h4>
      <p>
        ${product1.name} ${product1.battery ? `có pin ${product1.battery}` : 'không có thông tin chi tiết về pin'}.
        ${product2.name} ${product2.battery ? `có pin ${product2.battery}` : 'không có thông tin chi tiết về pin'}.
      </p>
      
      <h3>Kết luận</h3>
      <p>Dựa trên thông số kỹ thuật, hai sản phẩm có những điểm mạnh riêng:</p>
      <ul>
        <li><strong>${product1.name}:</strong> ${extractFeatures(product1).join(", ")}</li>
        <li><strong>${product2.name}:</strong> ${extractFeatures(product2).join(", ")}</li>
      </ul>
      
      <div class="conclusion">
        <p>Lựa chọn phù hợp nhất sẽ phụ thuộc vào nhu cầu sử dụng và ngân sách của bạn:</p>
        <ul>
          <li>Nếu bạn cần một thiết bị với hiệu năng cao và không quá quan tâm đến giá cả, 
          ${product1.price > product2.price ? product1.name : product2.name} có thể là lựa chọn tốt hơn.</li>
          <li>Nếu bạn cần một thiết bị với giá cả hợp lý hơn, 
          ${product1.price < product2.price ? product1.name : product2.name} sẽ phù hợp hơn.</li>
          <li>Về trải nghiệm camera, hãy cân nhắc dựa trên nhu cầu chụp ảnh và quay video của bạn.</li>
        </ul>
      </div>
    </div>
  `;
}

module.exports = { compareProducts };
