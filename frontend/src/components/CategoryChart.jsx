import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register the necessary components for Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryChart = ({ transactions }) => {
  // Filter for expenses and group them by category name, tracking colors
  const categoryMetadata = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const catName = t.category?.name || 'Other';
      const catColor = t.category?.color || '#C45D3C';
      if (!acc[catName]) {
        acc[catName] = { amount: 0, color: catColor };
      }
      acc[catName].amount += Number(t.amount);
      return acc;
    }, {});

  const labels = Object.keys(categoryMetadata);
  const chartData = Object.values(categoryMetadata).map(m => m.amount);
  const backgroundColors = Object.values(categoryMetadata).map(m => m.color + 'aa'); // ~0.66 opacity
  const borderColors = Object.values(categoryMetadata).map(m => m.color);

  // Prepare the data for the chart
  const data = {
    labels,
    datasets: [{
      label: 'Spending by Category',
      data: chartData,
      backgroundColor: backgroundColors.length > 0 ? backgroundColors : ['#C45D3C'],
      borderColor: borderColors.length > 0 ? borderColors : ['#C45D3C'],
      borderWidth: 1.5,
    }],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#2D2420',
          font: {
            family: 'Manrope',
            weight: 'bold',
          }
        }
      },
      tooltip: {
        titleFont: {
          family: 'Fraunces',
        },
        bodyFont: {
          family: 'Manrope',
        }
      }
    },
  };

  return (
    <div className="p-4 flex justify-center items-center">
      <div
        style={{ width: '320px', height: '320px' }} // Control chart size here
        className="flex justify-center items-center"
      >
        {labels.length > 0 ? (
          <Pie data={data} options={options} />
        ) : (
          <p className="text-center text-brand-text/60 italic text-sm">
            No expenses to display in chart yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default CategoryChart;
