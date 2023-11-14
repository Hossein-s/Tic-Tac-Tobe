import { GameState } from "./types/GameState";
import { Games } from "./types/Games";
import { Player } from "./types/Player";
import { WebSocketData } from "./types/WebSocketData";

Bun.serve<WebSocketData>({
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/games" && req.method === "POST") {
      const game = Games.newGame();

      const response = Response.json({ id: game.getId() }, { status: 201 });
      response.headers.set("Access-Control-Allow-Origin", "*");
      response.headers.set("Access-Control-Allow-Methods", "POST");

      return response;
    }

    if (url.pathname === "/play") {
      const params = url.searchParams;
      const gameId = params.get("gameId");
      const game = Games.getGame(gameId ?? "");

      if (!game) {
        return;
      }

      server.upgrade<WebSocketData>(req, { data: { game } });
    }
  },
  websocket: {
    open: (ws) => {
      const { game } = ws.data;

      if (game.getGameState() !== GameState.WAITING) {
        ws.close(4000, "Bad state");
        return;
      }

      // add to game
      ws.data.player = game.addPlayer();

      // send player
      ws.send(JSON.stringify({ event: "welcome", player: Player[ws.data.player] }));

      // set event listeners
      game.on("start", () =>
        ws.send(JSON.stringify({ event: "start", turn: Player[game.getTurn()] }))
      );
      game.on("over", (winner) =>
        ws.send(JSON.stringify({ event: "over", winner: Player[winner] }))
      );
      game.on("tileChosen", (data) =>
        ws.send(JSON.stringify({ event: "tileChosen", ...data, player: Player[data.player] }))
      );
    },
    message: (ws, message) => {
      const msg = JSON.parse(message.toString());
      const { game, player } = ws.data;

      if (msg.command === "chooseTile") {
        game.chooseTile(player!, msg.row, msg.col);
      }
    },
  },

  port: 8080,
});

console.log("Game server is listening on port 3000");
