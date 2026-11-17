import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BorderBeam } from '../components/ui/BorderBeam'
import { formatName } from '../utils/pokemon'

const CHARACTERISTIC_ENDPOINT = 'https://pokeapi.co/api/v2/characteristic/'
const POKEMON_ENDPOINT = 'https://pokeapi.co/api/v2/pokemon/'
const MIN_ID = 1
const MAX_ID = 250
const CHARACTERISTIC_MAX_ID = 30

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
  { key: 'hp', label: 'Hit Points' },
  { key: 'attack', label: 'Attack' },
  { key: 'defense', label: 'Defense' },
  { key: 'speed', label: 'Speed' },
  { key: 'special-attack', label: 'Sp. Attack' },
  { key: 'special-defense', label: 'Sp. Defense' },
] as const

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
          error instanceof Error ? error.message : 'Khong the tai du lieu'
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
          error instanceof Error ? error.message : 'Khong the tai du lieu Pokemon'
        )
      }
    }

    loadPokemon()

    return () => {
      isActive = false
    }
  }, [activePokemonId])

  const statusLabel =
    status === 'loading' ? 'Dang tai' : status === 'error' ? 'Loi' : 'San sang'
  const pokemonStatusLabel =
    pokemonStatus === 'loading' ? 'Dang tai' : pokemonStatus === 'error' ? 'Loi' : 'San sang'

  const submitId = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const pokemonParsed = normalizeId(pokemonInput.trim())

    if (!pokemonParsed) {
      setErrorMessage(`Chi chap nhan ID tu ${MIN_ID} den ${MAX_ID}.`)
      setStatus('error')
      setCharacteristic(null)
      return
    }

    setActiveCharacteristicInputId(pokemonParsed)
    setActivePokemonId(pokemonParsed)
    setActiveCharacteristicApiId(toCharacteristicApiId(pokemonParsed))
    navigate(`/characteristic/${pokemonParsed}`)
  }

  const pokemonSprite =
    pokemon?.sprites?.other?.['official-artwork']?.front_default ??
    pokemon?.sprites?.front_default ??
    ''

  const highestStatKey = characteristic?.highest_stat?.name ?? ''
  const highestStatName = formatName(characteristic?.highest_stat?.name)
  const moduloHint = `PokeAPI characteristic chi co 1-30. App map Characteristic ID ${activeCharacteristicInputId} -> API ID ${activeCharacteristicApiId} theo cong thuc ((id - 1) % 30) + 1.`

  const getStatValue = (key: (typeof STAT_COLUMNS)[number]['key']) => {
    if (!pokemon?.stats) return '-'
    const found = pokemon.stats.find((entry) => entry.stat?.name === key)
    return typeof found?.base_stat === 'number' ? found.base_stat : '-'
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <span className="brand-dot" />
          </div>
          <div>
            <p className="eyebrow">Characteristic Probe</p>
            <h1>Pokemon Characteristic</h1>
          </div>
        </div>
      </header>

      <main>
        <section className="characteristic-hero">
          <div className="characteristic-copy">
            <p className="lead">
              Nhap Pokemon ID (1-250) de xem sprite, base stats va characteristic tu PokeAPI.
            </p>
            <form className="characteristic-form" onSubmit={submitId}>
              <label className="characteristic-input-group">
                <span>Pokemon ID</span>
                <input
                  type="number"
                  min={MIN_ID}
                  max={MAX_ID}
                  step={1}
                  value={pokemonInput}
                  onChange={(event) => setPokemonInput(event.target.value)}
                  placeholder="1-250"
                />
              </label>

              <div className="characteristic-actions">
                <button className="btn primary" type="submit">
                  Tra cuu
                </button>
                <button
                  className="btn ghost"
                  type="button"
                  onClick={() => {
                    setPokemonInput(String(MIN_ID))
                    setActiveCharacteristicInputId(MIN_ID)
                    setActivePokemonId(MIN_ID)
                    setActiveCharacteristicApiId(toCharacteristicApiId(MIN_ID))
                    navigate(`/characteristic/${MIN_ID}`)
                  }}
                >
                  Mac dinh
                </button>
              </div>
            </form>
          </div>

          <div className="characteristic-status-card">
            <div className="characteristic-status-row">
              <span className="status-pill" data-state={status}>
                <span className="pulse-dot" aria-hidden="true" />
                Characteristic: {statusLabel}
              </span>
              <span className="status-pill" data-state={pokemonStatus}>
                <span className="pulse-dot" aria-hidden="true" />
                Pokemon: {pokemonStatusLabel}
              </span>
            </div>
            <div className="characteristic-meta-grid">
              <p>
                <strong>Characteristic Input:</strong> {activeCharacteristicInputId}
              </p>
              <p>
                <strong>Characteristic API:</strong> {activeCharacteristicApiId} / {CHARACTERISTIC_MAX_ID}
              </p>
              <p>
                <strong>Pokemon ID:</strong> {activePokemonId}
              </p>
            </div>
          </div>
        </section>

        {status === 'error' ? (
          <div className="notice">
            <h3>Khong the tai du lieu</h3>
            <p>{errorMessage || 'Vui long kiem tra lai ID characteristic.'}</p>
          </div>
        ) : null}

        {pokemonStatus === 'error' ? (
          <div className="notice">
            <h3>Khong the tai du lieu Pokemon</h3>
            <p>{pokemonErrorMessage || 'Vui long kiem tra lai Pokemon ID.'}</p>
          </div>
        ) : null}

        {status === 'success' && characteristic ? (
          <section className="ability-details">
            <div className="ability-card">
              <div className="characteristic-summary">
                <p className="characteristic-title">
                  Characteristic #{characteristic.id}
                </p>
                <span
                  className={`highest-stat-badge ${highestStatKey || 'unknown'}`}
                  title={moduloHint}
                  aria-label={moduloHint}
                >
                  Highest Stat: {highestStatName}
                </span>
              </div>

              <div
                className="characteristic-board"
                role="table"
                aria-label="Characteristic stat board"
              >
                <div className="board-sprite board-fade" key={`sprite-${activePokemonId}`} aria-hidden="true">
                  <BorderBeam
                    className="sprite-beam"
                    lightColor="#e4572e"
                    lightWidth={350}
                    duration={8}
                    borderWidth={2}
                  >
                    {pokemonSprite ? (
                      <img src={pokemonSprite} alt={pokemon?.name ? formatName(pokemon.name) : 'Pokemon'} />
                    ) : (
                      <img
                        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
                        alt="Pokemon icon"
                      />
                    )}
                  </BorderBeam>
                </div>

                <div className="board-stat-grid">
                  {STAT_COLUMNS.map((stat) => {
                    const isHighest = characteristic.highest_stat?.name === stat.key
                    return (
                      <div
                        key={`head-${stat.key}`}
                        className={`board-cell board-head ${stat.key}${isHighest ? ' is-highest' : ''}`}
                      >
                        {stat.label}
                      </div>
                    )
                  })}

                  {STAT_COLUMNS.map((stat) => {
                    const isHighest = characteristic.highest_stat?.name === stat.key
                    const value = getStatValue(stat.key)
                    return (
                      <div
                        key={`value-${stat.key}`}
                        className={`board-cell board-value board-fade${isHighest ? ' is-highest' : ''}`}
                        style={{ animationDelay: `${STAT_COLUMNS.findIndex((entry) => entry.key === stat.key) * 45}ms` }}
                      >
                        {value}
                      </div>
                    )
                  })}
                </div>
              </div>

              <p>
                Pokemon <strong>#{pokemon?.id ?? activePokemonId}</strong>
                {pokemon?.name ? ` (${formatName(pokemon.name)})` : ''}.
              </p>

              <p>
                Highest stat is <strong>{formatName(characteristic.highest_stat?.name)}</strong>,
                gene_modulo is <strong>{characteristic.gene_modulo ?? 'Unknown'}</strong>,
                characteristic text is <strong>"{characteristic.descriptions?.[0]?.description || 'Unknown'}"</strong>.
              </p>
            </div>
          </section>
        ) : null}
      </main>

      <footer className="footer">
        <p>Powered by PokeAPI</p>
      </footer>
    </div>
  )
}

export default CharacteristicPage