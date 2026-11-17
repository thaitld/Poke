import { type Dispatch, type MutableRefObject, type SetStateAction, useState } from 'react'

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

type BoardTile = {
  id: number
  kind: TileKind
}

type Cell = {
  row: number
  col: number
}

type MatchSummary = {
  positions: Set<string>
  counts: Record<TileKind, number>
}

type BattleResource = {
  mana: number
  rage: number
  shield: number
}

type UseBattleBoardArgs = {
  player: PreparedPokemon | null
  enemy: PreparedPokemon | null
  playerHpRef: MutableRefObject<number>
  enemyHpRef: MutableRefObject<number>
  setPlayerHp: Dispatch<SetStateAction<number>>
  setEnemyHp: Dispatch<SetStateAction<number>>
  setWinner: Dispatch<SetStateAction<Side | null>>
  addLog: (message: string) => void
  executeAttack: (attacker: Side, move: BattleMove) => Promise<number>
}

type UseBattleBoardResult = {
  board: BoardTile[][]
  selectedCell: Cell | null
  playerResource: BattleResource
  enemyResource: BattleResource
  turnLocked: boolean
  resetBattleBoard: () => void
  handleBoardCell: (row: number, col: number) => Promise<void>
}

const BOARD_SIZE = 8
const TILE_KINDS: TileKind[] = ['sword', 'mana', 'rage', 'drain', 'shield', 'hp']
const EMPTY_RESOURCE: BattleResource = { mana: 0, rage: 0, shield: 0 }
let tileSeed = 0

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

const newTile = (kind: TileKind): BoardTile => ({ id: ++tileSeed, kind })

const randomTileKind = () => TILE_KINDS[Math.floor(Math.random() * TILE_KINDS.length)]

const createBoard = (): BoardTile[][] => {
  const board: BoardTile[][] = []

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    const nextRow: BoardTile[] = []

    for (let col = 0; col < BOARD_SIZE; col += 1) {
      let kind = randomTileKind()

      while (
        (col >= 2 && nextRow[col - 1].kind === kind && nextRow[col - 2].kind === kind) ||
        (row >= 2 && board[row - 1][col].kind === kind && board[row - 2][col].kind === kind)
      ) {
        kind = randomTileKind()
      }

      nextRow.push(newTile(kind))
    }

    board.push(nextRow)
  }

  return board
}

const isAdjacent = (a: Cell, b: Cell) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1

const swapTiles = (board: BoardTile[][], a: Cell, b: Cell) => {
  const next = board.map((row) => [...row])
  const temp = next[a.row][a.col]
  next[a.row][a.col] = next[b.row][b.col]
  next[b.row][b.col] = temp
  return next
}

const toKey = (row: number, col: number) => `${row}:${col}`

const findMatches = (board: BoardTile[][]): MatchSummary => {
  const positions = new Set<string>()

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    let col = 0
    while (col < BOARD_SIZE) {
      const start = col
      const kind = board[row][col].kind
      while (col < BOARD_SIZE && board[row][col].kind === kind) {
        col += 1
      }
      if (col - start >= 3) {
        for (let index = start; index < col; index += 1) {
          positions.add(toKey(row, index))
        }
      }
    }
  }

  for (let col = 0; col < BOARD_SIZE; col += 1) {
    let row = 0
    while (row < BOARD_SIZE) {
      const start = row
      const kind = board[row][col].kind
      while (row < BOARD_SIZE && board[row][col].kind === kind) {
        row += 1
      }
      if (row - start >= 3) {
        for (let index = start; index < row; index += 1) {
          positions.add(toKey(index, col))
        }
      }
    }
  }

  const counts: Record<TileKind, number> = {
    sword: 0,
    mana: 0,
    rage: 0,
    drain: 0,
    shield: 0,
    hp: 0,
  }

  positions.forEach((key) => {
    const [rowText, colText] = key.split(':')
    const row = Number(rowText)
    const col = Number(colText)
    counts[board[row][col].kind] += 1
  })

  return { positions, counts }
}

const collapseBoard = (board: BoardTile[][], matched: Set<string>) => {
  const next = Array.from({ length: BOARD_SIZE }, () => Array<BoardTile>(BOARD_SIZE))

  for (let col = 0; col < BOARD_SIZE; col += 1) {
    let write = BOARD_SIZE - 1

    for (let row = BOARD_SIZE - 1; row >= 0; row -= 1) {
      if (matched.has(toKey(row, col))) continue
      next[write][col] = board[row][col]
      write -= 1
    }

    while (write >= 0) {
      next[write][col] = newTile(randomTileKind())
      write -= 1
    }
  }

  return next
}

export function useBattleBoard({
  player,
  enemy,
  playerHpRef,
  enemyHpRef,
  setPlayerHp,
  setEnemyHp,
  setWinner,
  addLog,
  executeAttack,
}: UseBattleBoardArgs): UseBattleBoardResult {
  const [board, setBoard] = useState<BoardTile[][]>(() => createBoard())
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null)
  const [playerResource, setPlayerResource] = useState<BattleResource>(EMPTY_RESOURCE)
  const [enemyResource, setEnemyResource] = useState<BattleResource>(EMPTY_RESOURCE)
  const [turnLocked, setTurnLocked] = useState(false)

  const resetBattleBoard = () => {
    setBoard(createBoard())
    setSelectedCell(null)
    setPlayerResource(EMPTY_RESOURCE)
    setEnemyResource(EMPTY_RESOURCE)
    setTurnLocked(false)
  }

  const syncResources = (nextPlayer: BattleResource, nextEnemy: BattleResource) => {
    setPlayerResource(nextPlayer)
    setEnemyResource(nextEnemy)
  }

  const executeEnemyTurn = async () => {
    if (!player || !enemy) return false

    let nextEnemy = {
      ...enemyResource,
      mana: Math.min(100, enemyResource.mana + 6 + Math.floor(Math.random() * 6)),
      rage: Math.min(100, enemyResource.rage + 8 + Math.floor(Math.random() * 8)),
    }

    if (Math.random() < 0.3) {
      nextEnemy.shield = Math.min(6, nextEnemy.shield + 1)
      addLog(`${enemy.displayName} tao 1 lop khien.`)
    }

    setEnemyResource(nextEnemy)

    await sleep(280)

    const enemyMoves = enemy.moves
    const enemyMove = enemyMoves[Math.floor(Math.random() * enemyMoves.length)]
    const bonusPower = Math.floor(nextEnemy.rage / 10) + Math.floor(nextEnemy.mana / 14)
    const boostedMove: BattleMove = {
      ...enemyMove,
      power: enemyMove.power + bonusPower,
    }

    const playerRemaining = await executeAttack('enemy', boostedMove)

    nextEnemy = {
      ...nextEnemy,
      mana: Math.max(0, nextEnemy.mana - 14),
      rage: Math.max(0, nextEnemy.rage - 10),
    }
    setEnemyResource(nextEnemy)

    if (playerRemaining <= 0) {
      setWinner('enemy')
      addLog(`${enemy.displayName} chien thang!`)
      return true
    }

    return false
  }

  const applyMatchEffects = async (counts: Record<TileKind, number>, canUseSwordAttack: boolean) => {
    if (!player || !enemy) return false

    let nextPlayer = { ...playerResource }
    const nextEnemy = { ...enemyResource }

    const clampGauge = (value: number) => Math.max(0, Math.min(100, value))

    if (counts.mana > 0) {
      const gain = counts.mana * 8
      nextPlayer.mana = clampGauge(nextPlayer.mana + gain)
      addLog(`Mana +${gain}.`)
    }

    if (counts.rage > 0) {
      const gain = counts.rage * 10
      nextPlayer.rage = clampGauge(nextPlayer.rage + gain)
      addLog(`No +${gain}. Sat thuong kiem tang.`)
    }

    if (counts.shield > 0) {
      const gain = Math.max(1, Math.floor(counts.shield / 3) + 1)
      nextPlayer.shield = Math.min(6, nextPlayer.shield + gain)
      addLog(`Khien +${gain}. Co the chan hut tai nguyen.`)
    }

    if (counts.hp > 0) {
      const heal = counts.hp * 12
      const nextHp = Math.min(player.maxHp, playerHpRef.current + heal)
      playerHpRef.current = nextHp
      setPlayerHp(nextHp)
      addLog(`${player.displayName} hoi ${heal} HP.`)
    }

    if (counts.drain > 0) {
      let pulls = counts.drain

      if (nextEnemy.shield > 0) {
        const blocked = Math.min(pulls, nextEnemy.shield)
        nextEnemy.shield -= blocked
        pulls -= blocked
        addLog(`Doi thu dung khien chan ${blocked} luot hut.`)
      }

      if (pulls > 0) {
        const amountPerPull = 10
        const preferred: 'mana' | 'rage' = nextEnemy.mana >= nextEnemy.rage ? 'mana' : 'rage'
        const alternate: 'mana' | 'rage' = preferred === 'mana' ? 'rage' : 'mana'
        const maxSteal = pulls * amountPerPull

        let stolen = Math.min(maxSteal, nextEnemy[preferred])
        let resourceStolen: 'mana' | 'rage' | null = preferred

        if (stolen <= 0) {
          stolen = Math.min(maxSteal, nextEnemy[alternate])
          resourceStolen = stolen > 0 ? alternate : null
        }

        if (stolen > 0 && resourceStolen) {
          nextEnemy[resourceStolen] = Math.max(0, nextEnemy[resourceStolen] - stolen)
          nextPlayer[resourceStolen] = clampGauge(nextPlayer[resourceStolen] + stolen)
          addLog(`Hut ${stolen} ${resourceStolen === 'mana' ? 'mana' : 'no'} tu doi thu.`)
        } else {
          addLog('Vien hut da kich hoat, nhung doi thu khong con mana/no de hut.')
        }
      }
    }

    syncResources(nextPlayer, nextEnemy)

    if (counts.sword > 0 && canUseSwordAttack) {
      const combo = counts.sword
      const manaUsed = Math.min(nextPlayer.mana, combo * 7)
      const rageUsed = Math.min(nextPlayer.rage, combo * 6)

      nextPlayer = {
        ...nextPlayer,
        mana: Math.max(0, nextPlayer.mana - manaUsed),
        rage: Math.max(0, nextPlayer.rage - Math.floor(rageUsed * 0.45)),
      }

      const rageFactor = 1 + (nextPlayer.rage + rageUsed) / 130
      const baseDamage = player.attack * 0.34 + combo * 15 + manaUsed * 0.55 + rageUsed * 0.45
      const damage = Math.max(1, Math.floor(baseDamage * rageFactor))

      setTurnLocked(true)
      addLog(`Combo kiem x${combo}! ${player.displayName} lao len tan cong.`)
      await sleep(260)

      const nextEnemyHp = Math.max(0, enemyHpRef.current - damage)
      enemyHpRef.current = nextEnemyHp
      setEnemyHp(nextEnemyHp)
      addLog(`${enemy.displayName} mat ${damage} HP tu combo kiem.`)
      syncResources(nextPlayer, nextEnemy)

      if (nextEnemyHp <= 0) {
        setTurnLocked(false)
        return true
      }

      const defeatedByEnemyTurn = await executeEnemyTurn()
      setTurnLocked(false)
      return defeatedByEnemyTurn
    }

    if (counts.sword > 0 && !canUseSwordAttack) {
      addLog('Can doi cho co vien kiem de tan cong Pokemon doi thu.')
    }

    const defeatedByEnemyTurn = await executeEnemyTurn()
    setTurnLocked(false)
    return defeatedByEnemyTurn
  }

  const handleBoardCell = async (row: number, col: number) => {
    if (!player || !enemy || turnLocked) return

    const picked: Cell = { row, col }

    if (!selectedCell) {
      setSelectedCell(picked)
      return
    }

    if (selectedCell.row === row && selectedCell.col === col) {
      setSelectedCell(null)
      return
    }

    if (!isAdjacent(selectedCell, picked)) {
      setSelectedCell(picked)
      return
    }

    setTurnLocked(true)
    setSelectedCell(null)

    const previousBoard = board
    const selectedTile = board[selectedCell.row][selectedCell.col]
    const pickedTile = board[picked.row][picked.col]
    const canUseSwordAttack = selectedTile.kind === 'sword' || pickedTile.kind === 'sword'

    const swapped = swapTiles(board, selectedCell, picked)
    const firstCheck = findMatches(swapped)

    if (firstCheck.positions.size === 0) {
      setBoard(swapped)
      await sleep(130)
      setBoard(previousBoard)
      addLog('Nuoc di khong hop le. Hay ghep it nhat 3 vien giong nhau.')
      setTurnLocked(false)
      return
    }

    let currentBoard = swapped
    let chain = 0

    while (true) {
      const summary = findMatches(currentBoard)
      if (summary.positions.size === 0) break

      chain += 1
      if (chain > 1) {
        addLog(`Combo chain x${chain}!`)
      }

      const enemyDefeated = await applyMatchEffects(summary.counts, canUseSwordAttack)
      if (enemyDefeated) {
        setWinner('player')
        addLog(`${player.displayName} chien thang!`)
        setTurnLocked(false)
        return
      }

      currentBoard = collapseBoard(currentBoard, summary.positions)
      setBoard(currentBoard)
      await sleep(180)
    }

    setTurnLocked(false)
  }

  return {
    board,
    selectedCell,
    playerResource,
    enemyResource,
    turnLocked,
    resetBattleBoard,
    handleBoardCell,
  }
}