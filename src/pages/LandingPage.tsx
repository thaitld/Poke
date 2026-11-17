import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ReactLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'
import { motion } from 'motion/react'
import { NAV_ITEMS } from '../config/navigation'
import SiteFooter from '../components/SiteFooter'
import LiquidGlassCard, { LiquidGlassFilter } from '../components/ui/LiquidGlassCard'
import './LandingPage.css'

type Specimen = {
  id: number
  dex: string
  name: string
  category: string
  types: string[]
  typesVi: string
  bst: number
  hp: number
  atk: number
  def: number
  spd: number
  ability: string
  ivTrait: string
  region: string
  tone: 'field-1' | 'surface' | 'accent'
  image: string
  animated: string
  summary: string
}

const SPECIMENS: Specimen[] = [
  {
    id: 6,
    dex: '#0006',
    name: 'Charizard',
    category: 'Pokémon Ngọn Lửa',
    types: ['fire', 'flying'],
    typesVi: 'Lửa / Bay',
    bst: 534,
    hp: 78,
    atk: 84,
    def: 78,
    spd: 100,
    ability: 'Solar Power (Năng lượng Mặt Trời)',
    ivTrait: 'Thích xông pha hỗn chiến (31 ATK · dư 1)',
    region: 'Kanto · Tuyến đường 4',
    tone: 'field-1',
    image: '/assets/pokemon/6.png',
    animated: '/assets/pokemon/animated/6.gif',
    summary:
      'Phun ra ngọn lửa nóng bỏng đủ sức nung chảy nham thạch. Trên bàn cờ 8×8, rune Lửa nhận thêm 1.5x sát thương đồng hệ (STAB).',
  },
  {
    id: 79,
    dex: '#0079',
    name: 'Slowpoke',
    category: 'Pokémon Đãng Trí',
    types: ['water', 'psychic'],
    typesVi: 'Nước / Tâm Linh',
    bst: 315,
    hp: 90,
    atk: 65,
    def: 65,
    spd: 15,
    ability: 'Oblivious (Vô Ưu Lạc Quan)',
    ivTrait: 'Thích ngủ nướng (31 HP · dư 1)',
    region: 'Kanto · Đảo Cinnabar',
    tone: 'accent',
    image: '/assets/pokemon/79.png',
    animated: '/assets/pokemon/animated/79.gif',
    summary:
      'Thảnh thơi thả mình nổi trôi trên làn nước xanh ngọc. Luôn bình thản trước mọi chấn động nhờ khả năng hồi phục kỳ diệu và lớp đệm nước dày.',
  },
  {
    id: 94,
    dex: '#0094',
    name: 'Gengar',
    category: 'Pokémon Bóng Ma',
    types: ['ghost', 'poison'],
    typesVi: 'Bóng Ma / Độc',
    bst: 500,
    hp: 60,
    atk: 65,
    def: 60,
    spd: 110,
    ability: 'Cursed Body (Lời Nguyền Thể Xác)',
    ivTrait: 'Cực kỳ nhạy bén âm thanh (31 SPD · dư 1)',
    region: 'Kanto · Tháp Lavender',
    tone: 'surface',
    image: '/assets/pokemon/94.png',
    animated: '/assets/pokemon/animated/94.gif',
    summary:
      'Ẩn mình trong bóng tối làm nhiệt độ phòng hạ tức thì 10 độ C. Hoàn toàn miễn nhiễm trước các đòn đánh hệ Thường và Giác Đấu.',
  },
  {
    id: 248,
    dex: '#0248',
    name: 'Tyranitar',
    category: 'Pokémon Giáp Sắt',
    types: ['rock', 'dark'],
    typesVi: 'Đá / Bóng Tối',
    bst: 600,
    hp: 100,
    atk: 134,
    def: 110,
    spd: 61,
    ability: 'Sand Stream (Bão Cát Cuộn Trào)',
    ivTrait: 'Tự hào về sức mạnh áp đảo (30 ATK · dư 0)',
    region: 'Johto · Núi Silver',
    tone: 'field-1',
    image: '/assets/pokemon/248.png',
    animated: '/assets/pokemon/animated/248.gif',
    summary:
      'Lớp giáp đá kiên cố không thể xuyên phá bởi các đòn tấn công thông thường. Miễn nhiễm đòn Tâm Linh và sở hữu 134 điểm Tấn Công gốc.',
  },
  {
    id: 384,
    dex: '#0384',
    name: 'Rayquaza',
    category: 'Pokémon Thiên Không',
    types: ['dragon', 'flying'],
    typesVi: 'Rồng / Bay',
    bst: 680,
    hp: 105,
    atk: 150,
    def: 90,
    spd: 95,
    ability: 'Air Lock (Khóa Tầng Khí Quyển)',
    ivTrait: 'Phong thái kiêu hãnh (31 SPD · dư 1)',
    region: 'Hoenn · Cột Trụ Bầu Trời',
    tone: 'surface',
    image: '/assets/pokemon/384.png',
    animated: '/assets/pokemon/animated/384.gif',
    summary:
      'Ngự trị trên tầng ozone vượt trên ngàn mây. Kích hoạt khả năng vô hiệu hóa mọi hiệu ứng thời tiết và buff nguyên tố trên toàn bàn cờ.',
  },
  {
    id: 448,
    dex: '#0448',
    name: 'Lucario',
    category: 'Pokémon Sóng Aura',
    types: ['fighting', 'steel'],
    typesVi: 'Giác Đấu / Thép',
    bst: 525,
    hp: 70,
    atk: 110,
    def: 70,
    spd: 90,
    ability: 'Justified (Tâm Thế Chính Nghĩa)',
    ivTrait: 'Khả năng chịu đòn bền bỉ (31 DEF · dư 1)',
    region: 'Sinnoh · Đảo Thiết Quặng',
    tone: 'field-1',
    image: '/assets/pokemon/448.png',
    animated: '/assets/pokemon/animated/448.gif',
    summary:
      'Cảm nhận làn sóng Aura để phán đoán chính xác hướng di chuyển của đối phương từ xa. Hoàn toàn miễn nhiễm Độc và kháng mạnh hệ Đá.',
  },
  {
    id: 282,
    dex: '#0282',
    name: 'Gardevoir',
    category: 'Pokémon Tâm Linh',
    types: ['psychic', 'fairy'],
    typesVi: 'Tâm Linh / Tiên',
    bst: 518,
    hp: 68,
    atk: 65,
    def: 65,
    spd: 80,
    ability: 'Trace (Dò Quét Sao Chép)',
    ivTrait: 'Nhanh nhẹn và tinh quái (31 SPA · dư 1)',
    region: 'Hoenn · Tuyến đường 102',
    tone: 'surface',
    image: '/assets/pokemon/282.png',
    animated: '/assets/pokemon/animated/282.gif',
    summary:
      'Tự động sao chép kỹ năng của đối thủ khi xuất trận, đồng thời miễn nhiễm 100% trước tất cả các đòn tấn công hủy diệt hệ Rồng.',
  },
]

const ATTACK_TYPES = [
  { key: 'fire', label: 'Lửa (Fire)' },
  { key: 'water', label: 'Nước (Water)' },
  { key: 'electric', label: 'Điện (Electric)' },
  { key: 'ice', label: 'Băng (Ice)' },
  { key: 'fighting', label: 'Giác Đấu (Fight)' },
  { key: 'dragon', label: 'Rồng (Dragon)' },
] as const

type AttackKey = (typeof ATTACK_TYPES)[number]['key']

const TYPE_EFFECTIVENESS: Record<AttackKey, { double: string[]; half: string[]; zero: string[] }> = {
  fire: { double: ['grass', 'ice', 'bug', 'steel'], half: ['fire', 'water', 'rock', 'dragon'], zero: [] },
  water: { double: ['fire', 'ground', 'rock'], half: ['water', 'grass', 'dragon'], zero: [] },
  electric: { double: ['water', 'flying'], half: ['electric', 'grass', 'dragon'], zero: ['ground'] },
  ice: { double: ['grass', 'ground', 'flying', 'dragon'], half: ['fire', 'water', 'ice', 'steel'], zero: [] },
  fighting: { double: ['normal', 'ice', 'rock', 'dark', 'steel'], half: ['poison', 'flying', 'psychic', 'bug', 'fairy'], zero: ['ghost'] },
  dragon: { double: ['dragon'], half: ['steel'], zero: ['fairy'] },
}


type WorkflowStage = {
  heading: string
  description: string
  metricAVal: string
  metricALbl: string
  metricBVal: string
  metricBLbl: string
  stopLabel: string
  uiTitle: string
  uiBadge: string
  rows: { col1: string; col2: string; col3: string }[]
}

const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    heading: 'Bước 1: Chọn Pokédex khu vực',
    description:
      'Nạp danh mục Pokémon bất kỳ từ PokeAPI v2. Sắp xếp theo mã số quốc gia hoặc tên loài và chiêm ngưỡng tác phẩm Sugimori độ phân giải cao.',
    metricAVal: '8 khu vực',
    metricALbl: 'Từ Kanto đến Galar',
    metricBVal: '1.302 mục',
    metricBLbl: 'Dữ liệu trực tiếp',
    stopLabel: '1: Pokédex vùng',
    uiTitle: 'Bách khoa Pokédex · Vùng Kanto',
    uiBadge: '151 loài đã tải',
    rows: [
      { col1: 'Bulbasaur (#001)', col2: 'Hệ Cỏ / Độc', col3: 'Mục #1' },
      { col1: 'Charizard (#006)', col2: 'Hệ Lửa / Bay', col3: 'Mục #6' },
      { col1: 'Gengar (#094)', col2: 'Hệ Ma / Độc', col3: 'Mục #94' },
      { col1: 'Dragonite (#149)', col2: 'Hệ Rồng / Bay', col3: 'Mục #149' },
    ],
  },
  {
    heading: 'Bước 2: Phân tích chỉ số IV & Kỹ năng',
    description:
      'Kiểm chứng kỹ năng ẩn, các điều khoản miễn nhiễm và số dư Modulo 5 của điểm cá thể IV trước khi quyết định đưa Pokémon vào đội hình thi đấu.',
    metricAVal: '30 đặc tính',
    metricALbl: 'Bảng Modulo 5 IV',
    metricBVal: '367 kỹ năng',
    metricBLbl: 'Nội tại chính thức',
    stopLabel: '2: Chỉ số IV',
    uiTitle: 'Bảng phân tích đặc tính IV & Kỹ năng',
    uiBadge: 'Đã xác thực Modulo 5',
    rows: [
      { col1: 'Tự hào về sức mạnh', col2: 'Cao nhất: Tấn công', col3: 'IV 30 (dư 0)' },
      { col1: 'Thích xông pha hỗn chiến', col2: 'Cao nhất: Tấn công', col3: 'IV 31 (dư 1)' },
      { col1: 'Nhạy bén với âm thanh', col2: 'Cao nhất: Tốc độ', col3: 'IV 31 (dư 1)' },
      { col1: 'Chịu đòn kiên cường', col2: 'Cao nhất: Phòng thủ', col3: 'IV 31 (dư 1)' },
    ],
  },
  {
    heading: 'Bước 3: Ghép chuỗi rune chiến thuật',
    description:
      'Hoán đổi vị trí các viên rune liền kề trên bàn cờ 8×8 trong giới hạn 15 giây. Ghép từ 4 viên trở lên để lập tức kích hoạt thêm một lượt đi thưởng.',
    metricAVal: 'Lưới 8×8',
    metricALbl: '64 ô rune chiến thuật',
    metricBVal: '15 giây',
    metricBLbl: 'Đồng hồ đếm ngược',
    stopLabel: '3: Ghép rune',
    uiTitle: 'Bàn cờ Match-3 · Giám sát lượt đấu',
    uiBadge: 'Còn lại 11 giây',
    rows: [
      { col1: 'Rune Kiếm (Ghép 3)', col2: 'Tấn công vật lý', col3: '24 Sát thương' },
      { col1: 'Rune Mana (Ghép 4)', col2: 'Thêm lượt + Năng lượng', col3: '+32 Mana' },
      { col1: 'Combo Nộ & Hút máu', col2: 'Phục hồi sinh lực', col3: '+18 Máu' },
      { col1: 'Chuỗi Khiên Giáp', col2: 'Giảm thiểu sát thương', col3: '+20 Giáp' },
    ],
  },
  {
    heading: 'Bước 4: Tung tuyệt kỹ tối thượng',
    description:
      'Khi thanh Mana chạm mốc 100, kích hoạt kỹ năng đặc trưng của Pokémon với trọn vẹn số nhân 18 hệ (2x siêu hiệu quả, 0.5x kháng đòn, hoặc 0x miễn nhiễm).',
    metricAVal: '100 Mana',
    metricALbl: 'Ngưỡng nộ khí tối đa',
    metricBVal: '18 hệ',
    metricBLbl: 'Bảng tương khắc chuẩn',
    stopLabel: '4: Tuyệt kỹ',
    uiTitle: 'Nhật ký thi đấu · Kích hoạt chiêu thức',
    uiBadge: '2x Siêu hiệu quả',
    rows: [
      { col1: 'Charizard · Flamethrower', col2: 'vs Scizor (Bọ / Thép)', col3: '196 Sát thương (4x)' },
      { col1: 'Lucario · Aura Sphere', col2: 'vs Tyranitar (Đá / Tối)', col3: '184 Sát thương (4x)' },
      { col1: 'Gengar · Shadow Ball', col2: 'vs Gardevoir (Tâm Linh)', col3: '142 Sát thương (2x)' },
      { col1: 'Gardevoir · Moonblast', col2: 'vs Rayquaza (Rồng)', col3: '158 Sát thương (2x)' },
    ],
  },
]

const s = (vars: Record<string, string | number>): CSSProperties => vars as unknown as CSSProperties

export default function LandingPage() {
  const navigate = useNavigate()
  const rootRef = useRef<HTMLDivElement>(null)

  const [selectedSpecimenId, setSelectedSpecimenId] = useState<number>(6)
  const [selectedAttack, setSelectedAttack] = useState<AttackKey>('water')
  const [stageIndex, setStageIndex] = useState<number>(0)
  const [launchQuery, setLaunchQuery] = useState<string>('charizard')
  const [launchMode, setLaunchMode] = useState<'pokedex' | 'battle'>('pokedex')

  const activeSpecimen = useMemo(
    () => SPECIMENS.find((item) => item.id === selectedSpecimenId) ?? SPECIMENS[0],
    [selectedSpecimenId],
  )

  const matchupMultiplier = useMemo(() => {
    const chart = TYPE_EFFECTIVENESS[selectedAttack]
    let mult = 1
    for (const defType of activeSpecimen.types) {
      if (chart.zero.includes(defType)) mult *= 0
      else if (chart.double.includes(defType)) mult *= 2
      else if (chart.half.includes(defType)) mult *= 0.5
    }
    return mult
  }, [activeSpecimen, selectedAttack])

  const matchupVerdict = useMemo(() => {
    if (matchupMultiplier === 0) return '0x Miễn nhiễm (Không nhận sát thương)'
    if (matchupMultiplier >= 4) return '4x Điểm yếu chí mạng (Sát thương gấp 4)'
    if (matchupMultiplier === 2) return '2x Siêu hiệu quả (Sát thương gấp đôi)'
    if (matchupMultiplier === 0.5) return '0.5x Giảm nửa sát thương (Kháng đòn)'
    if (matchupMultiplier <= 0.25) return '0.25x Kháng cự vượt trội (Chỉ nhận 1/4)'
    return '1x Sát thương cơ bản (Trung tính)'
  }, [matchupMultiplier])

  const currentStage = WORKFLOW_STAGES[stageIndex] ?? WORKFLOW_STAGES[0]

  useEffect(() => {
    document.documentElement.classList.add('js')
    const root = rootRef.current
    if (!root) return

    const calm = window.matchMedia('(prefers-reduced-motion: reduce)')
    const revealEls = [...root.querySelectorAll<HTMLElement>('[data-reveal], .tm-shutter')]

    if (calm.matches || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('is-in'))
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-in')
              io.unobserve(entry.target)
            }
          }
        },
        { rootMargin: '120px 0px 120px 0px', threshold: 0.01 },
      )
      revealEls.forEach((el) => io.observe(el))
    }

    const clips = [...root.querySelectorAll<HTMLVideoElement>('video[autoplay]')]
    const inView = new Set<HTMLVideoElement>()
    const syncVideo = (v: HTMLVideoElement) => {
      if (calm.matches) return
      if (inView.has(v)) {
        v.play().catch(() => { })
      } else {
        v.pause()
      }
    }
    const settleVideos = () => {
      for (const v of clips) {
        if (calm.matches) {
          v.removeAttribute('autoplay')
          v.pause()
        } else if (inView.has(v)) {
          v.play().catch(() => { })
        }
      }
    }
    const videoObserver = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const vid = e.target as HTMLVideoElement
          if (e.isIntersecting) inView.add(vid)
          else inView.delete(vid)
          syncVideo(vid)
        }
      },
      { threshold: 0.2 },
    )
    clips.forEach((v) => videoObserver.observe(v))
    settleVideos()
    calm.addEventListener('change', settleVideos)

    return () => {
      videoObserver.disconnect()
      calm.removeEventListener('change', settleVideos)
    }
  }, [])

  const handleLaunchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const clean = launchQuery.trim().toLowerCase()
    if (launchMode === 'battle') {
      navigate('/battle')
      return
    }
    const regions = ['kanto', 'johto', 'hoenn', 'sinnoh', 'unova', 'kalos', 'alola', 'galar']
    if (regions.includes(clean)) {
      navigate(`/pokedex/${clean}`)
    } else {
      navigate('/pokemon')
    }
  }

  return (
    <ReactLenis root options={{ lerp: 0.06, duration: 1.4, smoothWheel: true }}>
      <div className="tm-page" ref={rootRef}>
      <LiquidGlassFilter />
      {/* Navigation Bar */}
      <header className="tm-header">
        <nav className="tm-nav" aria-label="Điều hướng chính">
          <Link to="/" className="tm-wordmark">
            <img src="/assets/logo.jpg" alt="Poke Hub Logo" className="tm-wordmark-logo" />
            <span>Poke Hub</span>
          </Link>

          <ul className="tm-nav-links">
            {NAV_ITEMS.filter((item) => !item.isAction).map((item) => (
              <li key={item.path}>
                <Link to={item.path} className="tm-link" title={item.labelVi}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link to="/battle" className="tm-btn">
            Battle Sim
          </Link>
        </nav>
      </header>

      <main>
        {/* HERO — Bách khoa Pokédex & Đấu trường chiến thuật */}
        <section className="tm-hero" aria-labelledby="hero-title">
          <div className="tm-hero-copy">
            <LiquidGlassCard
              className="tm-hero-top"
              tone="light"
              blurIntensity="xl"
              shadowIntensity="md"
              glowIntensity="sm"
              borderRadius="28px"
              draggable
            >
              <h1 id="hero-title" className="tm-display tm-lines">
                <span className="tm-line">
                  <span data-line style={s({ '--i': 0 })}>
                    Bách khoa Pokédex
                  </span>
                </span>
                <span className="tm-line">
                  <span data-line style={s({ '--i': 1 })}>
                    &amp; Đấu trường 8×8
                  </span>
                </span>
              </h1>

              <p className="tm-lead" data-load style={s({ '--d': '320ms' })}>
                Tra cứu 1.302 loài Pokémon theo thời gian thực từ PokeAPI v2, so sánh bách khoa từng vùng,
                giải mã đặc tính IV và đọ sức trên bàn cờ rune 8×8 đỉnh cao.
              </p>

              <div className="tm-hero-actions" data-load style={s({ '--d': '420ms' })}>
                <Link to="/battle" className="tm-btn">
                  Vào đấu trường
                </Link>
                <Link to="/pokedex/kanto" className="tm-link">
                  Mở Pokédex Kanto
                </Link>
              </div>
            </LiquidGlassCard>

            <div className="tm-hero-facts" data-load style={s({ '--d': '520ms' })}>
              <LiquidGlassCard
                className="tm-hero-fact"
                tone="light"
                blurIntensity="lg"
                shadowIntensity="md"
                glowIntensity="sm"
                borderRadius="20px"
                draggable
              >
                <span className="tm-hero-fact-num">1.302 loài</span>
                <span className="tm-hero-fact-desc">Nạp trực tiếp từ PokeAPI v2</span>
              </LiquidGlassCard>
              <LiquidGlassCard
                className="tm-hero-fact"
                tone="light"
                blurIntensity="lg"
                shadowIntensity="md"
                glowIntensity="sm"
                borderRadius="20px"
                draggable
              >
                <span className="tm-hero-fact-num">18 hệ tương khắc</span>
                <span className="tm-hero-fact-desc">Bảng tính sát thương chuẩn xác</span>
              </LiquidGlassCard>
              <LiquidGlassCard
                className="tm-hero-fact"
                tone="light"
                blurIntensity="lg"
                shadowIntensity="md"
                glowIntensity="sm"
                borderRadius="20px"
                draggable
              >
                <span className="tm-hero-fact-num">Lưới 8×8 rune</span>
                <span className="tm-hero-fact-desc">Động cơ ghép Match-3 theo lượt</span>
              </LiquidGlassCard>
            </div>
          </div>

          <LiquidGlassCard
            className="tm-hero-stage"
            tone="dark"
            blurIntensity="xl"
            shadowIntensity="sm"
            glowIntensity="md"
            borderRadius="32px"
          >
            <div className="tm-hero-stage-header">
              <div className="tm-hero-art-box">
                <img
                  src="/assets/pokemon/animated/6.gif"
                  alt="Charizard hoạt ảnh động"
                  width={100}
                  height={100}
                  className="tm-hero-stage-animated"
                />
              </div>
              <div className="tm-hero-stage-summary">
                <p className="tm-stage-title">Mẫu vật thực địa · Charizard (#0006)</p>
                <p className="tm-stage-sub">
                  Hệ Lửa &amp; Bay · Tổng chỉ số BST 534 · Kỹ năng ẩn: Solar Power · Khu vực Kanto
                </p>
              </div>
            </div>

            {/* Bảng điều khiển chiến thuật [data-ui] */}
            <div className="tm-ui-console" data-ui>
              <div className="tm-ui-bar">
                <span className="tm-ui-title">Bảng điều khiển chiến thuật &amp; Telemetry</span>
                <span className="tm-ui-status tm-status-live">
                  <span className="tm-pulse-beacon" aria-hidden="true" />
                  pokeapi.co/v2 · 200 Sẵn sàng
                </span>
              </div>

              <div className="tm-ui-stats-grid">
                <div className="tm-ui-stat-cell">
                  <span className="tm-ui-stat-label">Sinh lực (HP)</span>
                  <span className="tm-ui-stat-val">188 / 188</span>
                  <div className="tm-meter-bar">
                    <span className="tm-meter-fill tm-meter-hp" style={{ width: '100%' }} />
                  </div>
                </div>
                <div className="tm-ui-stat-cell">
                  <span className="tm-ui-stat-label">Tấn công / Tốc độ</span>
                  <span className="tm-ui-stat-val">84 / 100</span>
                  <div className="tm-meter-bar">
                    <span className="tm-meter-fill tm-meter-atk" style={{ width: '84%' }} />
                  </div>
                </div>
                <div className="tm-ui-stat-cell">
                  <span className="tm-ui-stat-label">Thanh Mana nộ khí</span>
                  <span className="tm-ui-stat-val">85 / 100</span>
                  <div className="tm-meter-bar">
                    <span className="tm-meter-fill tm-meter-mana" style={{ width: '85%' }} />
                  </div>
                </div>
                <div className="tm-ui-stat-cell">
                  <span className="tm-ui-stat-label">Đồng hồ lượt đấu</span>
                  <span className="tm-ui-stat-val tm-clock-val">12s còn lại</span>
                  <div className="tm-meter-bar">
                    <span className="tm-meter-fill tm-meter-clock" style={{ width: '80%' }} />
                  </div>
                </div>
              </div>

              <div className="tm-ui-board-strip" aria-label="Chuỗi rune mẫu trên bàn cờ 8x8">
                <div className="tm-ui-rune is-matched">Kiếm · +18 DMG</div>
                <div className="tm-ui-rune is-matched">Kiếm · +18 DMG</div>
                <div className="tm-ui-rune is-matched">Kiếm · +18 DMG</div>
                <div className="tm-ui-rune tm-rune-mana">Mana · +15</div>
                <div className="tm-ui-rune tm-rune-rage">Nộ khí · +12</div>
                <div className="tm-ui-rune tm-rune-shield">Khiên · +10</div>
              </div>
            </div>
          </LiquidGlassCard>
        </section>

        {/* SECTION 1: SHOWCASE — Bàn phân tích mẫu vật thực địa & Máy tính sát thương 18 hệ */}
        <motion.section
          className="tm-showcase"
          aria-labelledby="showcase-title"
          initial={{ opacity: 0.92, y: 24, scale: 0.985 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.08 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="tm-showcase-header">
            <h2 id="showcase-title" className="tm-head" data-reveal style={s({ '--delay': '0ms' })}>
              Bàn phân tích mẫu vật
            </h2>
            <p className="tm-body" data-reveal style={s({ '--delay': '80ms' })}>
              Chọn bất kỳ Pokémon nào để kích hoạt khung soi mẫu vật với hoạt ảnh động thời gian thực
              và kiểm tra ngay bảng tính hệ số sát thương 18 hệ tương khắc.
            </p>
          </div>

          <div className="tm-showcase-stage">
            <ul className="tm-specimen-list" aria-label="Danh sách Pokémon mẫu">
              {SPECIMENS.map((item, idx) => {
                const active = item.id === activeSpecimen.id
                return (
                  <li key={item.id} data-reveal style={s({ '--delay': `${idx * 65}ms` })}>
                    <button
                      type="button"
                      className={`tm-specimen-btn${active ? ' is-active' : ''}`}
                      onClick={() => setSelectedSpecimenId(item.id)}
                      aria-pressed={active}
                    >
                      <span className="tm-specimen-btn-name">
                        <img
                          src={item.animated}
                          alt=""
                          width={28}
                          height={28}
                          className="tm-btn-mini-sprite"
                          aria-hidden="true"
                        />
                        <span>{item.name}</span>
                      </span>
                      <span className="tm-specimen-dex">{item.dex}</span>
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="tm-aperture-wrap" data-reveal style={s({ '--delay': '90ms' })}>
              <div className="tm-aperture-disc" data-tone={activeSpecimen.tone}>
                <div className="tm-aperture-radar" aria-hidden="true" />
                <img
                  key={`anim-${activeSpecimen.id}`}
                  src={activeSpecimen.animated}
                  alt={`${activeSpecimen.name} hoạt ảnh động`}
                  width={170}
                  height={170}
                  className="tm-aperture-anim-center"
                />
              </div>
            </div>

            <LiquidGlassCard
              className="tm-specimen-dossier"
              tone="light"
              blurIntensity="lg"
              shadowIntensity="md"
              glowIntensity="sm"
              borderRadius="24px"
            >
              <p className="tm-dossier-title">
                {activeSpecimen.name} · {activeSpecimen.category}
              </p>
              <p className="tm-body">{activeSpecimen.summary}</p>

              <div className="tm-dossier-meta">
                <div className="tm-dossier-cell">
                  <span className="tm-dossier-label">Hệ nguyên tố</span>
                  <span className="tm-dossier-val">{activeSpecimen.typesVi}</span>
                </div>
                <div className="tm-dossier-cell">
                  <span className="tm-dossier-label">Tổng chỉ số gốc</span>
                  <span className="tm-dossier-val">{activeSpecimen.bst} BST</span>
                </div>
                <div className="tm-dossier-cell">
                  <span className="tm-dossier-label">Kỹ năng đặc trưng</span>
                  <span className="tm-dossier-val">{activeSpecimen.ability}</span>
                </div>
                <div className="tm-dossier-cell">
                  <span className="tm-dossier-label">Nơi xuất hiện</span>
                  <span className="tm-dossier-val">{activeSpecimen.region}</span>
                </div>
              </div>

              <div className="tm-matchup-tester">
                <span className="tm-dossier-label">
                  Thử nghiệm đòn tấn công vào {activeSpecimen.name}:
                </span>
                <div className="tm-type-row" role="group" aria-label="Hệ tấn công thử nghiệm">
                  {ATTACK_TYPES.map((type) => (
                    <button
                      key={type.key}
                      type="button"
                      className={`tm-type-chip${selectedAttack === type.key ? ' is-selected' : ''}`}
                      onClick={() => setSelectedAttack(type.key)}
                      aria-pressed={selectedAttack === type.key}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
                <div className="tm-matchup-result" aria-live="polite">
                  <strong>
                    {ATTACK_TYPES.find((t) => t.key === selectedAttack)?.label} tấn công {activeSpecimen.name}:
                  </strong>{' '}
                  <span className="tm-verdict-tag">{matchupVerdict}</span>
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        </motion.section>

        {/* SECTION 3: HOW IT WORKS — Quy trình 4 bước trải nghiệm */}
        <motion.section
          className="tm-how"
          aria-labelledby="how-title"
          initial={{ opacity: 0.92, y: 24, scale: 0.985 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.08 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="tm-how-split">
            <div className="tm-how-left" data-reveal style={s({ '--delay': '0ms' })}>
              <div>
                <h2 id="how-title" className="tm-head">
                  {currentStage.heading}
                </h2>
                <p className="tm-body" style={{ marginTop: '1.25rem' }}>
                  {currentStage.description}
                </p>
              </div>

              <div className="tm-how-metrics">
                <div className="tm-how-metric">
                  <span className="tm-how-metric-val">{currentStage.metricAVal}</span>
                  <span className="tm-how-metric-lbl">{currentStage.metricALbl}</span>
                </div>
                <div className="tm-how-metric">
                  <span className="tm-how-metric-val">{currentStage.metricBVal}</span>
                  <span className="tm-how-metric-lbl">{currentStage.metricBLbl}</span>
                </div>
              </div>
            </div>

            <div className="tm-how-right" data-reveal style={s({ '--delay': '90ms' })}>
              <div className="tm-stage-ui" data-ui>
                <div className="tm-ui-bar">
                  <span className="tm-ui-title">{currentStage.uiTitle}</span>
                  <span className="tm-ui-status">{currentStage.uiBadge}</span>
                </div>
                <table className="tm-stage-table">
                  <thead>
                    <tr>
                      <th>Đối tượng / Thao tác</th>
                      <th>Phân loại hệ thống</th>
                      <th className="num">Thông số đầu ra</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStage.rows.map((row) => (
                      <tr key={row.col1}>
                        <td>{row.col1}</td>
                        <td>{row.col2}</td>
                        <td className="num">{row.col3}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="tm-how-slider-bar" data-reveal style={s({ '--delay': '140ms' })}>
            <label htmlFor="workflow-stage-range" className="tm-range-label">
              <span>Kéo thanh trượt hoặc nhấn vào các nút để chuyển bước</span>
              <span className="tm-tabular">{currentStage.stopLabel}</span>
            </label>
            <input
              id="workflow-stage-range"
              type="range"
              min={0}
              max={3}
              step={1}
              value={stageIndex}
              onChange={(e) => setStageIndex(Number(e.target.value))}
              className="tm-range-input"
            />
            <div className="tm-stage-stops">
              {WORKFLOW_STAGES.map((st, idx) => (
                <button
                  key={st.stopLabel}
                  type="button"
                  className={`tm-stage-stop${idx === stageIndex ? ' is-current' : ''}`}
                  onClick={() => setStageIndex(idx)}
                >
                  {st.stopLabel}
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* SECTION 4: WORK / ARCHIVE — Tám phân hệ hoạt động */}
        <section className="tm-work" aria-labelledby="work-title">
          <div className="tm-work-header">
            <h2 id="work-title" className="tm-head" data-reveal style={s({ '--delay': '0ms' })}>
              Tám phân hệ dữ liệu
            </h2>
            <p className="tm-body" data-reveal style={s({ '--delay': '80ms' })}>
              Lấy cảm hứng từ những cuốn sổ tay thực địa thu thập côn trùng của nhà sáng lập Satoshi Tajiri,
              mỗi phân hệ trong Poke Hub bóc tách chuyên sâu một khía cạnh phân loại học Pokémon.
            </p>
          </div>

          <ul className="tm-stagger-grid">
            {/* Row 1 */}
            <li className="tm-tile tm-tile-span-1-2" data-reveal style={s({ '--delay': '0ms' })}>
              <Link to="/pokedex/kanto" className="tm-tile-media" data-tile-bg="field-1">
                <div className="tm-tile-info">
                  <span className="tm-tile-title">Bách khoa Pokédex các vùng</span>
                  <span className="tm-tile-desc">
                    Tra cứu danh bạ Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola và Galar với chức năng lọc trực tiếp.
                  </span>
                </div>
                <div className="tm-tile-art-wrap">
                  <img
                    src="/assets/pokemon/animated/149.gif"
                    alt="Dragonite"
                    width={100}
                    height={100}
                    className="tm-tile-animated"
                  />
                </div>
              </Link>
              <div className="tm-tile-caption">
                <span>Pokédex khu vực (/pokedex)</span>
                <span className="tm-tile-caption-meta">8 khu vực · 1.025 bản ghi</span>
              </div>
            </li>

            <li className="tm-tile tm-tile-col-3" data-reveal style={s({ '--delay': '70ms' })}>
              <div className="tm-tile-media tm-tile-video-media">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster="/assets/dung-beetle-dance-long-from-journal-pone-poster.jpg"
                  width={854}
                  height={480}
                  aria-hidden="true"
                >
                  <source
                    src="/assets/dung-beetle-dance-long-from-journal-pone.webm"
                    type="video/webm"
                  />
                </video>
              </div>
              <div className="tm-tile-caption">
                <span>Nguồn gốc côn trùng học</span>
                <span className="tm-tile-caption-meta">Tư liệu nghiên cứu thực địa</span>
              </div>
            </li>

            <li className="tm-tile tm-tile-col-4" data-reveal style={s({ '--delay': '140ms' })}>
              <Link to="/battle" className="tm-tile-media" data-tile-bg="surface">
                <div className="tm-tile-info">
                  <span className="tm-tile-title">Đấu trường 8×8</span>
                  <span className="tm-tile-desc">
                    Ghép rune Match-3 với bảng số nhân sát thương 18 hệ.
                  </span>
                </div>
                <div className="tm-tile-art-wrap">
                  <img
                    src="/assets/pokemon/animated/212.gif"
                    alt="Scizor"
                    width={96}
                    height={96}
                    className="tm-tile-animated"
                  />
                </div>
              </Link>
              <div className="tm-tile-caption">
                <span>Đấu trường Match-3 (/battle)</span>
                <span className="tm-tile-caption-meta">64 ô rune · Đồng hồ 15s</span>
              </div>
            </li>

            {/* Row 2 */}
            <li className="tm-tile tm-tile-col-1" data-reveal style={s({ '--delay': '60ms' })}>
              <Link to="/ability" className="tm-tile-media" data-tile-bg="surface">
                <div className="tm-tile-info">
                  <span className="tm-tile-title">Kỹ năng nội tại</span>
                  <span className="tm-tile-desc">
                    Hiệu ứng thụ động và các dòng kỹ năng ẩn.
                  </span>
                </div>
                <div className="tm-tile-art-wrap">
                  <img
                    src="/assets/pokemon/animated/94.gif"
                    alt="Gengar"
                    width={90}
                    height={90}
                    className="tm-tile-animated"
                  />
                </div>
              </Link>
              <div className="tm-tile-caption">
                <span>Từ điển Kỹ năng (/ability)</span>
                <span className="tm-tile-caption-meta">367 kỹ năng nội tại</span>
              </div>
            </li>

            <li className="tm-tile tm-tile-col-2" data-reveal style={s({ '--delay': '120ms' })}>
              <Link to="/characteristic" className="tm-tile-media" data-tile-bg="field-1">
                <div className="tm-tile-info">
                  <span className="tm-tile-title">Đặc tính IV</span>
                  <span className="tm-tile-desc">
                    Giải mã chỉ số cá thể IV theo dư số Modulo 5.
                  </span>
                </div>
                <div className="tm-tile-art-wrap">
                  <img
                    src="/assets/pokemon/animated/448.gif"
                    alt="Lucario"
                    width={92}
                    height={92}
                    className="tm-tile-animated"
                  />
                </div>
              </Link>
              <div className="tm-tile-caption">
                <span>Đặc tính cá thể (/characteristic)</span>
                <span className="tm-tile-caption-meta">30 tính cách Modulo 5</span>
              </div>
            </li>

            <li className="tm-tile tm-tile-span-3-4" data-reveal style={s({ '--delay': '180ms' })}>
              <Link to="/pokemon" className="tm-tile-media" data-tile-bg="surface">
                <div className="tm-tile-info">
                  <span className="tm-tile-title">Danh mục quốc gia 1.302 loài</span>
                  <span className="tm-tile-desc">
                    Danh mục đầy đủ 1.302 loài Pokémon với bộ lọc tìm kiếm tức thời theo tên và mã số,
                    hỗ trợ chuyển mạch dự phòng và thẻ hiển thị sprite chính thức.
                  </span>
                </div>
                <div className="tm-tile-art-wrap">
                  <img
                    src="/assets/pokemon/animated/384.gif"
                    alt="Rayquaza"
                    width={110}
                    height={110}
                    className="tm-tile-animated"
                  />
                </div>
              </Link>
              <div className="tm-tile-caption">
                <span>Danh bạ Pokémon (/pokemon)</span>
                <span className="tm-tile-caption-meta">1.302 loài · Nạp trực tiếp</span>
              </div>
            </li>

            {/* Row 3 */}
            <li className="tm-tile tm-tile-span-1-2" data-reveal style={s({ '--delay': '80ms' })}>
              <Link to="/pokeathlon-stat" className="tm-tile-media" data-tile-bg="field-1">
                <div className="tm-tile-info">
                  <span className="tm-tile-title">Ma trận thể lực Pokéathlon Johto</span>
                  <span className="tm-tile-desc">
                    Theo dõi điểm số 5 vòng Tốc độ, Sức mạnh, Kỹ năng, Thể lực và Bật cao,
                    đồng thời phân tích tác động tăng giảm của 25 loại tính cách tự nhiên.
                  </span>
                </div>
                <div className="tm-tile-art-wrap">
                  <img
                    src="/assets/pokemon/animated/248.gif"
                    alt="Tyranitar"
                    width={100}
                    height={100}
                    className="tm-tile-animated"
                  />
                </div>
              </Link>
              <div className="tm-tile-caption">
                <span>Chỉ số Pokéathlon (/pokeathlon-stat)</span>
                <span className="tm-tile-caption-meta">5 vòng thi · 25 tính cách</span>
              </div>
            </li>

            <li className="tm-tile tm-tile-col-3" data-reveal style={s({ '--delay': '140ms' })}>
              <Link to="/games" className="tm-tile-media" data-tile-bg="surface">
                <div className="tm-tile-info">
                  <span className="tm-tile-title">Kỷ nguyên thế hệ</span>
                  <span className="tm-tile-desc">
                    9 thế hệ chính thức từ Red &amp; Blue đến Scarlet &amp; Violet.
                  </span>
                </div>
                <div className="tm-tile-art-wrap">
                  <img
                    src="/assets/pokemon/animated/282.gif"
                    alt="Gardevoir"
                    width={90}
                    height={90}
                    className="tm-tile-animated"
                  />
                </div>
              </Link>
              <div className="tm-tile-caption">
                <span>Thế hệ game (/games)</span>
                <span className="tm-tile-caption-meta">Gen I đến Gen IX</span>
              </div>
            </li>

            <li className="tm-tile tm-tile-col-4" data-reveal style={s({ '--delay': '200ms' })}>
              <Link to="/locations" className="tm-tile-media" data-tile-bg="field-1">
                <div className="tm-tile-info">
                  <span className="tm-tile-title">Bản đồ địa danh</span>
                  <span className="tm-tile-desc">
                    Tuyến đường, hang động và tọa độ bắt gặp Pokémon.
                  </span>
                </div>
                <div className="tm-tile-art-wrap">
                  <img
                    src="/assets/pokemon/animated/6.gif"
                    alt="Charizard"
                    width={96}
                    height={96}
                    className="tm-tile-animated"
                  />
                </div>
              </Link>
              <div className="tm-tile-caption">
                <span>Bản đồ lộ trình (/locations)</span>
                <span className="tm-tile-caption-meta">Hơn 850 địa danh</span>
              </div>
            </li>
          </ul>
        </section>

        {/* SECTION 5: CTA — Khởi chạy phiên làm việc */}
        <section className="tm-cta" id="launch" aria-labelledby="cta-title">
          <div className="tm-cta-grid">
            <div className="tm-cta-left" data-reveal style={s({ '--delay': '0ms' })}>
              <div className="tm-cta-copy">
                <h2 id="cta-title" className="tm-head">
                  Khởi chạy phiên tra cứu
                </h2>
                <p className="tm-body">
                  Nhập tên vùng hoặc tên Pokémon bất kỳ để truy cập thẳng vào trang kiểm tra chi tiết,
                  hoặc mở ngay Đấu trường 8×8 để tham gia trận chiến Match-3.
                </p>
              </div>

              <div className="tm-cta-highlights">
                <div className="tm-cta-highlight">
                  <span className="tm-hero-fact-num">Không cần API Key</span>
                  <span className="tm-hero-fact-desc">
                    Truy vấn trực tiếp từ trình duyệt đến pokeapi.co/api/v2
                  </span>
                </div>
                <div className="tm-cta-highlight">
                  <span className="tm-hero-fact-num">8 công cụ chuyên sâu</span>
                  <span className="tm-hero-fact-desc">
                    Mọi đường dẫn đều được trang bị bộ lọc tìm kiếm tức thời
                  </span>
                </div>
              </div>
            </div>

            <div className="tm-cta-right" data-reveal style={s({ '--delay': '100ms' })}>
              <form className="tm-launch-dialog" data-ui onSubmit={handleLaunchSubmit}>
                <div className="tm-ui-bar">
                  <span className="tm-dialog-title">Bắt đầu phiên làm việc</span>
                  <span className="tm-ui-status tm-status-live">
                    <span className="tm-pulse-beacon" aria-hidden="true" />
                    Sẵn sàng
                  </span>
                </div>

                <div className="tm-dialog-field">
                  <label htmlFor="workspace-query" className="tm-dialog-label">
                    Tên khu vực hoặc tên Pokémon (kanto, johto, hoenn, sinnoh, hoặc tên loài)
                  </label>
                  <input
                    id="workspace-query"
                    type="text"
                    value={launchQuery}
                    onChange={(e) => setLaunchQuery(e.target.value)}
                    className="tm-dialog-input"
                    aria-describedby="workspace-query-hint"
                  />
                  <span id="workspace-query-hint" className="tm-dialog-label">
                    Gợi ý nhanh:
                  </span>
                  <div className="tm-dialog-presets">
                    {['kanto', 'johto', 'hoenn', 'sinnoh', 'unova'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        className="tm-preset-btn"
                        onClick={() => setLaunchQuery(preset)}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="tm-dialog-field">
                  <span className="tm-dialog-label">Điểm đến mong muốn</span>
                  <div className="tm-segmented" role="group" aria-label="Điểm đến">
                    <button
                      type="button"
                      className={`tm-seg-btn${launchMode === 'pokedex' ? ' is-active' : ''}`}
                      onClick={() => setLaunchMode('pokedex')}
                      aria-pressed={launchMode === 'pokedex'}
                    >
                      Bách khoa Pokédex
                    </button>
                    <button
                      type="button"
                      className={`tm-seg-btn${launchMode === 'battle' ? ' is-active' : ''}`}
                      onClick={() => setLaunchMode('battle')}
                      aria-pressed={launchMode === 'battle'}
                    >
                      Đấu trường 8×8
                    </button>
                  </div>
                </div>

                <button type="submit" className="tm-btn" style={{ width: '100%' }}>
                  Bắt đầu ngay
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* SECTION 6: FOOTER — Biểu tượng POKE HUB cỡ lớn */}
      <SiteFooter />
      </div>
    </ReactLenis>
  )
}
