import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BorderBeam } from '../components/ui/BorderBeam'
import { formatName, spriteFor } from '../utils/pokemon'

const POKEATHLON_ENDPOINT = 'https://pokeapi.co/api/v2/pokeathlon-stat/'

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
          error instanceof Error ? error.message : 'Khong the tai du lieu'
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
    status === 'loading' ? 'Dang tai' : status === 'error' ? 'Loi' : 'San sang'

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <span className="brand-dot" />
          </div>
          <div>
            <p className="eyebrow">Pokeathlon Stat</p>
            <h1>Thong tin Pokeathlon Stat</h1>
          </div>
        </div>
      </header>

      <main>
        <section className="characteristic-hero">
          <div className="characteristic-copy">
            <p className="lead">
              Tra cuu Pokeathlon Stat bang ID hoac ten de xem natures tang/giam chi so.
            </p>
            <form
              className="characteristic-form"
              onSubmit={(event) => {
                event.preventDefault()
                if (!input.trim()) return
                setActiveQuery(input.trim().toLowerCase())
              }}
            >
              <label className="characteristic-input-group">
                <span>Pokeathlon Stat ID or Name</span>
                <input
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Vi du: 1, speed, power"
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
                    setInput('1')
                    setActiveQuery('1')
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
                Pokeathlon: {statusLabel}
              </span>
            </div>
          </div>
        </section>

        {status === 'error' ? (
          <div className="notice">
            <h3>Khong the tai du lieu</h3>
            <p>{errorMessage || 'Vui long kiem tra lai ID/ten Pokeathlon Stat.'}</p>
          </div>
        ) : null}

        {status === 'success' && stat ? (
          <section className="ability-details">
            <div className="ability-card">
              <div className="ability-meta">
                <div>
                  <span className="tag">Pokeathlon Stat</span>
                  <h2>{englishName ? formatName(englishName) : formatName(stat.name)}</h2>
                </div>
                <div className="ability-id">#{stat.id.toString().padStart(3, '0')}</div>
              </div>

              <BorderBeam className="pokeathlon-sprite-beam">
                <div className="pokeathlon-sprite-card">
                  <div className="board-sprite pokeathlon-sprite">
                    <img
                      src={pokemonSprite}
                      alt={formatName(activeQuery)}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.src =
                          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'
                      }}
                    />
                  </div>
                  <div>
                    <p className="label">Pokemon preview</p>
                    <p className="muted">Hinh anh duoc lay theo ID hoac ten da nhap.</p>
                  </div>
                </div>
              </BorderBeam>

              <div className="ability-grid pokeathlon-grid">
                <div>
                  <p className="label">API Name</p>
                  <p>{formatName(stat.name)}</p>
                </div>
                <div>
                  <p className="label">Increase count</p>
                  <p>{increaseList.length}</p>
                </div>
                <div>
                  <p className="label">Decrease count</p>
                  <p>{decreaseList.length}</p>
                </div>
                <div>
                  <p className="label">Localized names</p>
                  <p>{stat.names?.length ?? 0}</p>
                </div>
              </div>
            </div>

            <div className="ability-card">
              <div className="section-header compact">
                <div>
                  <h3>Ten theo ngon ngu</h3>
                  <p>Ten tren PokeAPI duoc tra ve theo nhieu ngon ngu khac nhau.</p>
                </div>
              </div>

              <div className="pokeathlon-name-grid">
                {Object.entries(localizedNames).map(([language, name]) => (
                  <BorderBeam key={language} className="pokeathlon-name-beam">
                    <div className="pokeathlon-name-card">
                      <span className="label">{language}</span>
                      <strong>{name}</strong>
                    </div>
                  </BorderBeam>
                ))}
                {Object.keys(localizedNames).length === 0 ? (
                  <p className="muted">Khong co ten ngon ngu nao duoc tra ve.</p>
                ) : null}
              </div>
            </div>

            <div className="ability-card">
              <div className="section-header compact">
                <div>
                  <h3>Nature tang chi so</h3>
                  <p>Cac nature nay lam tang Pokeathlon stat nay.</p>
                </div>
              </div>

              <div className="pokeathlon-nature-grid">
                {increaseList.map((entry) => (
                  <BorderBeam key={`${entry.nature.name}-inc`} className="pokeathlon-nature-beam">
                    <div className="pokeathlon-nature-card positive">
                      <strong>{formatName(entry.nature.name)}</strong>
                      <p>
                        Max change: <span>{entry.max_change}</span>
                      </p>
                    </div>
                  </BorderBeam>
                ))}
                {increaseList.length === 0 ? (
                  <p className="muted">Khong co nature tang chi so.</p>
                ) : null}
              </div>
            </div>

            <div className="ability-card">
              <div className="section-header compact">
                <div>
                  <h3>Nature giam chi so</h3>
                  <p>Cac nature nay lam giam Pokeathlon stat nay.</p>
                </div>
              </div>

              <div className="pokeathlon-nature-grid">
                {decreaseList.map((entry) => (
                  <BorderBeam key={`${entry.nature.name}-dec`} className="pokeathlon-nature-beam">
                    <div className="pokeathlon-nature-card negative">
                      <strong>{formatName(entry.nature.name)}</strong>
                      <p>
                        Max change: <span>{entry.max_change}</span>
                      </p>
                    </div>
                  </BorderBeam>
                ))}
                {decreaseList.length === 0 ? (
                  <p className="muted">Khong co nature giam chi so.</p>
                ) : null}
              </div>
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

export default PokeathlonStatPage