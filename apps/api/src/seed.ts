import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// Interface matching the actual MongoDB export structure
interface MongoDocument {
  _id: string;
  extractedData?: {
    llmData?: {
      invoice?: {
        value?: {
          invoiceId?: { value?: string };
          invoiceDate?: { value?: string };
          deliveryDate?: { value?: string };
        };
      };
      vendor?: {
        value?: {
          vendorName?: { value?: string };
          vendorAddress?: { value?: string };
          vendorTaxId?: { value?: string };
        };
      };
      customer?: {
        value?: {
          customerName?: { value?: string };
          customerAddress?: { value?: string };
          customerTaxId?: { value?: string };
        };
      };
      payment?: {
        value?: {
          dueDate?: { value?: string };
          paymentTerms?: { value?: string };
          bankAccountNumber?: { value?: string };
        };
      };
      summary?: {
        value?: {
          subTotal?: { value?: number };
          totalTax?: { value?: number };
          invoiceTotal?: { value?: number };
        };
      };
      lineItems?: {
        value?: {
          items?: { value?: Array<{
            description?: { value?: string };
            quantity?: { value?: number };
            unitPrice?: { value?: number };
            totalPrice?: { value?: number };
          }> };
        };
      };
    };
  };
}

async function main() {
  console.log("🌱 Starting database seed...");

  // Read the JSON data file
  const dataPath = path.join(__dirname, "../../../data/Analytics_Test_Data.json");
  
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ Data file not found: ${dataPath}`);
    console.log("Please ensure Analytics_Test_Data.json is in the data/ directory");
    process.exit(1);
  }

  let rawData = fs.readFileSync(dataPath, "utf-8");
  
  // Try to fix incomplete JSON by adding necessary closing brackets
  rawData = rawData.trim();
  if (!rawData.endsWith("]]")) {
    // Count opening brackets to determine how many closing brackets we need
    const openBraces = (rawData.match(/{/g) || []).length;
    const closeBraces = (rawData.match(/}/g) || []).length;
    const openBrackets = (rawData.match(/\[/g) || []).length;
    const closeBrackets = (rawData.match(/\]/g) || []).length;
    
    console.log(`⚠️  Incomplete JSON detected. Attempting to fix...`);
    console.log(`   Open braces: ${openBraces}, Close braces: ${closeBraces}`);
    console.log(`   Open brackets: ${openBrackets}, Close brackets: ${closeBrackets}`);
    
    // Add missing closing characters
    const missingBraces = openBraces - closeBraces;
    const missingBrackets = openBrackets - closeBrackets;
    
    for (let i = 0; i < missingBraces; i++) {
      rawData += "\n}";
    }
    for (let i = 0; i < missingBrackets; i++) {
      rawData += "\n]";
    }
    
    console.log(`   Added ${missingBraces} closing braces and ${missingBrackets} closing brackets`);
  }
  
  let documentsData: MongoDocument[][];
  
  try {
    documentsData = JSON.parse(rawData);
  } catch (error) {
    console.error("❌ Failed to parse JSON:", error);
    process.exit(1);
  }
  
  // Flatten if it's an array of arrays
  const flattenedData = documentsData.flat();
  
  console.log(`📄 Found ${flattenedData.length} documents to import`);

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await prisma.payment.deleteMany();
  await prisma.lineItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.vendor.deleteMany();

  let vendorCount = 0;
  let customerCount = 0;
  let invoiceCount = 0;
  let lineItemCount = 0;
  let paymentCount = 0;
  let skippedCount = 0;

  for (const doc of flattenedData) {
    try {
      const llmData = doc.extractedData?.llmData;
      if (!llmData) {
        skippedCount++;
        continue;
      }

      // Extract vendor data
      const vendorName = llmData.vendor?.value?.vendorName?.value || "Unknown Vendor";
      const vendorAddress = llmData.vendor?.value?.vendorAddress?.value || "Unknown Address";
      const vendorTaxId = llmData.vendor?.value?.vendorTaxId?.value || `UNKNOWN-${doc._id.substring(0, 8)}`;

      // Extract customer data
      const customerName = llmData.customer?.value?.customerName?.value || "Unknown Customer";
      const customerAddress = llmData.customer?.value?.customerAddress?.value || "Unknown Address";
      const customerTaxId = llmData.customer?.value?.customerTaxId?.value || `UNKNOWN-${doc._id.substring(8, 16)}`;

      // Extract invoice data
      const invoiceId = llmData.invoice?.value?.invoiceId?.value || doc._id.substring(0, 8);
      const invoiceDate = llmData.invoice?.value?.invoiceDate?.value || new Date().toISOString();
      const deliveryDate = llmData.invoice?.value?.deliveryDate?.value;

      // Extract summary/totals
      const subTotal = Math.abs(llmData.summary?.value?.subTotal?.value || 0);
      const totalTax = Math.abs(llmData.summary?.value?.totalTax?.value || 0);
      const invoiceTotal = Math.abs(llmData.summary?.value?.invoiceTotal?.value || 0);

      // Extract payment info
      const dueDate = llmData.payment?.value?.dueDate?.value || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const paymentTerms = llmData.payment?.value?.paymentTerms?.value || "Net 30";
      const bankAccount = llmData.payment?.value?.bankAccountNumber?.value || "Not specified";

      // Create or find vendor
      let vendor = await prisma.vendor.findFirst({
        where: { taxId: vendorTaxId },
      });

      if (!vendor) {
        vendor = await prisma.vendor.create({
          data: {
            name: vendorName,
            address: vendorAddress,
            taxId: vendorTaxId,
          },
        });
        vendorCount++;
      }

      // Create or find customer
      let customer = await prisma.customer.findFirst({
        where: { taxId: customerTaxId },
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            name: customerName,
            address: customerAddress,
            taxId: customerTaxId,
          },
        });
        customerCount++;
      }

      // Create invoice
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: invoiceId,
          invoiceDate: new Date(invoiceDate),
          deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
          vendorId: vendor.id,
          customerId: customer.id,
          totalBeforeVat: subTotal,
          totalVat: totalTax,
          totalWithVat: invoiceTotal,
          status: Math.random() > 0.3 ? "paid" : "pending",
        },
      });
      invoiceCount++;

      // Create line items
      const lineItems = llmData.lineItems?.value?.items?.value || [];
      for (const item of lineItems) {
        const description = item.description?.value || "Item";
        const quantity = item.quantity?.value || 1;
        const unitPrice = Math.abs(item.unitPrice?.value || 0);
        const totalPrice = Math.abs(item.totalPrice?.value || 0);
        const vatRate = 0.19; // Default 19% VAT
        const vatAmount = totalPrice * vatRate;

        await prisma.lineItem.create({
          data: {
            invoiceId: invoice.id,
            description: description,
            quantity: quantity,
            unitPrice: unitPrice,
            totalBeforeVat: totalPrice,
            vatRate: vatRate,
            vatAmount: vatAmount,
            totalWithVat: totalPrice + vatAmount,
            category: extractCategory(description),
          },
        });
        lineItemCount++;
      }

      // Create payment info
      await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          dueDate: new Date(dueDate),
          paymentTerms: paymentTerms,
          bankAccount: bankAccount,
        },
      });
      paymentCount++;
    } catch (error) {
      console.error(`Error processing document ${doc._id}:`, error);
      skippedCount++;
    }
  }

  console.log("\n✅ Database seeded successfully!");
  console.log(`   📦 Vendors: ${vendorCount}`);
  console.log(`   👥 Customers: ${customerCount}`);
  console.log(`   📄 Invoices: ${invoiceCount}`);
  console.log(`   📋 Line Items: ${lineItemCount}`);
  console.log(`   💳 Payments: ${paymentCount}`);
  console.log(`   ⚠️  Skipped: ${skippedCount}`);
}

function extractCategory(description: string): string {
  // Simple category extraction based on keywords
  const desc = description.toLowerCase();
  if (desc.includes("software") || desc.includes("license")) return "Software";
  if (desc.includes("hardware") || desc.includes("equipment")) return "Hardware";
  if (desc.includes("service") || desc.includes("consulting")) return "Services";
  if (desc.includes("office") || desc.includes("supplies")) return "Office Supplies";
  if (desc.includes("travel") || desc.includes("hotel")) return "Travel";
  return "General";
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
