import { GridCell, PhotoData } from "../components/types";

export const calculateAspectAwareLayout = (
  photos: PhotoData[],
  containerWidth: number,
  containerHeight: number
): GridCell[] => {
  const totalPhotos = photos.length;
  if (totalPhotos === 0) return [];

  // 1 фото - 80% высоты экрана
  if (totalPhotos === 1) {
    const photoHeight = containerHeight * 0.8;
    const photoWidth = containerWidth;

    return [
      {
        row: 0,
        col: 0,
        width: photoWidth,
        height: photoHeight,
      },
    ];
  }

  // 2 фото - 70% высоты экрана каждая
  if (totalPhotos === 2) {
    const photoHeight = containerHeight * 0.7;
    const photoWidth = containerWidth / 2;

    return [
      {
        row: 0,
        col: 0,
        width: photoWidth,
        height: photoHeight,
      },
      {
        row: 0,
        col: 1,
        width: photoWidth,
        height: photoHeight,
      },
    ];
  }

  // 3 фото - 80% высоты экрана каждая
  if (totalPhotos === 3) {
    const photoHeight = containerHeight * 0.8;
    const photoWidth = containerWidth / 3;

    return [
      {
        row: 0,
        col: 0,
        width: photoWidth,
        height: photoHeight,
      },
      {
        row: 0,
        col: 1,
        width: photoWidth,
        height: photoHeight,
      },
      {
        row: 0,
        col: 2,
        width: photoWidth,
        height: photoHeight,
      },
    ];
  }

  // 4 фото - 80% высоты экрана каждая (все в одном ряду)
  if (totalPhotos === 4) {
    const photoHeight = containerHeight * 0.7;
    const photoWidth = containerWidth / 4;

    return [
      {
        row: 0,
        col: 0,
        width: photoWidth,
        height: photoHeight,
      },
      {
        row: 0,
        col: 1,
        width: photoWidth,
        height: photoHeight,
      },
      {
        row: 0,
        col: 2,
        width: photoWidth,
        height: photoHeight,
      },
      {
        row: 0,
        col: 3,
        width: photoWidth,
        height: photoHeight,
      },
    ];
  }

  // 5 и более фото - используем старую логику с сеткой
  const aspectRatio = containerWidth / containerHeight;

  let bestCols = 1;
  let bestRows = 1;
  let bestScore = -Infinity;

  for (let cols = 1; cols <= Math.max(4, totalPhotos); cols++) {
    const rows = Math.ceil(totalPhotos / cols);

    const cellWidth = containerWidth / cols;
    const cellHeight = containerHeight / rows;

    const cellAspect = cellWidth / cellHeight;
    const aspectDiff = Math.abs(1 - cellAspect);

    const emptyCells = cols * rows - totalPhotos;
    const emptyPenalty = (emptyCells / (cols * rows)) * 0.5;

    const score = 1 - aspectDiff - emptyPenalty;

    if (score > bestScore) {
      bestScore = score;
      bestCols = cols;
      bestRows = rows;
    }
  }

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
      height: cellHeight,
    });
  }

  return cells;
};
// Функция для получения прогрессивной высоты
export const getProgressiveHeight = (
  photoCount: number,
  containerHeight: number
): number => {
  switch (photoCount) {
    case 1:
      return containerHeight * 0.8; // 80%
    case 2:
      return containerHeight * 0.7; // 70%
    case 3:
      return containerHeight * 0.8; // 80%
    case 4:
      return containerHeight * 0.8; // 90%
    default:
      return containerHeight; // 100% для 5+ фото
  }
};

// Функция для получения стилей перехода
export const getTransitionStyle = (
  photoCount: number,
  index: number
): React.CSSProperties => {
  const baseDuration = 0.6;
  const delay = index * 0.1;

  return {
    transition: `all ${baseDuration}s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s`,
    transitionProperty: "width, height, left, top, transform, opacity",
  };
};
