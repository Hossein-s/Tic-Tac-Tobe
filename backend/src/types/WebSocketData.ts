import { Game } from "./Game";
import { Player } from "./Player";

export type WebSocketData = {
  game: Game;
  player?: Player;
};
