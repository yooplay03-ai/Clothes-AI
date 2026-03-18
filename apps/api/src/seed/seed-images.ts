/**
 * 카테고리 + 색상 기반 SVG 의류 아이콘 생성기
 * viewBox 200x200, 파스텔 배경 + 의류 심볼
 */

interface ColorPalette {
  bg: string;
  fill: string;
  stroke: string;
  text: string;
}

const PALETTES: Record<string, ColorPalette> = {
  white:      { bg: '#F5F5F5', fill: '#E8E8E8', stroke: '#BBBBBB', text: '#888888' },
  black:      { bg: '#2A2A35', fill: '#3D3D50', stroke: '#5A5A70', text: '#AAAACC' },
  gray:       { bg: '#EFEFEF', fill: '#C0C0C0', stroke: '#8A8A8A', text: '#666666' },
  red:        { bg: '#FEE2E2', fill: '#FCA5A5', stroke: '#EF4444', text: '#DC2626' },
  orange:     { bg: '#FFEDD5', fill: '#FDB97E', stroke: '#F97316', text: '#EA580C' },
  yellow:     { bg: '#FEF9C3', fill: '#FDE68A', stroke: '#EAB308', text: '#CA8A04' },
  green:      { bg: '#DCFCE7', fill: '#86EFAC', stroke: '#22C55E', text: '#16A34A' },
  blue:       { bg: '#DBEAFE', fill: '#93C5FD', stroke: '#3B82F6', text: '#2563EB' },
  purple:     { bg: '#F3E8FF', fill: '#C4B5FD', stroke: '#A855F7', text: '#9333EA' },
  pink:       { bg: '#FCE7F3', fill: '#F9A8D4', stroke: '#EC4899', text: '#DB2777' },
  brown:      { bg: '#FEF3C7', fill: '#CA9A6A', stroke: '#92400E', text: '#78350F' },
  beige:      { bg: '#F5ECD7', fill: '#DEC5A0', stroke: '#B8956A', text: '#8B6A3A' },
  navy:       { bg: '#E8EDF5', fill: '#7B9EC8', stroke: '#1E3A5F', text: '#152D4A' },
  multicolor: { bg: '#F0F4FF', fill: '#A5B4FC', stroke: '#6366F1', text: '#4F46E5' },
};

function getPalette(color: string): ColorPalette {
  return PALETTES[color.toLowerCase()] ?? PALETTES['gray'];
}

function svgWrap(content: string, palette: ColorPalette): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" rx="20" fill="${palette.bg}"/>
  ${content}
</svg>`;
}

/** 상의 — 티셔츠 실루엣 */
function topSVG(p: ColorPalette): string {
  return svgWrap(`
  <!-- 티셔츠 몸통 + 소매 -->
  <path d="M100,60 C86,60 72,68 68,56 L42,43 L22,80 L52,88 L52,152 L148,152 L148,88 L178,80 L158,43 L132,56 C128,68 114,60 100,60 Z"
        fill="${p.fill}" stroke="${p.stroke}" stroke-width="3" stroke-linejoin="round"/>
  <!-- 칼라 하이라이트 -->
  <path d="M68,56 Q100,78 132,56" fill="none" stroke="${p.stroke}" stroke-width="2.5" stroke-linecap="round"/>
  <!-- 소매 주름선 -->
  <line x1="38" y1="62" x2="48" y2="72" stroke="${p.stroke}" stroke-width="1.5" opacity="0.5"/>
  <line x1="162" y1="62" x2="152" y2="72" stroke="${p.stroke}" stroke-width="1.5" opacity="0.5"/>`, p);
}

/** 하의 — 바지 실루엣 */
function bottomSVG(p: ColorPalette): string {
  return svgWrap(`
  <!-- 바지 허리 밴드 -->
  <rect x="58" y="50" width="84" height="14" rx="4" fill="${p.stroke}" opacity="0.6"/>
  <!-- 바지 몸통 -->
  <path d="M62,64 L138,64 L138,70 L124,70 L156,150 L116,150 L100,112 L84,150 L44,150 L76,70 L62,70 Z"
        fill="${p.fill}" stroke="${p.stroke}" stroke-width="3" stroke-linejoin="round"/>
  <!-- 솔기 선 -->
  <line x1="100" y1="70" x2="100" y2="105" stroke="${p.stroke}" stroke-width="1.5" opacity="0.4"/>
  <!-- 주머니 흔적 -->
  <path d="M72,80 Q65,88 68,96" fill="none" stroke="${p.stroke}" stroke-width="1.5" opacity="0.5"/>
  <path d="M128,80 Q135,88 132,96" fill="none" stroke="${p.stroke}" stroke-width="1.5" opacity="0.5"/>`, p);
}

/** 아우터 — 재킷/코트 실루엣 */
function outerwearSVG(p: ColorPalette): string {
  return svgWrap(`
  <!-- 코트 몸통 -->
  <path d="M100,55 L130,42 L162,36 L180,72 L152,82 L152,162 L48,162 L48,82 L20,72 L38,36 L70,42 Z"
        fill="${p.fill}" stroke="${p.stroke}" stroke-width="3" stroke-linejoin="round"/>
  <!-- 왼쪽 라펠 -->
  <path d="M100,55 L86,105 L72,108" fill="${p.bg}" stroke="${p.stroke}" stroke-width="2" stroke-linejoin="round" opacity="0.85"/>
  <!-- 오른쪽 라펠 -->
  <path d="M100,55 L114,105 L128,108" fill="${p.bg}" stroke="${p.stroke}" stroke-width="2" stroke-linejoin="round" opacity="0.85"/>
  <!-- 단추 라인 -->
  <circle cx="100" cy="115" r="3.5" fill="${p.stroke}" opacity="0.7"/>
  <circle cx="100" cy="130" r="3.5" fill="${p.stroke}" opacity="0.7"/>
  <circle cx="100" cy="145" r="3.5" fill="${p.stroke}" opacity="0.7"/>
  <!-- 소매 선 -->
  <line x1="36" y1="58" x2="48" y2="72" stroke="${p.stroke}" stroke-width="2" opacity="0.4"/>
  <line x1="164" y1="58" x2="152" y2="72" stroke="${p.stroke}" stroke-width="2" opacity="0.4"/>`, p);
}

/** 신발 — 스니커즈 실루엣 */
function shoesSVG(p: ColorPalette): string {
  return svgWrap(`
  <!-- 밑창 -->
  <path d="M28,145 Q30,162 65,165 L160,162 Q178,158 175,143 Z"
        fill="${p.stroke}" stroke="${p.stroke}" stroke-width="2" opacity="0.8"/>
  <!-- 신발 어퍼 -->
  <path d="M35,145 L46,95 C58,76 88,70 116,76 L158,90 L175,115 L175,143 Z"
        fill="${p.fill}" stroke="${p.stroke}" stroke-width="3" stroke-linejoin="round"/>
  <!-- 토캡 -->
  <path d="M155,90 Q178,106 175,128" fill="none" stroke="${p.stroke}" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
  <!-- 끈 라인들 -->
  <line x1="72" y1="108" x2="108" y2="104" stroke="${p.stroke}" stroke-width="2" opacity="0.5"/>
  <line x1="68" y1="120" x2="112" y2="116" stroke="${p.stroke}" stroke-width="2" opacity="0.5"/>
  <line x1="66" y1="132" x2="116" y2="128" stroke="${p.stroke}" stroke-width="2" opacity="0.5"/>
  <!-- 혀 (tongue) -->
  <path d="M46,95 Q56,78 72,76 L72,108" fill="${p.bg}" stroke="${p.stroke}" stroke-width="1.5" opacity="0.7"/>`, p);
}

/** 가방 — 핸드백 실루엣 */
function bagSVG(p: ColorPalette): string {
  return svgWrap(`
  <!-- 손잡이 -->
  <path d="M75,80 Q75,48 100,48 Q125,48 125,80"
        fill="none" stroke="${p.stroke}" stroke-width="8" stroke-linecap="round"/>
  <!-- 가방 몸통 -->
  <rect x="52" y="80" width="96" height="72" rx="10" fill="${p.fill}" stroke="${p.stroke}" stroke-width="3"/>
  <!-- 잠금장치 -->
  <rect x="90" y="75" width="20" height="12" rx="4" fill="${p.stroke}" opacity="0.8"/>
  <circle cx="100" cy="77" r="4" fill="none" stroke="${p.stroke}" stroke-width="2.5"/>
  <!-- 가방 앞 포켓선 -->
  <rect x="66" y="98" width="68" height="38" rx="6" fill="none" stroke="${p.stroke}" stroke-width="1.5" opacity="0.5"/>
  <!-- 스티칭 -->
  <rect x="56" y="84" width="88" height="64" rx="8" fill="none" stroke="${p.stroke}" stroke-width="1" stroke-dasharray="4,3" opacity="0.3"/>`, p);
}

/** 액세서리 — 목걸이 + 펜던트 */
function accessorySVG(p: ColorPalette): string {
  return svgWrap(`
  <!-- 체인 호 -->
  <path d="M55,75 Q100,135 145,75"
        fill="none" stroke="${p.stroke}" stroke-width="4" stroke-linecap="round" opacity="0.8"/>
  <!-- 체인 반짝임 효과 -->
  <path d="M55,75 Q100,135 145,75"
        fill="none" stroke="${p.bg}" stroke-width="1.5" stroke-linecap="round" opacity="0.5" stroke-dasharray="6,8"/>
  <!-- 펜던트 외곽 -->
  <circle cx="100" cy="133" r="18" fill="${p.fill}" stroke="${p.stroke}" stroke-width="3"/>
  <!-- 펜던트 내부 디테일 -->
  <circle cx="100" cy="133" r="10" fill="${p.stroke}" opacity="0.4"/>
  <!-- 빛 반사 -->
  <circle cx="95" cy="128" r="5" fill="white" opacity="0.35"/>
  <!-- 체인 연결부 -->
  <rect x="96" y="112" width="8" height="5" rx="2" fill="${p.stroke}" opacity="0.7"/>`, p);
}

type Category = 'top' | 'bottom' | 'outerwear' | 'shoes' | 'bag' | 'accessory';

const GENERATORS: Record<Category, (p: ColorPalette) => string> = {
  top:       topSVG,
  bottom:    bottomSVG,
  outerwear: outerwearSVG,
  shoes:     shoesSVG,
  bag:       bagSVG,
  accessory: accessorySVG,
};

/**
 * 카테고리와 기본 색상으로 SVG 문자열 생성
 * @param category 의류 카테고리 (ClothingCategory enum 값)
 * @param primaryColor 의류 주색상 (ClothingColor enum 값)
 */
export function generateClothingSVG(category: string, primaryColor: string): string {
  const cat = category.toLowerCase() as Category;
  const gen = GENERATORS[cat] ?? topSVG;
  const palette = getPalette(primaryColor);
  return gen(palette);
}
