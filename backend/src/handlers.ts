import { Server, ServerWebSocket } from "bun";
import { GameState } from "./types/GameState";
import { Games } from "./types/Games";
import { Player } from "./types/Player";
import { WebSocketData } from "./types/WebSocketData";
import { WsMessage } from "./utils/WsMessage";

export function handleCreateGame(server: Server): Response {
  const game = Games.newGame();
  const gameId = game.getId();

  // set event listeners
  game.on("join", (name) =>
    server.publish(gameId, WsMessage.make("join", { name }))
  );
  game.on("start", () => server.publish(gameId, WsMessage.make("start")));
  game.on("over", (winner) =>
    server.publish(gameId, WsMessage.make("over", { winner: Player[winner] }))
  );

  return Response.json({ id: game.getId() }, { status: 201 });
}

export function handlePlay(req: Request, server: Server): Response | undefined {
  const params = new URL(req.url).searchParams;
  const gameId = params.get("gameId");
  if (!gameId) {
    return new Response("Game should be passed", { status: 400 });
  }

  const name = params.get("name");
  if (!name) {
    return new Response("Name should be passed", { status: 400 });
  }

  const game = Games.getGame(req.url);
  if (!game) {
    return new Response("Game is already started", { status: 400 });
  }

  if (game.getGameState() !== GameState.WAITING) {
    return new Response("Game is already started", { status: 400 });
  }

  const upgraded = server.upgrade(req, {
    data: {
      game: Games.getGame(req.url),
      player: Player.PLAYER1,
    },
  });

  if (upgraded) {
    game.addPlayer(name);
    return;
  } else {
    new Response("An error occurred", { status: 500 });
  }
}

export function handleOpen(ws: ServerWebSocket<WebSocketData>) {
  const { game } = ws.data;

  // subscribe to game event
  ws.subscribe(game.getId());

  // send game info
  ws.send(
    WsMessage.make("welcome", {
      turn: Player[game.getTurn()],
      player1: game.getPlayer(1),
      player2: game.getPlayer(2),
      state: GameState[game.getGameState()],
    })
  );
}

export function handleMessage(
  ws: ServerWebSocket<WebSocketData>,
  message: string
) {
  const msg = WsMessage.parse(message);
  const { game, player } = ws.data;

  if (msg.command === "chooseTile") {
    game.chooseTile(player, Number(msg.args.row), Number(msg.args.col));
  }
}
