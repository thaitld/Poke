import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { NAV_ITEMS } from '../config/navigation'
import { extractId, formatName, spriteFor } from '../utils/pokemon'
import SiteFooter from '../components/SiteFooter'
import './PokedexPage.css'

const POKEDEX_ENDPOINT = 'https://pokeapi.co/api/v2/pokedex/'
const POKEMON_ENDPOINT = 'https://pokeapi.co/api/v2/pokemon/'
const TILE_PAGE_SIZE = 30

const PRESET_POKEDEXES = [
  { query: 'kanto', label: 'Kanto' },
  { query: 'national', label: 'National' },
  { query: 'original-johto', label: 'Johto' },
  { query: 'hoenn', label: 'Hoenn' },
  { query: 'original-sinnoh', label: 'Sinnoh' },
  { query: 'original-unova', label: 'Unova' },
  { query: 'kalos-central', label: 'Kalos' },
  { query: 'alola', label: 'Alola' },
  { query: 'galar', label: 'Galar' },
  { query: 'paldea', label: 'Paldea' },
]

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

const TYPE_BG: Record<string, string> = {
  normal: '#6b6f62',
  fighting: '#b33328',
  flying: '#5b6ec9',
  poison: '#8e3a8e',
  ground: '#a68232',
  rock: '#8d7b38',
  bug: '#6d8216',
  ghost: '#5b4879',
  steel: '#5b6a7a',
  fire: '#c84b18',
  water: '#2b6cb8',
  grass: '#2d7a22',
  electric: '#855e00',
  psychic: '#c2305c',
  ice: '#227477',
  dragon: '#5229c4',
  dark: '#524034',
  fairy: '#b84980',
}

const homeArtworkFor = (id: number | null) =>
  id ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png` : ''

const officialArtworkFor = (id: number | null) =>
  id
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
    : ''

type NamedResource = {
  name?: string
  url?: string
}

type DescriptionEntry = {
  description?: string
  language?: NamedResource
}

type NameEntry = {
  name?: string
  language?: NamedResource
}

type PokedexEntry = {
  entry_number?: number
  pokemon_species?: NamedResource
}

type PokedexResponse = {
  id: number
  name: string
  is_main_series?: boolean
  descriptions?: DescriptionEntry[]
  names?: NameEntry[]
  pokemon_entries?: PokedexEntry[]
  region?: NamedResource
  version_groups?: NamedResource[]
}

const s = (vars: Record<string, string | number>): CSSProperties => vars as unknown as CSSProperties

function PokedexPage() {
  const navigate = useNavigate()
  const { idOrName } = useParams<{ idOrName?: string }>()
  const initialQuery = (idOrName ?? 'kanto').trim().toLowerCase() || 'kanto'

  const [input, setInput] = useState(initialQuery)
  const [activeQuery, setActiveQuery] = useState(initialQuery)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [pokedex, setPokedex] = useState<PokedexResponse | null>(null)
  const [selectedEntryNumber, setSelectedEntryNumber] = useState<number | null>(null)
  const [sortMode, setSortMode] = useState<'number' | 'name'>('number')
  const [filterText, setFilterText] = useState('')
  const [tileLimit, setTileLimit] = useState(TILE_PAGE_SIZE)
  const [speciesTypes, setSpeciesTypes] = useState<Record<number, string[]>>({})

  useEffect(() => {
    const nextQuery = (idOrName ?? 'kanto').trim().toLowerCase() || 'kanto'
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
      setTileLimit(TILE_PAGE_SIZE)
      setFilterText('')

      try {
        const response = await fetch(`${POKEDEX_ENDPOINT}${clean}/`)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = (await response.json()) as PokedexResponse
        if (!isActive) return

        setPokedex(data)
        setSelectedEntryNumber(data.pokemon_entries?.[0]?.entry_number ?? null)
        setStatus('success')
      } catch (error) {
        if (!isActive) return
        setStatus('error')
        setPokedex(null)
        setErrorMessage(
          error instanceof Error ? error.message : 'Không thể tải dữ liệu Pokédex.'
        )
      }
    }

    load()

    return () => {
      isActive = false
    }
  }, [activeQuery])

  const englishName = useMemo(() => {
    return pokedex?.names?.find((item) => item.language?.name === 'en')?.name
  }, [pokedex])

  const englishDescription = useMemo(() => {
    return pokedex?.descriptions?.find((item) => item.language?.name === 'en')?.description
  }, [pokedex])

  const pokemonEntries = useMemo(() => pokedex?.pokemon_entries ?? [], [pokedex])
  const versionGroups = pokedex?.version_groups ?? []
  const localizedNames = pokedex?.names ?? []
  const statusLabel =
    status === 'loading' ? 'Đang tải' : status === 'error' ? 'Lỗi kết nối' : 'Sẵn sàng'

  const sortedEntries = useMemo(() => {
    const keyword = filterText.trim().toLowerCase()
    const filtered = keyword
      ? pokemonEntries.filter((entry) => {
          const name = (entry.pokemon_species?.name ?? '').toLowerCase()
          const num = String(entry.entry_number ?? '')
          return name.includes(keyword) || num.includes(keyword)
        })
      : [...pokemonEntries]

    if (sortMode === 'name') {
      filtered.sort((a, b) =>
        (a.pokemon_species?.name ?? '').localeCompare(b.pokemon_species?.name ?? '')
      )
      return filtered
    }

    filtered.sort((a, b) => (a.entry_number ?? 0) - (b.entry_number ?? 0))
    return filtered
  }, [pokemonEntries, sortMode, filterText])

  const visibleTiles = useMemo(
    () => sortedEntries.slice(0, tileLimit),
    [sortedEntries, tileLimit]
  )

  const selectedEntry = useMemo(() => {
    if (!pokemonEntries.length) return null
    if (selectedEntryNumber == null) return sortedEntries[0] ?? pokemonEntries[0]
    return (
      pokemonEntries.find((entry) => entry.entry_number === selectedEntryNumber) ??
      sortedEntries[0] ??
      pokemonEntries[0]
    )
  }, [pokemonEntries, sortedEntries, selectedEntryNumber])

  const selectedSpeciesName = selectedEntry?.pokemon_species?.name
  const selectedSpeciesId = extractId(selectedEntry?.pokemon_species?.url)
  const selectedPrimaryArt =
    homeArtworkFor(selectedSpeciesId) ||
    officialArtworkFor(selectedSpeciesId) ||
    spriteFor(selectedSpeciesId, selectedSpeciesName)

  useEffect(() => {
    if (!selectedSpeciesId || selectedSpeciesId in speciesTypes) return

    let isActive = true
    const loadSelectedTypes = async () => {
      try {
        const res = await fetch(`${POKEMON_ENDPOINT}${selectedSpeciesId}/`)
        if (!res.ok) return
        const data = (await res.json()) as {
          types?: Array<{ slot?: number; type?: { name?: string } }>
        }
        if (!isActive) return
        const resolved = (data.types ?? [])
          .sort((a, b) => (a.slot ?? 0) - (b.slot ?? 0))
          .map((item) => item.type?.name)
          .filter((t): t is string => Boolean(t))
        setSpeciesTypes((prev) => ({ ...prev, [selectedSpeciesId]: resolved }))
      } catch {
        // Ignore transient type fetch error
      }
    }

    loadSelectedTypes()

    return () => {
      isActive = false
    }
  }, [selectedSpeciesId, speciesTypes])

  const selectedTypes = selectedSpeciesId ? speciesTypes[selectedSpeciesId] ?? [] : []

  const handleSelectPokedex = (query: string) => {
    setInput(query)
    setActiveQuery(query)
    navigate(`/pokedex/${query}`)
  }

  return (
    <div className="pdx-page">
      {/* Synchronized Top Header */}
      <header className="pdx-header">
        <nav className="pdx-nav" aria-label="Điều hướng chính">
          <Link to="/" className="pdx-wordmark">
            <img src="/assets/logo.jpg" alt="Poke Hub Logo" className="pdx-wordmark-logo" />
            <span>Poke Hub</span>
          </Link>

          <ul className="pdx-nav-links">
            {NAV_ITEMS.filter((item) => !item.isAction).map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`pdx-link${item.path === '/pokedex' ? ' is-active' : ''}`}
                  title={item.labelVi}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link to="/battle" className="pdx-btn">
            Battle Sim
          </Link>
        </nav>
      </header>

      <main>
        {/* Hero Stage */}
        <section className="pdx-hero" aria-label="Tra cứu Pokédex theo vùng">
          <div className="pdx-hero-card">
            <h1 className="pdx-title">
              <span className="pdx-line">
                <span data-line style={s({ '--i': 0 })}>
                  Bách khoa Pokédex
                </span>
              </span>
              <span className="pdx-line">
                <span data-line style={s({ '--i': 1 })}>
                  Theo Khu vực
                </span>
              </span>
            </h1>

            <p className="pdx-lead" data-load style={s({ '--d': '160ms' })}>
              Tra cứu danh mục Pokémon theo từng vùng đất và phiên bản game. Chọn một Pokémon bất kỳ
              trên bảng để xem hình ảnh 3D sắc nét, hệ nguyên tố và thông tin chi tiết.
            </p>

            <form
              className="pdx-search-form"
              data-load
              style={s({ '--d': '220ms' })}
              onSubmit={(event) => {
                event.preventDefault()
                const clean = input.trim().toLowerCase()
                if (!clean) return
                handleSelectPokedex(clean)
              }}
            >
              <label className="pdx-input-wrap">
                <span className="pdx-input-label">Mã số hoặc tên Pokédex</span>
                <input
                  className="pdx-input"
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ví dụ: kanto, national, original-johto, paldea..."
                />
              </label>

              <div className="pdx-form-actions">
                <button className="pdx-btn" type="submit">
                  Tra cứu
                </button>
                <button
                  className="pdx-btn pdx-btn-ghost"
                  type="button"
                  onClick={() => handleSelectPokedex('kanto')}
                >
                  Mặc định
                </button>
              </div>
            </form>

            <div className="pdx-presets" data-load style={s({ '--d': '280ms' })}>
              <span className="pdx-presets-label">Khu vực nổi bật:</span>
              {PRESET_POKEDEXES.map((preset) => {
                const isSelected =
                  activeQuery === preset.query || pokedex?.name === preset.query
                return (
                  <button
                    key={preset.query}
                    type="button"
                    className={`pdx-chip${isSelected ? ' is-active' : ''}`}
                    onClick={() => handleSelectPokedex(preset.query)}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>
          </div>

          <aside
            className="pdx-telemetry-stage"
            data-ui
            data-load
            style={s({ '--d': '200ms' })}
            aria-label="Hồ sơ Pokédex đang soi"
          >
            <div className="pdx-telemetry-head">
              <h2 className="pdx-telemetry-title">Hồ sơ Pokédex đang soi</h2>
              <span className="pdx-status-pill" data-state={status}>
                <span className="pdx-pulse-beacon" aria-hidden="true" />
                {statusLabel}
              </span>
            </div>

            <div className="pdx-telemetry-metrics">
              <div className="pdx-metric-cell">
                <span className="pdx-metric-lbl">Mã Pokédex</span>
                <span className="pdx-metric-val">
                  {pokedex ? `#${pokedex.id.toString().padStart(3, '0')}` : '---'}
                </span>
              </div>
              <div className="pdx-metric-cell">
                <span className="pdx-metric-lbl">Khu vực</span>
                <span className="pdx-metric-val">
                  {pokedex?.region?.name ? formatName(pokedex.region.name) : 'Quốc gia'}
                </span>
              </div>
              <div className="pdx-metric-cell">
                <span className="pdx-metric-lbl">Tổng số loài</span>
                <span className="pdx-metric-val">{pokemonEntries.length} loài</span>
              </div>
              <div className="pdx-metric-cell">
                <span className="pdx-metric-lbl">Cụm phiên bản</span>
                <span className="pdx-metric-val">{versionGroups.length} cụm</span>
              </div>
            </div>
          </aside>
        </section>

        {/* Main Content */}
        <section className="pdx-content" aria-label="Bảng điều khiển Pokédex">
          {status === 'error' ? (
            <div className="pdx-notice">
              <h3>Không thể tải dữ liệu Pokédex</h3>
              <p>
                {errorMessage ||
                  'Vui lòng kiểm tra lại mã số hoặc tên Pokédex (ví dụ: kanto, national).'}
              </p>
            </div>
          ) : null}

          {status === 'success' && pokedex ? (
            <>
              {/* Modern Liquid Glass Pokédex Console */}
              <div className="pdx-console">
                {/* Left Showcase Screen */}
                <div className="pdx-console-left">
                  <div className="pdx-screen">
                    <div className="pdx-screen-head">
                      <div>
                        <h2 className="pdx-screen-title">
                          {formatName(englishName ?? pokedex.name)}
                        </h2>
                        <p className="pdx-screen-subtitle">
                          Khu vực {pokedex.region?.name ? formatName(pokedex.region.name) : 'Quốc gia'}
                        </p>
                      </div>
                      <span className="pdx-series-badge">
                        {pokedex.is_main_series ? 'Dòng chính' : 'Ngoại truyện'}
                      </span>
                    </div>

                    <div className="pdx-showcase-stage">
                      <img
                        src={
                          selectedPrimaryArt ||
                          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'
                        }
                        alt={formatName(selectedSpeciesName)}
                        onError={(event) => {
                          const img = event.currentTarget
                          if (!img.dataset.fallbackStep) {
                            img.dataset.fallbackStep = 'official'
                            const official = officialArtworkFor(selectedSpeciesId)
                            if (official) {
                              img.src = official
                              return
                            }
                          }
                          if (img.dataset.fallbackStep !== 'sprite') {
                            img.dataset.fallbackStep = 'sprite'
                            img.src =
                              spriteFor(selectedSpeciesId, selectedSpeciesName) ||
                              'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'
                          }
                        }}
                      />
                    </div>

                    <div className="pdx-selected-info">
                      <div className="pdx-selected-row">
                        <span className="pdx-selected-num">
                          #{String(selectedEntry?.entry_number ?? 0).padStart(3, '0')}
                        </span>
                        <strong className="pdx-selected-name">
                          {formatName(selectedSpeciesName)}
                        </strong>
                      </div>

                      {selectedTypes.length > 0 ? (
                        <div className="pdx-selected-types">
                          {selectedTypes.map((typeKey) => (
                            <span
                              key={typeKey}
                              className="pdx-type-chip"
                              style={{ backgroundColor: TYPE_BG[typeKey] ?? '#35605b' }}
                            >
                              {TYPE_SHORT_VI[typeKey] ?? formatName(typeKey)}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      {selectedSpeciesId ? (
                        <Link to={`/pokemon?id=${selectedSpeciesId}`} className="pdx-btn">
                          Xem chi tiết Pokémon
                        </Link>
                      ) : null}
                    </div>
                  </div>

                  <div className="pdx-flavor-box">
                    <span className="pdx-flavor-lbl">Mô tả Pokédex</span>
                    <p className="pdx-flavor-text">
                      {englishDescription || 'Chưa có mô tả chi tiết cho Pokédex này.'}
                    </p>
                  </div>
                </div>

                {/* Right Interactive Grid */}
                <div className="pdx-console-right">
                  <div className="pdx-console-toolbar">
                    <p className="pdx-toolbar-meta">
                      Dex #{pokedex.id.toString().padStart(3, '0')} · {sortedEntries.length} loài
                    </p>

                    <div className="pdx-toolbar-controls">
                      <input
                        className="pdx-filter-input"
                        type="text"
                        value={filterText}
                        onChange={(event) => {
                          setFilterText(event.target.value)
                          setTileLimit(TILE_PAGE_SIZE)
                        }}
                        placeholder="Lọc nhanh tên hoặc số..."
                        aria-label="Lọc nhanh Pokémon"
                      />
                      <button
                        className="pdx-btn pdx-btn-dark"
                        type="button"
                        onClick={() =>
                          setSortMode((mode) => (mode === 'number' ? 'name' : 'number'))
                        }
                      >
                        Xếp theo: {sortMode === 'number' ? 'Số thứ tự' : 'Tên A–Z'}
                      </button>
                    </div>
                  </div>

                  <div className="pdx-tile-grid" role="list">
                    {visibleTiles.map((entry) => {
                      const speciesName = entry.pokemon_species?.name
                      const speciesId = extractId(entry.pokemon_species?.url)
                      const tileArt =
                        homeArtworkFor(speciesId) || spriteFor(speciesId, speciesName)
                      const isActive = entry.entry_number === selectedEntry?.entry_number

                      return (
                        <button
                          key={`${entry.entry_number}-${speciesName}`}
                          type="button"
                          className={`pdx-tile${isActive ? ' is-active' : ''}`}
                          onClick={() => setSelectedEntryNumber(entry.entry_number ?? null)}
                        >
                          <div className="pdx-tile-aperture">
                            {tileArt ? (
                              <img
                                src={tileArt}
                                alt={formatName(speciesName)}
                                loading="lazy"
                                onError={(event) => {
                                  const img = event.currentTarget
                                  if (!img.dataset.fallbackStep) {
                                    img.dataset.fallbackStep = 'official'
                                    const official = officialArtworkFor(speciesId)
                                    if (official) {
                                      img.src = official
                                      return
                                    }
                                  }
                                  if (img.dataset.fallbackStep !== 'sprite') {
                                    img.dataset.fallbackStep = 'sprite'
                                    img.src =
                                      spriteFor(speciesId, speciesName) ||
                                      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'
                                  }
                                }}
                              />
                            ) : (
                              <span>?</span>
                            )}
                          </div>
                          <p className="pdx-tile-number">
                            #{String(entry.entry_number ?? 0).padStart(3, '0')}
                          </p>
                          <p className="pdx-tile-name">{formatName(speciesName)}</p>
                        </button>
                      )
                    })}

                    {sortedEntries.length === 0 ? (
                      <p className="pdx-empty-dark">Không tìm thấy loài Pokémon phù hợp.</p>
                    ) : null}
                  </div>

                  {sortedEntries.length > visibleTiles.length ? (
                    <div className="pdx-tile-footer">
                      <button
                        type="button"
                        className="pdx-btn"
                        onClick={() =>
                          setTileLimit((prev) =>
                            Math.min(prev + TILE_PAGE_SIZE, sortedEntries.length)
                          )
                        }
                      >
                        Xem thêm {Math.min(TILE_PAGE_SIZE, sortedEntries.length - visibleTiles.length)} loài
                      </button>
                      <button
                        type="button"
                        className="pdx-btn pdx-btn-dark"
                        onClick={() => setTileLimit(sortedEntries.length)}
                      >
                        Hiện tất cả ({sortedEntries.length})
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Overview & Supplementary Cards */}
              <article className="pdx-glass-card">
                <div className="pdx-section-head">
                  <h3>Thông tin tổng quan Pokédex</h3>
                  <p>Số liệu thống kê và chế độ hiển thị hiện tại.</p>
                </div>

                <div className="pdx-summary-grid">
                  <div className="pdx-summary-box">
                    <span className="pdx-summary-lbl">Tên đa ngôn ngữ</span>
                    <span className="pdx-summary-val">{localizedNames.length} ngôn ngữ</span>
                  </div>
                  <div className="pdx-summary-box">
                    <span className="pdx-summary-lbl">Cụm phiên bản</span>
                    <span className="pdx-summary-val">{versionGroups.length} cụm</span>
                  </div>
                  <div className="pdx-summary-box">
                    <span className="pdx-summary-lbl">Chế độ sắp xếp</span>
                    <span className="pdx-summary-val">
                      {sortMode === 'number' ? 'Theo số thứ tự' : 'Theo tên A–Z'}
                    </span>
                  </div>
                </div>
              </article>

              <div className="pdx-split-grids">
                <article className="pdx-glass-card">
                  <div className="pdx-section-head">
                    <h3>Tên gọi đa ngôn ngữ ({localizedNames.length})</h3>
                    <p>Tên hiển thị của Pokédex tại các thị trường phát hành.</p>
                  </div>
                  <div className="pdx-names-grid">
                    {localizedNames.map((entry, idx) => {
                      const lang = entry.language?.name ?? 'unknown'
                      return (
                        <div key={`${lang}-${idx}`} className="pdx-name-card">
                          <span className="pdx-lang-lbl">{LANGUAGE_VI[lang] ?? lang}</span>
                          <strong className="pdx-lang-val">{entry.name}</strong>
                        </div>
                      )
                    })}
                    {localizedNames.length === 0 ? (
                      <p className="pdx-empty">Không có dữ liệu tên đa ngôn ngữ.</p>
                    ) : null}
                  </div>
                </article>

                <article className="pdx-glass-card">
                  <div className="pdx-section-head">
                    <h3>Cụm phiên bản áp dụng ({versionGroups.length})</h3>
                    <p>Các tựa game sử dụng danh mục Pokédex này.</p>
                  </div>
                  <div className="pdx-pill-grid">
                    {versionGroups.map((vg) => (
                      <span key={vg.name} className="pdx-resource-pill">
                        {formatName(vg.name)}
                      </span>
                    ))}
                    {versionGroups.length === 0 ? (
                      <p className="pdx-empty">Chưa có dữ liệu cụm phiên bản.</p>
                    ) : null}
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

export default PokedexPage
