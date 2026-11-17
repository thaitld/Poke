import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { NAV_ITEMS } from '../config/navigation'
import { extractId, formatName, spriteFor } from '../utils/pokemon'
import './PokemonListPage.css'

const PRIMARY_ENDPOINT = 'https://pokeapi.co/api/v2/listPokemons?limit=20'
const FALLBACK_ENDPOINT = 'https://pokeapi.co/api/v2/pokemon?limit=20'

type PokemonEntry = {
  name?: string
  url?: string
}

type PokeResponse = {
  results?: PokemonEntry[]
  pokemons?: PokemonEntry[]
  pokemon?: PokemonEntry[]
  count?: number
  next?: string | null
  previous?: string | null
}

const s = (vars: Record<string, string | number>): CSSProperties => vars as unknown as CSSProperties

const extractList = (data: unknown): PokemonEntry[] => {
  if (Array.isArray(data)) {
    return data as PokemonEntry[]
  }

  if (data && typeof data === 'object') {
    const record = data as PokeResponse
    if (Array.isArray(record.results)) return record.results
    if (Array.isArray(record.pokemons)) return record.pokemons
    if (Array.isArray(record.pokemon)) return record.pokemon
  }

  return []
}

const extractMeta = (data: unknown) => {
  if (!data || typeof data !== 'object') return {}
  const record = data as PokeResponse

  return {
    count: typeof record.count === 'number' ? record.count : undefined,
    next: typeof record.next === 'string' ? record.next : record.next ?? undefined,
    previous:
      typeof record.previous === 'string' ? record.previous : record.previous ?? undefined,
  }
}

const animatedSpriteFor = (id: number | null, name?: string) => {
  if (id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`
  }
  return spriteFor(id, name)
}

function PokemonListPage() {
  const [items, setItems] = useState<PokemonEntry[]>([])
  const [meta, setMeta] = useState<{ count?: number; next?: string | null }>()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [query, setQuery] = useState('')
  const [pageUrl, setPageUrl] = useState(PRIMARY_ENDPOINT)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [endpointInUse, setEndpointInUse] = useState(PRIMARY_ENDPOINT)

  useEffect(() => {
    let isActive = true
    const append = pageUrl !== PRIMARY_ENDPOINT

    const load = async () => {
      if (append) {
        setLoadingMore(true)
      } else {
        setStatus('loading')
      }

      try {
        const response = await fetch(pageUrl)
        let data: unknown

        if (!response.ok) {
          if (pageUrl === PRIMARY_ENDPOINT) {
            const fallbackResponse = await fetch(FALLBACK_ENDPOINT)
            if (!fallbackResponse.ok) {
              throw new Error(`HTTP ${fallbackResponse.status}`)
            }
            data = (await fallbackResponse.json()) as unknown
            setEndpointInUse(FALLBACK_ENDPOINT)
          } else {
            throw new Error(`HTTP ${response.status}`)
          }
        } else {
          data = (await response.json()) as unknown
          if (pageUrl.includes('/pokemon')) {
            setEndpointInUse(FALLBACK_ENDPOINT)
          } else {
            setEndpointInUse(PRIMARY_ENDPOINT)
          }
        }
        if (!isActive) return

        const list = extractList(data)
        const metadata = extractMeta(data)

        setItems((prev) => (append ? [...prev, ...list] : list))
        setMeta({ count: metadata.count, next: metadata.next ?? null })
        setStatus('success')
        setErrorMessage('')
      } catch (error) {
        if (!isActive) return
        setStatus('error')
        setErrorMessage(
          error instanceof Error ? error.message : 'Không thể tải dữ liệu từ PokeAPI.'
        )
      } finally {
        if (isActive) {
          setLoadingMore(false)
        }
      }
    }

    load()

    return () => {
      isActive = false
    }
  }, [pageUrl, refreshKey])

  const filtered = useMemo(() => {
    if (!query.trim()) return items
    const lower = query.trim().toLowerCase()
    return items.filter(
      (item) =>
        item.name?.toLowerCase().includes(lower) ||
        item.url?.toLowerCase().includes(lower)
    )
  }, [items, query])

  const handleRefresh = () => {
    setItems([])
    setMeta(undefined)
    setPageUrl(PRIMARY_ENDPOINT)
    setEndpointInUse(PRIMARY_ENDPOINT)
    setRefreshKey((value) => value + 1)
  }

  const totalCount = meta?.count ?? items.length
  const statusLabel =
    status === 'loading' ? 'Đang tải' : status === 'error' ? 'Lỗi kết nối' : 'Sẵn sàng'

  return (
    <div className="pl-page">
      {/* Synchronized Top Header */}
      <header className="pl-header">
        <nav className="pl-nav" aria-label="Điều hướng chính">
          <Link to="/" className="pl-wordmark">
            <img src="/assets/logo.jpg" alt="Poke Hub Logo" className="pl-wordmark-logo" />
            <span>Poke Hub</span>
          </Link>

          <ul className="pl-nav-links">
            {NAV_ITEMS.filter((item) => !item.isAction).map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`pl-link${item.path === '/pokemon' ? ' is-active' : ''}`}
                  title={item.labelVi}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link to="/battle" className="pl-btn">
            Battle Sim
          </Link>
        </nav>
      </header>

      <main>
        {/* Hero & Live Filter Console */}
        <section className="pl-hero" aria-labelledby="pl-hero-title">
          <div className="pl-hero-card">
            <div>
              <h1 id="pl-hero-title" className="pl-display pl-lines">
                <span className="pl-line">
                  <span data-line style={s({ '--i': 0 })}>
                    Danh bạ Quốc gia
                  </span>
                </span>
                <span className="pl-line">
                  <span data-line style={s({ '--i': 1 })}>
                    1.302 loài Pokémon
                  </span>
                </span>
              </h1>
              <p className="pl-lead" data-load style={s({ '--d': '160ms', marginTop: '1rem' })}>
                Truy vấn trực tiếp từ PokeAPI v2 với cơ chế chuyển mạch dự phòng tự động và lọc tức
                thời theo tên hoặc mã số loài.
              </p>
            </div>

            <form
              className="pl-search-form"
              data-load
              style={s({ '--d': '240ms' })}
              onSubmit={(event) => {
                event.preventDefault()
              }}
            >
              <label className="pl-input-wrap">
                <span className="pl-input-label">Tìm kiếm Pokémon</span>
                <input
                  className="pl-input"
                  type="search"
                  placeholder="Nhập tên (vd: pikachu, charizard) hoặc mã số..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>

              <div className="pl-form-actions">
                <button
                  className="pl-btn pl-btn-ghost"
                  type="button"
                  onClick={() => setQuery('')}
                  disabled={!query}
                >
                  Xóa lọc
                </button>
                <button className="pl-btn" type="button" onClick={handleRefresh}>
                  Tải lại
                </button>
              </div>
            </form>
          </div>

          <aside
            className="pl-telemetry-stage"
            data-ui
            data-load
            style={s({ '--d': '200ms' })}
            aria-label="Trạng thái kết nối PokeAPI"
          >
            <div className="pl-telemetry-head">
              <h2 className="pl-telemetry-title">Luồng dữ liệu PokeAPI v2</h2>
              <span className="pl-status-pill" data-state={status}>
                <span className="pl-pulse-beacon" aria-hidden="true" />
                {statusLabel}
              </span>
            </div>

            <div className="pl-telemetry-metrics">
              <div className="pl-metric-cell">
                <span className="pl-metric-lbl">Tổng số loài</span>
                <span className="pl-metric-val">{totalCount}</span>
              </div>
              <div className="pl-metric-cell">
                <span className="pl-metric-lbl">Đã nạp</span>
                <span className="pl-metric-val">{items.length}</span>
              </div>
              <div className="pl-metric-cell">
                <span className="pl-metric-lbl">Đang lọc</span>
                <span className="pl-metric-val">{filtered.length}</span>
              </div>
            </div>

            <div className="pl-endpoint-box">
              <span className="pl-metric-lbl">Cổng kết nối hiện hành</span>
              <code className="pl-endpoint-url">{endpointInUse}</code>
            </div>
          </aside>
        </section>

        {/* Catalog Grid */}
        <section className="pl-catalog" aria-labelledby="pl-catalog-title">
          <div className="pl-catalog-header">
            <div>
              <h2 id="pl-catalog-title" className="pl-head">
                Danh sách mẫu vật
              </h2>
              <p className="pl-catalog-sub">
                Hiển thị {filtered.length} trên tổng số {totalCount} loài Pokémon đã ghi nhận.
              </p>
            </div>
            {meta?.next && (
              <button
                className="pl-btn"
                type="button"
                onClick={() => setPageUrl(meta.next ?? endpointInUse)}
                disabled={loadingMore}
              >
                {loadingMore ? 'Đang tải...' : 'Tải thêm 20 loài'}
              </button>
            )}
          </div>

          <div className="pl-grid">
            {status === 'loading' && items.length === 0
              ? Array.from({ length: 8 }).map((_, index) => (
                  <div className="pl-card pl-skeleton" key={`skeleton-${index}`}>
                    <div className="pl-skeleton-box" />
                    <div className="pl-skeleton-line" />
                    <div className="pl-skeleton-line short" />
                  </div>
                ))
              : null}

            {status === 'error' ? (
              <div className="pl-notice">
                <h3>Không thể tải dữ liệu</h3>
                <p>{errorMessage || 'Vui lòng kiểm tra lại kết nối mạng hoặc thử tải lại.'}</p>
              </div>
            ) : null}

            {status === 'success' && items.length === 0 ? (
              <div className="pl-notice">
                <h3>Chưa có dữ liệu</h3>
                <p>Cổng API không trả về danh sách Pokémon nào.</p>
              </div>
            ) : null}

            {status !== 'error' && filtered.length === 0 && items.length > 0 ? (
              <div className="pl-notice">
                <h3>Không tìm thấy Pokémon phù hợp</h3>
                <p>Hãy thử từ khóa khác hoặc nhấn Xóa lọc để xem lại danh sách.</p>
              </div>
            ) : null}

            {filtered.map((item, index) => {
              const id = extractId(item.url)
              const primarySprite = animatedSpriteFor(id, item.name)
              const fallbackSprite = spriteFor(id, item.name)
              return (
                <article
                  className="pl-card pl-card-animate"
                  key={`${item.name}-${index}`}
                  style={s({ '--stagger': `${(index % 20) * 30}ms` })}
                >
                  <div className="pl-card-meta">
                    <span className="pl-card-id">
                      {id ? `#${id.toString().padStart(4, '0')}` : '---'}
                    </span>
                    <span className="pl-card-index">
                      Mục {index + 1}
                    </span>
                  </div>

                  <div className="pl-card-aperture">
                    <span className="pl-aperture-sweep" aria-hidden="true" />
                    {primarySprite ? (
                      <img
                        className="pl-sprite"
                        src={primarySprite}
                        alt={item.name ? `${formatName(item.name)} sprite` : 'Pokémon'}
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
                    ) : (
                      <span className="pl-sprite-fallback">Chưa có ảnh</span>
                    )}
                  </div>

                  <div className="pl-card-body">
                    <h3 className="pl-card-name">{formatName(item.name)}</h3>
                    <p className="pl-card-slug" title={item.url}>
                      {item.url ? item.url.replace('https://pokeapi.co/api/v2', '') : 'Không có đường dẫn'}
                    </p>
                  </div>
                </article>
              )
            })}
          </div>

          <div className="pl-load-more-bar">
            <div className="pl-load-more-copy">
              <h3>Trạng thái đồng bộ</h3>
              <p>
                {status === 'success'
                  ? `Đã nạp ${items.length} / ${totalCount} loài từ PokeAPI v2.`
                  : 'Đang chờ phản hồi từ máy chủ dữ liệu.'}
              </p>
            </div>
            <div className="pl-form-actions">
              {meta?.next && (
                <button
                  className="pl-btn"
                  type="button"
                  onClick={() => setPageUrl(meta.next ?? endpointInUse)}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Đang tải...' : 'Tải thêm 20 loài'}
                </button>
              )}
              <button className="pl-btn pl-btn-ghost" type="button" onClick={handleRefresh}>
                Tải lại từ đầu
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="pl-footer">
        <Link to="/" className="pl-wordmark">
          <img src="/assets/logo.jpg" alt="Poke Hub Logo" className="pl-wordmark-logo" />
          <span>Poke Hub</span>
        </Link>
        <p className="pl-footer-note">
          Poke Hub · Đồng bộ dữ liệu thời gian thực từ PokeAPI v2
        </p>
      </footer>
    </div>
  )
}

export default PokemonListPage
