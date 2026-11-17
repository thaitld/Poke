export type AbilityTranslationVi = {
  viTitle: string
  shortEffect: string
  effect: string
  flavor: string
}

/**
 * Từ điển tiếng Việt chuẩn thuật ngữ Pokémon cho các kỹ năng nội tại phổ biến.
 * Các kỹ năng chưa có trong từ điển sẽ được tự động dịch từ bản tiếng Anh của PokeAPI.
 */
export const ABILITY_TRANSLATIONS_VI: Record<string, AbilityTranslationVi> = {
  stench: {
    viTitle: 'Mùi hôi nồng (Stench)',
    shortEffect: 'Đòn tấn công có 10% cơ hội khiến mục tiêu bị choáng (Flinch).',
    effect:
      'Các chiêu thức gây sát thương của Pokémon này có 10% xác suất làm mục tiêu bị choáng (mất lượt đánh), áp dụng cho từng đòn đánh nếu chiêu thức chưa có hiệu ứng làm choáng sẵn. Ngoài bản đồ phiêu lưu, khi đứng đầu đội hình sẽ giảm một nửa tỷ lệ gặp Pokémon hoang dã.',
    flavor: 'Tỏa ra mùi hôi nồng nặc giúp xua đuổi Pokémon hoang dã.',
  },
  drizzle: {
    viTitle: 'Mưa phùn (Drizzle)',
    shortEffect: 'Gọi mưa ngay khi xuất trận.',
    effect:
      'Khi Pokémon này vào sân, thời tiết tự động chuyển sang Mưa (Rain) trong 5 lượt, tăng 50% sát thương chiêu hệ Nước và giảm 50% sát thương chiêu hệ Lửa.',
    flavor: 'Triệu hồi cơn mưa lớn ngay khi bước vào trận đấu.',
  },
  'speed-boost': {
    viTitle: 'Tăng tốc (Speed Boost)',
    shortEffect: 'Tăng 1 bậc Tốc độ vào cuối mỗi lượt.',
    effect:
      'Vào cuối mỗi lượt đấu có mặt trên sân, chỉ số Tốc độ (Speed) của Pokémon này tự động tăng thêm 1 bậc (tối đa +6 bậc).',
    flavor: 'Tốc độ của Pokémon tăng dần theo từng lượt đấu.',
  },
  sturdy: {
    viTitle: 'Kiên cố (Sturdy)',
    shortEffect: 'Không thể bị hạ gục chỉ bằng một đòn khi đang đầy máu.',
    effect:
      'Khi HP đang đầy (100%), Pokémon này chắc chắn sống sót với 1 HP nếu trúng đòn gây sát thương chí mạng. Đồng thời miễn nhiễm hoàn toàn với các chiêu thức kết liễu tức thì (OHKO).',
    flavor: 'Không thể bị hạ gục chỉ sau một đòn đánh khi còn nguyên sinh lực.',
  },
  'volt-absorb': {
    viTitle: 'Hấp thụ điện (Volt Absorb)',
    shortEffect: 'Hấp thụ chiêu hệ Điện để hồi 25% HP tối đa.',
    effect:
      'Miễn nhiễm sát thương từ mọi chiêu thức hệ Điện; thay vào đó Pokémon sẽ hồi phục 1/4 lượng HP tối đa của bản thân.',
    flavor: 'Hồi phục sinh lực khi trúng các đòn tấn công hệ Điện.',
  },
  'water-absorb': {
    viTitle: 'Hấp thụ nước (Water Absorb)',
    shortEffect: 'Hấp thụ chiêu hệ Nước để hồi 25% HP tối đa.',
    effect:
      'Miễn nhiễm sát thương từ mọi chiêu thức hệ Nước; thay vào đó Pokémon sẽ hồi phục 1/4 lượng HP tối đa của bản thân.',
    flavor: 'Hồi phục sinh lực nếu bị trúng đòn đánh hệ Nước.',
  },
  oblivious: {
    viTitle: 'Vô tư lự (Oblivious)',
    shortEffect: 'Miễn nhiễm hiệu ứng Say mê (Infatuation), Khiêu khích (Taunt) và Đe dọa.',
    effect:
      'Ngăn Pokémon rơi vào trạng thái Say mê, bị Khiêu khích hoặc chịu tác động giảm Công từ kỹ năng Intimidate.',
    flavor: 'Nhờ tính cách vô tư nên không bị mê hoặc hay khiêu khích.',
  },
  'flash-fire': {
    viTitle: 'Ngọn lửa bùng cháy (Flash Fire)',
    shortEffect: 'Miễn nhiễm hệ Lửa và tăng 50% sức mạnh chiêu Lửa khi trúng đòn Lửa.',
    effect:
      'Miễn nhiễm sát thương từ chiêu hệ Lửa. Khi trúng chiêu hệ Lửa lần đầu, mọi đòn tấn công hệ Lửa của Pokémon này được tăng thêm 50% sát thương.',
    flavor: 'Tăng uy lực chiêu hệ Lửa nếu bị trúng đòn tấn công hệ Lửa.',
  },
  intimidate: {
    viTitle: 'Đe dọa (Intimidate)',
    shortEffect: 'Giảm 1 bậc Tấn công của đối thủ ngay khi xuất trận.',
    effect:
      'Ngay khi Pokémon này bước vào sân, tất cả Pokémon đối phương bị giảm 1 bậc chỉ số Tấn công vật lý (Attack). Ngoài bản đồ, giúp giảm 50% tỷ lệ gặp Pokémon hoang dã cấp thấp.',
    flavor: 'Áp đảo tinh thần đối phương làm giảm sức mạnh đòn đánh vật lý của chúng.',
  },
  levitate: {
    viTitle: 'Bay lượn (Levitate)',
    shortEffect: 'Né tránh hoàn toàn các chiêu thức hệ Đất.',
    effect:
      'Pokémon này miễn nhiễm với các chiêu gây sát thương hệ Đất, bẫy gai (Spikes), bẫy độc (Toxic Spikes) và kỹ năng Arena Trap. Hiệu ứng bị vô hiệu khi sân có Gravity, đang dùng Ingrain hoặc cầm Iron Ball.',
    flavor: 'Lơ lửng trên không nên không bị trúng đòn hệ Đất.',
  },
  synchronize: {
    viTitle: 'Đồng bộ (Synchronize)',
    shortEffect: 'Truyền lại trạng thái Bỏng, Tê liệt hoặc Trúng độc sang đối thủ.',
    effect:
      'Khi đối phương gây ra trạng thái Bỏng, Tê liệt hoặc Trúng độc lên Pokémon này, chính đối phương cũng sẽ chịu trạng thái tương tự.',
    flavor: 'Chia sẻ trạng thái Bỏng, Tê liệt hoặc Độc sang kẻ tấn công.',
  },
  pressure: {
    viTitle: 'Áp lực (Pressure)',
    shortEffect: 'Khiến đối thủ tiêu hao gấp đôi điểm PP mỗi lần ra chiêu.',
    effect:
      'Mọi chiêu thức của đối thủ nhắm vào Pokémon này sẽ tiêu tốn 2 PP thay vì 1 PP thông thường.',
    flavor: 'Tạo áp lực nặng nề khiến đối thủ nhanh chóng cạn kiệt PP.',
  },
  overgrow: {
    viTitle: 'Sinh trưởng mạnh (Overgrow)',
    shortEffect: 'Tăng 50% sát thương chiêu hệ Cỏ khi HP xuống dưới 1/3.',
    effect:
      'Khi lượng HP hiện tại còn từ 1/3 tối đa trở xuống, sức mạnh của các chiêu thức hệ Cỏ do Pokémon này thi triển được tăng thêm 50%.',
    flavor: 'Tăng cường uy lực chiêu hệ Cỏ trong tình thế nguy cấp.',
  },
  blaze: {
    viTitle: 'Rực cháy (Blaze)',
    shortEffect: 'Tăng 50% sát thương chiêu hệ Lửa khi HP xuống dưới 1/3.',
    effect:
      'Khi lượng HP hiện tại còn từ 1/3 tối đa trở xuống, sức mạnh của các chiêu thức hệ Lửa do Pokémon này thi triển được tăng thêm 50%.',
    flavor: 'Tăng cường uy lực chiêu hệ Lửa khi sinh lực xuống thấp.',
  },
  torrent: {
    viTitle: 'Thủy triều dâng (Torrent)',
    shortEffect: 'Tăng 50% sát thương chiêu hệ Nước khi HP xuống dưới 1/3.',
    effect:
      'Khi lượng HP hiện tại còn từ 1/3 tối đa trở xuống, sức mạnh của các chiêu thức hệ Nước do Pokémon này thi triển được tăng thêm 50%.',
    flavor: 'Tăng cường uy lực chiêu hệ Nước trong tình thế nguy cấp.',
  },
  drought: {
    viTitle: 'Hạn hán (Drought)',
    shortEffect: 'Gọi nắng gắt ngay khi xuất trận.',
    effect:
      'Khi Pokémon này vào sân, thời tiết chuyển thành Nắng gắt (Harsh Sunlight) trong 5 lượt, tăng 50% sát thương chiêu hệ Lửa và giảm 50% sát thương chiêu hệ Nước.',
    flavor: 'Làm bầu trời bừng nắng gắt ngay khi bước vào trận đấu.',
  },
  'sand-stream': {
    viTitle: 'Bão cát (Sand Stream)',
    shortEffect: 'Triệu hồi bão cát ngay khi xuất trận.',
    effect:
      'Khi Pokémon này vào sân, thời tiết chuyển thành Bão cát (Sandstorm) trong 5 lượt, gây sát thương mỗi lượt cho các hệ ngoài Đá, Đất và Thép, đồng thời tăng 50% Thủ Phép cho hệ Đá.',
    flavor: 'Cuốn lên cơn bão cát dữ dội ngay khi xuất hiện trên sân.',
  },
  'air-lock': {
    viTitle: 'Khóa tầng khí quyển (Air Lock)',
    shortEffect: 'Vô hiệu hóa mọi tác động của thời tiết.',
    effect:
      'Khi Pokémon này có mặt trên sân, toàn bộ hiệu ứng tăng/giảm sát thương hay hồi phục từ thời tiết (Mưa, Nắng, Bão cát, Mưa đá) đều bị vô hiệu hóa.',
    flavor: 'Triệt tiêu mọi ảnh hưởng của thời tiết trong trận chiến.',
  },
  static: {
    viTitle: 'Tĩnh điện (Static)',
    shortEffect: 'Có 30% cơ hội làm đối thủ bị Tê liệt khi tiếp xúc vật lý.',
    effect:
      'Mỗi khi đối phương dùng chiêu thức tiếp xúc trực tiếp đánh trúng Pokémon này, kẻ tấn công có 30% xác suất rơi vào trạng thái Tê liệt (Paralysis).',
    flavor: 'Cơ thể tích tĩnh điện có thể làm tê liệt kẻ chạm vào.',
  },
  'solar-power': {
    viTitle: 'Năng lượng Mặt Trời (Solar Power)',
    shortEffect: 'Tăng 50% Công Phép dưới trời nắng nhưng mất 1/8 HP mỗi lượt.',
    effect:
      'Trong thời tiết Nắng gắt, chỉ số Công Phép (Special Attack) của Pokémon này tăng thêm 50%, đổi lại bị mất 1/8 lượng HP tối đa vào cuối mỗi lượt.',
    flavor: 'Dưới ánh nắng gắt, Công Phép tăng vọt nhưng HP giảm dần theo từng lượt.',
  },
  technician: {
    viTitle: 'Kỹ thuật viên (Technician)',
    shortEffect: 'Tăng 50% sức mạnh cho các chiêu có uy lực gốc từ 60 trở xuống.',
    effect:
      'Mọi chiêu thức có chỉ số sức mạnh cơ bản (Base Power) ≤ 60 do Pokémon này sử dụng đều được nhân 1.5x sát thương.',
    flavor: 'Phát huy tối đa uy lực của các chiêu thức cơ bản có lực đánh nhẹ.',
  },
  adaptability: {
    viTitle: 'Thích nghi (Adaptability)',
    shortEffect: 'Tăng hệ số đồng hệ (STAB) từ 1.5x lên 2.0x.',
    effect:
      'Các chiêu thức cùng hệ với Pokémon này nhận được mức thưởng sát thương đồng hệ gấp đôi (2.0x) thay vì 1.5x thông thường.',
    flavor: 'Khuếch đại sức mạnh các chiêu thức cùng hệ với bản thân.',
  },
  'magic-guard': {
    viTitle: 'Lá chắn phép (Magic Guard)',
    shortEffect: 'Chỉ nhận sát thương từ các đòn tấn công trực tiếp.',
    effect:
      'Miễn nhiễm mọi sát thương gián tiếp như Độc, Bỏng, Bão cát, bẫy gai (Stealth Rock / Spikes), phản sát thương (Recoil) hay Life Orb.',
    flavor: 'Ngăn chặn hoàn toàn mọi nguồn sát thương gián tiếp ngoài đòn đánh.',
  },
  multiscale: {
    viTitle: 'Đa vảy (Multiscale)',
    shortEffect: 'Giảm một nửa sát thương nhận vào khi HP đang đầy.',
    effect:
      'Khi HP ở mức tối đa (100%), mọi sát thương từ đòn tấn công nhắm vào Pokémon này đều được giảm đi 50%.',
    flavor: 'Giảm một nửa sát thương phải chịu khi sinh lực còn nguyên vẹn.',
  },
  prankster: {
    viTitle: 'Siêu quậy (Prankster)',
    shortEffect: 'Tăng +1 độ ưu tiên cho các chiêu thức trạng thái (Status).',
    effect:
      'Mọi chiêu thức không gây sát thương (Status moves) được cộng thêm +1 mức ưu tiên ra đòn. Không có tác dụng lên mục tiêu mang hệ Bóng Tối.',
    flavor: 'Ra đòn các chiêu thức hỗ trợ và trạng thái trước đối thủ.',
  },
  protean: {
    viTitle: 'Biến hóa (Protean)',
    shortEffect: 'Đổi hệ của Pokémon sang đúng hệ của chiêu thức sắp dùng.',
    effect:
      'Ngay trước khi thi triển chiêu thức, hệ của Pokémon này biến đổi thành hệ của chiêu thức đó để luôn nhận thưởng sát thương đồng hệ (STAB).',
    flavor: 'Thay đổi hệ nguyên tố theo chiêu thức chuẩn bị tung ra.',
  },
  'cursed-body': {
    viTitle: 'Lời nguyền thể xác (Cursed Body)',
    shortEffect: 'Có 30% cơ hội vô hiệu hóa chiêu thức vừa đánh trúng mình.',
    effect:
      'Khi bị đối thủ đánh trúng, có 30% xác suất khóa chiêu thức đó của kẻ tấn công trong 4 lượt tiếp theo (hiệu ứng Disable).',
    flavor: 'Có khả năng nguyền rủa và vô hiệu hóa chiêu thức vừa tấn công.',
  },
  justified: {
    viTitle: 'Tâm thế chính nghĩa (Justified)',
    shortEffect: 'Tăng 1 bậc Tấn công khi trúng chiêu hệ Bóng Tối.',
    effect:
      'Mỗi khi bị trúng đòn tấn công hệ Bóng Tối (Dark), chỉ số Tấn công vật lý của Pokémon này tăng thêm 1 bậc.',
    flavor: 'Sức mạnh tăng lên khi bị tấn công bởi chiêu thức hệ Bóng Tối.',
  },
}
