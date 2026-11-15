/*
  Picture guides: "how to get to the real application", with an arrow on each screenshot.
  Screenshots live in static/guides/<form>/  (for example static/guides/calfresh/1.png).

  Each step:
    img:   the screenshot file
    arrow: where the arrow points, in % of the picture  (x: 0 = left edge, 100 = right edge;
           y: 0 = top, 100 = bottom).  from: where the arrow comes from: "top", "bottom", "left", "right"
    text:  caption in [English, Mandarin, Cantonese, Spanish, Tagalog]

  Tip: open the site with  http://localhost:8000/?guideedit  then open a guide and click on a
  picture - it shows the x / y numbers of the spot you clicked.
  A form with no steps simply doesn't show the "Show me how" button.
*/
const GUIDES = {
  "calfresh": { site: "https://benefitscal.com/", steps: [] },
  "medi-cal": { site: "https://benefitscal.com/", steps: [] },
  "school-enrollment": { site: "https://www.sandiegounified.org/", steps: [] },
  "legal-help": { site: "https://www.lassd.org/how-we-can-help/", steps: [] }
};

const GUIDE_UI = {
  show:   ["Show me how (with pictures)", "教我怎么做(看图)", "教我點做(睇圖)", "Muéstrame cómo (con imágenes)", "Ipakita kung paano (may larawan)"],
  title:  ["How to get to the application", "如何找到申请页面", "點樣搵到申請頁面", "Cómo llegar a la solicitud", "Paano pumunta sa aplikasyon"],
  step:   ["Step {n} of {m}", "第 {n} 步,共 {m} 步", "第 {n} 步,共 {m} 步", "Paso {n} de {m}", "Hakbang {n} sa {m}"],
  open:   ["Open the website", "打开网站", "打開網站", "Abrir el sitio web", "Buksan ang website"],
  done:   ["Done", "完成", "完成", "Listo", "Tapos na"],
  note:   ["Websites can change. If a page looks different, look for the same words.",
           "网站可能会更新。如果页面看起来不一样,请找相同的字。",
           "網站可能會更新。如果頁面唔同咗,搵返同樣嘅字。",
           "Los sitios web pueden cambiar. Si una página se ve diferente, busca las mismas palabras.",
           "Puwedeng magbago ang mga website. Kung iba ang itsura ng page, hanapin ang parehong mga salita."]
};

/* ---- "Which button do I press?" - the person sends their own screenshot ---- */
const SHOT_SITES = {
  "calfresh": "https://benefitscal.com/",
  "medi-cal": "https://benefitscal.com/",
  "school-enrollment": "https://www.sandiegounified.org/",
  "legal-help": "https://www.lassd.org/how-we-can-help/"
};
const SHOT_UI = {
  open:     ["📸 Which button do I press? Send a screenshot", "📸 该点哪个按钮?发送截图", "📸 要撳邊個掣?傳截圖", "📸 ¿Qué botón presiono? Envía una captura", "📸 Aling button ang pipindutin? Magpadala ng screenshot"],
  title:    ["Which button do I press?", "该点哪个按钮?", "要撳邊個掣?", "¿Qué botón presiono?", "Aling button ang pipindutin?"],
  purpose:  ["This tool shows you how to get to the application form on the official website. For help with what to write in the form, use the \u201c{btn}\u201d button.",
             "这个工具教您如何在官方网站上找到申请表。如需帮助填写表格内容,请使用\u201c{btn}\u201d按钮。",
             "呢個工具教你點樣喺官方網站搵到申請表。如果想幫手填表格內容,請用「{btn}」掣。",
             "Esta herramienta te muestra cómo llegar al formulario de solicitud en el sitio oficial. Para ayuda con lo que debes escribir en el formulario, usa el botón \u201c{btn}\u201d.",
             "Ipinapakita ng tool na ito kung paano pumunta sa application form sa opisyal na website. Para sa tulong sa kung ano ang isusulat sa form, gamitin ang button na \u201c{btn}\u201d."],
  step1:    ["1. Open the website.", "1. 打开网站。", "1. 打開網站。", "1. Abre el sitio web.", "1. Buksan ang website."],
  step2:    ["2. Take a screenshot of the page you see. Phone: press the side (power) button and a volume button at the same time. Computer: press Windows + Shift + S.",
             "2. 给您看到的页面截图。手机:同时按侧边(电源)键和音量键。电脑:按 Windows + Shift + S。",
             "2. 將你見到嘅頁面截圖。手機:同時撳側邊(電源)掣同音量掣。電腦:撳 Windows + Shift + S。",
             "2. Toma una captura de la página que ves. Teléfono: presiona al mismo tiempo el botón lateral (encendido) y un botón de volumen. Computadora: presiona Windows + Shift + S.",
             "2. Kunan ng screenshot ang page na nakikita mo. Phone: sabay na pindutin ang side (power) button at isang volume button. Computer: pindutin ang Windows + Shift + S."],
  step3:    ["3. Paste it here, or choose it from your files. We'll point to what to press.",
             "3. 在这里粘贴,或从文件中选择。我们会指出要点哪里。",
             "3. 喺度貼上,或者喺檔案揀。我哋會指出要撳邊度。",
             "3. Pégala aquí o elígela de tus archivos. Te señalaremos qué presionar.",
             "3. I-paste dito, o pumili mula sa iyong files. Ituturo namin kung ano ang pipindutin."],
  paste:    ["📋 Paste screenshot", "📋 粘贴截图", "📋 貼上截圖", "📋 Pegar captura", "📋 I-paste ang screenshot"],
  files:    ["📁 Choose from my files", "📁 从文件中选择", "📁 喺檔案揀", "📁 Elegir de mis archivos", "📁 Pumili mula sa aking files"],
  dropHint: ["📋 Paste your screenshot here (Ctrl+V). You can also drag a picture here.", "📋 在这里粘贴截图(Ctrl+V)。也可以把图片拖到这里。", "📋 喺度貼上截圖(Ctrl+V)。都可以將圖片拖過嚟。", "📋 Pega tu captura aquí (Ctrl+V). También puedes arrastrar una imagen aquí.", "📋 I-paste dito ang screenshot mo (Ctrl+V). Puwede ring i-drag dito ang larawan."],
  seeSheet: ["📝 See my ready-to-apply sheet", "📝 查看我的申请准备表", "📝 睇我嘅申請準備表", "📝 Ver mi hoja lista para aplicar", "📝 Tingnan ang aking ready-to-apply na papel"],
  pasteEmpty:["No picture is copied yet. Take a screenshot first, then press Paste.", "剪贴板里还没有图片。请先截图,再点粘贴。", "剪貼簿未有圖片。請先截圖,再撳貼上。", "Todavía no hay una imagen copiada. Toma una captura primero y luego presiona Pegar.", "Wala pang nakopyang larawan. Kumuha muna ng screenshot, tapos pindutin ang Paste."],
  pasteKeys:["Press Ctrl+V to paste your screenshot.", "请按 Ctrl+V 粘贴截图。", "請撳 Ctrl+V 貼上截圖。", "Presiona Ctrl+V para pegar tu captura.", "Pindutin ang Ctrl+V para i-paste ang screenshot mo."],
  upload:   ["Upload screenshot", "上传截图", "上載截圖", "Subir captura", "I-upload ang screenshot"],
  next:     ["Send the next screenshot", "发送下一张截图", "傳下一張截圖", "Enviar la siguiente captura", "Ipadala ang susunod na screenshot"],
  looking:  ["Looking at your screenshot", "正在查看您的截图", "睇緊你嘅截圖", "Revisando tu captura", "Tinitingnan ang iyong screenshot"],
  privacy:  ["Don't send screenshots that show passwords or personal numbers. We don't save your screenshots.",
             "请不要发送显示密码或个人号码的截图。我们不会保存您的截图。",
             "唔好傳有密碼或者個人號碼嘅截圖。我哋唔會保存你嘅截圖。",
             "No envíes capturas que muestren contraseñas o números personales. No guardamos tus capturas.",
             "Huwag magpadala ng screenshot na may password o personal na numero. Hindi namin sine-save ang mga screenshot mo."],
  done:     ["You're on the application! Use your ready-to-apply sheet to fill it in.", "您已经到申请页面了!请用您的申请准备表来填写。", "你已經去到申請頁面!用你嘅申請準備表嚟填。", "¡Ya estás en la solicitud! Usa tu hoja lista para aplicar para llenarla.", "Nasa aplikasyon ka na! Gamitin ang iyong ready-to-apply na papel para punan ito."],
  scroll:   ["Scroll down the page, then send a new screenshot.", "请向下滚动页面,然后再发一张截图。", "碌落去,然後再傳一張截圖。", "Desplázate hacia abajo y envía una nueva captura.", "Mag-scroll pababa, tapos magpadala ng bagong screenshot."],
  notFound: ["I couldn't find the right button on this page. Try scrolling and sending another screenshot, or call the phone number on your sheet.",
             "这一页上找不到合适的按钮。请滚动页面后再发一张截图,或拨打表格上的电话求助。",
             "呢頁搵唔到啱嘅掣。試下碌落去再傳一張截圖,或者打表上面嘅電話求助。",
             "No encontré el botón correcto en esta página. Desplázate y envía otra captura, o llama al número de tu hoja.",
             "Hindi ko makita ang tamang button sa page na ito. Mag-scroll at magpadala ng isa pang screenshot, o tawagan ang numero sa iyong papel."],
  sensitive:["This page asks for private information. Only type it on the official website. Never share it in a chat.",
             "此页面要求填写私人信息。请只在官方网站上填写,不要在聊天中分享。",
             "呢頁要填私人資料。只喺官方網站填,唔好喺聊天度分享。",
             "Esta página pide información privada. Escríbela solo en el sitio oficial. Nunca la compartas en un chat.",
             "Humihingi ang page na ito ng pribadong impormasyon. I-type lang ito sa opisyal na website. Huwag itong ibahagi sa chat."]
};
