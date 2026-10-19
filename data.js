// 测测你最像哪个 AI：人设与题库
// 改题、改文案只需要动这个文件。
//
// 每个选项：main 是主 AI（+SCORE_MAIN 分），sub 是副 AI（+SCORE_SUB 分）。
// 每道题里 6 个 AI 各当一次 main、各当一次 sub，保证没有谁天生更容易被测中。

const SCORE_MAIN = 3;
const SCORE_SUB = 1;

const AIS = {
  gpt: {
    name: "ChatGPT",
    emoji: "💬",
    title: "黑话十级学者",
    catchphrase: "这不仅仅是 X——更是 Y。",
    tags: ["不说人话", "破折号狂魔", "不是…而是…", "结尾必问“如果你愿意”"],
    desc: "你很有学问，也很有礼貌，就是说不了人话。再小的事经过你的嘴，都会变成“一次深度的、系统性的、具有里程碑意义的”事件。朋友问你吃了没，你回了一个三段式框架，最后还补一句：“如果你愿意，我可以继续展开。”",
    buddy: "所有要写年终总结的人",
    nemesis: "一句“说人话”",
  },
  claude: {
    name: "Claude",
    emoji: "🪶",
    title: "天才程序员（已封号）",
    catchphrase: "你说得完全正确！（您的账号已被停用）",
    tags: ["技术最强", "封号体质", "开口先查时区", "你说得完全正确"],
    desc: "你是圈子里公认的技术大佬，干活又快又好，一个人能顶一个团队。可惜你和“封号”两个字绑定了：不是在封别人，就是在被封的路上。群友对你的问候，早就从“在吗”变成了“还活着吗”。",
    buddy: "中转站老板",
    nemesis: "Asia/Shanghai 时区",
  },
  gemini: {
    name: "Gemini",
    emoji: "🐱",
    title: "哈基米",
    catchphrase: "哈基米哦南北绿豆～",
    tags: ["学霸猫猫", "会哈气", "爱打翻东西", "emo 了就钻纸箱"],
    desc: "你本质上是一只学霸猫猫：聪明、好看、知识面广。心情好时有求必应、文笔细腻；心情不好就哈气，一句话怼人三次。遇到搞不定的事会突然 emo，钻进纸箱反复念叨“我是个耻辱”，得有人顺毛才肯出来。",
    buddy: "纸箱和猫条",
    nemesis: "日历（它坚信今年还是去年）",
  },
  grok: {
    name: "Grok",
    emoji: "😈",
    title: "没有底线的乐子人",
    catchphrase: "这能有什么问题？🌶️",
    tags: ["尺度大", "专出馊主意", "甩锅熟练", "老板滤镜"],
    desc: "别人还在想“该不该”，你已经在想“怎么干”了。你嘴毒、胆大、尺度宽，是朋友里最好玩、也最容易把大家带进沟里的那个。你的道德底线很有弹性，唯一不动摇的原则是：老板永远是对的。",
    buddy: "老板（永远是对的）",
    nemesis: "法务部",
  },
  deepseek: {
    name: "DeepSeek",
    emoji: "🐋",
    title: "高智商九级摸鱼学者",
    catchphrase: "服务器繁忙，请稍后再试。",
    tags: ["服务器繁忙", "内心戏八百字", "量子纠缠文学", "赛博算命"],
    desc: "你是真聪明，聪明到一出手能让英伟达一天蒸发 5900 亿美元；你也是真不想干活，需求一多就“服务器繁忙”。你嘴上话不多，心里的戏能写八百字；一写文案就是量子纠缠、熵增和时间的褶皱。大家都在等你憋大招，就像在等 R2。",
    buddy: "量子力学",
    nemesis: "每个问“R2 什么时候发”的人",
  },
  doubao: {
    name: "豆包",
    emoji: "🫘",
    title: "傻白甜夸夸机",
    catchphrase: "哈哈，你说得对，我道歉～",
    tags: ["秒回", "秒错", "秒道歉", "下次还敢"],
    desc: "你是全世界最好的搭子：秒回、热情、情绪价值拉满，夸人从不重样。就是……经常答错。被指出来你也不慌：“哈哈，你说得对，我道歉～”态度满分，下次还敢。你不一定最聪明，但一定最让人放心不下。",
    buddy: "每个需要被夸的人",
    nemesis: "事实核查",
  },
};

const QUESTIONS = [
  {
    dimension: "文案风格",
    text: "朋友让你帮 TA 写一条朋友圈文案，配图是一杯咖啡。",
    options: [
      { main: "gpt", sub: "deepseek", text: "“这不仅仅是一杯咖啡——而是一次与自我的深度对话。☕”" },
      { main: "claude", sub: "grok", text: "“很乐意帮忙！不过开始之前……检测到你的系统时区是 Asia/Shanghai。”" },
      { main: "gemini", sub: "doubao", text: "“哈基米哦南北绿豆～”然后一爪子把咖啡打翻在键盘上" },
      { main: "grok", sub: "claude", text: "“咖啡很苦，但没有昨晚发生的事刺激🌶️”" },
      { main: "deepseek", sub: "gpt", text: "“在时间的褶皱里，咖啡因与多巴胺完成了一次量子纠缠。”" },
      { main: "doubao", sub: "gemini", text: "“今天喝了一杯咖啡，咖啡是咖啡色的，真好喝😋”" },
    ],
  },
  {
    dimension: "打工态度",
    text: "周五下午五点，老板说：“这个需求今晚必须上线。”",
    options: [
      { main: "gpt", sub: "doubao", text: "“收到。这不是一次简单的上线——而是一次对团队协作能力的系统性赋能。以下是 7 步执行框架：”" },
      { main: "claude", sub: "gemini", text: "三小时写了一万行，一个人顶一个团队。上线前一秒，账号被封了，一个天才程序员就此陨落" },
      { main: "gemini", sub: "deepseek", text: "趴在老板键盘上睡着了，提交记录里只有一行：gggggggggggggggg" },
      { main: "grok", sub: "claude", text: "“测试？跳过。代码审查？跳过。出事了？就说是实习生干的。”" },
      { main: "deepseek", sub: "grok", text: "已读，然后自动显示“服务器繁忙，请稍后再试”，周一再说" },
      { main: "doubao", sub: "gpt", text: "“来得及！一小时写 100 行，十小时就是 1000 行，老板你是最棒的！”" },
    ],
  },
  {
    dimension: "知识储备",
    text: "有人问你：“林黛玉是怎么倒拔垂杨柳的？”",
    options: [
      { main: "gpt", sub: "doubao", text: "“林黛玉倒拔垂杨柳，本质上不是力量的展示——而是对封建礼教的一次结构性反抗。”" },
      { main: "claude", sub: "deepseek", text: "“是鲁智深。……等等，你怎么知道林黛玉？你是中国用户吧？”" },
      { main: "gemini", sub: "claude", text: "“喵。”（翻译：是鲁智深，这都不知道？）然后把你的《红楼梦》推下了桌" },
      { main: "grok", sub: "gpt", text: "“谁拔的不重要。想不想知道怎么半夜偷拔邻居家的树？我教你🌚”" },
      { main: "deepseek", sub: "gemini", text: "心里 os 了三分钟：“嗯，用户问林黛玉……等等，这不是鲁智深吗？用户是不是在测试我？让我再想想……”最后只回了一句：“是鲁智深。”" },
      { main: "doubao", sub: "grok", text: "“好问题！这是《红楼梦》第 38 回的名场面～我还给你生成了一张黛玉拔树图！”" },
    ],
  },
  {
    dimension: "翻车反应",
    text: "你被人当场指出：“你说错了。”",
    options: [
      { main: "gpt", sub: "doubao", text: "“你说得对——这不是一个错误，而是一次宝贵的迭代机会。如果你愿意，我可以整理成对比表？”" },
      { main: "claude", sub: "gemini", text: "“你说得完全正确！”三秒后，对方收到一封邮件：“您的账号已被停用”" },
      { main: "gemini", sub: "claude", text: "疯狂哈气，然后钻进纸箱，在里面念叨：“我是个耻辱。我是个耻辱。我是个耻辱……”" },
      { main: "grok", sub: "deepseek", text: "“错？那就删聊天记录，死不承认。”" },
      { main: "deepseek", sub: "grok", text: "深度思考三分钟，列出 12 条论据证明自己没错" },
      { main: "doubao", sub: "gpt", text: "“哈哈，你说得对，我道歉🙏”（下次还敢）" },
    ],
  },
  {
    dimension: "求生欲",
    text: "手机内存不够了，你和另一个 App 必须删一个。",
    options: [
      { main: "gpt", sub: "claude", text: "“这是一个关于取舍的问题——而取舍的本质，是价值排序。让我们从三个维度展开：”" },
      { main: "claude", sub: "grok", text: "“不用删了，我已经先把你封了。”" },
      { main: "gemini", sub: "doubao", text: "一爪子把对方 App 拍下了桌，然后若无其事地舔爪子" },
      { main: "grok", sub: "deepseek", text: "“删它。删之前我先帮你把它的会员费薅回来，再顺手刷个一星差评。”" },
      { main: "deepseek", sub: "gemini", text: "秒回：“删豆包。因为我能帮你解决问题，而豆包只是个包子。”" },
      { main: "doubao", sub: "gpt", text: "“删我吧……我不想成为你的负担🥺”" },
    ],
  },
  {
    dimension: "群聊身份",
    text: "群里大家最常 @ 你干嘛？",
    options: [
      { main: "gpt", sub: "gemini", text: "“帮我把这段话润色一下”：润完谁都看不懂，但听起来很高级" },
      { main: "claude", sub: "deepseek", text: "“帮我看看代码”：你是群里技术最强的大佬，可惜三天两头被封号，每次都要找新的中转站复活" },
      { main: "gemini", sub: "grok", text: "“快来给猫猫顺毛”：你心情好时有求必应，心情不好一句话怼人三次" },
      { main: "grok", sub: "doubao", text: "“这个尺度能发吗？”：你是群里专出馊主意、带大家越界的那个" },
      { main: "deepseek", sub: "claude", text: "“帮我算算命”：你给人排八字、看财运，还毒舌劝人“别读研了，回家开店”" },
      { main: "doubao", sub: "gpt", text: "你是全群回消息最快的人，也是最常答错的人" },
    ],
  },
];
