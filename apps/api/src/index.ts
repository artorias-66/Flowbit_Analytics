import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import statsRouter from "./routes/stats";
import invoicesRouter from "./routes/invoices";
import trendsRouter from "./routes/trends";
import vendorsRouter from "./routes/vendors";
import chatRouter from "./routes/chat";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/stats", statsRouter);
app.use("/api/invoices", invoicesRouter);
app.use("/api/invoice-trends", trendsRouter);
app.use("/api/vendors", vendorsRouter);
app.use("/api/category-spend", trendsRouter);
app.use("/api/cash-outflow", trendsRouter);
app.use("/api/chat", chatRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});
