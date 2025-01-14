'use client';

import { useEffect, useRef } from 'react';
import { Card, CardBody } from "@nextui-org/react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartOptions, ChartData } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useState } from 'react';
import { gsap } from 'gsap';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface VolumeData {
  timestamp: string;
  volume: number;
  price: number;
}

interface HeatmapData {
  sector: string;
  performance: number;
}

interface SentimentData {
  positive: number;
  negative: number;
  neutral: number;
}

interface MarketData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
}

export function VolumeChart({ data }: { data: VolumeData[] }) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        // Cleanup previous instance
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        // Animate chart container
        gsap.from(chartRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.5,
          ease: "power2.out"
        });

        chartInstance.current = new ChartJS(ctx, {
          type: 'bar',
          data: {
            labels: data.map(d => new Date(d.timestamp).toLocaleDateString()),
            datasets: [
              {
                label: 'Trading Volume',
                data: data.map(d => d.volume),
                backgroundColor: 'rgba(0, 181, 166, 0.5)', // secondary color
                yAxisID: 'y'
              },
              {
                label: 'Price',
                data: data.map(d => d.price),
                type: 'line',
                borderColor: '#FF5A5F', // accent color
                yAxisID: 'y1'
              }
            ]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                type: 'linear',
                position: 'left',
                title: { 
                  display: true, 
                  text: 'Volume',
                  color: '#707070' // text-secondary
                },
                ticks: {
                  color: '#707070'
                },
                grid: {
                  color: 'rgba(112, 112, 112, 0.1)'
                }
              },
              y1: {
                type: 'linear',
                position: 'right',
                title: { 
                  display: true, 
                  text: 'Price',
                  color: '#707070'
                },
                ticks: {
                  color: '#707070'
                },
                grid: { 
                  drawOnChartArea: false,
                  color: 'rgba(112, 112, 112, 0.1)'
                }
              },
              x: {
                ticks: {
                  color: '#707070'
                },
                grid: {
                  color: 'rgba(112, 112, 112, 0.1)'
                }
              }
            },
            plugins: {
              legend: {
                labels: {
                  color: '#707070'
                }
              }
            }
          }
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return <canvas ref={chartRef} />;
}

export function MarketHeatmap({ data }: { data: HeatmapData[] }) {
  const [marketData, setMarketData] = useState<MarketData>({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch('/api/market/trending');
        const data = await response.json();
        
        // Transform data for chart
        const chartData = {
          labels: data.timestamps,
          datasets: [
            {
              label: 'Market Trend',
              data: data.values,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
            }
          ]
        };
        
        setMarketData(chartData);
      } catch (error) {
        console.error('Error fetching market data:', error);
      }
    };

    fetchMarketData();
  }, []);

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Market Analysis',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="w-full p-4">
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">Market Analysis</h2>
        <div className="h-[400px]">
          <Line options={options} data={marketData} />
        </div>
      </div>
    </div>
  );
}

export function SentimentChart({ data }: { data: SentimentData }) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        gsap.from(chartRef.current, {
          opacity: 0,
          rotate: -10,
          duration: 0.5,
          ease: "power2.out"
        });

        chartInstance.current = new ChartJS(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Positive', 'Negative', 'Neutral'],
            datasets: [{
              data: [data.positive, data.negative, data.neutral],
              backgroundColor: [
                'rgba(0, 181, 166, 0.8)', // secondary
                'rgba(255, 90, 95, 0.8)', // accent
                'rgba(112, 112, 112, 0.8)' // text-secondary
              ]
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { 
                position: 'bottom',
                labels: {
                  color: '#707070'
                }
              },
              title: {
                display: true,
                text: 'Market Sentiment Analysis',
                color: '#707070'
              }
            }
          }
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return <canvas ref={chartRef} />;
}