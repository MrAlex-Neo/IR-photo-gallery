import { GridCell } from "../components/types";

export const calculateGridLayout = (
  count: number,
  containerWidth: number,
  containerHeight: number
): GridCell[] => {
  const cells: GridCell[] = [];

  if (count <= 0) return cells;
  if (count === 1) {
    cells.push({
      row: 0,
      col: 0,
      width: containerWidth,
      height: containerHeight,
    });
    return cells;
  }

  // Идеальная пропорция для сетки
  const ratio = containerWidth / containerHeight;
  const cols = Math.ceil(Math.sqrt(count * ratio));
  const rows = Math.ceil(count / cols);

  const cellWidth = containerWidth / cols;
  const cellHeight = containerHeight / rows;

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    cells.push({
      row,
      col,
      width: cellWidth,
      height: cellHeight,
    });
  }

  return cells;
};
