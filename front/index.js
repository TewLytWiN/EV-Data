google.charts.load("current", {
  packages: ["corechart", "bar"],
});
google.charts.setOnLoadCallback(loadTable);

let currentPage = 1;
const itemsPerPage = 100;
let totalItems = 0;
let allData = [];

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
      yearChartData.push([year.toString(), yearData[year], 'color: #76A7FA']);
  }

  var regionChart = new google.visualization.PieChart(document.getElementById('piechartTimelyResponse'));
  regionChart.draw(google.visualization.arrayToDataTable(regionChartData), {
      title: 'EV Data by Region',
      width: 600,
      height: 400,
      backgroundColor: { fill:'transparent' }
  });

  var yearChart = new google.visualization.ColumnChart(document.getElementById('barchartSubmitted'));
  yearChart.draw(google.visualization.arrayToDataTable(yearChartData), {
      title: 'EV Data by Year',
      legend: { position: 'none' },
      width: 600,
      height: 400,
      backgroundColor: { fill:'transparent' }
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
  setTimeout(() => {
      modal.classList.add('fade-in');
  }, 10);
  
  var options = {
      title: title,
      width: '100%',
      height: '100%',
      animation: {
          startup: true,
          duration: 1000,
          easing: 'out',
      },
  };

  if (chartType === 'ColumnChart') {
      options.legend = { position: 'none' };
      options.animation = {
          startup: true,
          duration: 1000,
          easing: 'out',
      };
  } else if (chartType === 'PieChart') {
      options.pieSliceText = 'percentage';
      options.slices = {
          0: { offset: 0.2 },
          1: { offset: 0.1 },
          2: { offset: 0.1 },
          3: { offset: 0.1 }
      };
      options.animation = {
          startup: true,
          duration: 1000,
          easing: 'out',
      };
  }

  var modalChart;
  if (chartType === 'PieChart') {
      modalChart = new google.visualization.PieChart(modalGraph);
  } else {
      modalChart = new google.visualization.ColumnChart(modalGraph);
  }

  modalChart.draw(google.visualization.arrayToDataTable(data), options);

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

window.onload = loadTable;