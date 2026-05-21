export default {
  title: 'プログラマーおみくじ',
  summaryPrefix: '占',
  summary:
    '冠婚葬祭や身近な病気、コーディング、テスト、昇進、転職、隕石、核爆弾まで、あらゆる吉凶を占います',
  instructions: [
    'コーディング、テスト、修正、コミットの前に引けば、凶を避けて吉を呼び込めるかもしれません',
    '占いたいことを選び、心の中で唱えてから「引く」をクリックしてください',
    '同じことは一度しか占えません。もう一度占うにはページを再読み込みしてください'
  ],
  initialCard: '占いたいことを選んでください',
  actionText: '引く',
  itemLabels: {
    coding: 'コーディング',
    testing: 'テスト',
    fixingBug: 'バグ修正',
    commitCode: 'コミット',
    other: 'その他'
  },
  todayText: '今日は{year}年{month}月{day}日 {week}曜日',
  weeks: ['日', '月', '火', '水', '木', '金', '土'],
  results: [
    { title: '超大吉', desc: '' },
    { title: '大吉', desc: '' },
    { title: '吉', desc: '' },
    { title: '小吉', desc: '' },
    { title: ' ', desc: '' },
    { title: '小凶', desc: '' },
    { title: '凶', desc: '' },
    { title: '大凶', desc: '' },
    { title: '超大凶', desc: '' }
  ]
}
