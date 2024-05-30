document.getElementById('jsonFileInput').addEventListener('change', handleFileSelect, false);

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const jsonData = JSON.parse(event.target.result);
      updateCharts(jsonData);
    };
    reader.readAsText(file);
  }
}

function updateCharts(data) {
  const salesTimeData = data.map((row) => row.total_usd);
  const salesDayData = data.map((row) => row.transaction_qty);
  const clockDayData = data.map((row) => row.transaction_time_hour);
  const DayData = data.map((row) => row.transaction_day);

  // Update sales time chart
  salesTimeChart.data.labels = clockDayData;
  salesTimeChart.data.datasets[0].data = salesTimeData;
  salesTimeChart.update();

  // Update sales day chart
  salesDayChart.data.labels = DayData;
  salesDayChart.data.datasets[0].data = salesDayData;
  salesDayChart.update();
}

const ctxSalesTime = document.getElementById('sales-time-chart').getContext('2d');
const ctxSalesDay = document.getElementById('sales-day-chart').getContext('2d');


const salesTimeChart = new Chart(ctxSalesTime, {
  type: 'line',
  data: {
    labels: ['12AM', '3AM', '6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
    datasets: [
      {
        label: 'total_usd',
        data: [0, 20, 40, 60, 80, 100],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});

const salesDayChart = new Chart(ctxSalesDay, {
  type: 'bar',
  data: {
    labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    datasets: [
      {
        label: 'transaction_qty',
        data: [30.2, 31.2, 30.4, 31.1, 29.6],
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});

// Fungsi untuk memuat data dari file JSON
async function loadSalesData() {
  const response = await fetch("data.json");
  const data = await response.json();
  return data;
}


// Variabel untuk melacak indeks awal dan akhir data yang ditampilkan
let startIndex = 0;
const itemsPerPage = 10;

// Fungsi untuk mengisi tabel dengan data penjualan sesuai dengan rentang indeks
async function fillSalesTable() {
  const rawData = await loadSalesData();

  const tableBody = document.querySelector("#salesTable tbody");
  tableBody.innerHTML = "";

  // Mengambil data untuk halaman saat ini berdasarkan rentang indeks
  const currentPageData = rawData.slice(startIndex, startIndex + itemsPerPage);

  currentPageData.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
              <td>${item.transaction_id}</td>
              <td>${item.transaction_date}</td>
              <td>${item.transaction_day}</td>
              <td>${item.transaction_time}</td>
              <td>${item.transaction_time_hour}</td>
              <td>${item.transaction_qty}</td>
              <td>${item.store_id}</td>
              <td>${item.store_location}</td>
              <td>${item.product_id}</td>
              <td>${item.unit_price}</td>
              <td>${item.product_category}</td>
              <td>${item.product_type}</td>
              <td>${item.product_detail}</td>
              <td>${item.total_usd}</td>
        `;
    tableBody.appendChild(row);
  });

  // Menampilkan atau menyembunyikan tombol panah berikutnya sesuai dengan kondisi
  const nextButton = document.getElementById("nextButton");
  if (startIndex + itemsPerPage >= rawData.length) {
    nextButton.style.display = "none";
  } else {
    nextButton.style.display = "block";
  }

  // Menampilkan atau menyembunyikan tombol panah sebelumnya sesuai dengan kondisi
  const prevButton = document.getElementById("prevButton");
  if (startIndex === 0) {
    prevButton.style.display = "none";
  } else {
    prevButton.style.display = "block";
  }
}

// Fungsi untuk menangani klik tombol panah berikutnya
function nextButtonClick() {
  startIndex += itemsPerPage;
  fillSalesTable();
}

// Fungsi untuk menangani klik tombol panah sebelumnya
function prevButtonClick() {
  startIndex -= itemsPerPage;
  fillSalesTable();
}

// Panggil fungsi untuk mengisi tabel saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  initChart();
  fillSalesTable();
});

// Fungsi untuk mengolah data penjualan per bulan
async function processMonthlySalesData() {
  const rawData = await loadSalesData();
  const salesData = {};

  rawData.forEach((item) => {
    const [day, month, year] = item.transaction_date.split("/");
    const dateKey = `${year}-${month.padStart(2, "0")}`; // Membuat key dengan format 'YYYY-MM'

    const quantity = parseInt(item.transaction_qty);
    const unitPrice = parseFloat(item.unit_price.replace("$", ""));
    const totalSales = parseFloat(item.total_usd.replace("$", ""));

    if (salesData[dateKey]) {
      salesData[dateKey] += totalSales;
    } else {
      salesData[dateKey] = totalSales;
    }
  });

  const labels = Object.keys(salesData).sort(); // Mengurutkan berdasarkan tanggal
  const data = labels.map((label) => salesData[label]);

  return { labels, data };
}


// Fungsi untuk menginisialisasi chart dengan data dari JSON
async function initChart() {
  const chartData = await processMonthlySalesData();
  
    const salesData = {
      labels: chartData.labels,
      datasets: [
        {
          label: "Revenue",
          data: chartData.data,
          backgroundColor: "rgba(182, 137, 91, 0.2)",
          borderColor: "rgba(182, 137, 91, 1)",
          borderWidth: 1,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  
    const config = {
      type: "line",
      data: salesData,
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    };
  
    const salesChart = new Chart(document.getElementById("revenue"), config);
}


// Panggil fungsi untuk menginisialisasi chart saat halaman dimuat
document.addEventListener("DOMContentLoaded", initChart);

// total revenue
$(document).ready(function(){
  $.getJSON('data.json', function(data) {
    var totalRevenue = 0;
    $.each(data, function(index, item) {
      var unit_price = parseFloat(item.unit_price.replace(',', '.'));
      var transaction_qty = parseFloat(item.transaction_qty.replace(',', '.'));
      totalRevenue += unit_price * item.transaction_qty;
    });
    $('#totalRevenue').text('$' + totalRevenue.toFixed(2));
  });
});

// total transaction
$(document).ready(function(){
  $.getJSON('data.json', function(data) {
    var totalTransaksi = 0;
    $.each(data, function(index, item) {
      var transactionQty = parseFloat(item.transaction_qty.replace(',', '.'));
      totalTransaksi += transactionQty;
    });
    $('#totalTransaksi').text(totalTransaksi.toFixed(2));
  });
});


//total customer
$(document).ready(function(){
  $.getJSON('data.json', function(data) {
    var uniqueOrderIds = {}; 
    $.each(data, function(index, item) {
      uniqueOrderIds[item.transaction_id] = true; 
    });
    var totalOrders = Object.keys(uniqueOrderIds).length; 
    $('#totalOrders').text(totalOrders);
  });
});