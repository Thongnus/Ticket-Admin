import { Console } from "console";
import { authApi, ApiError } from "../api"
import { da } from "date-fns/locale";

export interface Train {
  id: number;
  trainNumber: string;
  trainName: string;
  trainType: string;
  capacity: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

// Lấy danh sách tàu
export const getTrains = async (): Promise<Train[]> => {
  const response = await authApi.fetchWithAuth("/trains")
  if (!response.ok) throw new ApiError({ message: "Lỗi khi lấy danh sách tàu", status: response.status })
  const data = await response.json()
  console.log("API /trains trả về:", data)
  return data.map((train: any) => ({
    id: train.trainId,
    trainNumber: train.trainNumber,
    trainName: train.trainName,
    trainType: train.trainType,
    capacity: train.capacity,
    status: train.status,
    createdAt: train.createdAt,
    updatedAt: train.updatedAt,
  }))
}

// Thêm tàu mới
export const createTrain = async (trainData: Omit<Train, "id" | "createdAt" | "updatedAt">) => {
  const response = await authApi.fetchWithAuth("/trains", {
    method: "POST",
    body: JSON.stringify(trainData),
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok) throw new ApiError({ message: "Lỗi khi thêm tàu", status: response.status })
  return response.json()
}

// Sửa tàu
export const updateTrain = async (id: number, trainData: Partial<Train>) => {
  const response = await authApi.fetchWithAuth(`/trains/${id}`, {
    method: "PUT",
    body: JSON.stringify(trainData),
    headers: { "Content-Type": "application/json" },
  })
  if (!response.ok) throw new ApiError({ message: "Lỗi khi cập nhật tàu", status: response.status })
  return response.json()
}

// Xóa tàu
export const deleteTrain = async (id: number) => {
  const response = await authApi.fetchWithAuth(`/trains/${id}`, { method: "DELETE" })
  if (!response.ok) throw new ApiError({ message: "Lỗi khi xóa tàu", status: response.status })
  return true
}

// Lấy danh sách tàu đang hoạt động (active)
export const fetchActiveTrains = async (): Promise<Train[]> => {
  const response = await authApi.fetchWithAuth("/trains/status/active")
  if (!response.ok) throw new ApiError({ message: "Lỗi khi lấy danh sách tàu hoạt động", status: response.status })
  const data = await response.json()
console.log(data)
  return data.map((train: any) => ({
    id: train.trainId,
    trainNumber: train.trainNumber,
    trainName: train.trainName,
    trainType: train.trainType,
    capacity: train.capacity,
    status: train.status,
    createdAt: train.createdAt,
    updatedAt: train.updatedAt,
  }))
} 