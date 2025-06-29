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
import { fetchTripsPaged, TripDto, createTrip, updateTrip, deleteTrip, getTrip, updateTripStatus, markTripDelayed, markTripCancelled } from "@/lib/api/trips"
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
  // Custom toast state
  const [customToast, setCustomToast] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    show: false,
    title: '',
    message: '',
    type: 'info',
  });
  // State cho dialog nhập số phút trễ
  const [delayDialog, setDelayDialog] = useState<{
    open: boolean;
    tripId: number | null;
    delayMinutes: string;
    delayReason: string;
  }>({ open: false, tripId: null, delayMinutes: "", delayReason: "" });
  // State cho dialog nhập lý do hủy
  const [cancelDialog, setCancelDialog] = useState<{
    open: boolean;
    tripId: number | null;
    cancelReason: string;
  }>({ open: false, tripId: null, cancelReason: "" });

  // Custom toast function
  const showCustomToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setCustomToast({ show: true, title, message, type });
    setTimeout(() => setCustomToast({ show: false, title: '', message: '', type: 'info' }), 4000);
  };

  // Hàm loadTrips dùng lại cho mọi thao tác
  const loadTrips = () => {
    setLoading(true);
    setError(null);
    fetchTripsPaged({
      search: searchTerm,
      status: statusFilter,
      page,
      size,
      sort: ["departureTime,desc"],
    })
      .then((data) => {
        setTrips(
          data.content.map((t: TripDto) => ({
            id: t.tripId ?? 0,
            tripCode: t.tripCode,
            routeName: t.route.routeName,
            trainNumber: t.train.trainNumber,
            departureTime: convertDateTime(t.departureTime),
            arrivalTime: convertDateTime(t.arrivalTime),
            status: t.status,
            delayMinutes: t.delayMinutes ?? 0,
            createdAt: convertDateTime(t.createdAt),
          }))
        );
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      })
      .catch(() => setError("Không thể tải dữ liệu chuyến tàu."))
      .finally(() => setLoading(false));
  };

  // Gọi loadTrips trong useEffect
  useEffect(() => {
    loadTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, page, size]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Find selected route and train objects
      const selectedRoute = routes.find(r => r.routeName === formData.routeName)
      const selectedTrain = trains.find(t => t.trainNumber === formData.trainNumber)
      if (!selectedRoute || !selectedTrain) {
        toast({ title: "Thiếu thông tin", description: "Vui lòng chọn tuyến đường và tàu." })
        setLoading(false)
        return
      }
      // Format date fields as 'HH:mm:ss dd/MM/yyyy '
      function formatDateTime(dt: string) {
        if (!dt) return "";
        const d = new Date(dt);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} `;
      }
      // Map Route to RouteDto
      const routeDto = selectedRoute && {
        routeId: selectedRoute.routeId,
        routeName: selectedRoute.routeName,
        originStationId: 0, // or fetch if available
        destinationStationId: 0, // or fetch if available
        originStationName: selectedRoute.originStationName,
        destinationStationName: selectedRoute.destinationStationName,
        distance: 0, // or fetch if available
        description: "", // or fetch if available
        status: selectedRoute.status,
        createdAt: "", // or fetch if available
        updatedAt: "", // or fetch if available
      }
      // Map Train to TrainDto
      const trainDto = selectedTrain && {
        trainId: selectedTrain.id,
        trainNumber: selectedTrain.trainNumber,
        trainName: selectedTrain.trainName,
        trainType: selectedTrain.trainType,
        capacity: selectedTrain.capacity,
        status: selectedTrain.status,
        createdAt: selectedTrain.createdAt || "",
        updatedAt: selectedTrain.updatedAt || "",
      }
      let tripDto: TripDto;
      if (editingTrip) {
        tripDto = {
          tripId: editingTrip.id,
          route: routeDto,
          train: trainDto,
          tripCode: formData.tripCode,
          departureTime: formatDateTime(formData.departureTime),
          arrivalTime: formatDateTime(formData.arrivalTime),
          status: formData.status,
          delayMinutes: Number(formData.delayMinutes) || 0,
          createdAt: "",
          updatedAt: "",
        }
      } else {
        tripDto = {
          route: routeDto,
          train: trainDto,
          tripCode: formData.tripCode,
          departureTime: formatDateTime(formData.departureTime),
          arrivalTime: formatDateTime(formData.arrivalTime),
          status: formData.status,
          createdAt: "",
          updatedAt: "",
        }
      }
      if (editingTrip) {
        await updateTrip(editingTrip.id, tripDto);
        showCustomToast("✅ Thành công", "Cập nhật chuyến tàu thành công.", "success");
      } else {
        await createTrip(tripDto);
        showCustomToast("✅ Thành công", "Thêm chuyến tàu thành công.", "success");
      }
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
      loadTrips();
    } catch (err: any) {
      showCustomToast("❌ Lỗi", err.message || "Không thể lưu chuyến tàu.", "error");
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (trip: Trip) => {
    setIsDialogOpen(true);
    setEditingTrip(trip);
    setFormData({
      tripCode: "",
      routeName: "",
      trainNumber: "",
      departureTime: "",
      arrivalTime: "",
      status: "scheduled",
      delayMinutes: "0",
    });
    try {
      const tripDetail = await getTrip(trip.id);
      setFormData({
        tripCode: tripDetail.tripCode,
        routeName: tripDetail.route.routeName,
        trainNumber: tripDetail.train.trainNumber,
        departureTime: convertDateTime(tripDetail.departureTime).slice(0, 16),
        arrivalTime: convertDateTime(tripDetail.arrivalTime).slice(0, 16),
        status: tripDetail.status,
        delayMinutes: (tripDetail.delayMinutes ?? 0).toString(),
      });
    } catch (err: any) {
      toast({ title: "Lỗi", description: err.message || "Không thể lấy chi tiết chuyến tàu." });
    }
  };

  const handleDelete = async (tripId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chuyến tàu này?")) return;
    setLoading(true);
    try {
      await deleteTrip(tripId);
      showCustomToast("✅ Thành công", "Đã xóa chuyến tàu.", "success");
      loadTrips();
    } catch (err: any) {
      showCustomToast("❌ Lỗi", err.message || "Không thể xóa chuyến tàu.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (tripId: number, newStatus: string) => {
    setLoading(true);
    try {
      await updateTripStatus(tripId, newStatus);
      showCustomToast("✅ Thành công", "Đã cập nhật trạng thái chuyến tàu.", "success");
      loadTrips();
    } catch (err: any) {
      showCustomToast("❌ Lỗi", err.message || "Không thể cập nhật trạng thái.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xác nhận trễ
  const handleConfirmDelay = async () => {
    if (!delayDialog.tripId || !delayDialog.delayMinutes || !delayDialog.delayReason) return;
    setLoading(true);
    try {
      await markTripDelayed(delayDialog.tripId, Number(delayDialog.delayMinutes), delayDialog.delayReason);
      showCustomToast("✅ Thành công", `Đã đánh dấu trễ ${delayDialog.delayMinutes} phút.`, "success");
      setDelayDialog({ open: false, tripId: null, delayMinutes: "", delayReason: "" });
      loadTrips();
    } catch (err: any) {
      let errorMsg = "Không thể đánh dấu trễ.";
      if (err instanceof Response) {
        try {
          const data = await err.json();
          errorMsg = data.message || errorMsg;
        } catch {}
      } else if (err?.message) {
        errorMsg = err.message;
      }
      showCustomToast("❌ Lỗi", errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xác nhận hủy chuyến
  const handleConfirmCancel = async () => {
    if (!cancelDialog.tripId || !cancelDialog.cancelReason) return;
    setLoading(true);
    try {
      await markTripCancelled(cancelDialog.tripId, cancelDialog.cancelReason);
      showCustomToast("✅ Thành công", "Đã hủy chuyến tàu.", "success");
      setCancelDialog({ open: false, tripId: null, cancelReason: "" });
      loadTrips();
    } catch (err: any) {
      let errorMsg = "Không thể hủy chuyến tàu.";
      if (err instanceof Response) {
        try {
          const data = await err.json();
          errorMsg = data.message || errorMsg;
        } catch {}
      } else if (err?.message) {
        errorMsg = err.message;
      }
      showCustomToast("❌ Lỗi", errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

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
                {editingTrip && (
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
                )}
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
                              <DropdownMenuItem onClick={() => setDelayDialog({ open: true, tripId: trip.id, delayMinutes: "", delayReason: "" })}>
                                <AlertTriangle className="mr-2 h-4 w-4" /> Đánh dấu trễ
                              </DropdownMenuItem>
                            )}
                            {(trip.status === "scheduled" || trip.status === "delayed") && (
                              <DropdownMenuItem onClick={() => setCancelDialog({ open: true, tripId: trip.id, cancelReason: "" })}> <AlertTriangle className="mr-2 h-4 w-4" /> Hủy chuyến </DropdownMenuItem>
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
      {/* Dialog nhập số phút trễ */}
      <Dialog open={delayDialog.open} onOpenChange={open => setDelayDialog(d => ({ ...d, open }))}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Đánh dấu chuyến tàu bị trễ</DialogTitle>
            <DialogDescription>Nhập số phút trễ và lý do trễ cho chuyến tàu này.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="delayMinutesInput" className="text-right">Trễ (phút)</Label>
              <Input
                id="delayMinutesInput"
                type="number"
                min="1"
                value={delayDialog.delayMinutes}
                onChange={e => setDelayDialog(d => ({ ...d, delayMinutes: e.target.value }))}
                className="col-span-3"
                placeholder="Nhập số phút trễ"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="delayReasonInput" className="text-right">Lý do trễ</Label>
              <Input
                id="delayReasonInput"
                type="text"
                value={delayDialog.delayReason}
                onChange={e => setDelayDialog(d => ({ ...d, delayReason: e.target.value }))}
                className="col-span-3"
                placeholder="Nhập lý do trễ"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleConfirmDelay} disabled={!delayDialog.delayMinutes || !delayDialog.delayReason || loading}>
              Xác nhận
            </Button>
            <Button variant="outline" onClick={() => setDelayDialog({ open: false, tripId: null, delayMinutes: "", delayReason: "" })}>
              Hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Dialog nhập lý do hủy chuyến */}
      <Dialog open={cancelDialog.open} onOpenChange={open => setCancelDialog(d => ({ ...d, open }))}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Hủy chuyến tàu</DialogTitle>
            <DialogDescription>Nhập lý do hủy chuyến tàu này.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cancelReasonInput" className="text-right">Lý do hủy</Label>
              <Input
                id="cancelReasonInput"
                type="text"
                value={cancelDialog.cancelReason}
                onChange={e => setCancelDialog(d => ({ ...d, cancelReason: e.target.value }))}
                className="col-span-3"
                placeholder="Nhập lý do hủy"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleConfirmCancel} disabled={!cancelDialog.cancelReason || loading}>
              Xác nhận
            </Button>
            <Button variant="outline" onClick={() => setCancelDialog({ open: false, tripId: null, cancelReason: "" })}>
              Hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {customToast.show && (
        <div className={`fixed top-4 right-4 z-[9999] p-4 rounded-lg shadow-lg border max-w-sm ` +
          (customToast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            customToast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-blue-50 border-blue-200 text-blue-800')
        }>
          <div className="font-semibold">{customToast.title}</div>
          <div className="text-sm mt-1">{customToast.message}</div>
          <button
            onClick={() => setCustomToast({ show: false, title: '', message: '', type: 'info' })}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}
