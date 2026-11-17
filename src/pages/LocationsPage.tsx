import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BorderBeam } from '../components/ui/BorderBeam'
import { formatName } from '../utils/pokemon'

const LOCATION_ENDPOINT = 'https://pokeapi.co/api/v2/location/'
const LOCATION_LIST_ENDPOINT = 'https://pokeapi.co/api/v2/location?limit=24'
const PREVIEW_LIMIT = 24

type NamedResource = {
  name?: string
  url?: string
}

type LocalizedName = {
  name?: string
  language?: NamedResource
}

type GameIndexEntry = {
  game_index?: number
  generation?: NamedResource
}

type LocationResponse = {
  id: number
  name: string
  region?: NamedResource
  names?: LocalizedName[]
  game_indices?: GameIndexEntry[]
  areas?: NamedResource[]
}

type LocationListResponse = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: NamedResource[]
}

function LocationsPage() {
  const { idOrName } = useParams<{ idOrName?: string }>()
  const initialQuery = (idOrName ?? '1').trim().toLowerCase() || '1'

  const [input, setInput] = useState(initialQuery)
  const [activeQuery, setActiveQuery] = useState(initialQuery)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [location, setLocation] = useState<LocationResponse | null>(null)

  const [listUrl, setListUrl] = useState(LOCATION_LIST_ENDPOINT)
  const [listStatus, setListStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [listError, setListError] = useState('')
  const [locationList, setLocationList] = useState<NamedResource[]>([])
  const [listMeta, setListMeta] = useState<{
    count?: number
    next?: string | null
    previous?: string | null
  }>({})

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
        const response = await fetch(`${LOCATION_ENDPOINT}${clean}/`)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = (await response.json()) as LocationResponse
        if (!isActive) return

        setLocation(data)
        setStatus('success')
      } catch (error) {
        if (!isActive) return
        setStatus('error')
        setLocation(null)
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

  useEffect(() => {
    let isActive = true

    const loadList = async () => {
      setListStatus('loading')
      setListError('')

      try {
        const response = await fetch(listUrl)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = (await response.json()) as LocationListResponse
        if (!isActive) return

        setLocationList(data.results ?? [])
        setListMeta({
          count: data.count,
          next: data.next ?? null,
          previous: data.previous ?? null,
        })
        setListStatus('success')
      } catch (error) {
        if (!isActive) return
        setListStatus('error')
        setLocationList([])
        setListError(
          error instanceof Error ? error.message : 'Khong the tai danh sach location'
        )
      }
    }

    loadList()

    return () => {
      isActive = false
    }
  }, [listUrl])

  const englishName = useMemo(() => {
    return location?.names?.find((entry) => entry.language?.name === 'en')?.name
  }, [location])

  const names = location?.names ?? []
  const gameIndices = location?.game_indices ?? []
  const areas = location?.areas ?? []

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <span className="brand-dot" />
          </div>
          <div>
            <p className="eyebrow">Games Group</p>
            <h1>Locations</h1>
          </div>
        </div>
      </header>

      <main>
        <section className="characteristic-hero">
          <div className="characteristic-copy">
            <p className="lead">
              Locations la cac khu vuc co the tham quan trong game, nhu city hoac route.
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
                <span>Location ID or Name</span>
                <input
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Vi du: 1, canalave-city"
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
                Location: {status === 'loading' ? 'Dang tai' : status === 'error' ? 'Loi' : 'San sang'}
              </span>
              <span className="status-pill" data-state={listStatus}>
                <span className="pulse-dot" aria-hidden="true" />
                List: {listStatus === 'loading' ? 'Dang tai' : listStatus === 'error' ? 'Loi' : 'San sang'}
              </span>
            </div>

            <div className="characteristic-meta-grid">
              <p>
                <strong>Location query:</strong> {activeQuery}
              </p>
              <p>
                <strong>List total:</strong> {listMeta.count ?? 0}
              </p>
              <p>
                <strong>Endpoint:</strong> {LOCATION_ENDPOINT}
                {'{id or name}/'}
              </p>
            </div>
          </div>
        </section>

        <section className="locations-layout">
          <div className="ability-card">
            <div className="section-header compact">
              <div>
                <h3>Location List</h3>
                <p>
                  Hien thi {locationList.length} location trong trang hien tai.
                </p>
              </div>
            </div>

            {listStatus === 'error' ? <p className="muted">{listError}</p> : null}

            <div className="locations-list">
              {locationList.map((item) => {
                const isActive = item.name === location?.name
                return (
                  <button
                    key={item.name}
                    type="button"
                    className={`location-item${isActive ? ' is-active' : ''}`}
                    onClick={() => {
                      const next = item.name ?? '1'
                      setInput(next)
                      setActiveQuery(next)
                    }}
                  >
                    <span>{formatName(item.name)}</span>
                  </button>
                )
              })}
              {listStatus === 'success' && locationList.length === 0 ? (
                <p className="muted">Khong co location nao.</p>
              ) : null}
            </div>

            <div className="characteristic-actions">
              <button
                className="btn ghost"
                type="button"
                disabled={!listMeta.previous}
                onClick={() => setListUrl(listMeta.previous ?? LOCATION_LIST_ENDPOINT)}
              >
                Trang truoc
              </button>
              <button
                className="btn primary"
                type="button"
                disabled={!listMeta.next}
                onClick={() => setListUrl(listMeta.next ?? LOCATION_LIST_ENDPOINT)}
              >
                Trang sau
              </button>
            </div>
          </div>

          <div className="ability-details">
            {status === 'error' ? (
              <div className="notice">
                <h3>Khong the tai du lieu</h3>
                <p>{errorMessage || 'Vui long kiem tra lai location ID/ten.'}</p>
              </div>
            ) : null}

            {status === 'success' && location ? (
              <>
                <div className="ability-card">
                  <div className="ability-meta">
                    <div>
                      <span className="tag">Location</span>
                      <h2>{formatName(englishName ?? location.name)}</h2>
                    </div>
                    <div className="ability-id">#{location.id.toString().padStart(3, '0')}</div>
                  </div>

                  <div className="ability-grid">
                    <div>
                      <p className="label">API Name</p>
                      <p>{formatName(location.name)}</p>
                    </div>
                    <div>
                      <p className="label">Region</p>
                      <p>{formatName(location.region?.name)}</p>
                    </div>
                    <div>
                      <p className="label">Names</p>
                      <p>{names.length}</p>
                    </div>
                    <div>
                      <p className="label">Game Indices</p>
                      <p>{gameIndices.length}</p>
                    </div>
                    <div>
                      <p className="label">Areas</p>
                      <p>{areas.length}</p>
                    </div>
                  </div>
                </div>

                <div className="ability-card">
                  <div className="section-header compact">
                    <div>
                      <h3>Localized Names</h3>
                      <p>Ten location theo ngon ngu trong API.</p>
                    </div>
                  </div>

                  <div className="generation-grid">
                    {names.slice(0, PREVIEW_LIMIT).map((entry) => (
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
                    {names.length === 0 ? <p className="muted">Khong co du lieu.</p> : null}
                  </div>
                </div>

                <div className="ability-card">
                  <div className="section-header compact">
                    <div>
                      <h3>Game Indices</h3>
                      <p>Cac generation co chua location nay.</p>
                    </div>
                  </div>

                  <div className="generation-grid">
                    {gameIndices.slice(0, PREVIEW_LIMIT).map((entry, index) => (
                      <BorderBeam
                        key={`${entry.generation?.name}-${entry.game_index}-${index}`}
                        className="generation-beam"
                      >
                        <div className="generation-item">
                          <p className="generation-item-name">{formatName(entry.generation?.name)}</p>
                          <p className="generation-item-url">Game index: {entry.game_index}</p>
                        </div>
                      </BorderBeam>
                    ))}
                    {gameIndices.length === 0 ? <p className="muted">Khong co du lieu.</p> : null}
                  </div>
                </div>

                <div className="ability-card">
                  <div className="section-header compact">
                    <div>
                      <h3>Areas</h3>
                      <p>Danh sach location-area cua location nay.</p>
                    </div>
                  </div>

                  <div className="generation-grid">
                    {areas.slice(0, PREVIEW_LIMIT).map((entry) => (
                      <BorderBeam key={entry.name} className="generation-beam">
                        <div className="generation-item">
                          <p className="generation-item-name">{formatName(entry.name)}</p>
                          <p className="generation-item-url">{entry.url}</p>
                        </div>
                      </BorderBeam>
                    ))}
                    {areas.length === 0 ? <p className="muted">Khong co du lieu.</p> : null}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Powered by PokeAPI</p>
      </footer>
    </div>
  )
}

export default LocationsPage