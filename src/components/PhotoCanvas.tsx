/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { fetchPhotos, getImageUrl } from "../services/api";
import { calculateAspectAwareLayout } from "../utils/bestFitCalculator";
import { PhotoData } from "./types";
import "./PhotoCanvas.css";

const PhotoCanvas: React.FC = () => {
  // Основные состояния
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Ref для предотвращения дублирования запросов
  const isRequestInProgress = useRef(false);
  const requestTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Режим работы: "test" или "real"
  const [mode, setMode] = useState<"test" | "real">("real");
  const [showStat, setShowStat] = useState(false);

  // Состояния для анимаций
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Состояния для ТЕСТОВОГО режима
  const [allAvailablePhotos, setAllAvailablePhotos] = useState<PhotoData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Состояния для РЕАЛЬНОГО режима
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [updateCountdown, setUpdateCountdown] = useState<number>(2);

  // ========== ТЕСТОВЫЙ РЕЖИМ ==========
  const simulateProgressiveLoading = () => {
    if (currentIndex < allAvailablePhotos.length) {
      const nextPhoto = allAvailablePhotos[currentIndex];
      setIsTransitioning(true);
      setPhotos((prev) => [...prev, nextPhoto]);
      setCurrentIndex((prev) => prev + 1);

      setTimeout(() => setIsTransitioning(false), 700);
    } else {
      console.log("Все тестовые фотографии загружены.");
    }
  };

  // Инициализация тестового режима
  useEffect(() => {
    if (mode !== "test") return;

    const loadAllPhotos = async () => {
      try {
        const allPhotos = await fetchPhotos();
        setAllAvailablePhotos(allPhotos);

        // Начинаем с одной фотографии
        if (allPhotos.length > 0) {
          setPhotos([allPhotos[0]]);
          setCurrentIndex(1);
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to load test photos:", error);
        setLoading(false);
      }
    };

    loadAllPhotos();
  }, [mode]);

  // Интервал тестового режима
  useEffect(() => {
    if (mode !== "test") return;
    if (
      allAvailablePhotos.length === 0 ||
      currentIndex >= allAvailablePhotos.length
    ) {
      return;
    }

    const intervalId = setInterval(simulateProgressiveLoading, 2000);
    return () => clearInterval(intervalId);
  }, [mode, allAvailablePhotos, currentIndex]);

  // ========== РЕАЛЬНЫЙ РЕЖИМ ==========
  const loadNewPhotos = useCallback(async () => {
    if (mode !== "real") return;

    if (isRequestInProgress.current) {
      console.log("Запрос уже выполняется, пропускаем...");
      return;
    }

    try {
      isRequestInProgress.current = true;
      console.log("Начинаем загрузку фото...");

      const newPhotos = await fetchPhotos();
      console.log("Получено фото с сервера:", newPhotos.length);

      setPhotos((prev) => {
        const existingIds = new Set(prev.map((p) => p.pid));
        const uniqueNewPhotos = newPhotos.filter(
          (p) => !existingIds.has(p.pid)
        );

        if (uniqueNewPhotos.length > 0) {
          console.log(`Добавлено ${uniqueNewPhotos.length} новых фото`);

          // Только добавляем новые фото, не перезаписываем старые
          const updatedPhotos = [...prev, ...uniqueNewPhotos];

          // Ограничиваем общее количество фото
          const maxPhotos = 9999999; // Можно увеличить лимит
          const finalList = updatedPhotos.slice(-maxPhotos);

          return finalList;
        } else {
          console.log("Новых фото не обнаружено");
          return prev; // Возвращаем предыдущие фото без изменений
        }
      });

      setLastUpdateTime(new Date());
    } catch (error) {
      console.error("Ошибка загрузки фото:", error);
    } finally {
      isRequestInProgress.current = false;
    }
  }, [mode]);

  // Инициализация реального режима
  useEffect(() => {
    if (mode !== "real") return;

    const initRealMode = async () => {
      try {
        console.log("Инициализация реального режима...");
        const initialPhotos = await fetchPhotos();

        // В реальном режиме показываем ВСЕ фото сразу
        setPhotos(initialPhotos);
        setLoading(false);

        console.log(
          `Режим реального времени: загружено ${initialPhotos.length} фото`
        );
        setLastUpdateTime(new Date());
      } catch (error) {
        console.error("Ошибка инициализации:", error);
        setLoading(false);
      }
    };

    initRealMode();
  }, [mode]);

  // ЕДИНСТВЕННЫЙ интервал для реального режима
  useEffect(() => {
    if (mode !== "real") {
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
        requestTimeoutRef.current = null;
      }
      setUpdateCountdown(2);
      return;
    }

    console.log("Запускаем интервал реального режима...");

    const updateCountdownAndLoad = () => {
      setUpdateCountdown((prev) => {
        if (prev <= 1) {
          loadNewPhotos();
          return 2;
        }
        return prev - 1;
      });
    };

    const intervalId = setInterval(updateCountdownAndLoad, 1000);

    return () => {
      console.log("Очищаем интервал реального режима");
      clearInterval(intervalId);
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
        requestTimeoutRef.current = null;
      }
      isRequestInProgress.current = false;
    };
  }, [mode, loadNewPhotos]);

  // ========== ОБЩИЕ ФУНКЦИИ ==========
  // Отслеживание размера контейнера
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
      }
    };

    updateSize();
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateSize, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Расчет сетки
  const gridLayout = calculateAspectAwareLayout(
    photos,
    containerSize.width,
    containerSize.height
  );

  const handleModeChange = (newMode: "test" | "real") => {
    if (newMode === mode) return;

    console.log(`Смена режима с ${mode} на ${newMode}`);

    if (requestTimeoutRef.current) {
      clearTimeout(requestTimeoutRef.current);
      requestTimeoutRef.current = null;
    }
    isRequestInProgress.current = false;

    if (newMode === "test") {
      setPhotos([]);
      setCurrentIndex(0);
      setAllAvailablePhotos([]);
    }

    setUpdateCountdown(2);
    setLoading(true);
    setMode(newMode);
  };

  // Форматирование времени
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (loading) {
    return <div className="loading">Загрузка фотографий...</div>;
  }

  return (
    <>
      <div
        ref={containerRef}
        className="photo-canvas"
        style={{
          width: "100vw",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          backgroundColor: "#000",
        }}
      >
        {photos.map((photo, index) => {
          const layout = gridLayout[index];
          if (!layout) return null;

          // Определяем, нужно ли использовать object-fit: contain (без кропа)
          const shouldUseContain = photos.length >= 1 && photos.length <= 4;

          // Рассчитываем вертикальное центрирование для 1-4 фото
          let top = layout.row * layout.height;
          if (photos.length >= 1 && photos.length <= 4) {
            const usedHeight = layout.height;
            const availableHeight = containerSize.height;
            top = (availableHeight - usedHeight) / 2;
          }

          return (
            <div
              key={`${photo.pid}-${index}`}
              className="photo-item"
              style={{
                position: "absolute",
                left: `${layout.col * layout.width}px`,
                top: `${top}px`,
                width: `${layout.width}px`,
                height: `${layout.height}px`,
                overflow: "hidden",
                transition: "all 0.5s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={getImageUrl(photo.fn)}
                alt={`Photo ${photo.pid}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: shouldUseContain ? "contain" : "cover",
                  objectPosition: "center",
                  display: "block",
                  backgroundColor: "#000",
                }}
                onError={(e) => {
                  console.error(`Failed to load image: ${photo.fn}`);
                  e.currentTarget.style.backgroundColor = "#333";
                  e.currentTarget.style.display = "flex";
                  e.currentTarget.style.alignItems = "center";
                  e.currentTarget.style.justifyContent = "center";
                  e.currentTarget.style.color = "white";
                  e.currentTarget.innerHTML = "Фото не загружено";
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Панель управления */}
      {showStat && (
        <>
          <div
            style={{
              position: "fixed",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(0,0,0,0.9)",
              color: "white",
              padding: "12px 24px",
              borderRadius: "12px",
              zIndex: 1000,
              display: "flex",
              gap: "15px",
              alignItems: "center",
              fontFamily: "Arial, sans-serif",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {/* Переключатель режимов */}
            <div style={{ display: "flex", gap: "10px", marginRight: "20px" }}>
              <button
                onClick={() => handleModeChange("test")}
                style={{
                  padding: "6px 12px",
                  backgroundColor: mode === "test" ? "#6f42c1" : "#495057",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: mode === "test" ? "bold" : "normal",
                }}
              >
                Тест
              </button>
              <button
                onClick={() => handleModeChange("real")}
                style={{
                  padding: "6px 12px",
                  backgroundColor: mode === "real" ? "#20c997" : "#495057",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: mode === "real" ? "bold" : "normal",
                }}
              >
                Реальный
              </button>
            </div>

            {/* Статистика */}
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <span style={{ fontSize: "14px" }}>
                Режим:{" "}
                <strong>{mode === "test" ? "Тестовый" : "Реальный"}</strong>
              </span>
              <span style={{ fontSize: "14px" }}>
                Фото: <strong>{photos.length}</strong>
                {mode === "test" && ` из ${allAvailablePhotos.length}`}
              </span>
              {mode === "real" && (
                <span style={{ fontSize: "14px", color: "#adb5bd" }}>
                  Обновлено: {formatTime(lastUpdateTime)}
                </span>
              )}
            </div>

            {/* Кнопки управления для тестового режима */}
            {mode === "test" && (
              <div style={{ display: "flex", gap: "10px", marginLeft: "20px" }}>
                <button
                  onClick={simulateProgressiveLoading}
                  disabled={currentIndex >= allAvailablePhotos.length}
                  style={{
                    padding: "6px 12px",
                    backgroundColor:
                      currentIndex >= allAvailablePhotos.length
                        ? "#6c757d"
                        : "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor:
                      currentIndex >= allAvailablePhotos.length
                        ? "not-allowed"
                        : "pointer",
                    fontSize: "12px",
                  }}
                  title="Добавить одно фото"
                >
                  +1 фото
                </button>
                <button
                  onClick={() => {
                    const count = Math.min(4, allAvailablePhotos.length);
                    setPhotos(allAvailablePhotos.slice(0, count));
                    setCurrentIndex(count);
                    setIsTransitioning(true);
                    setTimeout(() => setIsTransitioning(false), 700);
                  }}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                  title="Показать 4 фото"
                >
                  4 фото
                </button>
                <button
                  onClick={() => {
                    setPhotos([]);
                    setCurrentIndex(0);
                  }}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                  title="Очистить все фото"
                >
                  Сбросить
                </button>
              </div>
            )}

            {/* Кнопка ручного обновления для реального режима */}
            {mode === "real" && (
              <button
                onClick={loadNewPhotos}
                disabled={isRequestInProgress.current}
                style={{
                  padding: "6px 12px",
                  marginLeft: "20px",
                  backgroundColor: isRequestInProgress.current
                    ? "#6c757d"
                    : "#fd7e14",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: isRequestInProgress.current
                    ? "not-allowed"
                    : "pointer",
                  fontSize: "12px",
                }}
                title={
                  isRequestInProgress.current
                    ? "Запрос выполняется..."
                    : "Обновить сейчас"
                }
              >
                {isRequestInProgress.current ? "Загрузка..." : "Обновить"}
              </button>
            )}
          </div>

          {/* Информация в углу */}
          <div
            style={{
              position: "fixed",
              top: "10px",
              right: "10px",
              backgroundColor: "rgba(0,0,0,0.7)",
              color: "white",
              padding: "8px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              zIndex: 1000,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div>
              Режим: <strong>{mode === "test" ? "ТЕСТ" : "РЕАЛЬНЫЙ"}</strong>
            </div>
            <div>
              Фото: <strong>{photos.length}</strong>
            </div>
            <div
              style={{ fontSize: "10px", color: "#4dabf7", marginTop: "4px" }}
            >
              Высота:{" "}
              {photos.length === 1
                ? "80%"
                : photos.length === 2
                ? "70%"
                : photos.length === 3
                ? "80%"
                : photos.length === 4
                ? "80%"
                : "100%"}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default PhotoCanvas;
