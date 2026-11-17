import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BorderBeam } from '../components/ui/BorderBeam'
import { extractId, formatName, spriteFor } from '../utils/pokemon'

const POKEDEX_ENDPOINT = 'https://pokeapi.co/api/v2/pokedex/'
const PREVIEW_LIMIT = 30

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

const artworkFor = (id: number | null, name?: string) => {
  if (id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
  }
  if (name) {
    return `https://img.pokemondb.net/sprites/home/normal/${name.toLowerCase()}.png`
  }
  return ''
}

function PokedexPage() {
  const { idOrName } = useParams<{ idOrName?: string }>()
  const initialQuery = (idOrName ?? 'kanto').trim().toLowerCase() || 'kanto'

  const [input, setInput] = useState(initialQuery)
  const [activeQuery, setActiveQuery] = useState(initialQuery)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [pokedex, setPokedex] = useState<PokedexResponse | null>(null)
  const [selectedEntryNumber, setSelectedEntryNumber] = useState<number | null>(null)
  const [sortMode, setSortMode] = useState<'number' | 'name'>('number')

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
    return pokedex?.names?.find((item) => item.language?.name === 'en')?.name
  }, [pokedex])

  const englishDescription = useMemo(() => {
    return pokedex?.descriptions?.find((item) => item.language?.name === 'en')?.description
  }, [pokedex])

  const pokemonEntries = useMemo(() => pokedex?.pokemon_entries ?? [], [pokedex])
  const versionGroups = pokedex?.version_groups ?? []
  const localizedNames = pokedex?.names ?? []
  const statusLabel =
    status === 'loading' ? 'Dang tai' : status === 'error' ? 'Loi' : 'San sang'

  const sortedEntries = useMemo(() => {
    const clone = [...pokemonEntries]
    if (sortMode === 'name') {
      clone.sort((a, b) =>
        (a.pokemon_species?.name ?? '').localeCompare(b.pokemon_species?.name ?? '')
      )
      return clone
    }

    clone.sort((a, b) => (a.entry_number ?? 0) - (b.entry_number ?? 0))
    return clone
  }, [pokemonEntries, sortMode])

  const selectedEntry = useMemo(() => {
    if (!sortedEntries.length) return null
    if (selectedEntryNumber == null) return sortedEntries[0]
    return (
      sortedEntries.find((entry) => entry.entry_number === selectedEntryNumber) ??
      sortedEntries[0]
    )
  }, [sortedEntries, selectedEntryNumber])

  const selectedSpeciesName = selectedEntry?.pokemon_species?.name
  const selectedSpeciesId = extractId(selectedEntry?.pokemon_species?.url)
  const selectedArtwork = artworkFor(selectedSpeciesId, selectedSpeciesName)
  const selectedSprite = spriteFor(selectedSpeciesId, selectedSpeciesName)

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <img src="/assets/logo.jpg" alt="Poke Hub Logo" className="brand-logo-img" />
          </div>
          <div>
            <p className="eyebrow">Games Group</p>
            <h1>Pokedexes</h1>
          </div>
        </div>
      </header>

      <main>
        <section className="characteristic-hero">
          <div className="characteristic-copy">
            <p className="lead">
              Pokedex luu thong tin Pokemon theo region. Ban co the tra cuu bang ID hoac ten nhu kanto, national, original-johto.
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
                <span>Pokedex ID or Name</span>
                <input
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Vi du: 2, kanto, national"
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
                    setInput('kanto')
                    setActiveQuery('kanto')
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
                Pokedex: {statusLabel}
              </span>
            </div>

            <div className="characteristic-meta-grid">
              <p>
                <strong>Active Query:</strong> {activeQuery}
              </p>
              <p>
                <strong>Endpoint:</strong> {POKEDEX_ENDPOINT}
                {'{id or name}/'}
              </p>
              <p>
                <strong>Request URL:</strong> {POKEDEX_ENDPOINT}
                {activeQuery}/
              </p>
            </div>
          </div>
        </section>

        {status === 'error' ? (
          <div className="notice">
            <h3>Khong the tai du lieu</h3>
            <p>{errorMessage || 'Vui long kiem tra lai pokedex ID/ten.'}</p>
          </div>
        ) : null}

        {status === 'success' && pokedex ? (
          <section className="ability-details">
            <div className="ability-card pokedex-console">
              <div className="pokedex-console-left">
                <div className="pokedex-screen">
                  <p className="pokedex-screen-title">{formatName(englishName ?? pokedex.name)}</p>
                  <p className="pokedex-screen-subtitle">
                    Region {formatName(pokedex.region?.name)} · {pokedex.is_main_series ? 'Main Series' : 'Side Dex'}
                  </p>

                  <div className="pokedex-selected-art">
                    <img
                      src={selectedArtwork || selectedSprite || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'}
                      alt={formatName(selectedSpeciesName)}
                      onError={(event) => {
                        event.currentTarget.src =
                          selectedSprite ||
                          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'
                      }}
                    />
                  </div>

                  <div className="pokedex-selected-meta">
                    <span>
                      #{String(selectedEntry?.entry_number ?? 0).padStart(3, '0')}
                    </span>
                    <strong>{formatName(selectedSpeciesName)}</strong>
                  </div>
                </div>

                <div className="pokedex-flavor">
                  <p>{englishDescription || 'No english description found for this pokedex.'}</p>
                </div>
              </div>

              <div className="pokedex-console-right">
                <div className="pokedex-console-toolbar">
                  <p>
                    Dex #{pokedex.id.toString().padStart(3, '0')} · {pokemonEntries.length} entries
                  </p>
                  <button
                    className="btn ghost"
                    type="button"
                    onClick={() => setSortMode((mode) => (mode === 'number' ? 'name' : 'number'))}
                  >
                    Sort by {sortMode === 'number' ? 'name' : 'number'}
                  </button>
                </div>

                <div className="pokedex-console-grid" role="list">
                  {sortedEntries.slice(0, PREVIEW_LIMIT).map((entry) => {
                    const speciesName = entry.pokemon_species?.name
                    const speciesId = extractId(entry.pokemon_species?.url)
                    const sprite = spriteFor(speciesId, speciesName)
                    const isActive = entry.entry_number === selectedEntry?.entry_number

                    return (
                      <button
                        key={`${entry.entry_number}-${speciesName}`}
                        type="button"
                        className={`pokedex-tile${isActive ? ' is-active' : ''}`}
                        onClick={() => setSelectedEntryNumber(entry.entry_number ?? null)}
                      >
                        <div className="pokedex-tile-image">
                          {sprite ? (
                            <img
                              src={sprite}
                              alt={formatName(speciesName)}
                              loading="lazy"
                              onError={(event) => {
                                event.currentTarget.src =
                                  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'
                              }}
                            />
                          ) : (
                            <span>?</span>
                          )}
                        </div>
                        <p className="pokedex-tile-number">
                          {String(entry.entry_number ?? 0).padStart(3, '0')}
                        </p>
                      </button>
                    )
                  })}

                  {sortedEntries.length === 0 ? (
                    <p className="muted">Khong co du lieu Pokemon entries.</p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="ability-card">
              <div className="section-header compact">
                <div>
                  <h3>Thong tin bo sung</h3>
                  <p>Ten da ngon ngu va version groups cua Pokedex.</p>
                </div>
              </div>

              <div className="ability-grid">
                <div>
                  <p className="label">Localized Names</p>
                  <p>{localizedNames.length}</p>
                </div>
                <div>
                  <p className="label">Version Groups</p>
                  <p>{versionGroups.length}</p>
                </div>
                <div>
                  <p className="label">Sort Mode</p>
                  <p>{sortMode}</p>
                </div>
              </div>

              <div className="generation-grid">
                {versionGroups.map((item) => (
                  <BorderBeam key={item.name} className="generation-beam">
                    <div className="generation-item">
                      <p className="generation-item-name">{formatName(item.name)}</p>
                      <p className="generation-item-url">{item.url}</p>
                    </div>
                  </BorderBeam>
                ))}
                {versionGroups.length === 0 ? <p className="muted">Khong co du lieu.</p> : null}
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

export default PokedexPage