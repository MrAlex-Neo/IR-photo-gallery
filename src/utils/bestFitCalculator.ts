import { GridCell, PhotoData } from "../components/types";

// ЕДИНЫЙ алгоритм: всегда равные ячейки, независимо от количества фото
export const calculateAspectAwareLayout = (
  photos: PhotoData[],
  containerWidth: number,
  containerHeight: number
): GridCell[] => {
  const totalPhotos = photos.length;
  if (totalPhotos === 0) return [];
  
  // Всегда создаем ПОЛНУЮ сетку, даже если фото меньше
  const aspectRatio = containerWidth / containerHeight;
  
  // Рассчитываем оптимальную сетку
  let bestCols = 1;
  let bestRows = 1;
  let bestScore = -Infinity;
  
  // Ищем сетку с наиболее квадратными ячейками
  for (let cols = 1; cols <= Math.max(4, totalPhotos); cols++) {
    const rows = Math.ceil(totalPhotos / cols);
    
    const cellWidth = containerWidth / cols;
    const cellHeight = containerHeight / rows;
    
    // Ячейка должна быть максимально квадратной
    const cellAspect = cellWidth / cellHeight;
    const aspectDiff = Math.abs(1 - cellAspect);
    
    // Штраф за пустые ячейки (если rows * cols > totalPhotos)
    const emptyCells = (cols * rows) - totalPhotos;
    const emptyPenalty = emptyCells / (cols * rows) * 0.5;
    
    // Итоговый score: максимизируем квадратность, минимизируем пустоты
    const score = (1 - aspectDiff) - emptyPenalty;
    
    if (score > bestScore) {
      bestScore = score;
      bestCols = cols;
      bestRows = rows;
    }
  }
  
  // Создаем ячейки - ВСЕ РАВНЫЕ
  const cells: GridCell[] = [];
  const cellWidth = containerWidth / bestCols;
  const cellHeight = containerHeight / bestRows;
  
  for (let i = 0; i < totalPhotos; i++) {
    const row = Math.floor(i / bestCols);
    const col = i % bestCols;
    
    cells.push({
      row,
      col,
      width: cellWidth,
      height: cellHeight
    });
  }
  
  return cells;
};

// АЛЬТЕРНАТИВА: фиксированная сетка по прогрессии
export const calculateProgressiveGrid = (
  photos: PhotoData[],
  containerWidth: number,
  containerHeight: number
): GridCell[] => {
  const totalPhotos = photos.length;
  if (totalPhotos === 0) return [];
  
  // Предопределенная прогрессия ячеек
  const gridSizes = [
    1,   // 1x1
    2,   // 2x1
    3,   // 3x2
    4,   // 2x2
    6,   // 3x2
    9,   // 3x3
    12,  // 4x3
    16,  // 4x4
    20,  // 5x4
    25,  // 5x5
    30,  // 6x5
    36,  // 6x6
    42,  // 7x6
    49,  // 7x7
    56,  // 8x7
    64,  // 8x8
    72,  // 9x8
    81,  // 9x9
    100, // 10x10
    121, // 11x11
    144  // 12x12
  ];
  
  // Находим минимальную сетку, которая вмещает все фото
  const gridSize = gridSizes.find(size => size >= totalPhotos) || gridSizes[gridSizes.length - 1];
  
  // Определяем cols и rows для выбранного gridSize
  let cols = Math.ceil(Math.sqrt(gridSize));
  let rows = Math.ceil(gridSize / cols);
  
  // Корректируем для лучшего заполнения
  while ((cols - 1) * rows >= totalPhotos) {
    cols--;
  }
  
  const cellWidth = containerWidth / cols;
  const cellHeight = containerHeight / rows;
  
  const cells: GridCell[] = [];
  
  for (let i = 0; i < totalPhotos; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    
    cells.push({
      row,
      col,
      width: cellWidth,
      height: cellHeight
    });
  }
  
  return cells;
};

// ПРОСТОЙ и надежный алгоритм
export const calculateSimpleGrid = (
  photos: PhotoData[],
  containerWidth: number,
  containerHeight: number
): GridCell[] => {
  const totalPhotos = photos.length;
  if (totalPhotos === 0) return [];
  
  // Всегда квадратная сетка
  const gridSize = Math.ceil(Math.sqrt(totalPhotos));
  const cols = gridSize;
  const rows = gridSize;
  
  const cellWidth = containerWidth / cols;
  const cellHeight = containerHeight / rows;
  
  const cells: GridCell[] = [];
  
  for (let i = 0; i < totalPhotos; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    
    cells.push({
      row,
      col,
      width: cellWidth,
      height: cellHeight
    });
  }
  
  return cells;
};