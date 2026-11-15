/* Text for the menu bar, home page, About and Guide.
   Each list: [English, Mandarin (简体), Cantonese (繁體), Spanish, Tagalog] */
const SITE_UI = {
  home:      ["Home", "首页", "主頁", "Inicio", "Home"],
  about:     ["About", "关于", "關於", "Acerca de", "Tungkol"],
  guide:     ["Guide", "使用指南", "使用指南", "Guía", "Gabay"],
  heroTitle: ["Get the support you need.", "获得您需要的帮助。", "搵到你需要嘅幫助。", "Recibe la ayuda que necesitas.", "Makuha ang tulong na kailangan mo."],
  heroSub:   ["Simple. Local. Reliable.", "简单 · 本地 · 可靠", "簡單 · 本地 · 可靠", "Simple. Local. Confiable.", "Simple. Lokal. Maaasahan."],
  popular:   ["Popular resources", "常用资源", "常用資源", "Recursos populares", "Mga madalas hanapin"],
  colShot:   ["How do I get to the application form on the website?", "如何在网站上找到申请表?", "點樣喺網站搵到申請表?", "¿Cómo llego al formulario de solicitud en el sitio web?", "Paano pumunta sa application form sa website?"],
  colForm:   ["Help me fill out the form", "帮我填写申请表", "幫我填申請表", "Ayúdame a llenar el formulario", "Tulungan akong punan ang form"],
  colFormTxt:["Answer a few questions in your language. You get a sheet with your answers in English.", "用您的语言回答几个问题,就能得到一份英文答案表。", "用你嘅語言答幾條問題,就會有一張英文答案表。", "Contesta unas preguntas en tu idioma. Recibirás una hoja con tus respuestas en inglés.", "Sagutin ang ilang tanong sa iyong wika. Makakakuha ka ng papel na may sagot mo sa Ingles."],
  pasteHere: ["📋 Paste a screenshot here (Ctrl+V)", "📋 在这里粘贴截图(Ctrl+V)", "📋 喺度貼上截圖(Ctrl+V)", "📋 Pega una captura aquí (Ctrl+V)", "📋 I-paste dito ang screenshot (Ctrl+V)"],
  howWorks:  ["How does this work?", "这是怎么用的?", "點樣用?", "¿Cómo funciona?", "Paano ito gumagana?"],
  noSources: ["No sources for this answer.", "这个答案没有来源。", "呢個答案冇來源。", "Esta respuesta no tiene fuentes.", "Walang pinagmulan ang sagot na ito."],
  tiles: [
    { icon: "🍎", chip: 0, label: ["Food Assistance", "食物补助", "食物援助", "Ayuda con comida", "Tulong sa pagkain"] },
    { icon: "❤️", chip: 1, label: ["Healthcare", "医疗保险", "醫療保險", "Atención médica", "Health care"] },
    { icon: "🏠", chip: 5, label: ["Housing Support", "住房援助", "住屋援助", "Ayuda con vivienda", "Tulong sa pabahay"] },
    { icon: "🎒", chip: 3, label: ["School Enrollment", "学校报名", "學校報名", "Inscripción escolar", "Pag-enroll sa paaralan"] },
    { icon: "⚖️", chip: 2, label: ["Free Legal Help", "免费法律援助", "免費法律援助", "Ayuda legal gratis", "Libreng tulong legal"] },
    { icon: "📚", chip: 4, label: ["Adult Classes", "成人课程", "成人課程", "Clases para adultos", "Klase para sa adult"] }
  ],
  aboutTitle: ["About SDcohelp", "关于 SDcohelp", "關於 SDcohelp", "Acerca de SDcohelp", "Tungkol sa SDcohelp"],
  aboutText: [
    ["SDcohelp helps immigrant families in San Diego find community, government, legal, and school information in their own language.",
     "SDcohelp 帮助圣地亚哥的移民家庭用自己的语言查找社区、政府、法律和学校信息。",
     "SDcohelp 幫聖地牙哥嘅移民家庭用自己嘅語言搵社區、政府、法律同學校資訊。",
     "SDcohelp ayuda a las familias inmigrantes de San Diego a encontrar información de la comunidad, del gobierno, legal y escolar en su propio idioma.",
     "Tinutulungan ng SDcohelp ang mga pamilyang imigrante sa San Diego na makahanap ng impormasyon tungkol sa komunidad, gobyerno, batas, at paaralan sa sarili nilang wika."],
    ["Answers come from official and trusted websites, and every answer shows where it came from.",
     "答案来自官方和可信的网站,每个答案都会显示信息来源。",
     "答案嚟自官方同可信嘅網站,每個答案都會顯示資料來源。",
     "Las respuestas vienen de sitios web oficiales y confiables, y cada respuesta muestra de dónde viene.",
     "Ang mga sagot ay mula sa opisyal at mapagkakatiwalaang website, at ipinapakita ng bawat sagot kung saan ito galing."],
    ["🔒 We don't save your questions, answers, or screenshots. We never ask for your immigration status.",
     "🔒 我们不会保存您的问题、回答或截图。我们绝不会询问您的移民身份。",
     "🔒 我哋唔會保存你嘅問題、答案或者截圖。我哋絕對唔會問你嘅移民身份。",
     "🔒 No guardamos tus preguntas, respuestas ni capturas. Nunca te preguntamos tu estatus migratorio.",
     "🔒 Hindi namin sine-save ang iyong mga tanong, sagot, o screenshot. Hindi namin kailanman itatanong ang iyong immigration status."]
  ],
  guideTitle: ["How to use SDcohelp", "如何使用 SDcohelp", "點樣用 SDcohelp", "Cómo usar SDcohelp", "Paano gamitin ang SDcohelp"],
  guideSteps: [
    ["Ask a question. Type it, or tap the microphone and speak.", "提问。输入问题,或点麦克风说话。", "問問題。打字,或者撳咪高峰講嘢。", "Haz una pregunta. Escríbela o toca el micrófono y habla.", "Magtanong. I-type ito, o pindutin ang mikropono at magsalita."],
    ["Read or listen to the answer in your language.", "用您的语言阅读或收听答案。", "用你嘅語言睇或者聽答案。", "Lee o escucha la respuesta en tu idioma.", "Basahin o pakinggan ang sagot sa iyong wika."],
    ["Get ready to apply. Answer a few questions and get a sheet with your answers in English.", "准备申请。回答几个问题,获得一份英文答案表。", "準備申請。答幾條問題,攞一張英文答案表。", "Prepárate para aplicar. Contesta unas preguntas y recibe una hoja con tus respuestas en inglés.", "Maghanda sa pag-apply. Sagutin ang ilang tanong at makakuha ng papel na may sagot mo sa Ingles."],
    ["Find the application. Send a screenshot of the website and we'll show you which button to press.", "找到申请表。发送网站截图,我们会告诉您该点哪个按钮。", "搵到申請表。傳網站截圖,我哋話你知要撳邊個掣。", "Encuentra la solicitud. Envía una captura del sitio web y te mostraremos qué botón presionar.", "Hanapin ang aplikasyon. Magpadala ng screenshot ng website at ipapakita namin kung aling button ang pipindutin."]
  ],
  startAsking: ["Ask a question", "提问", "問問題", "Hacer una pregunta", "Magtanong"]
};
