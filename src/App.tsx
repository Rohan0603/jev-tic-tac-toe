import { useEffect, useRef, useState } from "react";
import { JevStats } from "./components/JevStats";
import { TicTacToeBoard } from "./components/TicTacToeBoard";
import { applyMove, EMPTY_BOARD, getGameResult, type Board } from "./engine/gameRules";
import { getJevBotMove, type JevMoveDecision } from "./engine/jevBotEngine";

export function App() {
  const [board, setBoard] = useState<Board>(EMPTY_BOARD);
  const [thinking, setThinking] = useState(false);
  const [decision, setDecision] = useState<JevMoveDecision | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const transactionRef = useRef(0);
  const result = getGameResult(board);
  const finished = result.winner !== null || result.draw;

  useEffect(() => () => abortRef.current?.abort(), []);

  function reset() {
    abortRef.current?.abort();
    transactionRef.current += 1;
    setBoard(EMPTY_BOARD);
    setDecision(null);
    setError(null);
    setThinking(false);
  }

  async function playHumanMove(index: number) {
    if (thinking || finished) return;
    const nextBoard = applyMove(board, index, "X");
    const nextResult = getGameResult(nextBoard);
    setBoard(nextBoard);
    setError(null);
    if (nextResult.winner || nextResult.draw) return;

    const currentTransaction = transactionRef.current + 1;
    transactionRef.current = currentTransaction;
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    setThinking(true);
    try {
      const nextDecision = await getJevBotMove(nextBoard, controller.signal);
      if (controller.signal.aborted || currentTransaction !== transactionRef.current) return;
      const botBoard = applyMove(nextBoard, nextDecision.choice, "O");
      setDecision(nextDecision);
      setBoard(botBoard);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        console.error(error);
        setError(error instanceof Error ? error.message : "Jev request failed");
      }
    } finally {
      if (!controller.signal.aborted && currentTransaction === transactionRef.current) setThinking(false);
    }
  }

  const status = result.winner ? `${result.winner} wins` : result.draw ? "Draw game" : error ?? (thinking ? "Jev is choosing a move" : "Your move");
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">SYSTEM ONE / LIVE MATCH</p>
        <h1>Jev plays<br /><em>the next square.</em></h1>
        <p className="intro">A small game of perfect information, guided by a typed decision model.</p>
      </section>
      <section className="game-layout">
        <div className="game-panel">
          <div className="game-panel__topline"><span>YOU <b>X</b></span><span>JEV <b>O</b></span></div>
          <TicTacToeBoard board={board} disabled={thinking || finished || error !== null} winningLine={result.winningLine} onMove={playHumanMove} />
          <p className="status" aria-live="polite">{status}</p>
          <button className="reset" onClick={reset}>Start new game</button>
        </div>
        <aside className="insight-panel">
          <p className="eyebrow">DECISION TRACE</p>
          <h2>What Jev saw</h2>
          <p className="aside-copy">Jev receives the board as a constrained Choice. It can only select from cells that are still open.</p>
          <JevStats decision={decision} />
        </aside>
      </section>
    </main>
  );
}
