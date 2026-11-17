import { useEffect, useMemo, useRef, useState } from 'react'
import { formatName } from '../utils/pokemon'
import { useBattleBoard } from '../hooks/useBattleBoard'

const POKEMON_ENDPOINT = 'https://pokeapi.co/api/v2/pokemon/'

type PokemonStat = {
  base_stat?: number
  stat?: { name?: string }
}

type PokemonMove = {
  move?: { name?: string; url?: string }
}

type PokemonTypeSlot = {
  type?: { name?: string }
}

type PokemonResponse = {
  id: number
  name: string
  stats?: PokemonStat[]
  moves?: PokemonMove[]
  types?: PokemonTypeSlot[]
  sprites?: {
    front_default?: string | null
    back_default?: string | null
    other?: {
      'official-artwork'?: {
        front_default?: string | null
      }
    }
  }
}

type MoveResponse = {
  name?: string
  power?: number | null
  accuracy?: number | null
  type?: { name?: string }
  damage_class?: { name?: string }
}

type BattleMove = {
  name: string
  power: number
  accuracy: number
  type: string
}

type PreparedPokemon = {
  id: number
  name: string
  displayName: string
  maxHp: number
  attack: number
  defense: number
  speed: number
  types: string[]
  frontSprite: string
  backSprite: string
  fallbackFront: string
  fallbackBack: string
  moves: BattleMove[]
  movePool: BattleMove[]
}

type Side = 'player' | 'enemy'

type TileKind = 'sword' | 'mana' | 'rage' | 'drain' | 'shield' | 'hp'

const TILE_META: Record<TileKind, { icon: string; label: string }> = {
  sword: { icon: '⚔', label: 'Kiem' },
  mana: { icon: '⚡', label: 'Mana' },
  rage: { icon: '🔥', label: 'No' },
  drain: { icon: '☯', label: 'Hut' },
  shield: { icon: '🛡', label: 'Khien' },
  hp: { icon: '❤', label: 'Mau' },
}

const TYPE_CHART: Record<string, { double: string[]; half: string[]; zero: string[] }> = {
  normal: { double: [], half: ['rock', 'steel'], zero: ['ghost'] },
  fire: { double: ['grass', 'ice', 'bug', 'steel'], half: ['fire', 'water', 'rock', 'dragon'], zero: [] },
  water: { double: ['fire', 'ground', 'rock'], half: ['water', 'grass', 'dragon'], zero: [] },
  electric: { double: ['water', 'flying'], half: ['electric', 'grass', 'dragon'], zero: ['ground'] },
  grass: { double: ['water', 'ground', 'rock'], half: ['fire', 'grass', 'poison', 'flying', 'bug', 'dragon', 'steel'], zero: [] },
  ice: { double: ['grass', 'ground', 'flying', 'dragon'], half: ['fire', 'water', 'ice', 'steel'], zero: [] },
  fighting: { double: ['normal', 'ice', 'rock', 'dark', 'steel'], half: ['poison', 'flying', 'psychic', 'bug', 'fairy'], zero: ['ghost'] },
  poison: { double: ['grass', 'fairy'], half: ['poison', 'ground', 'rock', 'ghost'], zero: ['steel'] },
  ground: { double: ['fire', 'electric', 'poison', 'rock', 'steel'], half: ['grass', 'bug'], zero: ['flying'] },
  flying: { double: ['grass', 'fighting', 'bug'], half: ['electric', 'rock', 'steel'], zero: [] },
  psychic: { double: ['fighting', 'poison'], half: ['psychic', 'steel'], zero: ['dark'] },
  bug: { double: ['grass', 'psychic', 'dark'], half: ['fire', 'fighting', 'poison', 'flying', 'ghost', 'steel', 'fairy'], zero: [] },
  rock: { double: ['fire', 'ice', 'flying', 'bug'], half: ['fighting', 'ground', 'steel'], zero: [] },
  ghost: { double: ['psychic', 'ghost'], half: ['dark'], zero: ['normal'] },
  dragon: { double: ['dragon'], half: ['steel'], zero: ['fairy'] },
  dark: { double: ['psychic', 'ghost'], half: ['fighting', 'dark', 'fairy'], zero: [] },
  steel: { double: ['ice', 'rock', 'fairy'], half: ['fire', 'water', 'electric', 'steel'], zero: [] },
  fairy: { double: ['fighting', 'dragon', 'dark'], half: ['fire', 'poison', 'steel'], zero: [] },
}

const getTypeMultiplier = (moveType: string, targetTypes: string[]) => {
  const chart = TYPE_CHART[moveType]
  if (!chart) return 1

  return targetTypes.reduce((multiplier, targetType) => {
    if (chart.zero.includes(targetType)) return 0
    if (chart.double.includes(targetType)) return multiplier * 2
    if (chart.half.includes(targetType)) return multiplier * 0.5
    return multiplier
  }, 1)
}

const getStatValue = (stats: PokemonStat[] | undefined, key: string) => {
  const found = stats?.find((entry) => entry.stat?.name === key)
  return typeof found?.base_stat === 'number' ? found.base_stat : 50
}

const resolveSprite = (name: string, fallback: string, side: Side) => {
  const animatedSprite =
    side === 'player'
      ? `https://play.pokemonshowdown.com/sprites/ani-back/${name}.gif`
      : `https://play.pokemonshowdown.com/sprites/ani/${name}.gif`
  return animatedSprite || fallback
}

async function preparePokemon(query: string): Promise<PreparedPokemon> {
  const response = await fetch(`${POKEMON_ENDPOINT}${query.toLowerCase()}/`)
  if (!response.ok) {
    throw new Error(`Pokemon ${query} khong ton tai (HTTP ${response.status})`)
  }

  const data = (await response.json()) as PokemonResponse
  const hpBase = getStatValue(data.stats, 'hp')
  const attack = getStatValue(data.stats, 'attack')
  const defense = getStatValue(data.stats, 'defense')
  const speed = getStatValue(data.stats, 'speed')
  const types = (data.types ?? [])
    .map((entry) => entry.type?.name)
    .filter((name): name is string => typeof name === 'string')

  const fallbackFront =
    data.sprites?.other?.['official-artwork']?.front_default ??
    data.sprites?.front_default ??
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'
  const fallbackBack = data.sprites?.back_default ?? fallbackFront

  const moveCandidates = (data.moves ?? [])
    .map((entry) => entry.move?.url)
    .filter((url): url is string => typeof url === 'string')
    .slice(0, 18)

  const moveDetails = (
    await Promise.all(
      moveCandidates.map(async (url) => {
        try {
          const moveResponse = await fetch(url)
          if (!moveResponse.ok) return null
          return (await moveResponse.json()) as MoveResponse
        } catch {
          return null
        }
      })
    )
  ).filter((item): item is MoveResponse => item !== null)

  const damagingMoves = moveDetails.filter(
    (move) => typeof move.power === 'number' && move.power > 0 && move.damage_class?.name !== 'status'
  )

  const movePool = (damagingMoves.length > 0 ? damagingMoves : moveDetails)
    .slice(0, 18)
    .map((move) => ({
      name: move.name ?? 'struggle',
      power: typeof move.power === 'number' && move.power > 0 ? move.power : 45,
      accuracy: typeof move.accuracy === 'number' ? move.accuracy : 100,
      type: move.type?.name ?? 'normal',
    }))
    .filter(
      (move, index, array) => array.findIndex((candidate) => candidate.name === move.name) === index
    )

  const pickedMoves = movePool.slice(0, 4)

  if (movePool.length === 0) {
    movePool.push({ name: 'struggle', power: 50, accuracy: 100, type: 'normal' })
  }

  if (pickedMoves.length === 0) {
    pickedMoves.push(movePool[0])
  }

  return {
    id: data.id,
    name: data.name,
    displayName: formatName(data.name),
    maxHp: 90 + hpBase * 2,
    attack,
    defense,
    speed,
    types,
    frontSprite: resolveSprite(data.name, fallbackFront, 'enemy'),
    backSprite: resolveSprite(data.name, fallbackBack, 'player'),
    fallbackFront,
    fallbackBack,
    moves: pickedMoves,
    movePool,
  }
}

function BattleSimulatorPage() {
  const [playerQuery, setPlayerQuery] = useState('pikachu')
  const [enemyQuery, setEnemyQuery] = useState('charizard')
  const [player, setPlayer] = useState<PreparedPokemon | null>(null)
  const [enemy, setEnemy] = useState<PreparedPokemon | null>(null)
  const [playerHp, setPlayerHp] = useState(0)
  const [enemyHp, setEnemyHp] = useState(0)
  const [winner, setWinner] = useState<Side | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [battleLog, setBattleLog] = useState<string[]>([])
  const [attackingSide, setAttackingSide] = useState<Side | null>(null)
  const [hitSide, setHitSide] = useState<Side | null>(null)

  const playerHpRef = useRef(playerHp)
  const enemyHpRef = useRef(enemyHp)

  useEffect(() => {
    playerHpRef.current = playerHp
  }, [playerHp])

  useEffect(() => {
    enemyHpRef.current = enemyHp
  }, [enemyHp])

  const addLog = (message: string) => {
    setBattleLog((prev) => [message, ...prev].slice(0, 8))
  }

  const {
    board,
    selectedCell,
    playerResource,
    enemyResource,
    turnLocked,
    resetBattleBoard,
    handleBoardCell,
  } = useBattleBoard({
    player,
    enemy,
    playerHpRef,
    enemyHpRef,
    setPlayerHp,
    setEnemyHp,
    setWinner,
    addLog,
    executeAttack: async (attacker, move) => executeAttack(attacker, move),
  })

  const initBattle = async () => {
    const playerInput = playerQuery.trim().toLowerCase()
    const enemyInput = enemyQuery.trim().toLowerCase()
    if (!playerInput || !enemyInput) return

    setLoading(true)
    setErrorMessage('')

    try {
      const [loadedPlayer, loadedEnemy] = await Promise.all([
        preparePokemon(playerInput),
        preparePokemon(enemyInput),
      ])

      setPlayer(loadedPlayer)
      setEnemy(loadedEnemy)
      setPlayerHp(loadedPlayer.maxHp)
      setEnemyHp(loadedEnemy.maxHp)
      playerHpRef.current = loadedPlayer.maxHp
      enemyHpRef.current = loadedEnemy.maxHp
      setWinner(null)
      resetBattleBoard()
      setBattleLog([
        `${loadedPlayer.displayName} vs ${loadedEnemy.displayName}!`,
        'Tran dau bat dau. Swap 2 vien lien ke de ghep 3 vien tro len.',
      ])
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Khong the tai Pokemon')
      setPlayer(null)
      setEnemy(null)
      setBattleLog([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    initBattle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function executeAttack(attacker: Side, move: BattleMove) {
    const attackerData = attacker === 'player' ? player : enemy
    const targetData = attacker === 'player' ? enemy : player
    if (!attackerData || !targetData) return -1

    setAttackingSide(attacker)
    addLog(`${attackerData.displayName} dung ${formatName(move.name)}!`)
    await new Promise<void>((resolve) => window.setTimeout(resolve, 320))
    setAttackingSide(null)

    const accuracyRoll = Math.random() * 100
    if (accuracyRoll > move.accuracy) {
      addLog('Don tan cong hut muc tieu!')
      return attacker === 'player' ? enemyHpRef.current : playerHpRef.current
    }

    const isCrit = Math.random() < 1 / 16
    const targetTypes = targetData.types.length > 0 ? targetData.types : ['normal']
    const effectiveness = getTypeMultiplier(move.type, targetTypes)

    const attackValue = attackerData.attack
    const defenseValue = Math.max(1, targetData.defense)
    const randomFactor = 0.85 + Math.random() * 0.15
    const critFactor = isCrit ? 1.5 : 1
    const baseDamage = ((22 * move.power * (attackValue / defenseValue)) / 50) + 2
    const rawDamage = Math.floor(baseDamage * randomFactor * critFactor * effectiveness)
    const damage = effectiveness === 0 ? 0 : Math.max(1, rawDamage)

    const targetSide: Side = attacker === 'player' ? 'enemy' : 'player'
    setHitSide(targetSide)
    await new Promise<void>((resolve) => window.setTimeout(resolve, 220))
    setHitSide(null)

    if (isCrit) {
      addLog('Critical hit!')
    }

    if (effectiveness > 1) {
      addLog('Super effective!')
    } else if (effectiveness > 0 && effectiveness < 1) {
      addLog('Not very effective...')
    } else if (effectiveness === 0) {
      addLog('Khong co tac dung.')
    }

    if (targetSide === 'enemy') {
      const nextHp = Math.max(0, enemyHpRef.current - damage)
      enemyHpRef.current = nextHp
      setEnemyHp(nextHp)
      addLog(`${targetData.displayName} mat ${damage} HP.`)
      return nextHp
    }

    const nextHp = Math.max(0, playerHpRef.current - damage)
    playerHpRef.current = nextHp
    setPlayerHp(nextHp)
    addLog(`${targetData.displayName} mat ${damage} HP.`)
    return nextHp
  }

  const playerHpPercent = useMemo(() => {
    if (!player || player.maxHp <= 0) return 0
    return Math.round((playerHp / player.maxHp) * 100)
  }, [player, playerHp])

  const enemyHpPercent = useMemo(() => {
    if (!enemy || enemy.maxHp <= 0) return 0
    return Math.round((enemyHp / enemy.maxHp) * 100)
  }, [enemy, enemyHp])

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <span className="brand-dot" />
          </div>
          <div>
            <p className="eyebrow">Mini Game</p>
            <h1>Pokemon Battle Simulator</h1>
          </div>
        </div>
      </header>

      <main>
        <section className="battle-setup">
          <label className="characteristic-input-group">
            <span>Your Pokemon</span>
            <input
              type="text"
              value={playerQuery}
              onChange={(event) => setPlayerQuery(event.target.value)}
              placeholder="Vi du: pikachu"
            />
          </label>

          <label className="characteristic-input-group">
            <span>Enemy Pokemon</span>
            <input
              type="text"
              value={enemyQuery}
              onChange={(event) => setEnemyQuery(event.target.value)}
              placeholder="Vi du: charizard"
            />
          </label>

          <div className="characteristic-actions">
            <button className="btn primary" type="button" onClick={initBattle} disabled={loading}>
              {loading ? 'Dang tai...' : 'Bat dau tran dau'}
            </button>
          </div>
        </section>

        {errorMessage ? (
          <div className="notice">
            <h3>Khong the tao tran dau</h3>
            <p>{errorMessage}</p>
          </div>
        ) : null}

        {player && enemy ? (
          <section className="battle-shell">
            <div className="battle-panel">
              <div className="match3-panel arena-layout">
                <div className="section-header compact">
                  <div>
                    <h3>Match-3 Battle Board</h3>
                    <p>
                      Swap 2 vien lien ke de tao bo 3+. Moi loai vien se kich hoat hieu ung rieng trong tran dau.
                    </p>
                  </div>
                </div>

                <div className="arena-hud" aria-label="Battle HUD">
                  <div className="arena-hud-side player">
                    <div className="arena-hud-name">{player.displayName}</div>
                    <div className="arena-hp-track">
                      <span style={{ width: `${playerHpPercent}%` }} />
                    </div>
                    <small>
                      {playerHp}/{player.maxHp}
                    </small>
                    <div className="arena-resource-row">
                      <span>MP {playerResource.mana}</span>
                      <span>RG {playerResource.rage}</span>
                      <span>SH {playerResource.shield}</span>
                    </div>
                  </div>

                  <div className="arena-turn-badge" aria-hidden="true">
                    <span>{turnLocked ? '...' : '8'}</span>
                  </div>

                  <div className="arena-hud-side enemy">
                    <div className="arena-hud-name">{enemy.displayName}</div>
                    <div className="arena-hp-track">
                      <span style={{ width: `${enemyHpPercent}%` }} />
                    </div>
                    <small>
                      {enemyHp}/{enemy.maxHp}
                    </small>
                    <div className="arena-resource-row">
                      <span>MP {enemyResource.mana}</span>
                      <span>RG {enemyResource.rage}</span>
                      <span>SH {enemyResource.shield}</span>
                    </div>
                  </div>
                </div>

                <div className="arena-stage">
                  <div
                    className={`arena-fighter left${attackingSide === 'player' ? ' is-attacking' : ''}${hitSide === 'player' ? ' is-hit' : ''}`}
                  >
                    <img
                      src={player.frontSprite}
                      alt={player.displayName}
                      onError={(event) => {
                        event.currentTarget.src = player.fallbackFront
                      }}
                    />
                  </div>

                  <div className={`match3-board${turnLocked ? ' is-locked' : ''}`}>
                    {board.map((rowTiles, rowIndex) =>
                      rowTiles.map((tile, colIndex) => {
                        const isSelected =
                          selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                        return (
                          <button
                            key={tile.id}
                            type="button"
                            className={`match3-tile ${tile.kind}${isSelected ? ' is-selected' : ''}`}
                            onClick={() => handleBoardCell(rowIndex, colIndex)}
                            disabled={turnLocked || Boolean(winner)}
                            aria-label={TILE_META[tile.kind].label}
                          >
                            <span className="match3-icon" aria-hidden="true">
                              {TILE_META[tile.kind].icon}
                            </span>
                          </button>
                        )
                      })
                    )}
                  </div>

                  <div
                    className={`arena-fighter right${attackingSide === 'enemy' ? ' is-attacking' : ''}${hitSide === 'enemy' ? ' is-hit' : ''}`}
                  >
                    <img
                      src={enemy.frontSprite}
                      alt={enemy.displayName}
                      onError={(event) => {
                        event.currentTarget.src = enemy.fallbackFront
                      }}
                    />
                  </div>
                </div>

                <p className="match3-help">
                  Chon 1 vien, sau do chon vien lien ke de doi cho. Ghep 3+ vien cung loai de kich hoat hieu ung.
                </p>
              </div>

              <div className="battle-log">
                <p className="label">Battle Log</p>
                {winner ? (
                  <p className="battle-winner">
                    {winner === 'player' ? 'Ban da chien thang!' : 'Doi thu chien thang!'}
                  </p>
                ) : null}
                {battleLog.map((line, index) => (
                  <p key={`${line}-${index}`}>{line}</p>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <footer className="footer">
        <p>Powered by PokeAPI battle data</p>
      </footer>
    </div>
  )
}

export default BattleSimulatorPage

