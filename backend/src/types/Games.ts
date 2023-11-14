import { randomUUID } from "crypto";
import { Game } from "./Game";

export class Games {
  private static games: Record<string, Game> = {};

  static newGame(): Game {
    const id = randomUUID();
    const game = new Game(id);
    this.games[id] = game;

    return game;
  }

  static deleteGame(id: string): void {
    delete this.games[id];
  }

  static getGame(id: string): Game {
    const game = this.games[id];
    if (!game) {
      throw new Error("Invalid game id");
    }

    return game;
  }
}
