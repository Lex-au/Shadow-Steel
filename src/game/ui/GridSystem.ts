import p5 from 'p5';

export interface GridConfig {
  columns: number;
  width: number;
  cellHeight: number;
  padding: number;
}

export interface GridCell {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class GridSystem {
  constructor(private p: p5) {}

  public calculateGrid(config: GridConfig): {
    cellWidth: number;
    getCellPosition: (index: number, scrollY?: number) => GridCell;
  } {
    const { columns, width, cellHeight, padding } = config;
    const cellWidth = width / columns;

    return {
      cellWidth,
      getCellPosition: (index: number, scrollY: number = 0): GridCell => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        const x = col * cellWidth + padding;
        const y = row * cellHeight + scrollY + padding;
        
        return {
          x,
          y,
          width: cellWidth - (padding * 2),
          height: cellHeight - (padding * 2)
        };
      }
    };
  }
}