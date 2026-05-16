const maintenanceForm = document.getElementById("maintenanceForm");
const resultGrid = document.getElementById("resultGrid");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const motorInfo = document.getElementById("motorInfo");

const totalItemEl = document.getElementById("totalItem");
const totalAmanEl = document.getElementById("totalAman");
const totalSegeraEl = document.getElementById("totalSegera");
const totalWajibEl = document.getElementById("totalWajib");

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

const STORAGE_KEY = "motocare_history";
const jenisMotorInput = document.getElementById("jenisMotor");

const fieldMatic = document.querySelectorAll(".field-matic");
const fieldRantai = document.querySelectorAll(".field-rantai");

const kmCvtInput = document.getElementById("kmCvt");
const kmOliGardanInput = document.getElementById("kmOliGardan");
const kmRantaiInput = document.getElementById("kmRantai");

// Menampilkan field sesuai jenis motor
function toggleMaintenanceFields() {
  const jenisMotor = jenisMotorInput.value;

  if (jenisMotor === "Matic") {
    fieldMatic.forEach((field) => field.classList.remove("hidden-field"));
    fieldRantai.forEach((field) => field.classList.add("hidden-field"));

    kmCvtInput.required = true;
    kmOliGardanInput.required = true;
    kmRantaiInput.required = false;

    kmRantaiInput.value = "";
  } else if (jenisMotor === "Bebek" || jenisMotor === "Sport") {
    fieldMatic.forEach((field) => field.classList.add("hidden-field"));
    fieldRantai.forEach((field) => field.classList.remove("hidden-field"));

    kmCvtInput.required = false;
    kmOliGardanInput.required = false;
    kmRantaiInput.required = true;

    kmCvtInput.value = "";
    kmOliGardanInput.value = "";
  } else {
    fieldMatic.forEach((field) => field.classList.add("hidden-field"));
    fieldRantai.forEach((field) => field.classList.add("hidden-field"));

    kmCvtInput.required = false;
    kmOliGardanInput.required = false;
    kmRantaiInput.required = false;
  }
}

jenisMotorInput.addEventListener("change", toggleMaintenanceFields);
toggleMaintenanceFields();
// Toggle menu untuk tampilan mobile
menuToggle.addEventListener("click", () => {
  navMenu.classList.toggle("active");
});

// Tutup menu saat link diklik
document.querySelectorAll(".nav-menu a").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("active");
  });
});

// Ambil angka dari input
function getNumberValue(id) {
  return Number(document.getElementById(id).value);
}

// Menentukan status berdasarkan jarak kilometer sejak perawatan terakhir
function calculateStatus(kmNow, lastKm, interval) {
  const usedKm = kmNow - lastKm;
  const remainingKm = interval - usedKm;
  const percentage = Math.min(Math.max((usedKm / interval) * 100, 0), 100);

  let status = "Aman";
  let statusClass = "safe";
  let message = `Masih aman. Sisa sekitar ${remainingKm} km lagi.`;

  if (usedKm >= interval) {
    status = "Wajib Service";
    statusClass = "danger";
    message = `Sudah melewati batas sekitar ${Math.abs(remainingKm)} km. Segera lakukan service.`;
  } else if (usedKm >= interval * 0.8) {
    status = "Segera Service";
    statusClass = "warning";
    message = `Sudah mendekati jadwal service. Sisa sekitar ${remainingKm} km lagi.`;
  }

  return {
    usedKm,
    remainingKm,
    percentage,
    status,
    statusClass,
    message,
  };
}

// Membuat data item perawatan berdasarkan jenis motor
function createMaintenanceItems(data) {
  const items = [
    {
      name: "Ganti Oli Mesin",
      interval: 2000,
      lastKm: data.kmOli,
      description: "Disarankan setiap 2.000 km agar mesin tetap halus dan terlindungi.",
      icon: "🛢️",
    },
    {
      name: "Service Karbu / Throttle Body",
      interval: 5000,
      lastKm: data.kmKarbu,
      description: "Membersihkan saluran udara dan bahan bakar agar tarikan tetap responsif.",
      icon: "🔧",
    },
    {
      name: "Ganti Busi",
      interval: 8000,
      lastKm: data.kmBusi,
      description: "Busi yang baik membantu pembakaran mesin lebih optimal.",
      icon: "⚡",
    },
    {
      name: "Cek Kampas Rem",
      interval: 5000,
      lastKm: data.kmRem,
      description: "Pastikan rem tetap pakem dan aman digunakan harian.",
      icon: "🛑",
    },
    {
      name: "Cek Kondisi Ban",
      interval: 5000,
      lastKm: data.kmBan,
      description: "Periksa tekanan angin, alur ban, retak, dan keausan ban.",
      icon: "🛞",
    },
    {
      name: "Cek Aki",
      interval: 5000,
      lastKm: data.kmAki,
      description: "Aki sebaiknya dicek berkala, umumnya sekitar 6 bulan atau 5.000 km.",
      icon: "🔋",
    },
    {
      name: "Cek Filter Udara",
      interval: 4000,
      lastKm: data.kmFilterUdara,
      description: "Filter udara bersih membantu motor lebih irit dan tarikan tidak berat.",
      icon: "🌬️",
    },
  ];

  // Perawatan khusus motor matic
  if (data.jenisMotor === "Matic") {
    items.push(
      {
        name: "Service CVT",
        interval: 8000,
        lastKm: data.kmCvt,
        description: "CVT bersih membuat akselerasi motor matic lebih halus.",
        icon: "⚙️",
      },
      {
        name: "Ganti Oli Gardan",
        interval: 8000,
        lastKm: data.kmOliGardan,
        description: "Oli gardan menjaga komponen transmisi matic tetap awet.",
        icon: "🧴",
      }
    );
  }

  // Perawatan khusus motor bebek dan sport
  if (data.jenisMotor === "Bebek" || data.jenisMotor === "Sport") {
    items.push({
      name: "Cek Rantai",
      interval: 1000,
      lastKm: data.kmRantai,
      description: "Rantai perlu dicek, dibersihkan, dan dilumasi secara rutin.",
      icon: "⛓️",
    });
  }

  return items;
}

// Membuat card hasil rekomendasi
function renderResultCards(results) {
  resultGrid.innerHTML = "";

  results.forEach((item) => {
    const card = document.createElement("article");
    card.className = "result-card";

    card.innerHTML = `
      <span class="status ${item.statusClass}">${item.status}</span>
      <h3>${item.icon} ${item.name}</h3>
      <p>${item.description}</p>
      <p><strong>Interval:</strong> setiap ${item.interval.toLocaleString("id-ID")} km</p>
      <p><strong>Sudah berjalan:</strong> ${item.usedKm.toLocaleString("id-ID")} km</p>
      <p>${item.message}</p>

      <div class="progress-bar">
        <div 
          class="progress-fill ${item.statusClass}" 
          style="width: ${item.percentage}%">
        </div>
      </div>
    `;

    resultGrid.appendChild(card);
  });
}

// Update dashboard ringkasan
function updateSummary(results) {
  const totalAman = results.filter((item) => item.status === "Aman").length;
  const totalSegera = results.filter((item) => item.status === "Segera Service").length;
  const totalWajib = results.filter((item) => item.status === "Wajib Service").length;

  totalItemEl.textContent = results.length;
  totalAmanEl.textContent = totalAman;
  totalSegeraEl.textContent = totalSegera;
  totalWajibEl.textContent = totalWajib;

  return {
    totalItem: results.length,
    totalAman,
    totalSegera,
    totalWajib,
  };
}

// Simpan riwayat ke localStorage
function saveHistory(data, summary) {
  const histories = getHistories();

  const newHistory = {
    id: Date.now(),
    date: new Date().toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }),
    motorName: data.namaMotor,
    motorType: data.jenisMotor,
    currentKm: data.kmSekarang,
    summary,
  };

  histories.unshift(newHistory);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(histories));
  renderHistory();
}

// Ambil data riwayat dari localStorage
function getHistories() {
  const histories = localStorage.getItem(STORAGE_KEY);
  return histories ? JSON.parse(histories) : [];
}

// Tampilkan riwayat pengecekan
function renderHistory() {
  const histories = getHistories();

  if (histories.length === 0) {
    historyList.innerHTML = `
      <div class="empty-state">
        <p>Belum ada riwayat pengecekan.</p>
      </div>
    `;
    return;
  }

  historyList.innerHTML = "";

  histories.forEach((history) => {
    const card = document.createElement("article");
    card.className = "history-card";

    card.innerHTML = `
      <div class="history-card-top">
        <div>
          <h3>${history.motorName}</h3>
          <p>${history.motorType} • ${Number(history.currentKm).toLocaleString("id-ID")} km</p>
        </div>
        <p>${history.date}</p>
      </div>

      <div class="history-badges">
        <span class="history-badge safe">Aman: ${history.summary.totalAman}</span>
        <span class="history-badge warning">Segera: ${history.summary.totalSegera}</span>
        <span class="history-badge danger">Wajib: ${history.summary.totalWajib}</span>
      </div>
    `;

    historyList.appendChild(card);
  });
}

// Validasi agar kilometer terakhir tidak lebih besar dari kilometer saat ini
function validateKilometers(data) {
  let kmFields = [
    data.kmOli,
    data.kmKarbu,
    data.kmBusi,
    data.kmRem,
    data.kmBan,
    data.kmAki,
    data.kmFilterUdara,
  ];

  if (data.jenisMotor === "Matic") {
    kmFields.push(data.kmCvt, data.kmOliGardan);
  }

  if (data.jenisMotor === "Bebek" || data.jenisMotor === "Sport") {
    kmFields.push(data.kmRantai);
  }

  return kmFields.every((km) => km <= data.kmSekarang);
}

// Event submit form
maintenanceForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = {
    namaMotor: document.getElementById("namaMotor").value.trim(),
    jenisMotor: document.getElementById("jenisMotor").value,
    kmSekarang: getNumberValue("kmSekarang"),
    kmOli: getNumberValue("kmOli"),
    kmKarbu: getNumberValue("kmKarbu"),
    kmCvt: getNumberValue("kmCvt"),
    kmBusi: getNumberValue("kmBusi"),
    kmRem: getNumberValue("kmRem"),
    kmBan: getNumberValue("kmBan"),
    kmAki: getNumberValue("kmAki"),
    kmOliGardan: getNumberValue("kmOliGardan"),
    kmFilterUdara: getNumberValue("kmFilterUdara"),
    kmRantai: getNumberValue("kmRantai"),
  };

  if (!validateKilometers(data)) {
    alert("Kilometer terakhir service tidak boleh lebih besar dari kilometer motor saat ini.");
    return;
  }

  const maintenanceItems = createMaintenanceItems(data);

  const results = maintenanceItems.map((item) => {
    const calculated = calculateStatus(data.kmSekarang, item.lastKm, item.interval);

    return {
      ...item,
      ...calculated,
    };
  });

  renderResultCards(results);

  const summary = updateSummary(results);

  motorInfo.textContent = `Hasil pengecekan untuk ${data.namaMotor} tipe ${data.jenisMotor} dengan kilometer saat ini ${data.kmSekarang.toLocaleString("id-ID")} km.`;

  saveHistory(data, summary);

  document.getElementById("hasilSection").scrollIntoView({
    behavior: "smooth",
  });
});

// Hapus seluruh riwayat
clearHistoryBtn.addEventListener("click", () => {
  const confirmDelete = confirm("Yakin ingin menghapus semua riwayat maintenance?");

  if (!confirmDelete) return;

  localStorage.removeItem(STORAGE_KEY);
  renderHistory();
});

// Jalankan saat halaman pertama kali dibuka
renderHistory();