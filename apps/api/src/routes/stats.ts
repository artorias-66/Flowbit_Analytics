import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const [totalSpendResult, totalInvoices, avgInvoiceResult] = await Promise.all([
      prisma.invoice.aggregate({
        where: {
          invoiceDate: {
            gte: yearStart,
          },
        },
        _sum: {
          totalWithVat: true,
        },
      }),
      prisma.invoice.count(),
      prisma.invoice.aggregate({
        _avg: {
          totalWithVat: true,
        },
      }),
    ]);

    res.json({
      totalSpendYTD: totalSpendResult._sum.totalWithVat || 0,
      totalInvoices: totalInvoices,
      documentsUploaded: Math.floor(totalInvoices * 0.15), // Simulated
      averageInvoiceValue: avgInvoiceResult._avg.totalWithVat || 0,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
