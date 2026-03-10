export const buildSeriesData = (series = [], label, color) => ({
  labels: series.map((point) => point.t),
  datasets: [
    {
      label,
      data: series.map((point) => Number(point.value || 0)),
      borderColor: color,
      backgroundColor: `${color}20`,
      fill: true,
      tension: 0.2,
    },
  ],
});

export const buildSeriesDataWithCompare = (
  currentSeries = [],
  previousSeries = [],
  label,
  previousLabel,
  color,
  previousColor,
) => ({
  labels: currentSeries.map((point) => point.t),
  datasets: [
    {
      label,
      data: currentSeries.map((point) => Number(point.value || 0)),
      borderColor: color,
      backgroundColor: `${color}20`,
      fill: true,
      tension: 0.2,
    },
    {
      label: previousLabel,
      data: previousSeries.map((point) => Number(point.value || 0)),
      borderColor: previousColor,
      backgroundColor: `${previousColor}10`,
      borderDash: [6, 6],
      fill: false,
      tension: 0.2,
    },
  ],
});
