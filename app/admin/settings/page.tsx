"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Settings, Save, Bell, Shield, Database } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cài đặt hệ thống</h2>
          <p className="text-muted-foreground">Quản lý cấu hình và thiết lập hệ thống</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Cài đặt chung
            </CardTitle>
            <CardDescription>Cấu hình cơ bản của hệ thống</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="systemName">Tên hệ thống</Label>
                <Input id="systemName" defaultValue="VietRail Admin" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Múi giờ</Label>
                <Input id="timezone" defaultValue="Asia/Ho_Chi_Minh" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả hệ thống</Label>
              <Input id="description" defaultValue="Hệ thống quản lý vé tàu hỏa VietRail" />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Cài đặt thông báo
            </CardTitle>
            <CardDescription>Quản lý thông báo và cảnh báo hệ thống</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Thông báo email</Label>
                <p className="text-sm text-muted-foreground">Gửi thông báo qua email</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Cảnh báo hệ thống</Label>
                <p className="text-sm text-muted-foreground">Hiển thị cảnh báo khi có sự cố</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Thông báo đặt vé</Label>
                <p className="text-sm text-muted-foreground">Thông báo khi có đặt vé mới</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Cài đặt bảo mật
            </CardTitle>
            <CardDescription>Cấu hình bảo mật và quyền truy cập</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Xác thực hai yếu tố</Label>
                <p className="text-sm text-muted-foreground">Bật xác thực 2FA cho tài khoản admin</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Tự động đăng xuất</Label>
                <p className="text-sm text-muted-foreground">Đăng xuất tự động sau 30 phút không hoạt động</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Thời gian phiên (phút)</Label>
              <Input id="sessionTimeout" type="number" defaultValue="30" className="w-32" />
            </div>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Cài đặt cơ sở dữ liệu
            </CardTitle>
            <CardDescription>Cấu hình sao lưu và bảo trì dữ liệu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sao lưu tự động</Label>
                <p className="text-sm text-muted-foreground">Sao lưu dữ liệu hàng ngày</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="backupTime">Thời gian sao lưu</Label>
              <Input id="backupTime" type="time" defaultValue="02:00" className="w-32" />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="retentionDays">Lưu trữ sao lưu (ngày)</Label>
              <Input id="retentionDays" type="number" defaultValue="30" className="w-32" />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Lưu cài đặt
          </Button>
        </div>
      </div>
    </div>
  )
}
