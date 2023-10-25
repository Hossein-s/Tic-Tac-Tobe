import { Player } from "./Player";
import { TileState } from "./TileState";

export class BoardState {
  private state: Array<TileState[]> = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];

  chooseTile(state: Player, row: number, col: number) {
    if (this.state[row][col] === undefined) {
      throw new Error("Invalid tile address");
    }

    if (this.state[row][col] !== null) {
      throw new Error("Tile is already chosen");
    }

    this.state[row][col] = state;
  }

  checkWinner(): Player | null {
    // check rows
    for (let row = 0; row < 3; row++) {
      if (
        this.state[row][0] === this.state[row][1] &&
        this.state[row][0] === this.state[row][2] &&
        this.state[row][0] !== null
      ) {
        return this.state[row][0];
      }
    }

    // check columns
    for (let col = 0; col < 3; col++) {
      if (
        this.state[0][col] === this.state[1][col] &&
        this.state[0][col] === this.state[2][col] &&
        this.state[0][col] !== null
      ) {
        return this.state[0][col];
      }
    }

    // check diagonals
    if (
      this.state[0][0] === this.state[1][1] &&
      this.state[0][0] === this.state[2][2] &&
      this.state[0][0] !== null
    ) {
      return this.state[0][0];
    }

    if (
      this.state[0][2] === this.state[1][1] &&
      this.state[0][2] === this.state[2][0] &&
      this.state[0][2] !== null
    ) {
      return this.state[0][2];
    }

    return null;
  }
}
