import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './SiteFooter.css'

type DeckItem = {
  id: number
  name: string
  role: string
  bst: string
  sprite: string
}

const DECK_SPECIMENS: DeckItem[] = [
  {
    id: 6,
    name: 'Charizard',
    role: 'Lửa / Bay · Solar Power',
    bst: '534 BST',
    sprite: '/assets/pokemon/animated/6.gif',
  },
  {
    id: 25,
    name: 'Pikachu',
    role: 'Điện · Static',
    bst: '320 BST',
    sprite: '/assets/pokemon/animated/25.gif',
  },
  {
    id: 94,
    name: 'Gengar',
    role: 'Bóng Ma / Độc · Cursed Body',
    bst: '500 BST',
    sprite: '/assets/pokemon/animated/94.gif',
  },
  {
    id: 384,
    name: 'Rayquaza',
    role: 'Rồng / Bay · Air Lock',
    bst: '680 BST',
    sprite: '/assets/pokemon/animated/384.gif',
  },
]

const GALLERY_SPECIMENS = [
  { src: '/assets/slowpoke-water.jpg', alt: 'Slowpoke thả mình trên mặt hồ', isPhoto: true },
  { src: '/assets/pokemon/6.png', alt: 'Charizard', isPhoto: false },
  { src: '/assets/pokemon/79.png', alt: 'Slowpoke', isPhoto: false },
  { src: '/assets/pokemon/94.png', alt: 'Gengar', isPhoto: false },
  { src: '/assets/pokemon/149.png', alt: 'Dragonite', isPhoto: false },
  { src: '/assets/pokemon/212.png', alt: 'Scizor', isPhoto: false },
  { src: '/assets/pokemon/248.png', alt: 'Tyranitar', isPhoto: false },
  { src: '/assets/pokemon/282.png', alt: 'Gardevoir', isPhoto: false },
  { src: '/assets/pokemon/384.png', alt: 'Rayquaza', isPhoto: false },
  { src: '/assets/pokemon/448.png', alt: 'Lucario', isPhoto: false },
]

export function SiteFooter() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (!isPlaying) return
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % DECK_SPECIMENS.length)
    }, 2600)
    return () => window.clearInterval(timer)
  }, [isPlaying])

  const activeDeck = DECK_SPECIMENS[activeIndex]
  const progressPct = ((activeIndex + 1) / DECK_SPECIMENS.length) * 100

  return (
    <footer className="sf-footer" aria-label="Chân trang Poke Hub">
      {/* Upper Light Tier */}
      <div className="sf-upper">
        {/* Col 1: Brand + System Scope */}
        <div className="sf-brand-col">
          <Link to="/" className="sf-brand-lockup">
            <img src="/assets/logo.jpg" alt="Poke Hub Logo" className="sf-brand-logo" />
            <span className="sf-brand-title">
              <span>Poke</span>
              <span className="sf-brand-sub">Hub</span>
            </span>
          </Link>

          <div className="sf-meta-block">
            <span className="sf-badge-tag">Hệ thống dữ liệu</span>
            <p className="sf-meta-lines">
              <span>1.302 loài Pokémon · 18 hệ tương khắc</span>
              <span>8 khu vực Pokédex · Đấu trường Match-3 8×8</span>
            </p>
          </div>
        </div>

        {/* Col 2: Navigation - Data Explorers */}
        <div className="sf-nav-col">
          <h3 className="sf-col-heading">Khám phá</h3>
          <ul className="sf-nav-list">
            <li>
              <Link to="/pokemon" className="sf-nav-link">
                Danh sách Pokémon
              </Link>
            </li>
            <li>
              <Link to="/ability" className="sf-nav-link">
                Kỹ năng nội tại
              </Link>
            </li>
            <li>
              <Link to="/characteristic" className="sf-nav-link">
                Đặc tính cá thể IV
              </Link>
            </li>
            <li>
              <Link to="/pokeathlon-stat" className="sf-nav-link">
                Chỉ số Pokéathlon
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Navigation - World & Battle */}
        <div className="sf-nav-col">
          <h3 className="sf-col-heading">Thế giới &amp; Đấu trường</h3>
          <ul className="sf-nav-list">
            <li>
              <Link to="/pokedex" className="sf-nav-link">
                Bách khoa Pokédex
              </Link>
            </li>
            <li>
              <Link to="/games" className="sf-nav-link">
                Thế hệ Game (Gen I–IX)
              </Link>
            </li>
            <li>
              <Link to="/locations" className="sf-nav-link">
                Bản đồ địa danh
              </Link>
            </li>
            <li>
              <Link to="/battle" className="sf-nav-link">
                Đấu trường 8×8
              </Link>
            </li>
          </ul>

          <div className="sf-contact-block">
            <span className="sf-contact-pill">Nguồn: PokeAPI v2 (pokeapi.co)</span>
          </div>
        </div>

        {/* Col 4: Interactive Specimen Deck Widget */}
        <div className="sf-deck" data-ui aria-label="Bộ thẻ mẫu vật nổi bật">
          <div className="sf-deck-top">
            <div className="sf-deck-cover-wrap">
              <div className="sf-deck-cover">
                <img src={activeDeck.sprite} alt={activeDeck.name} />
              </div>
              <div className="sf-deck-info">
                <p className="sf-deck-title">
                  #{activeDeck.id.toString().padStart(4, '0')} · {activeDeck.name}
                </p>
                <p className="sf-deck-sub">{activeDeck.role}</p>
              </div>
            </div>

            <button
              type="button"
              className="sf-play-btn"
              onClick={() => setIsPlaying((prev) => !prev)}
              aria-label={isPlaying ? 'Tạm dừng xoay vòng mẫu vật' : 'Tự động xoay vòng mẫu vật'}
              title={isPlaying ? 'Tạm dừng' : 'Phát tự động'}
            >
              {isPlaying ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
                  <rect x="2" y="2" width="3.5" height="10" />
                  <rect x="8.5" y="2" width="3.5" height="10" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
                  <polygon points="3,2 12,7 3,12" />
                </svg>
              )}
            </button>
          </div>

          <div className="sf-deck-progress" aria-hidden="true">
            <span className="sf-deck-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>

          <ul className="sf-track-list">
            {DECK_SPECIMENS.map((item, idx) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`sf-track-btn${idx === activeIndex ? ' is-active' : ''}`}
                  onClick={() => setActiveIndex(idx)}
                >
                  <span className="sf-track-left">
                    <span className="sf-track-num">{idx + 1}</span>
                    <span className="sf-track-name">{item.name}</span>
                  </span>
                  <span className="sf-track-stat">{item.bst}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Lower Saturated Strip: Mascot + Specimen Gallery + Copyright */}
      <div className="sf-lower">
        <div className="sf-strip-row">
          <div className="sf-mascot-callout">
            <img
              src="/assets/pokemon/animated/25.gif"
              alt="Pikachu"
              className="sf-mascot-sprite"
            />
            <div className="sf-speech-bubble">
              Khám phá ngay
              <br />
              1.302 loài Pokémon
            </div>
          </div>

          <div className="sf-gallery-strip">
            {GALLERY_SPECIMENS.map((item, idx) => (
              <div
                key={`${item.alt}-${idx}`}
                className={`sf-strip-tile${item.isPhoto ? ' is-photo' : ''}`}
                title={item.alt}
              >
                <img src={item.src} alt={item.alt} loading="lazy" />
              </div>
            ))}
          </div>
        </div>

        <div className="sf-bottom-bar">
          <span>© 2026 Poke Hub · Dữ liệu từ PokeAPI v2</span>
          <span>Bách khoa Pokédex &amp; Đấu trường chiến thuật 8×8</span>
        </div>
      </div>
    </footer>
  )
}
export default SiteFooter
