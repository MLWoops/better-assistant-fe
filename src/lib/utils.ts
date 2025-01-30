import axios from "axios"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain',
  }
})

export default axiosInstance;