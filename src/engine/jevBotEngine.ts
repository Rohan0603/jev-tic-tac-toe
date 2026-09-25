import type { Board } from "./gameRules";
import { getLegalMoves } from "./gameRules";

export type JevMoveDecision = {
  choice: number;
  probabilities: Record<string, number>;
  confidence: number;
};

type JevApiResponse = {
  choice: string;
  probabilities: Record<string, number>;
  confidence: number;
};

const WINNING_LINES_CONTEXT = [
  "- Rows: [0,1,2], [3,4,5], [6,7,8]",
  "- Columns: [0,3,6], [1,4,7], [2,5,8]",
  "- Diagonals: [0,4,8], [2,4,6]"
];

export function serializeBoard(board: Board): string {
  const cell = (index: number) => board[index] ?? ".";
  const rows = [
    ` ${cell(0)} | ${cell(1)} | ${cell(2)}   (Indices: 0, 1, 2)`,
    "---+---+---",
    ` ${cell(3)} | ${cell(4)} | ${cell(5)}   (Indices: 3, 4, 5)`,
    "---+---+---",
    ` ${cell(6)} | ${cell(7)} | ${cell(8)}   (Indices: 6, 7, 8)`
  ];
  return [
    "You are playing Tic-Tac-Toe as O.",
    "Select the single best legal move. Complete a line to win or block X.",
    "",
    "Current 3x3 Board Grid:",
    ...rows,
    "",
    "Winning lines on this grid:",
    ...WINNING_LINES_CONTEXT,
    "",
    `Available Moves: [${getLegalMoves(board).map((index) => `"${index}"`).join(", ")}]`
  ].join("\n");
}

export function buildChoiceCriteria(board: Board): Record<string, string> {
  return Object.fromEntries(
    getLegalMoves(board).map((index) => [
      String(index),
      `Empty cell at board index ${index}. Choose this only when it is legal.`
    ])
  );
}

function parseDecision(response: JevApiResponse, board: Board): JevMoveDecision {
  const legalMoves = getLegalMoves(board);
  const choice = Number(response.choice);
  if (!Number.isInteger(choice) || !legalMoves.includes(choice)) {
    throw new Error("Jev returned an illegal move");
  }
  return { ...response, choice };
}

export async function getJevBotMove(board: Board, signal?: AbortSignal): Promise<JevMoveDecision> {
  if (getLegalMoves(board).length === 0) {
    throw new Error("Cannot request a move on a full board");
  }

  const response = await fetch("/api/jev-move", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ board }),
    signal
  });
  if (!response.ok) {
    throw new Error(`Jev request failed with status ${response.status}`);
  }
  return parseDecision(await response.json() as JevApiResponse, board);
}
