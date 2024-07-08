import { AcGameObject } from "./AcGameObject";
import { Wall } from "@/assets/script/Wall";
import { Snake } from "./Snake";

export class GameMap extends AcGameObject {
  constructor(ctx, parent) {
    super();

    this.ctx = ctx;
    this.parent = parent;
    this.L = 0;

    this.row = 13;
    this.col = 14;

    this.wall = [];
    this.inner_walls_count = 30;

    this.snakes = [
      new Snake({ id: 0, color: "#4876EC", r: this.row - 2, c: 1 }, this),
      new Snake({ id: 1, color: "#F94848", r: 1, c: this.col - 2 }, this),
    ];
  }
  check_connectivity(g, sx, sy, tx, ty) {
    if (sx == tx && sy == ty) return true;
    g[sx][sy] = true;

    let dx = [-1, 0, 1, 0];
    let dy = [0, 1, 0, -1];
    for (let i = 0; i < 4; i++) {
      let x = sx + dx[i];
      let y = sy + dy[i];
      if (!g[x][y] && this.check_connectivity(g, x, y, tx, ty)) return true;
    }
    return false;
  }

  create_wall() {
    const g = [];
    for (let r = 0; r < this.row; r++) {
      g[r] = [];
      for (let c = 0; c < this.col; c++) g[r][c] = false;
    }

    // 四周生成
    for (let r = 0; r < this.row; r++) g[r][0] = g[r][this.col - 1] = true;
    for (let c = 0; c < this.col; c++) g[0][c] = g[this.row - 1][c] = true;

    // 内部随机
    for (let i = 0; i < this.inner_walls_count / 2; i++) {
      for (let j = 0; j < 1000; j++) {
        let r = parseInt(Math.random() * this.row);
        let c = parseInt(Math.random() * this.col);
        if (
          g[r][c] ||
          g[this.row - 1 - r][this.col - 1 - c] ||
          (r == this.row - 2 && c == 1) ||
          (c == this.col - 2 && r == 1)
        )
          continue;

        g[r][c] = g[this.row - 1 - r][this.col - 1 - c] = true;
        break;
      }
    }

    const copy_g = JSON.parse(JSON.stringify(g));
    if (!this.check_connectivity(copy_g, this.row - 2, 1, 1, this.col - 2))
      return false;

    for (let r = 0; r < this.row; r++) {
      for (let c = 0; c < this.col; c++) {
        if (g[r][c] === true) this.wall.push(new Wall(r, c, this));
      }
    }
    return true;
  }

  add_listening_events() {
    this.ctx.canvas.focus();

    const [snake0, snake1] = this.snakes;
    this.ctx.canvas.addEventListener("keydown", (e) => {
      if (e.key === "w") {
        snake0.set_direction(0);
      } else if (e.key === "d") snake0.set_direction(1);
      else if (e.key === "s") snake0.set_direction(2);
      else if (e.key === "a") snake0.set_direction(3);
      else if (e.key === "ArrowUp") snake1.set_direction(0);
      else if (e.key === "ArrowRight") snake1.set_direction(1);
      else if (e.key === "ArrowDown") {
        snake1.set_direction(2);
      } else if (e.key === "ArrowLeft") snake1.set_direction(3);
    });
  }

  start() {
    for (let i = 0; i < 1000; i++) if (this.create_wall()) break;

    this.add_listening_events();
  }

  update_size() {
    this.L = parseInt(
      Math.min(
        this.parent.clientWidth / this.col,
        this.parent.clientHeight / this.row
      )
    );
    this.ctx.canvas.width = this.L * this.col;
    this.ctx.canvas.height = this.L * this.row;
  }

  check_ready() {
    for (const snake of this.snakes) {
      if (snake.status !== "idle") {
        return false;
      }
      if (snake.direction === -1) {
        return false;
      }
    }

    return true;
  }

  next_step() {
    for (const snake of this.snakes) {
      snake.next_step();
    }
  }

  update() {
    this.update_size();
    if (this.check_ready()) {
      this.next_step();
    }
    this.render();
  }

  render() {
    const even_color = "#AAD751";
    const odd_color = "#A2D048";
    for (let r = 0; r < this.row; r++) {
      for (let c = 0; c < this.col; c++) {
        if ((r + c) % 2 === 0) {
          this.ctx.fillStyle = even_color;
        } else {
          this.ctx.fillStyle = odd_color;
        }
        this.ctx.fillRect(this.L * c, this.L * r, this.L, this.L);
      }
    }
  }
}
