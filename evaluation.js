// Mini Studio Design Coach 자동 평가 프로그램

// ========================================
// 1. Mini Studio와 동일한 판정 규칙
// ========================================

// 정렬: 두 객체의 x 좌표가 다르면 개선 필요
function detectAlignment(objects) {
  if (objects.length < 2) return false

  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      const difference = Math.abs(
        objects[i].x - objects[j].x
      )

      if (difference > 0) {
        return true
      }
    }
  }

  return false
}


// 간격: 객체 중심 사이 거리가 20px 미만이면 개선 필요
function detectSpacing(objects) {
  if (objects.length < 2) return false

  const MIN_SPACING = 20

  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      const first = objects[i]
      const second = objects[j]

      const firstCenterX =
        first.x + first.width / 2

      const firstCenterY =
        first.y + (first.height ? first.height / 2 : 0)

      const secondCenterX =
        second.x + second.width / 2

      const secondCenterY =
        second.y + (second.height ? second.height / 2 : 0)

      const distance = Math.sqrt(
        Math.pow(firstCenterX - secondCenterX, 2) +
        Math.pow(firstCenterY - secondCenterY, 2)
      )

      if (distance < MIN_SPACING) {
        return true
      }
    }
  }

  return false
}


// HEX → RGB
function hexToRgb(hex) {
  const value = hex.replace("#", "")

  if (value.length !== 6) return null

  return {
    r: parseInt(value.substring(0, 2), 16),
    g: parseInt(value.substring(2, 4), 16),
    b: parseInt(value.substring(4, 6), 16),
  }
}


// 상대 명도
function getLuminance(hex) {
  const rgb = hexToRgb(hex)

  if (!rgb) return 0

  const values = [rgb.r, rgb.g, rgb.b].map((value) => {
    const channel = value / 255

    return channel <= 0.04045
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4)
  })

  return (
    0.2126 * values[0] +
    0.7152 * values[1] +
    0.0722 * values[2]
  )
}


// 대비율
function getContrastRatio(firstColor, secondColor) {
  const first = getLuminance(firstColor)
  const second = getLuminance(secondColor)

  const lighter = Math.max(first, second)
  const darker = Math.min(first, second)

  return (lighter + 0.05) / (darker + 0.05)
}


// 흰색 배경에서 4.5:1 미만이면 개선 필요
function detectContrast(objects) {
  const texts = objects.filter(
    (obj) => obj.type === "text"
  )

  for (const text of texts) {
    const ratio = getContrastRatio(
      text.fill,
      "#ffffff"
    )

    if (ratio < 4.5) {
      return true
    }
  }

  return false
}


// 글꼴 종류가 3개 이상이면 개선 필요
function detectTypography(objects) {
  const texts = objects.filter(
    (obj) => obj.type === "text"
  )

  if (texts.length < 2) return false

  const fonts = new Set(
    texts.map((text) => text.fontFamily)
  )

  return fonts.size >= 3
}


// ========================================
// 2. 테스트 케이스
//
// expected
// 1 = 개선 필요
// 0 = 정상
// ========================================

const alignmentTests = [
  {
    name: "A01",
    objects: [
      { x: 100, y: 100, width: 100, height: 50 },
      { x: 120, y: 200, width: 100, height: 50 },
    ],
    expected: 1,
  },
  {
    name: "A02",
    objects: [
      { x: 50, y: 100, width: 100, height: 50 },
      { x: 51, y: 200, width: 100, height: 50 },
    ],
    expected: 1,
  },
  {
    name: "A03",
    objects: [
      { x: 200, y: 100, width: 100, height: 50 },
      { x: 250, y: 200, width: 100, height: 50 },
    ],
    expected: 1,
  },
  {
    name: "A04",
    objects: [
      { x: 300, y: 100, width: 100, height: 50 },
      { x: 305, y: 200, width: 100, height: 50 },
    ],
    expected: 1,
  },
  {
    name: "A05",
    objects: [
      { x: 100, y: 100, width: 100, height: 50 },
      { x: 400, y: 200, width: 100, height: 50 },
    ],
    expected: 1,
  },

  {
    name: "A06",
    objects: [
      { x: 100, y: 100, width: 100, height: 50 },
      { x: 100, y: 200, width: 100, height: 50 },
    ],
    expected: 0,
  },
  {
    name: "A07",
    objects: [
      { x: 50, y: 50, width: 100, height: 50 },
      { x: 50, y: 300, width: 100, height: 50 },
    ],
    expected: 0,
  },
  {
    name: "A08",
    objects: [
      { x: 250, y: 100, width: 100, height: 50 },
      { x: 250, y: 250, width: 100, height: 50 },
    ],
    expected: 0,
  },
  {
    name: "A09",
    objects: [
      { x: 400, y: 50, width: 100, height: 50 },
      { x: 400, y: 400, width: 100, height: 50 },
    ],
    expected: 0,
  },
  {
    name: "A10",
    objects: [
      { x: 10, y: 10, width: 100, height: 50 },
      { x: 10, y: 500, width: 100, height: 50 },
    ],
    expected: 0,
  },
]


const spacingTests = [
  {
    name: "S01",
    objects: [
      { x: 100, y: 100, width: 20, height: 20 },
      { x: 110, y: 100, width: 20, height: 20 },
    ],
    expected: 1,
  },
  {
    name: "S02",
    objects: [
      { x: 100, y: 100, width: 20, height: 20 },
      { x: 105, y: 105, width: 20, height: 20 },
    ],
    expected: 1,
  },
  {
    name: "S03",
    objects: [
      { x: 200, y: 200, width: 20, height: 20 },
      { x: 215, y: 200, width: 20, height: 20 },
    ],
    expected: 1,
  },
  {
    name: "S04",
    objects: [
      { x: 300, y: 300, width: 20, height: 20 },
      { x: 300, y: 310, width: 20, height: 20 },
    ],
    expected: 1,
  },
  {
    name: "S05",
    objects: [
      { x: 400, y: 400, width: 20, height: 20 },
      { x: 412, y: 408, width: 20, height: 20 },
    ],
    expected: 1,
  },

  {
    name: "S06",
    objects: [
      { x: 100, y: 100, width: 20, height: 20 },
      { x: 150, y: 100, width: 20, height: 20 },
    ],
    expected: 0,
  },
  {
    name: "S07",
    objects: [
      { x: 100, y: 100, width: 20, height: 20 },
      { x: 100, y: 150, width: 20, height: 20 },
    ],
    expected: 0,
  },
  {
    name: "S08",
    objects: [
      { x: 200, y: 200, width: 20, height: 20 },
      { x: 250, y: 250, width: 20, height: 20 },
    ],
    expected: 0,
  },
  {
    name: "S09",
    objects: [
      { x: 300, y: 300, width: 20, height: 20 },
      { x: 400, y: 300, width: 20, height: 20 },
    ],
    expected: 0,
  },
  {
    name: "S10",
    objects: [
      { x: 10, y: 10, width: 20, height: 20 },
      { x: 500, y: 400, width: 20, height: 20 },
    ],
    expected: 0,
  },
]


const contrastTests = [
  { name: "C01", color: "#cccccc", expected: 1 },
  { name: "C02", color: "#bbbbbb", expected: 1 },
  { name: "C03", color: "#aaaaaa", expected: 1 },
  { name: "C04", color: "#999999", expected: 1 },
  { name: "C05", color: "#888888", expected: 1 },

  { name: "C06", color: "#000000", expected: 0 },
  { name: "C07", color: "#111111", expected: 0 },
  { name: "C08", color: "#222222", expected: 0 },
  { name: "C09", color: "#333333", expected: 0 },
  { name: "C10", color: "#444444", expected: 0 },
]


const typographyTests = [
  {
    name: "T01",
    fonts: ["Arial", "Georgia", "Times New Roman"],
    expected: 1,
  },
  {
    name: "T02",
    fonts: ["Arial", "Georgia", "Verdana"],
    expected: 1,
  },
  {
    name: "T03",
    fonts: ["Arial", "Verdana", "Courier New"],
    expected: 1,
  },
  {
    name: "T04",
    fonts: ["Georgia", "Verdana", "Times New Roman"],
    expected: 1,
  },
  {
    name: "T05",
    fonts: ["Arial", "Georgia", "Verdana", "Courier New"],
    expected: 1,
  },

  {
    name: "T06",
    fonts: ["Arial", "Arial"],
    expected: 0,
  },
  {
    name: "T07",
    fonts: ["Arial", "Georgia"],
    expected: 0,
  },
  {
    name: "T08",
    fonts: ["Verdana", "Verdana", "Verdana"],
    expected: 0,
  },
  {
    name: "T09",
    fonts: ["Georgia", "Times New Roman"],
    expected: 0,
  },
  {
    name: "T10",
    fonts: ["Arial", "Arial", "Georgia"],
    expected: 0,
  },
]


// ========================================
// 3. 평가 지표 계산
// ========================================

function calculateMetrics(yTrue, yPred) {
  let TP = 0
  let FP = 0
  let TN = 0
  let FN = 0

  for (let i = 0; i < yTrue.length; i++) {
    if (yTrue[i] === 1 && yPred[i] === 1) TP++
    else if (yTrue[i] === 0 && yPred[i] === 1) FP++
    else if (yTrue[i] === 0 && yPred[i] === 0) TN++
    else if (yTrue[i] === 1 && yPred[i] === 0) FN++
  }

  const accuracy = (TP + TN) / yTrue.length

  const precision =
    TP + FP === 0 ? 0 : TP / (TP + FP)

  const recall =
    TP + FN === 0 ? 0 : TP / (TP + FN)

  const f1 =
    precision + recall === 0
      ? 0
      : (2 * precision * recall) /
        (precision + recall)

  return {
    TP,
    FP,
    TN,
    FN,
    accuracy,
    precision,
    recall,
    f1,
  }
}


// ========================================
// 4. 테스트 실행
// ========================================

function evaluate(name, tests, detector, converter) {
  const yTrue = []
  const yPred = []

  console.log(`\n[${name}]`)

  for (const test of tests) {
    const objects = converter
      ? converter(test)
      : test.objects

    const detected = detector(objects)

    const prediction = detected ? 1 : 0

    yTrue.push(test.expected)
    yPred.push(prediction)

    console.log(
      `${test.name} | 정답=${test.expected} | 판정=${prediction}`
    )
  }

  const result = calculateMetrics(
    yTrue,
    yPred
  )

  console.log("\n결과")
  console.log(
    `TP=${result.TP}, FP=${result.FP}, ` +
    `TN=${result.TN}, FN=${result.FN}`
  )

  console.log(
    `Accuracy : ${result.accuracy.toFixed(3)}`
  )
  console.log(
    `Precision: ${result.precision.toFixed(3)}`
  )
  console.log(
    `Recall   : ${result.recall.toFixed(3)}`
  )
  console.log(
    `F1 Score : ${result.f1.toFixed(3)}`
  )

  return result
}


console.log("==========================================")
console.log("Mini Studio Design Coach 자동 평가")
console.log("==========================================")

evaluate(
  "정렬",
  alignmentTests,
  detectAlignment
)

evaluate(
  "간격",
  spacingTests,
  detectSpacing
)

evaluate(
  "색상 대비",
  contrastTests,
  detectContrast,
  (test) => [
    {
      type: "text",
      fill: test.color,
      fontFamily: "Arial",
      x: 0,
      y: 0,
      width: 100,
    },
  ]
)

evaluate(
  "타이포그래피",
  typographyTests,
  detectTypography,
  (test) =>
    test.fonts.map((font, index) => ({
      type: "text",
      fill: "#222222",
      fontFamily: font,
      x: index * 100,
      y: 0,
      width: 100,
    }))
)