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
import { Edit, MoreHorizontal, Plus, Search, Trash2, MapPin } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"

interface Station {
  id: number
  stationName: string
  stationCode: string
  city: string
  province: string
  address: string
  latitude?: number
  longitude?: number
  status: string
  createdAt: string
}

export default function StationsManagement() {
  const { toast } = useToast()
  const [stations, setStations] = useState<Station[]>([
    {
      id: 1,
      stationName: "Ga Hà Nội",
      stationCode: "HN",
      city: "Hà Nội",
      province: "Hà Nội",
      address: "120 Lê Duẩn, Hoàn Kiếm, Hà Nội",
      latitude: 21.0245,
      longitude: 105.8412,
      status: "active",
      createdAt: "2025-05-13T11:19:49Z",
    },
    {
      id: 2,
      stationName: "Ga Phủ Lý",
      stationCode: "PL",
      city: "Phủ Lý",
      province: "Hà Nam",
      address: "Phủ Lý, Hà Nam",
      status: "active",
      createdAt: "2025-05-13T11:19:49Z",
    },
    {
      id: 17,
      stationName: "Ga Sài Gòn",
      stationCode: "SG",
      city: "TP.HCM",
      province: "TP.HCM",
      address: "1 Nguyễn Thông, Quận 3, TP.HCM",
      latitude: 10.7821,
      longitude: 106.6769,
      status: "active",
      createdAt: "2025-05-13T11:19:49Z",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStation, setEditingStation] = useState<Station | null>(null)
  const [formData, setFormData] = useState({
    stationName: "",
    stationCode: "",
    city: "",
    province: "",
    address: "",
    latitude: "",
    longitude: "",
    status: "active",
  })

  const provinces = [
    "Hà Nội",
    "TP.HCM",
    "Hà Nam",
    "Nam Định",
    "Ninh Bình",
    "Thanh Hóa",
    "Nghệ An",
    "Quảng Bình",
    "Quảng Trị",
    "Thừa Thiên Huế",
    "Đà Nẵng",
    "Quảng Nam",
    "Quảng Ngãi",
    "Phú Yên",
    "Khánh Hòa",
    "Ninh Thuận",
    "Đồng Nai",
  ]

  const statusOptions = [
    { value: "active", label: "Hoạt động", color: "bg-green-100 text-green-800" },
    { value: "inactive", label: "Tạm dừng", color: "bg-yellow-100 text-yellow-800" },
    { value: "maintenance", label: "Bảo trì", color: "bg-red-100 text-red-800" },
  ]

  const filteredStations = stations.filter((station) => {
    const matchesSearch =
      station.stationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.stationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.city.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || station.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingStation) {
      setStations(
        stations.map((station) =>
          station.id === editingStation.id
            ? {
                ...station,
                ...formData,
                latitude: formData.latitude ? Number.parseFloat(formData.latitude) : undefined,
                longitude: formData.longitude ? Number.parseFloat(formData.longitude) : undefined,
              }
            : station,
        ),
      )
      toast({
        title: "Cập nhật thành công",
        description: "Thông tin ga đã được cập nhật.",
      })
    } else {
      const newStation: Station = {
        id: Math.max(...stations.map((s) => s.id)) + 1,
        ...formData,
        latitude: formData.latitude ? Number.parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? Number.parseFloat(formData.longitude) : undefined,
        createdAt: new Date().toISOString(),
      }
      setStations([...stations, newStation])
      toast({
        title: "Thêm thành công",
        description: "Ga mới đã được thêm vào hệ thống.",
      })
    }

    setIsDialogOpen(false)
    setEditingStation(null)
    setFormData({
      stationName: "",
      stationCode: "",
      city: "",
      province: "",
      address: "",
      latitude: "",
      longitude: "",
      status: "active",
    })
  }

  const handleEdit = (station: Station) => {
    setEditingStation(station)
    setFormData({
      stationName: station.stationName,
      stationCode: station.stationCode,
      city: station.city,
      province: station.province,
      address: station.address,
      latitude: station.latitude?.toString() || "",
      longitude: station.longitude?.toString() || "",
      status: station.status,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (stationId: number) => {
    setStations(stations.filter((station) => station.id !== stationId))
    toast({
      title: "Xóa thành công",
      description: "Ga đã được xóa khỏi hệ thống.",
    })
  }

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find((option) => option.value === status)
    return <Badge className={statusOption?.color}>{statusOption?.label}</Badge>
  }

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
                  stationCode: "",
                  city: "",
                  province: "",
                  address: "",
                  latitude: "",
                  longitude: "",
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
                    <Label htmlFor="stationCode">Mã ga</Label>
                    <Input
                      id="stationCode"
                      value={formData.stationCode}
                      onChange={(e) => setFormData({ ...formData, stationCode: e.target.value })}
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Vĩ độ</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      placeholder="21.0245"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Kinh độ</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      placeholder="105.8412"
                    />
                  </div>
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
          <CardDescription>Tổng cộng {stations.length} ga trong hệ thống</CardDescription>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên ga, mã ga..."
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
                <TableHead>Mã ga</TableHead>
                <TableHead>Tên ga</TableHead>
                <TableHead>Địa điểm</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStations.map((station) => (
                <TableRow key={station.id}>
                  <TableCell className="font-medium">{station.stationCode}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleDelete(station.id)} className="text-red-600">
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
