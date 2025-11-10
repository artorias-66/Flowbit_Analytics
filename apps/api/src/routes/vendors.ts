import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET /api/vendors/top10 - Top 10 vendors by spend
router.get("/top10", async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        invoices: {
          select: {
            totalWithVat: true,
          },
        },
      },
    });

    const vendorTotals = vendors
      .map((vendor) => ({
        name: vendor.name,
        total: vendor.invoices.reduce((sum, inv) => sum + inv.totalWithVat, 0),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    res.json(vendorTotals);
  } catch (error) {
    console.error("Error fetching top vendors:", error);
    res.status(500).json({ error: "Failed to fetch top vendors" });
  }
});

export default router;
