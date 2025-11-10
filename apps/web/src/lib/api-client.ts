const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

export interface Stats {
  totalSpendYTD: number;
  totalInvoices: number;
  documentsUploaded: number;
  averageInvoiceValue: number;
}

export interface InvoiceTrend {
  month: string;
  invoiceCount: number;
  totalSpend: number;
}

export interface VendorSpend {
  name: string;
  total: number;
}

export interface CategorySpend {
  category: string;
  amount: number;
}

export interface CashOutflow {
  date: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  deliveryDate: string;
  vendor: string;
  customer: string;
  totalWithVat: number;
  status: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sql?: string;
  results?: any[];
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async getStats(): Promise<Stats> {
    return this.fetch<Stats>("/api/stats");
  }

  async getInvoiceTrends(): Promise<InvoiceTrend[]> {
    return this.fetch<InvoiceTrend[]>("/api/invoice-trends");
  }

  async getTopVendors(): Promise<VendorSpend[]> {
    return this.fetch<VendorSpend[]>("/api/vendors/top10");
  }

  async getCategorySpend(): Promise<CategorySpend[]> {
    return this.fetch<CategorySpend[]>("/api/category-spend");
  }

  async getCashOutflow(): Promise<CashOutflow[]> {
    return this.fetch<CashOutflow[]>("/api/cash-outflow");
  }

  async getInvoices(search?: string, status?: string): Promise<Invoice[]> {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.fetch<Invoice[]>(`/api/invoices${query}`);
  }

  async chat(question: string): Promise<{ sql: string; results: any[]; answer: string }> {
    return this.fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ question }),
    });
  }
}

export const apiClient = new ApiClient();
