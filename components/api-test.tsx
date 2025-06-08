"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export function ApiConnectionTest() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<{
    status: "success" | "error" | "idle"
    message: string
    details?: any
  }>({ status: "idle", message: "" })

  const testConnection = async () => {
    setTesting(true)
    setResult({ status: "idle", message: "Đang kiểm tra kết nối..." })

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"

      // Test basic connectivity
      const response = await fetch(`${apiUrl}/users?page=0&pageSize=1`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setResult({
          status: "success",
          message: `Kết nối thành công! Tìm thấy ${data.totalElements || 0} người dùng.`,
          details: {
            url: apiUrl,
            status: response.status,
            totalElements: data.totalElements,
          },
        })
      } else {
        setResult({
          status: "error",
          message: `Lỗi HTTP ${response.status}: ${response.statusText}`,
          details: {
            url: apiUrl,
            status: response.status,
          },
        })
      }
    } catch (error) {
      let errorMessage = "Không thể kết nối đến API"

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        errorMessage = "Lỗi CORS hoặc API không khả dụng"
      } else if (error.message.includes("timeout")) {
        errorMessage = "Timeout - API phản hồi quá chậm"
      }

      setResult({
        status: "error",
        message: errorMessage,
        details: {
          error: error.message,
          name: error.name,
        },
      })
    } finally {
      setTesting(false)
    }
  }

  const getStatusIcon = () => {
    switch (result.status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return null
    }
  }

  const getStatusBadge = () => {
    switch (result.status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Kết nối thành công</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800">Kết nối thất bại</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Chưa kiểm tra</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Kiểm tra kết nối API
          {getStatusIcon()}
        </CardTitle>
        <CardDescription>Kiểm tra khả năng kết nối đến API backend của bạn</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Trạng thái kết nối:</p>
            <p className="text-xs text-muted-foreground">
              API URL: {process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"}
            </p>
          </div>
          {getStatusBadge()}
        </div>

        <Button onClick={testConnection} disabled={testing} className="w-full">
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang kiểm tra...
            </>
          ) : (
            "Kiểm tra kết nối"
          )}
        </Button>

        {result.message && (
          <div
            className={`p-3 rounded-md ${
              result.status === "success"
                ? "bg-green-50 border border-green-200"
                : result.status === "error"
                  ? "bg-red-50 border border-red-200"
                  : "bg-blue-50 border border-blue-200"
            }`}
          >
            <p
              className={`text-sm ${
                result.status === "success"
                  ? "text-green-800"
                  : result.status === "error"
                    ? "text-red-800"
                    : "text-blue-800"
              }`}
            >
              {result.message}
            </p>

            {result.details && (
              <details className="mt-2">
                <summary className="text-xs cursor-pointer opacity-70">Chi tiết kỹ thuật</summary>
                <pre className="text-xs mt-1 p-2 bg-black/5 rounded overflow-auto">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Lưu ý:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>API cần cấu hình CORS cho domain v0.dev</li>
            <li>Sử dụng ngrok nếu API chạy trên localhost</li>
            <li>Đảm bảo API đang chạy và có thể truy cập</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
