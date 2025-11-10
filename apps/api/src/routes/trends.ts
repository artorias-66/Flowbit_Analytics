import { Router } from "express";
import { PrismaClient, Prisma } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET /api/invoice-trends - Monthly invoice count and spend
router.get("/invoice-trends", async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      select: {
        invoiceDate: true,
        totalWithVat: true,
      },
    });

    const monthlyData: Record<string, { count: number; total: number }> = {};
    
    invoices.forEach((inv) => {
      const month = inv.invoiceDate.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { count: 0, total: 0 };
      }
      monthlyData[month].count += 1;
      monthlyData[month].total += inv.totalWithVat;
    });

    const result = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        invoiceCount: data.count,
        totalSpend: data.total,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months

    res.json(result);
  } catch (error) {
    console.error("Error fetching invoice trends:", error);
    res.status(500).json({ error: "Failed to fetch invoice trends" });
  }
});

// GET /api/category-spend - Spend by category
router.get("/category-spend", async (req, res) => {
  try {
    const result = await prisma.lineItem.groupBy({
      by: ["category"],
      _sum: {
        totalWithVat: true,
      },
      orderBy: {
        _sum: {
          totalWithVat: "desc",
        },
      },
      take: 10,
    });

    const formatted = result.map((item) => ({
      category: item.category,
      amount: item._sum.totalWithVat || 0,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching category spend:", error);
    res.status(500).json({ error: "Failed to fetch category spend" });
  }
});

// GET /api/cash-outflow - Expected cash outflow forecast
router.get("/cash-outflow", async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        dueDate: {
          gte: new Date(),
        },
      },
      include: {
        invoice: true,
      },
      orderBy: {
        dueDate: "asc",
      },
      take: 30,
    });

    const dailyOutflow: Record<string, number> = {};
    
    payments.forEach((payment) => {
      const date = payment.dueDate.toISOString().slice(0, 10); // YYYY-MM-DD
      if (!dailyOutflow[date]) {
        dailyOutflow[date] = 0;
      }
      dailyOutflow[date] += payment.invoice.totalWithVat;
    });

    const result = Object.entries(dailyOutflow).map(([date, amount]) => ({
      date,
      amount,
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching cash outflow:", error);
    res.status(500).json({ error: "Failed to fetch cash outflow" });
  }
});

export default router;
