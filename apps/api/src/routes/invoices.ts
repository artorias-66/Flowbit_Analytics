import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET /api/invoices - List all invoices with filters
router.get("/", async (req, res) => {
  try {
    const { search, status } = req.query;
    
    const invoices = await prisma.invoice.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { invoiceNumber: { contains: search as string, mode: "insensitive" } },
                  { vendor: { name: { contains: search as string, mode: "insensitive" } } },
                  { customer: { name: { contains: search as string, mode: "insensitive" } } },
                ],
              }
            : {},
          status ? { status: status as string } : {},
        ],
      },
      include: {
        vendor: true,
        customer: true,
      },
      orderBy: {
        invoiceDate: "desc",
      },
      take: 100,
    });

    const formatted = invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      invoiceDate: inv.invoiceDate.toISOString(),
      deliveryDate: inv.deliveryDate?.toISOString() || null,
      vendor: inv.vendor.name,
      customer: inv.customer.name,
      totalWithVat: inv.totalWithVat,
      status: inv.status,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

export default router;
