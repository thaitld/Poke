import { BrowserRouter, Navigate, NavLink, Outlet, Route, Routes } from 'react-router-dom'
import './App.css'
import FloatingLines from './FloatingLines'
import { NAV_ITEMS } from './config/navigation'
import AbilityPage from './pages/AbilityPage'
import BattleSimulatorPage from './pages/BattleSimulatorPage'
import CharacteristicPage from './pages/CharacteristicPage'
import GenerationPage from './pages/GenerationPage'
import LandingPage from './pages/LandingPage'
import LocationsPage from './pages/LocationsPage'
import NotFoundPage from './pages/NotFoundPage'
import PokedexPage from './pages/PokedexPage'
import PokeathlonStatPage from './pages/PokeathlonStatPage'
import PokemonListPage from './pages/PokemonListPage'

function AppLayout() {
  return (
    <>
      <div style={{ width: '100%', height: '100vh', position: 'fixed', inset: 0 }} className="site-floating-bg">
        <FloatingLines
          linesGradient={[
            '#e4572e',
            '#f4a261',
            '#e9c46a',
            '#2a9d8f',
            '#264653',
          ]}
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={5}
          lineDistance={5}
          bendRadius={5}
          bendStrength={-0.5}
          interactive={true}
          parallax={true}
          mixBlendMode="multiply"
        />
      </div>

      <div className="site-shell">
        <aside className="site-sidebar">
          <div className="site-brand">
            <span className="brand-mark brand-mark-logo" aria-hidden="true">
              <img src="/assets/logo.jpg" alt="Poke Hub Logo" className="brand-logo-img" />
            </span>
            <div>
              <p className="eyebrow">Poke Hub</p>
              <h2>Pokemon Data Center</h2>
            </div>
          </div>

          <nav className="site-nav" aria-label="Main navigation">
            <NavLink to="/" end>
              Home
            </NavLink>
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.path} to={item.path}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="site-content">
          <Outlet />
        </div>
      </div>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/index.html" element={<LandingPage />} />
        <Route path="/pokemon" element={<PokemonListPage />} />
        <Route path="/pokemon-list" element={<Navigate to="/pokemon" replace />} />
        <Route path="/ability" element={<AbilityPage />} />
        <Route path="/characteristic" element={<CharacteristicPage />} />
        <Route path="/characteristic/:id" element={<CharacteristicPage />} />
        <Route path="/pokeathlon-stat" element={<PokeathlonStatPage />} />
        <Route path="/pokeathlon-stat/:idOrName" element={<PokeathlonStatPage />} />
        <Route path="/pokeathlon" element={<Navigate to="/pokeathlon-stat" replace />} />
        <Route path="/games" element={<GenerationPage />} />
        <Route path="/games/:idOrName" element={<GenerationPage />} />
        <Route element={<AppLayout />}>
          <Route path="/pokedex" element={<PokedexPage />} />
          <Route path="/pokedex/:idOrName" element={<PokedexPage />} />
          <Route path="/pokedexes" element={<Navigate to="/pokedex" replace />} />
          <Route path="/locations" element={<LocationsPage />} />
          <Route path="/locations/:idOrName" element={<LocationsPage />} />
          <Route path="/battle" element={<BattleSimulatorPage />} />
          <Route path="/battle-sim" element={<Navigate to="/battle" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
