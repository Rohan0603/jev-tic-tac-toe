import assert from "node:assert/strict";
import test from "node:test";
import { applyMove, EMPTY_BOARD, getGameResult, getLegalMoves } from "./gameRules";
import { buildChoiceCriteria, serializeBoard } from "./jevBotEngine";

test("legal moves and Choice criteria contain only open cells", () => {
  const board = ["X", null, "O", null, "X", null, null, null, "O"] as const;
  const legalMoves = getLegalMoves(board);
  assert.deepEqual(legalMoves, [1, 3, 5, 6, 7]);
  assert.deepEqual(Object.keys(buildChoiceCriteria(board)), legalMoves.map(String));
});

test("board serialization preserves spatial indices", () => {
  const board = ["X", null, "O", null, "X", null, null, null, "O"] as const;
  const serialized = serializeBoard(board);
  assert.match(serialized, /X \| \. \| O.*Indices: 0, 1, 2/);
  assert.match(serialized, /Winning lines on this grid:/);
  assert.match(serialized, /Diagonals: \[0,4,8\], \[2,4,6\]/);
  assert.match(serialized, /Available Moves: \["1", "3", "5", "6", "7"\]/);
});

test("game result detects wins and draws", () => {
  let board = EMPTY_BOARD;
  board = applyMove(board, 0, "X");
  board = applyMove(board, 3, "O");
  board = applyMove(board, 1, "X");
  board = applyMove(board, 4, "O");
  board = applyMove(board, 2, "X");
  assert.deepEqual(getGameResult(board), { winner: "X", draw: false, winningLine: [0, 1, 2] });

  const draw = ["X", "O", "X", "X", "O", "O", "O", "X", "X"] as const;
  assert.deepEqual(getGameResult(draw), { winner: null, draw: true, winningLine: [] });
});
