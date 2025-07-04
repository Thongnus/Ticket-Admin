"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Eye, MoreHorizontal, Search, X, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getBookings, cancelBookingByAdmin } from "@/lib/api/bookings"

// Giao diện UserDto
interface UserDto {
  userId: number
  username: string
  fullName: string | null
  email: string | null
  // ... các trường khác nếu cần
}

interface TripDto {
  tripId: number
  tripCode: string
  departureTime: string
  arrivalTime: string
  route: {
    routeId: number
    routeName: string
    originStationName: string
    destinationStationName: string
    // ... các trường khác nếu cần
  }
  // ... các trường khác nếu cần
}

// Giao diện Booking
interface Booking {
  bookingId: number
  bookingCode: string
  bookingDate: string
  totalAmount: number
  paymentStatus: string
  bookingStatus: string
  paymentMethod: string
  paymentDate: string | null
  createdAt: string
  updatedAt: string
  contactEmail: string
  contactPhone: string
  user: UserDto
  tripDto: TripDto
  ticketCount?: number | null
  passengerTicketDtos?: {
    passengerName: string
    identityCard: string
  }[]
}

export default function BookingsManagement() {
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

  const paymentStatusOptions = [
    { value: "pending", label: "Chờ thanh toán", color: "bg-yellow-100 text-yellow-800" },
    { value: "paid", label: "Đã thanh toán", color: "bg-green-100 text-green-800" },
    { value: "refunded", label: "Đã hoàn tiền", color: "bg-blue-100 text-blue-800" },
    { value: "cancelled", label: "Đã hủy", color: "bg-red-100 text-red-800" },
    { value: "refund_pending", label: "Chờ hoàn tiền", color: "bg-orange-100 text-orange-800" },
    { value: "refund_failed", label: "Hoàn tiền thất bại", color: "bg-gray-100 text-gray-800" },
  ]

  const bookingStatusOptions = [
    { value: "pending", label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-800" },
    { value: "confirmed", label: "Đã xác nhận", color: "bg-green-100 text-green-800" },
    { value: "pending_cancel", label: "Đang chờ hủy", color: "bg-purple-100 text-purple-800" },
    { value: "cancelled", label: "Đã hủy", color: "bg-red-100 text-red-800" },
    { value: "refund_processing", label: "Đang hoàn tiền", color: "bg-orange-100 text-orange-800" },
    { value: "refund_failed", label: "Hoàn tiền không thành công", color: "bg-gray-100 text-gray-800" },
    { value: "completed", label: "Hoàn thành", color: "bg-blue-100 text-blue-800" },
    { value: "refunded", label: "Đã hoàn tiền", color: "bg-blue-100 text-blue-800" },
  ]

  const paymentMethods = [
    { value: "vnPay", label: "VNPay" },
    { value: "credit_card", label: "Thẻ tín dụng" },
    { value: "bank_transfer", label: "Chuyển khoản" },
    { value: "e_wallet", label: "Ví điện tử" },
    { value: "cash", label: "Tiền mặt" },
  ]

  // Lấy danh sách đặt vé
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const data = await getBookings()
        if (!Array.isArray(data.content)) {
          throw new Error("Trường 'content' không phải mảng")
        }
        setBookings(data.content || [])
      } catch (error) {
        console.error("[Bookings] Lỗi:", error)
        setBookings([])
        toast({
          title: "Lỗi",
          description: error instanceof Error ? error.message : "Không thể tải danh sách đặt vé.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [toast])

  // Lọc phía client
  const filteredBookings = bookings.filter((booking: Booking) => {
    const matchesSearch =
      booking.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.passengerTicketDtos || []).some(p =>
        p.identityCard?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    const matchesStatus = statusFilter === "all" || booking.bookingStatus.toLowerCase() === statusFilter
    const matchesPayment = paymentFilter === "all" || booking.paymentStatus.toLowerCase() === paymentFilter
    return matchesSearch && matchesStatus && matchesPayment
  })

  // Định dạng giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
  }

  // Chuyển string ngày thành Date
  const parseApiDate = (dateString: string | null): Date | null => {
    if (!dateString) return null
    // Hỗ trợ cả định dạng "YYYY-MM-DD HH:mm:ss" và ISO
    const isoString = dateString.includes('T') ? dateString : dateString.replace(' ', 'T')
    const date = new Date(isoString)
    return isNaN(date.getTime()) ? null : date
  }

  // Lấy badge trạng thái thanh toán
  const getPaymentStatusBadge = (status: string) => {
    const statusOption = paymentStatusOptions.find((option) => option.value === status.toLowerCase())
    return <Badge className={statusOption?.color || "bg-gray-100 text-gray-800"}>{statusOption?.label || status}</Badge>
  }

  // Lấy badge trạng thái đặt vé
  const getBookingStatusBadge = (status: string) => {
    const statusOption = bookingStatusOptions.find((option) => option.value === status.toLowerCase())
    return <Badge className={statusOption?.color || "bg-gray-100 text-gray-800"}>{statusOption?.label || status}</Badge>
  }

  // Lấy tên phương thức thanh toán
  const getPaymentMethodLabel = (method: string) => {
    const paymentMethod = paymentMethods.find((m) => m.value === method)
    return paymentMethod?.label || method
  }

  // Xem chi tiết
  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsDetailDialogOpen(true)
  }

  // Cập nhật trạng thái (local)
  const handleUpdateStatus = (bookingId: number, newStatus: string) => {
    setBookings(
      bookings.map((booking) =>
        booking.bookingId === bookingId ? { ...booking, bookingStatus: newStatus } : booking,
      ),
    )
    toast({
      title: "Cập nhật thành công",
      description: "Trạng thái đặt vé đã được cập nhật.",
    })
  }

  // Hủy đặt vé (gọi API)
  const handleCancelBooking = async (bookingId: number) => {
    try {
      await cancelBookingByAdmin(bookingId)
      setBookings(
        bookings.map((booking) =>
          booking.bookingId === bookingId ? { ...booking, bookingStatus: "cancelled", paymentStatus: "cancelled" } : booking,
        ),
      )
      toast({
        title: "Hủy thành công",
        description: "Đặt vé đã được hủy.",
      })
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể hủy đặt vé.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý đặt vé</h2>
          <p className="text-muted-foreground">Quản lý và theo dõi các đơn đặt vé trong hệ thống</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách đặt vé</CardTitle>
          <CardDescription>Tổng cộng {filteredBookings.length} đơn đặt vé</CardDescription>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo mã đặt vé, tên khách hàng, email..."
                value={searchTerm}
                onChange={(e: { target: { value: any } }) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái đặt vé" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {bookingStatusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái thanh toán" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả thanh toán</SelectItem>
                {paymentStatusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Không tìm thấy đơn đặt vé nào.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đặt vé</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Hành khách/CMND</TableHead>
                  <TableHead>Chuyến tàu</TableHead>
                  <TableHead>Số vé</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Thanh toán</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày đặt</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking: Booking) => (
                  <TableRow key={booking.bookingId}>
                    <TableCell className="font-medium">{booking.bookingCode}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{booking.user?.fullName || booking.user?.username || null }</div>
                        <div className="text-sm text-muted-foreground">{booking.contactEmail || booking.user?.email || null }</div>
                        <div className="text-sm text-muted-foreground">{booking.contactPhone || null }</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {booking.passengerTicketDtos && booking.passengerTicketDtos.length > 0 ? (
                        <div className="space-y-1">
                          {booking.passengerTicketDtos.map((p, idx) => (
                            <div key={idx}>
                              <span className="font-medium">{p.passengerName}</span>
                              <span className="ml-2 text-xs text-muted-foreground">({p.identityCard})</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{booking.tripDto?.tripCode || "N/A"}</div>
                        <div className="text-sm text-muted-foreground">{booking.tripDto?.route?.routeName || "N/A"}</div>
                      </div>
                    </TableCell>
                    <TableCell>{booking.ticketCount || "N/A"} vé</TableCell>
                    <TableCell>{formatPrice(booking.totalAmount)}</TableCell>
                    <TableCell>{getPaymentStatusBadge(booking.paymentStatus)}</TableCell>
                    <TableCell>{getBookingStatusBadge(booking.bookingStatus)}</TableCell>
                    <TableCell>
                      {parseApiDate(booking.bookingDate)?.toLocaleDateString("vi-VN") || "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Mở menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(booking)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          {booking.bookingStatus.toLowerCase() === "pending" && (
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(booking.bookingId, "confirmed")}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Xác nhận
                            </DropdownMenuItem>
                          )}
                          {booking.bookingStatus.toLowerCase() !== "cancelled" && (
                            <DropdownMenuItem
                              onClick={() => handleCancelBooking(booking.bookingId)}
                              className="text-red-600"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Hủy đặt vé
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog chi tiết đặt vé */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chi tiết đặt vé</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về đơn đặt vé {selectedBooking?.bookingCode || ""}
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Thông tin khách hàng</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Tên:</span>{" "}
                      {selectedBooking.user.fullName || selectedBooking.user.username}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedBooking.contactEmail || selectedBooking.user.email || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Số điện thoại:</span>{" "}
                      {selectedBooking.contactPhone || "N/A"}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Thông tin chuyến đi</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Mã chuyến:</span>{" "}
                      {selectedBooking.tripDto?.tripCode || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Tuyến:</span>{" "}
                      {selectedBooking.tripDto?.route?.routeName || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Khởi hành:</span>{" "}
                      {selectedBooking.tripDto?.departureTime || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Thông tin thanh toán</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Phương thức:</span>{" "}
                      {getPaymentMethodLabel(selectedBooking.paymentMethod)}
                    </p>
                    <p>
                      <span className="font-medium">Tổng tiền:</span>{" "}
                      {formatPrice(selectedBooking.totalAmount)}
                    </p>
                    <div>
                      <span className="font-medium">Trạng thái:</span>{' '}
                      {getPaymentStatusBadge(selectedBooking.paymentStatus)}
                    </div>
                    <p>
                      <span className="font-medium">Ngày thanh toán:</span>{" "}
                      {parseApiDate(selectedBooking.paymentDate)?.toLocaleString("vi-VN") || "N/A"}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Thông tin đặt vé</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Mã đặt vé:</span>{" "}
                      {selectedBooking.bookingCode}
                    </p>
                    <p>
                      <span className="font-medium">Số vé:</span>{" "}
                      {selectedBooking.ticketCount || "N/A"} vé
                    </p>
                    <p>
                      <span className="font-medium">Ngày đặt:</span>{" "}
                      {parseApiDate(selectedBooking.bookingDate)?.toLocaleString("vi-VN") || "N/A"}
                    </p>
                    <div>
                      <span className="font-medium">Trạng thái:</span>{' '}
                      {getBookingStatusBadge(selectedBooking.bookingStatus)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}