import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { NAV_ITEMS } from '../config/navigation'
import { BorderBeam } from '../components/ui/BorderBeam'
import { formatName, spriteFor } from '../utils/pokemon'
import SiteFooter from '../components/SiteFooter'
import './PokeathlonStatPage.css'

const POKEATHLON_ENDPOINT = 'https://pokeapi.co/api/v2/pokeathlon-stat/'

const PRESET_STATS = [
  { query: '1', key: 'speed', label: '#1 Tốc độ (Speed)' },
  { query: '2', key: 'power', label: '#2 Sức mạnh (Power)' },
  { query: '3', key: 'skill', label: '#3 Kỹ năng (Skill)' },
  { query: '4', key: 'stamina', label: '#4 Thể lực (Stamina)' },
  { query: '5', key: 'jump', label: '#5 Bật nhảy (Jump)' },
]

const STAT_VI: Record<string, string> = {
  speed: 'Tốc độ (Speed)',
  power: 'Sức mạnh (Power)',
  skill: 'Kỹ năng (Skill)',
  stamina: 'Thể lực (Stamina)',
  jump: 'Bật nhảy (Jump)',
}

const LANGUAGE_VI: Record<string, string> = {
  'ja-hrkt': 'Tiếng Nhật (Kana)',
  'ja-Hrkt': 'Tiếng Nhật (Kana)',
  roomaji: 'Tiếng Nhật (Romaji)',
  ko: 'Tiếng Hàn',
  'zh-hant': 'Tiếng Trung (Phồn thể)',
  'zh-Hant': 'Tiếng Trung (Phồn thể)',
  fr: 'Tiếng Pháp',
  de: 'Tiếng Đức',
  es: 'Tiếng Tây Ban Nha',
  'es-419': 'Tiếng Tây Ban Nha (Mỹ Latinh)',
  it: 'Tiếng Ý',
  en: 'Tiếng Anh',
  ja: 'Tiếng Nhật',
  'zh-hans': 'Tiếng Trung (Giản thể)',
  'zh-Hans': 'Tiếng Trung (Giản thể)',
}

const NATURE_VI: Record<string, string> = {
  hardy: 'Kiên nghị (Hardy)',
  lonely: 'Cô độc (Lonely)',
  brave: 'Dũng cảm (Brave)',
  adamant: 'Cứng rắn (Adamant)',
  naughty: 'Tinh nghịch (Naughty)',
  bold: 'Táo bạo (Bold)',
  docile: 'Ngoan ngoãn (Docile)',
  relaxed: 'Thư thái (Relaxed)',
  impish: 'Nghịch ngợm (Impish)',
  lax: 'Lơi lỏng (Lax)',
  timid: 'Nhút nhát (Timid)',
  hasty: 'Vội vã (Hasty)',
  serious: 'Nghiêm túc (Serious)',
  jolly: 'Vui vẻ (Jolly)',
  naive: 'Ngây thơ (Naive)',
  modest: 'Khiêm tốn (Modest)',
  mild: 'Ôn hòa (Mild)',
  quiet: 'Trầm lặng (Quiet)',
  bashful: 'Rụt rè (Bashful)',
  rash: 'Hấp tấp (Rash)',
  calm: 'Bình tĩnh (Calm)',
  gentle: 'Hiền lành (Gentle)',
  sassy: 'Xấc xược (Sassy)',
  careful: 'Cẩn trọng (Careful)',
  quirky: 'Kỳ quặc (Quirky)',
}

type NamedResource = {
  name?: string
  url?: string
}

type NatureInfluenceEntry = {
  max_change: number
  nature: NamedResource
}

type LocalizedName = {
  name: string
  language: NamedResource
}

type PokeathlonStatResponse = {
  id: number
  name: string
  affecting_natures?: {
    increase?: NatureInfluenceEntry[]
    decrease?: NatureInfluenceEntry[]
  }
  names?: LocalizedName[]
}

const s = (vars: Record<string, string | number>): CSSProperties => vars as unknown as CSSProperties

const splitByLanguage = (entries?: LocalizedName[]) => {
  return (
    entries?.reduce(
      (accumulator, entry) => {
        const language = entry.language?.name ?? 'unknown'
        accumulator[language] = entry.name
        return accumulator
      },
      {} as Record<string, string>
    ) ?? {}
  )
}

function PokeathlonStatPage() {
  const navigate = useNavigate()
  const { idOrName } = useParams<{ idOrName?: string }>()
  const initialQuery = (idOrName ?? '1').trim().toLowerCase() || '1'

  const [input, setInput] = useState(initialQuery)
  const [activeQuery, setActiveQuery] = useState(initialQuery)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [stat, setStat] = useState<PokeathlonStatResponse | null>(null)

  useEffect(() => {
    const nextQuery = (idOrName ?? '1').trim().toLowerCase() || '1'
    setInput(nextQuery)
    setActiveQuery(nextQuery)
  }, [idOrName])

  useEffect(() => {
    let isActive = true
    const clean = activeQuery.trim().toLowerCase()
    if (!clean) return

    const load = async () => {
      setStatus('loading')
      setErrorMessage('')

      try {
        const response = await fetch(`${POKEATHLON_ENDPOINT}${clean}/`)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = (await response.json()) as PokeathlonStatResponse
        if (!isActive) return

        setStat(data)
        setStatus('success')
      } catch (error) {
        if (!isActive) return
        setStatus('error')
        setStat(null)
        setErrorMessage(
          error instanceof Error ? error.message : 'Không thể tải dữ liệu chỉ số Pokéathlon.'
        )
      }
    }

    load()

    return () => {
      isActive = false
    }
  }, [activeQuery])

  const englishName = useMemo(() => {
    return stat?.names?.find((entry) => entry.language?.name === 'en')?.name
  }, [stat])

  const localizedNames = useMemo(() => {
    return splitByLanguage(stat?.names)
  }, [stat])

  const pokemonSprite = useMemo(() => {
    const numericId = Number(activeQuery)
    return spriteFor(Number.isInteger(numericId) ? numericId : null, activeQuery)
  }, [activeQuery])

  const increaseList = stat?.affecting_natures?.increase ?? []
  const decreaseList = stat?.affecting_natures?.decrease ?? []
  const statusLabel =
    status === 'loading' ? 'Đang tải' : status === 'error' ? 'Lỗi kết nối' : 'Sẵn sàng'

  const statDisplayTitle = stat
    ? STAT_VI[stat.name] ?? (englishName ? formatName(englishName) : formatName(stat.name))
    : ''

  const handleSelectStat = (query: string) => {
    setInput(query)
    setActiveQuery(query)
    navigate(`/pokeathlon-stat/${query}`)
  }

  return (
    <div className="pa-page">
      {/* Synchronized Top Header */}
      <header className="pa-header">
        <nav className="pa-nav" aria-label="Điều hướng chính">
          <Link to="/" className="pa-wordmark">
            <img src="/assets/logo.jpg" alt="Poke Hub Logo" className="pa-wordmark-logo" />
            <span>Poke Hub</span>
          </Link>

          <ul className="pa-nav-links">
            {NAV_ITEMS.filter((item) => !item.isAction).map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`pa-link${item.path === '/pokeathlon-stat' ? ' is-active' : ''}`}
                  title={item.labelVi}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link to="/battle" className="pa-btn">
            Battle Sim
          </Link>
        </nav>
      </header>

      <main>
        {/* Hero & Pokeathlon Lookup Console */}
        <section className="pa-hero" aria-labelledby="pa-hero-title">
          <div className="pa-hero-card">
            <div>
              <h1 id="pa-hero-title" className="pa-display pa-lines">
                <span className="pa-line">
                  <span data-line style={s({ '--i': 0 })}>
                    Ma trận Thể lực
                  </span>
                </span>
                <span className="pa-line">
                  <span data-line style={s({ '--i': 1 })}>
                    Pokéathlon Johto
                  </span>
                </span>
              </h1>
              <p className="pa-lead" data-load style={s({ '--d': '160ms' })}>
                Tra cứu 5 chỉ số thi đấu Pokéathlon (Tốc độ, Sức mạnh, Kỹ năng, Thể lực, Bật nhảy)
                và mức tăng/giảm từ 25 tính cách tự nhiên (Nature).
              </p>
            </div>

            <form
              className="pa-search-form"
              data-load
              style={s({ '--d': '220ms' })}
              onSubmit={(event) => {
                event.preventDefault()
                if (!input.trim()) return
                handleSelectStat(input.trim().toLowerCase())
              }}
            >
              <label className="pa-input-wrap">
                <span className="pa-input-label">Mã số (1–5) hoặc tên chỉ số</span>
                <input
                  className="pa-input"
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ví dụ: 1, speed, power, skill, stamina, jump..."
                />
              </label>

              <div className="pa-form-actions">
                <button className="pa-btn" type="submit">
                  Tra cứu
                </button>
                <button
                  className="pa-btn pa-btn-ghost"
                  type="button"
                  onClick={() => handleSelectStat('1')}
                >
                  Mặc định
                </button>
              </div>
            </form>

            <div className="pa-presets" data-load style={s({ '--d': '280ms' })}>
              <span className="pa-presets-label">5 vòng thi:</span>
              {PRESET_STATS.map((preset) => {
                const isSelected =
                  activeQuery === preset.query ||
                  activeQuery === preset.key ||
                  stat?.name === preset.key
                return (
                  <button
                    key={preset.query}
                    type="button"
                    className={`pa-chip${isSelected ? ' is-active' : ''}`}
                    onClick={() => handleSelectStat(preset.query)}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>
          </div>

          <aside
            className="pa-telemetry-stage"
            data-ui
            data-load
            style={s({ '--d': '200ms' })}
            aria-label="Hồ sơ chỉ số Pokéathlon"
          >
            <div className="pa-telemetry-head">
              <h2 className="pa-telemetry-title">Hồ sơ Chỉ số đang soi</h2>
              <span className="pa-status-pill" data-state={status}>
                <span className="pa-pulse-beacon" aria-hidden="true" />
                {statusLabel}
              </span>
            </div>

            <div className="pa-telemetry-metrics">
              <div className="pa-metric-cell">
                <span className="pa-metric-lbl">Mã chỉ số</span>
                <span className="pa-metric-val">
                  {stat ? `#${stat.id.toString().padStart(3, '0')}` : '---'}
                </span>
              </div>
              <div className="pa-metric-cell">
                <span className="pa-metric-lbl">Tên vòng thi</span>
                <span className="pa-metric-val">
                  {stat ? STAT_VI[stat.name] ?? formatName(stat.name) : formatName(activeQuery)}
                </span>
              </div>
              <div className="pa-metric-cell">
                <span className="pa-metric-lbl">Tính cách tăng</span>
                <span className="pa-metric-val">{increaseList.length} loại</span>
              </div>
              <div className="pa-metric-cell">
                <span className="pa-metric-lbl">Tính cách giảm</span>
                <span className="pa-metric-val">{decreaseList.length} loại</span>
              </div>
            </div>
          </aside>
        </section>

        {/* Main Content */}
        <section className="pa-content" aria-label="Chi tiết chỉ số Pokéathlon">
          {status === 'error' ? (
            <div className="pa-notice">
              <h3>Không thể tải dữ liệu</h3>
              <p>
                {errorMessage ||
                  'Vui lòng kiểm tra lại mã số (1–5) hoặc tên chỉ số Pokéathlon (speed, power, skill, stamina, jump).'}
              </p>
            </div>
          ) : null}

          {status === 'success' && stat ? (
            <>
              <article className="pa-glass-card">
                <div className="pa-overview-top">
                  <div>
                    <span className="pa-tag">Chỉ số Pokéathlon</span>
                    <h2 className="pa-stat-title">{statDisplayTitle}</h2>
                  </div>
                  <span className="pa-stat-id">#{stat.id.toString().padStart(3, '0')}</span>
                </div>

                <div className="pa-preview-row">
                  <BorderBeam
                    className="pa-sprite-beam"
                    lightColor="#00e676"
                    lightWidth={300}
                    duration={6}
                    borderWidth={2}
                  >
                    <div className="pa-sprite-stage">
                      <img
                        className="pa-sprite-img"
                        src={pokemonSprite}
                        alt={formatName(activeQuery)}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.src =
                            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'
                        }}
                      />
                    </div>
                  </BorderBeam>

                  <div className="pa-summary-grid">
                    <div className="pa-summary-box">
                      <span className="pa-summary-lbl">Tên gốc API</span>
                      <span className="pa-summary-val">{formatName(stat.name)}</span>
                    </div>
                    <div className="pa-summary-box">
                      <span className="pa-summary-lbl">Số tính cách tăng</span>
                      <span className="pa-summary-val">{increaseList.length}</span>
                    </div>
                    <div className="pa-summary-box">
                      <span className="pa-summary-lbl">Số tính cách giảm</span>
                      <span className="pa-summary-val">{decreaseList.length}</span>
                    </div>
                    <div className="pa-summary-box">
                      <span className="pa-summary-lbl">Ngôn ngữ hỗ trợ</span>
                      <span className="pa-summary-val">{stat.names?.length ?? 0}</span>
                    </div>
                  </div>
                </div>
              </article>

              {/* Localized Names */}
              <article className="pa-glass-card is-tinted">
                <div className="pa-section-head">
                  <h3>Tên gọi đa ngôn ngữ</h3>
                  <p>Tên hiển thị chính thức của chỉ số này tại các phiên bản ngôn ngữ khác nhau.</p>
                </div>

                <div className="pa-names-grid">
                  {Object.entries(localizedNames).map(([language, name]) => (
                    <div key={language} className="pa-name-card">
                      <span className="pa-lang-lbl">{LANGUAGE_VI[language] ?? language}</span>
                      <strong className="pa-lang-val">{name}</strong>
                    </div>
                  ))}
                  {Object.keys(localizedNames).length === 0 ? (
                    <p>Không có dữ liệu tên đa ngôn ngữ.</p>
                  ) : null}
                </div>
              </article>

              {/* Increase / Decrease Natures Split */}
              <div className="pa-natures-split">
                <article className="pa-glass-card">
                  <div className="pa-section-head">
                    <h3>Tính cách tăng chỉ số</h3>
                    <p>Các tính cách tự nhiên giúp cộng thêm điểm cho vòng thi này.</p>
                  </div>

                  <div className="pa-nature-grid">
                    {increaseList.map((entry) => {
                      const rawName = entry.nature.name ?? ''
                      return (
                        <div key={`${rawName}-inc`} className="pa-nature-card">
                          <span className="pa-nature-name">
                            {NATURE_VI[rawName] ?? formatName(rawName)}
                          </span>
                          <span className="pa-delta-pill is-positive">
                            +{Math.abs(entry.max_change)} tối đa
                          </span>
                        </div>
                      )
                    })}
                    {increaseList.length === 0 ? <p>Không có tính cách tăng chỉ số.</p> : null}
                  </div>
                </article>

                <article className="pa-glass-card">
                  <div className="pa-section-head">
                    <h3>Tính cách giảm chỉ số</h3>
                    <p>Các tính cách tự nhiên làm giảm điểm tối đa ở vòng thi này.</p>
                  </div>

                  <div className="pa-nature-grid">
                    {decreaseList.map((entry) => {
                      const rawName = entry.nature.name ?? ''
                      return (
                        <div key={`${rawName}-dec`} className="pa-nature-card">
                          <span className="pa-nature-name">
                            {NATURE_VI[rawName] ?? formatName(rawName)}
                          </span>
                          <span className="pa-delta-pill is-negative">
                            {entry.max_change} tối đa
                          </span>
                        </div>
                      )
                    })}
                    {decreaseList.length === 0 ? <p>Không có tính cách giảm chỉ số.</p> : null}
                  </div>
                </article>
              </div>
            </>
          ) : null}
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

export default PokeathlonStatPage
