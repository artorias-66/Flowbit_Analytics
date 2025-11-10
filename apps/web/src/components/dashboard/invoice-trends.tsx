"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient, type InvoiceTrend } from "@/lib/api-client";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function InvoiceTrends() {
  const [data, setData] = useState<InvoiceTrend[]>([]);

  useEffect(() => {
    apiClient.getInvoiceTrends().then(setData).catch(console.error);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Volume & Value Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="invoiceCount" stroke="#8884d8" name="Invoice Count" />
            <Line yAxisId="right" type="monotone" dataKey="totalSpend" stroke="#82ca9d" name="Total Spend ($)" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
