import EventEmitter from "events";
import { BoardState } from "./BoardState";
import { GameState } from "./GameState";
import { Player } from "./Player";

export class Game extends EventEmitter<{
  join: [string];
  start: [];
  over: [Player];
}> {
  private id: string;
  private turn: Player;
  private gameState: GameState;
  private winner: Player | null;
  private boardState: BoardState;
  private players: string[];

  constructor(id: string) {
    super();
    this.id = id;
    this.turn = Math.floor(Math.random() * 2);
    this.gameState = GameState.WAITING;
    this.winner = null;
    this.boardState = new BoardState();
    this.players = [];
  }

  getId(): string {
    return this.id;
  }

  getGameState(): GameState {
    return this.gameState;
  }

  addPlayer(name: string): Player {
    if (this.gameState !== GameState.WAITING) {
      throw new Error("Game is already started");
    }

    const idx = this.players.push(name);

    this.emit("join", name);

    // start the game if it's second player
    if (idx === 1) {
      this.gameState = GameState.PLAYING;
      this.emit("start");
    }

    return idx;
  }

  getWinner(): Player | null {
    return this.winner;
  }

  getTurn(): Player {
    return this.turn;
  }

  getPlayer(num: number) {
    return this.players[num + 1];
  }

  chooseTile(player: Player, row: number, col: number) {
    if (player !== this.turn) {
      throw new Error("Not this player's turn");
    }

    this.boardState.chooseTile(player, row, col);
    const winner = this.boardState.checkWinner();
    if (winner) {
      this.gameState = GameState.OVER;
      this.winner = winner;

      this.emit("over", winner);
    }
  }
}
