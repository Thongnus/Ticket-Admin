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
import { getRefundRequests, getRefundRequestById, approveRefundRequest, rejectRefundRequest, getRefundStatistics } from "@/lib/api/refunds"

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
  refundRequestId: number
  bookingId: number
  bookingCode: string
  customerName: string
  customerEmail: string
  customerPhone: string
  bookingStatus: string
  paymentId: number
  paymentAmount: number
  paymentMethod: string
  paymentStatus: string
  refundPolicyId: number
  policyName: string
  policyRefundPercent: number
  originalAmount: number
  discountAmount: number
  netAmount: number
  refundAmount: number
  refundPercentage: number
  hoursBeforeDeparture: number
  status: string
  requestDate: string
  processedDate: string | null
  adminNote: string | null
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
  tripCode: string
  routeName: string
  departureTime: string
  originStationName: string
  destinationStationName: string
}

// FAKE DATA (chỉ dùng khi phát triển hoặc không có API)
const FAKE_REFUND_REQUESTS: RefundRequest[] = [
  {
    refundRequestId: 1,
    bookingId: 101,
    bookingCode: "BK20240601A",
    customerName: "Nguyễn Văn A",
    customerEmail: "vana@example.com",
    customerPhone: "0912345678",
    bookingStatus: "refund_processing",
    paymentId: 1,
    paymentAmount: 500000,
    paymentMethod: "credit_card",
    paymentStatus: "refund_pending",
    refundPolicyId: 1,
    policyName: "Hoàn toàn bộ tiền trước 24h",
    policyRefundPercent: 100,
    tripCode: "T1234",
    routeName: "Hà Nội - Sài Gòn",
    departureTime: "2024-06-10T08:00:00Z",
    originStationName: "Ga Hà Nội",
    destinationStationName: "Ga Sài Gòn",
    originalAmount: 500000,
    discountAmount: 0,
    netAmount: 500000,
    refundAmount: 500000,
    refundPercentage: 100,
    hoursBeforeDeparture: 30,
    status: "pending",
    requestDate: "2024-06-01 11:00:00",
    processedDate: null,
    adminNote: null,
    rejectionReason: null,
    createdAt: "2024-06-01 11:00:00",
    updatedAt: "2024-06-01 11:00:00"
  },
  {
    refundRequestId: 2,
    bookingId: 102,
    bookingCode: "BK20240602B",
    customerName: "Trần Thị B",
    customerEmail: "tranb@example.com",
    customerPhone: "0987654321",
    bookingStatus: "refund_processing",
    paymentId: 2,
    paymentAmount: 300000,
    paymentMethod: "bank_transfer",
    paymentStatus: "refund_pending",
    refundPolicyId: 1,
    policyName: "Hoàn 80% tiền trước 12h",
    policyRefundPercent: 80,
    tripCode: "T5678",
    routeName: "Hà Nội - Đà Nẵng",
    departureTime: "2024-06-12T09:00:00Z",
    originStationName: "Ga Hà Nội",
    destinationStationName: "Ga Đà Nẵng",
    originalAmount: 350000,
    discountAmount: 50000,
    netAmount: 300000,
    refundAmount: 240000,
    refundPercentage: 80,
    hoursBeforeDeparture: 15,
    status: "pending",
    requestDate: "2024-06-02 10:00:00",
    processedDate: null,
    adminNote: null,
    rejectionReason: null,
    createdAt: "2024-06-02 10:00:00",
    updatedAt: "2024-06-02 10:00:00"
  }
]

const FAKE_REFUND_HISTORY: RefundRequest[] = [
  {
    refundRequestId: 3,
    bookingId: 103,
    bookingCode: "BK20240530C",
    customerName: "Lê Thị C",
    customerEmail: "lec@example.com",
    customerPhone: "0911222333",
    bookingStatus: "refunded",
    paymentId: 3,
    paymentAmount: 400000,
    paymentMethod: "e_wallet",
    paymentStatus: "refunded",
    refundPolicyId: 2,
    policyName: "Hoàn 50% tiền trước 6h",
    policyRefundPercent: 50,
    tripCode: "T9101",
    routeName: "Hà Nội - Huế",
    departureTime: "2024-06-15T07:00:00Z",
    originStationName: "Ga Hà Nội",
    destinationStationName: "Ga Huế",
    originalAmount: 400000,
    discountAmount: 0,
    netAmount: 400000,
    refundAmount: 200000,
    refundPercentage: 50,
    hoursBeforeDeparture: 7,
    status: "refunded",
    requestDate: "2024-05-30 09:00:00",
    processedDate: "2024-05-30 12:00:00",
    adminNote: "Đã hoàn tiền cho khách",
    rejectionReason: null,
    createdAt: "2024-05-30 09:00:00",
    updatedAt: "2024-05-30 12:00:00"
  }
]

export default function RefundsManagement() {
  const { toast } = useToast()
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false)
  const [processAction, setProcessAction] = useState<"approve" | "reject">("approve")
  const [processReason, setProcessReason] = useState("")
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(5)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [statistics, setStatistics] = useState<{
    totalRequests: number;
    totalRefundAmount: number;
    approvedCount: number;
    rejectedCount: number;
    pendingCount: number;
  } | null>(null)

  const [historyRequests, setHistoryRequests] = useState<RefundRequest[]>([])
  const [historyPage, setHistoryPage] = useState(0)
  const [historySize, setHistorySize] = useState(10)
  const [historyTotalPages, setHistoryTotalPages] = useState(1)
  const [historyTotalElements, setHistoryTotalElements] = useState(0)

  const [tab, setTab] = useState("requests")

  const refundStatusOptions = [
    { value: "pending", label: "Chờ duyệt", color: "bg-yellow-100 text-yellow-800" },
    { value: "approved", label: "Đã duyệt", color: "bg-blue-100 text-blue-800" },
    { value: "rejected", label: "Từ chối", color: "bg-red-100 text-red-800" },
    { value: "rejected", label: "Từ chối", color: "bg-red-100 text-red-800" },
    { value: "refund_requested", label: "Chờ duyệt", color: "bg-yellow-100 text-yellow-800" },
    { value: "refund_pending", label: "Chờ duyệt", color: "bg-yellow-100 text-yellow-800" },
    { value: "refunded", label: "Đã duyệt", color: "bg-green-100 text-green-800" },
    { value: "refund_rejected", label: "Từ chối", color: "bg-red-100 text-red-800" },
  ]

  const refundStatusFilterOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "pending", label: "Chờ duyệt" },
    { value: "approved", label: "Đã duyệt" },
    { value: "rejected", label: "Từ chối" },
  ]

  const statusFilterMap: Record<string, string[]> = {
    all: [],
    pending: ["pending", "refund_requested", "refund_pending"],
    approved: ["approved", "refunded"],
    rejected: ["rejected", "refund_rejected"],
  }

  const paymentMethods = [
    { value: "credit_card", label: "Thẻ tín dụng" },
    { value: "bank_transfer", label: "Chuyển khoản" },
    { value: "e_wallet", label: "Ví điện tử" },
    { value: "cash", label: "Tiền mặt" },
  ]

  // Fetch data
  useEffect(() => {
    setLoading(true)
    const statusValues = statusFilterMap[statusFilter] || []
    const statusParam = statusFilter === "all" ? undefined : statusValues[0]
    getRefundRequests(page, size, statusParam, searchTerm)
      .then((data) => {
        setRefundRequests(data.content || [])
        setTotalPages(data.totalPages || 1)
        setTotalElements(data.totalElements || 0)
      })
      .catch((error) => {
        setRefundRequests([])
        toast({
          title: "Lỗi",
          description: error instanceof Error ? error.message : "Không thể tải dữ liệu hoàn tiền.",
          variant: "destructive",
        })
      })
      .finally(() => setLoading(false))
  }, [toast, page, size, statusFilter, searchTerm])

  useEffect(() => {
    getRefundStatistics()
      .then((data) => {
        console.log("getRefundStatistics data", data);
        setStatistics(data);
      })
      .catch((err) => {
      
        console.error("getRefundStatistics error", err);
        setStatistics(null);
      });
  }, []);

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
    if (typeof status !== "string") {
      return <Badge className="bg-gray-100 text-gray-800">{status ?? "Không xác định"}</Badge>
    }
    const statusOption = refundStatusOptions.find((option) => option.value === status.toLowerCase())
    return <Badge className={statusOption?.color || "bg-gray-100 text-gray-800"}>{statusOption?.label || status}</Badge>
  }

  // Get payment method label
  const getPaymentMethodLabel = (method: string) => {
    const paymentMethod = paymentMethods.find((m) => m.value === method)
    return paymentMethod?.label || method
  }

  // View details
  const handleViewDetails = async (refund: RefundRequest) => {
    try {
      const detail = await getRefundRequestById(refund.refundRequestId)
      setSelectedRefund(detail)
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lấy chi tiết yêu cầu hoàn tiền.",
        variant: "destructive",
      })
      setSelectedRefund(refund)
    } finally {
      setIsDetailDialogOpen(true)
    }
  }

  // Process refund
  const handleProcessRefund = (refund: RefundRequest, action: "approve" | "reject") => {
    setSelectedRefund(refund)
    setProcessAction(action)
    setProcessReason("")
    setIsProcessDialogOpen(true)
  }

  // Thêm hàm showCustomToast
  const showCustomToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    toast({
      title,
      description: message,
      variant: type === 'success' ? 'default' : type === 'error' ? 'destructive' : 'default',
    });
  };

  // Sửa handleConfirmProcess:
  const handleConfirmProcess = async () => {
    if (!selectedRefund) return;
    try {
      if (processAction === "approve") {
        await approveRefundRequest(selectedRefund.refundRequestId, processReason);
      } else {
        await rejectRefundRequest(selectedRefund.refundRequestId, processReason);
      }
      setIsProcessDialogOpen(false);
      // Lấy lại chi tiết mới nhất
      const updatedDetail = await getRefundRequestById(selectedRefund.refundRequestId);
      setSelectedRefund(updatedDetail);
      // Cập nhật danh sách (refetch toàn bộ, đúng page/size)
      const newList = await getRefundRequests(page, size);
      setRefundRequests(newList.content || []);
      setTotalPages(newList.totalPages || 1);
      setTotalElements(newList.totalElements || 0);
      showCustomToast(
        "✅ Thành công",
        processAction === "approve"
          ? "Yêu cầu hoàn tiền đã được duyệt."
          : "Yêu cầu hoàn tiền đã bị từ chối.",
        "success"
      );
    } catch (error: any) {
      showCustomToast(
        "❌ Lỗi",
        error.message || "Không thể xử lý yêu cầu hoàn tiền.",
        "error"
      );
    }
  };

  // Calculate refund statistics
  const stats = statistics
    ? {
        total: statistics.totalRequests,
        pending: statistics.pendingCount,
        approved: statistics.approvedCount,
        rejected: statistics.rejectedCount,
        totalAmount: statistics.totalRefundAmount,
      }
    : {
        total: refundRequests.length,
        pending: refundRequests.filter((r) => ["pending", "refund_requested", "refund_pending"].includes(r.status)).length,
        approved: refundRequests.filter((r) => ["approved", "refunded"].includes(r.status)).length,
        rejected: refundRequests.filter((r) => ["rejected", "refund_rejected"].includes(r.status)).length,
        totalAmount: refundRequests.reduce((sum, r) => sum + r.refundAmount, 0),
      }


  // Thêm hàm alias trạng thái tiếng Việt
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ duyệt';
      case 'approved':
        return 'Đã duyệt';
      case 'reject':
      case 'rejected':
        return 'Từ chối';
      default:
        return status;
    }
  };

  // Thêm các hàm alias trạng thái tiếng Việt cho bookingStatus và paymentStatus
  const getBookingStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'cancelled':
        return 'Đã hủy';
      case 'completed':
        return 'Hoàn thành';
      case 'refund_processing':
        return 'Đang hoàn tiền';
      case 'refunded':
        return 'Đã hoàn tiền';
      default:
        return status;
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ thanh toán';
      case 'paid':
        return 'Đã thanh toán';
      case 'cancelled':
        return 'Đã hủy';
      case 'refund_pending':
        return 'Chờ hoàn tiền';
      case 'refunded':
        return 'Đã hoàn tiền';
      default:
        return status;
    }
  };

  // Gọi API khi đổi tab sang history hoặc đổi page/size
  useEffect(() => {
    if (tab === "history") {
      setLoading(true);
      getRefundRequests(historyPage, historySize, "approved")
        .then((data) => {
          setHistoryRequests(data.content || []);
          setHistoryTotalPages(data.totalPages || 1);
          setHistoryTotalElements(data.totalElements || 0);
        })
        .catch(() => setHistoryRequests([]))
        .finally(() => setLoading(false));
    }
  }, [tab, historyPage, historySize]);

  // Thay đổi: Khi đổi statusFilter hoặc searchTerm, reset page về 0
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(0);
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  // Hàm tạo dải số trang hiển thị
  function getPageNumbers(current: number, total: number, delta = 2) {
    const range = [];
    for (let i = Math.max(0, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }
    return range;
  }

  // Trong phân trang tab Yêu cầu hoàn tiền
  const pageNumbers = getPageNumbers(page, totalPages, 2);

  // Trong phân trang tab Lịch sử hoàn tiền
  const historyPageNumbers = getPageNumbers(historyPage, historyTotalPages, 2);

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
      <Tabs value={tab} onValueChange={setTab} defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Yêu cầu hoàn tiền</TabsTrigger>
          <TabsTrigger value="history">Lịch sử hoàn tiền</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách yêu cầu hoàn tiền</CardTitle>
              <CardDescription>Tổng cộng {refundRequests.length} yêu cầu hoàn tiền</CardDescription>

              {/* Filters */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo mã đặt vé, mã giao dịch, tên khách hàng..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="max-w-sm"
                  />
                </div>

                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {refundStatusFilterOptions.map((status) => (
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
              ) : refundRequests.length === 0 ? (
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
                    {refundRequests.map((refund) => (
                      <TableRow key={refund.refundRequestId}>
                        <TableCell className="font-medium">{refund.bookingCode}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{refund.customerName}</div>
                            <div className="text-sm text-muted-foreground">{refund.customerEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{refund.tripCode}</div>
                            <div className="text-sm text-muted-foreground">
                              {refund.routeName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-red-600">{formatPrice(refund.refundAmount)}</TableCell>
                        <TableCell>{getPaymentMethodLabel(refund.paymentMethod)}</TableCell>
                        <TableCell>{getStatusBadge(refund.status)}</TableCell>
                        <TableCell>{parseApiDate(refund.requestDate)?.toLocaleString("vi-VN") || "N/A"}</TableCell>
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
                              {refund.status === "pending" && (
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

          {/* Pagination */}
          <div className="flex flex-wrap justify-between items-center mt-4 gap-2">
            <div>
              Trang <b>{page + 1}</b> / <b>{totalPages}</b> ({totalElements} yêu cầu)
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(0)}>
                Đầu
              </Button>
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                Trước
              </Button>
              {pageNumbers.map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(p)}
                  disabled={p === page}
                >
                  {p + 1}
                </Button>
              ))}
              <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>
                Sau
              </Button>
              <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage(totalPages - 1)}>
                Cuối
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử hoàn tiền</CardTitle>
              <CardDescription>Các yêu cầu hoàn tiền đã được xử lý</CardDescription>
            </CardHeader>
            <CardContent>
              {historyRequests.length === 0 ? (
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
                      <TableHead>Nội dung phê duyệt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyRequests.map((refund) => (
                      <TableRow key={refund.paymentId}>
                        <TableCell className="font-medium">{refund.bookingCode}</TableCell>
                        <TableCell>
                          {refund.customerName || refund.customerEmail}
                        </TableCell>
                        <TableCell className="font-medium">{formatPrice(refund.refundAmount)}</TableCell>
                        <TableCell>{getStatusBadge(refund.status)}</TableCell>
                        <TableCell>{parseApiDate(refund.processedDate)?.toLocaleString("vi-VN") || "N/A"}</TableCell>
                        <TableCell>{refund.adminNote || refund.rejectionReason || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="flex flex-wrap justify-between items-center mt-4 gap-2">
            <div>
              Trang <b>{historyPage + 1}</b> / <b>{historyTotalPages}</b> ({historyTotalElements} yêu cầu)
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={historyPage === 0} onClick={() => setHistoryPage(0)}>
                Đầu
              </Button>
              <Button variant="outline" size="sm" disabled={historyPage === 0} onClick={() => setHistoryPage(historyPage - 1)}>
                Trước
              </Button>
              {historyPageNumbers.map((p) => (
                <Button
                  key={p}
                  variant={p === historyPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setHistoryPage(p)}
                  disabled={p === historyPage}
                >
                  {p + 1}
                </Button>
              ))}
              <Button variant="outline" size="sm" disabled={historyPage + 1 >= historyTotalPages} onClick={() => setHistoryPage(historyPage + 1)}>
                Sau
              </Button>
              <Button variant="outline" size="sm" disabled={historyPage + 1 >= historyTotalPages} onClick={() => setHistoryPage(historyTotalPages - 1)}>
                Cuối
              </Button>
            </div>
          </div>
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
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">Thông tin khách hàng</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Tên:</span><span className="font-medium">{selectedRefund.customerName}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Email:</span><span>{selectedRefund.customerEmail}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">SĐT:</span><span>{selectedRefund.customerPhone}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Mã đặt vé:</span><span>{selectedRefund.bookingCode}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Trạng thái đặt vé:</span><span>{getBookingStatusLabel(selectedRefund.bookingStatus)}</span></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">Thông tin chuyến đi</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Mã chuyến:</span><span className="font-medium">{selectedRefund.tripCode}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Tuyến:</span><span>{selectedRefund.routeName}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Khởi hành:</span><span>{parseApiDate(selectedRefund.departureTime)?.toLocaleString("vi-VN") || "N/A"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Ga đi:</span><span>{selectedRefund.originStationName}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Ga đến:</span><span>{selectedRefund.destinationStationName}</span></div>
                  </CardContent>
                </Card>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">Thông tin thanh toán</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Mã thanh toán:</span><span>{selectedRefund.paymentId}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Số tiền gốc:</span><span>{formatPrice(selectedRefund.originalAmount)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Giảm giá:</span><span>{formatPrice(selectedRefund.discountAmount)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Thành tiền:</span><span>{formatPrice(selectedRefund.netAmount)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Số tiền thanh toán:</span><span>{formatPrice(selectedRefund.paymentAmount)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Phương thức:</span><span>{getPaymentMethodLabel(selectedRefund.paymentMethod)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Trạng thái thanh toán:</span><span>{getPaymentStatusLabel(selectedRefund.paymentStatus)}</span></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">Thông tin hoàn tiền</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Chính sách hoàn:</span><span>{selectedRefund.policyName} ({selectedRefund.policyRefundPercent}%)</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Số tiền hoàn:</span><span className="font-medium text-red-600">{formatPrice(selectedRefund.refundAmount)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Phần trăm hoàn:</span><span>{selectedRefund.refundPercentage}%</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Số giờ trước khởi hành:</span><span>{selectedRefund.hoursBeforeDeparture}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Trạng thái hoàn tiền:</span><span>{getStatusBadge(selectedRefund.status)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Ngày yêu cầu:</span><span>{parseApiDate(selectedRefund.requestDate)?.toLocaleDateString("vi-VN") || "N/A"}</span></div>
                    {selectedRefund.processedDate && (
                      <div className="flex justify-between"><span className="text-muted-foreground">Ngày xử lý:</span><span>{parseApiDate(selectedRefund.processedDate)?.toLocaleDateString("vi-VN") || "N/A"}</span></div>
                    )}
                    {selectedRefund.adminNote && (
                      <div className="flex justify-between"><span className="text-muted-foreground">Ghi chú:</span><span>{selectedRefund.adminNote}</span></div>
                    )}
                    {selectedRefund.rejectionReason && (
                      <div className="flex justify-between"><span className="text-muted-foreground">Lý do từ chối:</span><span>{selectedRefund.rejectionReason}</span></div>
                    )}
                  </CardContent>
                </Card>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">Thông tin hệ thống</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Ngày tạo:</span><span>{parseApiDate(selectedRefund.createdAt)?.toLocaleDateString("vi-VN") || "N/A"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Ngày cập nhật:</span><span>{parseApiDate(selectedRefund.updatedAt)?.toLocaleDateString("vi-VN") || "N/A"}</span></div>
                  </CardContent>
                </Card>
              </div>
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
