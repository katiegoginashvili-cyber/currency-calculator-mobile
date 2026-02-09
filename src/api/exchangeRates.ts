const API_KEY = '1f7716e74c7ca1c39c61e497';
const BASE_URL = 'https://v6.exchangerate-api.com/v6';

export interface ExchangeRateResponse {
  result: string;
  base_code: string;
  time_last_update_utc: string;
  time_next_update_utc: string;
  conversion_rates: Record<string, number>;
}

export interface HistoricalRateResponse {
  result: string;
  base_code: string;
  year: number;
  month: number;
  day: number;
  conversion_rates: Record<string, number>;
}

export interface ChartDataPoint {
  date: string;
  rate: number;
}

export const fetchExchangeRates = async (baseCurrency: string = 'USD'): Promise<ExchangeRateResponse> => {
  const response = await fetch(`${BASE_URL}/${API_KEY}/latest/${baseCurrency}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch exchange rates: ${response.status}`);
  }
  
  const data: ExchangeRateResponse = await response.json();
  
  if (data.result !== 'success') {
    throw new Error('API returned an error');
  }
  
  return data;
};

export const fetchHistoricalRate = async (
  baseCurrency: string,
  year: number,
  month: number,
  day: number
): Promise<HistoricalRateResponse> => {
  const response = await fetch(
    `${BASE_URL}/${API_KEY}/history/${baseCurrency}/${year}/${month}/${day}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch historical rates: ${response.status}`);
  }
  
  const data: HistoricalRateResponse = await response.json();
  
  if (data.result !== 'success') {
    throw new Error('API returned an error');
  }
  
  return data;
};

// Fetch historical data for chart
export const fetchChartData = async (
  fromCurrency: string,
  toCurrency: string,
  period: string
): Promise<ChartDataPoint[]> => {
  const today = new Date();
  const dataPoints: ChartDataPoint[] = [];
  
  // Determine number of days and interval based on period
  let days: number;
  let interval: number;
  
  switch (period) {
    case '1D':
      days = 1;
      interval = 1;
      break;
    case '1W':
      days = 7;
      interval = 1;
      break;
    case '1M':
      days = 30;
      interval = 2;
      break;
    case '3M':
      days = 90;
      interval = 5;
      break;
    case '6M':
      days = 180;
      interval = 10;
      break;
    case '1Y':
      days = 365;
      interval = 20;
      break;
    default:
      days = 30;
      interval = 2;
  }
  
  // Fetch data points
  const fetchPromises: Promise<{ date: Date; data: HistoricalRateResponse } | null>[] = [];
  
  for (let i = days; i >= 0; i -= interval) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    fetchPromises.push(
      fetchHistoricalRate(fromCurrency, year, month, day)
        .then(data => ({ date, data }))
        .catch(() => null)
    );
  }
  
  const results = await Promise.all(fetchPromises);
  
  for (const result of results) {
    if (result && result.data.conversion_rates[toCurrency]) {
      const dateStr = result.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dataPoints.push({
        date: dateStr,
        rate: result.data.conversion_rates[toCurrency],
      });
    }
  }
  
  return dataPoints;
};

export const formatLastUpdated = (utcString: string): string => {
  const date = new Date(utcString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month} ${day}, ${hours}:${minutes}`;
};
