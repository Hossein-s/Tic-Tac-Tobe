import EventEmitter from "events";
import { GameState } from "./GameState";
import { Player } from "./Player";

type Events = {
  start: [];
  over: [Player];
  tileChosen: [{ player: Player; row: number; col: number }];
};

export class Game extends EventEmitter<Events> {
  private turn: Player = Math.floor(Math.random() * 2);
  private gameState: GameState = GameState.WAITING;
  private winner: Player | null = null;
  private numberOfPlayers: number = 0;
  private boardState: Array<(Player | null)[]> = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];

  constructor(private readonly id: string) {
    super();
  }

  getId(): string {
    return this.id;
  }

  getGameState(): GameState {
    return this.gameState;
  }

  getWinner(): Player | null {
    return this.winner;
  }

  getTurn(): Player {
    return this.turn;
  }

  addPlayer(): Player {
    if (this.gameState !== GameState.WAITING) {
      throw new Error("Game is already started");
    }

    const idx = this.numberOfPlayers;
    this.numberOfPlayers += 1;

    // start the game if it's second player
    if (this.numberOfPlayers === 2) {
      this.gameState = GameState.PLAYING;
      this.emit("start");
    }

    return idx;
  }

  chooseTile(player: Player, row: number, col: number) {
    if (player !== this.turn) {
      throw new Error("Not this player's turn");
    }

    if (this.boardState[row][col] === undefined) {
      throw new Error("Invalid tile address");
    }

    if (this.boardState[row][col] !== null) {
      throw new Error("Tile is already chosen");
    }

    this.boardState[row][col] = player;
    this.emit("tileChosen", { player, row, col });

    // toggle turn
    this.turn = this.turn === Player.PLAYER1 ? Player.PLAYER2 : Player.PLAYER1;

    const winner = this.checkWinner();
    if (winner !== null) {
      this.gameState = GameState.OVER;
      this.winner = winner;

      this.emit("over", winner);
    }
  }

  checkWinner(): Player | null {
    // check rows
    for (let row = 0; row < 3; row++) {
      if (
        this.boardState[row][0] === this.boardState[row][1] &&
        this.boardState[row][0] === this.boardState[row][2] &&
        this.boardState[row][0] !== null
      ) {
        return this.boardState[row][0];
      }
    }

    // check columns
    for (let col = 0; col < 3; col++) {
      if (
        this.boardState[0][col] === this.boardState[1][col] &&
        this.boardState[0][col] === this.boardState[2][col] &&
        this.boardState[0][col] !== null
      ) {
        return this.boardState[0][col];
      }
    }

    // check diagonals
    if (
      this.boardState[0][0] === this.boardState[1][1] &&
      this.boardState[0][0] === this.boardState[2][2] &&
      this.boardState[0][0] !== null
    ) {
      return this.boardState[0][0];
    }

    if (
      this.boardState[0][2] === this.boardState[1][1] &&
      this.boardState[0][2] === this.boardState[2][0] &&
      this.boardState[0][2] !== null
    ) {
      return this.boardState[0][2];
    }

    return null;
  }
}
