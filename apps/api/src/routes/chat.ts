import { Router } from "express";
import axios from "axios";

const router = Router();
// Remove trailing slash from base URL to prevent double-slash in path
const VANNA_API_BASE = (process.env.VANNA_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");

// POST /api/chat - Proxy to Vanna AI service
router.post("/", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const response = await axios.post(`${VANNA_API_BASE}/chat`, {
      question,
    });

    res.json(response.data);
  } catch (error: any) {
    console.error("Error calling Vanna AI:", error.message);
    res.status(500).json({ 
      error: "Failed to process question",
      details: error.response?.data || error.message 
    });
  }
});

export default router;
