require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const db = require("./db");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/uploads", express.static(uploadPath));

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Upload Route
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const { name, category, color, user_id } = req.body;
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const imagePath = `/uploads/${req.file.filename}`;
    await db.execute(
      "INSERT INTO clothing_items (user_id, name, category, color, image_path) VALUES (?, ?, ?, ?, ?)",
      [user_id || 1, name, category, color, imagePath]
    );

    res.status(201).json({ message: "Item uploaded successfully" });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

// AI Stylist Route
app.get("/generate-ai/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const [items] = await db.execute("SELECT * FROM clothing_items WHERE user_id = ?", [userId]);

    if (items.length < 3) return res.status(400).json({ error: "Please upload at least 3 items first!" });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const prompt = `
You are a professional fashion stylist. Here are the wardrobe items with their IDs, categories, and descriptions:

${items.map(i => `ID ${i.id}: ${i.category.toUpperCase()} - ${i.name} (${i.color})`).join("\n")}

Pick exactly 1 top, 1 bottom, and 1 pair of shoes.  
Return ONLY a JSON object in this format:
{"topId": ID, "bottomId": ID, "shoesId": ID, "tip": "Explain why this combination works"}

⚠️ Make sure that the topId is an item with category "top", bottomId is "bottom", and shoesId is "shoes". Do NOT repeat the same item for multiple categories.
`;
    const result = await model.generateContent([prompt]);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json|```/gi, "").trim();

    let selection;
    try {
      selection = JSON.parse(cleanJson);
    } catch (e) {
      console.error("AI JSON parse failed:", cleanJson, e);
      return res.status(500).json({ error: "AI produced invalid JSON" });
    }

    const finalOutfit = {
      top: items.find(i => i.id == selection.topId),
      bottom: items.find(i => i.id == selection.bottomId),
      shoes: items.find(i => i.id == selection.shoesId),
      tip: selection.tip,
    };

    res.json(finalOutfit);

  } catch (err) {
    console.error("AI STYLIST ERROR:", err);
    res.status(500).json({ error: "AI stylist failed" });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔑 GEMINI_API_KEY Loaded: ${process.env.GEMINI_API_KEY ? "YES" : "NO"}`);
});