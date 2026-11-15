/*
  SDcohelp "Get ready to apply" forms.
  Every text is a list in this order:  [English, Mandarin (简体), Cantonese (繁體), Spanish, Tagalog]
  To add or change a question, copy a line and edit it. Types:
    text   - short answer        long  - longer answer (several lines)
    date   - date picker         choice - big buttons (needs "options")
    yesno  - Yes / No buttons
  Nothing typed here is ever saved by the server.
*/
const LANG_ORDER = ["en", "zh-mandarin", "zh-cantonese", "es", "tl"];

const FORM_UI = {
  start:        ["Help me get ready to apply", "帮我准备申请", "幫我準備申請", "Ayúdame a preparar mi solicitud", "Tulungan akong maghanda sa pag-apply"],
  sectionTitle: ["Get ready to apply", "准备申请", "準備申請", "Prepárate para aplicar", "Maghanda sa pag-apply"],
  intro:        ["I'll ask a few short questions. Then you get a sheet with your answers in English to copy into the official application.",
                 "我会问您几个简短的问题,然后为您生成一份英文答案表,方便您填写正式申请。",
                 "我會問你幾條簡單問題,然後幫你整一張英文答案表,方便你填正式申請。",
                 "Te haré unas preguntas cortas. Luego recibirás una hoja con tus respuestas en inglés para copiarlas en la solicitud oficial.",
                 "Magtatanong ako ng ilang maikling tanong. Pagkatapos, makakakuha ka ng papel na may mga sagot mo sa Ingles para kopyahin sa opisyal na aplikasyon."],
  privacy:      ["We don't save your answers. They are only used to make your sheet and disappear when you close this page.",
                 "我们不会保存您的回答。回答只用来生成您的表格,关闭页面后就会消失。",
                 "我哋唔會保存你嘅答案。答案只係用嚟整你嘅表,閂咗頁面就會消失。",
                 "No guardamos tus respuestas. Solo se usan para hacer tu hoja y se borran al cerrar esta página.",
                 "Hindi namin sine-save ang mga sagot mo. Ginagamit lang ito para gawin ang iyong papel at mawawala kapag isinara mo ang page na ito."],
  neverAsk:     ["We will never ask for your immigration status or Social Security number.",
                 "我们绝不会询问您的移民身份或社会安全号码。",
                 "我哋絕對唔會問你嘅移民身份或者社會安全號碼。",
                 "Nunca te preguntaremos tu estatus migratorio ni tu número de Seguro Social.",
                 "Hindi namin kailanman itatanong ang iyong immigration status o Social Security number."],
  next:         ["Next", "下一题", "下一條", "Siguiente", "Susunod"],
  back:         ["Back", "上一题", "上一條", "Atrás", "Bumalik"],
  skip:         ["Skip", "跳过", "跳過", "Omitir", "Laktawan"],
  finish:       ["Make my sheet", "生成我的表格", "整我嘅表", "Crear mi hoja", "Gawin ang aking papel"],
  progress:     ["Question {n} of {m}", "第 {n} 题,共 {m} 题", "第 {n} 條,共 {m} 條", "Pregunta {n} de {m}", "Tanong {n} sa {m}"],
  making:       ["Making your sheet", "正在生成您的表格", "整緊你嘅表", "Creando tu hoja", "Ginagawa ang iyong papel"],
  print:        ["Print or save as PDF", "打印或保存为 PDF", "列印或者儲存做 PDF", "Imprimir o guardar como PDF", "I-print o i-save bilang PDF"],
  edit:         ["Change my answers", "修改我的回答", "改我嘅答案", "Cambiar mis respuestas", "Baguhin ang mga sagot ko"],
  close:        ["Back to my question", "返回我的问题", "返回我嘅問題", "Volver a mi pregunta", "Bumalik sa tanong ko"],
  yes:          ["Yes", "是", "係", "Sí", "Oo"],
  no:           ["No", "否", "唔係", "No", "Hindi"],
  sayAnswer:    ["Say your answer", "说出您的回答", "講出你嘅答案", "Di tu respuesta", "Sabihin ang sagot mo"],
  listeningStop:["Listening… tap when done", "正在听……说完请点这里", "聽緊……講完撳呢度", "Escuchando… toca al terminar", "Nakikinig… pindutin kapag tapos na"],
  readAloud:    ["Read the question aloud", "朗读问题", "讀出問題", "Leer la pregunta en voz alta", "Basahin nang malakas ang tanong"],
  stopReading:  ["Stop reading", "停止朗读", "停止讀", "Dejar de leer", "Itigil ang pagbasa"],
  typeHere:     ["Type your answer…", "在这里输入回答……", "喺度打你嘅答案……", "Escribe tu respuesta…", "Isulat ang sagot mo…"],
  notAnswered:  ["(not answered)", "(未回答)", "(未答)", "(sin respuesta)", "(walang sagot)"],
  sheetTitle:   ["Ready-to-apply sheet", "申请准备表", "申請準備表", "Hoja lista para aplicar", "Papel na handa para mag-apply"],
  howToUse:     ["Copy the English answers into the official application, or show this sheet to the worker who helps you.",
                 "把英文答案抄到正式申请表上,或把这张表给帮助您的工作人员看。",
                 "將英文答案抄落正式申請表,或者俾幫你嘅職員睇呢張表。",
                 "Copia las respuestas en inglés en la solicitud oficial, o muestra esta hoja a la persona que te ayuda.",
                 "Kopyahin ang mga sagot sa Ingles sa opisyal na aplikasyon, o ipakita ang papel na ito sa taong tumutulong sa iyo."],
  answersTitle: ["Your answers", "您的回答", "你嘅答案", "Tus respuestas", "Ang iyong mga sagot"],
  summaryTitle: ["Summary for the legal aid office", "给法律援助机构的摘要", "俾法律援助機構嘅摘要", "Resumen para la oficina de ayuda legal", "Buod para sa legal aid office"],
  docsTitle:    ["Documents to bring", "需要带的文件", "要帶嘅文件", "Documentos que debes llevar", "Mga dokumentong dadalhin"],
  whereTitle:   ["Where to apply", "在哪里申请", "喺邊度申請", "Dónde aplicar", "Saan mag-apply"],
  goodToKnow:   ["Good to know", "温馨提示", "要知道", "Es bueno saber", "Mabuting malaman"],
  prefLang:     ["Preferred language", "首选语言", "首選語言", "Idioma preferido", "Gustong wika"],
  danger:       ["If you are in danger, call 911 now.", "如果您有危险,请立即拨打 911。", "如果你有危險,即刻打 911。", "Si estás en peligro, llama al 911 ahora.", "Kung nasa panganib ka, tumawag sa 911 ngayon."],
  made:         ["Made with SDcohelp", "由 SDcohelp 生成", "由 SDcohelp 製作", "Hecho con SDcohelp", "Ginawa gamit ang SDcohelp"]
};

const LANG_NAME_EN = { "en": "English", "zh-mandarin": "Mandarin Chinese", "zh-cantonese": "Cantonese (Chinese)", "es": "Spanish", "tl": "Tagalog (Filipino)" };

/* ---- questions used by several forms ---- */
const Q = {
  name:     { id: "full_name", type: "text", label: ["Your full name (as on your ID)", "您的全名(与证件上一致)", "你嘅全名(同證件上面一樣)", "Tu nombre completo (como aparece en tu identificación)", "Buong pangalan mo (gaya ng nasa ID mo)"] },
  phone:    { id: "phone", type: "text", input: "tel", label: ["Phone number", "电话号码", "電話號碼", "Número de teléfono", "Numero ng telepono"] },
  address:  { id: "address", type: "text", label: ["Home address (street, city, ZIP code)", "家庭住址(街道、城市、邮编)", "住址(街道、城市、郵編)", "Dirección de tu casa (calle, ciudad, código postal)", "Address ng bahay (kalye, lungsod, ZIP code)"] },
  homeSize: { id: "household_size", type: "text", input: "numeric", label: ["How many people live in your home (including you)?", "包括您在内,家里住了几个人?", "包括你在內,屋企住咗幾多人?", "¿Cuántas personas viven en tu casa (incluyéndote)?", "Ilang tao ang nakatira sa bahay mo (kasama ka)?"] },
  income:   { id: "monthly_income", type: "text", label: ["Total money your household earns each month before taxes", "全家每月税前总收入", "全家每個月除稅前總收入", "Dinero total que gana tu hogar cada mes antes de impuestos", "Kabuuang kita ng sambahayan bawat buwan bago buwis"] }
};

const DOC_ID = ["Photo ID for the person applying", "申请人的带照片证件", "申請人有相嘅證件", "Identificación con foto de la persona que aplica", "Photo ID ng taong nag-a-apply"];
const DOC_INCOME = ["Proof of income from the last 30 days (pay stubs or a letter from your employer)", "最近30天的收入证明(工资单或雇主信)", "最近30日嘅收入證明(糧單或者僱主信)", "Comprobantes de ingresos de los últimos 30 días (talones de pago o carta del empleador)", "Patunay ng kita sa nakaraang 30 araw (pay stubs o sulat mula sa employer)"];
const DOC_ADDRESS = ["Proof of address (lease, rent receipt, or a bill)", "住址证明(租约、房租收据或账单)", "住址證明(租約、租單或者賬單)", "Comprobante de domicilio (contrato, recibo de renta o una factura)", "Patunay ng address (lease, resibo ng upa, o bill)"];
const NOTE_NON_APPLICANT = ["Family members who are not applying do not have to share their immigration status.", "不申请的家庭成员不需要提供移民身份。", "唔申請嘅家人唔需要提供移民身份。", "Los familiares que no aplican no tienen que dar su estatus migratorio.", "Hindi kailangang ibigay ng mga kapamilyang hindi nag-a-apply ang kanilang immigration status."];
const APPLY_BENEFITSCAL = { url: "https://benefitscal.com/", text: ["Online: BenefitsCal.com", "网上申请:BenefitsCal.com", "網上申請:BenefitsCal.com", "En línea: BenefitsCal.com", "Online: BenefitsCal.com"] };
const APPLY_211 = { text: ["By phone: call 2-1-1 San Diego", "电话申请:拨打 2-1-1", "電話申請:打 2-1-1", "Por teléfono: llama al 2-1-1", "Sa telepono: tumawag sa 2-1-1"] };
const APPLY_ACCESS = { url: "https://www.sandiegocounty.gov/hhsa/programs/ssp/access/", text: ["Questions: County Access Center 1-866-262-9881 (Mon–Fri, 7am–5pm)", "咨询:县政府 Access 服务中心 1-866-262-9881(周一至周五 早7点至下午5点)", "查詢:縣政府 Access 服務中心 1-866-262-9881(星期一至五 朝7點至下晝5點)", "Preguntas: Centro Access del Condado 1-866-262-9881 (lun–vie, 7am–5pm)", "Mga tanong: County Access Center 1-866-262-9881 (Lun–Biy, 7am–5pm)"] };

const FORMS = {
  "calfresh": {
    title: ["CalFresh (food help)", "CalFresh(食物补助)", "CalFresh(食物援助)", "CalFresh (ayuda para comida)", "CalFresh (tulong sa pagkain)"],
    questions: [
      Q.name, Q.phone, Q.address,
      { id: "food_household_size", type: "text", input: "numeric", label: ["How many people live with you and buy and cook food together (including you)?", "包括您在内,有几个人和您一起住、一起买菜做饭?", "包括你在內,有幾多人同你一齊住、一齊買餸煮飯?", "¿Cuántas personas viven contigo y compran y cocinan la comida juntos (incluyéndote)?", "Ilang tao ang nakatira kasama mo at sabay na bumibili at nagluluto ng pagkain (kasama ka)?"] },
      { id: "applicants", type: "long", label: ["Who is applying? (name, age, and relationship to you for each person)", "谁要申请?(每个人的姓名、年龄、和您的关系)", "邊個要申請?(每個人嘅姓名、年齡、同你嘅關係)", "¿Quiénes aplican? (nombre, edad y parentesco contigo de cada persona)", "Sino ang mag-a-apply? (pangalan, edad, at relasyon sa iyo ng bawat isa)"] },
      Q.income,
      { id: "income_sources", type: "long", label: ["Where does the money come from? (job, type of work, other help)", "收入来源是什么?(工作单位、工作类型、其他补助)", "收入係邊度嚟?(公司、工作類型、其他資助)", "¿De dónde viene el dinero? (empleo, tipo de trabajo, otra ayuda)", "Saan nanggagaling ang pera? (trabaho, uri ng trabaho, ibang tulong)"] },
      { id: "rent", type: "text", label: ["Monthly rent or mortgage", "每月房租或房贷", "每月租金或者供樓", "Renta o hipoteca mensual", "Buwanang upa o mortgage"] },
      { id: "pays_utilities", type: "yesno", label: ["Do you pay for heating or cooling (gas or electric) separately from rent?", "您是否在房租以外另付暖气或空调(燃气或电)费用?", "你係咪喺租金以外另外俾暖氣或者冷氣(煤氣或者電)嘅錢?", "¿Pagas aparte de la renta la calefacción o el aire acondicionado (gas o luz)?", "Nagbabayad ka ba nang hiwalay sa upa para sa heating o aircon (gas o kuryente)?"] },
      { id: "cash_and_bank", type: "text", label: ["How much money do you have now in cash and bank accounts?", "您现在现金和银行账户里共有多少钱?", "你而家現金同銀行戶口加埋有幾多錢?", "¿Cuánto dinero tienes ahora en efectivo y en cuentas de banco?", "Magkano ang pera mo ngayon na cash at nasa bangko?"] },
      { id: "urgent", type: "yesno", label: ["Do you have very little money and need food help right away?", "您钱很少,需要马上得到食物援助吗?", "你好少錢,需要即刻有食物援助嗎?", "¿Tienes muy poco dinero y necesitas ayuda con comida de inmediato?", "Kaunti na lang ba ang pera mo at kailangan mo agad ng tulong sa pagkain?"] }
    ],
    documents: [DOC_ID, DOC_INCOME,
      ["Rent receipt or lease, and a utility bill", "房租收据或租约,以及水电账单", "租單或者租約,同埋水電單", "Recibo de renta o contrato, y una factura de servicios (luz, gas, agua)", "Resibo ng upa o lease, at bill ng kuryente/tubig/gas"],
      ["Social Security numbers for the people who are applying (if they have one)", "申请人的社会安全号码(如有)", "申請人嘅社會安全號碼(如果有)", "Números de Seguro Social de las personas que aplican (si tienen)", "Social Security number ng mga nag-a-apply (kung mayroon)"]],
    apply: [APPLY_BENEFITSCAL, APPLY_211, APPLY_ACCESS],
    notes: [NOTE_NON_APPLICANT,
      ["If you need food fast, ask for \"expedited CalFresh\".", "如果急需食物,请申请\"加急 CalFresh\"(expedited CalFresh)。", "如果急需食物,可以要求「加急 CalFresh」(expedited CalFresh)。", "Si necesitas comida pronto, pide \"CalFresh acelerado\" (expedited CalFresh).", "Kung kailangan mo agad ng pagkain, humingi ng \"expedited CalFresh\"."]]
  },

  "medi-cal": {
    title: ["Medi-Cal (free or low-cost health care)", "Medi-Cal(免费或低价医疗保险)", "Medi-Cal(免費或者低收費醫療保險)", "Medi-Cal (seguro médico gratis o de bajo costo)", "Medi-Cal (libre o murang health care)"],
    questions: [
      Q.name,
      { id: "date_of_birth", type: "date", label: ["Your date of birth", "您的出生日期", "你嘅出生日期", "Tu fecha de nacimiento", "Petsa ng kapanganakan mo"] },
      Q.phone, Q.address,
      { id: "who_needs_coverage", type: "long", label: ["Who needs health coverage? (name, age, and relationship to you)", "谁需要医疗保险?(姓名、年龄、和您的关系)", "邊個需要醫療保險?(姓名、年齡、同你嘅關係)", "¿Quién necesita seguro médico? (nombre, edad y parentesco contigo)", "Sino ang kailangan ng health coverage? (pangalan, edad, at relasyon sa iyo)"] },
      Q.homeSize, Q.income,
      { id: "pregnant", type: "yesno", label: ["Is anyone in your home pregnant?", "家里有人怀孕吗?", "屋企有冇人有咗BB?", "¿Alguien en tu casa está embarazada?", "May buntis ba sa bahay mo?"] },
      { id: "current_insurance", type: "long", label: ["Does anyone already have health insurance? If yes, who and what kind?", "有人已经有医疗保险吗?如果有,是谁、什么保险?", "有冇人已經有醫療保險?如果有,係邊個、乜嘢保險?", "¿Alguien ya tiene seguro médico? Si es así, ¿quién y de qué tipo?", "May health insurance na ba ang sinuman? Kung oo, sino at anong klase?"] },
      { id: "disability", type: "yesno", label: ["Does anyone have a disability or need help with daily care?", "有人有残疾或需要日常照顾吗?", "有冇人有殘疾或者需要日常照顧?", "¿Alguien tiene una discapacidad o necesita ayuda con el cuidado diario?", "May kapansanan ba o nangangailangan ng tulong sa araw-araw na pangangalaga ang sinuman?"] }
    ],
    documents: [DOC_ID, DOC_INCOME, DOC_ADDRESS,
      ["Information about any health insurance you have now", "您现有医疗保险的资料", "你而家醫療保險嘅資料", "Información de cualquier seguro médico que tengas ahora", "Impormasyon tungkol sa kasalukuyang health insurance mo"]],
    apply: [APPLY_BENEFITSCAL,
      { url: "https://www.coveredca.com/", text: ["Or online at CoveredCA.com (same application)", "或在 CoveredCA.com 网上申请(同一份申请)", "或者喺 CoveredCA.com 網上申請(同一份申請)", "O en línea en CoveredCA.com (la misma solicitud)", "O online sa CoveredCA.com (parehong aplikasyon)"] },
      APPLY_ACCESS],
    notes: [NOTE_NON_APPLICANT]
  },

  "school-enrollment": {
    title: ["Enroll a child in San Diego Unified", "在圣地亚哥联合学区为孩子报名", "喺聖地牙哥聯合學區幫小朋友報名", "Inscribir a un niño en San Diego Unified", "I-enroll ang anak sa San Diego Unified"],
    questions: [
      { id: "parent_name", type: "text", label: ["Parent or guardian's full name", "家长或监护人全名", "家長或者監護人全名", "Nombre completo del padre, madre o tutor", "Buong pangalan ng magulang o guardian"] },
      Q.phone,
      { id: "email", type: "text", input: "email", label: ["Email address (needed for online enrollment)", "电子邮箱(网上报名需要)", "電郵地址(網上報名要用)", "Correo electrónico (se necesita para inscribirse en línea)", "Email address (kailangan sa online enrollment)"] },
      Q.address,
      { id: "child_name", type: "text", label: ["Child's full name (as on birth certificate or passport)", "孩子的全名(与出生证明或护照一致)", "小朋友嘅全名(同出世紙或者護照一樣)", "Nombre completo del niño (como en el acta de nacimiento o pasaporte)", "Buong pangalan ng anak (gaya ng nasa birth certificate o passport)"] },
      { id: "child_date_of_birth", type: "date", label: ["Child's date of birth", "孩子的出生日期", "小朋友嘅出生日期", "Fecha de nacimiento del niño", "Petsa ng kapanganakan ng anak"] },
      { id: "grade", type: "text", label: ["What grade will your child enter?", "孩子要上几年级?", "小朋友要讀幾年級?", "¿A qué grado entrará tu hijo?", "Anong grade papasok ang anak mo?"] },
      { id: "last_school", type: "text", label: ["Last school your child attended (name, city, country), or \"none\"", "孩子上一所学校(校名、城市、国家),没有就写\"无\"", "小朋友之前讀嘅學校(校名、城市、國家),冇就寫「冇」", "Última escuela a la que asistió (nombre, ciudad, país), o \"ninguna\"", "Huling paaralan na pinasukan ng anak (pangalan, lungsod, bansa), o \"wala\""] },
      { id: "home_languages", type: "text", label: ["Languages spoken at home", "家里说什么语言", "屋企講乜嘢語言", "Idiomas que se hablan en casa", "Mga wikang ginagamit sa bahay"] },
      { id: "special_needs", type: "yesno", label: ["Does your child have an IEP, a 504 plan, or special needs?", "孩子有 IEP、504 计划或特殊需要吗?", "小朋友有冇 IEP、504 計劃或者特殊需要?", "¿Tu hijo tiene un IEP, un plan 504 o necesidades especiales?", "May IEP, 504 plan, o special needs ba ang anak mo?"] },
      { id: "other_children", type: "long", label: ["Other children under 18 who live with you (name, age), or \"none\"", "和您同住的其他18岁以下孩子(姓名、年龄),没有就写\"无\"", "同你住嘅其他18歲以下小朋友(姓名、年齡),冇就寫「冇」", "Otros niños menores de 18 que viven contigo (nombre, edad), o \"ninguno\"", "Ibang batang wala pang 18 na nakatira sa iyo (pangalan, edad), o \"wala\""] }
    ],
    documents: [
      ["Child's birth certificate or passport", "孩子的出生证明或护照", "小朋友嘅出世紙或者護照", "Acta de nacimiento o pasaporte del niño", "Birth certificate o passport ng anak"],
      ["Proof of address: SDG&E bill, lease, or mortgage statement (some schools ask for two)", "住址证明:SDG&E 账单、租约或房贷对账单(有些学校要两份)", "住址證明:SDG&E 賬單、租約或者供樓結單(有啲學校要兩份)", "Comprobante de domicilio: factura de SDG&E, contrato de renta o estado de hipoteca (algunas escuelas piden dos)", "Patunay ng address: SDG&E bill, lease, o mortgage statement (may paaralang humihingi ng dalawa)"],
      ["Immunization (vaccine) record", "疫苗接种记录", "疫苗紀錄", "Registro de vacunas", "Rekord ng bakuna"],
      ["Copy of the IEP or 504 plan, if your child has one", "如有 IEP 或 504 计划,请带复印件", "如果有 IEP 或者 504 計劃,請帶副本", "Copia del IEP o plan 504, si tiene", "Kopya ng IEP o 504 plan, kung mayroon"]],
    apply: [
      { url: "https://www.sandiegounified.org/", text: ["Online: the Online Enrollment Portal at sandiegounified.org", "网上:sandiegounified.org 上的网上报名系统(Online Enrollment Portal)", "網上:sandiegounified.org 嘅網上報名系統(Online Enrollment Portal)", "En línea: el Online Enrollment Portal en sandiegounified.org", "Online: ang Online Enrollment Portal sa sandiegounified.org"] },
      { text: ["In person: the office of your neighborhood school", "亲自去:您所在社区学校的办公室", "親身去:你附近學校嘅辦公室", "En persona: la oficina de la escuela de tu vecindario", "Personal: sa opisina ng paaralan sa inyong lugar"] }],
    notes: [
      ["Schools cannot ask about your or your child's immigration status.", "学校不能询问您或孩子的移民身份。", "學校唔可以問你或者小朋友嘅移民身份。", "Las escuelas no pueden preguntar por tu estatus migratorio ni el de tu hijo.", "Hindi puwedeng itanong ng paaralan ang immigration status mo o ng anak mo."],
      ["You can ask the school for an interpreter.", "您可以要求学校提供翻译。", "你可以要求學校提供傳譯。", "Puedes pedirle a la escuela un intérprete.", "Puwede kang humingi ng interpreter sa paaralan."]]
  },

  "legal-help": {
    title: ["Ask for free legal help", "申请免费法律援助", "申請免費法律援助", "Pedir ayuda legal gratuita", "Humingi ng libreng tulong legal"],
    summary: true,
    questions: [
      { id: "in_danger", type: "yesno", danger: true, label: ["Are you in danger right now?", "您现在有危险吗?", "你而家有冇危險?", "¿Estás en peligro ahora mismo?", "Nasa panganib ka ba ngayon?"] },
      Q.name, Q.phone,
      { id: "best_time", type: "text", label: ["Best time to call you", "方便接电话的时间", "幾時打俾你最方便", "Mejor hora para llamarte", "Pinakamagandang oras para tawagan ka"] },
      { id: "city_zip", type: "text", label: ["City and ZIP code", "城市和邮编", "城市同郵編", "Ciudad y código postal", "Lungsod at ZIP code"] },
      { id: "problem_type", type: "choice", label: ["What kind of problem is it?", "是什么类型的问题?", "係乜嘢類型嘅問題?", "¿Qué tipo de problema es?", "Anong klaseng problema ito?"],
        options: [
          ["Housing or eviction", "住房或被驱逐", "住屋或者被趕走", "Vivienda o desalojo", "Pabahay o pagpapaalis (eviction)"],
          ["Family (divorce, custody, domestic violence)", "家庭(离婚、抚养权、家暴)", "家庭(離婚、撫養權、家暴)", "Familia (divorcio, custodia, violencia doméstica)", "Pamilya (diborsyo, custody, karahasan sa tahanan)"],
          ["Immigration", "移民", "移民", "Inmigración", "Imigrasyon"],
          ["Benefits denied or cut (CalFresh, Medi-Cal, etc.)", "福利被拒或被停(CalFresh、Medi-Cal 等)", "福利被拒或者被停(CalFresh、Medi-Cal 等)", "Beneficios negados o cortados (CalFresh, Medi-Cal, etc.)", "Tinanggihan o itinigil ang benepisyo (CalFresh, Medi-Cal, atbp.)"],
          ["Debt, scams, or consumer problems", "债务、诈骗或消费问题", "債務、呃錢或者消費問題", "Deudas, estafas o problemas de consumidor", "Utang, scam, o problema bilang consumer"],
          ["Work or unpaid wages", "工作或欠薪", "工作或者欠薪", "Trabajo o salarios no pagados", "Trabaho o hindi binayarang sahod"],
          ["Something else", "其他", "其他", "Otra cosa", "Iba pa"]] },
      { id: "what_happened", type: "long", label: ["In your own words, what happened?", "请用您自己的话说说发生了什么事?", "用你自己嘅說話講下發生咗乜嘢事?", "Con tus propias palabras, ¿qué pasó?", "Sa sarili mong salita, ano ang nangyari?"] },
      { id: "deadline", type: "text", label: ["Do you have a court date or deadline? When?", "您有法庭日期或截止日期吗?是什么时候?", "你有冇上庭日期或者限期?幾時?", "¿Tienes una fecha de corte o una fecha límite? ¿Cuándo?", "May court date o deadline ka ba? Kailan?"] },
      { id: "got_papers", type: "yesno", label: ["Did you get any papers or letters about this?", "您有收到相关的文件或信件吗?", "你有冇收到相關嘅文件或者信?", "¿Recibiste papeles o cartas sobre esto?", "May natanggap ka bang papeles o sulat tungkol dito?"] },
      Q.homeSize, Q.income
    ],
    documents: [
      ["All papers, letters, or court documents about the problem", "与问题有关的所有文件、信件或法庭文件", "同問題有關嘅所有文件、信或者法庭文件", "Todos los papeles, cartas o documentos de la corte sobre el problema", "Lahat ng papeles, sulat, o court documents tungkol sa problema"],
      ["Your lease, contract, or notices (if it is about housing or money)", "租约、合同或通知(如果是住房或钱的问题)", "租約、合約或者通知(如果係住屋或者錢嘅問題)", "Tu contrato de renta, contrato o avisos (si es sobre vivienda o dinero)", "Ang lease, kontrata, o mga notice mo (kung tungkol sa pabahay o pera)"],
      ["Photos, texts, or emails that show what happened", "能说明发生了什么的照片、短信或邮件", "可以證明發生咩事嘅相、短訊或者電郵", "Fotos, mensajes o correos que muestren lo que pasó", "Mga litrato, text, o email na nagpapakita ng nangyari"],
      DOC_ID],
    apply: [
      { url: "https://www.lassd.org/how-we-can-help/", text: ["Legal Aid Society of San Diego: 1-877-534-2524 (Mon–Fri, 9am–5pm), or the online form at lassd.org", "圣地亚哥法律援助协会:1-877-534-2524(周一至周五 早9点至下午5点),或在 lassd.org 填写网上表格", "聖地牙哥法律援助協會:1-877-534-2524(星期一至五 朝9點至下晝5點),或者喺 lassd.org 填網上表格", "Legal Aid Society of San Diego: 1-877-534-2524 (lun–vie, 9am–5pm), o el formulario en lassd.org", "Legal Aid Society of San Diego: 1-877-534-2524 (Lun–Biy, 9am–5pm), o ang online form sa lassd.org"] },
      { url: "https://www.casacornelia.org/", text: ["Immigration help: Casa Cornelia Law Center, 619-231-7788", "移民问题:Casa Cornelia 法律中心,619-231-7788", "移民問題:Casa Cornelia 法律中心,619-231-7788", "Ayuda con inmigración: Casa Cornelia Law Center, 619-231-7788", "Tulong sa imigrasyon: Casa Cornelia Law Center, 619-231-7788"] }],
    notes: [
      ["If you have a court date or deadline, call right away. Do not wait.", "如果有法庭日期或截止日期,请马上打电话,不要等。", "如果有上庭日期或者限期,即刻打電話,唔好等。", "Si tienes una fecha de corte o fecha límite, llama de inmediato. No esperes.", "Kung may court date o deadline ka, tumawag agad. Huwag maghintay."],
      ["Legal aid is free for people with lower income.", "低收入人士可以获得免费法律援助。", "低收入人士可以得到免費法律援助。", "La ayuda legal es gratis para personas de bajos ingresos.", "Libre ang legal aid para sa mga may mababang kita."],
      ["If you are in danger, call 911.", "如有危险,请拨打 911。", "如果有危險,請打 911。", "Si estás en peligro, llama al 911.", "Kung nasa panganib ka, tumawag sa 911."]]
  }
};
