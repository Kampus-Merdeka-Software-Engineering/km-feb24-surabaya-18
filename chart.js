// Data untuk grafik Sales Distribution at Several Times
var salesTimeData = {
  labels: ['12AM', '3AM', '6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
  datasets: [
    {
      label: 'Sales Distribution at Several Times',
      data: [0, 20, 40, 60, 80, 100],
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
    },
  ],
};

// Data untuk grafik Sales Distribution in Each Day
var salesDayData = {
  labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  datasets: [
    {
      label: 'Sales Distribution in Each Day',
      data: [200, 220, 180, 250, 230, 210, 190],
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 1,
    },
  ],
};

// Inisialisasi grafik Sales Distribution at Several Times
var salesTimeChart = new Chart(document.getElementById('salesTimeChart'), {
  type: 'bar',
  data: salesTimeData,
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});

// Inisialisasi grafik Sales Distribution in Each Day
var salesDayChart = new Chart(document.getElementById('salesDayChart'), {
  type: 'bar',
  data: salesDayData,
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});
