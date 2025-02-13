import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Papa from 'papaparse';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const PortfolioDashboard = () => {
  const [data, setData] = useState([]);
  const [selectedYears, setSelectedYears] = useState([1, 20]);
  const [hoveredYear, setHoveredYear] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await window.fs.readFile('LongTerm_Portfolio_Projection__Oscillating_Repayments_065__.csv');
        const text = new TextDecoder().decode(response);
        
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            setData(results.data);
          }
        });
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-bold">Year {label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value >= 100 ? formatCurrency(entry.value) : formatPercent(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This dashboard compares different portfolio strategies over a 20-year period with various market conditions and repayment approaches.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="portfolio" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="portfolio">Portfolio Values</TabsTrigger>
          <TabsTrigger value="margin">Margin Loans</TabsTrigger>
          <TabsTrigger value="market">Market Returns</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Values Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    onMouseMove={(e) => {
                      if (e.activePayload) {
                        setHoveredYear(e.activePayload[0].payload.Year);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="Year" />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Portfolio (Selling $20K)"
                      stroke="#ff7300"
                      name="Selling Strategy"
                    />
                    <Line
                      type="monotone"
                      dataKey="Portfolio (Using Margin - No Repay)"
                      stroke="#82ca9d"
                      name="Margin - No Repayment"
                    />
                    <Line
                      type="monotone"
                      dataKey="Portfolio (Using Margin - Oscillating Repayment)"
                      stroke="#8884d8"
                      name="Margin - Oscillating Repayment"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="margin">
          <Card>
            <CardHeader>
              <CardTitle>Margin Loan Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="Year" />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Margin Loan Balance (No Repay)"
                      stroke="#82ca9d"
                      name="No Repayment"
                    />
                    <Line
                      type="monotone"
                      dataKey="Margin Loan Balance (Oscillating Repayments)"
                      stroke="#8884d8"
                      name="Oscillating Repayment"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market">
          <Card>
            <CardHeader>
              <CardTitle>Market Returns & Repayment Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="Year" />
                    <YAxis tickFormatter={formatPercent} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="Market Return (%)"
                      fill="#8884d8"
                      name="Market Return"
                    />
                    <Bar
                      dataKey="Random Repayment %"
                      fill="#82ca9d"
                      name="Repayment Rate"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortfolioDashboard;