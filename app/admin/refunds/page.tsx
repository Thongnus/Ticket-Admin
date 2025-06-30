"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  RefreshCw,
  Search,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  AlertTriangle,
  FileText,
  Calendar,
  User,
  CreditCard,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Interfaces
interface PaymentDto {
  paymentId: number
  paymentAmount: number
  paymentDate: string
  paymentMethod: string
  transactionId: string
  status: string
  refundRequestAt?: string
  refundedAt?: string
  booking: {
    bookingId: number
    bookingCode: string
    totalAmount: number
    user: {
      userId: number
      username: string
      fullName?: string
      email?: string
    }
    tripDto: {
      tripId: number
      tripCode: string
      departureTime: string
      route: {
        routeName: string
        originStationName: string
        destinationStationName: string
      }
    }
  }
}

interface RefundRequest {
  paymentId: number
  payment: PaymentDto
  refundReason?: string
  refundAmount: number
  requestedAt: string
  processedAt?: string
  processedBy?: string
  status: string
}

// FAKE DATA (chỉ dùng khi phát triển hoặc không có API)
const FAKE_REFUND_REQUESTS: RefundRequest[] = [
  {
    paymentId: 1,
    payment: {
      paymentId: 1,
      paymentAmount: 500000,
      paymentDate: "2024-06-01 10:00:00",
      paymentMethod: "credit_card",
      transactionId: "TXN123456",
      status: "refund_requested",
      booking: {
        bookingId: 101,
        bookingCode: "BK20240601A",
        totalAmount: 500000,
        user: {
          userId: 1,
          username: "nguyenvana",
          fullName: "Nguyễn Văn A",
          email: "vana@example.com",
        },
        tripDto: {
          tripId: 1,
          tripCode: "T1234",
          departureTime: "2024-06-10T08:00:00Z",
          route: {
            routeName: "Hà Nội - Sài Gòn",
            originStationName: "Ga Hà Nội",
            destinationStationName: "Ga Sài Gòn",
          },
        },
      },
    },
    refundReason: "Khách đổi lịch",
    refundAmount: 500000,
    requestedAt: "2024-06-01 11:00:00",
    status: "refund_requested",
  },
  {
    paymentId: 2,
    payment: {
      paymentId: 2,
      paymentAmount: 300000,
      paymentDate: "2024-06-02 09:00:00",
      paymentMethod: "bank_transfer",
      transactionId: "TXN654321",
      status: "refund_pending",
      booking: {
        bookingId: 102,
        bookingCode: "BK20240602B",
        totalAmount: 300000,
        user: {
          userId: 2,
          username: "tranthib",
          fullName: "Trần Thị B",
          email: "tranb@example.com",
        },
        tripDto: {
          tripId: 2,
          tripCode: "T5678",
          departureTime: "2024-06-12T09:00:00Z",
          route: {
            routeName: "Hà Nội - Đà Nẵng",
            originStationName: "Ga Hà Nội",
            destinationStationName: "Ga Đà Nẵng",
          },
        },
      },
    },
    refundReason: "Lý do cá nhân",
    refundAmount: 250000,
    requestedAt: "2024-06-02 10:00:00",
    status: "refund_pending",
  },
]

const FAKE_REFUND_HISTORY: RefundRequest[] = [
  {
    paymentId: 3,
    payment: {
      paymentId: 3,
      paymentAmount: 400000,
      paymentDate: "2024-05-30 08:00:00",
      paymentMethod: "e_wallet",
      transactionId: "TXN789012",
      status: "refunded",
      booking: {
        bookingId: 103,
        bookingCode: "BK20240530C",
        totalAmount: 400000,
        user: {
          userId: 3,
          username: "lethic",
          fullName: "Lê Thị C",
          email: "lec@example.com",
        },
        tripDto: {
          tripId: 3,
          tripCode: "T9101",
          departureTime: "2024-06-15T07:00:00Z",
          route: {
            routeName: "Hà Nội - Huế",
            originStationName: "Ga Hà Nội",
            destinationStationName: "Ga Huế",
          },
        },
      },
    },
    refundAmount: 400000,
    requestedAt: "2024-05-30 09:00:00",
    processedAt: "2024-05-30 12:00:00",
    processedBy: "Admin",
    status: "refunded",
  },
]

export default function RefundsManagement() {
  const { toast } = useToast()
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([])
  const [refundHistory, setRefundHistory] = useState<RefundRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false)
  const [processAction, setProcessAction] = useState<"approve" | "reject">("approve")
  const [processReason, setProcessReason] = useState("")

  const refundStatusOptions = [
    { value: "refund_requested", label: "Yêu cầu hoàn tiền", color: "bg-yellow-100 text-yellow-800" },
    { value: "refund_pending", label: "Đang xử lý", color: "bg-blue-100 text-blue-800" },
    { value: "refunded", label: "Đã hoàn tiền", color: "bg-green-100 text-green-800" },
    { value: "refund_rejected", label: "Từ chối hoàn tiền", color: "bg-red-100 text-red-800" },
  ]

  const paymentMethods = [
    { value: "credit_card", label: "Thẻ tín dụng" },
    { value: "bank_transfer", label: "Chuyển khoản" },
    { value: "e_wallet", label: "Ví điện tử" },
    { value: "cash", label: "Tiền mặt" },
  ]

  // Fetch data
  useEffect(() => {
    setLoading(true)
    setRefundRequests(FAKE_REFUND_REQUESTS)
    setRefundHistory(FAKE_REFUND_HISTORY)
    setLoading(false)
  }, [])

  // Filter refunds
  const filteredRequests = refundRequests.filter((refund) => {
    const matchesSearch =
      refund.payment.booking.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.payment.booking.user.fullName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || refund.status.toLowerCase() === statusFilter

    return matchesSearch && matchesStatus
  })

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
  }

  // Parse date
  const parseApiDate = (dateString: string | null): Date | null => {
    if (!dateString) return null
    const isoString = dateString.includes("T") ? dateString : dateString.replace(" ", "T")
    const date = new Date(isoString)
    return isNaN(date.getTime()) ? null : date
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusOption = refundStatusOptions.find((option) => option.value === status.toLowerCase())
    return <Badge className={statusOption?.color || "bg-gray-100 text-gray-800"}>{statusOption?.label || status}</Badge>
  }

  // Get payment method label
  const getPaymentMethodLabel = (method: string) => {
    const paymentMethod = paymentMethods.find((m) => m.value === method)
    return paymentMethod?.label || method
  }

  // View details
  const handleViewDetails = (refund: RefundRequest) => {
    setSelectedRefund(refund)
    setIsDetailDialogOpen(true)
  }

  // Process refund
  const handleProcessRefund = (refund: RefundRequest, action: "approve" | "reject") => {
    setSelectedRefund(refund)
    setProcessAction(action)
    setProcessReason("")
    setIsProcessDialogOpen(true)
  }

  // Confirm process
  const handleConfirmProcess = async () => {
    if (!selectedRefund) return

    try {
      // await processRefund(selectedRefund.paymentId, processAction, processReason)

      // Update local state
      setRefundRequests(
        refundRequests.map((refund) =>
          refund.paymentId === selectedRefund.paymentId
            ? {
                ...refund,
                status: processAction === "approve" ? "refunded" : "refund_rejected",
                processedAt: new Date().toISOString(),
                processedBy: "Admin",
              }
            : refund,
        ),
      )

      toast({
        title: "Thành công",
        description: `${processAction === "approve" ? "Đã duyệt" : "Đã từ chối"} yêu cầu hoàn tiền.`,
      })

      setIsProcessDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xử lý yêu cầu hoàn tiền.",
        variant: "destructive",
      })
    }
  }

  // Calculate refund statistics
  const stats = {
    total: refundRequests.length,
    pending: refundRequests.filter((r) => r.status === "refund_requested" || r.status === "refund_pending").length,
    approved: refundRequests.filter((r) => r.status === "refunded").length,
    rejected: refundRequests.filter((r) => r.status === "refund_rejected").length,
    totalAmount: refundRequests.reduce((sum, r) => sum + r.refundAmount, 0),
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý hoàn tiền</h2>
          <p className="text-muted-foreground">Xử lý các yêu cầu hoàn tiền và theo dõi lịch sử</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng yêu cầu</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã từ chối</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng tiền hoàn</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalAmount)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Yêu cầu hoàn tiền</TabsTrigger>
          <TabsTrigger value="history">Lịch sử hoàn tiền</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách yêu cầu hoàn tiền</CardTitle>
              <CardDescription>Tổng cộng {filteredRequests.length} yêu cầu hoàn tiền</CardDescription>

              {/* Filters */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo mã đặt vé, mã giao dịch, tên khách hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    {refundStatusOptions.map((status) => (
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
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Không tìm thấy yêu cầu hoàn tiền nào.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã đặt vé</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Chuyến tàu</TableHead>
                      <TableHead>Số tiền hoàn</TableHead>
                      <TableHead>Phương thức TT</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày yêu cầu</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((refund) => (
                      <TableRow key={refund.paymentId}>
                        <TableCell className="font-medium">{refund.payment.booking.bookingCode}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {refund.payment.booking.user.fullName || refund.payment.booking.user.username}
                            </div>
                            <div className="text-sm text-muted-foreground">{refund.payment.booking.user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{refund.payment.booking.tripDto.tripCode}</div>
                            <div className="text-sm text-muted-foreground">
                              {refund.payment.booking.tripDto.route.routeName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-red-600">{formatPrice(refund.refundAmount)}</TableCell>
                        <TableCell>{getPaymentMethodLabel(refund.payment.paymentMethod)}</TableCell>
                        <TableCell>{getStatusBadge(refund.status)}</TableCell>
                        <TableCell>{parseApiDate(refund.requestedAt)?.toLocaleDateString("vi-VN") || "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Mở menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(refund)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Xem chi tiết
                              </DropdownMenuItem>
                              {(refund.status === "refund_requested" || refund.status === "refund_pending") && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleProcessRefund(refund, "approve")}
                                    className="text-green-600"
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Duyệt hoàn tiền
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleProcessRefund(refund, "reject")}
                                    className="text-red-600"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Từ chối
                                  </DropdownMenuItem>
                                </>
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
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử hoàn tiền</CardTitle>
              <CardDescription>Các yêu cầu hoàn tiền đã được xử lý</CardDescription>
            </CardHeader>
            <CardContent>
              {refundHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Chưa có lịch sử hoàn tiền nào.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã đặt vé</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Số tiền hoàn</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày xử lý</TableHead>
                      <TableHead>Người xử lý</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {refundHistory.map((refund) => (
                      <TableRow key={refund.paymentId}>
                        <TableCell className="font-medium">{refund.payment.booking.bookingCode}</TableCell>
                        <TableCell>
                          {refund.payment.booking.user.fullName || refund.payment.booking.user.username}
                        </TableCell>
                        <TableCell className="font-medium">{formatPrice(refund.refundAmount)}</TableCell>
                        <TableCell>{getStatusBadge(refund.status)}</TableCell>
                        <TableCell>{parseApiDate(refund.processedAt)?.toLocaleDateString("vi-VN") || "N/A"}</TableCell>
                        <TableCell>{refund.processedBy || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Chi tiết yêu cầu hoàn tiền</DialogTitle>
            <DialogDescription>Thông tin chi tiết về yêu cầu hoàn tiền #{selectedRefund?.paymentId}</DialogDescription>
          </DialogHeader>

          {selectedRefund && (
            <div className="grid gap-6 py-4">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Thông tin khách hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tên:</span>
                      <span className="font-medium">
                        {selectedRefund.payment.booking.user.fullName || selectedRefund.payment.booking.user.username}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{selectedRefund.payment.booking.user.email || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mã đặt vé:</span>
                      <span className="font-medium">{selectedRefund.payment.booking.bookingCode}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Thông tin chuyến đi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mã chuyến:</span>
                      <span className="font-medium">{selectedRefund.payment.booking.tripDto.tripCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tuyến:</span>
                      <span>{selectedRefund.payment.booking.tripDto.route.routeName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Khởi hành:</span>
                      <span>
                        {parseApiDate(selectedRefund.payment.booking.tripDto.departureTime)?.toLocaleString("vi-VN") ||
                          "N/A"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment & Refund Info */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Thông tin thanh toán
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mã giao dịch:</span>
                      <span className="font-medium">{selectedRefund.payment.transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phương thức:</span>
                      <span>{getPaymentMethodLabel(selectedRefund.payment.paymentMethod)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số tiền gốc:</span>
                      <span className="font-medium">{formatPrice(selectedRefund.payment.paymentAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ngày thanh toán:</span>
                      {(() => {
                        const paymentDate: string | null = typeof selectedRefund.payment.paymentDate === 'string' ? selectedRefund.payment.paymentDate : null;
                        return (
                          <span>
                            {parseApiDate(paymentDate)?.toLocaleDateString("vi-VN") || "N/A"}
                          </span>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Thông tin hoàn tiền
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số tiền hoàn:</span>
                      <span className="font-medium text-red-600">{formatPrice(selectedRefund.refundAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trạng thái:</span>
                      <span>{getStatusBadge(selectedRefund.status)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ngày yêu cầu:</span>
                      <span>{parseApiDate(selectedRefund.requestedAt)?.toLocaleDateString("vi-VN") || "N/A"}</span>
                    </div>
                    {selectedRefund.processedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ngày xử lý:</span>
                        <span>{parseApiDate(selectedRefund.processedAt)?.toLocaleDateString("vi-VN") || "N/A"}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Refund Reason */}
              {selectedRefund.refundReason && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Lý do hoàn tiền
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedRefund.refundReason}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Process Dialog */}
      <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{processAction === "approve" ? "Duyệt hoàn tiền" : "Từ chối hoàn tiền"}</DialogTitle>
            <DialogDescription>
              {processAction === "approve"
                ? "Xác nhận duyệt yêu cầu hoàn tiền này?"
                : "Xác nhận từ chối yêu cầu hoàn tiền này?"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">{processAction === "approve" ? "Ghi chú (tùy chọn)" : "Lý do từ chối *"}</Label>
              <Textarea
                id="reason"
                placeholder={
                  processAction === "approve"
                    ? "Nhập ghi chú về việc duyệt hoàn tiền..."
                    : "Nhập lý do từ chối hoàn tiền..."
                }
                value={processReason}
                onChange={(e) => setProcessReason(e.target.value)}
                required={processAction === "reject"}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProcessDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleConfirmProcess}
              variant={processAction === "approve" ? "default" : "destructive"}
              disabled={processAction === "reject" && !processReason.trim()}
            >
              {processAction === "approve" ? "Duyệt hoàn tiền" : "Từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
