export default {
  title: 'Undian Keberuntungan Programmer',
  summaryPrefix: 'Tanyakan ',
  summary:
    'tentang cinta, kesehatan, coding, test, promosi, pindah kerja, meteorit, bom nuklir, dan segala bentuk keberuntungan lainnya',
  instructions: [
    'Ambil undian sekali sebelum coding, testing, memperbaiki bug, atau commit untuk menghindari sial dan mengejar hoki',
    'Pilih hal yang ingin kamu tanyakan, fokus padanya, lalu klik "Ambil"',
    'Kamu hanya bisa bertanya hal yang sama satu kali. Refresh halaman sebelum mengambil lagi'
  ],
  initialCard: 'Pilih yang ingin kamu tanyakan',
  actionText: 'Ambil',
  itemLabels: {
    coding: 'Coding',
    testing: 'Testing',
    fixingBug: 'Perbaiki bug',
    commitCode: 'Commit kode',
    other: 'Lainnya'
  },
  todayText: 'Hari ini {week}, {day}/{month}/{year}',
  weeks: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
  results: [
    { title: 'Hoki ekstrem', desc: '' },
    { title: 'Hoki besar', desc: '' },
    { title: 'Hoki', desc: '' },
    { title: 'Sedikit hoki', desc: '' },
    { title: ' ', desc: '' },
    { title: 'Sedikit sial', desc: '' },
    { title: 'Sial', desc: '' },
    { title: 'Sial besar', desc: '' },
    { title: 'Sial ekstrem', desc: '' }
  ]
}
