export const SLIDES = [
  "수면",
  "수유",
  "배변",
  "체온",
  "신체정보",
  "머리둘레",
  "감정",
  "특이증상",
  "약",
  "기타",
];

export const RECORDS = [
  {
    title: "수유",
    src: "/images/feeding.png",
    path: "/record/FEEDING",
    type: "FEEDING",
  },
  {
    title: "배변",
    src: "/images/diaper.png",
    path: "/record/DIAPER",
    type: "DIAPER",
  },
  {
    title: "수면",
    src: "/images/sleep.png",
    path: "/record/SLEEP",
    type: "SLEEP",
  },
  {
    title: "체온",
    src: "/images/temperature.png",
    path: "/record/TEMPERATURE",
    type: "TEMPERATURE",
  },
  {
    title: "신체정보",
    src: "/images/scale.png",
    path: "/record/GROWTH",
    type: "GROWTH",
  },
  {
    title: "감정",
    src: "/images/heart.png",
    path: "/record/EMOTION",
    type: "EMOTION",
  },
  {
    title: "특이증상",
    src: "/images/info.png",
    path: "/record/SYMPTOM",
    type: "SYMPTOM",
  },
  {
    title: "약",
    src: "/images/medicine.png",
    path: "/record/MEDICINE",
    type: "MEDICINE",
  },
  {
    title: "기타",
    src: "/images/etc.png",
    path: "/record/ETC",
    type: "ETC",
  },
] as const;

export const TYPE_PATH_MAP = {
  수유: "/record/feeding",
  배설: "/record/buHist",
  수면: "/record/sleep",
  체온: "/record/heat",
  신체정보: "/record/hgWgh",
  머리둘레: "/record/hgWgh",
  감정: "/record/emotion",
  특이증상: "/record/symptm",
  약: "/record/takngHist",
  기타: "/record/etc",
} as const;

export const TYPE_MAP = {
  FEEDING: "수유",
  DIAPER: "배변",
  SLEEP: "수면",
  TEMPERATURE: "체온",
  GROWTH: "성장",
  EMOTION: "감정",
  SYMPTOM: "특이증상",
  MEDICINE: "투약",
  ETC: "기타",
} as const;

export const TYPE_TIP_MAP = {
  FEEDING: {
    title: "우리 아이의 수유 기록을 남겨요",
    tip: "· 수유량과 수유 시간을 함께 기록하면 좋아요\n· 수유 자세와 트림 여부도 체크해보세요\n· 규칙적인 수유 시간을 만들어보세요",
  },
  DIAPER: {
    title: "우리 아이의 배변 활동을 기록해요",
    tip: "· 대소변의 색깔과 상태를 함께 기록하면 좋아요\n· 하루 평균 6~8회가 적당해요\n· 규칙적인 배변 패턴을 확인해보세요",
  },
  SLEEP: {
    title: "우리 아이의 수면 패턴을 기록해요",
    tip: "· 낮잠과 밤잠을 구분해서 기록하면 좋아요\n· 수면 전후의 루틴도 함께 기록해보세요\n· 총 수면 시간을 확인해보세요",
  },
  TEMPERATURE: {
    title: " 다음의 경우 즉시 병원 방문을 권장합니다",
    tip: "· 39도 이상의 고열이 지속될 때\n· 심한 호흡 곤란이 있을 때\n· 심한 탈수 증상이 있을 때",
  },
  GROWTH: {
    title: "우리 아이의 성장을 기록해요",
    tip: "· 아침에 측정하는 것이 가장 정확해요\n· 식사 전에 측정하는 것이 좋아요\n· 같은 시간대에 측정하면 더 정확해요",
  },
} as const;
