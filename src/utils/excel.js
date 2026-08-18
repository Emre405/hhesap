import * as XLSX from 'xlsx';
import { formatTL } from './helpers';

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

// Helper: Calculate customer summary and divide into Debtors (Borçlular) & Non-debtors (Borçsuzlar)
export const getCustomerSummary = (appData) => {
  const map = {};

  // Process Zeytin sales
  (appData.oliveSales || []).forEach((sale) => {
    const name = (sale.customerName || '').trim();
    if (!name) return;
    if (!map[name]) {
      map[name] = { name, totalSales: 0, totalPaid: 0, totalRemaining: 0, oliveCount: 0, oilCount: 0 };
    }
    map[name].totalSales += Number(sale.totalPrice) || 0;
    map[name].totalPaid += Number(sale.paidAmount) || 0;
    map[name].totalRemaining += Number(sale.remainingBalance) || 0;
    map[name].oliveCount += 1;
  });

  // Process Zeytinyağı sales
  (appData.oilSales || []).forEach((sale) => {
    const name = (sale.customerName || '').trim();
    if (!name) return;
    if (!map[name]) {
      map[name] = { name, totalSales: 0, totalPaid: 0, totalRemaining: 0, oliveCount: 0, oilCount: 0 };
    }
    map[name].totalSales += Number(sale.totalPrice) || 0;
    map[name].totalPaid += Number(sale.paidAmount) || 0;
    map[name].totalRemaining += Number(sale.remainingBalance) || 0;
    map[name].oilCount += 1;
  });

  const allCustomers = Object.values(map);
  const debtors = allCustomers.filter((c) => c.totalRemaining > 0);
  const nonDebtors = allCustomers.filter((c) => c.totalRemaining <= 0);

  return { debtors, nonDebtors, allCustomers };
};

export const generateTXTBackup = (appData) => {
  const dateStr = new Date().toLocaleString('tr-TR');
  const { debtors, nonDebtors } = getCustomerSummary(appData);

  const totalAssets = (appData.assets || []).reduce((acc, a) => acc + (Number(a.amount) || 0), 0);
  const totalDebts = (appData.debts || []).reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
  const netWorth = totalAssets - totalDebts;

  const totalOliveSales = (appData.oliveSales || []).reduce((acc, s) => acc + (Number(s.totalPrice) || 0), 0);
  const totalOilSales = (appData.oilSales || []).reduce((acc, s) => acc + (Number(s.totalPrice) || 0), 0);
  const totalOilPurchases = (appData.oilPurchases || []).reduce((acc, p) => acc + (Number(p.totalPrice) || 0), 0);

  let txt = `================================================================================
          ZEYTİN VE ZEYTİNYAĞI TAKİP SİSTEMİ - DETAYLI YEDEK RAPORU
Tarih: ${dateStr}
================================================================================

1. GENEL BİLANÇO VE ÖZET:
--------------------------------------------------------------------------------
• Toplam Varlıklar       : ${formatTL(totalAssets)}
• Toplam Genel Borçlar   : ${formatTL(totalDebts)}
• Net Varlık Farkı       : ${formatTL(netWorth)}
• Toplam Zeytin Satışı   : ${formatTL(totalOliveSales)}
• Toplam Yağ Satışı      : ${formatTL(totalOilSales)}
• Toplam Yağ Alımı       : ${formatTL(totalOilPurchases)}

2. MÜŞTERİ CARİ HESAP BAKİYELERİ:
--------------------------------------------------------------------------------
--- 🔴 BORÇLU MÜŞTERİLER (BORCU BULUNANLAR - Toplam ${debtors.length} Müşteri) ---
`;

  if (debtors.length === 0) {
    txt += `(Borçlu müşteri kaydı bulunmamaktadır.)\n`;
  } else {
    debtors.forEach((c, idx) => {
      txt += `${idx + 1}. ${c.name}
   - Toplam Satış Tutarı  : ${formatTL(c.totalSales)}
   - Tahsil Edilen Ödeme : ${formatTL(c.totalPaid)}
   - KALAN NET BORÇ      : ${formatTL(c.totalRemaining)} (Zeytin İşlemi: ${c.oliveCount}, Yağ İşlemi: ${c.oilCount})\n`;
    });
  }

  txt += `\n--- 🟢 BORÇSUZ MÜŞTERİLER (HESABI KAPALI / ÖDENDİ - Toplam ${nonDebtors.length} Müşteri) ---\n`;
  if (nonDebtors.length === 0) {
    txt += `(Borçsuz müşteri kaydı bulunmamaktadır.)\n`;
  } else {
    nonDebtors.forEach((c, idx) => {
      txt += `${idx + 1}. ${c.name}
   - Toplam Satış Tutarı  : ${formatTL(c.totalSales)}
   - Tahsil Edilen Ödeme : ${formatTL(c.totalPaid)}
   - BAKİYE DURUMU       : ÖDENDİ (${formatTL(c.totalRemaining)})\n`;
    });
  }

  txt += `\n3. GEÇMİŞ ZEYTİN SATIŞLARI (${(appData.oliveSales || []).length} Kayıt):
--------------------------------------------------------------------------------\n`;
  (appData.oliveSales || []).forEach((s, idx) => {
    txt += `${idx + 1}. [${s.date}] ${s.customerName} - ${s.calibre} - ${s.quantityKg} kg @ ${formatTL(s.unitPrice)} | Toplam: ${formatTL(s.totalPrice)} | Ödenen: ${formatTL(s.paidAmount)} | Kalan: ${formatTL(s.remainingBalance)}\n`;
  });

  txt += `\n4. GEÇMİŞ ZEYTİNYAĞI SATIŞLARI (${(appData.oilSales || []).length} Kayıt):
--------------------------------------------------------------------------------\n`;
  (appData.oilSales || []).forEach((s, idx) => {
    txt += `${idx + 1}. [${s.date}] ${s.customerName} - ${s.tinType} (${s.tinCount} Adet, ${s.totalLiters} L) | Toplam: ${formatTL(s.totalPrice)} | Ödenen: ${formatTL(s.paidAmount)} | Kalan: ${formatTL(s.remainingBalance)}\n`;
  });

  txt += `\n5. GEÇMİŞ ZEYTİNYAĞI ALIMLARI (${(appData.oilPurchases || []).length} Kayıt):
--------------------------------------------------------------------------------\n`;
  (appData.oilPurchases || []).forEach((p, idx) => {
    txt += `${idx + 1}. [${p.date}] ${p.supplier} - ${p.tinType} (${p.tinCount} Adet, ${p.totalLiters} L) | Toplam: ${formatTL(p.totalPrice)}\n`;
  });

  txt += `\n6. ÖDEME PLANLARI (6 AYLIK VE GEÇMİŞ):
--------------------------------------------------------------------------------\n`;
  (appData.paymentPlan || []).forEach((m) => {
    const totalRec = (m.receivables || []).reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const totalPay = (m.payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const diff = totalRec - totalPay;
    txt += `[AY: ${m.month}] Toplam Alacak: ${formatTL(totalRec)} | Toplam Ödeme: ${formatTL(totalPay)} | Net Fark: ${formatTL(diff)}\n`;
    (m.receivables || []).forEach((r) => {
      txt += `   (+) ${r.title}: ${formatTL(r.amount)}\n`;
    });
    (m.payments || []).forEach((p) => {
      txt += `   (-) ${p.title}: ${formatTL(p.amount)}\n`;
    });
    txt += `\n`;
  });

  txt += `7. GENEL BORÇLAR VE VARLIKLAR:
--------------------------------------------------------------------------------
BORÇLAR (${(appData.debts || []).length} Kayıt):
${(appData.debts || []).map((d) => `- ${d.description} (${d.category}): ${formatTL(d.amount)}`).join('\n')}

VARLIKLAR (${(appData.assets || []).length} Kayıt):
${(appData.assets || []).map((a) => `- ${a.description} (${a.type}): ${formatTL(a.amount)}`).join('\n')}

================================================================================
HAM JSON YEDEK VERİSİ (PROGRAMA GERİ YÜKLEMEK İÇİN SAKLANABİLİR):
================================================================================
${JSON.stringify(appData, null, 2)}
`;

  return txt;
};

const buildHTMLContent = (appData, isPrintPDF = false) => {
  const dateStr = new Date().toLocaleString('tr-TR');
  const { debtors, nonDebtors } = getCustomerSummary(appData);

  const totalAssets = (appData.assets || []).reduce((acc, a) => acc + (Number(a.amount) || 0), 0);
  const totalDebts = (appData.debts || []).reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
  const netWorth = totalAssets - totalDebts;

  const totalOliveSales = (appData.oliveSales || []).reduce((acc, s) => acc + (Number(s.totalPrice) || 0), 0);
  const totalOilSales = (appData.oilSales || []).reduce((acc, s) => acc + (Number(s.totalPrice) || 0), 0);
  const totalOilPurchases = (appData.oilPurchases || []).reduce((acc, p) => acc + (Number(p.totalPrice) || 0), 0);

  const jsonStr = JSON.stringify(appData, null, 2);

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zeytin ve Zeytinyağı Takip - Detaylı Rapor (${dateStr})</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #0f172a; padding: 24px; line-height: 1.5; }
    .container { max-width: 1000px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .header { border-bottom: 3px solid #15803d; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .title { font-size: 24px; font-weight: 800; color: #14532d; }
    .badge { background: #dcfce7; color: #166534; font-weight: 700; padding: 6px 12px; border-radius: 9999px; font-size: 12px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 24px; }
    .card { background: #f1f5f9; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; }
    .card-title { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
    .card-val { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px; }
    .card-val.green { color: #15803d; }
    .card-val.red { color: #b91c1c; }
    
    h2 { font-size: 18px; font-weight: 800; color: #1e293b; margin-top: 28px; margin-bottom: 12px; display: flex; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; }
    h3 { font-size: 14px; font-weight: 700; color: #334155; margin-top: 16px; margin-bottom: 8px; }
    
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
    th { background: #f8fafc; text-align: left; padding: 10px 12px; font-weight: 700; color: #475569; border-bottom: 2px solid #cbd5e1; }
    td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
    tr:nth-child(even) td { background: #fafafa; }
    
    .badge-red { background: #fef2f2; color: #991b1b; font-weight: 700; padding: 3px 8px; border-radius: 6px; font-size: 11px; }
    .badge-green { background: #f0fdf4; color: #166534; font-weight: 700; padding: 3px 8px; border-radius: 6px; font-size: 11px; }
    
    .print-btn { background: #15803d; color: #ffffff; font-weight: 700; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-bottom: 20px; }
    
    @media print {
      body { background: #ffffff; padding: 0; }
      .container { box-shadow: none; padding: 0; width: 100%; max-width: none; }
      .print-btn { display: none; }
      h2 { page-break-after: avoid; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; page-break-after: auto; }
    }
  </style>
</head>
<body>
  <div class="container">
    ${isPrintPDF ? `<button onclick="window.print()" class="print-btn">🖨️ PDF Olarak Yazdır / Kaydet</button>` : ''}
    
    <div class="header">
      <div>
        <h1 class="title">ZEYTİN VE ZEYTİNYAĞI TAKİP SİSTEMİ</h1>
        <p style="font-size: 12px; color: #64748b;">Detaylı Tüm Veri ve Bilanço Yedeği</p>
      </div>
      <span class="badge">Tarih: ${dateStr}</span>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-title">Toplam Varlıklar</div>
        <div class="card-val green">${formatTL(totalAssets)}</div>
      </div>
      <div class="card">
        <div class="card-title">Toplam Borçlar</div>
        <div class="card-val red">${formatTL(totalDebts)}</div>
      </div>
      <div class="card">
        <div class="card-title">Net Varlık Farkı</div>
        <div class="card-val ${netWorth >= 0 ? 'green' : 'red'}">${formatTL(netWorth)}</div>
      </div>
      <div class="card">
        <div class="card-title">Toplam Zeytin Satışı</div>
        <div class="card-val">${formatTL(totalOliveSales)}</div>
      </div>
      <div class="card">
        <div class="card-title">Toplam Yağ Satışı</div>
        <div class="card-val">${formatTL(totalOilSales)}</div>
      </div>
    </div>

    <h2>👥 MÜŞTERİ CARİ HESAP BAKİYELERİ</h2>
    
    <h3 style="color: #991b1b;">🔴 BORÇLU MÜŞTERİLER (${debtors.length} Müşteri)</h3>
    ${debtors.length === 0 ? '<p style="font-size: 13px; color: #64748b; margin-bottom: 16px;">Borçlu müşteri bulunmamaktadır.</p>' : `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Müşteri Adı</th>
          <th>Toplam Satış (TL)</th>
          <th>Tahsil Edilen (TL)</th>
          <th>Kalan Net Borç (TL)</th>
          <th>Durum</th>
        </tr>
      </thead>
      <tbody>
        ${debtors.map((c, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${c.name}</strong></td>
          <td>${formatTL(c.totalSales)}</td>
          <td>${formatTL(c.totalPaid)}</td>
          <td style="color: #b91c1c; font-weight: 800;">${formatTL(c.totalRemaining)}</td>
          <td><span class="badge-red">BORÇLU</span></td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    `}

    <h3 style="color: #166534;">🟢 BORÇSUZ MÜŞTERİLER (${nonDebtors.length} Müşteri)</h3>
    ${nonDebtors.length === 0 ? '<p style="font-size: 13px; color: #64748b; margin-bottom: 16px;">Borçsuz müşteri bulunmamaktadır.</p>' : `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Müşteri Adı</th>
          <th>Toplam Satış (TL)</th>
          <th>Tahsil Edilen (TL)</th>
          <th>Kalan Bakiye (TL)</th>
          <th>Durum</th>
        </tr>
      </thead>
      <tbody>
        ${nonDebtors.map((c, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${c.name}</strong></td>
          <td>${formatTL(c.totalSales)}</td>
          <td>${formatTL(c.totalPaid)}</td>
          <td>${formatTL(c.totalRemaining)}</td>
          <td><span class="badge-green">ÖDENDİ</span></td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    `}

    <h2>🫒 GEÇMİŞ ZEYTİN SATIŞLARI (${(appData.oliveSales || []).length})</h2>
    <table>
      <thead>
        <tr>
          <th>Tarih</th>
          <th>Müşteri</th>
          <th>Kalibre</th>
          <th>Miktar</th>
          <th>Birim Fiyat</th>
          <th>Toplam</th>
          <th>Ödenen</th>
          <th>Kalan</th>
        </tr>
      </thead>
      <tbody>
        ${(appData.oliveSales || []).map(s => `
        <tr>
          <td>${s.date}</td>
          <td><strong>${s.customerName}</strong></td>
          <td>${s.calibre}</td>
          <td>${s.quantityKg} kg</td>
          <td>${formatTL(s.unitPrice)}</td>
          <td><strong>${formatTL(s.totalPrice)}</strong></td>
          <td>${formatTL(s.paidAmount)}</td>
          <td style="color: ${s.remainingBalance > 0 ? '#b91c1c' : '#166534'}; font-weight: 700;">${formatTL(s.remainingBalance)}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>

    <h2>🛢️ GEÇMİŞ ZEYTİNYAĞI SATIŞLARI (${(appData.oilSales || []).length})</h2>
    <table>
      <thead>
        <tr>
          <th>Tarih</th>
          <th>Müşteri</th>
          <th>Teneke Tipi</th>
          <th>Adet</th>
          <th>Litre</th>
          <th>Toplam</th>
          <th>Ödenen</th>
          <th>Kalan</th>
        </tr>
      </thead>
      <tbody>
        ${(appData.oilSales || []).map(s => `
        <tr>
          <td>${s.date}</td>
          <td><strong>${s.customerName}</strong></td>
          <td>${s.tinType}</td>
          <td>${s.tinCount} Adet</td>
          <td>${s.totalLiters} L</td>
          <td><strong>${formatTL(s.totalPrice)}</strong></td>
          <td>${formatTL(s.paidAmount)}</td>
          <td style="color: ${s.remainingBalance > 0 ? '#b91c1c' : '#166534'}; font-weight: 700;">${formatTL(s.remainingBalance)}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>

    <h2>🚚 GEÇMİŞ ZEYTİNYAĞI ALIMLARI (${(appData.oilPurchases || []).length})</h2>
    <table>
      <thead>
        <tr>
          <th>Tarih</th>
          <th>Tedarikçi</th>
          <th>Teneke Tipi</th>
          <th>Adet</th>
          <th>Litre</th>
          <th>Teneke Fiyatı</th>
          <th>Toplam Tutar</th>
        </tr>
      </thead>
      <tbody>
        ${(appData.oilPurchases || []).map(p => `
        <tr>
          <td>${p.date}</td>
          <td><strong>${p.supplier}</strong></td>
          <td>${p.tinType}</td>
          <td>${p.tinCount} Adet</td>
          <td>${p.totalLiters} L</td>
          <td>${formatTL(p.unitPricePerTin)}</td>
          <td><strong>${formatTL(p.totalPrice)}</strong></td>
        </tr>
        `).join('')}
      </tbody>
    </table>

    <h2>🗓️ ÖDEME PLANLARI</h2>
    ${(appData.paymentPlan || []).map(m => {
      const totalRec = (m.receivables || []).reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
      const totalPay = (m.payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const diff = totalRec - totalPay;
      return `
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; font-weight: 800; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px;">
          <span>🗓️ Dönem: ${m.month}</span>
          <span style="color: ${diff >= 0 ? '#166534' : '#b91c1c'};">Net Fark: ${formatTL(diff)}</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px;">
          <div>
            <strong style="color: #166534;">Alacaklar (+)</strong>
            <ul style="padding-left: 16px; margin-top: 4px;">
              ${(m.receivables || []).map(r => `<li>${r.title}: ${formatTL(r.amount)}</li>`).join('')}
            </ul>
          </div>
          <div>
            <strong style="color: #b91c1c;">Ödemeler (-)</strong>
            <ul style="padding-left: 16px; margin-top: 4px;">
              ${(m.payments || []).map(p => `<li>${p.title}: ${formatTL(p.amount)}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
      `;
    }).join('')}

    <h2>🏛️ GENEL BORÇLAR VE VARLIKLAR</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
      <div>
        <h3 style="color: #b91c1c;">Genel Borçlar</h3>
        <table>
          <thead><tr><th>Açıklama</th><th>Kategori</th><th>Tutar</th></tr></thead>
          <tbody>
            ${(appData.debts || []).map(d => `<tr><td>${d.description}</td><td>${d.category}</td><td style="color: #b91c1c; font-weight: 700;">${formatTL(d.amount)}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div>
        <h3 style="color: #166534;">Genel Varlıklar</h3>
        <table>
          <thead><tr><th>Açıklama</th><th>Tür</th><th>Tutar</th></tr></thead>
          <tbody>
            ${(appData.assets || []).map(a => `<tr><td>${a.description}</td><td>${a.type}</td><td style="color: #166534; font-weight: 700;">${formatTL(a.amount)}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

    ${!isPrintPDF ? `
    <details style="margin-top: 32px; background: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 12px;">
      <summary style="cursor: pointer; font-weight: 700;">💾 Ham JSON Yedek Verisi (Sistem Yüklemesi İçin)</summary>
      <pre style="background: #ffffff; padding: 12px; border-radius: 6px; margin-top: 8px; overflow-x: auto; font-size: 11px;">${jsonStr}</pre>
    </details>
    ` : ''}
  </div>

  ${isPrintPDF ? `
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
  ` : ''}
</body>
</html>`;
};

export const generateHTMLBackup = (appData) => {
  return buildHTMLContent(appData, false);
};

export const generatePDFBackup = (appData) => {
  const htmlStr = buildHTMLContent(appData, true);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlStr);
    printWindow.document.close();
  } else {
    alert('Lütfen tarayıcınızda açılır pencere (popup) engelleyicisini kaldırarak tekrar deneyin.');
  }
};
