import { choice, TypeSafeClient } from "@typesafe-ai/sdk";
import { createServer } from "node:http";
import { buildChoiceCriteria, serializeBoard } from "../src/engine/jevBotEngine";
import type { Board } from "../src/engine/gameRules";

const port = Number(process.env.PORT ?? 3001);

type MoveRequest = { board: Board };

function isBoard(value: unknown): value is Board {
  return Array.isArray(value) && value.length === 9 && value.every((cell) => cell === null || cell === "X" || cell === "O");
}

function sendJson(response: import("node:http").ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "http://localhost:5173" });
  response.end(JSON.stringify(body));
}

const server = createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/api/jev-move") {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  let raw = "";
  request.on("data", (chunk: Buffer) => { raw += chunk.toString(); });
  request.on("end", async () => {
    try {
      const payload = JSON.parse(raw) as Partial<MoveRequest>;
      if (!isBoard(payload.board)) {
        sendJson(response, 400, { error: "Invalid board" });
        return;
      }
      if (!process.env.TYPESAFE_API_KEY) {
        sendJson(response, 503, { error: "TypeSafe API key is not configured" });
        return;
      }

      const client = new TypeSafeClient();
      const result = await client.systemOne({
        model: "jev-latest",
        state: serializeBoard(payload.board),
        questions: {
          move: choice("Which allowed cell is the single best move for O? Complete a line to win or block X.", buildChoiceCriteria(payload.board))
        }
      });
      const answer = result.answers.move;
      sendJson(response, 200, {
        choice: answer.choice,
        probabilities: answer.probabilities,
        confidence: answer.confidence
      });
    } catch (error) {
      console.error("Jev move request failed:", error instanceof Error ? error.message : "unknown error");
      sendJson(response, 502, { error: "Jev could not choose a move" });
    }
  });
});

server.listen(port, () => {
  console.log(`Jev server listening on http://localhost:${port}`);
});
