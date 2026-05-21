export default {
  title: '程式設計師老黃曆',
  loading: '正在計算今日運勢...',
  goodTitle: '宜',
  badTitle: '不宜',
  seatDirectionLabel: '座位朝向：',
  seatDirectionText: '面向{direction}寫程式，BUG 最少。',
  drinkLabel: '今日宜飲：',
  goddessLabel: '女神親近指數：',
  todayText: '今天是{year}年{month}月{day}日 星期{week}',
  drinkSeparator: '、',
  weeks: ['日', '一', '二', '三', '四', '五', '六'],
  directions: [
    '北方',
    '東北方',
    '東方',
    '東南方',
    '南方',
    '西南方',
    '西方',
    '西北方'
  ],
  activities: [
    {
      name: '寫單元測試',
      good: '寫單元測試將減少出錯',
      bad: '寫單元測試會降低你的開發效率'
    },
    {
      name: '洗澡',
      good: '你幾天沒洗澡了？',
      bad: '會把設計方面的靈感洗掉',
      weekend: true
    },
    {
      name: '鍛鍊一下身體',
      good: '是時候舒展僵硬的肌肉了',
      bad: '能量沒消耗多少，吃得卻更多',
      weekend: true
    },
    {
      name: '抽煙',
      good: '抽煙有利於提神、增加思維敏捷，但吸煙仍然有害健康',
      bad: '吸煙有害健康',
      weekend: true
    },
    {
      name: '白天上線',
      good: '今天白天上線是安全的',
      bad: '可能導致災難性後果'
    },
    { name: '重構', good: '程式碼品質得到提高', bad: '你很有可能會陷入泥潭' },
    { name: '使用%t', good: '你看起來更有品味', bad: '別人會覺得你在裝模作樣' },
    {
      name: '跳槽',
      good: '該放手時就放手',
      bad: '鑑於當前的經濟形勢，你的下一份工作未必比現在強'
    },
    {
      name: '招人',
      good: '你面前這位有成為牛人的潛質',
      bad: '這人會寫程式嗎？'
    },
    { name: '面試', good: '面試官今天心情很好', bad: '面試官不爽，會拿你出氣' },
    {
      name: '提交辭職申請',
      good: '公司找到了比你更能幹又更便宜的傢伙，巴不得你快點走',
      bad: '鑑於當前的經濟形勢，你的下一份工作未必比現在強'
    },
    { name: '申請加薪', good: '老闆今天心情很好', bad: '公司正在考慮裁員' },
    {
      name: '晚上加班',
      good: '晚上是程式設計師精神最好的時候',
      bad: '身心憔悴，早點休息',
      weekend: true
    },
    {
      name: '在女生面前吹牛',
      good: '改善你矮窮挫的形象',
      bad: '會被識破',
      weekend: true
    },
    {
      name: '在維基萌抽卡',
      good: '大概率抽到自己心儀的卡',
      bad: '垃圾卡片滿天飛',
      weekend: true
    },
    {
      name: '寫技術文章',
      good: '新的水文即將誕生',
      bad: '你的文章會被抄襲',
      weekend: true
    },
    {
      name: '命名變數「%v」',
      good: '變數名萌萌噠',
      bad: '這個變數永遠引用不到'
    },
    {
      name: '寫超過%l行的方法',
      good: '你的程式碼組織得很好，長一點沒關係',
      bad: '你的程式碼將混亂不堪，連自己都看不懂'
    },
    {
      name: '提交程式碼',
      good: '遇到衝突的機率是最低的',
      bad: '你遇到的一大堆衝突會讓你懷疑自己是不是時間穿越了'
    },
    {
      name: '程式碼審查',
      good: '發現重要問題的機率大大增加',
      bad: '你什麼問題都發現不了，白白浪費時間'
    },
    {
      name: '開會',
      good: '寫程式之餘放鬆一下打個盹，有益健康',
      bad: '小心被扣屎盆子背黑鍋'
    },
    {
      name: '打鬥陣特攻',
      good: '你將有如神助',
      bad: '你會被虐得很慘',
      weekend: true
    },
    {
      name: '晚上上線',
      good: '晚上是程式設計師精神最好的時候',
      bad: '你白天已經筋疲力盡了'
    },
    {
      name: '修復BUG',
      good: '你今天對 BUG 的嗅覺大大提高',
      bad: '新產生的 BUG 將比修復的更多'
    },
    {
      name: '設計評審',
      good: '設計評審會議將變成腦力激盪',
      bad: '人人筋疲力盡，評審就這麼過了'
    },
    {
      name: '需求評審',
      good: '這個需求很簡單',
      bad: '公司需要一個能根據手機外殼變化 App 皮膚的功能'
    },
    {
      name: '上部落格',
      good: '今天發生的事不能錯過',
      bad: '今天的部落格充滿負能量',
      weekend: true
    },
    {
      name: '上AB站',
      good: '還需要理由嗎？',
      bad: '發現彈幕評論都是鍵盤俠',
      weekend: true
    },
    {
      name: '玩冒險島Online',
      good: '砸出二十五星神裝',
      bad: '除非你想把電腦砸了',
      weekend: true
    }
  ],
  specials: [
    {
      date: 20140214,
      type: 'bad',
      name: '待在男（女）友身邊',
      description: '脫團火葬場，入團保平安。'
    }
  ],
  tools: [
    '用 Eclipse 寫程式',
    '用 MS Office 寫文件',
    '用記事本寫程式',
    'Windows 8',
    'Linux',
    'MacOS',
    'IE',
    'Android 裝置',
    'iOS 裝置'
  ],
  varNames: [
    'jieguo',
    'huodong',
    'pay',
    'expire',
    'zhangdan',
    'every',
    'free',
    'i1',
    'a',
    'virtual',
    'ad',
    'spider',
    'mima',
    'pass',
    'ui'
  ],
  drinks: [
    '水',
    '茶',
    '紅茶',
    '綠茶',
    '咖啡',
    '奶茶',
    '可樂',
    '鮮奶',
    '豆奶',
    '果汁',
    '果味汽水',
    '梳打水',
    '運動飲料',
    '乳酪',
    '酒'
  ]
}
