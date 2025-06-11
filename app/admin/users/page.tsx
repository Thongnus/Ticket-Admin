"use client"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Search, Eye, ChevronLeft, ChevronRight, RefreshCw, AlertCircle, Settings } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { fetchUsers, type UserDto, type FetchUsersParams, formatDateTime, getErrorMessage } from "@/lib/api"
import { ApiConnectionTest } from "@/components/api-test"

export default function UsersManagement() {
  const { toast } = useToast()
  const [users, setUsers] = useState<UserDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null)

  const roles = [
    { label: "Quản trị viên", value: "ROLE_ADMIN", color: "bg-red-100 text-red-800" },
    { label: "Nhân viên", value: "ROLE_STAFF", color: "bg-green-100 text-green-800" },
    { label: "Khách hàng", value: "ROLE_USER", color: "bg-blue-100 text-blue-800" },
  ]

  const statusOptions = [
    { label: "Hoạt động", value: "active", color: "bg-green-100 text-green-800" },
    { label: "Khóa", value: "inactive", color: "bg-yellow-100 text-yellow-800" },
  ]

  // Mock data as fallback
  const mockUsers: UserDto[] = [
    {
      userId: 1,
      username: "admin",
      fullName: "Quản trị viên",
      email: "admin@example.com",
      phone: "0123456789",
      address: "Hà Nội",
      idCard: "123456789",
      dateOfBirth: "1990-01-01",
      createdAt: [2025, 5, 30, 10, 0, 0],
      updatedAt: [2025, 5, 30, 10, 0, 0],
      roles: [{ id: 1, name: "ROLE_ADMIN" }],
      lastLogin: [2025, 5, 30, 9, 30, 0],
      status: "active",
    },
    {
      userId: 2,
      username: "staff01",
      fullName: "Nhân viên 1",
      email: "staff01@example.com",
      phone: "0987654321",
      address: "TP.HCM",
      idCard: "987654321",
      dateOfBirth: "1995-05-15",
      createdAt: [2025, 5, 29, 14, 30, 0],
      updatedAt: [2025, 5, 29, 14, 30, 0],
      roles: [{ id: 2, name: "ROLE_STAFF" }],
      lastLogin: [2025, 5, 30, 8, 15, 0],
      status: "active",
    },
    {
      userId: 3,
      username: "user01",
      fullName: "Khách hàng 1",
      email: "user01@example.com",
      phone: "0111222333",
      address: "Đà Nẵng",
      idCard: "111222333",
      dateOfBirth: "1988-12-20",
      createdAt: [2025, 5, 28, 16, 45, 0],
      updatedAt: [2025, 5, 28, 16, 45, 0],
      roles: [{ id: 3, name: "ROLE_USER" }],
      lastLogin: [2025, 5, 29, 20, 30, 0],
      status: "active",
    },
  ]

  // Fetch users from API with comprehensive error handling
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params: FetchUsersParams = {
        searchTerm: searchTerm || undefined,
        role: roleFilter,
        status: statusFilter,
        page: currentPage,
        pageSize: pageSize,
        sortBy: "createdAt",
        sortDirection: "desc",
      }

      console.log("[Users] Loading users with params:", params)

      const response = await fetchUsers(params)
        console.log("[Users] API response:", response)
      setUsers(response.content)
      setTotalElements(response.totalElements)
      setTotalPages(response.totalPages)

      console.log(`[Users] Successfully loaded ${response.content.length} users`)
    } catch (error) {
      console.error("[Users] Error loading users:", error)
      const errorMessage = getErrorMessage(error)
      setError(errorMessage)

      // Use mock data as fallback
      const filteredMockUsers = mockUsers.filter((user) => {
        const matchesSearch =
          !searchTerm ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesRole = roleFilter === "all" || user.roles.some((role) => role.name === roleFilter)
        const matchesStatus = statusFilter === "all" || user.status === statusFilter

        return matchesSearch && matchesRole && matchesStatus
      })

      setUsers(filteredMockUsers)
      setTotalElements(filteredMockUsers.length)
      setTotalPages(Math.ceil(filteredMockUsers.length / pageSize))

      toast({
        title: "Cảnh báo",
        description: "Không thể kết nối API. Đang hiển thị dữ liệu mẫu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm, roleFilter, statusFilter, pageSize, toast])

  // Load users on component mount and when filters change
  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(0)
  }, [searchTerm, roleFilter, statusFilter])

  // Manual refresh function
  const handleRefresh = () => {
    loadUsers()
  }

  const getRoleBadge = (userRoles: { id: number; name: string }[]) => {
    return userRoles.map((role) => {
      const roleOption = roles.find((r) => r.value === role.name)
      return (
        <Badge key={role.id} className={roleOption?.color || "bg-gray-100 text-gray-800"}>
          {roleOption?.label || role.name}
        </Badge>
      )
    })
  }

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find((option) => option.value === status)
    return <Badge className={statusOption?.color}>{statusOption?.label}</Badge>
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleViewDetails = (user: UserDto) => {
    setSelectedUser(user)
    setIsDetailDialogOpen(true)
  }

  // Connection status indicator
  const ConnectionStatus = () => {
    if (error) {
      return (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800">API không khả dụng - Hiển thị dữ liệu mẫu</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsTestDialogOpen(true)}>
                <Settings className="w-4 h-4 mr-1" />
                Kiểm tra API
              </Button>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
                Thử lại
              </Button>
            </div>
          </div>
          <p className="text-xs text-yellow-600 mt-1">{error}</p>
        </div>
      )
    }

    return (
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-green-800">Kết nối API thành công</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsTestDialogOpen(true)}>
              <Settings className="w-4 h-4 mr-1" />
              Kiểm tra API
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
              Làm mới
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Đang tải danh sách người dùng...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h2>
          <p className="text-muted-foreground">Quản lý thông tin người dùng trong hệ thống</p>
        </div>
      </div>

      <ConnectionStatus />

      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
          <CardDescription>Tổng cộng {totalElements} người dùng trong hệ thống</CardDescription>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {statusOptions.map((status) => (
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
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên đăng nhập</TableHead>
                    <TableHead>Họ và tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Đăng nhập cuối</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.fullName || "Chưa cập nhật"}</TableCell>
                      <TableCell>{user.email || "Chưa cập nhật"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">{getRoleBadge(user.roles)}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>{formatDateTime(user.lastLogin)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Mở menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Hiển thị {currentPage * pageSize + 1} đến {Math.min((currentPage + 1) * pageSize, totalElements)}{" "}
                    của {totalElements} kết quả
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Trước
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNumber = Math.max(0, Math.min(currentPage - 2 + i, totalPages - 1))
                        return (
                          <Button
                            key={`page-${pageNumber}-${i}`}
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNumber)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNumber + 1}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1}
                    >
                      Sau
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* API Test Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Kiểm tra kết nối API</DialogTitle>
            <DialogDescription>Kiểm tra khả năng kết nối đến API backend và cấu hình CORS</DialogDescription>
          </DialogHeader>
          <ApiConnectionTest />
        </DialogContent>
      </Dialog>

      {/* User Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chi tiết người dùng</DialogTitle>
            <DialogDescription>Thông tin chi tiết về người dùng {selectedUser?.username}</DialogDescription>
          </DialogHeader>
          {selectedUser ? (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Thông tin cá nhân</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Họ và tên:</span> {selectedUser.fullName || "Chưa cập nhật"}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {selectedUser.email || "Chưa cập nhật"}
                    </p>
                    <p>
                      <span className="font-medium">Số điện thoại:</span> {selectedUser.phone || "Chưa cập nhật"}
                    </p>
                    <p>
                      <span className="font-medium">CMND/CCCD:</span> {selectedUser.idCard || "Chưa cập nhật"}
                    </p>
                    <p>
                      <span className="font-medium">Ngày sinh:</span> {selectedUser.dateOfBirth || "Chưa cập nhật"}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Thông tin tài khoản</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Tên đăng nhập:</span> {selectedUser.username}
                    </p>
                    <p>
                      <span className="font-medium">Vai trò:</span>
                      <div className="flex flex-wrap gap-1 mt-1">{getRoleBadge(selectedUser.roles)}</div>
                    </p>
                    <p>
                      <span className="font-medium">Trạng thái:</span> {getStatusBadge(selectedUser.status)}
                    </p>
                    <p>
                      <span className="font-medium">Ngày tạo:</span> {formatDateTime(selectedUser.createdAt)}
                    </p>
                    <p>
                      <span className="font-medium">Cập nhật cuối:</span> {formatDateTime(selectedUser.updatedAt)}
                    </p>
                    <p>
                      <span className="font-medium">Đăng nhập cuối:</span> {formatDateTime(selectedUser.lastLogin)}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Địa chỉ</h4>
                <p className="text-sm">{selectedUser.address || "Chưa cập nhật"}</p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
