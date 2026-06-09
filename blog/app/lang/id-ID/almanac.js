export default {
  title: 'Kalender Keberuntungan Programmer',
  loading: 'Menghitung keberuntungan hari ini...',
  goodTitle: 'Lakukan',
  badTitle: 'Hindari',
  seatDirectionLabel: 'Arah duduk:',
  seatDirectionText: 'Hadap {direction} saat coding agar bug lebih sedikit.',
  drinkLabel: 'Minuman hari ini:',
  goddessLabel: 'Kecocokan gebetan:',
  todayText: 'Hari ini {week}, {day}/{month}/{year}',
  drinkSeparator: ', ',
  weeks: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
  directions: [
    'Utara',
    'Timur laut',
    'Timur',
    'Tenggara',
    'Selatan',
    'Barat daya',
    'Barat',
    'Barat laut'
  ],
  activities: [
    {
      name: 'Tulis unit test',
      good: 'Unit test akan mengurangi kesalahan',
      bad: 'Unit test akan memperlambat ritme pengembanganmu'
    },
    {
      name: 'Mandi',
      good: 'Sudah beberapa hari, kan?',
      bad: 'Kamu mungkin membilas inspirasi desainmu',
      weekend: true
    },
    {
      name: 'Berolahraga',
      good: 'Saatnya meregangkan otot yang kaku',
      bad: 'Energi yang terbakar sedikit, makanmu malah lebih banyak',
      weekend: true
    },
    {
      name: 'Merokok',
      good: 'Mungkin membuatmu terjaga dan pikiran lebih tajam, meski merokok tetap berbahaya',
      bad: 'Merokok buruk untuk kesehatan',
      weekend: true
    },
    {
      name: 'Deploy siang hari',
      good: 'Rilis siang hari aman untuk hari ini',
      bad: 'Bisa memicu konsekuensi fatal'
    },
    {
      name: 'Refactor',
      good: 'Kualitas kode akan meningkat',
      bad: 'Kamu bisa terjebak dalam regresi tanpa akhir'
    },
    {
      name: 'Gunakan %t',
      good: 'Kamu akan terlihat lebih berkelas',
      bad: 'Orang mungkin mengira kamu sedang pamer'
    },
    {
      name: 'Pindah kerja',
      good: 'Lepaskan saat memang waktunya',
      bad: 'Di ekonomi seperti ini, pekerjaan berikutnya mungkin tidak lebih baik'
    },
    {
      name: 'Merekrut orang',
      good: 'Orang ini mungkin punya potensi nyata',
      bad: 'Apakah orang ini bahkan bisa coding?'
    },
    {
      name: 'Wawancara',
      good: 'Pewawancara sedang dalam suasana hati yang baik hari ini',
      bad: 'Pewawancara sedang kesal dan mungkin melampiaskannya padamu'
    },
    {
      name: 'Ajukan resign',
      good: 'Perusahaan sudah menemukan orang yang lebih murah dan lebih mampu, lalu ingin kamu cepat pergi',
      bad: 'Di ekonomi seperti ini, pekerjaan berikutnya mungkin tidak lebih baik'
    },
    {
      name: 'Minta kenaikan gaji',
      good: 'Atasan sedang dalam suasana hati yang baik hari ini',
      bad: 'Perusahaan sedang mempertimbangkan PHK'
    },
    {
      name: 'Lembur malam ini',
      good: 'Malam adalah waktu programmer paling siaga',
      bad: 'Kamu sudah lelah, istirahatlah',
      weekend: true
    },
    {
      name: 'Pamer di depan gebetan',
      good: 'Citramu sedikit membaik',
      bad: 'Kamu akan langsung ketahuan',
      weekend: true
    },
    {
      name: 'Gacha kartu di Wikimoe',
      good: 'Kemungkinan mendapat kartu incaranmu besar',
      bad: 'Kartu sampah akan turun dari langit',
      weekend: true
    },
    {
      name: 'Tulis artikel teknis',
      good: 'Sebuah mahakarya content farming baru akan lahir',
      bad: 'Artikelmu mungkin disalin',
      weekend: true
    },
    {
      name: 'Beri nama variabel "%v"',
      good: 'Nama variabelnya terlihat tidak terduga imut',
      bad: 'Kamu tidak akan pernah mereferensikan variabel ini lagi'
    },
    {
      name: 'Tulis method lebih dari %l baris',
      good: 'Kodemu cukup tertata untuk bertahan sepanjang itu',
      bad: 'Kode akan menjadi berantakan dan tidak lagi kamu pahami'
    },
    {
      name: 'Commit kode',
      good: 'Peluang konflik merge sedang paling rendah',
      bad: 'Tumpukan konflik akan membuatmu meragukan timeline'
    },
    {
      name: 'Review kode',
      good: 'Kamu jauh lebih mungkin menemukan masalah penting',
      bad: 'Kamu tidak akan menemukan apa pun dan membuang seluruh sesi'
    },
    {
      name: 'Ikut rapat',
      good: 'Tidur sebentar jauh dari coding baik untuk kesehatan',
      bad: 'Kamu mungkin akhirnya disalahkan'
    },
    {
      name: 'Main Overwatch',
      good: 'Kamu akan merasa diberkati para dewa',
      bad: 'Kamu akan dihancurkan',
      weekend: true
    },
    {
      name: 'Deploy malam hari',
      good: 'Malam adalah waktu programmer paling siaga',
      bad: 'Energi siang harimu sudah habis'
    },
    {
      name: 'Perbaiki bug',
      good: 'Naluri bug-mu sedang sangat tajam hari ini',
      bad: 'Kamu akan membuat lebih banyak bug daripada yang diperbaiki'
    },
    {
      name: 'Review desain',
      good: 'Review akan berubah menjadi sesi brainstorming sungguhan',
      bad: 'Semua orang akan kelelahan dan tidak ada hal berarti terjadi'
    },
    {
      name: 'Review requirement',
      good: 'Requirement ini terlihat mudah',
      bad: 'Perusahaan menginginkan skin aplikasi yang berubah mengikuti casing ponsel'
    },
    {
      name: 'Baca blog',
      good: 'Cerita hari ini layak diikuti',
      bad: 'Dunia blog penuh energi negatif hari ini',
      weekend: true
    },
    {
      name: 'Jelajahi situs anime',
      good: 'Apakah kamu benar-benar butuh alasan?',
      bad: 'Kolom komentarnya penuh pendekar keyboard',
      weekend: true
    },
    {
      name: 'Main MapleStory Online',
      good: 'Kamu mungkin mendapat setup 25-star tingkat dewa',
      bad: 'Kecuali kamu ingin menghancurkan komputermu',
      weekend: true
    }
  ],
  specials: [
    {
      date: 20140214,
      type: 'bad',
      name: 'Bersama pasangan',
      description:
        'Hari Valentine menghukum yang lajang dan menghadiahi pasangan.'
    }
  ],
  tools: [
    'Coding di Eclipse',
    'Tulis dokumen di MS Office',
    'Coding di Notepad',
    'Windows 8',
    'Linux',
    'macOS',
    'Internet Explorer',
    'Perangkat Android',
    'Perangkat iOS'
  ],
  varNames: [
    'result',
    'event',
    'payment',
    'expire',
    'bill',
    'each',
    'free',
    'i1',
    'a',
    'virtual',
    'ad',
    'spider',
    'password',
    'pass',
    'ui'
  ],
  drinks: [
    'Air putih',
    'Teh',
    'Teh hitam',
    'Teh hijau',
    'Kopi',
    'Teh susu',
    'Cola',
    'Susu segar',
    'Susu kedelai',
    'Jus',
    'Soda buah',
    'Air soda',
    'Minuman olahraga',
    'Yogurt',
    'Alkohol'
  ]
}
