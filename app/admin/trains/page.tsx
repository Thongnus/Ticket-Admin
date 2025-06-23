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
import { Edit, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getTrains, createTrain, updateTrain, deleteTrain, Train } from "@/lib/api/trains"

export default function TrainsManagement() {
  const { toast } = useToast()
  const [trains, setTrains] = useState<Train[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTrain, setEditingTrain] = useState<Train | null>(null)
  const [formData, setFormData] = useState({
    trainNumber: "",
    trainName: "",
    trainType: "express",
    capacity: "",
    status: "active",
  })

  const trainTypes = [
    { value: "express", label: "Tàu tốc hành" },
    { value: "local", label: "Tàu địa phương" },
    { value: "fast", label: "Tàu nhanh" },
    { value: "sleeper", label: "Tàu giường nằm" },
  ]

  const statusOptions = [
    { value: "active", label: "Hoạt động", color: "bg-green-100 text-green-800" },
    { value: "maintenance", label: "Bảo trì", color: "bg-yellow-100 text-yellow-800" },
    { value: "retired", label: "Ngừng hoạt động", color: "bg-red-100 text-red-800" },
  ]

  // Lấy danh sách tàu
  useEffect(() => {
    setLoading(true)
    getTrains()
      .then(setTrains)
      .catch((error) => {
        setTrains([])
        toast({
          title: "Lỗi tải danh sách tàu",
          description: error instanceof Error ? error.message : "Không thể kết nối tới server.",
          variant: "destructive",
        })
      })
      .finally(() => setLoading(false))
  }, [toast])

  // Lọc tàu
  const filteredTrains = trains.filter((train: Train) =>
    train.trainNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    train.trainName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Xử lý form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const trainData = {
        trainNumber: formData.trainNumber,
        trainName: formData.trainName,
        trainType: formData.trainType,
        capacity: Number.parseInt(formData.capacity),
        status: formData.status,
      }
      if (editingTrain) {
        const updated = await updateTrain(editingTrain.id, trainData)
        setTrains(trains.map((train) => (train.id === editingTrain.id ? { ...train, ...trainData, updatedAt: updated.updatedAt } : train)))
        toast({ title: "Cập nhật thành công", description: "Thông tin tàu đã được cập nhật." })
      } else {
        const newTrain = await createTrain(trainData)
        setTrains([
          ...trains,
          {
            id: newTrain.trainId,
            trainNumber: newTrain.trainNumber,
            trainName: newTrain.trainName,
            trainType: newTrain.trainType,
            capacity: newTrain.capacity,
            status: newTrain.status,
            createdAt: newTrain.createdAt,
            updatedAt: newTrain.updatedAt,
          },
        ])
        toast({ title: "Thêm thành công", description: "Tàu mới đã được thêm vào hệ thống." })
      }
      setIsDialogOpen(false)
      setEditingTrain(null)
      setFormData({ trainNumber: "", trainName: "", trainType: "express", capacity: "", status: "active" })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể xử lý yêu cầu.",
        variant: "destructive",
      })
    }
  }

  // Chỉnh sửa tàu
  const handleEdit = (train: Train) => {
    setEditingTrain(train)
    setFormData({
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      trainType: train.trainType,
      capacity: train.capacity.toString(),
      status: train.status,
    })
    setIsDialogOpen(true)
  }

  // Xóa tàu
  const handleDelete = async (trainId: number) => {
    try {
      await deleteTrain(trainId)
      setTrains(trains.filter((train) => train.id !== trainId))
      toast({ title: "Xóa thành công", description: "Tàu đã được xóa khỏi hệ thống." })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể xóa tàu.",
        variant: "destructive",
      })
    }
  }

  // Lấy badge trạng thái
  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find((option) => option.value === status)
    return <Badge className={statusOption?.color || "bg-gray-100 text-gray-800"}>{statusOption?.label || status}</Badge>
  }

  // Lấy tên loại tàu
  const getTrainTypeLabel = (type: string) => {
    const trainType = trainTypes.find((t) => t.value === type)
    return trainType?.label || type
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý tàu</h2>
          <p className="text-muted-foreground">Quản lý thông tin các đoàn tàu trong hệ thống</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingTrain(null)
                setFormData({
                  trainNumber: "",
                  trainName: "",
                  trainType: "express",
                  capacity: "",
                  status: "active",
                })
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm tàu mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingTrain ? "Chỉnh sửa tàu" : "Thêm tàu mới"}</DialogTitle>
              <DialogDescription>
                {editingTrain ? "Cập nhật thông tin tàu" : "Nhập thông tin tàu mới vào hệ thống"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="trainNumber" className="text-right">
                    Số hiệu tàu
                  </Label>
                  <Input
                    id="trainNumber"
                    value={formData.trainNumber}
                    onChange={(e) => setFormData({ ...formData, trainNumber: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="trainName" className="text-right">
                    Tên tàu
                  </Label>
                  <Input
                    id="trainName"
                    value={formData.trainName}
                    onChange={(e) => setFormData({ ...formData, trainName: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="trainType" className="text-right">
                    Loại tàu
                  </Label>
                  <Select
                    value={formData.trainType}
                    onValueChange={(value) => setFormData({ ...formData, trainType: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {trainTypes.map((type) => (
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
                <Button type="submit">{editingTrain ? "Cập nhật" : "Thêm mới"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách tàu</CardTitle>
          <CardDescription>Tổng cộng {trains.length} tàu trong hệ thống</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo số hiệu hoặc tên tàu..."
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
          ) : trains.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Không có tàu nào trong hệ thống.
            </div>
          ) : filteredTrains.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Không tìm thấy tàu phù hợp với tìm kiếm.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Số hiệu</TableHead>
                  <TableHead>Tên tàu</TableHead>
                  <TableHead>Loại tàu</TableHead>
                  <TableHead>Sức chứa</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrains.map((train) => (
                  <TableRow key={train.id}>
                    <TableCell className="font-medium">{train.trainNumber || "N/A"}</TableCell>
                    <TableCell>{train.trainName || "N/A"}</TableCell>
                    <TableCell>{getTrainTypeLabel(train.trainType)}</TableCell>
                    <TableCell>{train.capacity} chỗ</TableCell>
                    <TableCell>{getStatusBadge(train.status)}</TableCell>
                    <TableCell>{new Date(train.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Mở menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(train)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(train.id)} className="text-red-600">
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
    </div>
  )
}