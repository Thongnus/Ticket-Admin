"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, Train, Ticket, AlertTriangle, CheckCircle, Clock, DollarSign, MapPin, Activity, AlertCircle, Settings, User } from "lucide-react"
import Link from "next/link"
// import { useWebSocket } from "@/hooks/useWebSocket"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

export async function refreshToken() {
  const refreshToken = localStorage.getItem("refreshToken")
  if (!refreshToken) {
    throw new Error("No refresh token found")
  }

  try {
    const response = await fetch(`${baseUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Refresh-Token": refreshToken,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to refresh token")
    }

    const data = await response.json()
    localStorage.setItem("token", data.token)
    return data.token
  } catch (error) {
    console.error("Error refreshing token:", error)
    // Clear local storage and redirect to login
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    throw error
  }
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token")
  if (!token) {
    throw new Error("NO_TOKEN")
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  }

  try {
    console.log("Fetching with auth:", `${baseUrl}${url}`)
    const response = await fetch(`${baseUrl}${url}`, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      // Token expired, try to refresh
      const newToken = await refreshToken()
      headers.Authorization = `Bearer ${newToken}`
      
      // Retry the request with new token
      return fetch(`${baseUrl}${url}`, {
        ...options,
        headers,
      })
    }

    return response
  } catch (error) {
    console.error("Error in fetchWithAuth:", error)
    throw error
  }
}

export default function AdminPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    activeTrains: 0,
    totalUsers: 0,
    totalRoutes: 0,
    delayedTrips: 0,
    completedTrips: 0,
    revenueGrowthPercentage: 0,
    ticketGrowthPercentage: 0,
  })
  // const { logs, isConnected, lastError } = useWebSocket()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetchWithAuth("/admin/stats/monthly")
        const data = await response.json()
        
        if (data.status === 200) {
          setStats({
            totalRevenue: data.data.totalRevenueCurrentMonth,
            totalBookings: data.data.ticketsSoldCurrentMonth,
            activeTrains: data.data.activeTrains,
            totalUsers: data.data.totalUsers,
            totalRoutes: data.data.activeRoutes,
            delayedTrips: data.data.delayedTrips,
            completedTrips: data.data.completedTrips,
            revenueGrowthPercentage: data.data.revenueGrowthPercentage,
            ticketGrowthPercentage: data.data.ticketGrowthPercentage,
          })
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
        if (error instanceof Error && error.message === "NO_TOKEN") {
          router.push("/login")
        }
      }
    }

    fetchStats()
  }, [router])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price)
  }

  const quickActions = [
    {
      title: "Quản lý tàu",
      description: "Thêm, sửa, xóa thông tin tàu",
      href: "/admin/trains",
      icon: Train,
      color: "bg-blue-500",
    },
    {
      title: "Quản lý ga",
      description: "Quản lý thông tin các ga tàu",
      href: "/admin/stations",
      icon: MapPin,
      color: "bg-cyan-500",
    },
    {
      title: "Quản lý tuyến đường",
      description: "Thiết lập các tuyến đường",
      href: "/admin/routes",
      icon: BarChart3,
      color: "bg-green-500",
    },
    {
      title: "Quản lý chuyến tàu",
      description: "Lập lịch và theo dõi chuyến tàu",
      href: "/admin/trips",
      icon: Clock,
      color: "bg-orange-500",
    },
    {
      title: "Quản lý đặt vé",
      description: "Xử lý đơn đặt vé",
      href: "/admin/bookings",
      icon: Ticket,
      color: "bg-purple-500",
    },
    {
      title: "Quản lý người dùng",
      description: "Quản lý tài khoản người dùng",
      href: "/admin/users",
      icon: Users,
      color: "bg-red-500",
    },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "CREATE":
        return <Activity className="h-4 w-4" />
      case "UPDATE":
        return <Settings className="h-4 w-4" />
      case "DELETE":
        return <AlertCircle className="h-4 w-4" />
      case "LOGIN":
        return <User className="h-4 w-4" />
      case "BOOKING":
        return <Ticket className="h-4 w-4" />
      case "TRAIN":
        return <Train className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "text-green-500"
      case "UPDATE":
        return "text-blue-500"
      case "DELETE":
        return "text-red-500"
      case "LOGIN":
        return "text-purple-500"
      default:
        return "text-gray-500"
    }
  }

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: vi,
      })
    } catch (error) {
      return "Vừa xong"
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trang quản trị</h1>
          <p className="text-muted-foreground">Chào mừng bạn đến với hệ thống quản lý Thông-Rail</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className={stats.delayedTrips > 0 ? "text-yellow-600" : "text-green-600"}>
            {stats.delayedTrips > 0 ? "Có chuyến tàu bị trễ" : "Hệ thống hoạt động bình thường"}
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu tháng</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}đ</div>
            <p className="text-xs text-muted-foreground">
              <span className={stats.revenueGrowthPercentage >= 0 ? "text-green-600" : "text-red-600"}>
                {stats.revenueGrowthPercentage >= 0 ? "+" : ""}{stats.revenueGrowthPercentage.toFixed(1)}%
              </span> so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vé đã bán</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              <span className={stats.ticketGrowthPercentage >= 0 ? "text-green-600" : "text-red-600"}>
                {stats.ticketGrowthPercentage >= 0 ? "+" : ""}{stats.ticketGrowthPercentage.toFixed(1)}%
              </span> so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tuyến đường</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRoutes}</div>
            <p className="text-xs text-muted-foreground">Tuyến đang hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tàu hoạt động</CardTitle>
            <Train className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTrains}</div>
            <p className="text-xs text-muted-foreground">{stats.delayedTrips} chuyến bị trễ</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Recent Activities */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Truy cập nhanh</CardTitle>
              <CardDescription>Các chức năng quản lý chính của hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {quickActions.map((action) => (
                  <Link key={action.href} href={action.href}>
                    <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                      <CardContent className="flex items-center space-x-4 p-4">
                        <div className={`rounded-lg p-2 ${action.color}`}>
                          <action.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{action.title}</h3>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>
              {/* {isConnected ? (
                <span className="flex items-center text-green-500">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Đang kết nối
                </span>
              ) : (
                <span className="flex items-center text-yellow-500">
                  <Clock className="mr-2 h-4 w-4" />
                  Đang kết nối lại...
                </span>
              )} */}
              <span className="flex items-center text-gray-500">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Tính năng tạm thời bị tắt
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* {lastError ? (
              <div className="text-red-500">{lastError}</div>
            ) : (
              <div className="space-y-4">
                {logs.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    Chưa có hoạt động nào
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-3">
                      <div className={`mt-1 ${getActivityColor(log.action)}`}>
                        {getActivityIcon(log.entityType)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">
                          {log.user?.username || "Hệ thống"} - {log.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(log.logTime)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )} */}
            <div className="text-center text-muted-foreground py-4">
              Tính năng WebSocket đã tạm thời bị tắt do vấn đề thư viện
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Tổng người dùng</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.totalUsers}</div>
            <p className="text-sm text-muted-foreground">Người dùng đã đăng ký</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Chuyến tàu trễ</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.delayedTrips}</div>
            <p className="text-sm text-muted-foreground">Cần cập nhật</p>
            <Link href="/admin/trips">
              <Button variant="outline" size="sm" className="mt-2">
                Xem chi tiết
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Chuyến hoàn thành</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.completedTrips}</div>
            <p className="text-sm text-muted-foreground">Chuyến tàu đã hoàn thành</p>
            <Link href="/admin/dashboard">
              <Button variant="outline" size="sm" className="mt-2">
                Xem báo cáo
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
