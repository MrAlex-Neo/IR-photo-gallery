import axios from "axios";
import { PhotoData, ApiResponse } from "../components/types";

// Определяем URL в зависимости от окружения
const getApiUrl = () => {
  if (process.env.NODE_ENV === "development") {
    // В development используем прокси
    return "/api/G388ych/getimg/";
  } else {
    // В production используем прямой URL
    return "https://di.i-rs.ru/gallery/G/G388ych/getimg/";
  }
};

const API_URL = getApiUrl();
const IMAGE_BASE_URL = "https://di.i-rs.ru/gallery/G/G388ych/";

export const fetchPhotos = async (): Promise<PhotoData[]> => {
  try {
    console.log("Fetching from URL:", API_URL);

    const response = await axios.get<ApiResponse>(API_URL, {
      // Добавляем параметры для обхода CORS
      timeout: 10000, // 10 секунд таймаут
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (response.data.code === 200) {
      return response.data.data;
    }
    console.log("API Response:", response.data);
    return [];
  } catch (error: any) {
    console.error("Error fetching photos:", error.message);
    console.error("Error details:", error.response?.data || error);

    // Возвращаем тестовые данные при ошибке
    return getFallbackPhotos();
  }
};

// Функция для возврата тестовых данных при ошибке
const getFallbackPhotos = (): PhotoData[] => {
  console.log("Using fallback photos");
  return [];
};

export const getImageUrl = (filename: string): string => {
  return `${IMAGE_BASE_URL}${filename}`;
};
