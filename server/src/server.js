const express = require("express");
const app = express();
const port = 3000;

require("dotenv").config();

const bodyParser = require("body-parser");
const cookiesParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

const connectDB = require("./config/ConnectDB");
const routes = require("./routes/index");
const { askQuestion, clearConversation } = require("./utils/chatbot");
const { compareProducts } = require("./utils/AICompareProduct");

app.use(express.static(path.join(__dirname, "../src")));
app.use(cookiesParser());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

routes(app);

connectDB();

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Lỗi server",
  });
});

app.post("/chat", async (req, res) => {
  try {
    const { question, sessionId } = req.body;
    
    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Câu hỏi không được để trống"
      });
    }
    
    const data = await askQuestion(question, sessionId || req.cookies.sessionId || "default");
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi xử lý câu hỏi. Vui lòng thử lại sau."
    });
  }
});

app.post("/clear-chat", async (req, res) => {
  try {
    const { sessionId } = req.body;
    clearConversation(sessionId || req.cookies.sessionId || "default");
    return res.status(200).json({
      success: true,
      message: "Đã xóa lịch sử cuộc trò chuyện"
    });
  } catch (error) {
    console.error("Error in clear-chat endpoint:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi xóa lịch sử. Vui lòng thử lại sau."
    });
  }
});

app.post("/compare-product", async (req, res) => {  
  try {    
    const { productId1, productId2 } = req.body;
    
    if (!productId1 || !productId2) {
      return res.status(400).json({
        success: false,
        message: "Thiếu ID sản phẩm để so sánh"
      });
    }
    
    // Check if productIds are valid MongoDB ObjectIds
    const { isValidObjectId } = require('mongoose');
    if (!isValidObjectId(productId1) || !isValidObjectId(productId2)) {
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm không hợp lệ"
      });
    }
    
    const data = await compareProducts(productId1, productId2);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in compare-product endpoint:", error);
    
    // Provide more specific error messages based on the error type
    if (error.message && error.message.includes("Không tìm thấy")) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ: " + error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Lỗi khi so sánh sản phẩm. Vui lòng thử lại sau."
    });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
