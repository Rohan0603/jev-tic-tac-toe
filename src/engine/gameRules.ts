export type Player = "X" | "O";
export type Cell = Player | null;
export type Board = readonly [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell];

export type GameResult = {
  winner: Player | null;
  draw: boolean;
  winningLine: number[];
};

export const EMPTY_BOARD: Board = [null, null, null, null, null, null, null, null, null];

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

export function getLegalMoves(board: Board): number[] {
  return board.flatMap((cell, index) => cell === null ? [index] : []);
}

export function applyMove(board: Board, index: number, player: Player): Board {
  if (!Number.isInteger(index) || index < 0 || index > 8 || board[index] !== null) {
    throw new Error("Move must target an empty cell from 0 to 8");
  }
  const next = [...board] as [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell];
  next[index] = player;
  return next;
}

export function getGameResult(board: Board): GameResult {
  for (const line of WINNING_LINES) {
    const [first, second, third] = line;
    if (board[first] && board[first] === board[second] && board[first] === board[third]) {
      return { winner: board[first], draw: false, winningLine: line };
    }
  }
  return { winner: null, draw: getLegalMoves(board).length === 0, winningLine: [] };
}

export function boardKey(board: Board): string {
  return board.map((cell) => cell ?? ".").join("");
}
