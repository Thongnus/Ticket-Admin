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
import { Edit, MoreHorizontal, Plus, Search, Trash2, Clock, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

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
  const [trips, setTrips] = useState<Trip[]>([
    {
      id: 3,
      tripCode: "SE9-20250520",
      routeName: "Hà Nội - Sài Gòn",
      trainNumber: "SE9",
      departureTime: "2025-05-20T07:00:00",
      arrivalTime: "2025-05-20T18:00:00",
      status: "scheduled",
      delayMinutes: 0,
      createdAt: "2025-05-20T08:17:22Z",
    },
    {
      id: 4,
      tripCode: "TN4-20260520",
      routeName: "Hà Nội - Sài Gòn",
      trainNumber: "TN4",
      departureTime: "2025-05-20T08:00:00",
      arrivalTime: "2025-05-20T18:30:00",
      status: "scheduled",
      delayMinutes: 0,
      createdAt: "2025-05-20T08:17:22Z",
    },
    {
      id: 10,
      tripCode: "HN-SG-2023052143",
      routeName: "Vinh - Hà Nội",
      trainNumber: "T123",
      departureTime: "2023-05-20T01:00:00",
      arrivalTime: "2023-05-20T23:30:00",
      status: "delayed",
      delayMinutes: 15,
      createdAt: "2025-05-21T06:43:55Z",
    },
    {
      id: 17,
      tripCode: "HN-SG-20230521",
      routeName: "Vinh - Hà Nội",
      trainNumber: "T123",
      departureTime: "2023-05-20T08:00:00",
      arrivalTime: "2023-05-21T06:30:00",
      status: "completed",
      delayMinutes: 15,
      createdAt: "2025-05-21T16:41:40Z",
    },
  ])

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

  const routes = [
    "Hà Nội - Sài Gòn",
    "Sài Gòn - Hà Nội",
    "Hà Nội - Vinh",
    "Vinh - Hà Nội",
    "Hà Nội - Đà Nẵng",
    "Đà Nẵng - Hà Nội",
  ]

  const trains = ["SE9", "TN4", "T123", "SE1", "SE3", "SE5"]

  const statusOptions = [
    { value: "scheduled", label: "Đã lên lịch", color: "bg-blue-100 text-blue-800" },
    { value: "delayed", label: "Trễ giờ", color: "bg-yellow-100 text-yellow-800" },
    { value: "cancelled", label: "Đã hủy", color: "bg-red-100 text-red-800" },
    { value: "completed", label: "Hoàn thành", color: "bg-green-100 text-green-800" },
  ]

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.tripCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.trainNumber.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || trip.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingTrip) {
      setTrips(
        trips.map((trip) =>
          trip.id === editingTrip.id
            ? { ...trip, ...formData, delayMinutes: Number.parseInt(formData.delayMinutes) }
            : trip,
        ),
      )
      toast({
        title: "Cập nhật thành công",
        description: "Thông tin chuyến tàu đã được cập nhật.",
      })
    } else {
      const newTrip: Trip = {
        id: Math.max(...trips.map((t) => t.id)) + 1,
        ...formData,
        delayMinutes: Number.parseInt(formData.delayMinutes),
        createdAt: new Date().toISOString(),
      }
      setTrips([...trips, newTrip])
      toast({
        title: "Thêm thành công",
        description: "Chuyến tàu mới đã được thêm vào hệ thống.",
      })
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
  }

  const handleEdit = (trip: Trip) => {
    setEditingTrip(trip)
    setFormData({
      tripCode: trip.tripCode,
      routeName: trip.routeName,
      trainNumber: trip.trainNumber,
      departureTime: trip.departureTime.slice(0, 16), // Format for datetime-local input
      arrivalTime: trip.arrivalTime.slice(0, 16),
      status: trip.status,
      delayMinutes: trip.delayMinutes.toString(),
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (tripId: number) => {
    setTrips(trips.filter((trip) => trip.id !== tripId))
    toast({
      title: "Xóa thành công",
      description: "Chuyến tàu đã được xóa khỏi hệ thống.",
    })
  }

  const handleUpdateStatus = (tripId: number, newStatus: string) => {
    setTrips(trips.map((trip) => (trip.id === tripId ? { ...trip, status: newStatus } : trip)))
    toast({
      title: "Cập nhật thành công",
      description: "Trạng thái chuyến tàu đã được cập nhật.",
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
                        <SelectItem key={route} value={route}>
                          {route}
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
                        <SelectItem key={train} value={train}>
                          {train}
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
                      {statusOptions.map((status) => (
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
          <CardDescription>Tổng cộng {trips.length} chuyến tàu trong hệ thống</CardDescription>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm chuyến tàu..."
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
              {filteredTrips.map((trip) => (
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
                          <DropdownMenuItem onClick={() => handleUpdateStatus(trip.id, "delayed")}>
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Đánh dấu trễ
                          </DropdownMenuItem>
                        )}
                        {trip.status !== "cancelled" && (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(trip.id, "cancelled")}>
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Hủy chuyến
                          </DropdownMenuItem>
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
        </CardContent>
      </Card>
    </div>
  )
}
