"use client"

import type React from "react"

import { useState } from "react"
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
import { Edit, MoreHorizontal, Plus, Search, Trash2, Armchair } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Seat {
  id: number
  seatNumber: string
  carNumber: string
  trainNumber: string
  seatType: string
  price: number
  status: string
  createdAt: string
}

export default function SeatsManagement() {
  const { toast } = useToast()
  const [seats, setSeats] = useState<Seat[]>([
    {
      id: 1,
      seatNumber: "A1",
      carNumber: "C1",
      trainNumber: "SE9",
      seatType: "window",
      price: 400000,
      status: "available",
      createdAt: "2025-05-13T11:19:49Z",
    },
    {
      id: 2,
      seatNumber: "A2",
      carNumber: "C1",
      trainNumber: "SE9",
      seatType: "aisle",
      price: 380000,
      status: "available",
      createdAt: "2025-05-13T11:19:49Z",
    },
    {
      id: 3,
      seatNumber: "B1",
      carNumber: "C2",
      trainNumber: "SE9",
      seatType: "lower_berth",
      price: 600000,
      status: "maintenance",
      createdAt: "2025-05-15T17:30:24Z",
    },
    {
      id: 4,
      seatNumber: "B2",
      carNumber: "C2",
      trainNumber: "SE9",
      seatType: "upper_berth",
      price: 550000,
      status: "available",
      createdAt: "2025-05-15T17:30:24Z",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSeat, setEditingSeat] = useState<Seat | null>(null)
  const [formData, setFormData] = useState({
    seatNumber: "",
    carNumber: "",
    trainNumber: "",
    seatType: "window",
    price: "",
    status: "available",
  })

  const seatTypes = [
    { value: "window", label: "Cửa sổ" },
    { value: "aisle", label: "Lối đi" },
    { value: "middle", label: "Giữa" },
    { value: "lower_berth", label: "Giường dưới" },
    { value: "middle_berth", label: "Giường giữa" },
    { value: "upper_berth", label: "Giường trên" },
  ]

  const statusOptions = [
    { value: "available", label: "Có sẵn", color: "bg-green-100 text-green-800" },
    { value: "booked", label: "Đã đặt", color: "bg-blue-100 text-blue-800" },
    { value: "maintenance", label: "Bảo trì", color: "bg-yellow-100 text-yellow-800" },
    { value: "unavailable", label: "Không khả dụng", color: "bg-red-100 text-red-800" },
  ]

  const trainNumbers = ["SE9", "TN4", "T123", "SE1", "SE3", "SE5"]
  const carNumbers = ["C1", "C2", "C3", "C4", "C5"]

  const filteredSeats = seats.filter((seat) => {
    const matchesSearch =
      seat.seatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seat.carNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seat.trainNumber.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || seat.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingSeat) {
      // Update existing seat
      setSeats(
        seats.map((seat) =>
          seat.id === editingSeat.id ? { ...seat, ...formData, price: Number.parseInt(formData.price) } : seat,
        ),
      )
      toast({
        title: "Cập nhật thành công",
        description: "Thông tin ghế đã được cập nhật.",
      })
    } else {
      // Add new seat
      const newSeat: Seat = {
        id: Math.max(...seats.map((s) => s.id)) + 1,
        ...formData,
        price: Number.parseInt(formData.price),
        createdAt: new Date().toISOString(),
      }
      setSeats([...seats, newSeat])
      toast({
        title: "Thêm thành công",
        description: "Ghế mới đã được thêm vào hệ thống.",
      })
    }

    setIsDialogOpen(false)
    setEditingSeat(null)
    setFormData({
      seatNumber: "",
      carNumber: "",
      trainNumber: "",
      seatType: "window",
      price: "",
      status: "available",
    })
  }

  const handleEdit = (seat: Seat) => {
    setEditingSeat(seat)
    setFormData({
      seatNumber: seat.seatNumber,
      carNumber: seat.carNumber,
      trainNumber: seat.trainNumber,
      seatType: seat.seatType,
      price: seat.price.toString(),
      status: seat.status,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (seatId: number) => {
    setSeats(seats.filter((seat) => seat.id !== seatId))
    toast({
      title: "Xóa thành công",
      description: "Ghế đã được xóa khỏi hệ thống.",
    })
  }

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find((option) => option.value === status)
    return <Badge className={statusOption?.color}>{statusOption?.label}</Badge>
  }

  const getSeatTypeLabel = (type: string) => {
    const seatType = seatTypes.find((t) => t.value === type)
    return seatType?.label || type
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price)
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý ghế</h2>
          <p className="text-muted-foreground">Quản lý thông tin các ghế trong hệ thống</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingSeat(null)
                setFormData({
                  seatNumber: "",
                  carNumber: "",
                  trainNumber: "",
                  seatType: "window",
                  price: "",
                  status: "available",
                })
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm ghế mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingSeat ? "Chỉnh sửa ghế" : "Thêm ghế mới"}</DialogTitle>
              <DialogDescription>
                {editingSeat ? "Cập nhật thông tin ghế" : "Nhập thông tin ghế mới vào hệ thống"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="seatNumber" className="text-right">
                    Số ghế
                  </Label>
                  <Input
                    id="seatNumber"
                    value={formData.seatNumber}
                    onChange={(e) => setFormData({ ...formData, seatNumber: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="trainNumber" className="text-right">
                    Thuộc tàu
                  </Label>
                  <Select
                    value={formData.trainNumber}
                    onValueChange={(value) => setFormData({ ...formData, trainNumber: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Chọn tàu" />
                    </SelectTrigger>
                    <SelectContent>
                      {trainNumbers.map((train) => (
                        <SelectItem key={train} value={train}>
                          {train}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="carNumber" className="text-right">
                    Thuộc toa
                  </Label>
                  <Select
                    value={formData.carNumber}
                    onValueChange={(value) => setFormData({ ...formData, carNumber: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Chọn toa" />
                    </SelectTrigger>
                    <SelectContent>
                      {carNumbers.map((car) => (
                        <SelectItem key={car} value={car}>
                          {car}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="seatType" className="text-right">
                    Loại ghế
                  </Label>
                  <Select
                    value={formData.seatType}
                    onValueChange={(value) => setFormData({ ...formData, seatType: value })}
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
                  <Label htmlFor="price" className="text-right">
                    Giá vé
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
                <Button type="submit">{editingSeat ? "Cập nhật" : "Thêm mới"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách ghế</CardTitle>
          <CardDescription>Tổng cộng {seats.length} ghế trong hệ thống</CardDescription>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo số ghế, toa, tàu..."
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Số ghế</TableHead>
                <TableHead>Tàu</TableHead>
                <TableHead>Toa</TableHead>
                <TableHead>Loại ghế</TableHead>
                <TableHead>Giá vé</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSeats.map((seat) => (
                <TableRow key={seat.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Armchair className="mr-2 h-4 w-4 text-muted-foreground" />
                      {seat.seatNumber}
                    </div>
                  </TableCell>
                  <TableCell>{seat.trainNumber}</TableCell>
                  <TableCell>{seat.carNumber}</TableCell>
                  <TableCell>{getSeatTypeLabel(seat.seatType)}</TableCell>
                  <TableCell>{formatPrice(seat.price)}đ</TableCell>
                  <TableCell>{getStatusBadge(seat.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Mở menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(seat)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(seat.id)} className="text-red-600">
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
        </CardContent>
      </Card>
    </div>
  )
}
