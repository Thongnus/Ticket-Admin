// Enum loại ghế từ database
export const SEAT_TYPES = {
  HARD_SEAT: 'hard_seat',
  SOFT_SEAT: 'soft_seat', 
  HARD_SLEEPER: 'hard_sleeper',
  SOFT_SLEEPER: 'soft_sleeper',
  VIP: 'vip'
} as const

// Alias tiếng Việt cho loại ghế
export const SEAT_TYPE_ALIASES = {
  [SEAT_TYPES.HARD_SEAT]: 'Ghế cứng',
  [SEAT_TYPES.SOFT_SEAT]: 'Ghế mềm',
  [SEAT_TYPES.HARD_SLEEPER]: 'Giường cứng',
  [SEAT_TYPES.SOFT_SLEEPER]: 'Giường mềm',
  [SEAT_TYPES.VIP]: 'VIP'
} as const

// Options cho dropdown/select
export const SEAT_TYPE_OPTIONS = [
  { value: SEAT_TYPES.HARD_SEAT, label: SEAT_TYPE_ALIASES[SEAT_TYPES.HARD_SEAT] },
  { value: SEAT_TYPES.SOFT_SEAT, label: SEAT_TYPE_ALIASES[SEAT_TYPES.SOFT_SEAT] },
  { value: SEAT_TYPES.HARD_SLEEPER, label: SEAT_TYPE_ALIASES[SEAT_TYPES.HARD_SLEEPER] },
  { value: SEAT_TYPES.SOFT_SLEEPER, label: SEAT_TYPE_ALIASES[SEAT_TYPES.SOFT_SLEEPER] },
  { value: SEAT_TYPES.VIP, label: SEAT_TYPE_ALIASES[SEAT_TYPES.VIP] }
]

// Helper function để lấy label tiếng Việt
export const getSeatTypeLabel = (type: string): string => {
  return SEAT_TYPE_ALIASES[type as keyof typeof SEAT_TYPE_ALIASES] || type
}

// Interface cho ticket distribution
export interface TicketDistribution {
  name: string
  count: number
  percentage: number
}

// Mapper từ database response sang display
export const mapSeatTypeDistribution = (data: Array<{name: string, count: number, percentage: number}>): TicketDistribution[] => {
  return data.map(item => ({
    name: getSeatTypeLabel(item.name),
    count: item.count,
    percentage: item.percentage
  }))
} 