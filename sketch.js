// 建立幼兒生活常識拖曳配對測驗的畫布與初始資料。
const quizItems = [ // 儲存六道題目與正確答案。
  { question: "出門前下雨了，帶什麼才不會淋濕？", answer: "雨傘" }, // 第一道生活常識題。
  { question: "吃完飯後，記得把牙齒刷乾淨，這是在做什麼？", answer: "刷牙" }, // 第二道生活常識題。
  { question: "口渴的時候，喝什麼最能解渴又健康？", answer: "白開水" }, // 第三道生活常識題。
  { question: "看到紅燈時，過馬路要怎麼做？", answer: "停下來" }, // 第四道生活常識題。
  { question: "天黑要睡覺時，先把房間的什麼關掉？", answer: "電燈" }, // 第五道生活常識題。
  { question: "玩具玩完以後，應該把玩具放回哪裡？", answer: "玩具箱" }, // 第六道生活常識題。
]; // 結束題庫資料。

const answerTexts = ["雨傘", "刷牙", "白開水", "停下來", "電燈", "玩具箱"]; // 定義可拖曳的六個文字答案。
let answerCards = []; // 保存答案卡的位置、尺寸與所在題目。
let questionCards = []; // 保存題目卡的位置與尺寸。
let confettiPieces = []; // 保存高分時的彩帶粒子。
let draggedCard = null; // 記錄目前被拖曳的答案卡。
let dragOffsetX = 0; // 記錄滑鼠相對答案卡左上角的水平距離。
let dragOffsetY = 0; // 記錄滑鼠相對答案卡左上角的垂直距離。
let isSubmitted = false; // 記錄是否已經交卷。
let score = 0; // 記錄答對題數。
let celebrationStarted = false; // 避免重複啟動高分彩帶。
let layout = {}; // 保存依畫面尺寸計算出的版面座標。
const palette = { // 設定明亮且適合兒童的色彩。
  ink: "#25364A", // 深色文字。
  muted: "#718096", // 輔助文字。
  paper: "#FFFDF7", // 暖白色畫布。
  blue: "#5BA7D1", // 藍色檔案卡。
  green: "#72B89A", // 綠色檔案卡。
  coral: "#F07868", // 珊瑚色重點。
  yellow: "#F4C95D", // 黃色裝飾色。
  lilac: "#A692D0", // 淡紫色裝飾色。
}; // 結束色彩設定。

function setup() { // 初始化畫布與觸控操作。
  createCanvas(windowWidth, windowHeight); // 建立符合目前視窗大小的畫布。
  pixelDensity(1); // 降低高解析螢幕的繪圖負擔。
  textFont("Trebuchet MS, sans-serif"); // 設定清晰易讀的字型。
  document.body.style.margin = "0"; // 移除頁面預設外距。
  document.body.style.overflow = "hidden"; // 避免畫布操作時頁面捲動。
  document.body.style.touchAction = "none"; // 讓觸控拖曳由畫布接手。
  recalculateLayout(); // 根據視窗大小計算題目與答案卡的位置。
  shuffleAnswerCards(); // 將答案卡打亂後放置在畫布下方。
} // 結束初始化流程。

function draw() { // 每一影格繪製背景、卡片與互動狀態。
  drawBackground(); // 繪製柔和的背景與裝飾。
  drawHeader(); // 繪製測驗標題與作答進度。
  drawQuestions(); // 繪製六個固定的 Git 檔案風格題目卡。
  drawAnswerCards(); // 繪製六個可拖曳的文字答案卡。
  drawSubmitButton(); // 所有答案都放入題目後顯示交卷按鈕。
  drawFeedback(); // 交卷後顯示分數與作答結果。
  drawConfetti(); // 高分時持續播放彩帶動畫。
} // 結束每影格繪製流程。

function recalculateLayout() { // 依視窗尺寸重新安排卡片與版面。
  const compact = width < 700; // 判斷是否使用手機版排版。
  const margin = compact ? 16 : min(48, width * 0.055); // 設定響應式左右留白。
  const gap = compact ? 10 : 16; // 設定卡片間距。
  const columns = compact ? 2 : 3; // 手機兩欄、較大畫面三欄。
  const cardWidth = (width - margin * 2 - gap * (columns - 1)) / columns; // 計算單張卡片寬度。
  const headerHeight = compact ? 98 : 118; // 設定標題區高度。
  const questionHeight = compact ? min(120, height * 0.16) : min(148, height * 0.19); // 設定題目卡高度。
  const questionGap = compact ? 9 : 14; // 設定題目列距離。
  const rows = Math.ceil(quizItems.length / columns); // 計算題目卡列數。
  const questionStartY = headerHeight; // 設定題目區起始位置。
  const questionAreaHeight = rows * questionHeight + (rows - 1) * questionGap; // 計算題目區總高度。
  const answerStartY = questionStartY + questionAreaHeight + (compact ? 28 : 36); // 設定答案區起始位置。
  const answerHeight = compact ? min(48, height * 0.075) : 58; // 設定答案卡高度。
  const answerGap = compact ? 10 : 14; // 設定答案卡列距離。
  const answerRows = Math.ceil(answerTexts.length / columns); // 計算答案卡列數。
  const submitHeight = compact ? 48 : 54; // 設定交卷按鈕高度。
  const submitY = min(height - submitHeight - 18, answerStartY + answerRows * (answerHeight + answerGap) + 8); // 計算交卷按鈕位置。
  layout = { compact, margin, gap, columns, cardWidth, headerHeight, questionHeight, questionGap, questionStartY, answerStartY, answerHeight, answerGap, submitY, submitHeight }; // 儲存本次版面計算結果。

  questionCards = quizItems.map((item, index) => { // 根據題庫建立固定題目卡的座標。
    const column = index % columns; // 取得題目所在欄位。
    const row = floor(index / columns); // 取得題目所在列數。
    return { x: margin + column * (cardWidth + gap), y: questionStartY + row * (questionHeight + questionGap), w: cardWidth, h: questionHeight, index }; // 回傳題目卡的位置資訊。
  }); // 完成題目卡座標建立。

  answerCards.forEach((card, index) => { // 依新尺寸重排答案卡。
    if (card.slot === null) { // 只重排尚未放入題目卡的答案。
      const position = getAnswerPosition(index); // 取得答案卡的預設位置。
      card.x = position.x; // 更新答案卡水平位置。
      card.y = position.y; // 更新答案卡垂直位置。
      card.w = cardWidth; // 更新答案卡寬度。
      card.h = answerHeight; // 更新答案卡高度。
    } // 結束未放置答案卡的處理。
  }); // 完成所有答案卡位置更新。
} // 結束響應式版面計算。

function getAnswerPosition(index) { // 計算答案卡索引對應的預設位置。
  const column = index % layout.columns; // 取得答案卡所在欄位。
  const row = floor(index / layout.columns); // 取得答案卡所在列數。
  return { x: layout.margin + column * (layout.cardWidth + layout.gap), y: layout.answerStartY + row * (layout.answerHeight + layout.answerGap) }; // 回傳答案卡左上角座標。
} // 結束答案位置計算。

function shuffleAnswerCards() { // 建立打亂排列的答案卡。
  const shuffled = [...answerTexts].sort(() => random() - 0.5); // 隨機打亂六個答案文字。
  answerCards = shuffled.map((text, index) => { // 將答案文字轉成可互動卡片。
    const position = getAnswerPosition(index); // 取得卡片初始位置。
    return { text, x: position.x, y: position.y, w: layout.cardWidth, h: layout.answerHeight, slot: null, home: index }; // 回傳答案卡資料。
  }); // 完成答案卡資料建立。
} // 結束答案卡打亂流程。

function drawBackground() { // 繪製紙張底色與角落的裝飾點。
  background(palette.paper); // 填滿暖白色背景。
  noStroke(); // 隱藏裝飾圖形外框。
  fill(244, 201, 93, 55); // 設定半透明黃色裝飾。
  circle(width - 34, 38, 112); // 在右上角繪製柔和圓形。
  fill(91, 167, 209, 38); // 設定半透明藍色裝飾。
  circle(18, height - 20, 86); // 在左下角繪製柔和圓形。
} // 結束背景繪製。

function drawHeader() { // 繪製標題、提示與作答進度。
  noStroke(); // 隱藏標題文字外框。
  fill(palette.ink); // 設定標題文字顏色。
  textAlign(LEFT, CENTER); // 設定標題靠左並垂直置中。
  textStyle(BOLD); // 使用粗體標題。
  textSize(layout.compact ? 23 : 30); // 依裝置大小調整標題。
  text("小小生活常識家", layout.margin, 34); // 顯示測驗標題。
  textStyle(NORMAL); // 還原一般字重。
  fill(palette.muted); // 設定提示文字顏色。
  textSize(layout.compact ? 12 : 15); // 依裝置大小調整提示字體。
  text("把下方答案拖到最適合的生活題目上！", layout.margin, 66); // 顯示拖曳操作提示。
  const placedCount = answerCards.filter((card) => card.slot !== null).length; // 計算已放入題目的答案數量。
  textAlign(RIGHT, CENTER); // 將作答進度靠右顯示。
  textStyle(BOLD); // 使用粗體凸顯作答進度。
  textSize(layout.compact ? 13 : 15); // 設定進度文字大小。
  fill(palette.ink); // 設定進度文字顏色。
  text(`${placedCount} / 6 已配對`, width - layout.margin, 38); // 顯示已放置答案數量。
  textStyle(NORMAL); // 還原一般字重。
} // 結束標題區繪製。

function drawQuestions() { // 繪製題目卡與 Git 檔案造型。
  questionCards.forEach((card, index) => { // 逐一繪製六道題目。
    const placedCard = answerCards.find((answer) => answer.slot === index); // 找出目前放在這題的答案。
    const colors = [palette.blue, palette.green, palette.coral, palette.lilac, "#68B8B1", "#E6A44F"]; // 設定每張題目卡的色彩。
    const accent = colors[index]; // 取得目前題目卡的重點色。
    const hover = isPointerOver(card.x, card.y, card.w, card.h); // 判斷指標是否停留於題目卡。
    drawingContext.shadowColor = "rgba(37, 54, 74, 0.10)"; // 設定卡片柔和陰影顏色。
    drawingContext.shadowBlur = hover && !isSubmitted ? 14 : 7; // 讓滑鼠停留的卡片陰影稍微加深。
    drawingContext.shadowOffsetY = 3; // 設定卡片陰影垂直位移。
    fill(placedCard ? "#F2FAF6" : "#FFFFFF"); // 已放答案的卡片使用淡綠色底。
    stroke(placedCard ? palette.green : "#E5E9EC"); // 已配對卡片顯示綠色外框。
    strokeWeight(placedCard ? 2 : 1); // 已配對卡片的外框稍微加粗。
    rect(card.x, card.y, card.w, card.h, 14); // 繪製圓角題目卡。
    drawingContext.shadowBlur = 0; // 清除陰影設定避免影響其他圖形。
    drawingContext.shadowOffsetY = 0; // 還原陰影位移。
    noStroke(); // 隱藏檔案標籤外框。
    fill(accent); // 使用題目重點色填滿檔案標籤。
    rect(card.x + 12, card.y - 5, min(66, card.w * 0.38), 17, 6, 6, 0, 0); // 繪製 Git 檔案造型的標籤。
    drawGitBranch(card.x + card.w - 27, card.y + 23, accent, index); // 在檔案卡右上角繪製動畫分支圖案。
    fill(palette.muted); // 設定題號文字顏色。
    textAlign(LEFT, CENTER); // 將題號靠左顯示。
    textStyle(BOLD); // 使用粗體題號。
    textSize(layout.compact ? 10 : 11); // 設定題號大小。
    text(`LIFE-${String(index + 1).padStart(2, "0")}`, card.x + 14, card.y + 19); // 顯示 Git 風格的生活題目編號。
    textStyle(NORMAL); // 還原一般字重。
    fill(palette.ink); // 設定題目文字顏色。
    textSize(layout.compact ? 12 : 15); // 依畫面寬度調整題目文字大小。
    textAlign(LEFT, TOP); // 設定題目文字靠左並置頂。
    text(quizItems[index].question, card.x + 14, card.y + 36, card.w - 28, card.h - 43); // 在題目卡中顯示生活常識題目。
    if (placedCard) { // 有答案時顯示答案標籤。
      drawPlacedAnswer(placedCard, card, accent); // 將答案顯示在題目卡的底部。
    } // 結束已放答案的繪製。
  }); // 完成六張題目卡繪製。
} // 結束題目區繪製。

function drawGitBranch(x, y, accent, index) { // 繪製會微微移動的 Git 分支檔案圖示。
  const pulse = sin(frameCount * 0.06 + index) * 1.5; // 計算各圖示錯開的輕微動畫位移。
  stroke(accent); // 設定 Git 分支線條顏色。
  strokeWeight(2); // 設定 Git 分支線條粗細。
  noFill(); // 保持分支線條透明。
  line(x, y - 7 + pulse, x, y + 7 + pulse); // 繪製 Git 分支主幹。
  bezier(x, y + pulse, x + 9, y + pulse, x + 8, y - 7 + pulse, x + 1, y - 7 + pulse); // 繪製向上分支曲線。
  noStroke(); // 隱藏分支圓點外框。
  fill(accent); // 使用同色填滿分支圓點。
  circle(x, y - 7 + pulse, 5); // 繪製分支頂端節點。
  circle(x, y + pulse, 5); // 繪製分支中間節點。
  circle(x, y + 7 + pulse, 5); // 繪製分支底端節點。
} // 結束 Git 分支圖示繪製。

function drawPlacedAnswer(answer, card, accent) { // 在題目卡底部顯示已放入的答案。
  const isCorrect = answer.text === quizItems[card.index].answer; // 判斷目前答案是否正確。
  const labelWidth = min(card.w - 24, max(64, textWidth(answer.text) + 28)); // 計算答案標籤寬度。
  const labelY = card.y + card.h - (layout.compact ? 27 : 32); // 計算答案標籤垂直位置。
  noStroke(); // 隱藏答案標籤外框。
  fill(isSubmitted ? (isCorrect ? "#DDF2E5" : "#FBE1DC") : "#EEF5F7"); // 交卷後依正誤更換答案標籤底色。
  rect(card.x + 12, labelY, labelWidth, layout.compact ? 22 : 26, 9); // 繪製圓角答案標籤。
  fill(isSubmitted ? (isCorrect ? "#317652" : "#B64E43") : accent); // 交卷後依正誤更換答案文字顏色。
  textAlign(LEFT, CENTER); // 將答案文字靠左置中。
  textStyle(BOLD); // 使用粗體顯示已配對答案。
  textSize(layout.compact ? 11 : 13); // 設定答案文字大小。
  text(answer.text, card.x + 22, labelY + (layout.compact ? 11 : 13)); // 顯示已放入的文字答案。
  textStyle(NORMAL); // 還原一般字重。
} // 結束答案標籤繪製。

function drawAnswerCards() { // 繪製尚未配對答案與拖曳中的答案。
  answerCards.forEach((card) => { // 逐一繪製答案卡。
    if (card.slot !== null || card === draggedCard) { // 已放入題目或正在拖曳的卡片不在答案區重複顯示。
      return; // 跳過已放置或正在拖曳的答案卡。
    } // 結束卡片篩選。
    const hover = isPointerOver(card.x, card.y, card.w, card.h); // 判斷指標是否停留於答案卡。
    drawingContext.shadowColor = "rgba(37, 54, 74, 0.12)"; // 設定答案卡陰影顏色。
    drawingContext.shadowBlur = hover ? 12 : 5; // 滑鼠停留時加強答案卡陰影。
    drawingContext.shadowOffsetY = hover ? 4 : 2; // 設定答案卡陰影距離。
    noStroke(); // 隱藏答案卡外框。
    fill("#FFFFFF"); // 使用白色答案卡底色。
    rect(card.x, card.y, card.w, card.h, 12); // 繪製圓角可拖曳答案卡。
    drawingContext.shadowBlur = 0; // 清除答案卡陰影模糊。
    drawingContext.shadowOffsetY = 0; // 還原答案卡陰影距離。
    fill(palette.coral); // 使用珊瑚色繪製拖曳提示圓點。
    circle(card.x + 16, card.y + card.h / 2, 7); // 繪製答案卡的彩色識別圓點。
    fill(palette.ink); // 設定答案文字顏色。
    textAlign(CENTER, CENTER); // 將答案文字置中。
    textStyle(BOLD); // 使用粗體顯示答案。
    textSize(layout.compact ? 14 : 16); // 依裝置大小調整答案文字。
    text(card.text, card.x + card.w / 2, card.y + card.h / 2); // 顯示可拖曳的文字答案。
    textStyle(NORMAL); // 還原一般字重。
  }); // 完成答案卡繪製。
  if (draggedCard) { // 正在拖曳答案時繪製浮起的卡片。
    drawingContext.shadowColor = "rgba(37, 54, 74, 0.20)"; // 設定拖曳卡片的浮起陰影。
    drawingContext.shadowBlur = 18; // 增加拖曳卡片的陰影模糊。
    drawingContext.shadowOffsetY = 7; // 增加拖曳卡片的陰影高度。
    fill("#FFF4D2"); // 使用淡黃色強調拖曳中的卡片。
    noStroke(); // 隱藏拖曳卡片外框。
    rect(draggedCard.x, draggedCard.y, draggedCard.w, draggedCard.h, 12); // 繪製拖曳中的答案卡。
    drawingContext.shadowBlur = 0; // 清除拖曳卡片陰影模糊。
    drawingContext.shadowOffsetY = 0; // 還原拖曳卡片陰影位移。
    fill(palette.ink); // 設定拖曳答案文字顏色。
    textAlign(CENTER, CENTER); // 將拖曳答案文字置中。
    textStyle(BOLD); // 使用粗體凸顯拖曳答案。
    textSize(layout.compact ? 14 : 16); // 依裝置大小調整拖曳答案文字。
    text(draggedCard.text, draggedCard.x + draggedCard.w / 2, draggedCard.y + draggedCard.h / 2); // 顯示正在移動的答案文字。
    textStyle(NORMAL); // 還原一般字重。
  } // 結束拖曳中卡片的繪製。
} // 結束答案區繪製。

function drawSubmitButton() { // 在六題都有答案時顯示可操作的交卷按鈕。
  const allPlaced = answerCards.every((card) => card.slot !== null); // 檢查六個答案是否全部放入題目。
  if (!allPlaced || isSubmitted) { // 未完成配對或已交卷時不顯示按鈕。
    return; // 結束按鈕繪製。
  } // 結束交卷按鈕顯示條件。
  const buttonWidth = layout.compact ? min(width - layout.margin * 2, 260) : 250; // 計算交卷按鈕寬度。
  const buttonX = (width - buttonWidth) / 2; // 計算交卷按鈕水平置中位置。
  const hover = isPointerOver(buttonX, layout.submitY, buttonWidth, layout.submitHeight); // 判斷指標是否停留於交卷按鈕。
  noStroke(); // 隱藏按鈕外框。
  fill(hover ? "#E56757" : palette.coral); // 滑鼠停留時加深按鈕顏色。
  rect(buttonX, layout.submitY, buttonWidth, layout.submitHeight, 15); // 繪製圓角交卷按鈕。
  fill("#FFFFFF"); // 設定按鈕文字顏色。
  textAlign(CENTER, CENTER); // 將按鈕文字置中。
  textStyle(BOLD); // 使用粗體顯示按鈕文字。
  textSize(layout.compact ? 16 : 18); // 設定按鈕文字大小。
  text("交卷看成績", width / 2, layout.submitY + layout.submitHeight / 2); // 顯示交卷指示文字。
  textStyle(NORMAL); // 還原一般字重。
} // 結束交卷按鈕繪製。

function drawFeedback() { // 交卷後顯示分數與正確答案。
  if (!isSubmitted) { // 尚未交卷時不顯示成績。
    return; // 結束成績繪製。
  } // 結束交卷狀態判斷。
  const percentage = round((score / quizItems.length) * 100); // 將答對數量換算成百分比。
  const bannerY = layout.submitY; // 將成績橫幅放在按鈕原本的位置。
  noStroke(); // 隱藏成績橫幅外框。
  fill(percentage > 80 ? "#E8F5EC" : "#FFF1DF"); // 依成績設定成績橫幅底色。
  rect(layout.margin, bannerY, width - layout.margin * 2, layout.submitHeight, 14); // 繪製圓角成績橫幅。
  fill(percentage > 80 ? "#317652" : "#9A6430"); // 依成績設定成績文字顏色。
  textAlign(CENTER, CENTER); // 將成績訊息置中。
  textStyle(BOLD); // 使用粗體凸顯分數。
  textSize(layout.compact ? 15 : 18); // 依畫面大小調整成績文字。
  text(percentage > 80 ? `太棒了！答對 ${score} 題，得分 ${percentage}%` : `答對 ${score} 題，得分 ${percentage}%！再玩一次吧`, width / 2, bannerY + layout.submitHeight / 2); // 顯示得分與鼓勵訊息。
  textStyle(NORMAL); // 還原一般字重。
  fill(palette.muted); // 設定重新挑戰文字顏色。
  textSize(layout.compact ? 12 : 14); // 設定重新挑戰文字大小。
  text("點一下畫面重新挑戰", width / 2, bannerY + layout.submitHeight + 18); // 提示點擊畫面重新開始測驗。
} // 結束成績回饋繪製。

function drawConfetti() { // 更新並繪製高分時的彩帶粒子。
  if (confettiPieces.length === 0) { // 沒有彩帶時不執行粒子繪製。
    return; // 結束彩帶繪製。
  } // 結束彩帶狀態判斷。
  noStroke(); // 隱藏彩帶外框。
  confettiPieces.forEach((piece) => { // 逐一更新每個彩帶粒子。
    piece.y += piece.speed; // 讓彩帶向下飄落。
    piece.x += piece.drift + sin(frameCount * 0.04 + piece.phase) * 0.7; // 讓彩帶左右搖擺。
    piece.rotation += piece.spin; // 更新彩帶旋轉角度。
    push(); // 保存目前繪圖座標狀態。
    translate(piece.x, piece.y); // 移動畫布原點至彩帶位置。
    rotate(piece.rotation); // 旋轉彩帶粒子。
    fill(piece.color); // 設定彩帶粒子顏色。
    rect(-piece.w / 2, -piece.h / 2, piece.w, piece.h, 2); // 繪製彩帶長方形。
    pop(); // 還原繪圖座標狀態。
    if (piece.y > height + 20) { // 彩帶飄出畫面底部時重新放回上方。
      piece.y = random(-height * 0.35, -10); // 將彩帶移回畫布上緣。
      piece.x = random(width); // 重新隨機設定彩帶水平位置。
    } // 結束彩帶循環處理。
  }); // 完成所有彩帶粒子更新。
} // 結束彩帶動畫。

function startConfetti() { // 建立通過高分門檻時播放的彩帶。
  const colors = [palette.coral, palette.blue, palette.yellow, palette.green, palette.lilac]; // 設定彩帶的多種顏色。
  confettiPieces = Array.from({ length: 100 }, () => ({ x: random(width), y: random(-height, height * 0.45), w: random(6, 12), h: random(10, 19), speed: random(1.4, 4.2), drift: random(-0.8, 0.8), rotation: random(TWO_PI), spin: random(-0.08, 0.08), phase: random(TWO_PI), color: random(colors) })); // 建立一百個不同速度的彩帶粒子。
} // 結束彩帶建立。

function mousePressed() { // 按下滑鼠時開始拖曳答案或操作按鈕。
  if (isSubmitted) { // 已經交卷時點擊畫面可重新挑戰。
    resetQuiz(); // 重設題目、答案與成績。
    return false; // 阻止瀏覽器執行預設點擊行為。
  } // 結束重新挑戰判斷。
  if (isSubmitButtonPressed()) { // 檢查是否按下交卷按鈕。
    submitQuiz(); // 計算成績並顯示答案正誤。
    return false; // 避免同一次點擊開始拖曳答案。
  } // 結束交卷按鈕處理。
  for (let index = answerCards.length - 1; index >= 0; index -= 1) { // 從最上層答案卡開始尋找被按下的卡片。
    const card = answerCards[index]; // 取得目前檢查的答案卡。
    if (card.slot === null && isPointerOver(card.x, card.y, card.w, card.h)) { // 確認滑鼠位於未放置答案卡上。
      draggedCard = card; // 將此答案卡設定為拖曳目標。
      dragOffsetX = mouseX - card.x; // 記錄滑鼠相對卡片的水平偏移。
      dragOffsetY = mouseY - card.y; // 記錄滑鼠相對卡片的垂直偏移。
      answerCards.splice(index, 1); // 將拖曳中的答案移到清單最後一層。
      answerCards.push(card); // 讓拖曳中的答案顯示在最上層。
      return false; // 阻止瀏覽器選取畫面文字。
    } // 結束答案卡命中處理。
  } // 結束答案卡搜尋。
  return false; // 阻止觸控裝置觸發頁面捲動。
} // 結束按下滑鼠處理。

function mouseDragged() { // 按住滑鼠移動時更新答案卡位置。
  if (draggedCard && !isSubmitted) { // 只有拖曳中的答案卡可被移動。
    draggedCard.x = constrain(mouseX - dragOffsetX, 0, width - draggedCard.w); // 更新答案卡水平位置並限制在畫布內。
    draggedCard.y = constrain(mouseY - dragOffsetY, 0, height - draggedCard.h); // 更新答案卡垂直位置並限制在畫布內。
  } // 結束拖曳位置更新。
  return false; // 阻止瀏覽器拖曳或捲動畫面。
} // 結束拖曳移動處理。

function mouseReleased() { // 放開滑鼠時將答案配對至最近的題目。
  if (!draggedCard) { // 沒有拖曳答案卡時不需要處理放置。
    return false; // 結束放置處理。
  } // 結束拖曳目標檢查。
  const centerX = draggedCard.x + draggedCard.w / 2; // 計算答案卡中心水平位置。
  const centerY = draggedCard.y + draggedCard.h / 2; // 計算答案卡中心垂直位置。
  const target = questionCards.find((card) => centerX >= card.x && centerX <= card.x + card.w && centerY >= card.y && centerY <= card.y + card.h); // 尋找答案卡中心所在的題目卡。
  if (target) { // 答案卡放在題目卡範圍內時進行配對。
    const existingCard = answerCards.find((card) => card.slot === target.index); // 查看目標題目是否已經有答案。
    if (existingCard) { // 目標題目已有答案時先將舊答案退回答案區。
      existingCard.slot = null; // 清除舊答案的題目配對。
      const home = getAnswerPosition(existingCard.home); // 取得舊答案原本的答案區位置。
      existingCard.x = home.x; // 將舊答案放回水平位置。
      existingCard.y = home.y; // 將舊答案放回垂直位置。
    } // 結束原有答案退回處理。
    draggedCard.slot = target.index; // 將拖曳答案記錄為新題目的答案。
    draggedCard.x = target.x + target.w / 2 - draggedCard.w / 2; // 將答案置中對齊題目卡。
    draggedCard.y = target.y + target.h - draggedCard.h - 8; // 將答案放在題目卡底部。
  } else { // 未放入任何題目時將答案退回答案區。
    draggedCard.slot = null; // 清除答案卡的題目位置。
    const home = getAnswerPosition(draggedCard.home); // 取得答案卡原本的位置。
    draggedCard.x = home.x; // 將答案卡放回原本水平位置。
    draggedCard.y = home.y; // 將答案卡放回原本垂直位置。
  } // 結束答案放置處理。
  draggedCard = null; // 清除目前的拖曳目標。
  return false; // 阻止瀏覽器執行預設放開行為。
} // 結束放開滑鼠處理。

function isPointerOver(x, y, w, h) { // 判斷滑鼠或觸控座標是否位於矩形範圍。
  return mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h; // 回傳矩形命中結果。
} // 結束矩形命中測試。

function isSubmitButtonPressed() { // 判斷交卷按鈕是否已經出現且被點擊。
  const allPlaced = answerCards.every((card) => card.slot !== null); // 確認六個答案都已經放置。
  const buttonWidth = layout.compact ? min(width - layout.margin * 2, 260) : 250; // 計算交卷按鈕寬度。
  const buttonX = (width - buttonWidth) / 2; // 計算交卷按鈕水平起點。
  return allPlaced && !isSubmitted && isPointerOver(buttonX, layout.submitY, buttonWidth, layout.submitHeight); // 回傳按鈕是否被點擊。
} // 結束交卷按鈕命中測試。

function submitQuiz() { // 計算配對正確數並顯示成績。
  score = answerCards.filter((card) => card.slot !== null && card.text === quizItems[card.slot].answer).length; // 統計放在正確題目中的答案數量。
  isSubmitted = true; // 切換到已交卷狀態。
  if (score / quizItems.length > 0.8 && !celebrationStarted) { // 成績高於百分之八十且尚未播放慶祝效果時啟動彩帶。
    startConfetti(); // 產生高分彩帶動畫。
    celebrationStarted = true; // 標記彩帶動畫已經開始。
  } // 結束高分慶祝判斷。
} // 結束交卷計分流程。

function resetQuiz() { // 重設測驗以供再次挑戰。
  isSubmitted = false; // 清除已交卷狀態。
  celebrationStarted = false; // 清除彩帶播放狀態。
  score = 0; // 清除上一輪分數。
  confettiPieces = []; // 移除上一輪的彩帶。
  recalculateLayout(); // 依目前畫面尺寸重新計算版面。
  shuffleAnswerCards(); // 重新打亂答案卡排列。
} // 結束測驗重設。

function windowResized() { // 視窗尺寸改變時讓畫布與內容保持全螢幕。
  resizeCanvas(windowWidth, windowHeight); // 將畫布調整為新的視窗尺寸。
  recalculateLayout(); // 重新計算題目卡與答案卡位置。
  if (draggedCard) { // 調整尺寸時若正拖曳答案則取消拖曳狀態。
    draggedCard = null; // 清除拖曳目標以避免位置錯亂。
  } // 結束拖曳狀態檢查。
} // 結束視窗尺寸變更處理。
