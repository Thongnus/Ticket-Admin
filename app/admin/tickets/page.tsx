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
import { Eye, MoreHorizontal, Search, X, RefreshCw, Edit, Printer, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Interface cho Ticket
interface Ticket {
  ticketId: number
  ticketCode: string
  passengerName: string
  identityCard: string
  seatNumber: string
  carriageNumber: string
  ticketStatus: string
  ticketType: string
  price: number
  bookingCode: string
  tripCode: string
  routeName: string
  departureTime: string
  arrivalTime: string
  originStation: string
  destinationStation: string
  issuedDate: string
  validUntil: string
  passengerType: string
  discountPercent: number
  finalPrice: number
}

// Interface cho pagination response
interface PaginatedResponse {
  content: Ticket[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

// Fake data cho tickets - tạo nhiều hơn để test pagination
const generateFakeTickets = (): Ticket[] => {
  const ticketStatuses = ["active", "used", "cancelled", "expired", "refunded"]
  const ticketTypes = ["adult", "child", "senior", "student", "disabled"]
  const passengerTypes = ["Người lớn", "Trẻ em", "Người cao tuổi", "Sinh viên", "Người khuyết tật"]
  const routes = [
    { name: "Hà Nội - Hồ Chí Minh", origin: "Hà Nội", destination: "Hồ Chí Minh" },
    { name: "Hà Nội - Đà Nẵng", origin: "Hà Nội", destination: "Đà Nẵng" },
    { name: "Hồ Chí Minh - Đà Nẵng", origin: "Hồ Chí Minh", destination: "Đà Nẵng" },
    { name: "Hà Nội - Hải Phòng", origin: "Hà Nội", destination: "Hải Phòng" },
    { name: "Hồ Chí Minh - Cần Thơ", origin: "Hồ Chí Minh", destination: "Cần Thơ" },
  ]
  const names = [
    "Nguyễn Văn An", "Trần Thị Bình", "Lê Văn Cường", "Phạm Thị Dung", "Hoàng Văn Em",
    "Vũ Thị Phương", "Đặng Văn Giang", "Bùi Thị Hoa", "Ngô Văn Inh", "Lý Thị Kim",
    "Trần Văn Long", "Nguyễn Thị Mai", "Lê Văn Nam", "Phạm Thị Oanh", "Hoàng Văn Phúc",
    "Vũ Thị Quỳnh", "Đặng Văn Rồng", "Bùi Thị Sinh", "Ngô Văn Tâm", "Lý Thị Uyên"
  ]

  return Array.from({ length: 200 }, (_, index) => {
    const route = routes[Math.floor(Math.random() * routes.length)]
    const status = ticketStatuses[Math.floor(Math.random() * ticketStatuses.length)]
    const type = ticketTypes[Math.floor(Math.random() * ticketTypes.length)]
    const passengerType = passengerTypes[Math.floor(Math.random() * passengerTypes.length)]
    const basePrice = 150000 + Math.floor(Math.random() * 500000)
    const discountPercent = Math.floor(Math.random() * 30)
    const finalPrice = basePrice * (1 - discountPercent / 100)
    
    const issuedDate = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
    const validUntil = new Date(issuedDate.getTime() + 24 * 60 * 60 * 1000) // 1 ngày sau
    
    return {
      ticketId: index + 1,
      ticketCode: `TKT${String(index + 1).padStart(6, '0')}`,
      passengerName: names[Math.floor(Math.random() * names.length)],
      identityCard: `${Math.floor(Math.random() * 900000000) + 100000000}`,
      seatNumber: `${Math.floor(Math.random() * 50) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`,
      carriageNumber: `${Math.floor(Math.random() * 10) + 1}`,
      ticketStatus: status,
      ticketType: type,
      price: basePrice,
      bookingCode: `BK${String(Math.floor(Math.random() * 1000)).padStart(6, '0')}`,
      tripCode: `TR${String(Math.floor(Math.random() * 100)).padStart(4, '0')}`,
      routeName: route.name,
      departureTime: new Date(Date.now() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
      arrivalTime: new Date(Date.now() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
      originStation: route.origin,
      destinationStation: route.destination,
      issuedDate: issuedDate.toISOString(),
      validUntil: validUntil.toISOString(),
      passengerType: passengerType,
      discountPercent: discountPercent,
      finalPrice: Math.round(finalPrice)
    }
  })
}

export default function TicketsManagement() {
  const { toast } = useToast()
  const [allTickets, setAllTickets] = useState<Ticket[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const ticketStatusOptions = [
    { value: "active", label: "Có hiệu lực", color: "bg-green-100 text-green-800" },
    { value: "used", label: "Đã sử dụng", color: "bg-blue-100 text-blue-800" },
    { value: "cancelled", label: "Đã hủy", color: "bg-red-100 text-red-800" },
    { value: "expired", label: "Hết hạn", color: "bg-gray-100 text-gray-800" },
    { value: "refunded", label: "Đã hoàn tiền", color: "bg-orange-100 text-orange-800" },
  ]

  const ticketTypeOptions = [
    { value: "adult", label: "Người lớn" },
    { value: "child", label: "Trẻ em" },
    { value: "senior", label: "Người cao tuổi" },
    { value: "student", label: "Sinh viên" },
    { value: "disabled", label: "Người khuyết tật" },
  ]

  // Load fake data
  useEffect(() => {
    const loadTickets = async () => {
      setLoading(true)
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      const fakeTickets = generateFakeTickets()
      setAllTickets(fakeTickets)
      setTotalElements(fakeTickets.length)
      setTotalPages(Math.ceil(fakeTickets.length / pageSize))
      setLoading(false)
    }

    loadTickets()
  }, [])

  // Filter và paginate tickets
  useEffect(() => {
    let filtered = allTickets

    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.ticketCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.identityCard.includes(searchTerm) ||
        ticket.bookingCode.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(ticket => ticket.ticketStatus === statusFilter)
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(ticket => ticket.ticketType === typeFilter)
    }

    setTotalElements(filtered.length)
    setTotalPages(Math.ceil(filtered.length / pageSize))
    setCurrentPage(0) // Reset về trang đầu khi filter
  }, [allTickets, searchTerm, statusFilter, typeFilter, pageSize])

  // Lấy tickets cho trang hiện tại
  const getCurrentPageTickets = (): Ticket[] => {
    let filtered = allTickets

    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.ticketCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.identityCard.includes(searchTerm) ||
        ticket.bookingCode.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(ticket => ticket.ticketStatus === statusFilter)
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(ticket => ticket.ticketType === typeFilter)
    }

    const startIndex = currentPage * pageSize
    const endIndex = startIndex + pageSize
    return filtered.slice(startIndex, endIndex)
  }

  const currentTickets = getCurrentPageTickets()

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const goToFirstPage = () => {
    setCurrentPage(0)
  }

  const goToLastPage = () => {
    setCurrentPage(totalPages - 1)
  }

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1))
  }

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))
  }

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN")
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusOption = ticketStatusOptions.find(option => option.value === status)
    return <Badge className={statusOption?.color || "bg-gray-100 text-gray-800"}>{statusOption?.label || status}</Badge>
  }

  // Get type badge
  const getTypeBadge = (type: string) => {
    const typeOption = ticketTypeOptions.find(option => option.value === type)
    return <Badge variant="outline">{typeOption?.label || type}</Badge>
  }

  // View ticket details
  const handleViewDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setIsDetailDialogOpen(true)
  }

  // Cancel ticket
  const handleCancelTicket = (ticketId: number) => {
    setAllTickets(allTickets.map(ticket =>
      ticket.ticketId === ticketId ? { ...ticket, ticketStatus: "cancelled" } : ticket
    ))
    toast({
      title: "Hủy vé thành công",
      description: "Vé đã được hủy.",
    })
  }

  // Print ticket
  const handlePrintTicket = (ticket: Ticket) => {
    toast({
      title: "In vé",
      description: `Đang in vé ${ticket.ticketCode}...`,
    })
    // Simulate printing
    setTimeout(() => {
      toast({
        title: "In vé thành công",
        description: `Vé ${ticket.ticketCode} đã được in.`,
      })
    }, 2000)
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1)
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    
    return pages
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý vé</h2>
          <p className="text-muted-foreground">Quản lý và theo dõi các vé trong hệ thống</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách vé</CardTitle>
          <CardDescription>
            Hiển thị {currentTickets.length} vé (trang {currentPage + 1} / {totalPages}) - Tổng cộng {totalElements} vé
          </CardDescription>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo mã vé, tên hành khách, CMND..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái vé" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {ticketStatusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Loại vé" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại vé</SelectItem>
                {ticketTypeOptions.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Hiển thị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 vé</SelectItem>
                <SelectItem value="10">10 vé</SelectItem>
                <SelectItem value="20">20 vé</SelectItem>
                <SelectItem value="50">50 vé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : currentTickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Không tìm thấy vé nào.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã vé</TableHead>
                    <TableHead>Hành khách</TableHead>
                    <TableHead>Chuyến tàu</TableHead>
                    <TableHead>Ghế</TableHead>
                    <TableHead>Loại vé</TableHead>
                    <TableHead>Giá vé</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày phát hành</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTickets.map((ticket) => (
                    <TableRow key={ticket.ticketId}>
                      <TableCell className="font-medium">{ticket.ticketCode}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{ticket.passengerName}</div>
                          <div className="text-sm text-muted-foreground">{ticket.identityCard}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{ticket.tripCode}</div>
                          <div className="text-sm text-muted-foreground">{ticket.routeName}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(ticket.departureTime)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">Toa {ticket.carriageNumber}</div>
                          <div className="text-sm text-muted-foreground">Ghế {ticket.seatNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(ticket.ticketType)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatPrice(ticket.finalPrice)}</div>
                          {ticket.discountPercent > 0 && (
                            <div className="text-xs text-green-600">
                              Giảm {ticket.discountPercent}%
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(ticket.ticketStatus)}</TableCell>
                      <TableCell>{formatDate(ticket.issuedDate)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Mở menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(ticket)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            {ticket.ticketStatus === "active" && (
                              <>
                                <DropdownMenuItem onClick={() => handlePrintTicket(ticket)}>
                                  <Printer className="mr-2 h-4 w-4" />
                                  In vé
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleCancelTicket(ticket.ticketId)}
                                  className="text-red-600"
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Hủy vé
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

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Hiển thị {currentPage * pageSize + 1} đến {Math.min((currentPage + 1) * pageSize, totalElements)} trong tổng số {totalElements} vé
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToFirstPage}
                      disabled={currentPage === 0}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={currentPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {getPageNumbers().map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page + 1}
                      </Button>
                    ))}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToLastPage}
                      disabled={currentPage === totalPages - 1}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog chi tiết vé */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chi tiết vé</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về vé {selectedTicket?.ticketCode || ""}
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Thông tin hành khách</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Tên:</span> {selectedTicket.passengerName}
                    </p>
                    <p>
                      <span className="font-medium">CMND:</span> {selectedTicket.identityCard}
                    </p>
                    <p>
                      <span className="font-medium">Loại hành khách:</span> {selectedTicket.passengerType}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Thông tin chuyến đi</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Mã chuyến:</span> {selectedTicket.tripCode}
                    </p>
                    <p>
                      <span className="font-medium">Tuyến:</span> {selectedTicket.routeName}
                    </p>
                    <p>
                      <span className="font-medium">Khởi hành:</span> {formatDate(selectedTicket.departureTime)}
                    </p>
                    <p>
                      <span className="font-medium">Đến:</span> {formatDate(selectedTicket.arrivalTime)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Thông tin vé</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Mã vé:</span> {selectedTicket.ticketCode}
                    </p>
                    <p>
                      <span className="font-medium">Mã đặt vé:</span> {selectedTicket.bookingCode}
                    </p>
                    <p>
                      <span className="font-medium">Toa:</span> {selectedTicket.carriageNumber}
                    </p>
                    <p>
                      <span className="font-medium">Ghế:</span> {selectedTicket.seatNumber}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Thông tin giá</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Giá gốc:</span> {formatPrice(selectedTicket.price)}
                    </p>
                    <p>
                      <span className="font-medium">Giảm giá:</span> {selectedTicket.discountPercent}%
                    </p>
                    <p>
                      <span className="font-medium">Giá cuối:</span> {formatPrice(selectedTicket.finalPrice)}
                    </p>
                    <p>
                      <span className="font-medium">Trạng thái:</span> {getStatusBadge(selectedTicket.ticketStatus)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Thời gian</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Ngày phát hành:</span> {formatDate(selectedTicket.issuedDate)}
                    </p>
                    <p>
                      <span className="font-medium">Có hiệu lực đến:</span> {formatDate(selectedTicket.validUntil)}
                    </p>
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