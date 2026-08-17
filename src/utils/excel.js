import * as XLSX from 'xlsx';

export const exportToExcel = (dataArray, filename = 'Zeytin_Takip_Raporu.xlsx', sheetName = 'Rapor') => {
  if (!dataArray || dataArray.length === 0) {
    alert('Dışa aktarılacak veri bulunamadı.');
    return;
  }
  const worksheet = XLSX.utils.json_to_sheet(dataArray);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
};

export const downloadFile = (content, filename, contentType) => {
  const a = document.createElement('a');
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
};

export const generateHTMLBackup = (appData) => {
  const jsonStr = JSON.stringify(appData, null, 2);
  const dateStr = new Date().toLocaleDateString('tr-TR');
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Zeytin ve Zeytinyağı Takip Veri Yedegi (${dateStr})</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 20px; background: #f4f6f0; color: #1f2937; }
    h1 { color: #283618; border-bottom: 2px solid #606c38; padding-bottom: 10px; }
    pre { background: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #cbd5e1; overflow-x: auto; font-size: 13px; }
    .badge { background: #606c38; color: #fff; padding: 4px 10px; border-radius: 20px; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Zeytin ve Zeytinyağı Takip Sistemi - Otomatik Veri Yedeği</h1>
  <p><span class="badge">Yedeklenme Tarihi: ${dateStr}</span></p>
  <p>Aşağıdaki JSON verisi uygulamanıza tekrar yüklenebilir veya arşiv amaçlı saklanabilir:</p>
  <pre id="json-data">${jsonStr}</pre>
</body>
</html>`;
};
