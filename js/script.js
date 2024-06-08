document.addEventListener('DOMContentLoaded', function () {
  let jsonData = [];

  // Fetch data once and store it
  fetch('data.json')
    .then((response) => response.json())
    .then((data) => {
      jsonData = data;
      populateLocationFilter(data);
      updateMetrics(data);
      updateCharts(data);
      renderPieChart(data);
      renderProductQtyChart(data);
      renderProductUSDChart(data);
    });

  function populateLocationFilter(data) {
    const locationFilter = document.getElementById('locationFilter');
    const locations = Array.from(new Set(data.map((item) => item.store_location)));
    locations.forEach((location) => {
      const option = document.createElement('option');
      option.value = location;
      option.textContent = location;
      locationFilter.appendChild(option);
    });
  }

  document.getElementById('keyFilter').addEventListener('click', function () {
    const keyword = document.querySelector('.searchTerm').value.toLowerCase();
    const storeNames = ['Astoria', "Hell's Kitchen", 'Lower Manhattan'];

    const filteredData = jsonData.filter((item) => {
      return storeNames.some((store) => item.store_location.toLowerCase() === store.toLowerCase() && item.store_location.toLowerCase().includes(keyword));
    });

    if (filteredData.length === 0) {
      showPopup(`Data yang anda cari dengan keyword '${keyword}' tidak dapat ditemukan`);
    } else {
      updateMetrics(filteredData);
      updateCharts(filteredData);
      renderPieChart(filteredData);
      renderProductQtyChart(filteredData);
      renderProductUSDChart(filteredData);
    }
  });

  function showPopup(message) {
    const popup = document.getElementById('popup');
    const popupContent = document.getElementById('popup-content');
    popupContent.textContent = message;
    popup.style.display = 'block';

    // Event listener untuk menutup pop-up
    document.getElementById('popup-close').addEventListener('click', function () {
      popup.style.display = 'none';
    });
  }

  function updateMetrics(data) {
    // Calculate total revenue
    let totalRevenue = 0;
    data.forEach((item) => {
      let revenue = parseFloat(item.total_usd.replace(',', '.'));
      totalRevenue += revenue;
    });
    document.getElementById('totalRevenue').textContent = '$' + totalRevenue.toFixed(2);

    // Calculate total transactions
    let totalTransaksi = 0;
    data.forEach((item) => {
      let transactionQty = parseFloat(item.transaction_qty.replace(',', '.'));
      totalTransaksi += transactionQty;
    });
    document.getElementById('totalTransaksi').textContent = totalTransaksi.toFixed();

    // Calculate total unique orders
    let uniqueOrderIds = {};
    data.forEach((item) => {
      uniqueOrderIds[item.transaction_id] = true;
    });
    let totalOrders = Object.keys(uniqueOrderIds).length;
    document.getElementById('totalOrders').textContent = totalOrders;
  }

  function updateCharts(data) {
    // Sales per hour chart
    let salesPerHour = {};
    data.forEach((transaction) => {
      let hour = transaction.transaction_time_hour;
      let totalUSD = parseFloat(transaction.total_usd.replace(',', '.'));

      if (!salesPerHour[hour]) {
        salesPerHour[hour] = 0;
      }

      salesPerHour[hour] += totalUSD;
    });

    let salesLabels = [];
    let salesData = [];
    for (let hour = 0; hour < 24; hour++) {
      salesLabels.push(hour + ':00');
      salesData.push(salesPerHour[hour] ? salesPerHour[hour] : 0);
    }

    let ctxSales = document.getElementById('coffeeSalesPerHourChart').getContext('2d');
    if (window.salesChart) {
      window.salesChart.destroy();
    }
    window.salesChart = new Chart(ctxSales, {
      type: 'line',
      data: {
        labels: salesLabels,
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

    // Transactions per day chart
    let transactionsPerDay = {};
    data.forEach((transaction) => {
      let day = transaction.transaction_day;
      if (!transactionsPerDay[day]) {
        transactionsPerDay[day] = 0;
      }
      transactionsPerDay[day] += parseInt(transaction.transaction_qty.replace(',', '.'));
    });

    let transactionLabels = Object.keys(transactionsPerDay);
    let transactionQtys = Object.values(transactionsPerDay);

    let ctxTransactions = document.getElementById('transactionsQtyPerDayChart').getContext('2d');
    if (window.transactionsChart) {
      window.transactionsChart.destroy();
    }
    window.transactionsChart = new Chart(ctxTransactions, {
      type: 'line',
      data: {
        labels: transactionLabels,
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
  }

  function renderPieChart(data) {
    const ctx = document.getElementById('pieChart').getContext('2d');
    if (window.myPieChart) {
      window.myPieChart.destroy();
    }

    const storeLocations = {};
    data.forEach((item) => {
      storeLocations[item.store_location] = storeLocations[item.store_location] || [];
      storeLocations[item.store_location].push(item.transaction_id);
    });

    const labels = Object.keys(storeLocations);
    const values = labels.map((label) => storeLocations[label].length);

    window.myPieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [
          {
            label: '# of Transactions',
            data: values,
            backgroundColor: ['rgba(60,42,30, 0.2)', 'rgba(60,42,30, 0.5)', 'rgba(60,42,30, 1)'],
            borderColor: ['rgba(60,42,30, 1)', 'rgba(60,42,30, 1)', 'rgba(60,42,30, 1)'],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const count = context.raw;
                const transactionIds = storeLocations[label];
                return `${label}: ${count} (Transactions: ${transactionIds.join(', ')})`;
              },
            },
          },
        },
      },
    });
  }

  function renderProductQtyChart(data) {
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
    if (window.myProductQtyChart) {
      window.myProductQtyChart.destroy();
    }
    window.myProductQtyChart = new Chart(ctx, {
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
      window.myProductQtyChart.data.labels = labels;
      window.myProductQtyChart.data.datasets[0].data = dataValues;
      window.myProductQtyChart.update();
    });
  }

  function renderProductUSDChart(data) {
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
    if (window.myProductUSDChart) {
      window.myProductUSDChart.destroy();
    }
    window.myProductUSDChart = new Chart(ctx, {
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

    document.getElementById('orderSelect').addEventListener('change', function () {
      const order = this.value;
      labels = sortProductDetail(order);
      dataValues = labels.map((detail) => productTotalUSDMap[detail]);
      window.myProductUSDChart.data.labels = labels;
      window.myProductUSDChart.data.datasets[0].data = dataValues;
      window.myProductUSDChart.update();
    });
  }

  function filterDataByLocation(location) {
    if (!location) {
      return jsonData;
    }
    return jsonData.filter((item) => item.store_location === location);
  }

  document.getElementById('locationFilter').addEventListener('change', function () {
    const selectedLocation = this.value;
    const filteredData = filterDataByLocation(selectedLocation);
    updateMetrics(filteredData);
    updateCharts(filteredData);
    renderPieChart(filteredData);
    renderProductQtyChart(filteredData);
    renderProductUSDChart(filteredData);
  });
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

document.addEventListener('DOMContentLoaded', function () {
  let jsonData = [];

  // Fetch data once and store it
  fetch('data.json')
    .then((response) => response.json())
    .then((data) => {
      jsonData = data;
      populateLocationFilter(data);
      updateCharts(data);
      fillSalesTable(); // Panggil fungsi fillSalesTable setelah data dimuat
    });

  function populateLocationFilter(data) {
    const locationFilter = document.getElementById('locationFilter');
    const locations = Array.from(new Set(data.map((item) => item.store_location)));

    // Tambahkan event listener untuk perubahan pada filter lokasi
    locationFilter.addEventListener('change', locationFilterChange);
  }

  function updateCharts(data) {
    // Inisialisasi atau perbarui chart di sini
    initChart();
  }

  async function loadSalesData() {
    return jsonData; // Kembalikan data yang sudah dimuat
  }

  let startIndex = 0;
  const itemsPerPage = 10;

  async function fillSalesTable() {
    const rawData = await loadSalesData();

    const tableBody = document.querySelector('#salesTable tbody');
    tableBody.innerHTML = '';

    const selectedLocation = document.getElementById('locationFilter').value;

    const filteredData = selectedLocation ? rawData.filter((item) => item.store_location === selectedLocation) : rawData;

    const currentPageData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    currentPageData.forEach((item) => {
      const row = document.createElement('tr');
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

    const nextButton = document.getElementById('nextButton');
    if (startIndex + itemsPerPage >= filteredData.length) {
      nextButton.style.display = 'none';
    } else {
      nextButton.style.display = 'block';
    }

    const prevButton = document.getElementById('prevButton');
    if (startIndex === 0) {
      prevButton.style.display = 'none';
    } else {
      prevButton.style.display = 'block';
    }
  }

  function nextButtonClick() {
    startIndex += itemsPerPage;
    fillSalesTable();
  }

  function prevButtonClick() {
    startIndex -= itemsPerPage;
    fillSalesTable();
  }

  function locationFilterChange() {
    startIndex = 0; // Reset ke halaman pertama setiap kali filter berubah
    fillSalesTable();
    updateCharts(); // Perbarui chart saat filter lokasi berubah
  }

  async function processMonthlySalesData() {
    const rawData = await loadSalesData();
    const selectedLocation = document.getElementById('locationFilter').value;

    const filteredData = selectedLocation ? rawData.filter((item) => item.store_location === selectedLocation) : rawData;

    const salesData = {};

    filteredData.forEach((item) => {
      const [day, month, year] = item.transaction_date.split('/');
      const dateKey = `${year}-${month.padStart(2, '0')}`;

      const totalSales = parseFloat(item.total_usd.replace('$', '').replace(',', '.'));

      if (salesData[dateKey]) {
        salesData[dateKey] += totalSales;
      } else {
        salesData[dateKey] = totalSales;
      }
    });

    const labels = Object.keys(salesData).sort();
    const data = labels.map((label) => salesData[label]);

    return { labels, data };
  }

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

    const chartContainer = document.getElementById('revenue');
    if (chartContainer.chart) {
      chartContainer.chart.destroy();
    }
    chartContainer.chart = new Chart(chartContainer, config);
  }

  // Tambahkan event listener untuk tombol next dan prev
  document.getElementById('nextButton').addEventListener('click', nextButtonClick);
  document.getElementById('prevButton').addEventListener('click', prevButtonClick);
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
