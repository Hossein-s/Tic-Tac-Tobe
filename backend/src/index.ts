import {
  handleCreateGame,
  handleMessage,
  handleOpen,
  handlePlay,
} from "./handlers";
import { WebSocketData } from "./types/WebSocketData";

Bun.serve<WebSocketData>({
  async fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "games" && req.method === "POST") {
      return handleCreateGame(server);
    }

    if (url.pathname === "play") {
      return handlePlay(req, server);
    }
  },
  websocket: {
    open: handleOpen,
    message: handleMessage,
  },

  port: 3000,
});

console.log("Game server is listening on port 3000");
