import { authApi } from '../api'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"

interface DashboardOverviewResponse {
  totalRevenue: number
  revenueGrowth: number
  totalTickets: number
  ticketsLast24h: number
  cancellationRate: number
  cancellationRateChange: number
  activeTrips: number
  tripsChange: number
}

interface DailyRevenueResponse {
  dates: string[]
  revenue: number[]
  tickets: number[]
}

interface PopularRouteDTO {
  id: number
  name: string
  bookings: number
  revenue: number
}

interface TicketCarriageDistributionDTO {
  name: string
  count: number
  percentage: number
}

interface RevenueAnalysisResponse {
  periods: string[]
  revenue: number[]
  growth: number[]
  averageTicketPrice: number[]
}

const fetchWithAuth = async (url: string) => {
  let token = localStorage.getItem("token")
  if (!token) {
    throw new Error("NO_TOKEN")
  }

  try {
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (response.status === 401) {
      // Token expired, try to refresh
      token = await authApi.refreshToken()
      // Retry the request with new token
      const retryResponse = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (!retryResponse.ok) {
        throw new Error("Failed to fetch data after token refresh")
      }
      return retryResponse
    }

    if (!response.ok) {
      throw new Error("Failed to fetch data")
    }

    return response
  } catch (error: any) {
    console.error("Error fetching data:", error)
    throw error
  }
}

export const dashboardApi = {
  getOverview: async (): Promise<DashboardOverviewResponse> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/dashboard/overview`)
    return response.json()
  },

  getDailyRevenue: async (): Promise<DailyRevenueResponse> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/dashboard/daily-revenue`)
    return response.json()
  },

  getPopularRoutes: async (): Promise<PopularRouteDTO[]> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/dashboard/popular-routes`)
    return response.json()
  },

  getTicketDistribution: async (): Promise<TicketCarriageDistributionDTO[]> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/dashboard/ticket-distribution`)
    return response.json()
  },

  getRevenueAnalysis: async (): Promise<RevenueAnalysisResponse> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/dashboard/revenue-analysis`)
    return response.json()
  },

  downloadReport: async (month: number, year: number): Promise<Blob> => {
    try {
      let token = localStorage.getItem("token")
      if (!token) {
        throw new Error("NO_TOKEN")
      }

      // Fetch all necessary data for the report
      const [
        overview,
        dailyRevenue,
        popularRoutes,
        ticketDistribution,
        revenueAnalysis
      ] = await Promise.all([
        fetchWithAuth(`${API_BASE_URL}/admin/dashboard/overview`),
        fetchWithAuth(`${API_BASE_URL}/admin/dashboard/daily-revenue`),
        fetchWithAuth(`${API_BASE_URL}/admin/dashboard/popular-routes`),
        fetchWithAuth(`${API_BASE_URL}/admin/dashboard/ticket-distribution`),
        fetchWithAuth(`${API_BASE_URL}/admin/dashboard/revenue-analysis`)
      ]);

      // Combine all data into a single report request
      const reportData = {
        month,
        year,
        overview: await overview.json(),
        dailyRevenue: await dailyRevenue.json(),
        popularRoutes: await popularRoutes.json(),
        ticketDistribution: await ticketDistribution.json(),
        revenueAnalysis: await revenueAnalysis.json()
      };

      // Send the combined data to generate the report
      const response = await fetch(`${API_BASE_URL}/admin/dashboard/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        body: JSON.stringify(reportData)
      });

      if (response.status === 401) {
        // Token expired, try to refresh
        token = await authApi.refreshToken()
        // Retry the request with new token
        const retryResponse = await fetch(`${API_BASE_URL}/admin/dashboard/reports/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          },
          body: JSON.stringify(reportData)
        });

        if (!retryResponse.ok) {
          throw new Error("Failed to download report after token refresh")
        }
        return retryResponse.blob()
      }

      if (!response.ok) {
        throw new Error("Failed to download report")
      }

      // Get filename from Content-Disposition header if available
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `bao-cao-doanh-thu-${month}-${year}.xlsx`
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '')
        }
      }

      const blob = await response.blob()
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return blob
    } catch (error) {
      console.error('Error downloading report:', error)
      throw error
    }
  }
} 