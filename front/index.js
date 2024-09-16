google.charts.load("current", {
  packages: ["corechart", "bar"],
});
google.charts.setOnLoadCallback(loadTable);

let currentPage = 1;
const itemsPerPage = 20;
let totalItems = 0;
let allData = [];

// Initial AOS setup
AOS.init({
  duration: 1000, // ความเร็วในการแอนิเมชัน (ms)
  once: true, // เล่นแอนิเมชันครั้งเดียวเมื่อ scroll
});

// โหลดข้อมูลตารางและกราฟ
function loadTable() {
    const xhttp = new XMLHttpRequest();
    const uri = "http://localhost:3000/evlist";
    xhttp.open("GET", uri);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            allData = JSON.parse(this.responseText);
            totalItems = allData.length;
            displayTable();
            loadGraph(allData);
        }
    };
}

// แก้ไขฟังก์ชันการแสดงตาราง
function displayTable() {
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const sortedData = allData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  const pageData = sortedData.slice(start, end);

  var trHTML = "";
  var num = start + 1;
  for (let object of pageData) {
      trHTML += "<tr>";
      trHTML += "<td>" + num + "</td>";
      trHTML += "<td>" + object["region"] + "</td>";
      trHTML += "<td>" + object["category"] + "</td>";
      trHTML += "<td>" + object["parameter"] + "</td>";
      trHTML += "<td>" + object["mode"] + "</td>";
      trHTML += "<td>" + object["powertrain"] + "</td>";
      trHTML += "<td>" + object["year"] + "</td>";
      trHTML += "<td>" + object["unit"] + "</td>";
      trHTML += "<td>" + object["value"] + "</td>";
      trHTML += "<td>";
      trHTML += '<a type="button" class="btn btn-outline-secondary me-2" onclick="showEVUpdateBox(\'' + object["_id"] + '\')"><i class="fas fa-edit"></i></a>';
      trHTML += '<a type="button" class="btn btn-outline-danger" onclick="showEVDeleteBox(\'' + object["_id"] + '\')"><i class="fas fa-trash"></i></a>';
      trHTML += "</td></tr>";
      num++;
  }
  document.getElementById("mytable").innerHTML = trHTML;

  updatePaginationNumbers();
}


function updatePaginationNumbers() {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  let paginationHTML = "";
  
  // Always show 5 page numbers
  let startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  let endPage = Math.min(totalPages, startPage + 4);
  
  for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `<li class="page-item ${i === currentPage ? 'active' : ''}">
          <a class="page-link" href="#" onclick="goToPage(${i})">${i}</a></li>`;
  }

  document.getElementById("paginationNumbers").innerHTML = paginationHTML;
}
function goToFirstPage() {
  if (currentPage !== 1) {
      currentPage = 1;
      displayTable();
  }
}

function goToPreviousPage() {
  if (currentPage > 1) {
      currentPage--;
      displayTable();
  }
}

function goToNextPage() {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (currentPage < totalPages) {
      currentPage++;
      displayTable();
  }
}

function goToLastPage() {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (currentPage !== totalPages) {
      currentPage = totalPages;
      displayTable();
  }
}
function goToPage(pageNumber) {
  if (pageNumber >= 1 && pageNumber <= Math.ceil(totalItems / itemsPerPage)) {
      currentPage = pageNumber;
      displayTable();
  }
}

// ลบส่วนล่างออก
document.addEventListener("DOMContentLoaded", function() {
  document.querySelector("div.d-flex.justify-content-center").remove();
});

function loadQueryTable() {
    document.getElementById("mytable").innerHTML = '<tr><th scope="row" colspan="10">Loading...</th></tr>';
    const searchText = document.getElementById("searchQuery").value;
    
    const searchTerms = searchText.split(',').map(term => term.trim());

    const xhttp = new XMLHttpRequest();
    const uri = "http://localhost:3000/evlist/search";
    xhttp.open("POST", uri);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(JSON.stringify({ searchTerms: searchTerms }));

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const response = JSON.parse(this.responseText);
            allData = response.EVData || [];
            totalItems = allData.length;
            currentPage = 1;
            
            if (allData.length === 0) {
                document.getElementById("mytable").innerHTML = '<tr><td colspan="10">No data found</td></tr>';
            } else {
                displayTable();
            }

            loadGraph(allData);
        }
    };
}

function showEVCreateBox() {
  Swal.fire({
    title: "Create EV Data",
    html:
      '<div class="mb-3"><label for="region" class="form-label">region</label>' +
      '<input class="form-control" id="region" placeholder="region"></div>' +

      '<div class="mb-3"><label for="category" class="form-label">category</label>' +
      '<input class="form-control" id="category" placeholder="category"></div>' +

      '<div class="mb-3"><label for="parameter" class="form-label">parameter</label>' +
      '<input class="form-control" id="parameter" placeholder="parameter"></div>' +

      '<div class="mb-3"><label for="mode" class="form-label">mode</label>' +
      '<input class="form-control" id="mode" placeholder="mode"></div>' +

      '<div class="mb-3"><label for="powertrain" class="form-label">powertrain</label>' +
      '<input class="form-control" id="powertrain" placeholder="powertrain"></div>' +

      '<div class="mb-3"><label for="year" class="form-label">year</label>' +
      '<input class="form-control" id="year" placeholder="year"></div>' +

      '<div class="mb-3"><label for="unit" class="form-label">unit</label>' +
      '<input class="form-control" id="unit" placeholder="unit"></div>' +

      '<div class="mb-3"><label for="value" class="form-label">value</label>' +
      '<input class="form-control" id="value" placeholder="value"></div>',

    focusConfirm: false,
    preConfirm: () => {
      evCreate();
    },
  });
}

function evCreate() {
  const region = document.getElementById("region").value;
  const category = document.getElementById("category").value;
  const parameter = document.getElementById("parameter").value;
  const mode = document.getElementById("mode").value;
  const powertrain = document.getElementById("powertrain").value;
  const year = document.getElementById("year").value;
  const unit = document.getElementById("unit").value;
  const value = document.getElementById("value").value;

  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", "http://localhost:3000/evlist/create");
  xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhttp.send(
    JSON.stringify({
      region: region,
      category: category,
      parameter: parameter,
      mode: mode,
      powertrain: powertrain,
      year: year,
      unit: unit,
      value: value,
    })
  );

  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        const newObject = JSON.parse(this.responseText).newObject;
        allData.unshift(newObject);  // เพิ่มข้อมูลใหม่ด้านบนสุดของ allData
        totalItems++;
        Swal.fire(
            "Good job!",
            "Create EV Data Successfully!",
            "success"
        );
        displayTable();
        loadGraph(allData);
    }
};
}

function showEVUpdateBox(id) {
  console.log("edit", id);
  const xhttp = new XMLHttpRequest();
  xhttp.open("GET", "http://localhost:3000/evlist/" + id);
  xhttp.send();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      const object = JSON.parse(this.responseText).EVData;
      console.log("showEVUpdateBox", object);
      Swal.fire({
        title: "Update EV Data",
        html:
          '<input id="id" class="swal2-input" placeholder="ID" type="hidden" value="' + object["_id"] + '">' +
          '<div class="mb-3"><label for="region" class="form-label">region</label>' +
          '<input class="form-control" id="region" placeholder="region" value="' + object["region"] + '"></div>' +

          '<div class="mb-3"><label for="category" class="form-label">category</label>' +
          '<input class="form-control" id="category" placeholder="category" value="' + object["category"] + '"></div>' +

          '<div class="mb-3"><label for="parameter" class="form-label">parameter</label>' +
          '<input class="form-control" id="parameter" placeholder="parameter" value="' + object["parameter"] + '"></div>' +

          '<div class="mb-3"><label for="mode" class="form-label">mode</label>' +
          '<input class="form-control" id="mode" placeholder="mode" value="' + object["mode"] + '"></div>' +

          '<div class="mb-3"><label for="powertrain" class="form-label">powertrain</label>' +
          '<input class="form-control" id="powertrain" placeholder="powertrain" value="' + object["powertrain"] + '"></div>' +

          '<div class="mb-3"><label for="year" class="form-label">Year</label>' +
          '<input class="form-control" id="year" placeholder="year" value="' + object["year"] + '"></div>' +

          '<div class="mb-3"><label for="unit" class="form-label">unit</label>' +
          '<input class="form-control" id="unit" placeholder="unit" value="' + object["unit"] + '"></div>' +

          '<div class="mb-3"><label for="value" class="form-label">value</label>' +
          '<input class="form-control" id="value" placeholder="value" value="' + object["value"] + '"></div>',

        focusConfirm: false,
        preConfirm: () => {
          evUpdate();
        },
      });
    }
  };
}

function evUpdate() {
  const id = document.getElementById("id").value;
  const region = document.getElementById("region").value;
  const category = document.getElementById("category").value;
  const parameter = document.getElementById("parameter").value;
  const mode = document.getElementById("mode").value;
  const powertrain = document.getElementById("powertrain").value;
  const year = document.getElementById("year").value;
  const unit = document.getElementById("unit").value;
  const value = document.getElementById("value").value;

  const xhttp = new XMLHttpRequest();
  xhttp.open("PUT", "http://localhost:3000/evlist/update");
  xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhttp.send(
    JSON.stringify({
      _id: id,
      region: region,
      category: category,
      parameter: parameter,
      mode: mode,
      powertrain: powertrain,
      year: year,
      unit: unit,
      value: value,
    })
  );

  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        const updatedObject = JSON.parse(this.responseText).object;
        const index = allData.findIndex(item => item._id === updatedObject._id);
        if (index !== -1) {
            allData.splice(index, 1);  // ลบข้อมูลเก่าออก
            allData.unshift(updatedObject);  // เพิ่มข้อมูลที่อัปเดตแล้วไว้ด้านบนสุด
        }
        Swal.fire(
            "Good job!",
            "Update EV Data Successfully!",
            "success"
        );
        displayTable();
        loadGraph(allData);
    }
};
}
function showEVDeleteBox(id) {
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      evDelete(id);
    }
  })
}

function evDelete(id) {
  console.log("Delete: ", id);
  const xhttp = new XMLHttpRequest();
  xhttp.open("DELETE", "http://localhost:3000/evlist/delete");
  xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhttp.send(
    JSON.stringify({
      _id: id,
    })
  );
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      const objects = JSON.parse(this.responseText);
      Swal.fire(
        "Deleted!",
        "EV Data has been deleted.",
        "success"
      );
      loadTable();
    }
  };
}

// แก้ไขฟังก์ชัน loadGraph โดยเพิ่มเติมส่วนที่จำเป็นเท่านั้น

// ... (โค้ดอื่นๆ ที่มีอยู่ก่อนหน้านี้)

function loadGraph(objects) {
  if (!objects || objects.length === 0) {
      document.getElementById('piechartTimelyResponse').innerHTML = 'No data to display';
      document.getElementById('barchartSubmitted').innerHTML = 'No data to display';
      return;
  }

  var regionData = {};
  var yearData = {};

  for (let object of objects) {
      if (regionData[object.region]) {
          regionData[object.region]++;
      } else {
          regionData[object.region] = 1;
      }

      if (yearData[object.year]) {
          yearData[object.year]++;
      } else {
          yearData[object.year] = 1;
      }
  }

  var regionChartData = [['region', 'count']];
  for (let region in regionData) {
      regionChartData.push([region, regionData[region]]);
  }

  var yearChartData = [['year', 'count', { role: 'style' }]];
  for (let year in yearData) {
      yearChartData.push([year.toString(), yearData[year], document.body.classList.contains('dark-mode') ? 'color: #4CAF50' : 'color: #76A7FA']);
  }

  var isDarkMode = document.body.classList.contains('dark-mode');
  var textColor = isDarkMode ? '#ffffff' : '#000000';
  var backgroundColor = isDarkMode ? '#333333' : '#ffffff';

  var commonOptions = {
      backgroundColor: { fill: backgroundColor },
      titleTextStyle: { color: textColor },
      legend: { textStyle: { color: textColor } },
      width: 600,
      height: 400
  };

  var regionChart = new google.visualization.PieChart(document.getElementById('piechartTimelyResponse'));
  regionChart.draw(google.visualization.arrayToDataTable(regionChartData), {
      ...commonOptions,
      title: 'EV Data by Region',
      pieSliceTextStyle: { color: '#000000' }
  });

  var yearChart = new google.visualization.ColumnChart(document.getElementById('barchartSubmitted'));
  yearChart.draw(google.visualization.arrayToDataTable(yearChartData), {
      ...commonOptions,
      title: 'EV Data by Year',
      legend: { position: 'none' },
      vAxis: { textStyle: { color: textColor }, gridlines: { color: isDarkMode ? '#555555' : '#e0e0e0' } },
      hAxis: { textStyle: { color: textColor } },
      chartArea: { backgroundColor: backgroundColor }
  });

  // เพิ่ม event listeners สำหรับพื้นที่กราฟทั้งหมด
  document.getElementById('piechartTimelyResponse').addEventListener('click', function() {
      openModal(regionChart, regionChartData, 'EV Data by Region', 'PieChart');
  });

  document.getElementById('barchartSubmitted').addEventListener('click', function() {
      openModal(yearChart, yearChartData, 'EV Data by Year', 'ColumnChart');
  });
}

function openModal(chart, data, title, chartType) {
  var modal = document.getElementById('graphModal');
  var modalGraph = document.getElementById('modalGraph');
  modal.style.display = "block";
  modal.classList.add('fade-in');

  var isDarkMode = document.body.classList.contains('dark-mode');
  var textColor = isDarkMode ? '#ffffff' : '#000000';
  var backgroundColor = isDarkMode ? '#333333' : '#ffffff';

  var options = {
    title: title,
    width: '100%',
    height: '100%',
    backgroundColor: { fill: backgroundColor },
    titleTextStyle: { color: textColor },
    legend: { textStyle: { color: textColor } },
    animation: {
      startup: true,
      duration: 1000,
      easing: 'out',
    },
  };

  if (chartType === 'ColumnChart') {
    options.legend = { position: 'none' };
    options.vAxis = { textStyle: { color: textColor }, gridlines: { color: isDarkMode ? '#555555' : '#e0e0e0' } };
    options.hAxis = { textStyle: { color: textColor } };
    options.chartArea = { backgroundColor: backgroundColor };
  } else if (chartType === 'PieChart') {
    options.pieSliceTextStyle = { color: '#000000' };
    options.slices = {
      0: { offset: 0.2 },
      1: { offset: 0.1 },
      2: { offset: 0.1 },
      3: { offset: 0.1 }
    };
  }

  var modalChart;
  if (chartType === 'PieChart') {
    modalChart = new google.visualization.PieChart(modalGraph);
  } else {
    modalChart = new google.visualization.ColumnChart(modalGraph);
  }

  modalChart.draw(google.visualization.arrayToDataTable(data), options);
  // ... (โค้ดส่วนอื่นๆ คงเดิม)


  // Add rotation animation for PieChart
  if (chartType === 'PieChart') {
      let rotation = 0;
      const animate = () => {
          rotation += 2;
          options.pieStartAngle = rotation;
          modalChart.draw(google.visualization.arrayToDataTable(data), options);
          if (rotation < 360) {
              requestAnimationFrame(animate);
          }
      };
      animate();
  }
}
function closeModal() {
    var modal = document.getElementById('graphModal');
    modal.classList.remove('fade-in');
    modal.classList.add('fade-out');
    setTimeout(function() {
        modal.style.display = "none";
        modal.classList.remove('fade-out');
    }, 300);
}

// เพิ่ม event listeners สำหรับการปิด modal
document.addEventListener('DOMContentLoaded', function() {
    var modal = document.getElementById('graphModal');
    var span = document.getElementsByClassName("close")[0];

    // เมื่อคลิกที่ปุ่ม close (x)
    span.onclick = closeModal;

    // เมื่อคลิกที่พื้นที่นอก modal
    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    }
});

document.getElementById('toggleDarkMode').addEventListener('click', function () {
    document.body.classList.toggle('dark-mode');

    // Save the mode in localStorage
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
    loadGraph(allData);
});


// Load the theme from localStorage on page load
window.onload = function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
};
// ตรวจสอบว่าเบราว์เซอร์รองรับ Web Speech API หรือไม่
// ตรวจสอบว่าเบราว์เซอร์รองรับ Web Speech API หรือไม่
if ('webkitSpeechRecognition' in window) {
  const recognition = new webkitSpeechRecognition();
  let isListening = false; // ตรวจสอบสถานะการฟัง
  recognition.continuous = false; // ฟังแค่คำเดียว
  recognition.interimResults = false; // ใช้เฉพาะผลลัพธ์ที่สมบูรณ์แล้ว
  recognition.lang = 'en-US'; // 

  // เมื่อกดปุ่มเริ่ม/หยุดการค้นหาด้วยเสียง
  document.getElementById('voiceSearchButton').addEventListener('click', function() {
      if (!isListening) {
          recognition.start();
          isListening = true;
          this.classList.add('active'); // เปลี่ยนสีปุ่มเมื่อฟังอยู่
      } else {
          recognition.stop();
          isListening = false;
          this.classList.remove('active'); // เปลี่ยนสีปุ่มเมื่อหยุดฟัง
      }
  });

  // เมื่อได้รับผลลัพธ์จากการฟัง
  recognition.onresult = function(event) {
      let query = event.results[0][0].transcript;
      
      query = query.replace(/\bcomma\b/g, ',');

      // ลบจุดที่ปลายข้อความ ถ้ามี
      query = query.replace(/\.$/, ''); 
      
      document.getElementById('searchQuery').value = query; // ใส่ข้อความในช่องค้นหา
      loadQueryTable(); // เรียกใช้ฟังก์ชันค้นหาข้อมูล
      isListening = false;
      document.getElementById('voiceSearchButton').classList.remove('active');
  };

  // เมื่อเกิดข้อผิดพลาด
  recognition.onerror = function(event) {
      alert('การจดจำเสียงล้มเหลว: ' + event.error);
      isListening = false;
      document.getElementById('voiceSearchButton').classList.remove('active');
  };



} else {
  alert('เบราว์เซอร์ของคุณไม่รองรับการค้นหาด้วยเสียง');
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  
  const isDarkMode = document.body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

  // Update toggle switch state
  const toggleSwitch = document.getElementById('darkModeToggle');
  if (toggleSwitch) {
      toggleSwitch.checked = isDarkMode;
  }

  // Update chart colors
  updateChartColors(isDarkMode);

  // Redraw charts if they exist
  if (typeof google !== 'undefined' && google.charts) {
      if (window.regionChart && window.regionChartData) {
          drawRegionChart();
      }
      if (window.yearChart && window.yearChartData) {
          drawYearChart();
      }
  }
}

function updateChartColors(isDarkMode) {
  const backgroundColor = isDarkMode ? '#2d2d2d' : '#ffffff';
  const textColor = isDarkMode ? '#e0e0e0' : '#000000';
  const gridColor = isDarkMode ? '#444444' : '#e0e0e0';

  window.chartColors = {
      backgroundColor: backgroundColor,
      textColor: textColor,
      gridColor: gridColor,
      // Add more color definitions as needed
  };
}

function drawRegionChart() {
  if (!window.regionChart || !window.regionChartData) return;

  const options = {
      title: 'EV Data by Region',
      backgroundColor: window.chartColors.backgroundColor,
      titleTextStyle: { color: window.chartColors.textColor },
      legend: { textStyle: { color: window.chartColors.textColor } },
      pieSliceTextStyle: { color: '#000000' }, // Keep slice text dark for contrast
      slices: {
          0: { offset: 0.2 },
          1: { offset: 0.1 },
          2: { offset: 0.1 },
          3: { offset: 0.1 }
      },
      // Add more options as needed
  };

  window.regionChart.draw(google.visualization.arrayToDataTable(window.regionChartData), options);
}

function drawYearChart() {
  if (!window.yearChart || !window.yearChartData) return;

  const options = {
      title: 'EV Data by Year',
      backgroundColor: window.chartColors.backgroundColor,
      titleTextStyle: { color: window.chartColors.textColor },
      legend: { position: 'none' },
      vAxis: { 
          textStyle: { color: window.chartColors.textColor },
          gridlines: { color: window.chartColors.gridColor }
      },
      hAxis: { textStyle: { color: window.chartColors.textColor } },
      // Add more options as needed
  };

  window.yearChart.draw(google.visualization.arrayToDataTable(window.yearChartData), options);
}

// Initialize dark mode on page load
window.addEventListener('DOMContentLoaded', (event) => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
      const toggleSwitch = document.getElementById('darkModeToggle');
      if (toggleSwitch) {
          toggleSwitch.checked = true;
      }
  }
  updateChartColors(savedTheme === 'dark');
});

// Redraw charts when window is resized
window.addEventListener('resize', () => {
  if (typeof google !== 'undefined' && google.charts) {
      drawRegionChart();
      drawYearChart();
  }
});
document.querySelector('.scroll-to-top').addEventListener('click', function() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
document.addEventListener('scroll', function() {
  const rows = document.querySelectorAll('.table-row');
  const windowHeight = window.innerHeight;

  rows.forEach(row => {
    const rect = row.getBoundingClientRect();
    if (rect.top < windowHeight && rect.bottom > 0) {
      row.classList.add('visible');
    } else {
      row.classList.remove('visible');
    }
  });
});
document.querySelector('.scroll-to-top').addEventListener('click', function() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
document.querySelector('.scroll-to-top').addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ตัวอย่างการซ่อน/แสดงปุ่ม scroll เมื่อเลื่อนหน้าลง
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
        scrollButton.style.display = 'flex'; // แสดงปุ่ม
    } else {
        scrollButton.style.display = 'none'; // ซ่อนปุ่ม
    }
});
document.querySelector('.scroll-to-bottom').addEventListener('click', function() {
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
});
window.addEventListener('scroll', function() {
  const scrollToTopButton = document.querySelector('.scroll-to-top');
  const scrollToBottomButton = document.querySelector('.scroll-to-bottom');
  
  // แสดง/ซ่อนปุ่มเลื่อนขึ้น
  if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
      scrollToTopButton.style.display = 'flex'; // แสดงปุ่ม
  } else {
      scrollToTopButton.style.display = 'none'; // ซ่อนปุ่ม
  }

  // แสดง/ซ่อนปุ่มเลื่อนลง
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
      scrollToBottomButton.style.display = 'none'; // ซ่อนปุ่มเมื่ออยู่ที่ด้านล่าง
  } else {
      scrollToBottomButton.style.display = 'flex'; // แสดงปุ่ม
  }
});

const mapDataAggregated = [
  { region: "Afghanistan", value: 3000, year: 2024 },
  { region: "Albania", value: 15000, year: 2024 },
  { region: "Algeria", value: 8000, year: 2024 },
  { region: "Andorra", value: 500, year: 2024 },
  { region: "Angola", value: 2000, year: 2024 },
  { region: "Antigua and Barbuda", value: 600, year: 2024 },
  { region: "Argentina", value: 30000, year: 2024 },
  { region: "Armenia", value: 7000, year: 2024 },
  { region: "Australia", value: 50000, year: 2024 },
  { region: "Austria", value: 25000, year: 2024 },
  { region: "Azerbaijan", value: 5000, year: 2024 },
  { region: "Bahamas", value: 800, year: 2024 },
  { region: "Bahrain", value: 3000, year: 2024 },
  { region: "Bangladesh", value: 12000, year: 2024 },
  { region: "Barbados", value: 700, year: 2024 },
  { region: "Belarus", value: 10000, year: 2024 },
  { region: "Belgium", value: 35000, year: 2024 },
  { region: "Belize", value: 400, year: 2024 },
  { region: "Benin", value: 1000, year: 2024 },
  { region: "Bhutan", value: 500, year: 2024 },
  { region: "Bolivia", value: 5000, year: 2024 },
  { region: "Bosnia and Herzegovina", value: 4000, year: 2024 },
  { region: "Botswana", value: 1500, year: 2024 },
  { region: "Brazil", value: 70000, year: 2024 },
  { region: "Brunei", value: 1200, year: 2024 },
  { region: "Bulgaria", value: 8000, year: 2024 },
  { region: "Burkina Faso", value: 500, year: 2024 },
  { region: "Burundi", value: 300, year: 2024 },
  { region: "Cabo Verde", value: 400, year: 2024 },
  { region: "Cambodia", value: 3500, year: 2024 },
  { region: "Cameroon", value: 2000, year: 2024 },
  { region: "Canada", value: 60000, year: 2024 },
  { region: "Central African Republic", value: 200, year: 2024 },
  { region: "Chad", value: 1000, year: 2024 },
  { region: "Chile", value: 12000, year: 2024 },
  { region: "China", value: 150000, year: 2024 },
  { region: "Colombia", value: 10000, year: 2024 },
  { region: "Comoros", value: 100, year: 2024 },
  { region: "Congo, Democratic Republic of the", value: 5000, year: 2024 },
  { region: "Congo, Republic of the", value: 1500, year: 2024 },
  { region: "Costa Rica", value: 2000, year: 2024 },
  { region: "Croatia", value: 7000, year: 2024 },
  { region: "Cuba", value: 6000, year: 2024 },
  { region: "Cyprus", value: 3000, year: 2024 },
  { region: "Czech Republic", value: 10000, year: 2024 },
  { region: "Denmark", value: 20000, year: 2024 },
  { region: "Djibouti", value: 300, year: 2024 },
  { region: "Dominica", value: 100, year: 2024 },
  { region: "Dominican Republic", value: 4000, year: 2024 },
  { region: "East Timor", value: 500, year: 2024 },
  { region: "Ecuador", value: 3000, year: 2024 },
  { region: "Egypt", value: 15000, year: 2024 },
  { region: "El Salvador", value: 2000, year: 2024 },
  { region: "Equatorial Guinea", value: 500, year: 2024 },
  { region: "Eritrea", value: 400, year: 2024 },
  { region: "Estonia", value: 2500, year: 2024 },
  { region: "Eswatini", value: 800, year: 2024 },
  { region: "Ethiopia", value: 6000, year: 2024 },
  { region: "Fiji", value: 500, year: 2024 },
  { region: "Finland", value: 20000, year: 2024 },
  { region: "France", value: 100000, year: 2024 },
  { region: "Gabon", value: 800, year: 2024 },
  { region: "Gambia", value: 200, year: 2024 },
  { region: "Georgia", value: 1500, year: 2024 },
  { region: "Germany", value: 120000, year: 2024 },
  { region: "Ghana", value: 4000, year: 2024 },
  { region: "Greece", value: 15000, year: 2024 },
  { region: "Grenada", value: 100, year: 2024 },
  { region: "Guatemala", value: 3000, year: 2024 },
  { region: "Guinea", value: 500, year: 2024 },
  { region: "Guinea-Bissau", value: 200, year: 2024 },
  { region: "Guyana", value: 500, year: 2024 },
  { region: "Haiti", value: 1000, year: 2024 },
  { region: "Honduras", value: 2000, year: 2024 },
  { region: "Hungary", value: 8000, year: 2024 },
  { region: "Iceland", value: 1200, year: 2024 },
  { region: "India", value: 60000, year: 2024 },
  { region: "Indonesia", value: 15000, year: 2024 },
  { region: "Iran", value: 20000, year: 2024 },
  { region: "Iraq", value: 8000, year: 2024 },
  { region: "Ireland", value: 5000, year: 2024 },
  { region: "Israel", value: 10000, year: 2024 },
  { region: "Italy", value: 50000, year: 2024 },
  { region: "Jamaica", value: 1000, year: 2024 },
  { region: "Japan", value: 80000, year: 2024 },
  { region: "Jordan", value: 3000, year: 2024 },
  { region: "Kazakhstan", value: 5000, year: 2024 },
  { region: "Kenya", value: 5000, year: 2024 },
  { region: "Kiribati", value: 100, year: 2024 },
  { region: "Korea, North", value: 5000, year: 2024 },
  { region: "Korea, South", value: 30000, year: 2024 },
  { region: "Kosovo", value: 700, year: 2024 },
  { region: "Kuwait", value: 8000, year: 2024 },
  { region: "Laos", value: 1000, year: 2024 },
  { region: "Latvia", value: 1500, year: 2024 },
  { region: "Lebanon", value: 4000, year: 2024 },
  { region: "Lesotho", value: 600, year: 2024 },
  { region: "Liberia", value: 200, year: 2024 },
  { region: "Libya", value: 1000, year: 2024 },
  { region: "Liechtenstein", value: 300, year: 2024 },
  { region: "Lithuania", value: 2500, year: 2024 },
  { region: "Luxembourg", value: 2000, year: 2024 },
  { region: "Madagascar", value: 800, year: 2024 },
  { region: "Malawi", value: 500, year: 2024 },
  { region: "Malaysia", value: 10000, year: 2024 },
  { region: "Maldives", value: 500, year: 2024 },
  { region: "Mali", value: 1000, year: 2024 },
  { region: "Malta", value: 1200, year: 2024 },
  { region: "Marshall Islands", value: 100, year: 2024 },
  { region: "Mauritania", value: 300, year: 2024 },
  { region: "Mauritius", value: 800, year: 2024 },
  { region: "Mexico", value: 25000, year: 2024 },
  { region: "Micronesia", value: 100, year: 2024 },
  { region: "Moldova", value: 1000, year: 2024 },
  { region: "Monaco", value: 200, year: 2024 },
  { region: "Mongolia", value: 1500, year: 2024 },
  { region: "Montenegro", value: 500, year: 2024 },
  { region: "Morocco", value: 4000, year: 2024 },
  { region: "Mozambique", value: 800, year: 2024 },
  { region: "Myanmar", value: 1000, year: 2024 },
  { region: "Namibia", value: 1000, year: 2024 },
  { region: "Nauru", value: 100, year: 2024 },
  { region: "Nepal", value: 2000, year: 2024 },
  { region: "Netherlands", value: 40000, year: 2024 },
  { region: "New Zealand", value: 6000, year: 2024 },
  { region: "Nicaragua", value: 800, year: 2024 },
  { region: "Niger", value: 500, year: 2024 },
  { region: "Nigeria", value: 12000, year: 2024 },
  { region: "North Macedonia", value: 2000, year: 2024 },
  { region: "Norway", value: 15000, year: 2024 },
  { region: "Oman", value: 1000, year: 2024 },
  { region: "Pakistan", value: 12000, year: 2024 },
  { region: "Palau", value: 100, year: 2024 },
  { region: "Panama", value: 1500, year: 2024 },
  { region: "Papua New Guinea", value: 300, year: 2024 },
  { region: "Paraguay", value: 500, year: 2024 },
  { region: "Peru", value: 6000, year: 2024 },
  { region: "Philippines", value: 15000, year: 2024 },
  { region: "Poland", value: 20000, year: 2024 },
  { region: "Portugal", value: 10000, year: 2024 },
  { region: "Qatar", value: 5000, year: 2024 },
  { region: "Romania", value: 8000, year: 2024 },
  { region: "Russia", value: 60000, year: 2024 },
  { region: "Rwanda", value: 600, year: 2024 },
  { region: "Saint Kitts and Nevis", value: 100, year: 2024 },
  { region: "Saint Lucia", value: 200, year: 2024 },
  { region: "Saint Vincent and the Grenadines", value: 150, year: 2024 },
  { region: "Samoa", value: 100, year: 2024 },
  { region: "San Marino", value: 100, year: 2024 },
  { region: "Sao Tome and Principe", value: 100, year: 2024 },
  { region: "Saudi Arabia", value: 20000, year: 2024 },
  { region: "Senegal", value: 1500, year: 2024 },
  { region: "Serbia", value: 3000, year: 2024 },
  { region: "Seychelles", value: 200, year: 2024 },
  { region: "Sierra Leone", value: 400, year: 2024 },
  { region: "Singapore", value: 12000, year: 2024 },
  { region: "Slovakia", value: 5000, year: 2024 },
  { region: "Slovenia", value: 4000, year: 2024 },
  { region: "Solomon Islands", value: 100, year: 2024 },
  { region: "Somalia", value: 300, year: 2024 },
  { region: "South Africa", value: 25000, year: 2024 },
  { region: "South Sudan", value: 500, year: 2024 },
  { region: "Spain", value: 40000, year: 2024 },
  { region: "Sri Lanka", value: 2000, year: 2024 },
  { region: "Sudan", value: 1500, year: 2024 },
  { region: "Suriname", value: 200, year: 2024 },
  { region: "Sweden", value: 25000, year: 2024 },
  { region: "Switzerland", value: 20000, year: 2024 },
  { region: "Syria", value: 3000, year: 2024 },
  { region: "Taiwan", value: 10000, year: 2024 },
  { region: "Tajikistan", value: 500, year: 2024 },
  { region: "Tanzania", value: 2000, year: 2024 },
  { region: "Thailand", value: 25000, year: 2024 },
  { region: "Togo", value: 500, year: 2024 },
  { region: "Tonga", value: 100, year: 2024 },
  { region: "Trinidad and Tobago", value: 1000, year: 2024 },
  { region: "Tunisia", value: 3000, year: 2024 },
  { region: "Turkey", value: 30000, year: 2024 },
  { region: "Turkmenistan", value: 1000, year: 2024 },
  { region: "Tuvalu", value: 50, year: 2024 },
  { region: "Uganda", value: 1000, year: 2024 },
  { region: "Ukraine", value: 12000, year: 2024 },
  { region: "United Arab Emirates", value: 7000, year: 2024 },
  { region: "United Kingdom", value: 60000, year: 2024 },
  { region: "United States", value: 200000, year: 2024 },
  { region: "Uruguay", value: 1500, year: 2024 },
  { region: "Uzbekistan", value: 2000, year: 2024 },
  { region: "Vanuatu", value: 100, year: 2024 },
  { region: "Venezuela", value: 2000, year: 2024 },
  { region: "Vietnam", value: 8000, year: 2024 },
  { region: "Yemen", value: 500, year: 2024 },
  { region: "Zambia", value: 1000, year: 2024 },
  { region: "Zimbabwe", value: 1500, year: 2024 }
  
];


// Function to filter data based on selected year
function filterDataByYear(selectedYear) {
  return mapDataAggregated.filter(item => item.year === selectedYear);
}

// Function to plot the map
function plotMap(filteredData) {
  const fig = {
      data: [{
          type: 'choropleth',
          locations: filteredData.map(item => item.region),
          z: filteredData.map(item => item.value),
          locationmode: 'country names',
          colorscale: 'Plasma',
          text: filteredData.map(item => item.region),
          hoverinfo: 'location+z',
          colorbar: {
              title: 'EV Sales',
          },
      }],
      layout: {
          title: `EV Sales by Region for ${filteredData[0].year}`,
          geo: {
              projection: { type: 'natural earth' },
              showframe: false,
              showcoastlines: false,
          },
      }
  };

  Plotly.newPlot('choropleth-map', fig.data, fig.layout);
}



// Initial plot for the default year (2024)
document.addEventListener('DOMContentLoaded', function () {
  const defaultYear = 2024;
  const filteredData = filterDataByYear(defaultYear);
  plotMap(filteredData);
});
document.getElementById('darkModeToggle').addEventListener('change', function() {
  if (this.checked) {
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
  }
  
  // Redraw charts if they exist
  if (typeof google !== 'undefined' && google.charts) {
    if (window.regionChart && window.regionChartData) {
      drawRegionChart();
    }
    if (window.yearChart && window.yearChartData) {
      drawYearChart();
    }
  }
});

// Check for saved theme preference or respect OS theme setting
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
const savedTheme = localStorage.getItem('theme');

if (savedTheme === "dark" || (savedTheme === null && prefersDarkScheme.matches)) {
  document.body.classList.add("dark-mode");
  document.getElementById('darkModeToggle').checked = true;
} else {
  document.body.classList.remove("dark-mode");
  document.getElementById('darkModeToggle').checked = false;
}
document.addEventListener('scroll', function() {
  const rows = document.querySelectorAll('.table-row');
  const windowHeight = window.innerHeight;

  rows.forEach((row, index) => {
    const rect = row.getBoundingClientRect();

    // ตรวจสอบว่าแถวอยู่ใน viewport หรือไม่
    if (rect.top < windowHeight && rect.bottom > 0) {
      // เพิ่ม delay ในการแสดงแถวทีละแถว
      setTimeout(() => {
        row.classList.add('visible');
      }, index * 200); // Delay 200ms ต่อแถว
    }
  });
});

document.getElementById('yourModalId').addEventListener('show', function () {
  document.body.classList.add('modal-open');
});

document.getElementById('yourModalId').addEventListener('hide', function () {
  document.body.classList.remove('modal-open');
});

window.regionChart = // your region chart instance
window.regionChartData = // your region chart data
window.yearChart = // your year chart instance
window.yearChartData = // your year chart data
window.onload = loadTable;
