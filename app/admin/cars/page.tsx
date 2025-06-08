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
import { Edit, MoreHorizontal, Plus, Search, Trash2, Sofa } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Car {
  id: number
  carNumber: string
  trainNumber: string
  carType: string
  capacity: number
  status: string
  createdAt: string
  
}

export default function CarsManagement() {
  const { toast } = useToast()
  const [cars, setCars] = useState<Car[]>([
    {
      id: 1,
      carNumber: "C1",
      trainNumber: "SE9",
      carType: "soft_seat",
      capacity: 64,
      status: "active",
      createdAt: "2025-05-13T11:19:49Z",
    },
    {
      id: 2,
      carNumber: "C2",
      trainNumber: "SE9",
      carType: "soft_sleeper",
      capacity: 42,
      status: "active",
      createdAt: "2025-05-13T11:19:49Z",
    },
    {
      id: 3,
      carNumber: "C3",
      trainNumber: "TN4",
      carType: "hard_sleeper",
      capacity: 54,
      status: "maintenance",
      createdAt: "2025-05-15T17:30:24Z",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCar, setEditingCar] = useState<Car | null>(null)
  const [formData, setFormData] = useState({
    carNumber: "",
    trainNumber: "",
    carType: "soft_seat",
    capacity: "",
    status: "active",
  })

  const carTypes = [
    { value: "soft_seat", label: "Ghế mềm" },
    { value: "hard_seat", label: "Ghế cứng" },
    { value: "soft_sleeper", label: "Giường nằm mềm" },
    { value: "hard_sleeper", label: "Giường nằm cứng" },
    { value: "vip", label: "VIP" },
  ]

  const statusOptions = [
    { value: "active", label: "Hoạt động", color: "bg-green-100 text-green-800" },
    { value: "maintenance", label: "Bảo trì", color: "bg-yellow-100 text-yellow-800" },
    { value: "retired", label: "Ngừng hoạt động", color: "bg-red-100 text-red-800" },
  ]

  const trainNumbers = ["SE9", "TN4", "T123", "SE1", "SE3", "SE5"]

  const filteredCars = cars.filter(
    (car) =>
      car.carNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.trainNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingCar) {
      // Update existing car
      setCars(
        cars.map((car) =>
          car.id === editingCar.id ? { ...car, ...formData, capacity: Number.parseInt(formData.capacity) } : car,
        ),
      )
      toast({
        title: "Cập nhật thành công",
        description: "Thông tin toa tàu đã được cập nhật.",
      })
    } else {
      // Add new car
      const newCar: Car = {
        id: Math.max(...cars.map((c) => c.id)) + 1,
        ...formData,
        capacity: Number.parseInt(formData.capacity),
        createdAt: new Date().toISOString(),
      }
      setCars([...cars, newCar])
      toast({
        title: "Thêm thành công",
        description: "Toa tàu mới đã được thêm vào hệ thống.",
      })
    }

    setIsDialogOpen(false)
    setEditingCar(null)
    setFormData({
      carNumber: "",
      trainNumber: "",
      carType: "soft_seat",
      capacity: "",
      status: "active",
    })
  }

  const handleEdit = (car: Car) => {
    setEditingCar(car)
    setFormData({
      carNumber: car.carNumber,
      trainNumber: car.trainNumber,
      carType: car.carType,
      capacity: car.capacity.toString(),
      status: car.status,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (carId: number) => {
    setCars(cars.filter((car) => car.id !== carId))
    toast({
      title: "Xóa thành công",
      description: "Toa tàu đã được xóa khỏi hệ thống.",
    })
  }

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find((option) => option.value === status)
    return <Badge className={statusOption?.color}>{statusOption?.label}</Badge>
  }

  const getCarTypeLabel = (type: string) => {
    const carType = carTypes.find((t) => t.value === type)
    return carType?.label || type
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý toa tàu</h2>
          <p className="text-muted-foreground">Quản lý thông tin các toa tàu trong hệ thống</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingCar(null)
                setFormData({
                  carNumber: "",
                  trainNumber: "",
                  carType: "soft_seat",
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
              <DialogTitle>{editingCar ? "Chỉnh sửa toa tàu" : "Thêm toa tàu mới"}</DialogTitle>
              <DialogDescription>
                {editingCar ? "Cập nhật thông tin toa tàu" : "Nhập thông tin toa tàu mới vào hệ thống"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="carNumber" className="text-right">
                    Số hiệu toa
                  </Label>
                  <Input
                    id="carNumber"
                    value={formData.carNumber}
                    onChange={(e) => setFormData({ ...formData, carNumber: e.target.value })}
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
                  <Label htmlFor="carType" className="text-right">
                    Loại toa
                  </Label>
                  <Select
                    value={formData.carType}
                    onValueChange={(value) => setFormData({ ...formData, carType: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {carTypes.map((type) => (
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
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
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
                <Button type="submit">{editingCar ? "Cập nhật" : "Thêm mới"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách toa tàu</CardTitle>
          <CardDescription>Tổng cộng {cars.length} toa tàu trong hệ thống</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo số hiệu toa hoặc tàu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Số hiệu toa</TableHead>
                <TableHead>Thuộc tàu</TableHead>
                <TableHead>Loại toa</TableHead>
                <TableHead>Sức chứa</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCars.map((car) => (
                <TableRow key={car.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Sofa className="mr-2 h-4 w-4 text-muted-foreground" />
                      {car.carNumber}
                    </div>
                  </TableCell>
                  <TableCell>{car.trainNumber}</TableCell>
                  <TableCell>{getCarTypeLabel(car.carType)}</TableCell>
                  <TableCell>{car.capacity} chỗ</TableCell>
                  <TableCell>{getStatusBadge(car.status)}</TableCell>
                  <TableCell>{new Date(car.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Mở menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(car)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(car.id)} className="text-red-600">
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
