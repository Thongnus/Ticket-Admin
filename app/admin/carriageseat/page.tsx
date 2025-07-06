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
import { Edit, MoreHorizontal, Plus, Search, Trash2, Sofa, Armchair, Eye, Grid3X3 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { carriageSeatApi, CarriageWithSeatsDto } from "@/lib/api/carriageseat"
import { fetchActiveTrains, Train as ApiTrain } from "@/lib/api/trains"

interface Carriage {
  carriage_id: number
  train_id: number
  carriage_number: string
  carriage_type: "hard_seat" | "soft_seat" | "hard_sleeper" | "soft_sleeper" | "vip"
  capacity: number
  status: "active" | "maintenance" | "retired"
  created_at: string
  updated_at: string
}

interface Seat {
  seat_id: number
  carriage_id: number
  seat_number: string
  seat_type: "window" | "aisle" | "middle" | "lower_berth" | "middle_berth" | "upper_berth"
  status: "active" | "maintenance" | "unavailable"
  created_at: string
  updated_at: string
}

export default function TrainCarriageSeatManagement() {
  const { toast } = useToast()

  const [trains, setTrains] = useState<ApiTrain[]>([])

  // Remove mock data for carriages and seats
  const [carriages, setCarriages] = useState<Carriage[]>([])
  const [seats, setSeats] = useState<Seat[]>([])
  const [loadingCarriages, setLoadingCarriages] = useState(false)
  const [loadingSeats, setLoadingSeats] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCarriageDialogOpen, setIsCarriageDialogOpen] = useState(false)
  const [isSeatsViewOpen, setIsSeatsViewOpen] = useState(false)
  const [isSeatDialogOpen, setIsSeatDialogOpen] = useState(false)
  const [selectedCarriage, setSelectedCarriage] = useState<Carriage | null>(null)
  const [editingCarriage, setEditingCarriage] = useState<Carriage | null>(null)
  const [editingSeat, setEditingSeat] = useState<Seat | null>(null)
  const [refreshSeats, setRefreshSeats] = useState(0)
  const [refreshCarriages, setRefreshCarriages] = useState(0)

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

  const [carriageFormData, setCarriageFormData] = useState({
    train_id: "",
    carriage_number: "",
    carriage_type: "soft_seat" as Carriage["carriage_type"],
    capacity: "",
    status: "active" as Carriage["status"],
  })

  const [seatFormData, setSeatFormData] = useState({
    seat_number: "",
    seat_type: "window" as Seat["seat_type"],
    status: "active" as Seat["status"],
  })

  const carriageTypes = [
    { value: "hard_seat", label: "Ghế cứng" },
    { value: "soft_seat", label: "Ghế mềm" },
    { value: "hard_sleeper", label: "Giường nằm cứng" },
    { value: "soft_sleeper", label: "Giường nằm mềm" },
    { value: "vip", label: "VIP" },
  ]

  const carriageStatusOptions = [
    { value: "active", label: "Hoạt động", color: "bg-green-100 text-green-800" },
    { value: "maintenance", label: "Bảo trì", color: "bg-yellow-100 text-yellow-800" },
    { value: "retired", label: "Ngừng hoạt động", color: "bg-red-100 text-red-800" },
  ]

  const seatTypes = [
    { value: "window", label: "Cửa sổ" },
    { value: "aisle", label: "Lối đi" },
    { value: "middle", label: "Giữa" },
    { value: "lower_berth", label: "Giường dưới" },
    { value: "middle_berth", label: "Giường giữa" },
    { value: "upper_berth", label: "Giường trên" },
  ]

  const seatStatusOptions = [
    { value: "active", label: "Hoạt động", color: "bg-green-100 text-green-800" },
    { value: "maintenance", label: "Bảo trì", color: "bg-yellow-100 text-yellow-800" },
    { value: "unavailable", label: "Không khả dụng", color: "bg-red-100 text-red-800" },
  ]

  // Custom toast function
  const showCustomToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setCustomToast({ show: true, title, message, type });
    setTimeout(() => setCustomToast({ show: false, title: '', message: '', type: 'info' }), 4000);
  };

  // Helper functions
  const getSeatsByCarriageId = (carriageId: number) => {
    return seats.filter((seat) => seat.carriage_id === carriageId)
  }

  const filteredCarriages = carriages.filter((carriage) => {
    const matchesSearch =
      carriage.carriage_number.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || carriage.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Helper to convert ISO string to LocalDateTime string (no Z, no ms)
  function toLocalDateTimeString(date: string) {
    return date.replace(/Z$/, '').replace(/\.(\d{3,})/, '');
  }

  // Fetch carriages on mount (you may want to implement this with your real API later)
  useEffect(() => {
    fetchActiveTrains()
      .then(setTrains)
      .catch((error) => {
        toast({ title: "Lỗi", description: error.message || "Không thể tải danh sách tàu." })
      })
  }, [])

  useEffect(() => {
    setLoadingCarriages(true)
    carriageSeatApi.getAllCarriagesWithSeats()
      .then((data) => {
        // Flatten all carriages and seats into state
        setCarriages(
          data.map((item) => ({
            carriage_id: item.carriage.carriageId,
            train_id: item.carriage.trainId || 0,
            carriage_number: item.carriage.carriageNumber,
            carriage_type: item.carriage.carriageType as Carriage["carriage_type"],
            capacity: item.carriage.capacity,
            status: item.carriage.status as Carriage["status"],
            created_at: item.carriage.createdAt || "",
            updated_at: item.carriage.updatedAt || "",
          }))
        )
        setSeats(
          data.flatMap((item) =>
            item.seats.map((seat) => ({
              seat_id: seat.seatId,
              carriage_id: item.carriage.carriageId,
              seat_number: seat.seatNumber,
              seat_type: seat.seatType as Seat["seat_type"],
              status: seat.status as Seat["status"],
              created_at: seat.createdAt,
              updated_at: seat.updatedAt,
            }))
          )
        )
      })
      .catch((error) => {
        toast({ title: "Lỗi", description: error.message || "Không thể tải danh sách toa tàu." })
      })
      .finally(() => setLoadingCarriages(false))
  }, [])

  // Refresh seats when refreshSeats changes
  useEffect(() => {
    if (selectedCarriage && refreshSeats > 0) {
      handleViewSeats(selectedCarriage)
      setRefreshSeats(0) // reset
    }
  }, [refreshSeats])

  // Refresh carriages when refreshCarriages changes
  useEffect(() => {
    if (refreshCarriages > 0) {
      setLoadingCarriages(true)
      carriageSeatApi.getAllCarriagesWithSeats()
        .then((data) => {
          setCarriages(
            data.map((item) => ({
              carriage_id: item.carriage.carriageId,
              train_id: item.carriage.trainId || 0,
              carriage_number: item.carriage.carriageNumber,
              carriage_type: item.carriage.carriageType as Carriage["carriage_type"],
              capacity: item.carriage.capacity,
              status: item.carriage.status as Carriage["status"],
              created_at: item.carriage.createdAt || "",
              updated_at: item.carriage.updatedAt || "",
            }))
          )
          setSeats(
            data.flatMap((item) =>
              item.seats.map((seat) => ({
                seat_id: seat.seatId,
                carriage_id: item.carriage.carriageId,
                seat_number: seat.seatNumber,
                seat_type: seat.seatType as Seat["seat_type"],
                status: seat.status as Seat["status"],
                created_at: seat.createdAt,
                updated_at: seat.updatedAt,
              }))
            )
          )
        })
        .catch((error) => {
          toast({ title: "Lỗi", description: error.message || "Không thể tải danh sách toa tàu." })
        })
        .finally(() => setLoadingCarriages(false))
      setRefreshCarriages(0) // reset
    }
  }, [refreshCarriages])

  // Khi đóng popup xem ghế, fetch lại toàn bộ danh sách toa và ghế
  useEffect(() => {
    if (!isSeatsViewOpen) {
      setLoadingCarriages(true)
      carriageSeatApi.getAllCarriagesWithSeats()
        .then((data) => {
          setCarriages(
            data.map((item) => ({
              carriage_id: item.carriage.carriageId,
              train_id: item.carriage.trainId || 0,
              carriage_number: item.carriage.carriageNumber,
              carriage_type: item.carriage.carriageType as Carriage["carriage_type"],
              capacity: item.carriage.capacity,
              status: item.carriage.status as Carriage["status"],
              created_at: item.carriage.createdAt || "",
              updated_at: item.carriage.updatedAt || "",
            }))
          )
          setSeats(
            data.flatMap((item) =>
              item.seats.map((seat) => ({
                seat_id: seat.seatId,
                carriage_id: item.carriage.carriageId,
                seat_number: seat.seatNumber,
                seat_type: seat.seatType as Seat["seat_type"],
                status: seat.status as Seat["status"],
                created_at: seat.createdAt,
                updated_at: seat.updatedAt,
              }))
            )
          )
        })
        .catch((error) => {
          toast({ title: "Lỗi", description: error.message || "Không thể tải danh sách toa tàu." })
        })
        .finally(() => setLoadingCarriages(false))
    }
  }, [isSeatsViewOpen])

  // View seats for a specific carriage
  const handleViewSeats = async (carriage: Carriage) => {
    setSelectedCarriage(carriage)
    setIsSeatsViewOpen(true)
    setLoadingSeats(true)
    try {
      const data: CarriageWithSeatsDto = await carriageSeatApi.getCarriageWithSeats(carriage.carriage_id)
      setSelectedCarriage({
        carriage_id: data.carriage.carriageId,
        train_id: data.carriage.trainId || 0,
        carriage_number: data.carriage.carriageNumber,
        carriage_type: data.carriage.carriageType as Carriage["carriage_type"],
        capacity: data.carriage.capacity,
        status: data.carriage.status as Carriage["status"],
        created_at: data.carriage.createdAt || "",
        updated_at: data.carriage.updatedAt || "",
      })
      setSeats(
        data.seats.map((seat) => ({
          seat_id: seat.seatId,
          carriage_id: seat.carriage.carriageId,
          seat_number: seat.seatNumber,
          seat_type: seat.seatType as Seat["seat_type"],
          status: seat.status as Seat["status"],
          created_at: seat.createdAt,
          updated_at: seat.updatedAt,
        }))
      )
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message || "Không thể tải ghế." })
    } finally {
      setLoadingSeats(false)
    }
  }

  // Carriage handlers
  const handleCarriageSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const selectedTrain = trains.find((train) => train.id === Number.parseInt(carriageFormData.train_id))

    if (editingCarriage) {
      try {
        const updatedCarriage = await carriageSeatApi.updateCarriage(editingCarriage.carriage_id, {
          carriageId: editingCarriage.carriage_id,
          carriageNumber: carriageFormData.carriage_number,
          carriageType: carriageFormData.carriage_type,
          capacity: Number.parseInt(carriageFormData.capacity),
          status: carriageFormData.status,
          trainId: Number.parseInt(carriageFormData.train_id),
          trainName: selectedTrain?.trainName,
        })
        toast({
          title: "Cập nhật thành công",
          description: "Thông tin toa tàu đã được cập nhật.",
        })
        showCustomToast("✅ Thành công", "Cập nhật toa tàu thành công.", "success");
        setRefreshCarriages(prev => prev + 1)
      } catch (error: any) {
        toast({ title: "Lỗi", description: error.message || "Không thể cập nhật toa tàu." })
        showCustomToast("❌ Lỗi", error.message || "Không thể cập nhật toa tàu.", "error");
      }
    } else {
      try {
        const newCarriageDto = {
          carriageId: 0,
          carriageNumber: carriageFormData.carriage_number,
          carriageType: carriageFormData.carriage_type,
          capacity: Number.parseInt(carriageFormData.capacity),
          status: carriageFormData.status,
          trainId: Number.parseInt(carriageFormData.train_id),
          trainName: selectedTrain?.trainName,
        };
        await carriageSeatApi.createCarriage(newCarriageDto);
        toast({
          title: "Thêm thành công",
          description: "Toa tàu mới đã được thêm vào hệ thống.",
        });
        showCustomToast("✅ Thành công", "Thêm toa tàu thành công.", "success");
        setRefreshCarriages(prev => prev + 1)
      } catch (error: any) {
        toast({ title: "Lỗi", description: error.message || "Không thể thêm toa tàu." })
        showCustomToast("❌ Lỗi", error.message || "Không thể thêm toa tàu.", "error");
      }
    }

    setIsCarriageDialogOpen(false)
    setEditingCarriage(null)
    setCarriageFormData({
      train_id: "",
      carriage_number: "",
      carriage_type: "soft_seat",
      capacity: "",
      status: "active",
    })
  }

  const handleEditCarriage = (carriage: Carriage) => {
    setEditingCarriage(carriage)
    setCarriageFormData({
      train_id: carriage.train_id.toString(),
      carriage_number: carriage.carriage_number,
      carriage_type: carriage.carriage_type,
      capacity: carriage.capacity.toString(),
      status: carriage.status,
    })
    setIsCarriageDialogOpen(true)
  }

  const handleDeleteCarriage = async (carriageId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa toa tàu này? Tất cả ghế trong toa sẽ bị xóa theo.")) return;
    try {
      await carriageSeatApi.deleteCarriage(carriageId)
      toast({
        title: "Xóa thành công",
        description: "Toa tàu và tất cả ghế trong toa đã được xóa khỏi hệ thống.",
      })
      showCustomToast("✅ Thành công", "Đã xóa toa tàu và tất cả ghế.", "success");
      setRefreshCarriages(prev => prev + 1)
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message || "Không thể xóa toa tàu." })
      showCustomToast("❌ Lỗi", error.message || "Không thể xóa toa tàu.", "error");
    }
  }

  // Seat handlers
  const handleSeatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCarriage) return

    if (editingSeat) {
      try {
        const updatedSeat = await carriageSeatApi.updateSeat(editingSeat.seat_id, {
          seatId: editingSeat.seat_id,
          seatNumber: seatFormData.seat_number,
          seatType: seatFormData.seat_type,
          status: seatFormData.status,
          carriage: { carriageId: selectedCarriage.carriage_id } as any,
          createdAt: "",
          updatedAt: "",
          price: null,
          booked: false,
        })
        toast({ title: "Cập nhật thành công", description: "Thông tin ghế đã được cập nhật." })
        showCustomToast("✅ Thành công", "Cập nhật ghế thành công.", "success");
        setRefreshSeats(prev => prev + 1)
        setRefreshCarriages(prev => prev + 1)
      } catch (error: any) {
        toast({ title: "Lỗi", description: error.message || "Không thể cập nhật ghế." })
        showCustomToast("❌ Lỗi", error.message || "Không thể cập nhật ghế.", "error");
      }
    } else {
      try {
        await carriageSeatApi.createSeat({
          seatId: 0,
          seatNumber: seatFormData.seat_number,
          seatType: seatFormData.seat_type,
          status: seatFormData.status,
          carriage: { carriageId: selectedCarriage.carriage_id } as any,
          createdAt: "",
          updatedAt: "",
          price: null,
          booked: false,
        })
        toast({ title: "Thêm thành công", description: "Ghế mới đã được thêm vào hệ thống." })
        showCustomToast("✅ Thành công", "Thêm ghế thành công.", "success");
        setRefreshSeats(prev => prev + 1)
        setRefreshCarriages(prev => prev + 1)
      } catch (error: any) {
        toast({ title: "Lỗi", description: error.message || "Không thể thêm ghế." })
        showCustomToast("❌ Lỗi", error.message || "Không thể thêm ghế.", "error");
      }
    }

    setIsSeatDialogOpen(false)
    setEditingSeat(null)
    setSeatFormData({
      seat_number: "",
      seat_type: "window",
      status: "active",
    })
  }

  const handleEditSeat = (seat: Seat) => {
    setEditingSeat(seat)
    setSeatFormData({
      seat_number: seat.seat_number,
      seat_type: seat.seat_type,
      status: seat.status,
    })
    setIsSeatDialogOpen(true)
  }

  const handleDeleteSeat = async (seatId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa ghế này?")) return;
    try {
      await carriageSeatApi.deleteSeat(seatId)
      toast({ title: "Xóa thành công", description: "Ghế đã được xóa khỏi hệ thống." })
      showCustomToast("✅ Thành công", "Đã xóa ghế.", "success");
      setRefreshSeats(prev => prev + 1)
      setRefreshCarriages(prev => prev + 1)
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message || "Không thể xóa ghế." })
      showCustomToast("❌ Lỗi", error.message || "Không thể xóa ghế.", "error");
    }
  }

  // Utility functions
  const getStatusBadge = (status: string, type: "carriage" | "seat") => {
    const statusOptions = type === "carriage" ? carriageStatusOptions : seatStatusOptions
    const statusOption = statusOptions.find((option) => option.value === status)
    return <Badge className={statusOption?.color}>{statusOption?.label}</Badge>
  }

  const getCarriageTypeLabel = (type: string) => {
    const carriageType = carriageTypes.find((t) => t.value === type)
    return carriageType?.label || type
  }

  const getSeatTypeLabel = (type: string) => {
    const seatType = seatTypes.find((t) => t.value === type)
    return seatType?.label || type
  }

  const carriageSeats = selectedCarriage ? getSeatsByCarriageId(selectedCarriage.carriage_id) : []

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý toa tàu & ghế</h2>
          <p className="text-muted-foreground">Quản lý thông tin các toa tàu và ghế trong hệ thống</p>
        </div>
        <Dialog open={isCarriageDialogOpen} onOpenChange={setIsCarriageDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingCarriage(null)
                setCarriageFormData({
                  train_id: "",
                  carriage_number: "",
                  carriage_type: "soft_seat",
                  capacity: "",
                  status: "active",
                })
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm toa tàu mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingCarriage ? "Chỉnh sửa toa tàu" : "Thêm toa tàu mới"}</DialogTitle>
              <DialogDescription>
                {editingCarriage ? "Cập nhật thông tin toa tàu" : "Nhập thông tin toa tàu mới vào hệ thống"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCarriageSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="train_id" className="text-right">
                    Thuộc tàu
                  </Label>
                  <Select
                    value={carriageFormData.train_id}
                    onValueChange={(value) => setCarriageFormData({ ...carriageFormData, train_id: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Chọn tàu" />
                    </SelectTrigger>
                    <SelectContent>
                      {trains.map((train) => (
                        <SelectItem key={train.id} value={train.id.toString()}>
                          {train.trainNumber} - {train.trainName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="carriage_number" className="text-right">
                    Số hiệu toa
                  </Label>
                  <Input
                    id="carriage_number"
                    value={carriageFormData.carriage_number}
                    onChange={(e) => setCarriageFormData({ ...carriageFormData, carriage_number: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="carriage_type" className="text-right">
                    Loại toa
                  </Label>
                  <Select
                    value={carriageFormData.carriage_type}
                    onValueChange={(value: Carriage["carriage_type"]) =>
                      setCarriageFormData({ ...carriageFormData, carriage_type: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {carriageTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="capacity" className="text-right">
                    Sức chứa
                  </Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={carriageFormData.capacity}
                    onChange={(e) => setCarriageFormData({ ...carriageFormData, capacity: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Trạng thái
                  </Label>
                  <Select
                    value={carriageFormData.status}
                    onValueChange={(value: Carriage["status"]) =>
                      setCarriageFormData({ ...carriageFormData, status: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {carriageStatusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingCarriage ? "Cập nhật" : "Thêm mới"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo số hiệu toa hoặc tàu..."
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
            {carriageStatusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Carriages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách toa tàu</CardTitle>
          <CardDescription>Tổng cộng {carriages.length} toa tàu trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingCarriages ? (
            <div className="text-center py-12 text-muted-foreground">Đang tải danh sách toa tàu...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Số hiệu toa</TableHead>
                  <TableHead>Thuộc tàu</TableHead>
                  <TableHead>Loại toa</TableHead>
                  <TableHead>Sức chứa</TableHead>
                  <TableHead>Số ghế hiện tại</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCarriages.map((carriage) => (
                  <TableRow key={carriage.carriage_id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Sofa className="mr-2 h-4 w-4 text-muted-foreground" />
                        {carriage.carriage_number}
                      </div>
                    </TableCell>
                    <TableCell>{(() => {
                      const train = trains.find(t => t.id === carriage.train_id);
                      return train ? `${train.trainNumber} - ${train.trainName}` : "";
                    })()}</TableCell>
                    <TableCell>{getCarriageTypeLabel(carriage.carriage_type)}</TableCell>
                    <TableCell>{carriage.capacity} chỗ</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewSeats(carriage)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {getSeatsByCarriageId(carriage.carriage_id).length} ghế
                        <Eye className="ml-1 h-3 w-3" />
                      </Button>
                    </TableCell>
                    <TableCell>{getStatusBadge(carriage.status, "carriage")}</TableCell>
                    <TableCell>{new Date(carriage.created_at).toLocaleDateString("vi-VN")}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Mở menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewSeats(carriage)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem ghế
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditCarriage(carriage)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteCarriage(carriage.carriage_id)}
                            className="text-red-600"
                          >
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
          )}
        </CardContent>
      </Card>

      {/* Seats View Dialog */}
      <Dialog open={isSeatsViewOpen} onOpenChange={setIsSeatsViewOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-visible">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sofa className="h-5 w-5" />
              Sơ đồ ghế toa {selectedCarriage?.carriage_number} - Tàu {(() => {
                const train = trains.find(t => t.id === selectedCarriage?.train_id);
                return train ? `${train.trainNumber} - ${train.trainName}` : "";
              })()}
            </DialogTitle>
            <DialogDescription>
              Quản lý {carriageSeats.length} ghế trong toa {selectedCarriage?.carriage_number} (
              {getCarriageTypeLabel(selectedCarriage?.carriage_type || "")})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Stats and Add Button */}
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                  <span className="text-sm">
                    Hoạt động ({carriageSeats.filter((s) => s.status === "active").length})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                  <span className="text-sm">
                    Bảo trì ({carriageSeats.filter((s) => s.status === "maintenance").length})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                  <span className="text-sm">
                    Không khả dụng ({carriageSeats.filter((s) => s.status === "unavailable").length})
                  </span>
                </div>
                <Badge variant="outline" className="text-sm">
                  {carriageSeats.length}/{selectedCarriage?.capacity} ghế
                </Badge>
              </div>
              <Dialog open={isSeatDialogOpen} onOpenChange={setIsSeatDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingSeat(null)
                      setSeatFormData({
                        seat_number: "",
                        seat_type: "window",
                        status: "active",
                      })
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm ghế
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{editingSeat ? "Chỉnh sửa ghế" : "Thêm ghế mới"}</DialogTitle>
                    <DialogDescription>
                      {editingSeat
                        ? "Cập nhật thông tin ghế"
                        : `Thêm ghế mới vào toa ${selectedCarriage?.carriage_number}`}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSeatSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="seat_number" className="text-right">
                          Số ghế
                        </Label>
                        <Input
                          id="seat_number"
                          value={seatFormData.seat_number}
                          onChange={(e) => setSeatFormData({ ...seatFormData, seat_number: e.target.value })}
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="seat_type" className="text-right">
                          Loại ghế
                        </Label>
                        <Select
                          value={seatFormData.seat_type}
                          onValueChange={(value: Seat["seat_type"]) =>
                            setSeatFormData({ ...seatFormData, seat_type: value })
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {seatTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="seat_status" className="text-right">
                          Trạng thái
                        </Label>
                        <Select
                          value={seatFormData.status}
                          onValueChange={(value: Seat["status"]) => setSeatFormData({ ...seatFormData, status: value })}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {seatStatusOptions.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">{editingSeat ? "Cập nhật" : "Thêm mới"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Seats Grid - Simple & Clean */}
            <div className="bg-white border rounded-lg p-4 max-h-[60vh] overflow-y-auto overflow-x-visible">
              {loadingSeats ? (
                <div className="text-center py-12 text-muted-foreground">Đang tải ghế...</div>
              ) : carriageSeats.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Grid3X3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Chưa có ghế nào trong toa này</p>
                  <p className="text-sm">Nhấn "Thêm ghế" để bắt đầu thêm ghế</p>
                </div>
              ) : (
                <div className="grid grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                  {carriageSeats
                    .sort((a, b) => (a.seat_number || '').localeCompare(b.seat_number || ''))
                    .map((seat, index) => (
                      <div
                        key={seat.seat_id || `seat-${index}-${seat.seat_number || 'unknown'}`}
                        className={`relative group cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md ${
                          seat.status === "active"
                            ? "bg-green-50 border-green-200 hover:bg-green-100"
                            : seat.status === "maintenance"
                              ? "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
                              : "bg-red-50 border-red-200 hover:bg-red-100"
                        } border-2 rounded-lg p-2 aspect-square flex flex-col items-center justify-center`}
                      >
                        {/* Seat Icon */}
                        <Armchair
                          className={`h-4 w-4 mb-1 ${
                            seat.status === "active"
                              ? "text-green-600"
                              : seat.status === "maintenance"
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        />

                        {/* Seat Number */}
                        <span className="text-xs font-bold text-gray-700 leading-none">{seat.seat_number}</span>

                        {/* Seat Type Indicator */}
                        <div className="absolute top-1 right-1">
                          {seat.seat_type === "window" && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" title="Cửa sổ"></div>
                          )}
                          {seat.seat_type && seat.seat_type.includes("berth") && (
                            <div className="w-2 h-2 bg-purple-500 rounded-full" title="Giường nằm"></div>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              seat.status === "active"
                                ? "bg-green-500"
                                : seat.status === "maintenance"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }`}
                          ></div>
                        </div>

                        {/* Dropdown Menu */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-10 rounded-lg flex items-center justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 bg-white shadow-md hover:bg-gray-50"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditSeat(seat)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteSeat(seat.seat_id)} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Tooltip - Fixed z-index and positioning */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                          <div className="text-center">
                            <div className="font-semibold">{seat.seat_number}</div>
                            <div>{getSeatTypeLabel(seat.seat_type)}</div>
                            <div className="text-gray-300">
                              {seatStatusOptions.find((s) => s.value === seat.status)?.label}
                            </div>
                          </div>
                          {/* Tooltip arrow */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Simple Legend */}
              {carriageSeats.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Cửa sổ</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Giường nằm</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span>Hoạt động</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                      <span>Bảo trì</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      <span>Không khả dụng</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
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
