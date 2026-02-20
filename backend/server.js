require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const db = require("./db");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GenerativeAIClient } = require("@google/generative-ai");

const client = new GenerativeAIClient({ apiKey: process.env.GOOGLE_API_KEY });

async function listModels() {
  try {
    const { models } = await client.listModels();
    console.log("Available models:", models);
  } catch (err) {
    console.error("Error listing models:", err);
  }
}

listModels();
const app = express();
// Use the API key from your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ===============================
// Middleware & Setup
// ===============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/uploads", express.static(uploadPath));

// ===============================
// AI Helper Function
// ===============================
function fileToGenerativePart(filePath, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
            mimeType,
        },
    };
}

// ===============================
// Multer Setup
// ===============================
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ===============================
// ROUTE: Upload Item
// ===============================
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

// ===============================
// ROUTE: AI Smart Stylist
// ===============================
app.get("/generate-ai/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const [items] = await db.execute("SELECT * FROM clothing_items WHERE user_id = ?", [userId]);

        if (items.length < 3) {
            return res.status(400).json({ error: "Please upload at least 3 items first!" });
        }

        const imageParts = items.map((item) => {
            const cleanRelativePath = item.image_path.startsWith('/') ? item.image_path.substring(1) : item.image_path;
            const fullPath = path.join(__dirname, cleanRelativePath);

            if (fs.existsSync(fullPath)) {
                // DETECT MIME TYPE: Essential for .webp files seen in your DB
                const ext = path.extname(fullPath).toLowerCase();
                let mimeType = "image/jpeg";
                if (ext === ".webp") mimeType = "image/webp";
                if (ext === ".png") mimeType = "image/png";

                return fileToGenerativePart(fullPath, mimeType);
            } else {
                console.warn(`⚠️ Skipping missing file: ${fullPath}`);
                return null;
            }
        }).filter(part => part !== null);

        if (imageParts.length < 3) {
            return res.status(400).json({ error: "Physical image files are missing. Please re-upload your clothes." });
        }

        // FIX: Changed model name to "gemini-1.5-flash" to resolve 404 error
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `
            Act as a fashion stylist. Look at these clothing images.
            Pick 1 top, 1 bottom, and 1 pair of shoes that look best together.
            Return ONLY a raw JSON object:
            {"topId": ID, "bottomId": ID, "shoesId": ID, "tip": "Why this looks good"}
            
            Available IDs: ${items.map(i => i.id).join(", ")}
        `;

        const result = await model.generateContent([prompt, ...imageParts]);
        const responseText = result.response.text();
        
        const cleanJson = responseText.replace(/```json|```/gi, "").trim();
        const selection = JSON.parse(cleanJson);

        const finalOutfit = {
            top: items.find(i => i.id == selection.topId),
            bottom: items.find(i => i.id == selection.bottomId),
            shoes: items.find(i => i.id == selection.shoesId),
            tip: selection.tip
        };

        res.json(finalOutfit);

    } catch (error) {
        console.error("AI STYLIST ERROR:", error);
        res.status(500).json({ error: "AI failed. Check if images are valid and API key is correct." });
    }
});

// ===============================
// Start Server
// ===============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔑 API Key Loaded: ${process.env.GEMINI_API_KEY ? "YES ✅" : "NO ❌"}\n`);
});
