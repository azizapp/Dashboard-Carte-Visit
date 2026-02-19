// Updated AnalyticsDashboard.tsx

import React from 'react';

interface KpiCardProps {
  title: string;
  value: number;
  period: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, period }) => {
  return (
    <div className='kpi-card'>
      <h3>{title}</h3>
      <p>{value}</p>
      <span>{period}</span>
    </div>
  );
};

const getDateRangeForMoisPasse = () => {
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endDate = new Date(today.getFullYear(), today.getMonth(), 0);
  return { startDate, endDate };
};

const safeDivision = (numerator: number, denominator: number): number => {
  return denominator !== 0 ? numerator / denominator : 0;
};

const handleCalculation = (value1: number, value2: number): number => {
  return safeDivision(value1, value2);
};

const AnalyticsDashboard: React.FC = () => {
  const { startDate, endDate } = getDateRangeForMoisPasse();

  // Logic with better error handling for edge cases

  return (
    <div className='analytics-dashboard'>
      <KpiCard title='Mois passé' value={handleCalculation(100, 0)} period='Last Month' />
      {/* More KpiCards and content */}
    </div>
  );
};

export default AnalyticsDashboard;