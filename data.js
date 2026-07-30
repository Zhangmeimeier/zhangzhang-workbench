/* 张张的工作台 - 默认数据内容库 */

const WBData = {
  // 每日工作任务默认内容
  workTasks: {
    xingce: [
      { id: "xc1", text: "成语积累公式", done: false },
      { id: "xc2", text: "速算练习", done: false },
      { id: "xc3", text: "资料分析刷题", done: false },
      { id: "xc4", text: "判断推理刷题", done: false },
      { id: "xc5", text: "言语理解刷题", done: false },
      { id: "xc6", text: "政治理论课程", done: false },
      { id: "xc7", text: "常识课程", done: false },
      { id: "xc8", text: "错题回顾", done: false }
    ],
    shenlun: [
      { id: "sl1", text: "申论技巧趣学", done: false },
      { id: "sl2", text: "红宝书", done: false },
      { id: "sl3", text: "政治素养", done: false }
    ],
    examTips: [
      "2026年国考预计10月中旬发布公告，12月底笔试",
      "四川省考2026年12月笔试，行测120分钟、申论150分钟",
      "今日时政：重点复习近6个月重要讲话与会议精神",
      "资料分析速算：掌握截位直除、百化分、分数比较"
    ]
  },

  // 每日生活管理
  lifeManage: {
    meals: {
      breakfast: ["燕麦牛奶+水煮蛋", "全麦三明治+豆浆", "紫薯+鸡蛋+酸奶", "杂粮粥+蒸蛋", "水果沙拉+全麦吐司"],
      lunch: ["鸡胸肉糙米饭+西兰花", "番茄牛腩+荞麦面", "清蒸鱼+杂粮饭+时蔬", "虾仁炒蛋+红薯+青菜", "牛肉沙拉+南瓜"],
      dinner: ["蔬菜豆腐汤+玉米", "凉拌鸡丝+黄瓜", "蒸蛋羹+小番茄", "海带冬瓜汤+紫薯", "白灼虾+凉拌菠菜"]
    },
    chores: ["整理书桌", "换洗床单", "扫地拖地", "清洗衣物", "整理衣柜", "擦拭家具", "清理冰箱", "浇花/照顾绿植"],
    water: 8,
    sleep: { bedTime: "", wakeTime: "", quality: 3 },
    relax: ["听15分钟轻音乐", "做10分钟冥想", "泡一杯花茶", "读几页闲书", "做面部按摩"],
    notes: ""
  },

  // 每日减脂饮食
  diet: {
    breakfast: "燕麦30g + 牛奶200ml + 蓝莓50g",
    lunch: "鸡胸肉100g + 糙米饭80g + 西兰花150g",
    dinner: "豆腐100g + 蔬菜汤 + 玉米半根",
    snack: "无糖酸奶100g / 小番茄10颗",
    records: [],
    calories: {
      // 每100g热量 kcal
      燕麦: 389, 米饭: 116, 糙米饭: 111, 鸡胸肉: 133, 牛肉: 125,
      鸡蛋: 144, 豆腐: 76, 西兰花: 34, 菠菜: 23, 番茄: 18,
      黄瓜: 16, 玉米: 86, 红薯: 86, 紫薯: 82, 牛奶: 54,
      酸奶: 72, 苹果: 52, 香蕉: 89, 蓝莓: 57, 虾: 85,
      鱼: 120, 南瓜: 26, 胡萝卜: 41, 蘑菇: 22, 木耳: 27,
      海带: 13, 冬瓜: 12, 紫菜: 250
    }
  },

  // 运动塑形锻炼（根据用户图片录入）
  exercise: {
    weeklyPlan: {
      1: ["10min直角肩+少女背", "5min帕梅拉热身", "30min帕梅拉经典三部曲", "15min美背负重", "8min肩背松解", "5min全身拉伸"],
      2: ["5min帕梅拉热身", "10min根本性瘦小腿", "15min帕梅拉瘦腿", "15min帕梅拉臀部训练", "17min腿部松解", "10min腿部拉伸"],
      3: ["10min直角肩+少女背", "5min帕梅拉热身", "30min帕梅拉新三部曲", "15min美背负重", "8min肩背松解", "5min全身拉伸"],
      4: ["8min腿形改善", "30min芭杆上肢雕刻", "30min芭杆臀腿雕刻"],
      5: ["5min帕梅拉热身", "5min帕梅拉快速燃脂", "10min帕梅拉下腹训练", "10min根本性瘦小腿", "17min腿部松解", "10min腿部拉伸", "5min全身拉伸"],
      6: ["10min直角肩+少女背", "5min帕梅拉热身", "20min帕梅拉HIIT", "10min帕梅拉内啡肽", "8min肩背松解", "10min腿部拉伸", "5min全身拉伸"],
      0: ["30min芭杆版沙漏腰", "30min芭杆臀腿×腰腹", "核心训练"]
    },
    videoMap: {
      "帕梅拉": "https://www.bilibili.com/video/BV1xk4y1m7gP",
      "直角肩": "https://www.bilibili.com/video/BV1XE411C7cC",
      "瘦小腿": "https://www.bilibili.com/video/BV1g54y1G7dH",
      "瘦腿": "https://www.bilibili.com/video/BV1SQ4y1K7pv",
      "臀部": "https://www.bilibili.com/video/BV1SQ4y1K7pv",
      "HIIT": "https://www.bilibili.com/video/BV1T4411H7sE",
      "内啡肽": "https://www.bilibili.com/video/BV1dY4y1G7i3",
      "芭杆": "https://www.bilibili.com/video/BV1AT4y1v7hR",
      "拉伸": "https://www.bilibili.com/video/BV1gS4y1e7iE",
      "核心": "https://www.bilibili.com/video/BV1S5411e7pY"
    },
    custom: []
  },

  // 自媒体每日灵感
  inspiration: {
    topics: [
      "考公小白30天逆袭计划",
      "体制内女生的一天vlog",
      "行测速算技巧拆解",
      "申论大作文万能开头",
      "在职备考时间管理"
    ],
    hotRemix: [
      { title: "山东考公热：为什么年轻人扎堆考编？", heat: 98, tag: "公考" },
      { title: "自媒体副业月入过万是真的吗？", heat: 95, tag: "自媒体" },
      { title: "帕梅拉新课测评：30天身材变化", heat: 92, tag: "运动" },
      { title: "2026国考报名时间预测", heat: 90, tag: "公考" },
      { title: "早起学习vlog：5点起床的一天", heat: 88, tag: "自律" },
      { title: "低消费存钱挑战：月存3000", heat: 85, tag: "理财" }
    ],
    review: ""
  },

  // 热点新闻
  news: [
    { id: 1, title: "2026国考公告预计10月发布，招录规模或创新高", category: "公考", heat: 96, time: "今天 08:30", content: "根据历年规律，2026年国家公务员考试公告预计在10月中旬发布，笔试时间或在12月底。建议考生提前准备行测和申论。" },
    { id: 2, title: "四川省考新动态：基层岗位扩招趋势明显", category: "公考", heat: 88, time: "今天 09:15", content: "四川省2026年度公务员考试预计12月举行，基层岗位和应届生岗位有望继续扩招。" },
    { id: 3, title: "短视频平台新规：知识类内容迎来流量红利", category: "自媒体", heat: 91, time: "今天 10:00", content: "各大平台加大对知识分享类内容的扶持力度，考公、学习、成长类博主迎来新机遇。" },
    { id: 4, title: "夏季养生提醒：三伏天饮食宜清淡忌贪凉", category: "养生", heat: 82, time: "今天 11:20", content: "进入三伏天，专家建议饮食清淡、适量运动、保证睡眠，避免过度贪凉。" },
    { id: 5, title: "副业信息差：闲鱼卖虚拟资料月入几千", category: "自媒体", heat: 79, time: "今天 12:05", content: "整理考公笔记、学习资料在二手平台出售，成为近期热门轻创业项目。" },
    { id: 6, title: "年轻人存钱新方式：12存单法走红", category: "理财", heat: 75, time: "今天 13:40", content: "12存单法因操作简单、强制储蓄效果好，成为年轻人存钱热门选择。" }
  ],

  // 成长书籍推荐
  books: [
    { id: 1, title: "被讨厌的勇气", author: "岸见一郎", tag: "心理成长", status: "未读", note: "" },
    { id: 2, title: "认知觉醒", author: "周岭", tag: "自我提升", status: "未读", note: "" },
    { id: 3, title: "原子习惯", author: "James Clear", tag: "习惯养成", status: "未读", note: "" },
    { id: 4, title: "非暴力沟通", author: "马歇尔·卢森堡", tag: "沟通能力", status: "未读", note: "" },
    { id: 5, title: "蛤蟆先生去看心理医生", author: "罗伯特·戴博德", tag: "心理成长", status: "未读", note: "" },
    { id: 6, title: "金钱心理学", author: "摩根·豪泽尔", tag: "理财思维", status: "未读", note: "" }
  ],

  // 理财存钱
  finance: {
    goal: { name: "考公上岸基金", target: 10000, saved: 3200 },
    records: [
      { id: 1, type: "income", amount: 5000, note: "工资", date: "2026-07-01" },
      { id: 2, type: "expense", amount: 1200, note: "房租", date: "2026-07-02" },
      { id: 3, type: "expense", amount: 300, note: "伙食", date: "2026-07-05" }
    ]
  },

  // 赚钱信息差
  moneyInfo: [
    { id: 1, title: "考公资料整理售卖", content: "把备考笔记、错题集整理成PDF，在闲鱼/小红书售卖。", source: "小红书", time: "2026-07-28", collected: false },
    { id: 2, title: "线上陪跑打卡群", content: "组建考公/减脂/早起打卡群，收取小额入群费或押金制。", source: "抖音", time: "2026-07-27", collected: false },
    { id: 3, title: "闲鱼无货源卖货", content: "利用1688等货源，在闲鱼转卖家居小物，赚差价。", source: "知乎", time: "2026-07-26", collected: false },
    { id: 4, title: "代做PPT/简历", content: "在闲鱼或淘宝接单，帮求职者优化简历或制作PPT。", source: "B站", time: "2026-07-25", collected: false },
    { id: 5, title: "公众号流量主", content: "写考公、成长类文章，开通流量主获取广告收益。", source: "微信", time: "2026-07-24", collected: false }
  ],

  // 自我提升
  selfImprovement: {
    spiritual: ["晨读10分钟", "写感恩日记3条", "静坐冥想10分钟", "睡前复盘今日", "对他人说一句赞美"],
    courses: {
      english: { name: "英语零基础入门", platform: "B站", desc: "英语兔：语法体系全解，适合小白系统学习。", url: "https://www.bilibili.com/video/BV1r54y1m7gd" },
      signLanguage: { name: "手语基础入门", platform: "B站", desc: "杜银玲：中国手语基础教程，从字母到日常对话。", url: "https://www.bilibili.com/video/BV1Ab411G7Zz" },
      guzheng: { name: "古筝零基础教学", platform: "B站", desc: "袁莎古筝教学：从坐姿、指法到简单曲目。", url: "https://www.bilibili.com/video/BV1xW411n7gd" },
      dance: { name: "爵士舞零基础", platform: "B站", desc: "粒粒编舞：零基础爵士基本功+简单片段。", url: "https://www.bilibili.com/video/BV1S54y1G7He" }
    }
  },

  // 博客精选
  blogs: [
    { id: 1, title: "考公人必备的5个公众号", source: "公考雷达", category: "公考", date: "2026-07-25", url: "#", collected: false },
    { id: 2, title: "从0到1做自媒体：定位与选题", source: "运营研究社", category: "自媒体", date: "2026-07-26", url: "#", collected: false },
    { id: 3, title: "申论大作文万能模板整理", source: "粉笔公考", category: "公考", date: "2026-07-27", url: "#", collected: false },
    { id: 4, title: "小红书爆款笔记的3个底层逻辑", source: "麋鹿先生Sky", category: "自媒体", date: "2026-07-28", url: "#", collected: false },
    { id: 5, title: "极简存钱法：12存单实战", source: "也谈钱", category: "理财", date: "2026-07-24", url: "#", collected: false }
  ],

  // 养生
  wellness: {
    tips: [
      "早起一杯温水，唤醒肠胃",
      "每坐1小时起身活动5分钟",
      "睡前1小时远离电子屏幕",
      "多吃当季蔬菜水果，少喝冰饮",
      "晚上11点前入睡，养肝护胆"
    ],
    tasks: [
      { id: "ws1", text: "喝够8杯水", done: false },
      { id: "ws2", text: "泡脚15分钟", done: false },
      { id: "ws3", text: "梳头100下", done: false },
      { id: "ws4", text: "揉腹5分钟", done: false }
    ],
    custom: []
  },

  // 我的树洞
  treeHole: {
    entries: [
      { id: 1, date: "2026-07-28", mood: "开心", text: "今天完成了行测套题，正确率提高了！", moodColor: "mood-happy" },
      { id: 2, date: "2026-07-27", mood: "平静", text: "睡前冥想了一会儿，感觉整个人放松了。", moodColor: "mood-calm" }
    ]
  },

  // 首页励志语录
  quotes: [
    "愿你成为自己的太阳，无需凭借谁的光。",
    "努力和收获，都是自己的，与他人无关。",
    "越努力，越幸运；越自律，越自由。",
    "今天的每一步，都是通往未来的路。",
    "相信自己，你比想象中更强大。"
  ]
};

// 防止 ES module 问题，同时支持全局访问
if (typeof window !== 'undefined') {
  window.WBData = WBData;
}
