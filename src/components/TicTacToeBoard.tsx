import type { Board } from "../engine/gameRules";

type Props = {
  board: Board;
  disabled: boolean;
  winningLine: number[];
  onMove: (index: number) => void;
};

export function TicTacToeBoard({ board, disabled, winningLine, onMove }: Props) {
  return (
    <div className="board" role="grid" aria-label="Tic-tac-toe board">
      {board.map((cell, index) => (
        <button
          className={`cell ${winningLine.includes(index) ? "cell--winner" : ""}`}
          disabled={disabled || cell !== null}
          key={index}
          onClick={() => onMove(index)}
          role="gridcell"
          aria-label={cell ? `Cell ${index + 1}, ${cell}` : `Cell ${index + 1}, empty`}
        >
          {cell}
        </button>
      ))}
    </div>
  );
}
