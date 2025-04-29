// إخفاء شاشة الترحيب وإظهار التطبيق
document.getElementById('startButton').addEventListener('click', () => {
  document.getElementById('welcome-screen').style.display = 'none';
  document.getElementById('main-content').style.display = 'block';
});

// التعامل مع تغيير طريقة التحديد (AI أو يدوي)
document.getElementById('detectionMethod').addEventListener('change', (e) => {
  const method = e.target.value;
  const manualSection = document.getElementById('manualDrawingSection');
  if (method === 'manual') {
    manualSection.style.display = 'block';
  } else {
    manualSection.style.display = 'none';
  }
});

// إظهار خانة الكثافة المخصصة
document.getElementById('oilType').addEventListener('change', (e) => {
  const customContainer = document.getElementById('customDensityContainer');
  customContainer.style.display = e.target.value === 'custom' ? 'block' : 'none';
});

// إظهار خانة عدد النقاط المخصص
document.getElementById('depthOption').addEventListener('change', (e) => {
  const customDepth = document.getElementById('customDepthValue');
  customDepth.style.display = e.target.value === 'custom' ? 'block' : 'none';
});

// قراءة ملف الإكسل
document.getElementById('excelUpload').addEventListener('change', (e) => {
  const file = e.target.files[0];
  document.getElementById('excelFileName').textContent = file.name;

  const reader = new FileReader();
  reader.onload = (event) => {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const values = XLSX.utils.sheet_to_json(sheet, { header: 1 }).flat().filter(x => typeof x === 'number');
    document.getElementById('depths').value = values.join(', ');
  };
  reader.readAsArrayBuffer(file);
});

// الرسم اليدوي على الكانفس
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;

canvas.addEventListener('pointerdown', (e) => {
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener('pointermove', (e) => {
  if (isDrawing) {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = '#003366';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
});

canvas.addEventListener('pointerup', () => {
  isDrawing = false;
});

// الحساب الرئيسي
function calculateOilMass() {
  const depthsInput = document.getElementById('depths').value;
  const depthValues = depthsInput.split(',').map(v => parseFloat(v)).filter(v => !isNaN(v));
  if (depthValues.length === 0) {
    alert('الرجاء إدخال قيم عمق صحيحة.');
    return;
  }

  const averageDepth = depthValues.reduce((a, b) => a + b, 0) / depthValues.length;

  const height = parseFloat(document.getElementById('droneHeight').value);
  const fov = parseFloat(document.getElementById('cameraFov').value);

  if (isNaN(height) || isNaN(fov)) {
    alert('الرجاء إدخال بيانات صحيحة للدرون أو الكاميرا.');
    return;
  }

  // زاوية الرؤية بالراديان
  const fovRad = fov * Math.PI / 180;
  // حساب نصف عرض الصورة
  const halfWidth = Math.tan(fovRad / 2) * height;
  const area = Math.PI * halfWidth * halfWidth; // تقريبي كأن الصورة دائرية

  let density = parseFloat(document.getElementById('oilType').value);
  if (isNaN(density)) {
    density = parseFloat(document.getElementById('customDensity').value);
  }

  const volume = area * averageDepth; // m³
  const mass = volume * density; // kg

  document.getElementById('output').innerHTML = `
    🟦 المساحة التقريبية: ${area.toFixed(2)} م²<br>
    📏 متوسط العمق: ${averageDepth.toFixed(2)} م<br>
    🧪 الحجم: ${volume.toFixed(2)} م³<br>
    ⚖️ الكتلة: ${mass.toFixed(2)} كغ
  `;
}

// OpenCV جاهز
function openCvReady() {
  console.log("OpenCV جاهز!");
}
