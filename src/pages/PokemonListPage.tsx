import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { NAV_ITEMS } from '../config/navigation'
import { extractId, formatName, spriteFor } from '../utils/pokemon'
import './PokemonListPage.css'

const PAGE_SIZE = 20
const API_BASE = 'https://pokeapi.co/api/v2/pokemon'

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

const buildPageTokens = (current: number, total: number): Array<number | 'ellipsis'> => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const tokens: Array<number | 'ellipsis'> = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  if (start > 2) tokens.push('ellipsis')
  for (let p = start; p <= end; p++) {
    tokens.push(p)
  }
  if (end < total - 1) tokens.push('ellipsis')
  tokens.push(total)

  return tokens
}

function PokemonListPage() {
  const catalogRef = useRef<HTMLElement>(null)
  const [items, setItems] = useState<PokemonEntry[]>([])
  const [totalApiCount, setTotalApiCount] = useState<number | undefined>(undefined)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [query, setQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let isActive = true
    const offset = (currentPage - 1) * PAGE_SIZE
    const targetUrl = `${API_BASE}?limit=${PAGE_SIZE}&offset=${offset}`

    const load = async () => {
      setStatus('loading')

      try {
        const response = await fetch(targetUrl)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        const data = (await response.json()) as unknown

        if (!isActive) return

        const list = extractList(data)
        const metadata = extractMeta(data)

        setItems(list)
        if (typeof metadata.count === 'number') {
          setTotalApiCount(metadata.count)
        }
        setStatus('success')
        setErrorMessage('')
      } catch (error) {
        if (!isActive) return
        setStatus('error')
        setErrorMessage(
          error instanceof Error ? error.message : 'Không thể tải dữ liệu từ PokeAPI.'
        )
      }
    }

    load()

    return () => {
      isActive = false
    }
  }, [currentPage, refreshKey])

  const filtered = useMemo(() => {
    if (!query.trim()) return items
    const lower = query.trim().toLowerCase()
    return items.filter(
      (item) =>
        item.name?.toLowerCase().includes(lower) ||
        item.url?.toLowerCase().includes(lower)
    )
  }, [items, query])

  const totalCount = totalApiCount ?? items.length
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const pageTokens = useMemo(
    () => buildPageTokens(currentPage, totalPages),
    [currentPage, totalPages]
  )

  const startIndex = (currentPage - 1) * PAGE_SIZE
  const rangeStart = items.length > 0 ? startIndex + 1 : 0
  const rangeEnd = startIndex + items.length

  const goToPage = (page: number, scrollToTop = false) => {
    const next = Math.min(Math.max(1, page), totalPages)
    if (next === currentPage) return
    setCurrentPage(next)
    if (scrollToTop) {
      catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleRefresh = () => {
    setQuery('')
    setCurrentPage(1)
    setTotalApiCount(undefined)
    setRefreshKey((value) => value + 1)
  }

  const statusLabel =
    status === 'loading' ? 'Đang tải' : status === 'error' ? 'Lỗi kết nối' : 'Sẵn sàng'

  const renderPagination = (scrollToTop: boolean) => (
    <nav className="pl-pagination" aria-label="Phân trang danh sách Pokémon">
      <button
        type="button"
        className="pl-page-btn pl-page-nav"
        onClick={() => goToPage(currentPage - 1, scrollToTop)}
        disabled={currentPage <= 1 || status === 'loading'}
      >
        ← Trước
      </button>

      <div className="pl-page-numbers">
        {pageTokens.map((token, idx) =>
          token === 'ellipsis' ? (
            <span className="pl-page-ellipsis" key={`ellipsis-${idx}`} aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={`page-${token}`}
              type="button"
              className={`pl-page-btn${token === currentPage ? ' is-current' : ''}`}
              aria-current={token === currentPage ? 'page' : undefined}
              onClick={() => goToPage(token, scrollToTop)}
              disabled={status === 'loading' && token === currentPage}
            >
              {token}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        className="pl-page-btn pl-page-nav"
        onClick={() => goToPage(currentPage + 1, scrollToTop)}
        disabled={currentPage >= totalPages || status === 'loading'}
      >
        Sau →
      </button>
    </nav>
  )

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
                Truy vấn trực tiếp từng trang 20 loài từ PokeAPI v2 với cơ chế chuyển mạch dự phòng
                tự động và lọc nhanh theo tên hoặc mã số.
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
                <span className="pl-input-label">Lọc trong trang hiện tại</span>
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
                <span className="pl-metric-lbl">Trang hiện tại</span>
                <span className="pl-metric-val">
                  {currentPage}/{totalPages}
                </span>
              </div>
              <div className="pl-metric-cell">
                <span className="pl-metric-lbl">Đang hiển thị</span>
                <span className="pl-metric-val">{filtered.length}</span>
              </div>
            </div>

            <div className="pl-progress-box">
              <div className="pl-progress-row">
                <span className="pl-metric-lbl">Phạm vi đang xem</span>
                <span className="pl-progress-text">
                  Mục {rangeStart}–{rangeEnd} · {Math.round((currentPage / totalPages) * 100)}%
                </span>
              </div>
              <div className="pl-progress-track" aria-hidden="true">
                <span
                  className="pl-progress-fill"
                  style={{ width: `${Math.min(100, Math.max(2, (currentPage / totalPages) * 100))}%` }}
                />
              </div>
            </div>
          </aside>
        </section>

        {/* Catalog Grid */}
        <section className="pl-catalog" ref={catalogRef} aria-labelledby="pl-catalog-title">
          <div className="pl-catalog-header">
            <div>
              <h2 id="pl-catalog-title" className="pl-head">
                Danh sách mẫu vật
              </h2>
              <p className="pl-catalog-sub">
                Trang {currentPage} / {totalPages} · Mục {rangeStart}–{rangeEnd} trong tổng số{' '}
                {totalCount} loài Pokémon.
              </p>
            </div>
            {totalPages > 1 && renderPagination(false)}
          </div>

          <div className="pl-grid">
            {status === 'loading'
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

            {status !== 'error' && status !== 'loading' && filtered.length === 0 && items.length > 0 ? (
              <div className="pl-notice">
                <h3>Không tìm thấy Pokémon phù hợp trên trang {currentPage}</h3>
                <p>Hãy thử từ khóa khác, nhấn Xóa lọc hoặc chuyển sang trang khác.</p>
              </div>
            ) : null}

            {status !== 'loading' &&
              filtered.map((item, index) => {
                const id = extractId(item.url)
                const primarySprite = animatedSpriteFor(id, item.name)
                const fallbackSprite = spriteFor(id, item.name)
                return (
                  <article
                    className="pl-card pl-card-animate"
                    key={`${currentPage}-${item.name}-${index}`}
                    style={s({ '--stagger': `${index * 28}ms` })}
                  >
                    <div className="pl-card-meta">
                      <span className="pl-card-id">
                        {id ? `#${id.toString().padStart(4, '0')}` : '---'}
                      </span>
                      <span className="pl-card-index">Mục {startIndex + index + 1}</span>
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

                    </div>
                  </article>
                )
              })}
          </div>

          <div className="pl-load-more-bar">
            <div className="pl-load-more-copy">
              <h3>Điều hướng trang</h3>
              <p>
                Trang {currentPage} / {totalPages} · Hiển thị {PAGE_SIZE} loài mỗi trang để giữ tốc
                độ tải mượt mà.
              </p>
            </div>
            {totalPages > 1 ? (
              renderPagination(true)
            ) : (
              <button className="pl-btn pl-btn-ghost" type="button" onClick={handleRefresh}>
                Tải lại từ đầu
              </button>
            )}
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
