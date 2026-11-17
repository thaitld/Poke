import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { NAV_ITEMS } from '../config/navigation'
import { extractId, formatName, spriteFor } from '../utils/pokemon'
import { ABILITY_TRANSLATIONS_VI } from '../data/abilityTranslationsVi'
import SiteFooter from '../components/SiteFooter'
import './AbilityPage.css'

const ABILITY_ENDPOINT = 'https://pokeapi.co/api/v2/ability/'

const PRESET_ABILITIES = [
  { query: '1', label: 'Stench (#1)' },
  { query: 'overgrow', label: 'Overgrow' },
  { query: 'blaze', label: 'Blaze' },
  { query: 'torrent', label: 'Torrent' },
  { query: 'intimidate', label: 'Intimidate' },
  { query: 'levitate', label: 'Levitate' },
  { query: 'solar-power', label: 'Solar Power' },
]

const GENERATION_VI: Record<string, string> = {
  'generation-i': 'Thế hệ I (Kanto)',
  'generation-ii': 'Thế hệ II (Johto)',
  'generation-iii': 'Thế hệ III (Hoenn)',
  'generation-iv': 'Thế hệ IV (Sinnoh)',
  'generation-v': 'Thế hệ V (Unova)',
  'generation-vi': 'Thế hệ VI (Kalos)',
  'generation-vii': 'Thế hệ VII (Alola)',
  'generation-viii': 'Thế hệ VIII (Galar)',
  'generation-ix': 'Thế hệ IX (Paldea)',
}

type AbilityEntry = {
  effect: string
  short_effect: string
  language: { name: string }
}

type FlavorEntry = {
  flavor_text: string
  language: { name: string }
  version_group?: { name: string }
}

type AbilityPokemon = {
  is_hidden: boolean
  slot: number
  pokemon: { name: string; url: string }
}

type AbilityResponse = {
  id: number
  name: string
  generation?: { name: string }
  is_main_series?: boolean
  effect_entries?: AbilityEntry[]
  flavor_text_entries?: FlavorEntry[]
  pokemon?: AbilityPokemon[]
}

const s = (vars: Record<string, string | number>): CSSProperties => vars as unknown as CSSProperties

const translationCache = new Map<string, string>()

async function translateTextToVi(text: string): Promise<string> {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (!clean) return ''
  const cached = translationCache.get(clean)
  if (cached) return cached

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(clean)}`
    const res = await fetch(url)
    if (!res.ok) return clean
    const data = (await res.json()) as unknown
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const translated = (data[0] as unknown[])
        .map((part) => (Array.isArray(part) && typeof part[0] === 'string' ? part[0] : ''))
        .join('')
        .trim()
      if (translated) {
        translationCache.set(clean, translated)
        return translated
      }
    }
  } catch {
    // Graceful fallback to original text if translation service is unreachable
  }
  return clean
}

const animatedSpriteFor = (id: number | null, name?: string) => {
  if (id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`
  }
  return spriteFor(id, name)
}

function AbilityPage() {
  const [input, setInput] = useState('1')
  const [activeQuery, setActiveQuery] = useState('1')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [ability, setAbility] = useState<AbilityResponse | null>(null)
  const [autoTranslated, setAutoTranslated] = useState<{
    shortEffect: string
    effect: string
    flavor: string
  } | null>(null)

  useEffect(() => {
    let isActive = true
    const clean = activeQuery.trim().toLowerCase()
    if (!clean) return

    const load = async () => {
      setStatus('loading')
      setErrorMessage('')
      setAutoTranslated(null)

      try {
        const response = await fetch(`${ABILITY_ENDPOINT}${clean}/`)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = (await response.json()) as AbilityResponse
        if (!isActive) return

        setAbility(data)
        setStatus('success')

        // Nếu chưa có trong từ điển chuẩn tiếng Việt, tự động dịch sang tiếng Việt
        if (!ABILITY_TRANSLATIONS_VI[data.name]) {
          const enEffect = data.effect_entries?.find((entry) => entry.language?.name === 'en')
          const enFlavor = data.flavor_text_entries?.find((entry) => entry.language?.name === 'en')

          const [shortVi, effectVi, flavorVi] = await Promise.all([
            enEffect?.short_effect ? translateTextToVi(enEffect.short_effect) : Promise.resolve(''),
            enEffect?.effect ? translateTextToVi(enEffect.effect) : Promise.resolve(''),
            enFlavor?.flavor_text ? translateTextToVi(enFlavor.flavor_text) : Promise.resolve(''),
          ])

          if (isActive) {
            setAutoTranslated({
              shortEffect: shortVi,
              effect: effectVi,
              flavor: flavorVi,
            })
          }
        }
      } catch (error) {
        if (!isActive) return
        setStatus('error')
        setAbility(null)
        setErrorMessage(
          error instanceof Error ? error.message : 'Không thể tải dữ liệu kỹ năng.'
        )
      }
    }

    load()

    return () => {
      isActive = false
    }
  }, [activeQuery])

  const englishEffect = useMemo(() => {
    return ability?.effect_entries?.find((entry) => entry.language?.name === 'en')
  }, [ability])

  const englishFlavor = useMemo(() => {
    return ability?.flavor_text_entries?.find(
      (entry) => entry.language?.name === 'en'
    )
  }, [ability])

  const curatedVi = ability ? ABILITY_TRANSLATIONS_VI[ability.name] : undefined

  const displayTitle = curatedVi?.viTitle ?? (ability ? formatName(ability.name) : '')
  const displayShortEffect =
    curatedVi?.shortEffect ||
    autoTranslated?.shortEffect ||
    englishEffect?.short_effect ||
    'Chưa có dữ liệu tóm tắt hiệu ứng.'
  const displayEffect =
    curatedVi?.effect || autoTranslated?.effect || englishEffect?.effect || ''
  const displayFlavor =
    curatedVi?.flavor ||
    autoTranslated?.flavor ||
    englishFlavor?.flavor_text?.replace(/\s+/g, ' ') ||
    'Chưa có mô tả ngắn trong Pokédex cho kỹ năng này.'

  const pokemonList = useMemo(() => ability?.pokemon ?? [], [ability])
  const hiddenCount = useMemo(
    () => pokemonList.filter((entry) => entry.is_hidden).length,
    [pokemonList]
  )

  const generationLabel = ability?.generation?.name
    ? GENERATION_VI[ability.generation.name] ?? formatName(ability.generation.name)
    : 'Chưa rõ'

  const statusLabel =
    status === 'loading' ? 'Đang tải' : status === 'error' ? 'Lỗi kết nối' : 'Sẵn sàng'

  const handlePreset = (query: string) => {
    setInput(query)
    setActiveQuery(query)
  }

  return (
    <div className="ab-page">
      {/* Synchronized Top Header */}
      <header className="ab-header">
        <nav className="ab-nav" aria-label="Điều hướng chính">
          <Link to="/" className="ab-wordmark">
            <img src="/assets/logo.jpg" alt="Poke Hub Logo" className="ab-wordmark-logo" />
            <span>Poke Hub</span>
          </Link>

          <ul className="ab-nav-links">
            {NAV_ITEMS.filter((item) => !item.isAction).map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`ab-link${item.path === '/ability' ? ' is-active' : ''}`}
                  title={item.labelVi}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link to="/battle" className="ab-btn">
            Battle Sim
          </Link>
        </nav>
      </header>

      <main>
        {/* Hero & Ability Lookup Console */}
        <section className="ab-hero" aria-labelledby="ab-hero-title">
          <div className="ab-hero-card">
            <div>
              <h1 id="ab-hero-title" className="ab-display ab-lines">
                <span className="ab-line">
                  <span data-line style={s({ '--i': 0 })}>
                    Từ điển Kỹ năng
                  </span>
                </span>
                <span className="ab-line">
                  <span data-line style={s({ '--i': 1 })}>
                    Nội tại Pokémon
                  </span>
                </span>
              </h1>
              <p className="ab-lead" data-load style={s({ '--d': '160ms' })}>
                Tra cứu cơ chế kích hoạt, hiệu ứng chiến đấu và danh sách Pokémon sở hữu kỹ năng nội
                tại trực tiếp từ PokeAPI v2.
              </p>
            </div>

            <form
              className="ab-search-form"
              data-load
              style={s({ '--d': '220ms' })}
              onSubmit={(event) => {
                event.preventDefault()
                if (!input.trim()) return
                setActiveQuery(input.trim().toLowerCase())
              }}
            >
              <label className="ab-input-wrap">
                <span className="ab-input-label">Mã số hoặc tên kỹ năng (Ability)</span>
                <input
                  className="ab-input"
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ví dụ: 1, stench, overgrow, intimidate..."
                />
              </label>

              <div className="ab-form-actions">
                <button className="ab-btn" type="submit">
                  Tra cứu
                </button>
                <button
                  className="ab-btn ab-btn-ghost"
                  type="button"
                  onClick={() => handlePreset('1')}
                >
                  Mặc định
                </button>
              </div>
            </form>

            <div className="ab-presets" data-load style={s({ '--d': '280ms' })}>
              <span className="ab-presets-label">Gợi ý nhanh:</span>
              {PRESET_ABILITIES.map((preset) => (
                <button
                  key={preset.query}
                  type="button"
                  className={`ab-chip${activeQuery === preset.query ? ' is-active' : ''}`}
                  onClick={() => handlePreset(preset.query)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <aside
            className="ab-telemetry-stage"
            data-ui
            data-load
            style={s({ '--d': '200ms' })}
            aria-label="Tóm tắt kỹ năng nội tại"
          >
            <div className="ab-telemetry-head">
              <h2 className="ab-telemetry-title">Hồ sơ Kỹ năng đang soi</h2>
              <span className="ab-status-pill" data-state={status}>
                <span className="ab-pulse-beacon" aria-hidden="true" />
                {statusLabel}
              </span>
            </div>

            <div className="ab-telemetry-metrics">
              <div className="ab-metric-cell">
                <span className="ab-metric-lbl">Mã định danh</span>
                <span className="ab-metric-val">
                  {ability ? `#${ability.id.toString().padStart(3, '0')}` : '---'}
                </span>
              </div>
              <div className="ab-metric-cell">
                <span className="ab-metric-lbl">Từ khóa tra cứu</span>
                <span className="ab-metric-val">{formatName(activeQuery)}</span>
              </div>
              <div className="ab-metric-cell">
                <span className="ab-metric-lbl">Tổng loài sở hữu</span>
                <span className="ab-metric-val">{ability ? pokemonList.length : 0}</span>
              </div>
              <div className="ab-metric-cell">
                <span className="ab-metric-lbl">Dạng kỹ năng ẩn</span>
                <span className="ab-metric-val">{ability ? hiddenCount : 0}</span>
              </div>
            </div>
          </aside>
        </section>

        {/* Main Content */}
        <section className="ab-content" aria-label="Chi tiết kỹ năng">
          {status === 'loading' ? (
            <div className="ab-pokemon-grid">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="ab-poke-card ab-skeleton-card" key={`ab-skel-${index}`} />
              ))}
            </div>
          ) : null}

          {status === 'error' ? (
            <div className="ab-notice">
              <h3>Không thể tải dữ liệu kỹ năng</h3>
              <p>
                {errorMessage
                  ? `Mã lỗi: ${errorMessage}. Vui lòng kiểm tra lại tên hoặc mã số kỹ năng.`
                  : 'Vui lòng kiểm tra lại mã số hoặc tên kỹ năng (viết bằng tiếng Anh không dấu, ví dụ: overgrow).'}
              </p>
            </div>
          ) : null}

          {status === 'success' && ability ? (
            <>
              <div className="ab-dossier-grid">
                {/* Overview Card */}
                <article className="ab-glass-card ab-overview-card">
                  <div className="ab-overview-top">
                    <div>
                      <span className="ab-tag">Kỹ năng nội tại</span>
                      <h2 className="ab-ability-name">{displayTitle}</h2>
                    </div>
                    <span className="ab-ability-id">
                      #{ability.id.toString().padStart(3, '0')}
                    </span>
                  </div>

                  <div className="ab-stat-list">
                    <div className="ab-stat-box">
                      <span className="ab-stat-lbl">Thế hệ xuất hiện</span>
                      <span className="ab-stat-val">{generationLabel}</span>
                    </div>
                    <div className="ab-stat-box">
                      <span className="ab-stat-lbl">Loạt game chính</span>
                      <span className="ab-stat-val">
                        {ability.is_main_series ? 'Có' : 'Không'}
                      </span>
                    </div>
                    <div className="ab-stat-box">
                      <span className="ab-stat-lbl">Số loài sở hữu</span>
                      <span className="ab-stat-val">{pokemonList.length} loài</span>
                    </div>
                  </div>

                  <div className="ab-flavor-box">
                    <h3 className="ab-section-title">Ghi chú trong Pokédex</h3>
                    <p className="ab-effect-detail">{displayFlavor}</p>
                  </div>
                </article>

                {/* Effect Card */}
                <article className="ab-glass-card is-tinted ab-effect-card">
                  <h3 className="ab-section-title">Tóm tắt hiệu ứng chiến đấu</h3>
                  <p className="ab-effect-main">{displayShortEffect}</p>
                  {displayEffect ? (
                    <>
                      <h3 className="ab-section-title">Chi tiết cơ chế hoạt động</h3>
                      <p className="ab-effect-detail">{displayEffect}</p>
                    </>
                  ) : null}
                </article>
              </div>

              {/* Pokemon Holders */}
              <div className="ab-holders-header">
                <div>
                  <h2 className="ab-head">Pokémon sở hữu kỹ năng {formatName(ability.name)}</h2>
                  <p className="ab-sub">
                    Hiển thị {Math.min(24, pokemonList.length)} trên tổng số {pokemonList.length}{' '}
                    loài Pokémon có thể mang kỹ năng này.
                  </p>
                </div>
              </div>

              <div className="ab-pokemon-grid">
                {pokemonList.slice(0, 24).map((entry, index) => {
                  const id = extractId(entry.pokemon.url)
                  const primarySprite = animatedSpriteFor(id, entry.pokemon.name)
                  const fallbackSprite = spriteFor(id, entry.pokemon.name)
                  return (
                    <article
                      key={entry.pokemon.name}
                      className="ab-poke-card ab-card-animate"
                      style={s({ '--stagger': `${index * 25}ms` })}
                    >
                      <div className="ab-poke-top">
                        <span className="ab-poke-id">
                          {id ? `#${id.toString().padStart(4, '0')}` : '---'}
                        </span>
                        {entry.is_hidden ? (
                          <span className="ab-hidden-pill">Kỹ năng ẩn</span>
                        ) : (
                          <span className="ab-slot-pill">Vị trí {entry.slot}</span>
                        )}
                      </div>

                      <div className="ab-aperture">
                        {primarySprite ? (
                          <img
                            className="ab-sprite"
                            src={primarySprite}
                            alt={formatName(entry.pokemon.name)}
                            loading="lazy"
                            onError={(event) => {
                              const target = event.currentTarget
                              if (fallbackSprite && target.src !== fallbackSprite) {
                                target.src = fallbackSprite
                              } else {
                                target.style.visibility = 'hidden'
                              }
                            }}
                          />
                        ) : null}
                      </div>

                      <div>
                        <h3 className="ab-poke-name">{formatName(entry.pokemon.name)}</h3>
                        <p className="ab-poke-slot">
                          Vị trí kỹ năng: {entry.slot}
                          {entry.is_hidden ? ' · Dạng ẩn (Hidden)' : ' · Thường'}
                        </p>
                      </div>
                    </article>
                  )
                })}

                {pokemonList.length === 0 ? (
                  <div className="ab-notice">
                    <h3>Chưa có Pokémon nào</h3>
                    <p>Không tìm thấy loài Pokémon nào sở hữu kỹ năng này.</p>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

export default AbilityPage
