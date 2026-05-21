export default {
  title: '程序员老黄历',
  loading: '正在计算今日运势...',
  goodTitle: '宜',
  badTitle: '不宜',
  seatDirectionLabel: '座位朝向：',
  seatDirectionText: '面向{direction}写程序，BUG 最少。',
  drinkLabel: '今日宜饮：',
  goddessLabel: '女神亲近指数：',
  todayText: '今天是{year}年{month}月{day}日 星期{week}',
  drinkSeparator: '，',
  weeks: ['日', '一', '二', '三', '四', '五', '六'],
  directions: [
    '北方',
    '东北方',
    '东方',
    '东南方',
    '南方',
    '西南方',
    '西方',
    '西北方'
  ],
  activities: [
    {
      name: '写单元测试',
      good: '写单元测试将减少出错',
      bad: '写单元测试会降低你的开发效率'
    },
    {
      name: '洗澡',
      good: '你几天没洗澡了？',
      bad: '会把设计方面的灵感洗掉',
      weekend: true
    },
    {
      name: '锻炼一下身体',
      good: '是时候舒展下僵硬的肌肉了',
      bad: '能量没消耗多少，吃得却更多',
      weekend: true
    },
    {
      name: '抽烟',
      good: '抽烟有利于提神，增加思维敏捷，但吸烟仍然有害健康',
      bad: '吸烟有害健康',
      weekend: true
    },
    {
      name: '白天上线',
      good: '今天白天上线是安全的',
      bad: '可能导致灾难性后果'
    },
    { name: '重构', good: '代码质量得到提高', bad: '你很有可能会陷入泥潭' },
    { name: '使用%t', good: '你看起来更有品位', bad: '别人会觉得你在装逼' },
    {
      name: '跳槽',
      good: '该放手时就放手',
      bad: '鉴于当前的经济形势，你的下一份工作未必比现在强'
    },
    {
      name: '招人',
      good: '你面前这位有成为牛人的潜质',
      bad: '这人会写程序吗？'
    },
    { name: '面试', good: '面试官今天心情很好', bad: '面试官不爽，会拿你出气' },
    {
      name: '提交辞职申请',
      good: '公司找到了一个比你更能干更便宜的家伙，巴不得你赶快滚蛋',
      bad: '鉴于当前的经济形势，你的下一份工作未必比现在强'
    },
    { name: '申请加薪', good: '老板今天心情很好', bad: '公司正在考虑裁员' },
    {
      name: '晚上加班',
      good: '晚上是程序员精神最好的时候',
      bad: '身心憔悴，早点休息',
      weekend: true
    },
    {
      name: '在妹子面前吹牛',
      good: '改善你矮穷挫的形象',
      bad: '会被识破',
      weekend: true
    },
    {
      name: '在维基萌抽卡',
      good: '大概率抽到了自己心仪的卡',
      bad: '垃圾卡片满天飞',
      weekend: true
    },
    {
      name: '写技术文章',
      good: '新的水文即将诞生',
      bad: '你的博文会被抄袭',
      weekend: true
    },
    { name: '命名变量"%v"', good: '变量名萌萌哒', bad: '这个变量永远引用不到' },
    {
      name: '写超过%l行的方法',
      good: '你的代码组织得很好，长一点没关系',
      bad: '你的代码将混乱不堪，你自己都看不懂'
    },
    {
      name: '提交代码',
      good: '遇到冲突的几率是最低的',
      bad: '你遇到的一大堆冲突会让你怀疑自己是不是时间穿越了'
    },
    {
      name: '代码复审',
      good: '发现重要问题的几率大大增加',
      bad: '你什么问题都发现不了，白白浪费时间'
    },
    {
      name: '开会',
      good: '写代码之余放松一下打个盹，有益健康',
      bad: '小心被扣屎盆子背黑锅'
    },
    {
      name: '打守望先锋',
      good: '你将有如神助',
      bad: '你会被虐得很惨',
      weekend: true
    },
    {
      name: '晚上上线',
      good: '晚上是程序员精神最好的时候',
      bad: '你白天已经筋疲力尽了'
    },
    {
      name: '修复BUG',
      good: '你今天对 BUG 的嗅觉大大提高',
      bad: '新产生的 BUG 将比修复的更多'
    },
    {
      name: '设计评审',
      good: '设计评审会议将变成头脑风暴',
      bad: '人人筋疲力尽，评审就这么过了'
    },
    {
      name: '需求评审',
      good: '这个需求很简单',
      bad: '公司需要一个能根据手机外壳变化 APP 皮肤的功能'
    },
    {
      name: '上博客',
      good: '今天发生的事不能错过',
      bad: '今天的博客充满负能量',
      weekend: true
    },
    {
      name: '上AB站',
      good: '还需要理由吗？',
      bad: '发现弹幕评论都是键盘侠',
      weekend: true
    },
    {
      name: '玩冒险岛Online',
      good: '砸出二十五星神装',
      bad: '除非你想把电脑砸了',
      weekend: true
    }
  ],
  specials: [
    {
      date: 20140214,
      type: 'bad',
      name: '待在男（女）友身边',
      description: '脱团火葬场，入团保平安。'
    }
  ],
  tools: [
    'Eclipse写程序',
    'MSOffice写文档',
    '记事本写程序',
    'Windows8',
    'Linux',
    'MacOS',
    'IE',
    'Android设备',
    'iOS设备'
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
    '红茶',
    '绿茶',
    '咖啡',
    '奶茶',
    '可乐',
    '鲜奶',
    '豆奶',
    '果汁',
    '果味汽水',
    '苏打水',
    '运动饮料',
    '酸奶',
    '酒'
  ]
}
