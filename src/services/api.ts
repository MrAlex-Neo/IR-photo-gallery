import axios from "axios";
import { PhotoData, ApiResponse } from "../components/types";

const API_URL = "/api/G388ych/getimg/"; // Используем локальный прокси-путь
const IMAGE_BASE_URL = "https://di.i-rs.ru/gallery/G/G388ych/";

export const fetchPhotos = async (): Promise<PhotoData[]> => {
  try {
    const response = await axios.get<ApiResponse>(API_URL);
    if (response.data.code === 200) {
      return response.data.data;
    }
    console.log(response);
    return [];
  } catch (error) {
    console.error("Error fetching photos:", error);
    return [];
  }
};

export const getImageUrl = (filename: string): string => {
  return `${IMAGE_BASE_URL}${filename}`;
};
