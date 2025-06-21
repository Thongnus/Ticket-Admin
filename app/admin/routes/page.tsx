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
import { Textarea } from "@/components/ui/textarea"
import { authApi } from "@/lib/api"
import { routesApi } from "@/lib/api/routes"
import { stationsApi, StationDto } from "@/lib/api/stations"

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
  arrivalOffset: number
  departureOffset: number
  distanceFromOrigin: number
}

interface Route {
  id: number
  routeName: string
  routeCode: string
  description: string
  totalDistance: number
  estimatedDuration: string
  status: string
  originStationId: number
  destinationStationId: number
  originStationName?: string
  destinationStationName?: string
  stops: RouteStop[]
  createdAt: string
}

// API Request interfaces
interface RoutePayload {
  routeName: string
  originStationId: number
  destinationStationId: number
  distance: number
  description: string
  status: string
}

interface StationPayload {
  stationId: number
  stopOrder: number
  arrivalOffset: number
  departureOffset: number
  distanceFromOrigin: number
}

interface RouteWithStationsRequest {
  route: RoutePayload
  stations: StationPayload[]
}

export default function RoutesManagement() {
  // Replace static stations data with API call
  const [stations, setStations] = useState<Station[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [formData, setFormData] = useState({
    routeName: "",
    originStationId: "",
    destinationStationId: "",
    distance: "",
    description: "",
    status: "active",
  })
  const [routeStops, setRouteStops] = useState<RouteStop[]>([])
  const [loading, setLoading] = useState(true)
  const [stationsLoading, setStationsLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [routeToDelete, setRouteToDelete] = useState<Route | null>(null)
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<{
    routeName?: string
    originStationId?: string
    destinationStationId?: string
    distance?: string
  }>({})
  
  // Route stops validation state
  const [routeStopsErrors, setRouteStopsErrors] = useState<{[key: string]: string}>({})

  // Simple custom toast state for testing
  const [customToast, setCustomToast] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    show: false,
    title: '',
    message: '',
    type: 'info'
  });

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

  // Fetch stations from API
  const fetchStations = async () => {
    try {
      setStationsLoading(true)
      const stationsData = await stationsApi.getAllStations()
      const transformedStations: Station[] = stationsData.map((station: StationDto) => ({
        id: station.stationId,
        name: station.stationName,
        code: station.stationName.substring(0, 2).toUpperCase(),
        city: station.city,
      }))
      setStations(transformedStations)
      console.log("[Stations] Transformed:", transformedStations)
    } catch (error) {
      console.error("[Stations] Error:", error)
      showCustomToast("❌ Lỗi tải dữ liệu ga", parseErrorMessage(error), "error");
    } finally {
      setStationsLoading(false)
    }
  }

  // Đưa fetchRoutes ra ngoài useEffect để có thể gọi lại sau khi thêm mới
  const fetchRoutes = async () => {
    try {
      setLoading(true)
      const routesData = await routesApi.getAllRoutes()
      
      // Fetch stops for each route
      const routesWithStops = await Promise.all(
        routesData.map(async (route: any) => {
          try {
            const stopsData = await routesApi.getStationsByRoute(route.routeId)
            const transformedStops: RouteStop[] = stopsData.map((stop: any) => ({
              stationId: stop.stationId,
              stationName: stop.stationName || "",
              stopOrder: stop.stopOrder,
              arrivalOffset: stop.arrivalOffset || 0,
              departureOffset: stop.departureOffset || 0,
              distanceFromOrigin: stop.distanceFromOrigin || 0,
              distanceFromStart: stop.distanceFromOrigin || 0,
            }))
            
            // Find station names from stations array
            const originStation = stations.find(s => s.id === route.originStationId)
            const destinationStation = stations.find(s => s.id === route.destinationStationId)
            
            return {
              id: route.routeId,
              routeName: route.routeName,
              routeCode: generateRouteCode(route.routeName),
              description: route.description || "",
              totalDistance: route.distance,
              estimatedDuration: "N/A",
              status: route.status,
              originStationId: route.originStationId,
              destinationStationId: route.destinationStationId,
              originStationName: originStation?.name || route.originStationName,
              destinationStationName: destinationStation?.name || route.destinationStationName,
              stops: transformedStops,
              createdAt: parseApiDate(route.createdAt),
            }
          } catch (error) {
            console.warn(`[Routes] Failed to fetch stops for route ${route.routeId}:`, error)
            
            // Find station names from stations array
            const originStation = stations.find(s => s.id === route.originStationId)
            const destinationStation = stations.find(s => s.id === route.destinationStationId)
            
            // Return route without stops if API call fails
            return {
              id: route.routeId,
              routeName: route.routeName,
              routeCode: generateRouteCode(route.routeName),
              description: route.description || "",
              totalDistance: route.distance,
              estimatedDuration: "N/A",
              status: route.status,
              originStationId: route.originStationId,
              destinationStationId: route.destinationStationId,
              originStationName: originStation?.name || route.originStationName,
              destinationStationName: destinationStation?.name || route.destinationStationName,
              stops: [],
              createdAt: parseApiDate(route.createdAt),
            }
          }
        })
      )
      
      setRoutes(routesWithStops)
      console.log("[Routes] Transformed with stops:", routesWithStops)
    } catch (error) {
      console.error("[Routes] Error:", error)
      showCustomToast("❌ Lỗi tải dữ liệu", parseErrorMessage(error), "error");
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await fetchStations()
      await fetchRoutes()
    }
    loadData()
  }, [])

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
      arrivalOffset: 0,
      departureOffset: 0,
      distanceFromOrigin: 0,
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
    
    // Re-validate after removing stop
    const stopErrors = validateRouteStops(reorderedStops)
    setRouteStopsErrors(stopErrors)
  }

  const updateStop = (index: number, field: keyof RouteStop, value: any) => {
    const updatedStops = [...routeStops]
    updatedStops[index] = { ...updatedStops[index], [field]: value }

    if (field === "stationId") {
      const station = stations.find((s) => s.id === Number.parseInt(value))
      if (station) {
        updatedStops[index].stationName = station.name
      }
      
      // Validate for duplicates after updating station
      const stopErrors = validateRouteStops(updatedStops)
      setRouteStopsErrors(stopErrors)
    }

    if (field === "distanceFromOrigin") {
      updatedStops[index].distanceFromStart = value
    }

    setRouteStops(updatedStops)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log("Form data:", formData)
    console.log("Current validation errors:", validationErrors)
    console.log("Route stops:", routeStops)
    
    // Direct validation check
    const errors: any = {}
    
    if (!formData.routeName.trim()) {
      errors.routeName = 'Tên tuyến đường không được để trống'
    }
    
    if (!formData.originStationId) {
      errors.originStationId = 'Vui lòng chọn ga đi'
    }
    
    if (!formData.destinationStationId) {
      errors.destinationStationId = 'Vui lòng chọn ga đến'
    }
    
    // Check for station duplication using helper function
    const duplicationErrors = validateStationDuplication(formData.originStationId, formData.destinationStationId)
    Object.assign(errors, duplicationErrors)
    
    if (!formData.distance || Number(formData.distance) <= 0) {
      errors.distance = 'Khoảng cách phải lớn hơn 0'
    }
    
    console.log("Validation errors found:", errors)
    
    // Update validation errors state
    setValidationErrors(errors)
    
    // Check if there are any validation errors
    if (Object.keys(errors).length > 0) {
      console.log("Blocking submission due to validation errors")
      showCustomToast("❌ Lỗi validation", "Vui lòng sửa các lỗi validation trước khi tiếp tục.", "error")
      return
    }
    
    // Check for route stops validation errors
    const routeStopsValidationErrors = validateRouteStops(routeStops)
    if (Object.keys(routeStopsValidationErrors).length > 0) {
      setRouteStopsErrors(routeStopsValidationErrors)
      showCustomToast("❌ Lỗi ga dừng", "Có ga dừng bị trùng lặp. Vui lòng kiểm tra lại.", "error")
      return
    }
    
    console.log("Proceeding with API call...")
    
    const routePayload: RoutePayload = {
      routeName: formData.routeName,
      originStationId: Number(formData.originStationId),
      destinationStationId: Number(formData.destinationStationId),
      distance: Number(formData.distance),
      description: formData.description,
      status: formData.status,
    }
    
    // Nếu đang edit, luôn gọi updateRouteWithStations (kể cả khi không còn stop nào)
    if (editingRoute) {
      for (const stop of routeStops) {
        if (!stop.stationId) {
          showCustomToast("❌ Lỗi ga dừng", "Vui lòng chọn đầy đủ ga dừng.", "error")
          return
        }
      }
      const stationsPayload: StationPayload[] = routeStops.map((stop, idx) => ({
        stationId: Number(stop.stationId),
        stopOrder: idx + 1,
        arrivalOffset: Number(stop.arrivalOffset),
        departureOffset: Number(stop.departureOffset),
        distanceFromOrigin: Number(stop.distanceFromOrigin),
      }))
      try {
        const requestPayload: RouteWithStationsRequest = {
          route: routePayload,
          stations: stationsPayload
        }
        console.log("Update request payload:", requestPayload)
        await routesApi.updateRouteWithStations(editingRoute.id, requestPayload)
        showCustomToast("✅ Cập nhật thành công", "Tuyến đường đã được cập nhật.", "success")
        setIsDialogOpen(false)
        setEditingRoute(null)
        setFormData({
          routeName: "",
          originStationId: "",
          destinationStationId: "",
          distance: "",
          description: "",
          status: "active",
        })
        setRouteStops([])
        setValidationErrors({})
        setRouteStopsErrors({})
        fetchRoutes()
      } catch (error) {
        console.log("Error in updateRouteWithStations:", error);
        const errorMessage = parseErrorMessage(error);
        console.log("Parsed error message:", errorMessage);
        showCustomToast("❌ Lỗi cập nhật tuyến đường", errorMessage, "error");
      }
      return
    }
    
    // Nếu không có ga dừng nào, chỉ tạo tuyến đường
    if (routeStops.length === 0) {
      try {
        await routesApi.createRoute(routePayload)
        showCustomToast("✅ Thành công", "Tuyến đường mới đã được thêm vào hệ thống.", "success")
        setIsDialogOpen(false)
        setFormData({
          routeName: "",
          originStationId: "",
          destinationStationId: "",
          distance: "",
          description: "",
          status: "active",
        })
        setRouteStops([])
        setValidationErrors({})
        setRouteStopsErrors({})
        fetchRoutes()
      } catch (error) {
        console.log("Error in createRoute:", error);
        const errorMessage = parseErrorMessage(error);
        console.log("Parsed error message:", errorMessage);
        showCustomToast("❌ Lỗi tạo tuyến đường", errorMessage, "error");
      }
      return
    }
    
    // Nếu có ga dừng, kiểm tra và tạo tuyến đường với ga dừng
    for (const stop of routeStops) {
      if (!stop.stationId) {
        showCustomToast("❌ Lỗi ga dừng", "Vui lòng chọn đầy đủ ga dừng.", "error")
        return
      }
    }
    const stationsPayload: StationPayload[] = routeStops.map((stop, idx) => ({
      stationId: Number(stop.stationId),
      stopOrder: idx + 1,
      arrivalOffset: Number(stop.arrivalOffset),
      departureOffset: Number(stop.departureOffset),
      distanceFromOrigin: Number(stop.distanceFromOrigin),
    }))
    try {
      const requestPayload: RouteWithStationsRequest = {
        route: routePayload,
        stations: stationsPayload
      }
      console.log("Create request payload:", requestPayload)
      await routesApi.createRouteWithStations(requestPayload)
      showCustomToast("✅ Thành công", "Tuyến đường mới đã được thêm vào hệ thống.", "success")
      setIsDialogOpen(false)
      setFormData({
        routeName: "",
        originStationId: "",
        destinationStationId: "",
        distance: "",
        description: "",
        status: "active",
      })
      setRouteStops([])
      setValidationErrors({})
      setRouteStopsErrors({})
      fetchRoutes()
    } catch (error) {
      console.log("Error in createRouteWithStations:", error);
      const errorMessage = parseErrorMessage(error);
      console.log("Parsed error message:", errorMessage);
      showCustomToast("❌ Lỗi tạo tuyến đường", errorMessage, "error");
    }
  }

  const handleEdit = (route: Route) => {
    console.log("Editing route:", route);
    console.log("Route stops:", route.stops);
    setEditingRoute(route)
    
    // Set form data using origin and destination from Route object
    setFormData({
      routeName: route.routeName,
      originStationId: route.originStationId.toString(),
      destinationStationId: route.destinationStationId.toString(),
      distance: route.totalDistance.toString(),
      description: route.description,
      status: route.status,
    })
    
    // Set all route stops for editing (including intermediate stops)
    setRouteStops([...route.stops])
    console.log("Set route stops for editing:", route.stops);
    
    setIsDialogOpen(true)
  }

  const handleDelete = (routeId: number) => {
    const route = routes.find(r => r.id === routeId)
    if (route) {
      setRouteToDelete(route)
      setIsDeleteDialogOpen(true)
    }
  }

  const confirmDelete = async () => {
    if (routeToDelete) {
      try {
        await routesApi.deleteRoute(routeToDelete.id)
        showCustomToast("✅ Xóa thành công", "Tuyến đường đã được xóa khỏi hệ thống.", "success")
        setIsDeleteDialogOpen(false)
        setRouteToDelete(null)
        fetchRoutes() // Refresh the list
      } catch (error) {
        showCustomToast("❌ Lỗi xóa tuyến đường", parseErrorMessage(error), "error");
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find((option) => option.value === status)
    return <Badge className={statusOption?.color}>{statusOption?.label}</Badge>
  }

  // Helper function to validate station duplication
  const validateStationDuplication = (originId: string, destinationId: string) => {
    if (originId && destinationId && originId === destinationId) {
      return {
        originStationId: 'Ga đi và ga đến không được trùng nhau',
        destinationStationId: 'Ga đi và ga đến không được trùng nhau'
      }
    }
    return {}
  }

  // Helper function to validate route stops for duplicates
  const validateRouteStops = (stops: RouteStop[]) => {
    const errors: any = {}
    const stationIds = new Set<number>()
    
    stops.forEach((stop, index) => {
      if (stop.stationId) {
        if (stationIds.has(stop.stationId)) {
          errors[`stop_${index}`] = 'Ga này đã được chọn trước đó'
        } else {
          stationIds.add(stop.stationId)
        }
      }
    })
    
    return errors
  }

  // Helper function to parse error messages from backend
  const parseErrorMessage = (error: any): string => {
    console.log("Parsing error:", error);
    
    if (typeof error === 'string') {
      return error
    }
    
    if (error?.message) {
      console.log("Error message:", error.message);
      
      // Handle HTTP 500 errors
      if (error.message.includes('Lỗi server (500)')) {
        return error.message
      }
      
      // Handle BusinessException from backend
      if (error.message.includes('already exists between')) {
        return 'Tuyến đường này đã tồn tại trong hệ thống. Vui lòng chọn ga đi và ga đến khác.'
      }
      if (error.message.includes('BusinessException')) {
        return error.message.replace('BusinessException:', '').trim()
      }
      // Handle other backend errors
      if (error.message.includes('Lỗi khi tạo tuyến đường')) {
        return error.message
      }
      return error.message
    }
    
    if (error?.error) {
      return error.error
    }
    
    if (error?.detail) {
      return error.detail
    }
    
    console.log("Unknown error format:", error);
    return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.'
  }

  // Real-time validation function
  const validateField = (field: string, value: any) => {
    const errors = { ...validationErrors }
    
    switch (field) {
      case 'routeName':
        if (!value.trim()) {
          errors.routeName = 'Tên tuyến đường không được để trống'
        } else {
          delete errors.routeName
        }
        break
        
      case 'originStationId':
        if (!value) {
          errors.originStationId = 'Vui lòng chọn ga đi'
        } else {
          delete errors.originStationId
        }
        // Check for duplication
        const duplicationErrors = validateStationDuplication(value, formData.destinationStationId)
        Object.assign(errors, duplicationErrors)
        break
        
      case 'destinationStationId':
        if (!value) {
          errors.destinationStationId = 'Vui lòng chọn ga đến'
        } else {
          delete errors.destinationStationId
        }
        // Check for duplication
        const duplicationErrors2 = validateStationDuplication(formData.originStationId, value)
        Object.assign(errors, duplicationErrors2)
        break
        
      case 'distance':
        if (!value || Number(value) <= 0) {
          errors.distance = 'Khoảng cách phải lớn hơn 0'
        } else {
          delete errors.distance
        }
        break
    }
    
    setValidationErrors(errors)
  }

  // Custom toast function
  const showCustomToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setCustomToast({ show: true, title, message, type });
    setTimeout(() => setCustomToast({ show: false, title: '', message: '', type: 'info' }), 5000);
  };

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
                  originStationId: "",
                  destinationStationId: "",
                  distance: "",
                  description: "",
                  status: "active",
                })
                setRouteStops([])
                setValidationErrors({}) // Clear validation errors
                setRouteStopsErrors({}) // Clear route stops errors
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
                  : "Nhập thông tin tuyến đường mới. Bạn có thể thêm ga dừng hoặc tạo tuyến đường chỉ với ga đi và ga đến."}
              </DialogDescription>
              <div className="text-xs text-muted-foreground mt-2">
                * Các trường bắt buộc
              </div>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="routeName">Tên tuyến *</Label>
                    <Input
                      id="routeName"
                      value={formData.routeName}
                      onChange={(e) => {
                        setFormData({ ...formData, routeName: e.target.value })
                        validateField('routeName', e.target.value)
                      }}
                      onBlur={(e) => validateField('routeName', e.target.value)}
                      required
                      className={validationErrors.routeName ? "border-red-500" : ""}
                    />
                    {validationErrors.routeName && (
                      <div className="text-xs text-red-500">{validationErrors.routeName}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="distance">Khoảng cách (km) *</Label>
                    <Input
                      id="distance"
                      type="number"
                      value={formData.distance}
                      onChange={(e) => {
                        setFormData({ ...formData, distance: e.target.value })
                        validateField('distance', e.target.value)
                      }}
                      onBlur={(e) => validateField('distance', e.target.value)}
                      required
                      min="0"
                      step="0.1"
                      className={validationErrors.distance ? "border-red-500" : ""}
                    />
                    {validationErrors.distance && (
                      <div className="text-xs text-red-500">{validationErrors.distance}</div>
                    )}
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Ga dừng</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addStop}>
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm ga dừng
                    </Button>
                  </div>
                  {routeStops.length === 0 && (
                    <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
                      💡 Nếu không thêm ga dừng, tuyến đường sẽ chỉ có ga đi và ga đến.
                    </div>
                  )}
                  {routeStops.length > 0 && (
                    <div className="text-sm text-muted-foreground bg-green-50 p-3 rounded-md">
                      ✅ Tuyến đường sẽ được tạo với {routeStops.length} ga dừng.
                    </div>
                  )}
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
                            disabled={stationsLoading}
                          >
                            <SelectTrigger className={`h-8 ${routeStopsErrors[`stop_${index}`] ? "border-red-500" : ""}`}>
                              <SelectValue placeholder={stationsLoading ? "Đang tải..." : "Chọn ga"} />
                            </SelectTrigger>
                            <SelectContent>
                              {stations.map((station) => (
                                <SelectItem key={station.id} value={station.id.toString()}>
                                  {station.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {routeStopsErrors[`stop_${index}`] && (
                            <div className="text-xs text-red-500 mt-1">{routeStopsErrors[`stop_${index}`]}</div>
                          )}
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">Đến (phút)</Label>
                          <Input
                            type="number"
                            value={stop.arrivalOffset}
                            onChange={(e) => updateStop(index, "arrivalOffset", e.target.value)}
                            className="h-8"
                            min={0}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">Đi (phút)</Label>
                          <Input
                            type="number"
                            value={stop.departureOffset}
                            onChange={(e) => updateStop(index, "departureOffset", e.target.value)}
                            className="h-8"
                            min={0}
                          />
                        </div>
                        <div className="col-span-3">
                          <Label className="text-xs">Khoảng cách (km)</Label>
                          <Input
                            type="number"
                            value={stop.distanceFromOrigin}
                            onChange={(e) => updateStop(index, "distanceFromOrigin", e.target.value)}
                            className="h-8"
                            min={0}
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStop(index)}
                            className="h-8 w-8 p-0 text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="originStationId">Ga đi *</Label>
                    <Select
                      value={formData.originStationId}
                      onValueChange={(value) => {
                        setFormData({ ...formData, originStationId: value })
                        validateField('originStationId', value)
                      }}
                      disabled={stationsLoading}
                      required
                    >
                      <SelectTrigger className={validationErrors.originStationId ? "border-red-500" : ""}>
                        <SelectValue placeholder={stationsLoading ? "Đang tải..." : "Chọn ga đi"} />
                      </SelectTrigger>
                      <SelectContent>
                        {stations.map((station) => (
                          <SelectItem key={station.id} value={station.id.toString()}>
                            {station.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.originStationId && (
                      <div className="text-xs text-red-500">{validationErrors.originStationId}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destinationStationId">Ga đến *</Label>
                    <Select
                      value={formData.destinationStationId}
                      onValueChange={(value) => {
                        setFormData({ ...formData, destinationStationId: value })
                        validateField('destinationStationId', value)
                      }}
                      disabled={stationsLoading}
                      required
                    >
                      <SelectTrigger className={validationErrors.destinationStationId ? "border-red-500" : ""}>
                        <SelectValue placeholder={stationsLoading ? "Đang tải..." : "Chọn ga đến"} />
                      </SelectTrigger>
                      <SelectContent>
                        {stations.map((station) => (
                          <SelectItem key={station.id} value={station.id.toString()}>
                            {station.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.destinationStationId && (
                      <div className="text-xs text-red-500">{validationErrors.destinationStationId}</div>
                    )}
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
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-medium">Tuyến:</span>
                            <span className="text-sm">{route.originStationName || `Ga ${route.originStationId}`}</span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{route.destinationStationName || `Ga ${route.destinationStationId}`}</span>
                          </div>
                          {route.stops.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              Ga dừng: {route.stops.slice(1, -1).map(stop => stop.stationName).join(" → ")}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {route.stops.length === 1 ? '1 ga (đi và đến)' : 
                             route.stops.length > 2 ? `${route.stops.length - 2} ga dừng trung gian` : 
                             'Không có ga dừng trung gian'}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-medium">Tuyến:</span>
                            <span className="text-sm">{route.originStationName || `Ga ${route.originStationId}`}</span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{route.destinationStationName || `Ga ${route.destinationStationId}`}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Không có ga dừng trung gian</div>
                        </div>
                      )}
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

      {/* Custom Toast */}
      {customToast.show && (
        <div className={`fixed top-4 right-4 z-[9999] p-4 rounded-lg shadow-lg border max-w-sm ${
          customToast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          customToast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
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