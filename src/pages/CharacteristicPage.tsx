import { useEffect, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { NAV_ITEMS } from '../config/navigation'
import { BorderBeam } from '../components/ui/BorderBeam'
import { formatName } from '../utils/pokemon'
import SiteFooter from '../components/SiteFooter'
import './CharacteristicPage.css'

const CHARACTERISTIC_ENDPOINT = 'https://pokeapi.co/api/v2/characteristic/'
const POKEMON_ENDPOINT = 'https://pokeapi.co/api/v2/pokemon/'
const MIN_ID = 1
const MAX_ID = 250
const CHARACTERISTIC_MAX_ID = 30

const PRESET_POKEMON = [
  { id: 1, label: '#1 Bulbasaur' },
  { id: 6, label: '#6 Charizard' },
  { id: 25, label: '#25 Pikachu' },
  { id: 94, label: '#94 Gengar' },
  { id: 150, label: '#150 Mewtwo' },
  { id: 248, label: '#248 Tyranitar' },
]

const CHARACTERISTIC_VI: Record<number, string> = {
  1: 'Thích ăn uống',
  2: 'Tự hào về sức mạnh',
  3: 'Cơ thể rắn rỏi',
  4: 'Thích chạy nhảy',
  5: 'Cực kỳ hiếu kỳ',
  6: 'Ý chí kiên định',
  7: 'Thường xuyên ngủ gật',
  8: 'Thích xông pha hỗn chiến',
  9: 'Chịu đòn dẻo dai',
  10: 'Cực kỳ nhạy bén âm thanh',
  11: 'Tinh nghịch phá phách',
  12: 'Có phần kiêu ngạo',
  13: 'Ngủ say không biết trời đất',
  14: 'Có chút nóng nảy',
  15: 'Kiên trì bền bỉ',
  16: 'Nhanh nhẹn hoạt bát',
  17: 'Cẩn trọng tỉ mỉ',
  18: 'Cực kỳ bướng bỉnh',
  19: 'Dễ bị phân tâm',
  20: 'Thích chiến đấu',
  21: 'Sức bền đáng nể',
  22: 'Hấp tấp bồng bột',
  23: 'Hay suy tư mông lung',
  24: 'Rất ghét thua cuộc',
  25: 'Thích thư giãn',
  26: 'Tính khí thất thường',
  27: 'Kiên định vững vàng',
  28: 'Nhanh chân chạy trốn',
  29: 'Rất cầu kỳ kỹ tính',
  30: 'Có chút bướng bỉnh',
}

type DescriptionEntry = {
  description: string
  language?: { name?: string; url?: string }
}

type NamedResource = {
  name?: string
  url?: string
}

type CharacteristicResponse = {
  id: number
  gene_modulo?: number
  possible_values?: number[]
  descriptions?: DescriptionEntry[]
  highest_stat?: NamedResource
}

type PokemonStat = {
  base_stat?: number
  stat?: { name?: string }
}

type PokemonResponse = {
  id: number
  name?: string
  sprites?: {
    front_default?: string | null
    other?: {
      'official-artwork'?: {
        front_default?: string | null
      }
    }
  }
  stats?: PokemonStat[]
}

const STAT_COLUMNS = [
  { key: 'hp', label: 'Sinh lực (HP)' },
  { key: 'attack', label: 'Tấn công' },
  { key: 'defense', label: 'Phòng thủ' },
  { key: 'speed', label: 'Tốc độ' },
  { key: 'special-attack', label: 'Công phép' },
  { key: 'special-defense', label: 'Thủ phép' },
] as const

const STAT_VI_MAP: Record<string, string> = {
  hp: 'Sinh lực (HP)',
  attack: 'Tấn công',
  defense: 'Phòng thủ',
  speed: 'Tốc độ',
  'special-attack': 'Công phép',
  'special-defense': 'Thủ phép',
}

const s = (vars: Record<string, string | number>): CSSProperties => vars as unknown as CSSProperties

const normalizeId = (value: string, min = MIN_ID, max = MAX_ID) => {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) return null
  return parsed
}

const toCharacteristicApiId = (id: number) => ((id - 1) % CHARACTERISTIC_MAX_ID) + 1

function CharacteristicPage() {
  const navigate = useNavigate()
  const { id: routeId } = useParams<{ id?: string }>()

  const initialId = normalizeId(routeId ?? '') ?? MIN_ID
  const [pokemonInput, setPokemonInput] = useState(String(initialId))
  const [activeCharacteristicInputId, setActiveCharacteristicInputId] = useState(initialId)
  const [activePokemonId, setActivePokemonId] = useState(initialId)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [pokemonStatus, setPokemonStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [pokemonErrorMessage, setPokemonErrorMessage] = useState('')
  const [characteristic, setCharacteristic] = useState<CharacteristicResponse | null>(null)
  const [pokemon, setPokemon] = useState<PokemonResponse | null>(null)
  const [activeCharacteristicApiId, setActiveCharacteristicApiId] = useState(
    toCharacteristicApiId(initialId)
  )

  useEffect(() => {
    const parsedFromRoute = normalizeId(routeId ?? '')
    if (!parsedFromRoute) return
    setPokemonInput(String(parsedFromRoute))
    setActiveCharacteristicInputId(parsedFromRoute)
    setActivePokemonId(parsedFromRoute)
    setActiveCharacteristicApiId(toCharacteristicApiId(parsedFromRoute))
  }, [routeId])

  useEffect(() => {
    let isActive = true

    const load = async () => {
      setStatus('loading')
      setErrorMessage('')

      try {
        const response = await fetch(`${CHARACTERISTIC_ENDPOINT}${activeCharacteristicApiId}/`)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = (await response.json()) as CharacteristicResponse
        if (!isActive) return

        setCharacteristic(data)
        setStatus('success')
      } catch (error) {
        if (!isActive) return
        setStatus('error')
        setCharacteristic(null)
        setErrorMessage(
          error instanceof Error ? error.message : 'Không thể tải dữ liệu đặc tính.'
        )
      }
    }

    load()

    return () => {
      isActive = false
    }
  }, [activeCharacteristicApiId])

  useEffect(() => {
    let isActive = true

    const loadPokemon = async () => {
      setPokemonStatus('loading')
      setPokemonErrorMessage('')

      try {
        const response = await fetch(`${POKEMON_ENDPOINT}${activePokemonId}/`)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = (await response.json()) as PokemonResponse
        if (!isActive) return
        setPokemon(data)
        setPokemonStatus('success')
      } catch (error) {
        if (!isActive) return
        setPokemon(null)
        setPokemonStatus('error')
        setPokemonErrorMessage(
          error instanceof Error ? error.message : 'Không thể tải dữ liệu Pokémon.'
        )
      }
    }

    loadPokemon()

    return () => {
      isActive = false
    }
  }, [activePokemonId])

  const statusLabel =
    status === 'loading' ? 'Đang tải' : status === 'error' ? 'Lỗi' : 'Sẵn sàng'
  const pokemonStatusLabel =
    pokemonStatus === 'loading' ? 'Đang tải' : pokemonStatus === 'error' ? 'Lỗi' : 'Sẵn sàng'

  const selectPokemonId = (id: number) => {
    setPokemonInput(String(id))
    setActiveCharacteristicInputId(id)
    setActivePokemonId(id)
    setActiveCharacteristicApiId(toCharacteristicApiId(id))
    navigate(`/characteristic/${id}`)
  }

  const submitId = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const pokemonParsed = normalizeId(pokemonInput.trim())

    if (!pokemonParsed) {
      setErrorMessage(`Chỉ chấp nhận mã Pokémon từ ${MIN_ID} đến ${MAX_ID}.`)
      setStatus('error')
      setCharacteristic(null)
      return
    }

    selectPokemonId(pokemonParsed)
  }

  const pokemonSprite =
    pokemon?.sprites?.other?.['official-artwork']?.front_default ??
    pokemon?.sprites?.front_default ??
    ''

  const highestStatKey = characteristic?.highest_stat?.name ?? ''
  const highestStatVi =
    STAT_VI_MAP[highestStatKey] ??
    (highestStatKey ? formatName(highestStatKey) : 'Chưa rõ')

  const enDescription = characteristic?.descriptions?.find(
    (entry) => entry.language?.name === 'en'
  )?.description
  const viDescription =
    (characteristic ? CHARACTERISTIC_VI[characteristic.id] : undefined) ||
    enDescription ||
    'Chưa có mô tả'

  const possibleValuesText = characteristic?.possible_values?.length
    ? characteristic.possible_values.join(', ')
    : '0, 5, 10, 15, 20, 25, 30'

  const getStatValue = (key: (typeof STAT_COLUMNS)[number]['key']) => {
    if (!pokemon?.stats) return null
    const found = pokemon.stats.find((entry) => entry.stat?.name === key)
    return typeof found?.base_stat === 'number' ? found.base_stat : null
  }

  return (
    <div className="ch-page">
      {/* Synchronized Top Header */}
      <header className="ch-header">
        <nav className="ch-nav" aria-label="Điều hướng chính">
          <Link to="/" className="ch-wordmark">
            <img src="/assets/logo.jpg" alt="Poke Hub Logo" className="ch-wordmark-logo" />
            <span>Poke Hub</span>
          </Link>

          <ul className="ch-nav-links">
            {NAV_ITEMS.filter((item) => !item.isAction).map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`ch-link${item.path === '/characteristic' ? ' is-active' : ''}`}
                  title={item.labelVi}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link to="/battle" className="ch-btn">
            Battle Sim
          </Link>
        </nav>
      </header>

      <main>
        {/* Hero & Characteristic Lookup Console */}
        <section className="ch-hero" aria-labelledby="ch-hero-title">
          <div className="ch-hero-card">
            <div>
              <h1 id="ch-hero-title" className="ch-display ch-lines">
                <span className="ch-line">
                  <span data-line style={s({ '--i': 0 })}>
                    Giải mã Đặc tính
                  </span>
                </span>
                <span className="ch-line">
                  <span data-line style={s({ '--i': 1 })}>
                    Chỉ số Cá thể IV
                  </span>
                </span>
              </h1>
              <p className="ch-lead" data-load style={s({ '--d': '160ms' })}>
                Nhập mã Pokémon ({MIN_ID}–{MAX_ID}) để xem hình ảnh, 6 chỉ số gốc và câu mô tả đặc
                tính IV theo thuật toán Modulo 5 từ PokeAPI v2.
              </p>
            </div>

            <form
              className="ch-search-form"
              data-load
              style={s({ '--d': '220ms' })}
              onSubmit={submitId}
            >
              <label className="ch-input-wrap">
                <span className="ch-input-label">Mã số Pokémon (1–250)</span>
                <input
                  className="ch-input"
                  type="number"
                  min={MIN_ID}
                  max={MAX_ID}
                  step={1}
                  value={pokemonInput}
                  onChange={(event) => setPokemonInput(event.target.value)}
                  placeholder="Nhập số từ 1 đến 250..."
                />
              </label>

              <div className="ch-form-actions">
                <button className="ch-btn" type="submit">
                  Tra cứu
                </button>
                <button
                  className="ch-btn ch-btn-ghost"
                  type="button"
                  onClick={() => selectPokemonId(MIN_ID)}
                >
                  Mặc định
                </button>
              </div>
            </form>

            <div className="ch-presets" data-load style={s({ '--d': '280ms' })}>
              <span className="ch-presets-label">Chọn nhanh:</span>
              {PRESET_POKEMON.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={`ch-chip${activePokemonId === preset.id ? ' is-active' : ''}`}
                  onClick={() => selectPokemonId(preset.id)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <aside
            className="ch-telemetry-stage"
            data-ui
            data-load
            style={s({ '--d': '200ms' })}
            aria-label="Trạng thái tra cứu đặc tính"
          >
            <div className="ch-telemetry-head">
              <h2 className="ch-telemetry-title">Hồ sơ Đặc tính đang soi</h2>
              <div className="ch-status-row">
                <span className="ch-status-pill" data-state={status}>
                  <span className="ch-pulse-beacon" aria-hidden="true" />
                  Đặc tính: {statusLabel}
                </span>
                <span className="ch-status-pill" data-state={pokemonStatus}>
                  <span className="ch-pulse-beacon" aria-hidden="true" />
                  Pokémon: {pokemonStatusLabel}
                </span>
              </div>
            </div>

            <div className="ch-telemetry-metrics">
              <div className="ch-metric-cell">
                <span className="ch-metric-lbl">Mã Pokémon</span>
                <span className="ch-metric-val">
                  #{activePokemonId.toString().padStart(3, '0')}
                </span>
              </div>
              <div className="ch-metric-cell">
                <span className="ch-metric-lbl">Mã đặc tính API</span>
                <span className="ch-metric-val">
                  {activeCharacteristicApiId} / {CHARACTERISTIC_MAX_ID}
                </span>
              </div>
              <div className="ch-metric-cell">
                <span className="ch-metric-lbl">Chỉ số cao nhất</span>
                <span className="ch-metric-val">{highestStatVi}</span>
              </div>
              <div className="ch-metric-cell">
                <span className="ch-metric-lbl">Số dư Modulo 5</span>
                <span className="ch-metric-val">
                  {characteristic?.gene_modulo ?? 0}
                </span>
              </div>
            </div>
          </aside>
        </section>

        {/* Main Content */}
        <section className="ch-content" aria-label="Bảng chỉ số và đặc tính">
          {status === 'error' ? (
            <div className="ch-notice">
              <h3>Không thể tải dữ liệu đặc tính</h3>
              <p>{errorMessage || 'Vui lòng kiểm tra lại mã Pokémon hợp lệ (1–250).'}</p>
            </div>
          ) : null}

          {pokemonStatus === 'error' ? (
            <div className="ch-notice">
              <h3>Không thể tải dữ liệu Pokémon</h3>
              <p>{pokemonErrorMessage || 'Vui lòng kiểm tra lại mã Pokémon.'}</p>
            </div>
          ) : null}

          {status === 'success' && characteristic ? (
            <article className="ch-dossier-card">
              <div className="ch-summary-top">
                <div className="ch-summary-title-wrap">
                  <span className="ch-tag">Đặc tính #{characteristic.id}</span>
                  <h2 className="ch-pokemon-title">
                    #{pokemon?.id ?? activePokemonId} ·{' '}
                    {pokemon?.name ? formatName(pokemon.name) : `Pokémon #${activePokemonId}`}
                  </h2>
                </div>
                <span
                  className="ch-highest-pill"
                  title={`PokeAPI có 30 nhóm đặc tính. Mã ${activeCharacteristicInputId} ánh xạ tới nhóm #${activeCharacteristicApiId}.`}
                >
                  Chỉ số nổi trội: {highestStatVi}
                </span>
              </div>

              <div className="ch-board" role="table" aria-label="Bảng 6 chỉ số gốc">
                <BorderBeam
                  key={`sprite-${activePokemonId}`}
                  className="ch-sprite-beam"
                  lightColor="#00e676"
                  lightWidth={320}
                  duration={6}
                  borderWidth={2}
                >
                  <div className="ch-sprite-stage">
                    <img
                      className="ch-sprite-img"
                      src={
                        pokemonSprite ||
                        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'
                      }
                      alt={pokemon?.name ? formatName(pokemon.name) : 'Pokémon'}
                    />
                  </div>
                </BorderBeam>

                <div className="ch-stats-grid">
                  {STAT_COLUMNS.map((stat) => {
                    const isHighest = characteristic.highest_stat?.name === stat.key
                    const value = getStatValue(stat.key)
                    const pct = value !== null ? Math.min(100, Math.round((value / 160) * 100)) : 0
                    return (
                      <div
                        key={stat.key}
                        className={`ch-stat-card${isHighest ? ' is-highest' : ''}`}
                      >
                        <div className="ch-stat-head">
                          <span className="ch-stat-name">{stat.label}</span>
                          {isHighest ? <span className="ch-stat-badge">Cao nhất</span> : null}
                        </div>
                        <span className="ch-stat-num">{value ?? '—'}</span>
                        <div className="ch-stat-bar" aria-hidden="true">
                          <span className="ch-stat-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="ch-analysis-grid">
                <div className="ch-analysis-cell">
                  <span className="ch-analysis-lbl">Mô tả đặc tính IV</span>
                  <span className="ch-analysis-val">
                    “{viDescription}”
                    {enDescription && viDescription !== enDescription ? ` (${enDescription})` : ''}
                  </span>
                </div>
                <div className="ch-analysis-cell">
                  <span className="ch-analysis-lbl">Số dư phép chia IV % 5</span>
                  <span className="ch-analysis-val">
                    Dư {characteristic.gene_modulo ?? 0} (Nhóm #{characteristic.id})
                  </span>
                </div>
                <div className="ch-analysis-cell">
                  <span className="ch-analysis-lbl">Các giá trị IV khả dĩ</span>
                  <span className="ch-analysis-val">{possibleValuesText}</span>
                </div>
              </div>
            </article>
          ) : null}
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

export default CharacteristicPage
