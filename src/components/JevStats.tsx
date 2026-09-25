import type { JevMoveDecision } from "../engine/jevBotEngine";

type Props = { decision: JevMoveDecision | null };

export function JevStats({ decision }: Props) {
  if (!decision) {
    return <p className="stats__empty">Jev decision data appears after your first move.</p>;
  }
  return (
    <section className="stats" aria-label="Jev decision details">
      <div className="stats__heading">
        <span>Jev signal</span>
        <strong>{Math.round(decision.confidence * 100)}% confidence</strong>
      </div>
      <div className="probabilities">
        {Object.entries(decision.probabilities).map(([index, probability]) => (
          <div className="probability" key={index}>
            <span>Cell {Number(index) + 1}</span>
            <span>{Math.round(probability * 100)}%</span>
            <div className="probability__track"><i style={{ width: `${probability * 100}%` }} /></div>
          </div>
        ))}
      </div>
    </section>
  );
}
