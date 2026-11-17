export interface NavItem {
  path: string
  label: string
  labelVi: string
  description?: string
  isAction?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/pokemon', label: 'Pokemon List', labelVi: 'Danh sách Pokémon', description: 'Tra cứu 1.302 loài Pokémon' },
  { path: '/ability', label: 'Ability', labelVi: 'Kỹ năng nội tại', description: '367 kỹ năng & hiệu ứng thụ động' },
  { path: '/characteristic', label: 'Characteristic', labelVi: 'Đặc tính IV', description: '30 tính cách theo số dư Modulo 5' },
  { path: '/pokeathlon-stat', label: 'Pokeathlon Stat', labelVi: 'Chỉ số Pokéathlon', description: '5 vòng thi đấu Johto & điểm tăng giảm' },
  { path: '/games', label: 'Games', labelVi: 'Thế hệ game', description: '9 thế hệ chính thức Gen I - IX' },
  { path: '/pokedex', label: 'Pokedexes', labelVi: 'Bách khoa vùng', description: 'Pokédex 8 vùng từ Kanto đến Galar' },
  { path: '/locations', label: 'Locations', labelVi: 'Bản đồ địa danh', description: 'Hơn 850 tuyến đường & hang động' },
  { path: '/battle', label: 'Battle Sim', labelVi: 'Đấu trường 8×8', description: 'Mô phỏng trận chiến Match-3 rune 8×8', isAction: true },
]

