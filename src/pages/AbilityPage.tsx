import { useEffect, useMemo, useState } from 'react'
import { extractId, formatName, spriteFor } from '../utils/pokemon'
import { BorderBeam } from '../components/ui/BorderBeam'

const ABILITY_ENDPOINT = 'https://pokeapi.co/api/v2/ability/'

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

function AbilityPage() {
  const [input, setInput] = useState('1')
  const [activeQuery, setActiveQuery] = useState('1')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [ability, setAbility] = useState<AbilityResponse | null>(null)

  useEffect(() => {
    let isActive = true
    const clean = activeQuery.trim().toLowerCase()
    if (!clean) return

    const load = async () => {
      setStatus('loading')
      setErrorMessage('')

      try {
        const response = await fetch(`${ABILITY_ENDPOINT}${clean}/`)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = (await response.json()) as AbilityResponse
        if (!isActive) return

        setAbility(data)
        setStatus('success')
      } catch (error) {
        if (!isActive) return
        setStatus('error')
        setAbility(null)
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

  const englishEffect = useMemo(() => {
    return ability?.effect_entries?.find((entry) => entry.language?.name === 'en')
  }, [ability])

  const englishFlavor = useMemo(() => {
    return ability?.flavor_text_entries?.find(
      (entry) => entry.language?.name === 'en'
    )
  }, [ability])

  const pokemonList = ability?.pokemon ?? []
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
            <p className="eyebrow">Ability Lens</p>
            <h1>Thong tin Ability</h1>
          </div>
        </div>
      </header>

      <main>
        <section className="characteristic-hero">
          <div className="characteristic-copy">
            <p className="lead">
              Nhap ID hoac ten ability de lay thong tin chi tiet.
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
                <span>Ability ID or Name</span>
                <input
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Vi du: 1, stench, overgrow"
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
                Ability: {statusLabel}
              </span>
            </div>

            <div className="characteristic-meta-grid">
              <p>
                <strong>Active Query:</strong> {activeQuery}
              </p>
              <p>
                <strong>Endpoint:</strong> {ABILITY_ENDPOINT}
                {'{id or name}/'}
              </p>
              <p>
                <strong>Request URL:</strong> {ABILITY_ENDPOINT}
                {activeQuery}/
              </p>
            </div>
          </div>
        </section>

        {status === 'error' ? (
          <div className="notice">
            <h3>Khong the tai du lieu</h3>
            <p>
              {errorMessage || 'Vui long kiem tra lai ID/ten ability.'}
            </p>
          </div>
        ) : null}

        {status === 'success' && ability ? (
          <section className="ability-details">
            <div className="ability-card">
              <div className="ability-meta">
                <div>
                  <span className="tag">Ability</span>
                  <h2>{formatName(ability.name)}</h2>
                </div>
                <div className="ability-id">
                  #{ability.id.toString().padStart(3, '0')}
                </div>
              </div>
              <div className="ability-grid">
                <div>
                  <p className="label">Generation</p>
                  <p>{ability.generation?.name ? formatName(ability.generation.name) : 'Unknown'}</p>
                </div>
                <div>
                  <p className="label">Main Series</p>
                  <p>{ability.is_main_series ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="label">Pokemon count</p>
                  <p>{pokemonList.length}</p>
                </div>
              </div>
            </div>

            <div className="ability-card">
              <h3>Effect</h3>
              <p>{englishEffect?.short_effect || 'No effect entry found.'}</p>
              {englishEffect?.effect ? (
                <p className="muted">{englishEffect.effect}</p>
              ) : null}
            </div>

            <div className="ability-card">
              <h3>Flavor</h3>
              <p>{englishFlavor?.flavor_text?.replace(/\s+/g, ' ') || 'No flavor text.'}</p>
            </div>

            <div className="ability-card">
              <div className="section-header compact">
                <div>
                  <h3>Pokemon co Ability nay</h3>
                  <p>Danh sach duoi day duoc lay tu API.</p>
                </div>
              </div>
              <div className="ability-pokemon-grid">
                {pokemonList.slice(0, 24).map((entry) => {
                  const id = extractId(entry.pokemon.url)
                  const sprite = spriteFor(id, entry.pokemon.name)
                  return (
                    <BorderBeam
                      key={entry.pokemon.name}
                      className="ability-pokemon-beam"
                    >
                      <div className="ability-pokemon">
                        <div className="pokemon-image">
                          {sprite ? (
                            <img
                              src={sprite}
                              alt={formatName(entry.pokemon.name)}
                              loading="lazy"
                            />
                          ) : (
                            <div className="pokemon-placeholder">No image</div>
                          )}
                        </div>
                        <div>
                          <p className="ability-name">{formatName(entry.pokemon.name)}</p>
                          <p className="muted">Slot {entry.slot}{entry.is_hidden ? ' · Hidden' : ''}</p>
                        </div>
                      </div>
                    </BorderBeam>
                  )
                })}
                {pokemonList.length === 0 ? (
                  <p className="muted">Khong co Pokemon nao cho ability nay.</p>
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

export default AbilityPage

