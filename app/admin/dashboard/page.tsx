"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"
import { BarChart as LucideBarChart, PieChart, DollarSign, Ticket, AlertTriangle, Train } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from "recharts"
import { dashboardApi } from "@/lib/api/dashboard"

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

// Mock data
const mockData = {
  overview: {
    totalRevenue: 352500000,
    revenueGrowth: 20.1,
    totalTickets: 1234,
    ticketsLast24h: 180,
    cancellationRate: 12.5,
    cancellationRateChange: -2.5,
    activeTrips: 42,
    tripsChange: 3
  },
  dailyRevenue: {
    dates: ["2025-05-01", "2025-05-02", "2025-05-03", "2025-05-04", "2025-05-05"],
    revenue: [15000000, 18000000, 16500000, 20000000, 17500000],
    tickets: [120, 150, 130, 180, 160]
  },
  popularRoutes: [
    { id: 1, name: "Hà Nội - Sài Gòn", bookings: 450, revenue: 90000000 },
    { id: 2, name: "Hà Nội - Đà Nẵng", bookings: 320, revenue: 64000000 },
    { id: 3, name: "Sài Gòn - Nha Trang", bookings: 280, revenue: 56000000 },
    { id: 4, name: "Hà Nội - Hải Phòng", bookings: 250, revenue: 25000000 },
    { id: 5, name: "Sài Gòn - Đà Lạt", bookings: 200, revenue: 40000000 }
  ],
  ticketDistribution: [
    { name: "Toa VIP", count: 150, percentage: 12 },
    { name: "Toa 1", count: 450, percentage: 36 },
    { name: "Toa 2", count: 380, percentage: 31 },
    { name: "Toa 3", count: 254, percentage: 21 }
  ],
  revenueAnalysis: {
    periods: ["T1", "T2", "T3", "T4", "T5", "T6"],
    revenue: [250000000, 280000000, 300000000, 320000000, 350000000, 352500000],
    growth: [0, 12, 7.1, 6.7, 9.4, 0.7],
    averageTicketPrice: [285000, 290000, 295000, 300000, 305000, 310000]
  },
  customerAnalysis: {
    totalCustomers: 15678,
    newCustomers: 234,
    returningCustomers: 1234,
    customerSegments: [
      { segment: "Khách thường xuyên", count: 5678, percentage: 36 },
      { segment: "Khách mới", count: 2340, percentage: 15 },
      { segment: "Khách VIP", count: 890, percentage: 6 },
      { segment: "Khách thường", count: 6770, percentage: 43 }
    ],
    bookingFrequency: [
      { frequency: "1 lần", count: 5678 },
      { frequency: "2-5 lần", count: 6780 },
      { frequency: "6-10 lần", count: 2340 },
      { frequency: ">10 lần", count: 890 }
    ]
  },
  reports: [
    {
      id: 1,
      title: "Báo cáo doanh thu tháng 5/2025",
      createdAt: "2025-05-31",
      downloadUrl: "/reports/may-2025.xlsx"
    },
    {
      id: 2,
      title: "Báo cáo doanh thu tháng 4/2025",
      createdAt: "2025-04-30",
      downloadUrl: "/reports/april-2025.xlsx"
    },
    {
      id: 3,
      title: "Báo cáo doanh thu tháng 3/2025",
      createdAt: "2025-03-31",
      downloadUrl: "/reports/march-2025.xlsx"
    }
  ],
  notifications: [
    {
      id: 1,
      type: "warning",
      title: "Cảnh báo: Tỷ lệ hủy vé cao",
      message: "Tỷ lệ hủy vé cho tuyến Hà Nội - Sài Gòn đang cao hơn bình thường.",
      createdAt: "2025-05-30T15:37:45"
    },
    {
      id: 2,
      type: "info",
      title: "Thông báo: Cập nhật hệ thống",
      message: "Hệ thống sẽ được nâng cấp vào ngày 02/06/2025 từ 00:00 - 03:00.",
      createdAt: "2025-05-29T10:15:22"
    },
    {
      id: 3,
      type: "success",
      title: "Thông báo: Khuyến mãi mới",
      message: "Khuyến mãi mùa hè 2025 đã được kích hoạt. Giảm 20% cho tất cả các chuyến.",
      createdAt: "2025-05-28T09:45:12"
    }
  ]
}

export default function AdminDashboard() {
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [data, setData] = useState(mockData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [
          overview,
          dailyRevenue,
          popularRoutes,
          ticketDistribution,
          revenueAnalysis
        ] = await Promise.all([
          dashboardApi.getOverview(),
          dashboardApi.getDailyRevenue(),
          dashboardApi.getPopularRoutes(),
          dashboardApi.getTicketDistribution(),
          dashboardApi.getRevenueAnalysis()
        ])

        setData({
          ...mockData,
          overview,
          dailyRevenue,
          popularRoutes,
          ticketDistribution,
          revenueAnalysis
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        if (error instanceof Error) {
          if (error.message === "NO_TOKEN") {
            router.push("/login")
            return
          }
          setError(error.message)
        } else {
          setError('Failed to load dashboard data')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleDownloadReport = async () => {
    try {
      setDownloading(true)
      const currentDate = new Date()
      const month = currentDate.getMonth() + 1 // JavaScript months are 0-based
      const year = currentDate.getFullYear()
      
      await dashboardApi.downloadReport(month, year)
    } catch (error) {
      console.error('Error downloading report:', error)
      if (error instanceof Error) {
        if (error.message === "NO_TOKEN") {
          router.push("/login")
          return
        }
        setError(error.message)
      } else {
        setError('Failed to download report')
      }
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Bảng điều khiển</h2>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={handleDownloadReport}
            disabled={downloading}
          >
            {downloading ? "Đang tải..." : "Tải xuống báo cáo"}
          </Button>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="analytics">Phân tích</TabsTrigger>
          <TabsTrigger value="reports">Báo cáo</TabsTrigger>
          <TabsTrigger value="notifications">Thông báo</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(data.overview.totalRevenue)}đ</div>
                <p className="text-xs text-muted-foreground">
                  <span className={data.overview.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                    {data.overview.revenueGrowth >= 0 ? "+" : ""}{data.overview.revenueGrowth}%
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
                <div className="text-2xl font-bold">{data.overview.totalTickets}</div>
                <p className="text-xs text-muted-foreground">+{data.overview.ticketsLast24h} vé trong 24 giờ qua</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tỷ lệ hủy vé</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.overview.cancellationRate}%</div>
                <p className="text-xs text-muted-foreground">
                  <span className={data.overview.cancellationRateChange >= 0 ? "text-red-600" : "text-green-600"}>
                    {data.overview.cancellationRateChange >= 0 ? "+" : ""}{data.overview.cancellationRateChange}%
                  </span> so với tháng trước
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chuyến tàu hoạt động</CardTitle>
                <Train className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.overview.activeTrips}</div>
                <p className="text-xs text-muted-foreground">+{data.overview.tripsChange} chuyến so với tuần trước</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Doanh thu theo ngày</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data.dailyRevenue.dates.map((date, index) => ({
                        date: new Date(date).toLocaleDateString("vi-VN"),
                        revenue: data.dailyRevenue.revenue[index],
                        tickets: data.dailyRevenue.tickets[index]
                      }))}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis 
                        yAxisId="left"
                        orientation="left"
                        tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === "revenue") {
                            return [formatPrice(Number(value)) + "đ", "Doanh thu"]
                          }
                          return [value, "Số vé"]
                        }}
                      />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.3}
                        name="revenue"
                      />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="tickets"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        fillOpacity={0.3}
                        name="tickets"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Tuyến đường phổ biến</CardTitle>
                <CardDescription>Top 5 tuyến đường được đặt nhiều nhất</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.popularRoutes.map((route) => (
                    <div key={route.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{route.name}</div>
                        <div className="text-sm text-muted-foreground">{route.bookings} lượt đặt</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatPrice(route.revenue)}đ</div>
                        <div className="text-sm text-muted-foreground">Doanh thu</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Lịch</CardTitle>
                <CardDescription>Lịch chuyến tàu và sự kiện</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
              </CardContent>
            </Card>
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Phân bổ loại vé</CardTitle>
                <CardDescription>Thống kê theo loại toa và ghế</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.ticketDistribution.map((item) => (
                    <div key={item.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.percentage}%</div>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full">
                        <div
                          className="h-2 bg-primary rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">{item.count} vé</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Phân tích doanh thu</CardTitle>
                <CardDescription>Phân tích chi tiết doanh thu theo thời gian</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.revenueAnalysis.periods.map((period, index) => ({
                        period,
                        revenue: data.revenueAnalysis.revenue[index],
                        growth: data.revenueAnalysis.growth[index]
                      }))}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis 
                        yAxisId="left"
                        orientation="left"
                        tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                        label={{ value: 'Doanh thu (VNĐ)', angle: -90, position: 'insideLeft' }}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        tickFormatter={(value) => `${value}%`}
                        label={{ value: 'Tăng trưởng (%)', angle: 90, position: 'insideRight' }}
                      />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === "revenue") {
                            return [formatPrice(Number(value)) + "đ", "Doanh thu"]
                          }
                          if (name === "growth") {
                            return [`${value}%`, "Tăng trưởng"]
                          }
                          return [value, name]
                        }}
                      />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="revenue"
                        fill="#8884d8"
                        name="Doanh thu"
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="growth"
                        fill="#82ca9d"
                        name="Tăng trưởng"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Phân tích khách hàng</CardTitle>
                <CardDescription>Thông tin về khách hàng và hành vi đặt vé</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium">Tổng số khách hàng</div>
                    <div className="text-2xl font-bold mt-1">{data.customerAnalysis.totalCustomers}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      +{data.customerAnalysis.newCustomers} khách hàng mới
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Phân khúc khách hàng</div>
                    <div className="mt-2 space-y-2">
                      {data.customerAnalysis.customerSegments.map((segment) => (
                        <div key={segment.segment} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">{segment.segment}</div>
                            <div className="text-sm text-muted-foreground">{segment.percentage}%</div>
                          </div>
                          <div className="h-2 w-full bg-secondary rounded-full">
                            <div
                              className="h-2 bg-primary rounded-full"
                              style={{ width: `${segment.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Báo cáo doanh thu</CardTitle>
              <CardDescription>Xem và tải xuống báo cáo doanh thu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.reports.map((report) => (
                  <div key={report.id} className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{report.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Tạo ngày: {new Date(report.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={async () => {
                          try {
                            setDownloading(true)
                            // Extract month and year from report title (e.g., "Báo cáo doanh thu tháng 5/2025")
                            const match = report.title.match(/tháng (\d+)\/(\d+)/)
                            if (match) {
                              const month = parseInt(match[1])
                              const year = parseInt(match[2])
                              await dashboardApi.downloadReport(month, year)
                            } else {
                              setError('Không thể xác định tháng và năm từ tiêu đề báo cáo')
                            }
                          } catch (error) {
                            console.error('Error downloading report:', error)
                            if (error instanceof Error) {
                              if (error.message === "NO_TOKEN") {
                                router.push("/login")
                                return
                              }
                              setError(error.message)
                            } else {
                              setError('Failed to download report')
                            }
                          } finally {
                            setDownloading(false)
                          }
                        }}
                        disabled={downloading}
                      >
                        {downloading ? "Đang tải..." : "Tải xuống"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thông báo hệ thống</CardTitle>
              <CardDescription>Quản lý thông báo và cảnh báo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.notifications.map((notification) => (
                  <div key={notification.id}>
                    <div className={`border-l-4 pl-4 py-2 ${
                      notification.type === "warning" ? "border-yellow-500" :
                      notification.type === "success" ? "border-green-500" :
                      "border-blue-500"
                    }`}>
                      <h3 className="font-medium">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                    <Separator className="my-4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
