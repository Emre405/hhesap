// Currency and Number Formatters for Turkish Lira
export const formatTL = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

export const formatNumber = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num);
};

// Formats number string with Turkish dot thousands separator for input fields (e.g. 200000 -> "200.000")
export const formatDisplayNumber = (val) => {
  if (val === null || val === undefined || val === '') return '';
  const str = String(val);
  const isNegative = str.startsWith('-');
  let cleanStr = str.replace(/^-/, '');

  // Strip existing dots if any
  cleanStr = cleanStr.replace(/\./g, '');

  const parts = cleanStr.split(',');
  let intPart = parts[0] ? parts[0].replace(/^0+(?=\d)/, '') : '';
  if (parts[0] === '0') intPart = '0';
  
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  let result = (isNegative ? '-' : '') + formattedInt;
  if (parts.length > 1) {
    result += ',' + parts[1];
  }
  return result;
};

// Parses Turkish formatted number back to standard raw number string (e.g. "200.000" -> "200000")
export const parseFormattedNumber = (val) => {
  if (val === null || val === undefined || val === '') return '';
  const clean = String(val).replace(/\./g, '').replace(',', '.');
  return clean;
};

export const getTodayString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Initial Mock Data (Rich Turkish Data for immediate testing)
export const initialData = {
  oliveSales: [
    {
      id: 'os-1',
      date: '2026-08-01',
      customerName: 'Ahmet Yılmaz',
      calibre: '230-260',
      quantityKg: 500,
      unitPrice: 120,
      totalPrice: 60000,
      paidAmount: 40000,
      remainingBalance: 20000
    },
    {
      id: 'os-2',
      date: '2026-08-03',
      customerName: 'Mehmet Demir',
      calibre: '260-290',
      quantityKg: 350,
      unitPrice: 105,
      totalPrice: 36750,
      paidAmount: 36750,
      remainingBalance: 0
    },
    {
      id: 'os-3',
      date: '2026-08-05',
      customerName: 'Körfez Gıda A.Ş.',
      calibre: 'Yeşil Zeytin',
      quantityKg: 1000,
      unitPrice: 140,
      totalPrice: 140000,
      paidAmount: 70000,
      remainingBalance: 70000
    }
  ],
  oliveStockEntries: [
    { id: 'ost-1', date: '2026-07-25', supplier: 'Ayvalık Müstahsil Koop.', calibre: '230-260', quantityKg: 2000 },
    { id: 'ost-2', date: '2026-07-26', supplier: 'Kendi Bahçemiz (Görmeç)', calibre: '260-290', quantityKg: 1500 },
    { id: 'ost-3', date: '2026-07-28', supplier: 'Edremit Zeytincilik', calibre: '290-320', quantityKg: 1200 },
    { id: 'ost-4', date: '2026-07-30', supplier: 'Havran Tarım', calibre: 'Yeşil Zeytin', quantityKg: 1800 }
  ],
  oliveCosts: [
    { id: 'oc-1', date: '2026-07-25', category: 'Zeytin Alım Tutarı', amount: 180000, description: 'Ham zeytin müstahsil alımı' },
    { id: 'oc-2', date: '2026-07-27', category: 'Tuz ve İşçilik', amount: 12500, description: 'Salamura havuz hazırlık ve tuz' },
    { id: 'oc-3', date: '2026-08-02', category: 'Nakliye & Ambalaj', amount: 8400, description: 'Kasa ve nakliye gideri' }
  ],
  oilSales: [
    {
      id: 'ois-1',
      date: '2026-08-02',
      customerName: 'Mustafa Kaya',
      tinType: '16 Litrelik Teneke',
      tinCount: 20,
      totalLiters: 320,
      unitPricePerTin: 4200,
      totalPrice: 84000,
      paidAmount: 50000,
      remainingBalance: 34000
    },
    {
      id: 'ois-2',
      date: '2026-08-06',
      customerName: 'Ahmet Yılmaz',
      tinType: '16 Litrelik Teneke',
      tinCount: 10,
      totalLiters: 160,
      unitPricePerTin: 4300,
      totalPrice: 43000,
      paidAmount: 43000,
      remainingBalance: 0
    }
  ],
  oilPurchases: [
    {
      id: 'oip-1',
      date: '2026-07-20',
      supplier: 'Edremit Yağ Fabrikası',
      tinType: '16 Litrelik Teneke',
      tinCount: 100,
      totalLiters: 1600,
      unitPricePerTin: 3400,
      totalPrice: 340000
    }
  ],
  oilStockUnitPrice: 4000, // Teneke başına tahmini bakiye değeri (TL)
  
  paymentPlan: [
    {
      id: 'pp-1',
      month: '2026-01',
      receivables: [{ id: 'r-1', title: 'Ocak Ayı Yağ Satışı Tahsilatı', amount: 45000 }],
      payments: [{ id: 'p-1', title: 'Elektrik & Su Faturası', amount: 5200 }]
    },
    {
      id: 'pp-2',
      month: '2026-02',
      receivables: [{ id: 'r-2', title: 'Şubat Ayı Zeytin Tahsilatı', amount: 30000 }],
      payments: [{ id: 'p-2', title: 'Budama İşçiliği Ödemesi', amount: 18000 }]
    },
    {
      id: 'pp-3',
      month: '2026-03',
      receivables: [{ id: 'r-3', title: 'Toptan Yağ Satış Taksidi', amount: 60000 }],
      payments: [{ id: 'p-3', title: 'İlkbahar Gübre Alımı', amount: 25000 }]
    },
    {
      id: 'pp-4',
      month: '2026-04',
      receivables: [{ id: 'r-4', title: 'Müşteri Çek Tahsilatı', amount: 40000 }],
      payments: [{ id: 'p-4', title: 'İlaçlama & Mazot Gideri', amount: 14000 }]
    },
    {
      id: 'pp-5',
      month: '2026-05',
      receivables: [{ id: 'r-5', title: 'Perakende Satış Geliri', amount: 35000 }],
      payments: [{ id: 'p-5', title: 'Traktör Bakım & Servis', amount: 8500 }]
    },
    {
      id: 'pp-6',
      month: '2026-06',
      receivables: [{ id: 'r-6', title: 'Haziran Ayı Cari Tahsilat', amount: 50000 }],
      payments: [{ id: 'p-6', title: 'Sulama Tesisatı & Boru Alımı', amount: 22000 }]
    },
    {
      id: 'pp-7',
      month: '2026-07',
      receivables: [{ id: 'r-7', title: 'Yaz Dönemi Satış Alacağı', amount: 48000 }],
      payments: [{ id: 'p-7', title: 'Sulama Birliği Su Aidatı', amount: 9500 }]
    },
    {
      id: 'pp-8',
      month: '2026-08',
      receivables: [
        { id: 'r-8', title: 'Ahmet Yılmaz Bakiye Tahsilatı', amount: 20000 },
        { id: 'r-9', title: 'Körfez Gıda Çek Tahsilatı', amount: 35000 }
      ],
      payments: [
        { id: 'p-8', title: 'Gübre ve İlaç Faturası', amount: 15000 },
        { id: 'p-9', title: 'Sulama Elektrik Borcu', amount: 4800 }
      ]
    },
    {
      id: 'pp-9',
      month: '2026-09',
      receivables: [{ id: 'r-10', title: 'Körfez Gıda 2. Taksit', amount: 35000 }],
      payments: [{ id: 'p-10', title: 'Mazot Borcu', amount: 12000 }]
    },
    {
      id: 'pp-10',
      month: '2026-10',
      receivables: [{ id: 'r-11', title: 'Hasat Öncesi Avans Alacak', amount: 75000 }],
      payments: [{ id: 'p-11', title: 'Hasat İşçi Avansları', amount: 30000 }]
    },
    {
      id: 'pp-11',
      month: '2026-11',
      receivables: [{ id: 'r-12', title: 'Yeni Sezon Zeytin Satış Tahsilatı', amount: 120000 }],
      payments: [{ id: 'p-12', title: 'Hasat & Tayfa Yevmiyeleri', amount: 45000 }]
    },
    {
      id: 'pp-12',
      month: '2026-12',
      receivables: [{ id: 'r-13', title: 'Yıl Sonu Toptan Yağ Satışı', amount: 150000 }],
      payments: [
        { id: 'p-13', title: 'Sıkım & Fabrika Kirası', amount: 38000 },
        { id: 'p-14', title: 'Teneke Ambalaj Alımı', amount: 25000 }
      ]
    }
  ],

  debts: [
    { id: 'd-1', description: 'Tarım Kredi Kooperatifi Kredisi', amount: 85000, category: 'Banka/Kooperatif' },
    { id: 'd-2', description: 'Traktör Taksidi (Ziraat Bankası)', amount: 42000, category: 'Kredi' },
    { id: 'd-3', description: 'Sulama Birliği Aidat & Su Borcu', amount: 9500, category: 'Resmi Borç' }
  ],
  
  assets: [
    { id: 'a-1', description: 'Ziraat Bankası Vadesiz Hesabı', amount: 115000, type: 'Nakit/Banka' },
    { id: 'a-2', description: 'Massey Ferguson Traktör (2022)', amount: 950000, type: 'Araç/Ekipman' },
    { id: 'a-3', description: 'Edremit Akçay 5 Dönüm Zeytinlik', amount: 2500000, type: 'Gayrimenkul' }
  ]
};
