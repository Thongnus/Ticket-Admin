const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"

export interface ApiResponse<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    offset: number
    paged: boolean
    unpaged: boolean
  }
  last: boolean
  totalElements: number
  totalPages: number
  size: number
  number: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  first: boolean
  numberOfElements: number
  empty: boolean
}

export interface Role {
  id: number
  name: string
}

export interface UserDto {
  userId: number
  username: string
  password?: string
  fullName: string | null
  email: string | null
  phone: string | null
  address: string | null
  idCard: string | null
  dateOfBirth: string | null
  createdAt: number[] | null
  updatedAt: number[] | null
  roles: Role[]
  lastLogin: number[] | null
  status: string
}

export interface CreateUserRequest {
  username: string
  password: string
  fullName?: string
  email?: string
  phone?: string
  address?: string
  idCard?: string
  dateOfBirth?: string
  roles?: string[]
  status?: string
}

export interface UpdateUserRequest {
  username?: string
  fullName?: string
  email?: string
  phone?: string
  address?: string
  idCard?: string
  dateOfBirth?: string
  roles?: string[]
  status?: string
}

export interface FetchUsersParams {
  searchTerm?: string
  role?: string
  status?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: "asc" | "desc"
}

export interface ApiError {
  message: string
  status?: number
  code?: string
  details?: any
}

// Utility function to convert array date to Date object
export function arrayToDate(dateArray: number[] | null): Date | null {
  if (!dateArray || dateArray.length < 3) return null
  const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray
  return new Date(year, month - 1, day, hour, minute, second)
}

// Utility function to format date for display
export function formatDate(dateArray: number[] | null): string {
  const date = arrayToDate(dateArray)
  if (!date) return "Chưa cập nhật"
  return date.toLocaleDateString("vi-VN")
}

// Utility function to format datetime for display
export function formatDateTime(dateArray: number[] | null): string {
  const date = arrayToDate(dateArray)
  if (!date) return "Chưa cập nhật"
  return date.toLocaleString("vi-VN")
}

// Enhanced fetch function with timeout and error handling
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 15000): Promise<Response> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === "AbortError") {
      throw new ApiError({
        message: "Request timeout - API server may be unavailable",
        code: "TIMEOUT_ERROR",
      })
    }
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new ApiError({
        message: "Network error - Cannot connect to API server",
        code: "NETWORK_ERROR",
      })
    }
    throw error
  }
}

// Custom error class for API errors
class ApiError extends Error {
  status?: number
  code?: string
  details?: any

  constructor({
    message,
    status,
    code,
    details,
  }: {
    message: string
    status?: number
    code?: string
    details?: any
  }) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
    this.details = details
  }
}

// Utility function to build query parameters
const buildQueryParams = (params: FetchUsersParams): URLSearchParams => {
  const queryParams = new URLSearchParams()

  // Add pagination parameters
  if (params.page !== undefined) {
    queryParams.append("page", params.page.toString())
  }
  if (params.pageSize !== undefined) {
    queryParams.append("pageSize", params.pageSize.toString())
  }

  // Add filter parameters
  if (params.searchTerm && params.searchTerm.trim()) {
    queryParams.append("searchTerm", params.searchTerm.trim())
  }
  if (params.role && params.role !== "all") {
    queryParams.append("role", params.role)
  }
  if (params.status && params.status !== "all") {
    queryParams.append("status", params.status)
  }

  // Add sorting parameters
  if (params.sortBy) {
    queryParams.append("sortBy", params.sortBy)
  }
  if (params.sortDirection) {
    queryParams.append("sortDirection", params.sortDirection)
  }

  return queryParams
}

// Validate API response structure
const validateApiResponse = (data: any): data is ApiResponse<UserDto> => {
  return (
    data &&
    typeof data === "object" &&
    Array.isArray(data.content) &&
    typeof data.totalElements === "number" &&
    typeof data.totalPages === "number" &&
    typeof data.size === "number" &&
    typeof data.number === "number"
  )
}

// Parse and validate user data
const parseUserData = (userData: any): UserDto => {
  if (!userData || typeof userData !== "object") {
    throw new ApiError({
      message: "Invalid user data format",
      code: "INVALID_DATA_FORMAT",
    })
  }

  return {
    userId: userData.userId,
    username: userData.username,
    fullName: userData.fullName || null,
    email: userData.email || null,
    phone: userData.phone || null,
    address: userData.address || null,
    idCard: userData.idCard || null,
    dateOfBirth: userData.dateOfBirth || null,
    createdAt: userData.createdAt || null,
    updatedAt: userData.updatedAt || null,
    roles: Array.isArray(userData.roles) ? userData.roles : [],
    lastLogin: userData.lastLogin || null,
    status: userData.status || "active",
  }
}

/**
 * Fetch users from the API with comprehensive error handling and parameter support
 *
 * @param params - Parameters for fetching users
 * @returns Promise<ApiResponse<UserDto>> - Paginated user data
 * @throws ApiError - When API call fails or data is invalid
 */
export const fetchUsers = async (params: FetchUsersParams = {}): Promise<ApiResponse<UserDto>> => {
  try {
    // Validate environment variable
    if (!API_BASE_URL) {
      throw new ApiError({
        message: "API base URL is not configured",
        code: "MISSING_CONFIG",
      })
    }

    // Set default parameters
    const defaultParams: FetchUsersParams = {
      page: 0,
      pageSize: 10,
      role: "all",
      status: "all",
      sortBy: "createdAt",
      sortDirection: "desc",
      ...params,
    }

    // Build query parameters
    const queryParams = buildQueryParams(defaultParams)
    const url = `${API_BASE_URL}/users?${queryParams.toString()}`

    console.log(`[API] Fetching users from: ${url}`)

    // Make API request
    const response = await fetchWithTimeout(url, {
      method: "GET",
      headers: {
        "Cache-Control": "no-cache",
      },
    })

    // Handle HTTP errors
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      let errorDetails = null

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
        errorDetails = errorData
      } catch {
        // If response is not JSON, use status text
      }

      throw new ApiError({
        message: errorMessage,
        status: response.status,
        code: `HTTP_${response.status}`,
        details: errorDetails,
      })
    }

    // Parse response
    const data = await response.json()

    // Validate response structure
    if (!validateApiResponse(data)) {
      throw new ApiError({
        message: "Invalid API response format",
        code: "INVALID_RESPONSE_FORMAT",
        details: data,
      })
    }

    // Parse and validate user data
    const parsedUsers = data.content.map((user: any, index: number) => {
      try {
        return parseUserData(user)
      } catch (error) {
        console.error(`[API] Error parsing user at index ${index}:`, error)
        throw new ApiError({
          message: `Invalid user data at index ${index}`,
          code: "INVALID_USER_DATA",
          details: { index, userData: user },
        })
      }
    })

    const result: ApiResponse<UserDto> = {
      ...data,
      content: parsedUsers,
    }

    console.log(`[API] Successfully fetched ${result.content.length} users (${result.totalElements} total)`)
    return result
  } catch (error) {
    console.error("[API] Error fetching users:", error)

    // Re-throw ApiError instances
    if (error instanceof ApiError) {
      throw error
    }

    // Handle unexpected errors
    throw new ApiError({
      message: error.message || "Unknown error occurred while fetching users",
      code: "UNKNOWN_ERROR",
      details: error,
    })
  }
}

/**
 * Get detailed error message for user-friendly display
 */
export const getErrorMessage = (error: any): string => {
  if (error instanceof ApiError) {
    switch (error.code) {
      case "TIMEOUT_ERROR":
        return "Kết nối tới server bị timeout. Vui lòng thử lại."
      case "NETWORK_ERROR":
        return "Không thể kết nối tới server. Kiểm tra kết nối mạng."
      case "MISSING_CONFIG":
        return "Cấu hình API chưa được thiết lập."
      case "HTTP_401":
        return "Không có quyền truy cập. Vui lòng đăng nhập lại."
      case "HTTP_403":
        return "Không có quyền thực hiện thao tác này."
      case "HTTP_404":
        return "Không tìm thấy dữ liệu yêu cầu."
      case "HTTP_500":
        return "Lỗi server nội bộ. Vui lòng thử lại sau."
      case "INVALID_RESPONSE_FORMAT":
        return "Dữ liệu trả về từ server không đúng định dạng."
      case "INVALID_USER_DATA":
        return "Dữ liệu người dùng không hợp lệ."
      default:
        return error.message || "Đã xảy ra lỗi không xác định."
    }
  }
  return error.message || "Đã xảy ra lỗi không xác định."
}

// API functions
export const userApi = {
  // Get users with comprehensive parameter support
  getUsers: fetchUsers,

  // Create user
  createUser: async (userData: CreateUserRequest): Promise<UserDto> => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/users`, {
        method: "POST",
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new ApiError({
          message: errorData?.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          code: `HTTP_${response.status}`,
          details: errorData,
        })
      }

      const data = await response.json()
      return parseUserData(data)
    } catch (error) {
      console.error("Create user error:", error)
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError({
        message: error.message || "Failed to create user",
        code: "CREATE_USER_ERROR",
      })
    }
  },

  // Update user
  updateUser: async (userId: number, userData: UpdateUserRequest): Promise<UserDto> => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new ApiError({
          message: errorData?.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          code: `HTTP_${response.status}`,
          details: errorData,
        })
      }

      const data = await response.json()
      return parseUserData(data)
    } catch (error) {
      console.error("Update user error:", error)
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError({
        message: error.message || "Failed to update user",
        code: "UPDATE_USER_ERROR",
      })
    }
  },

  // Delete user
  deleteUser: async (userId: number): Promise<void> => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/users/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new ApiError({
          message: errorData?.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          code: `HTTP_${response.status}`,
          details: errorData,
        })
      }
    } catch (error) {
      console.error("Delete user error:", error)
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError({
        message: error.message || "Failed to delete user",
        code: "DELETE_USER_ERROR",
      })
    }
  },

  // Toggle user status
  toggleUserStatus: async (userId: number): Promise<UserDto> => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/users/${userId}/toggle-status`, {
        method: "PATCH",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new ApiError({
          message: errorData?.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          code: `HTTP_${response.status}`,
          details: errorData,
        })
      }

      const data = await response.json()
      return parseUserData(data)
    } catch (error) {
      console.error("Toggle user status error:", error)
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError({
        message: error.message || "Failed to toggle user status",
        code: "TOGGLE_STATUS_ERROR",
      })
    }
  },
}
