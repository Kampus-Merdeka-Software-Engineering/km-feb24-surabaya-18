$(document).ready(function () {
  $.getJSON('data.json', function (data) {
    var totalRevenue = 0;
    $.each(data, function (index, item) {
      var unit_price = parseFloat(item.unit_price.replace(',', '.'));
      totalRevenue += unit_price;
    });
    $('#totalRevenue').text('$' + totalRevenue.toFixed(2));
  });
});

$(document).ready(function () {
  $.getJSON('data.json', function (data) {
    var totalTransaksi = 0;
    $.each(data, function (index, item) {
      var transactionQty = parseFloat(item.transaction_qty.replace(',', '.'));
      totalTransaksi += transactionQty;
    });
    $('#totalTransaksi').text(totalTransaksi.toFixed());
  });
});

$(document).ready(function () {
  $.getJSON('data.json', function (data) {
    var uniqueOrderIds = {};
    $.each(data, function (index, item) {
      uniqueOrderIds[item.transaction_id] = true;
    });
    var totalOrders = Object.keys(uniqueOrderIds).length;
    $('#totalOrders').text(totalOrders);
  });
});

$(document).ready(function () {
  $.getJSON('data.json', function (data) {
    var salesPerHour = {};

    data.forEach(function (transaction) {
      var hour = transaction.transaction_time_hour;
      var totalUSD = parseFloat(transaction.total_usd);

      if (!salesPerHour[hour]) {
        salesPerHour[hour] = 0;
      }

      salesPerHour[hour] += totalUSD;
    });

    var labels = [];
    var salesData = [];

    for (var hour = 0; hour < 24; hour++) {
      labels.push(hour + ':00');
      salesData.push(salesPerHour[hour] ? salesPerHour[hour] : 0);
    }

    var ctx = document.getElementById('coffeeSalesPerHourChart').getContext('2d');
    var chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Penjualan USD per Jam',
            data: salesData,
            fill: false,
            backgroundColor: 'rgba(75, 54, 25, 0.2)',
            borderColor: 'rgba(75, 54, 25, 1)',
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
  });
});

$(document).ready(function () {
  $.getJSON('data.json', function (data) {
    var transactionsPerDay = {};

    data.forEach(function (transaction) {
      var day = transaction.transaction_day;

      if (!transactionsPerDay[day]) {
        transactionsPerDay[day] = 0;
      }

      transactionsPerDay[day] += parseInt(transaction.transaction_qty);
    });

    var labels = Object.keys(transactionsPerDay);
    var transactionQtys = Object.values(transactionsPerDay);

    var ctx = document.getElementById('transactionsQtyPerDayChart').getContext('2d');
    var chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Total Qty Terjual per Hari',
            data: transactionQtys,
            fill: false,
            backgroundColor: 'rgba(75, 54, 25, 0.2)',
            borderColor: 'rgba(75, 54, 25, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            stepSize: 1,
          },
        },
      },
    });
  });
});

fetch('data.json')
  .then((response) => response.json())
  .then((data) => {
    let productQtyMap = {};

    data.forEach((transaction) => {
      const productDetail = transaction.product_detail;
      const qty = parseFloat(transaction.transaction_qty.replace(',', '.'));
      if (!productQtyMap[productDetail]) {
        productQtyMap[productDetail] = 0;
      }
      productQtyMap[productDetail] += qty;
    });

    const sortProductDetail = (order) => {
      const sortedProductDetail = Object.keys(productQtyMap).sort((a, b) => {
        const qtyA = productQtyMap[a];
        const qtyB = productQtyMap[b];
        return order === 'asc' ? qtyA - qtyB : qtyB - qtyA;
      });
      return sortedProductDetail.slice(0, 5);
    };

    let labels = sortProductDetail('desc');
    let dataValues = labels.map((detail) => productQtyMap[detail]);

    const ctx = document.getElementById('myChart').getContext('2d');
    const myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Transaction Qty',
            data: dataValues,
            backgroundColor: 'rgba(75, 54, 25, 0.2)',
            borderColor: 'rgba(75, 54, 25, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        scales: {
          x: {
            beginAtZero: true,
          },
        },
      },
    });

    document.getElementById('orderSelect').addEventListener('change', function () {
      const order = this.value;
      labels = sortProductDetail(order);
      dataValues = labels.map((detail) => productQtyMap[detail]);
      myChart.data.labels = labels;
      myChart.data.datasets[0].data = dataValues;
      myChart.update();
    });
  });

fetch('data.json')
  .then((response) => response.json())
  .then((data) => {
    let productTotalUSDMap = {};

    data.forEach((transaction) => {
      const productDetail = transaction.product_detail;
      const totalUSD = parseFloat(transaction.total_usd.replace(',', '.'));
      if (!productTotalUSDMap[productDetail]) {
        productTotalUSDMap[productDetail] = 0;
      }
      productTotalUSDMap[productDetail] += totalUSD;
    });

    const sortProductDetail = (order) => {
      const sortedProductDetail = Object.keys(productTotalUSDMap).sort((a, b) => {
        const totalUSDA = productTotalUSDMap[a];
        const totalUSDB = productTotalUSDMap[b];
        return order === 'asc' ? totalUSDA - totalUSDB : totalUSDB - totalUSDA;
      });
      return sortedProductDetail.slice(0, 5);
    };

    let labels = sortProductDetail('desc');
    let dataValues = labels.map((detail) => productTotalUSDMap[detail]);

    const ctx = document.getElementById('myChart1').getContext('2d');
    const myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Total USD',
            data: dataValues,
            backgroundColor: 'rgba(75, 54, 25, 0.2)',
            borderColor: 'rgba(75, 54, 25, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        scales: {
          x: {
            beginAtZero: true,
          },
        },
      },
    });

    // Event listener untuk perubahan urutan
    document.getElementById('orderSelect').addEventListener('change', function () {
      const order = this.value;
      labels = sortProductDetail(order);
      dataValues = labels.map((detail) => productTotalUSDMap[detail]);
      myChart.data.labels = labels;
      myChart.data.datasets[0].data = dataValues;
      myChart.update();
    });
  });
// Fungsi untuk memuat data dari file JSON
async function loadSalesData() {
  const response = await fetch('data.json');
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
    const [day, month, year] = item.transaction_date.split('/');
    const dateKey = `${year}-${month.padStart(2, '0')}`; // Membuat key dengan format 'YYYY-MM'

    const quantity = parseInt(item.transaction_qty);
    const unitPrice = parseFloat(item.unit_price.replace('$', ''));
    const totalSales = parseFloat(item.total_usd.replace('$', ''));

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
        label: 'Revenue',
        data: chartData.data,
        backgroundColor: 'rgba(75, 54, 25, 0.2)',
        borderColor: 'rgba(75, 54, 25, 1)',
        borderWidth: 1,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const config = {
    type: 'line',
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

  const salesChart = new Chart(document.getElementById('revenue'), config);
}

// Panggil fungsi untuk menginisialisasi chart saat halaman dimuat
document.addEventListener('DOMContentLoaded', initChart);

// total revenue
$(document).ready(function () {
  $.getJSON('data.json', function (data) {
    var totalRevenue = 0;
    $.each(data, function (index, item) {
      var unit_price = parseFloat(item.unit_price.replace(',', '.'));
      var transaction_qty = parseFloat(item.transaction_qty.replace(',', '.'));
      totalRevenue += unit_price * item.transaction_qty;
    });
    $('#totalRevenue').text('$' + totalRevenue.toFixed(2));
  });
});
fetch('data.json')
  .then((response) => response.json())
  .then((data) => {
    // Inisialisasi objek untuk menyimpan total qty per product detail per store location
    const productQtyMap = {};

    // Iterasi data untuk mengisi objek productQtyMap
    data.forEach((transaction) => {
      const storeLocation = transaction.product_detail; // Swapped
      const productDetail = transaction.store_location; // Swapped
      const qty = parseFloat(transaction.transaction_qty.replace(',', '.'));

      // Periksa jika store location belum ada di objek
      if (!productQtyMap[storeLocation]) {
        productQtyMap[storeLocation] = {};
      }

      // Periksa jika product detail belum ada di store location
      if (!productQtyMap[storeLocation][productDetail]) {
        productQtyMap[storeLocation][productDetail] = 0;
      }

      // Tambahkan qty ke product detail di store location
      productQtyMap[storeLocation][productDetail] += qty;
    });

    // Menghitung total qty untuk setiap product detail di setiap store location
    const storeProductsQty = {};
    for (const storeLocation in productQtyMap) {
      storeProductsQty[storeLocation] = Object.entries(productQtyMap[storeLocation])
        .sort(([, qtyA], [, qtyB]) => qtyB - qtyA)
        .slice(0, 10) // Ambil 10 product detail teratas
        .reduce((acc, [product, qty]) => {
          acc[product] = qty;
          return acc;
        }, {});
    }

    // Sort and slice store locations
    const sortedStoreLocations = Object.entries(storeProductsQty)
      .sort(([, productsA], [, productsB]) => {
        const totalQtyA = Object.values(productsA).reduce((sum, qty) => sum + qty, 0);
        const totalQtyB = Object.values(productsB).reduce((sum, qty) => sum + qty, 0);
        return totalQtyB - totalQtyA;
      })
      .slice(0, 10) // Ambil 10 store location teratas
      .reduce((acc, [storeLocation, products]) => {
        acc[storeLocation] = products;
        return acc;
      }, {});

    // Inisialisasi label dan datasets untuk chart
    const labels = Object.keys(sortedStoreLocations);
    const datasets = labels.map((location) => {
      const data = Object.entries(storeProductsQty[location]).map(([product, qty]) => qty); // Ambil hanya qty
      return {
        label: location,
        data: data,
        backgroundColor: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.5)`,
        borderColor: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 1)`,
        borderWidth: 1,
      };
    });

    // Konfigurasi chart
    const config = {
      type: 'bar',
      data: {
        labels: Object.keys(storeProductsQty[labels[0]]), // Gunakan product detail sebagai label
        datasets: datasets,
      },
      options: {
        indexAxis: 'y', // Mengatur sumbu Y sebagai sumbu kategori
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
          },
        },
      },
    };

    // Membuat chart
    const horizontalStackedBarAreaChart = new Chart(document.getElementById('horizontalStackedBarAreaChart'), config);
  });


  // pie chart dan filter
  $(document).ready(function() {
    $.getJSON('data.json', function(data) {
      const jsonData = data;
  
      function renderChart(data) {
        const ctx = document.getElementById('pieChart').getContext('2d');
        if (window.myPieChart) {
          window.myPieChart.destroy();
        }
  
        const storeLocations = {};
        data.forEach(item => {
          storeLocations[item.store_location] = storeLocations[item.store_location] || [];
          storeLocations[item.store_location].push(item.transaction_id);
        });
  
        const labels = Object.keys(storeLocations);
        const values = labels.map(label => storeLocations[label].length);
  
        window.myPieChart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [{
              label: '# of Transactions',
              data: values,
              backgroundColor: [
                'rgba(60,42,30, 0.2)',
                'rgba(60,42,30, 0.5)',
                'rgba(60,42,30, 1)',
                // 'rgba(75, 192, 192, 0.2)',
                // 'rgba(153, 102, 255, 0.2)',
                // 'rgba(255, 159, 64, 0.2)'
              ],
              borderColor: [
                'rgba(60,42,30, 1)',
                'rgba(60,42,30, 1)',
                'rgba(60,42,30, 1)',
                // 'rgba(75, 192, 192, 1)',
                // 'rgba(153, 102, 255, 1)',
                // 'rgba(255, 159, 64, 1)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const count = context.raw;
                    const transactionIds = storeLocations[label];
                    return `${label}: ${count} (Transactions: ${transactionIds.join(', ')})`;
                  }
                }
              }
            }
          }
        });
      }
  
      function filterData(searchValue) {
        return jsonData.filter(item => 
          item.store_location.toLowerCase().includes(searchValue) ||
          item.transaction_id.includes(searchValue)
        );
      }
  
      $('#search').on('input', function() {
        const searchValue = this.value.toLowerCase();
        const filteredData = filterData(searchValue);
        renderChart(filteredData);
      });
  
      renderChart(jsonData);
    });
  });
  
