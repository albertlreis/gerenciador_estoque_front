export const defaultChartOptions = {
  maintainAspectRatio: false,
  responsive: true,
  layout: {
    padding: 0
  },
  plugins: {
    legend: { position: 'top' }
  },
  animation: {
    duration: 500
  },
  scales: {
    x: {
      ticks: {
        callback: function(value, index, ticks) {
          const label = this.getLabelForValue(value);
          return label
            .replace('Jan', 'Jan')
            .replace('Feb', 'Fev')
            .replace('Mar', 'Mar')
            .replace('Apr', 'Abr')
            .replace('May', 'Mai')
            .replace('Jun', 'Jun')
            .replace('Jul', 'Jul')
            .replace('Aug', 'Ago')
            .replace('Sep', 'Set')
            .replace('Oct', 'Out')
            .replace('Nov', 'Nov')
            .replace('Dec', 'Dez');
        }
      }
    }
  }
};
