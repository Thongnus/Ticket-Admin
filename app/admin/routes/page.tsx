"use client"

import React, { useState, useEffect } from "react"
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
import { Edit, MoreHorizontal, Plus, Search, ArrowRight, X, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"

interface Station {
  id: number
  name: string
  code: string
  city: string
}

interface RouteStop {
  stationId: number
  stationName: string
  stopOrder: number
  arrivalTime?: string
  departureTime?: string
  distanceFromStart: number
}

interface Route {
  id: number
  routeName: string
  routeCode: string
  description: string
  totalDistance: number
  estimatedDuration: string
  status: string
  stops: RouteStop[]
  createdAt: string
}

export default function RoutesManagement() {
  const { toast } = useToast()

  // Static stations data
  const [stations] = useState<Station[]>([
    { id: 1, name: "Ga Hà Nội", code: "HN", city: "Hà Nội" },
    { id: 2, name: "Ga Phủ Lý", code: "PL", city: "Hà Nam" },
    { id: 3, name: "Ga Nam Định", code: "ND", city: "Nam Định" },
    { id: 4, name: "Ga Ninh Bình", code: "NB", city: "Ninh Bình" },
    { id: 5, name: "Ga Thanh Hóa", code: "TH", city: "Thanh Hóa" },
    { id: 6, name: "Ga Vinh", code: "VI", city: "Nghệ An" },
    { id: 7, name: "Ga Đồng Hới", code: "DH", city: "Quảng Bình" },
    { id: 8, name: "Ga Đông Hà", code: "DA", city: "Quảng Trị" },
    { id: 9, name: "Ga Huế", code: "HU", city: "Thừa Thiên Huế" },
    { id: 10, name: "Ga Đà Nẵng", code: "DN", city: "Đà Nẵng" },
    { id: 11, name: "Ga Tam Kỳ", code: "TK", city: "Quảng Nam" },
    { id: 12, name: "Ga Quảng Ngãi", code: "QN", city: "Quảng Ngãi" },
    { id: 13, name: "Ga Diêu Trì", code: "DT", city: "Phú Yên" },
    { id: 14, name: "Ga Nha Trang", code: "NT", city: "Khánh Hòa" },
    { id: 15, name: "Ga Tháp Chàm", code: "TC", city: "Ninh Thuận" },
    { id: 16, name: "Ga Biên Hòa", code: "BH", city: "Đồng Nai" },
    { id: 17, name: "Ga Sài Gòn", code: "SG", city: "TP.HCM" },
  ])

  const [routes, setRoutes] = useState<Route[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [formData, setFormData] = useState({
    routeName: "",
    routeCode: "",
    description: "",
    estimatedDuration: "",
    status: "active",
  })
  const [routeStops, setRouteStops] = useState<RouteStop[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [routeToDelete, setRouteToDelete] = useState<Route | null>(null)

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

  // Convert API date array to ISO string
  const parseApiDate = (dateArray: number[]): string => {
    try {
      const [year, month, day, hour, minute, second] = dateArray
      return new Date(year, month - 1, day, hour, minute, second).toISOString()
    } catch {
      console.warn("Invalid date array, using current date")
      return new Date().toISOString()
    }
  }

  // Generate routeCode from routeName
  const generateRouteCode = (routeName: string): string => {
    const parts = routeName.split(" - ")
    if (parts.length === 2) {
      return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1).charAt(0).toUpperCase()).join("-")
    }
    return routeName.replace(/\s+/g, "-").toUpperCase()
  }

  // Fetch routes
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${baseUrl}/routes`, {
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
          },
        })
        if (!response.ok) throw new Error(`Lỗi khi lấy danh sách tuyến đường: ${response.status}`)
        const routesData = await response.json()

        // Transform API data to Route interface
        const transformedRoutes: Route[] = routesData.map((route: any) => ({
          id: route.routeId,
          routeName: route.routeName,
          routeCode: generateRouteCode(route.routeName),
          description: route.description || "",
          totalDistance: route.distance,
          estimatedDuration: "N/A", // Mock since not provided
          status: route.status,
          stops: [], // Empty since not provided
          createdAt: parseApiDate(route.createdAt),
        }))

        setRoutes(transformedRoutes)
        console.log("[Routes] Transformed:", transformedRoutes)
      } catch (error) {
        console.error("[Routes] Error:", error)
        toast({
          title: "Lỗi tải dữ liệu",
          description: error instanceof Error ? error.message : "Không thể kết nối tới server.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRoutes()
  }, [baseUrl, toast])

  const statusOptions = [
    { value: "active", label: "Hoạt động", color: "bg-green-100 text-green-800" },
    { value: "inactive", label: "Tạm dừng", color: "bg-yellow-100 text-yellow-800" },
    { value: "maintenance", label: "Bảo trì", color: "bg-red-100 text-red-800" },
  ]

  const filteredRoutes = routes.filter(
    (route) =>
      route.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.routeCode.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const addStop = () => {
    const newStop: RouteStop = {
      stationId: 0,
      stationName: "",
      stopOrder: routeStops.length + 1,
      arrivalTime: "",
      departureTime: "",
      distanceFromStart: 0,
    }
    setRouteStops([...routeStops, newStop])
  }

  const removeStop = (index: number) => {
    const updatedStops = routeStops.filter((_, i) => i !== index)
    const reorderedStops = updatedStops.map((stop, i) => ({
      ...stop,
      stopOrder: i + 1,
    }))
    setRouteStops(reorderedStops)
  }

  const updateStop = (index: number, field: keyof RouteStop, value: any) => {
    const updatedStops = [...routeStops]
    updatedStops[index] = { ...updatedStops[index], [field]: value }

    if (field === "stationId") {
      const station = stations.find((s) => s.id === Number.parseInt(value))
      if (station) {
        updatedStops[index].stationName = station.name
      }
    }

    setRouteStops(updatedStops)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (routeStops.length < 2) {
      toast({
        title: "Lỗi",
        description: "Tuyến đường phải có ít nhất 2 ga dừng.",
        variant: "destructive",
      })
      return
    }

    const totalDistance = routeStops[routeStops.length - 1]?.distanceFromStart || 0

    if (editingRoute) {
      setRoutes(
        routes.map((route) =>
          route.id === editingRoute.id ? { ...route, ...formData, stops: routeStops, totalDistance } : route,
        ),
      )
      toast({
        title: "Cập nhật thành công",
        description: "Thông tin tuyến đường đã được cập nhật.",
      })
    } else {
      const newRoute: Route = {
        id: Math.max(...routes.map((r) => r.id)) + 1,
        ...formData,
        stops: routeStops,
        totalDistance,
        createdAt: new Date().toISOString(),
      }
      setRoutes([...routes, newRoute])
      toast({
        title: "Thêm thành công",
        description: "Tuyến đường mới đã được thêm vào hệ thống.",
      })
    }

    setIsDialogOpen(false)
    setEditingRoute(null)
    setFormData({
      routeName: "",
      routeCode: "",
      description: "",
      estimatedDuration: "",
      status: "active",
    })
    setRouteStops([])
  }

  const handleEdit = (route: Route) => {
    setEditingRoute(route)
    setFormData({
      routeName: route.routeName,
      routeCode: route.routeCode,
      description: route.description,
      estimatedDuration: route.estimatedDuration,
      status: route.status,
    })
    setRouteStops([...route.stops])
    setIsDialogOpen(true)
  }

  const handleDelete = (routeId: number) => {
    const route = routes.find(r => r.id === routeId)
    if (route) {
      setRouteToDelete(route)
      setIsDeleteDialogOpen(true)
    }
  }

  const confirmDelete = () => {
    if (routeToDelete) {
      setRoutes(routes.filter((route) => route.id !== routeToDelete.id))
      toast({
        title: "Xóa thành công",
        description: "Tuyến đường đã được xóa khỏi hệ thống.",
      })
      setIsDeleteDialogOpen(false)
      setRouteToDelete(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find((option) => option.value === status)
    return <Badge className={statusOption?.color}>{statusOption?.label}</Badge>
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý tuyến đường</h2>
          <p className="text-muted-foreground">Quản lý các tuyến đường và ga dừng trong hệ thống</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingRoute(null)
                setFormData({
                  routeName: "",
                  routeCode: "",
                  description: "",
                  estimatedDuration: "",
                  status: "active",
                })
                setRouteStops([])
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm tuyến đường
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRoute ? "Chỉnh sửa tuyến đường" : "Thêm tuyến đường mới"}</DialogTitle>
              <DialogDescription>
                {editingRoute
                  ? "Cập nhật thông tin tuyến đường và ga dừng"
                  : "Nhập thông tin tuyến đường mới và thiết lập ga dừng"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="routeName">Tên tuyến</Label>
                    <Input
                      id="routeName"
                      value={formData.routeName}
                      onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="routeCode">Mã tuyến</Label>
                    <Input
                      id="routeCode"
                      value={formData.routeCode}
                      onChange={(e) => setFormData({ ...formData, routeCode: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimatedDuration">Thời gian ước tính</Label>
                    <Input
                      id="estimatedDuration"
                      value={formData.estimatedDuration}
                      onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                      placeholder="VD: 5h 30m"
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

                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Ga dừng</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addStop}>
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm ga dừng
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {routeStops.map((stop, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg">
                        <div className="col-span-1">
                          <Label className="text-xs">STT</Label>
                          <div className="text-sm font-medium">{stop.stopOrder}</div>
                        </div>

                        <div className="col-span-3">
                          <Label className="text-xs">Ga</Label>
                          <Select
                            value={stop.stationId.toString()}
                            onValueChange={(value) => updateStop(index, "stationId", Number.parseInt(value))}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Chọn ga" />
                            </SelectTrigger>
                            <SelectContent>
                              {stations.map((station) => (
                                <SelectItem key={station.id} value={station.id.toString()}>
                                  {station.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="col-span-2">
                          <Label className="text-xs">Đến</Label>
                          <Input
                            type="time"
                            value={stop.arrivalTime || ""}
                            onChange={(e) => updateStop(index, "arrivalTime", e.target.value)}
                            className="h-8"
                            disabled={index === 0}
                          />
                        </div>

                        <div className="col-span-2">
                          <Label className="text-xs">Đi</Label>
                          <Input
                            type="time"
                            value={stop.departureTime || ""}
                            onChange={(e) => updateStop(index, "departureTime", e.target.value)}
                            className="h-8"
                            disabled={index === routeStops.length - 1}
                          />
                        </div>

                        <div className="col-span-3">
                          <Label className="text-xs">Khoảng cách (km)</Label>
                          <Input
                            type="number"
                            value={stop.distanceFromStart}
                            onChange={(e) =>
                              updateStop(index, "distanceFromStart", Number.parseInt(e.target.value) || 0)
                            }
                            className="h-8"
                          />
                        </div>

                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStop(index)}
                            className="h-8 w-8 p-0 text-red-600"
                            disabled={routeStops.length <= 2}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingRoute ? "Cập nhật" : "Thêm mới"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách tuyến đường</CardTitle>
          <CardDescription>Tổng cộng {routes.length} tuyến đường trong hệ thống</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm tuyến đường..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : filteredRoutes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Không tìm thấy tuyến đường nào.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã tuyến</TableHead>
                  <TableHead>Tên tuyến</TableHead>
                  <TableHead>Ga dừng</TableHead>
                  <TableHead>Khoảng cách</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoutes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell className="font-medium">{route.routeCode}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{route.routeName}</div>
                        <div className="text-sm text-muted-foreground">{route.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {route.stops.length > 0 ? (
                        <div className="flex items-center space-x-1">
                          <span className="text-sm">{route.stops[0]?.stationName}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{route.stops[route.stops.length - 1]?.stationName}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Chưa có ga dừng</span>
                      )}
                      <div className="text-xs text-muted-foreground">{route.stops.length} ga dừng</div>
                    </TableCell>
                    <TableCell>{route.totalDistance} km</TableCell>
                    <TableCell>{route.estimatedDuration}</TableCell>
                    <TableCell>{getStatusBadge(route.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Mở menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(route)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(route.id)} className="text-red-600">
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
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa tuyến đường "{routeToDelete?.routeName}"? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}