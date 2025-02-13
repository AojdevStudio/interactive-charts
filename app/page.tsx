'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Papa from 'papaparse';

interface PortfolioData {
  Year: number;
  'Market Return (%)': number;
  'Portfolio (Selling $20K)': number;
  'Portfolio (Using Margin - No Repay)': number;
  'Portfolio (Using Margin - Oscillating Repayment)': number;
  'Margin Loan Balance (No Repay)': number;
  'Margin Loan Balance (Oscillating Repayments)': number;
  'Random Repayment %': number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
}

const PortfolioDashboard = () => {
  const [data, setData] = useState<PortfolioData[]>([]);
  const [selectedTab, setSelectedTab] = useState('portfolio');
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/Long-Term_Portfolio_Projection__Oscillating_Repayments_0-65__.csv');
        const text = await response.text();
        
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            setData(results.data as PortfolioData[]);
          }
        });
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
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
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-800">
            This dashboard compares different portfolio strategies over a 20-year period with various market conditions and repayment approaches.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex space-x-4 mb-6">
            <button
              className={`px-4 py-2 rounded-lg ${
                selectedTab === 'portfolio'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedTab('portfolio')}
            >
              Portfolio Values
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                selectedTab === 'margin'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedTab('margin')}
            >
              Margin Loans
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                selectedTab === 'market'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedTab('market')}
            >
              Market Returns
            </button>
          </div>

          <div className="h-[600px]">
            {selectedTab === 'portfolio' && (
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
            )}

            {selectedTab === 'margin' && (
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
            )}

            {selectedTab === 'market' && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDashboard;
