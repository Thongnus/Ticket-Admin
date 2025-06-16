"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Plus, Search, Trash2, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { stationsApi, StationDto, PageResponse } from "@/lib/api/stations"

export default function StationsManagement() {
  const { toast } = useToast()
  const [stations, setStations] = useState<StationDto[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [stationToDelete, setStationToDelete] = useState<StationDto | null>(null)
  const [editingStation, setEditingStation] = useState<StationDto | null>(null)
  const [formData, setFormData] = useState({
    stationName: "",
    location: "",
    address: "",
    city: "",
    province: "",
    phone: "",
    status: "active",
  })
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const provinces = [
    "An Giang",
    "Bà Rịa - Vũng Tàu",
    "Bắc Giang",
    "Bắc Kạn",
    "Bạc Liêu",
    "Bắc Ninh",
    "Bến Tre",
    "Bình Định",
    "Bình Dương",
    "Bình Phước",
    "Bình Thuận",
    "Cà Mau",
    "Cần Thơ",
    "Cao Bằng",
    "Đà Nẵng",
    "Đắk Lắk",
    "Đắk Nông",
    "Điện Biên",
    "Đồng Nai",
    "Đồng Tháp",
    "Gia Lai",
    "Hà Giang",
    "Hà Nam",
    "Hà Nội",
    "Hà Tĩnh",
    "Hải Dương",
    "Hải Phòng",
    "Hậu Giang",
    "Hòa Bình",
    "Hưng Yên",
    "Khánh Hòa",
    "Kiên Giang",
    "Kon Tum",
    "Lai Châu",
    "Lâm Đồng",
    "Lạng Sơn",
    "Lào Cai",
    "Long An",
    "Nam Định",
    "Nghệ An",
    "Ninh Bình",
    "Ninh Thuận",
    "Phú Thọ",
    "Phú Yên",
    "Quảng Bình",
    "Quảng Nam",
    "Quảng Ngãi",
    "Quảng Ninh",
    "Quảng Trị",
    "Sóc Trăng",
    "Sơn La",
    "Tây Ninh",
    "Thái Bình",
    "Thái Nguyên",
    "Thanh Hóa",
    "Thừa Thiên Huế",
    "Tiền Giang",
    "TP.HCM",
    "Trà Vinh",
    "Tuyên Quang",
    "Vĩnh Long",
    "Vĩnh Phúc",
    "Yên Bái"
  ]

  const statusOptions = [
    { value: "active", label: "Hoạt động", color: "bg-green-100 text-green-800" },
    { value: "closed", label: "Tạm dừng", color: "bg-yellow-100 text-yellow-800" },
    { value: "maintenance", label: "Bảo trì", color: "bg-red-100 text-red-800" },
  ]

  useEffect(() => {
    fetchStations()
  }, [currentPage, statusFilter])

  const fetchStations = async () => {
    try {
      setLoading(true)
      let response: PageResponse<StationDto>
      if (statusFilter === "all") {
        console.log("Fetching all stations with pagination:", { page: currentPage, size: pageSize })
        response = await stationsApi.getPagedStations(currentPage, pageSize)
        console.log("Response from /stations/paged:", response)
      } else {
        console.log("Fetching stations by status:", statusFilter)
        const stations = await stationsApi.getStationsByStatus(statusFilter)
        console.log("Response from /stations/status:", stations)
        response = {
          content: stations,
          pageable: {
            pageNumber: currentPage,
            pageSize: pageSize,
            sort: { sorted: true, unsorted: false, empty: false },
            offset: currentPage * pageSize,
            paged: true,
            unpaged: false,
          },
          last: true,
          totalElements: stations.length,
          totalPages: Math.ceil(stations.length / pageSize),
          first: currentPage === 0,
          numberOfElements: stations.length,
          size: pageSize,
          number: currentPage,
          sort: { sorted: true, unsorted: false, empty: false },
          empty: stations.length === 0,
        }
      }
      setStations(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (error) {
      console.error("Error fetching stations:", error)
      toast({
        title: "Lỗi tải dữ liệu",
        description: error instanceof Error ? error.message : "Không thể kết nối tới server.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchStations()
      return
    }

    try {
      setLoading(true)
      const results = await stationsApi.searchStations(searchTerm)
      setStations(results)
      setTotalPages(Math.ceil(results.length / pageSize))
      setTotalElements(results.length)
    } catch (error) {
      toast({
        title: "Lỗi tìm kiếm",
        description: error instanceof Error ? error.message : "Không thể tìm kiếm ga.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingStation) {
        const updatedStation = await stationsApi.updateStation(editingStation.stationId, formData)
        setStations(stations.map((station) => (station.stationId === editingStation.stationId ? updatedStation : station)))
        toast({
          title: "Cập nhật thành công",
          description: `Thông tin ga "${formData.stationName}" đã được cập nhật.`,
          className: "bg-green-50 border-green-200 text-green-800",
        })
      } else {
        const newStation = await stationsApi.createStation(formData)
        setStations([...stations, newStation])
        toast({
          title: "Thêm thành công",
          description: `Ga "${formData.stationName}" đã được thêm vào hệ thống.`,
          className: "bg-green-50 border-green-200 text-green-800",
        })
      }

      setIsDialogOpen(false)
      setEditingStation(null)
      setFormData({
        stationName: "",
        location: "",
        address: "",
        city: "",
        province: "",
        phone: "",
        status: "active",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể lưu thông tin ga.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (station: StationDto) => {
    setEditingStation(station)
    setFormData({
      stationName: station.stationName,
      location: station.location,
      address: station.address,
      city: station.city,
      province: station.province,
      phone: station.phone,
      status: station.status,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (station: StationDto) => {
    setStationToDelete(station)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!stationToDelete) return

    try {
      await stationsApi.deleteStation(stationToDelete.stationId)
      setStations(stations.filter((station) => station.stationId !== stationToDelete.stationId))
      toast({
        title: "Xóa thành công",
        description: `Ga "${stationToDelete.stationName}" đã được xóa khỏi hệ thống.`,
        className: "bg-green-50 border-green-200 text-green-800",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể xóa ga.",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setStationToDelete(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find((option) => option.value === status)
    return <Badge className={statusOption?.color}>{statusOption?.label}</Badge>
  }

  const filteredStations = stations.filter((station) => {
    const matchesSearch =
      station.stationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.city.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý ga tàu</h2>
          <p className="text-muted-foreground">Quản lý thông tin các ga tàu trong hệ thống</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingStation(null)
                setFormData({
                  stationName: "",
                  location: "",
                  address: "",
                  city: "",
                  province: "",
                  phone: "",
                  status: "active",
                })
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm ga mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingStation ? "Chỉnh sửa ga" : "Thêm ga mới"}</DialogTitle>
              <DialogDescription>
                {editingStation ? "Cập nhật thông tin ga" : "Nhập thông tin ga mới vào hệ thống"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stationName">Tên ga</Label>
                    <Input
                      id="stationName"
                      value={formData.stationName}
                      onChange={(e) => setFormData({ ...formData, stationName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Vị trí</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Thành phố</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="province">Tỉnh/Thành phố</Label>
                    <Select
                      value={formData.province}
                      onValueChange={(value) => setFormData({ ...formData, province: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn tỉnh/thành phố" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Trạng thái</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingStation ? "Cập nhật" : "Thêm mới"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách ga tàu</CardTitle>
          <CardDescription>Tổng cộng {totalElements} ga trong hệ thống</CardDescription>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên ga, vị trí..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
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
          ) : filteredStations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Không tìm thấy ga nào.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên ga</TableHead>
                    <TableHead>Địa điểm</TableHead>
                    <TableHead>Địa chỉ</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStations.map((station) => (
                    <TableRow key={station.stationId}>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          {station.stationName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{station.city}</div>
                          <div className="text-sm text-muted-foreground">{station.province}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{station.address}</TableCell>
                      <TableCell>{station.phone}</TableCell>
                      <TableCell>{getStatusBadge(station.status)}</TableCell>
                      <TableCell>{new Date(station.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Mở menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(station)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(station)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Hiển thị {stations.length} trên tổng số {totalElements} ga
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm">
                    Trang {currentPage + 1} / {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa ga "{stationToDelete?.stationName}"? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
