import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BorderBeam } from '../components/ui/BorderBeam'
import { formatName } from '../utils/pokemon'

const GENERATION_ENDPOINT = 'https://pokeapi.co/api/v2/generation/'
const PREVIEW_LIMIT = 24

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

const getEnglishName = (entries?: LocalizedName[]) => {
  return entries?.find((entry) => entry.language?.name === 'en')?.name
}

function GenerationPage() {
  const { idOrName } = useParams<{ idOrName?: string }>()
  const initialQuery = (idOrName ?? '1').trim().toLowerCase() || '1'

  const [input, setInput] = useState(initialQuery)
  const [activeQuery, setActiveQuery] = useState(initialQuery)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [generation, setGeneration] = useState<GenerationResponse | null>(null)

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
          error instanceof Error ? error.message : 'Khong the tai du lieu'
        )
      }
    }

    load()

    return () => {
      isActive = false
    }
  }, [activeQuery])

  const titleName = useMemo(() => {
    return getEnglishName(generation?.names) ?? generation?.name
  }, [generation])

  const abilities = generation?.abilities ?? []
  const moves = generation?.moves ?? []
  const species = generation?.pokemon_species ?? []
  const types = generation?.types ?? []
  const versionGroups = generation?.version_groups ?? []
  const localizedNames = generation?.names ?? []

  const statusLabel =
    status === 'loading' ? 'Dang tai' : status === 'error' ? 'Loi' : 'San sang'

  const renderResourceGrid = (label: string, items: NamedResource[]) => {
    return (
      <div className="ability-card">
        <div className="section-header compact">
          <div>
            <h3>{label}</h3>
            <p>
              Tong {items.length} muc, hien thi toi da {Math.min(items.length, PREVIEW_LIMIT)} muc.
            </p>
          </div>
        </div>

        <div className="generation-grid">
          {items.slice(0, PREVIEW_LIMIT).map((item) => (
            <BorderBeam key={`${label}-${item.name}`} className="generation-beam">
              <div className="generation-item">
                <p className="generation-item-name">{formatName(item.name)}</p>
                <p className="generation-item-url">{item.url}</p>
              </div>
            </BorderBeam>
          ))}

          {items.length === 0 ? <p className="muted">Khong co du lieu.</p> : null}
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <span className="brand-dot" />
          </div>
          <div>
            <p className="eyebrow">Games Group</p>
            <h1>Generations</h1>
          </div>
        </div>
      </header>

      <main>
        <section className="characteristic-hero">
          <div className="characteristic-copy">
            <p className="lead">
              A generation gom cac game Pokemon theo tung doi voi bo Pokemon, moves, abilities va types rieng.
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
                <span>Generation ID or Name</span>
                <input
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Vi du: 1, generation-i, generation-v"
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
                Generation: {statusLabel}
              </span>
            </div>

            <div className="characteristic-meta-grid">
              <p>
                <strong>Active Query:</strong> {activeQuery}
              </p>
              <p>
                <strong>Endpoint:</strong> {GENERATION_ENDPOINT}{'{id or name}/'}
              </p>
              <p>
                <strong>Request URL:</strong> {GENERATION_ENDPOINT}
                {activeQuery}/
              </p>
            </div>
          </div>
        </section>

        {status === 'error' ? (
          <div className="notice">
            <h3>Khong the tai du lieu</h3>
            <p>{errorMessage || 'Vui long kiem tra lai generation ID/ten.'}</p>
          </div>
        ) : null}

        {status === 'success' && generation ? (
          <section className="ability-details">
            <div className="ability-card">
              <div className="ability-meta">
                <div>
                  <span className="tag">Generation</span>
                  <h2>{formatName(titleName)}</h2>
                </div>
                <div className="ability-id">#{generation.id.toString().padStart(2, '0')}</div>
              </div>

              <div className="ability-grid">
                <div>
                  <p className="label">API Name</p>
                  <p>{formatName(generation.name)}</p>
                </div>
                <div>
                  <p className="label">Main region</p>
                  <p>{formatName(generation.main_region?.name)}</p>
                </div>
                <div>
                  <p className="label">Abilities</p>
                  <p>{abilities.length}</p>
                </div>
                <div>
                  <p className="label">Moves</p>
                  <p>{moves.length}</p>
                </div>
                <div>
                  <p className="label">Pokemon species</p>
                  <p>{species.length}</p>
                </div>
                <div>
                  <p className="label">Types</p>
                  <p>{types.length}</p>
                </div>
                <div>
                  <p className="label">Version groups</p>
                  <p>{versionGroups.length}</p>
                </div>
                <div>
                  <p className="label">Localized names</p>
                  <p>{localizedNames.length}</p>
                </div>
              </div>
            </div>

            <div className="ability-card">
              <div className="section-header compact">
                <div>
                  <h3>Ten theo ngon ngu</h3>
                  <p>Danh sach ten generation theo language trong PokeAPI.</p>
                </div>
              </div>

              <div className="generation-grid">
                {localizedNames.map((entry) => (
                  <BorderBeam
                    key={`${entry.language?.name}-${entry.name}`}
                    className="generation-beam"
                  >
                    <div className="generation-item">
                      <p className="generation-item-name">{entry.name}</p>
                      <p className="generation-item-url">Lang: {entry.language?.name}</p>
                    </div>
                  </BorderBeam>
                ))}
                {localizedNames.length === 0 ? <p className="muted">Khong co du lieu.</p> : null}
              </div>
            </div>

            {renderResourceGrid('Abilities', abilities)}
            {renderResourceGrid('Moves', moves)}
            {renderResourceGrid('Pokemon Species', species)}
            {renderResourceGrid('Types', types)}
            {renderResourceGrid('Version Groups', versionGroups)}
          </section>
        ) : null}
      </main>

      <footer className="footer">
        <p>Powered by PokeAPI</p>
      </footer>
    </div>
  )
}

export default GenerationPage