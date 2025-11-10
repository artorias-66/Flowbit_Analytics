import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import statsRouter from "./routes/stats";
import invoicesRouter from "./routes/invoices";
import trendsRouter from "./routes/trends";
import vendorsRouter from "./routes/vendors";
import chatRouter from "./routes/chat";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/stats", statsRouter);
app.use("/api/invoices", invoicesRouter);
// Mount trends router at /api so its internal routes map to
// /api/invoice-trends, /api/category-spend, /api/cash-outflow
app.use("/api", trendsRouter);
app.use("/api/vendors", vendorsRouter);
app.use("/api/chat", chatRouter);

// Friendly root route
app.get("/", (req, res) => {
  res.json({
    service: "Flowbit Analytics API",
    status: "ok",
    endpoints: [
      "/health",
      "/api/stats",
      "/api/invoices",
      "/api/invoice-trends",
      "/api/vendors/top10",
      "/api/category-spend",
      "/api/cash-outflow",
      "/api/chat"
    ],
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Optional on-start seeding for empty production DB (minimal sample data)
async function seedIfEmpty() {
  if (!process.env.SEED_ON_START) return;
  const prisma = new PrismaClient();
  try {
    const invoiceCount = await prisma.invoice.count();
    if (invoiceCount > 0) {
      console.log(`🟡 Seed skipped: ${invoiceCount} invoices already present.`);
      return;
    }
    console.log("🌱 Seeding minimal sample data (5 invoices)...");
    // Create vendors & customers
    const vendors = await Promise.all([
      prisma.vendor.create({ data: { name: "Alpha Supplies", address: "123 Alpha St", taxId: "V-ALPHA" } }),
      prisma.vendor.create({ data: { name: "Beta Tech", address: "456 Beta Ave", taxId: "V-BETA" } }),
    ]);
    const customers = await Promise.all([
      prisma.customer.create({ data: { name: "Acme Corp", address: "1 Industrial Way", taxId: "C-ACME" } }),
      prisma.customer.create({ data: { name: "Globex LLC", address: "77 Market Rd", taxId: "C-GLOBEX" } }),
    ]);
    // Helper to make an invoice
    for (let i = 1; i <= 5; i++) {
      const vendor = vendors[i % vendors.length];
      const customer = customers[i % customers.length];
      const totalBeforeVat = 100 * i;
      const totalVat = totalBeforeVat * 0.19;
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: `INV-${1000 + i}`,
          invoiceDate: new Date(Date.now() - i * 86400000),
          deliveryDate: new Date(Date.now() - (i - 1) * 86400000),
          vendorId: vendor.id,
          customerId: customer.id,
          totalBeforeVat,
          totalVat,
          totalWithVat: totalBeforeVat + totalVat,
          status: i % 2 === 0 ? "paid" : "pending",
        },
      });
      await prisma.lineItem.create({
        data: {
          invoiceId: invoice.id,
          description: "Service fee",
          quantity: 1,
          unitPrice: totalBeforeVat,
          totalBeforeVat,
          vatRate: 0.19,
          vatAmount: totalVat,
          totalWithVat: totalBeforeVat + totalVat,
          category: "Services",
        },
      });
      await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          dueDate: new Date(Date.now() + i * 86400000),
          paymentTerms: "Net 30",
          bankAccount: "XX00-1234",
        },
      });
    }
    console.log("✅ Minimal seed complete");
  } catch (e) {
    console.error("❌ Seed failed", e);
  } finally {
    await prisma.$disconnect();
  }
}

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  seedIfEmpty();
});
