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
import { Edit, MoreHorizontal, Plus, Search, Trash2, Clock, AlertTriangle, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { fetchTripsPaged, TripDto } from "@/lib/api/trips"
import { fetchActiveTrains, Train } from "@/lib/api/trains"
import { fetchActiveRoutes, Route } from "@/lib/api/routes"

interface Trip {
  id: number
  tripCode: string
  routeName: string
  trainNumber: string
  departureTime: string
  arrivalTime: string
  status: string
  delayMinutes: number
  createdAt: string
}

export default function TripsManagement() {
  const { toast } = useToast()
  const [trips, setTrips] = useState<Trip[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)
  const [formData, setFormData] = useState({
    tripCode: "",
    routeName: "",
    trainNumber: "",
    departureTime: "",
    arrivalTime: "",
    status: "scheduled",
    delayMinutes: "0",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(5)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [routes, setRoutes] = useState<Route[]>([])
  const [trains, setTrains] = useState<Train[]>([])

  // Lấy dữ liệu từ API
  useEffect(() => {
    let ignore = false
    setLoading(true)
    setError(null)
    fetchTripsPaged({
      search: searchTerm,
      status: statusFilter,
      page,
      size,
      sort: ["departureTime,asc"],
    })
      .then((data) => {
        if (ignore) return
        setTrips(
          data.content.map((t: TripDto) => ({
            id: t.tripId,
            tripCode: t.tripCode,
            routeName: t.route.routeName,
            trainNumber: t.train.trainNumber,
            departureTime: convertDateTime(t.departureTime),
            arrivalTime: convertDateTime(t.arrivalTime),
            status: t.status,
            delayMinutes: t.delayMinutes,
            createdAt: convertDateTime(t.createdAt),
          }))
        )
        setTotalPages(data.totalPages)
        setTotalElements(data.totalElements)
      })
      .catch((err) => {
        setError("Không thể tải dữ liệu chuyến tàu.")
      })
      .finally(() => setLoading(false))
    return () => {
      ignore = true
    }
  }, [searchTerm, statusFilter, page, size])

  // Lấy danh sách tuyến và tàu khi mở dialog
  useEffect(() => {
    if (isDialogOpen) {
      fetchActiveRoutes().then(setRoutes).catch(() => setRoutes([]))
      fetchActiveTrains().then(setTrains).catch(() => setTrains([]))
    }
  }, [isDialogOpen])

  // Helper chuyển đổi định dạng ngày giờ từ API
  function convertDateTime(str: string) {
    // Nếu là ISO thì trả về luôn, nếu là dd/MM/yyyy thì convert
    if (!str) return ""
    if (str.includes("T")) return str
    // Ví dụ: "07:00:00 24/06/2025 " => "2025-06-24T07:00:00"
    const match = str.match(/(\d{2}):(\d{2}):(\d{2}) (\d{2})\/(\d{2})\/(\d{4})/)
    if (match) {
      const [_, hh, mm, ss, dd, MM, yyyy] = match
      return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}`
    }
    return str
  }

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái", color: "" },
    { value: "scheduled", label: "Đã lên lịch", color: "bg-blue-100 text-blue-800" },
    { value: "delayed", label: "Trễ giờ", color: "bg-yellow-100 text-yellow-800" },
    { value: "cancelled", label: "Đã hủy", color: "bg-red-100 text-red-800" },
    { value: "completed", label: "Hoàn thành", color: "bg-green-100 text-green-800" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Gọi API thêm/sửa chuyến tàu
    setIsDialogOpen(false)
    setEditingTrip(null)
    setFormData({
      tripCode: "",
      routeName: "",
      trainNumber: "",
      departureTime: "",
      arrivalTime: "",
      status: "scheduled",
      delayMinutes: "0",
    })
    toast({
      title: "Chức năng đang phát triển",
      description: "Chức năng thêm/sửa sẽ cập nhật sau.",
    })
  }

  const handleEdit = (trip: Trip) => {
    setEditingTrip(trip)
    setFormData({
      tripCode: trip.tripCode,
      routeName: trip.routeName,
      trainNumber: trip.trainNumber,
      departureTime: trip.departureTime.slice(0, 16),
      arrivalTime: trip.arrivalTime.slice(0, 16),
      status: trip.status,
      delayMinutes: trip.delayMinutes.toString(),
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (tripId: number) => {
    // TODO: Gọi API xóa chuyến tàu
    toast({
      title: "Chức năng đang phát triển",
      description: "Chức năng xóa sẽ cập nhật sau.",
    })
  }

  const handleUpdateStatus = (tripId: number, newStatus: string) => {
    // TODO: Gọi API cập nhật trạng thái
    toast({
      title: "Chức năng đang phát triển",
      description: "Chức năng cập nhật trạng thái sẽ cập nhật sau.",
    })
  }

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find((option) => option.value === status)
    return <Badge className={statusOption?.color}>{statusOption?.label}</Badge>
  }

  const formatDateTime = (dateTimeStr: string) => {
    return new Date(dateTimeStr).toLocaleString("vi-VN")
  }

  const calculateDuration = (departure: string, arrival: string) => {
    const dep = new Date(departure)
    const arr = new Date(arrival)
    const diffMs = arr.getTime() - dep.getTime()
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý chuyến tàu</h2>
          <p className="text-muted-foreground">Quản lý lịch trình và trạng thái các chuyến tàu</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingTrip(null)
                setFormData({
                  tripCode: "",
                  routeName: "",
                  trainNumber: "",
                  departureTime: "",
                  arrivalTime: "",
                  status: "scheduled",
                  delayMinutes: "0",
                })
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm chuyến tàu
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingTrip ? "Chỉnh sửa chuyến tàu" : "Thêm chuyến tàu mới"}</DialogTitle>
              <DialogDescription>
                {editingTrip ? "Cập nhật thông tin chuyến tàu" : "Nhập thông tin chuyến tàu mới"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tripCode" className="text-right">
                    Mã chuyến
                  </Label>
                  <Input
                    id="tripCode"
                    value={formData.tripCode}
                    onChange={(e) => setFormData({ ...formData, tripCode: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="routeName" className="text-right">
                    Tuyến đường
                  </Label>
                  <Select
                    value={formData.routeName}
                    onValueChange={(value) => setFormData({ ...formData, routeName: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Chọn tuyến đường" />
                    </SelectTrigger>
                    <SelectContent>
                      {routes.map((route) => (
                        <SelectItem key={route.routeId} value={route.routeName}>
                          {route.routeName} ({route.originStationName} - {route.destinationStationName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="trainNumber" className="text-right">
                    Số tàu
                  </Label>
                  <Select
                    value={formData.trainNumber}
                    onValueChange={(value) => setFormData({ ...formData, trainNumber: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Chọn tàu" />
                    </SelectTrigger>
                    <SelectContent>
                      {trains.map((train) => (
                        <SelectItem key={train.id} value={train.trainNumber}>
                          {train.trainNumber} - {train.trainName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="departureTime" className="text-right">
                    Giờ khởi hành
                  </Label>
                  <Input
                    id="departureTime"
                    type="datetime-local"
                    value={formData.departureTime}
                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="arrivalTime" className="text-right">
                    Giờ đến
                  </Label>
                  <Input
                    id="arrivalTime"
                    type="datetime-local"
                    value={formData.arrivalTime}
                    onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Trạng thái
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.filter(s => s.value !== "all").map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="delayMinutes" className="text-right">
                    Trễ (phút)
                  </Label>
                  <Input
                    id="delayMinutes"
                    type="number"
                    min="0"
                    value={formData.delayMinutes}
                    onChange={(e) => setFormData({ ...formData, delayMinutes: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingTrip ? "Cập nhật" : "Thêm mới"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách chuyến tàu</CardTitle>
          <CardDescription>Tổng cộng {totalElements} chuyến tàu trong hệ thống</CardDescription>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm chuyến tàu..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(0); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
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
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8"><Loader2 className="animate-spin mr-2" /> Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="text-red-600 py-8 text-center">{error}</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã chuyến</TableHead>
                    <TableHead>Tuyến đường</TableHead>
                    <TableHead>Tàu</TableHead>
                    <TableHead>Khởi hành</TableHead>
                    <TableHead>Đến nơi</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trips.map((trip) => (
                    <TableRow key={trip.id}>
                      <TableCell className="font-medium">{trip.tripCode}</TableCell>
                      <TableCell>{trip.routeName}</TableCell>
                      <TableCell>{trip.trainNumber}</TableCell>
                      <TableCell>{formatDateTime(trip.departureTime)}</TableCell>
                      <TableCell>{formatDateTime(trip.arrivalTime)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{calculateDuration(trip.departureTime, trip.arrivalTime)}</span>
                          {trip.delayMinutes > 0 && (
                            <div className="flex items-center text-yellow-600">
                              <AlertTriangle className="h-3 w-3 ml-1" />
                              <span className="text-xs">+{trip.delayMinutes}m</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(trip.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Mở menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(trip)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            {trip.status === "scheduled" && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(trip.id, "delayed")}> <AlertTriangle className="mr-2 h-4 w-4" /> Đánh dấu trễ </DropdownMenuItem>
                            )}
                            {trip.status !== "cancelled" && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(trip.id, "cancelled")}> <AlertTriangle className="mr-2 h-4 w-4" /> Hủy chuyến </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDelete(trip.id)} className="text-red-600">
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
              {/* Pagination */}
              <div className="flex flex-wrap justify-between items-center mt-4 gap-2">
                <div>
                  Trang <b>{page + 1}</b> / <b>{totalPages}</b> ({totalElements} chuyến tàu)
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(0)}>
                    Đầu
                  </Button>
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                    Trước
                  </Button>
                  <span>
                    <Input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={page + 1}
                      onChange={e => {
                        let val = Number(e.target.value)
                        if (isNaN(val) || val < 1) val = 1
                        if (val > totalPages) val = totalPages
                        setPage(val - 1)
                      }}
                      className="w-14 h-8 px-2 text-center"
                    />
                  </span>
                  <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>
                    Sau
                  </Button>
                  <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage(totalPages - 1)}>
                    Cuối
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
