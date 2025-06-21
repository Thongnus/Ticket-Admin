import { authApi } from "../api"

export interface StationDto {
  stationId: number
  stationName: string
  location: string
  address: string
  city: string
  province: string
  phone: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface PageResponse<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      sorted: boolean
      unsorted: boolean
      empty: boolean
    }
    offset: number
    paged: boolean
    unpaged: boolean
  }
  last: boolean
  totalElements: number
  totalPages: number
  first: boolean
  numberOfElements: number
  size: number
  number: number
  sort: {
    sorted: boolean
    unsorted: boolean
    empty: boolean
  }
  empty: boolean
}

export const stationsApi = {
  // Lấy tất cả ga (không phân trang)
  getAllStations: async (): Promise<StationDto[]> => {
    const response = await authApi.fetchWithAuth("/stations")
    if (!response.ok) {
      throw new Error("Failed to fetch stations")
    }
    return response.json()
  },

  // Lấy danh sách ga có phân trang
  getPagedStations: async (page: number, size: number): Promise<PageResponse<StationDto>> => {
    const response = await authApi.fetchWithAuth(`/stations/paged?page=${page}&size=${size}`)
    if (!response.ok) {
      throw new Error("Failed to fetch stations")
    }
    return response.json()
  },

  // Lấy thông tin ga theo ID
  getStationById: async (id: number): Promise<StationDto> => {
    const response = await authApi.fetchWithAuth(`/stations/${id}`)
    if (!response.ok) {
      throw new Error("Failed to fetch station")
    }
    return response.json()
  },

  // Lấy danh sách ga theo trạng thái
  getStationsByStatus: async (status: string): Promise<StationDto[]> => {
    const response = await authApi.fetchWithAuth(`/stations/status/${status}`)
    if (!response.ok) {
      throw new Error("Failed to fetch stations by status")
    }
    return response.json()
  },

  // Tìm kiếm ga
  searchStations: async (keyword: string): Promise<StationDto[]> => {
    const response = await authApi.fetchWithAuth(`/stations/search?keyword=${encodeURIComponent(keyword)}`)
    if (!response.ok) {
      throw new Error("Failed to search stations")
    }
    return response.json()
  },

  // Tạo ga mới
  createStation: async (stationData: Omit<StationDto, "stationId" | "createdAt" | "updatedAt">): Promise<StationDto> => {
    const response = await authApi.fetchWithAuth("/stations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stationData),
    })
    if (!response.ok) {
      throw new Error("Failed to create station")
    }
    return response.json()
  },

  // Cập nhật thông tin ga
  updateStation: async (id: number, stationData: Partial<StationDto>): Promise<StationDto> => {
    const response = await authApi.fetchWithAuth(`/stations/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stationData),
    })
    if (!response.ok) {
      throw new Error("Failed to update station")
    }
    return response.json()
  },

  // Xóa ga
  deleteStation: async (id: number): Promise<void> => {
    const response = await authApi.fetchWithAuth(`/stations/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      throw new Error("Failed to delete station")
    }
  },
} 