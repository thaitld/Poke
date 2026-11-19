import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { NAV_ITEMS } from '../config/navigation'
import { extractId, formatName, spriteFor } from '../utils/pokemon'
import SiteFooter from '../components/SiteFooter'
import './GenerationPage.css'

const GENERATION_ENDPOINT = 'https://pokeapi.co/api/v2/generation/'
const POKEMON_ENDPOINT = 'https://pokeapi.co/api/v2/pokemon/'
const SPECIES_PAGE_SIZE = 25
const RESOURCE_PREVIEW_LIMIT = 24

const homeArtworkFor = (id: number | null) =>
  id ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png` : ''

const officialArtworkFor = (id: number | null) =>
  id
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
    : ''

const PRESET_GENERATIONS = [
  { query: '1', key: 'generation-i', label: 'Gen I · Kanto' },
  { query: '2', key: 'generation-ii', label: 'Gen II · Johto' },
  { query: '3', key: 'generation-iii', label: 'Gen III · Hoenn' },
  { query: '4', key: 'generation-iv', label: 'Gen IV · Sinnoh' },
  { query: '5', key: 'generation-v', label: 'Gen V · Unova' },
  { query: '6', key: 'generation-vi', label: 'Gen VI · Kalos' },
  { query: '7', key: 'generation-vii', label: 'Gen VII · Alola' },
  { query: '8', key: 'generation-viii', label: 'Gen VIII · Galar' },
  { query: '9', key: 'generation-ix', label: 'Gen IX · Paldea' },
]

const GENERATION_TITLE_VI: Record<string, string> = {
  'generation-i': 'Thế hệ I · Kanto',
  'generation-ii': 'Thế hệ II · Johto',
  'generation-iii': 'Thế hệ III · Hoenn',
  'generation-iv': 'Thế hệ IV · Sinnoh',
  'generation-v': 'Thế hệ V · Unova',
  'generation-vi': 'Thế hệ VI · Kalos',
  'generation-vii': 'Thế hệ VII · Alola',
  'generation-viii': 'Thế hệ VIII · Galar',
  'generation-ix': 'Thế hệ IX · Paldea',
}

const LANGUAGE_VI: Record<string, string> = {
  'ja-hrkt': 'Tiếng Nhật (Kana)',
  'ja-Hrkt': 'Tiếng Nhật (Kana)',
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

const TYPE_VI: Record<string, string> = {
  normal: 'Thường (Normal)',
  fighting: 'Giác Đấu (Fighting)',
  flying: 'Bay (Flying)',
  poison: 'Độc (Poison)',
  ground: 'Đất (Ground)',
  rock: 'Đá (Rock)',
  bug: 'Bọ (Bug)',
  ghost: 'Bóng Ma (Ghost)',
  steel: 'Thép (Steel)',
  fire: 'Lửa (Fire)',
  water: 'Nước (Water)',
  grass: 'Cỏ (Grass)',
  electric: 'Điện (Electric)',
  psychic: 'Tâm Linh (Psychic)',
  ice: 'Băng (Ice)',
  dragon: 'Rồng (Dragon)',
  dark: 'Bóng Tối (Dark)',
  fairy: 'Tiên (Fairy)',
}

const TYPE_SHORT_VI: Record<string, string> = {
  normal: 'Thường',
  fighting: 'Giác Đấu',
  flying: 'Bay',
  poison: 'Độc',
  ground: 'Đất',
  rock: 'Đá',
  bug: 'Bọ',
  ghost: 'Ma',
  steel: 'Thép',
  fire: 'Lửa',
  water: 'Nước',
  grass: 'Cỏ',
  electric: 'Điện',
  psychic: 'Tâm Linh',
  ice: 'Băng',
  dragon: 'Rồng',
  dark: 'Bóng Tối',
  fairy: 'Tiên',
}

const TYPE_COLOR: Record<string, string> = {
  normal: '#6b6f62',
  fighting: '#b33328',
  flying: '#5b6ec9',
  poison: '#8e3a8e',
  ground: '#a68232',
  rock: '#8d7b38',
  bug: '#6d8216',
  ghost: '#5b4879',
  steel: '#687687',
  fire: '#c84b18',
  water: '#2b6cb8',
  grass: '#3d8a2e',
  electric: '#b8860b',
  psychic: '#c2305c',
  ice: '#2d8b8e',
  dragon: '#5229c4',
  dark: '#524034',
  fairy: '#b84980',
}

type NamedResource = {
  name?: string
  url?: string
}

type LocalizedName = {
  name?: string
  language?: NamedResource
}

type GenerationResponse = {
  id: number
  name: string
  abilities?: NamedResource[]
  main_region?: NamedResource
  moves?: NamedResource[]
  names?: LocalizedName[]
  pokemon_species?: NamedResource[]
  types?: NamedResource[]
  version_groups?: NamedResource[]
}

const s = (vars: Record<string, string | number>): CSSProperties => vars as unknown as CSSProperties

const getEnglishName = (entries?: LocalizedName[]) => {
  return entries?.find((entry) => entry.language?.name === 'en')?.name
}

function GenerationPage() {
  const navigate = useNavigate()
  const { idOrName } = useParams<{ idOrName?: string }>()
  const initialQuery = (idOrName ?? '1').trim().toLowerCase() || '1'

  const [input, setInput] = useState(initialQuery)
  const [activeQuery, setActiveQuery] = useState(initialQuery)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [generation, setGeneration] = useState<GenerationResponse | null>(null)
  const [speciesLimit, setSpeciesLimit] = useState(SPECIES_PAGE_SIZE)
  const [speciesTypes, setSpeciesTypes] = useState<Record<number, string[]>>({})

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
      setSpeciesLimit(SPECIES_PAGE_SIZE)

      try {
        const response = await fetch(`${GENERATION_ENDPOINT}${clean}/`)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = (await response.json()) as GenerationResponse
        if (!isActive) return

        setGeneration(data)
        setStatus('success')
      } catch (error) {
        if (!isActive) return
        setStatus('error')
        setGeneration(null)
        setErrorMessage(
          error instanceof Error ? error.message : 'Không thể tải dữ liệu thế hệ game.'
        )
      }
    }

    load()

    return () => {
      isActive = false
    }
  }, [activeQuery])

  const titleName = useMemo(() => {
    if (!generation) return ''
    return (
      GENERATION_TITLE_VI[generation.name] ??
      getEnglishName(generation.names) ??
      formatName(generation.name)
    )
  }, [generation])

  const abilities = generation?.abilities ?? []
  const moves = generation?.moves ?? []
  const species = useMemo(() => {
    const raw = generation?.pokemon_species ?? []
    return [...raw].sort((a, b) => (extractId(a.url) ?? 99999) - (extractId(b.url) ?? 99999))
  }, [generation])
  const visibleSpecies = useMemo(() => species.slice(0, speciesLimit), [species, speciesLimit])
  const types = generation?.types ?? []
  const versionGroups = generation?.version_groups ?? []
  const localizedNames = generation?.names ?? []

  useEffect(() => {
    const missingIds = visibleSpecies
      .map((sp) => extractId(sp.url))
      .filter((id): id is number => id !== null && !(id in speciesTypes))

    if (missingIds.length === 0) return

    let isActive = true
    const fetchTypes = async () => {
      const results = await Promise.allSettled(
        missingIds.map(async (id) => {
          const res = await fetch(`${POKEMON_ENDPOINT}${id}/`)
          if (!res.ok) return null
          const data = (await res.json()) as {
            types?: Array<{ slot?: number; type?: { name?: string } }>
          }
          const resolved = (data.types ?? [])
            .sort((a, b) => (a.slot ?? 0) - (b.slot ?? 0))
            .map((entry) => entry.type?.name)
            .filter((t): t is string => Boolean(t))
          return [id, resolved] as const
        })
      )

      if (!isActive) return
      const nextEntries: Record<number, string[]> = {}
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          const [id, resolved] = result.value
          nextEntries[id] = resolved
        }
      }
      if (Object.keys(nextEntries).length > 0) {
        setSpeciesTypes((prev) => ({ ...prev, ...nextEntries }))
      }
    }

    fetchTypes()

    return () => {
      isActive = false
    }
  }, [visibleSpecies, speciesTypes])

  const statusLabel =
    status === 'loading' ? 'Đang tải' : status === 'error' ? 'Lỗi kết nối' : 'Sẵn sàng'

  const handleSelectGen = (query: string) => {
    setInput(query)
    setActiveQuery(query)
    navigate(`/games/${query}`)
  }

  return (
    <div className="gn-page">
      {/* Synchronized Top Header */}
      <header className="gn-header">
        <nav className="gn-nav" aria-label="Điều hướng chính">
          <Link to="/" className="gn-wordmark">
            <img src="/assets/logo.jpg" alt="Poke Hub Logo" className="gn-wordmark-logo" />
            <span>Poke Hub</span>
          </Link>

          <ul className="gn-nav-links">
            {NAV_ITEMS.filter((item) => !item.isAction).map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`gn-link${item.path === '/games' ? ' is-active' : ''}`}
                  title={item.labelVi}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link to="/battle" className="gn-btn">
            Battle Sim
          </Link>
        </nav>
      </header>

      <main>
        {/* Hero & Generation Lookup Console */}
        <section className="gn-hero" aria-labelledby="gn-hero-title">
          <div className="gn-hero-card">
            <div>
              <h1 id="gn-hero-title" className="gn-display gn-lines">
                <span className="gn-line">
                  <span data-line style={s({ '--i': 0 })}>
                    Kỷ nguyên Thế hệ
                  </span>
                </span>
                <span className="gn-line">
                  <span data-line style={s({ '--i': 1 })}>
                    Pokémon (Gen I–IX)
                  </span>
                </span>
              </h1>
              <p className="gn-lead" data-load style={s({ '--d': '160ms' })}>
                Khám phá từng thế hệ game Pokémon với vùng đất chính, phiên bản phát hành, danh
                sách loài mới, chiêu thức, kỹ năng và hệ nguyên tố đặc trưng.
              </p>
            </div>

            <form
              className="gn-search-form"
              data-load
              style={s({ '--d': '220ms' })}
              onSubmit={(event) => {
                event.preventDefault()
                if (!input.trim()) return
                handleSelectGen(input.trim().toLowerCase())
              }}
            >
              <label className="gn-input-wrap">
                <span className="gn-input-label">Mã số (1–9) hoặc tên thế hệ</span>
                <input
                  className="gn-input"
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ví dụ: 1, generation-i, generation-v..."
                />
              </label>

              <div className="gn-form-actions">
                <button className="gn-btn" type="submit">
                  Tra cứu
                </button>
                <button
                  className="gn-btn gn-btn-ghost"
                  type="button"
                  onClick={() => handleSelectGen('1')}
                >
                  Mặc định
                </button>
              </div>
            </form>

            <div className="gn-presets" data-load style={s({ '--d': '280ms' })}>
              <span className="gn-presets-label">9 thế hệ:</span>
              {PRESET_GENERATIONS.map((preset) => {
                const isSelected =
                  activeQuery === preset.query ||
                  activeQuery === preset.key ||
                  generation?.name === preset.key
                return (
                  <button
                    key={preset.query}
                    type="button"
                    className={`gn-chip${isSelected ? ' is-active' : ''}`}
                    onClick={() => handleSelectGen(preset.query)}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>
          </div>

          <aside
            className="gn-telemetry-stage"
            data-ui
            data-load
            style={s({ '--d': '200ms' })}
            aria-label="Hồ sơ thế hệ đang soi"
          >
            <div className="gn-telemetry-head">
              <h2 className="gn-telemetry-title">Hồ sơ Thế hệ đang soi</h2>
              <span className="gn-status-pill" data-state={status}>
                <span className="gn-pulse-beacon" aria-hidden="true" />
                {statusLabel}
              </span>
            </div>

            <div className="gn-telemetry-metrics">
              <div className="gn-metric-cell">
                <span className="gn-metric-lbl">Mã thế hệ</span>
                <span className="gn-metric-val">
                  {generation ? `#${generation.id.toString().padStart(2, '0')}` : '---'}
                </span>
              </div>
              <div className="gn-metric-cell">
                <span className="gn-metric-lbl">Khu vực chính</span>
                <span className="gn-metric-val">
                  {generation?.main_region?.name ? formatName(generation.main_region.name) : '---'}
                </span>
              </div>
              <div className="gn-metric-cell">
                <span className="gn-metric-lbl">Loài mới</span>
                <span className="gn-metric-val">{species.length} loài</span>
              </div>
              <div className="gn-metric-cell">
                <span className="gn-metric-lbl">Chiêu thức mới</span>
                <span className="gn-metric-val">{moves.length} chiêu</span>
              </div>
            </div>
          </aside>
        </section>

        {/* Main Content */}
        <section className="gn-content" aria-label="Chi tiết thế hệ game">
          {status === 'error' ? (
            <div className="gn-notice">
              <h3>Không thể tải dữ liệu thế hệ</h3>
              <p>
                {errorMessage ||
                  'Vui lòng kiểm tra lại mã số (1–9) hoặc tên thế hệ (ví dụ: generation-i).'}
              </p>
            </div>
          ) : null}

          {status === 'success' && generation ? (
            <>
              {/* Overview Card */}
              <article className="gn-glass-card">
                <div className="gn-overview-top">
                  <div>
                    <span className="gn-tag">Thế hệ game Pokémon</span>
                    <h2 className="gn-gen-title">{titleName}</h2>
                  </div>
                  <span className="gn-gen-id">#{generation.id.toString().padStart(2, '0')}</span>
                </div>

                <div className="gn-summary-grid">
                  <div className="gn-summary-box">
                    <span className="gn-summary-lbl">Khu vực chính</span>
                    <span className="gn-summary-val">
                      {formatName(generation.main_region?.name)}
                    </span>
                  </div>
                  <div className="gn-summary-box">
                    <span className="gn-summary-lbl">Phiên bản game</span>
                    <span className="gn-summary-val">{versionGroups.length} cụm phiên bản</span>
                  </div>
                  <div className="gn-summary-box">
                    <span className="gn-summary-lbl">Loài Pokémon mới</span>
                    <span className="gn-summary-val">{species.length} loài</span>
                  </div>
                  <div className="gn-summary-box">
                    <span className="gn-summary-lbl">Chiêu thức mới</span>
                    <span className="gn-summary-val">{moves.length} chiêu</span>
                  </div>
                  <div className="gn-summary-box">
                    <span className="gn-summary-lbl">Kỹ năng nội tại mới</span>
                    <span className="gn-summary-val">{abilities.length} kỹ năng</span>
                  </div>
                  <div className="gn-summary-box">
                    <span className="gn-summary-lbl">Hệ nguyên tố</span>
                    <span className="gn-summary-val">{types.length} hệ</span>
                  </div>
                </div>
              </article>

              {/* Localized Names */}
              <article className="gn-glass-card is-tinted">
                <div className="gn-section-head">
                  <h3>Tên gọi đa ngôn ngữ</h3>
                  <p>Tên hiển thị của thế hệ này tại các thị trường phát hành khác nhau.</p>
                </div>

                <div className="gn-names-grid">
                  {localizedNames.map((entry, idx) => {
                    const lang = entry.language?.name ?? 'unknown'
                    return (
                      <div key={`${lang}-${idx}`} className="gn-name-card">
                        <span className="gn-lang-lbl">{LANGUAGE_VI[lang] ?? lang}</span>
                        <strong className="gn-lang-val">{entry.name}</strong>
                      </div>
                    )
                  })}
                  {localizedNames.length === 0 ? (
                    <p className="gn-empty">Không có dữ liệu tên đa ngôn ngữ.</p>
                  ) : null}
                </div>
              </article>

              {/* Version Groups & Types Split */}
              <div className="gn-split-grids">
                <article className="gn-glass-card">
                  <div className="gn-section-head">
                    <h3>Cụm phiên bản phát hành ({versionGroups.length})</h3>
                    <p>Các tựa game thuộc thế hệ này.</p>
                  </div>
                  <div className="gn-pill-grid">
                    {versionGroups.map((vg) => (
                      <span key={vg.name} className="gn-resource-pill is-accent">
                        {formatName(vg.name)}
                      </span>
                    ))}
                    {versionGroups.length === 0 ? (
                      <p className="gn-empty">Chưa có dữ liệu phiên bản.</p>
                    ) : null}
                  </div>
                </article>

                <article className="gn-glass-card">
                  <div className="gn-section-head">
                    <h3>Hệ nguyên tố giới thiệu ({types.length})</h3>
                    <p>Các hệ nguyên tố xuất hiện hoặc được bổ sung trong thế hệ.</p>
                  </div>
                  <div className="gn-pill-grid">
                    {types.map((t) => (
                      <span key={t.name} className="gn-resource-pill">
                        {TYPE_VI[t.name ?? ''] ?? formatName(t.name)}
                      </span>
                    ))}
                    {types.length === 0 ? (
                      <p className="gn-empty">Không có hệ nguyên tố mới ở thế hệ này.</p>
                    ) : null}
                  </div>
                </article>
              </div>

              {/* Pokemon Species Grid with Real Sprites */}
              {/* Pokemon Species Grid with High-Res 3D Artwork & Types */}
              <article className="gn-glass-card">
                <div className="gn-section-head">
                  <h3>Loài Pokémon mới ({species.length})</h3>
                  <p>
                    Hiển thị {visibleSpecies.length} trên tổng số {species.length} loài được giới
                    thiệu ở thế hệ này.
                  </p>
                </div>

                <div className="gn-species-grid">
                  {visibleSpecies.map((sp) => {
                    const id = extractId(sp.url)
                    const primaryArt = homeArtworkFor(id) || spriteFor(id, sp.name)
                    const resolvedTypes = id ? speciesTypes[id] ?? [] : []
                    return (
                      <Link
                        key={sp.name}
                        to={id ? `/pokemon?id=${id}` : '/pokemon'}
                        className="gn-species-card"
                      >
                        <div className="gn-species-aperture">
                          {primaryArt ? (
                            <img
                              src={primaryArt}
                              alt={formatName(sp.name)}
                              loading="lazy"
                              onError={(event) => {
                                const img = event.currentTarget
                                if (!img.dataset.fallbackStep) {
                                  img.dataset.fallbackStep = 'official'
                                  const official = officialArtworkFor(id)
                                  if (official) {
                                    img.src = official
                                    return
                                  }
                                }
                                if (img.dataset.fallbackStep !== 'sprite') {
                                  img.dataset.fallbackStep = 'sprite'
                                  const fallbackSprite = spriteFor(id, sp.name)
                                  if (fallbackSprite) {
                                    img.src = fallbackSprite
                                  }
                                }
                              }}
                            />
                          ) : null}
                        </div>
                        <span className="gn-species-id">
                          {id ? `#${id.toString().padStart(4, '0')}` : '---'}
                        </span>
                        <p className="gn-species-name">{formatName(sp.name)}</p>
                        <div className="gn-species-types" aria-label="Hệ nguyên tố">
                          {resolvedTypes.length > 0 ? (
                            resolvedTypes.map((typeKey, idx) => (
                              <span key={typeKey} className="gn-type-item">
                                {idx > 0 ? <span className="gn-type-dot">·</span> : null}
                                <span
                                  className="gn-type-label"
                                  style={{ color: TYPE_COLOR[typeKey] ?? 'var(--muted)' }}
                                >
                                  {TYPE_SHORT_VI[typeKey] ?? formatName(typeKey)}
                                </span>
                              </span>
                            ))
                          ) : (
                            <span className="gn-type-placeholder">Đang tải hệ...</span>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                  {species.length === 0 ? (
                    <p className="gn-empty">Không có loài Pokémon mới.</p>
                  ) : null}
                </div>

                {species.length > visibleSpecies.length ? (
                  <div className="gn-species-footer">
                    <button
                      type="button"
                      className="gn-btn"
                      onClick={() =>
                        setSpeciesLimit((prev) => Math.min(prev + SPECIES_PAGE_SIZE, species.length))
                      }
                    >
                      Xem thêm {Math.min(SPECIES_PAGE_SIZE, species.length - visibleSpecies.length)} loài
                    </button>
                    <button
                      type="button"
                      className="gn-btn gn-btn-ghost"
                      onClick={() => setSpeciesLimit(species.length)}
                    >
                      Hiện tất cả ({species.length})
                    </button>
                  </div>
                ) : null}
              </article>

              {/* Moves & Abilities Split */}
              <div className="gn-split-grids">
                <article className="gn-glass-card">
                  <div className="gn-section-head">
                    <h3>Chiêu thức mới ({moves.length})</h3>
                    <p>
                      Hiển thị {Math.min(moves.length, RESOURCE_PREVIEW_LIMIT)} trên tổng số{' '}
                      {moves.length} chiêu thức.
                    </p>
                  </div>
                  <div className="gn-pill-grid">
                    {moves.slice(0, RESOURCE_PREVIEW_LIMIT).map((m) => (
                      <span key={m.name} className="gn-resource-pill">
                        {formatName(m.name)}
                      </span>
                    ))}
                    {moves.length === 0 ? (
                      <p className="gn-empty">Không có chiêu thức mới.</p>
                    ) : null}
                  </div>
                </article>

                <article className="gn-glass-card">
                  <div className="gn-section-head">
                    <h3>Kỹ năng nội tại mới ({abilities.length})</h3>
                    <p>
                      {abilities.length > 0
                        ? `Hiển thị ${Math.min(abilities.length, RESOURCE_PREVIEW_LIMIT)} trên tổng số ${abilities.length} kỹ năng.`
                        : 'Hệ thống Kỹ năng nội tại bắt đầu xuất hiện từ Thế hệ III (Hoenn).'}
                    </p>
                  </div>
                  <div className="gn-pill-grid">
                    {abilities.slice(0, RESOURCE_PREVIEW_LIMIT).map((ab) => (
                      <span key={ab.name} className="gn-resource-pill">
                        {formatName(ab.name)}
                      </span>
                    ))}
                  </div>
                </article>
              </div>
            </>
          ) : null}
        </section>
      </main>

      <SiteFooter />
    </div >
  )
}

export default GenerationPage
