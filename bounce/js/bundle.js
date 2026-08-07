class Tile {
	static isSolid(tile) {
		return ['B', 'F', 'D', 'P', 'O', '%', 'S', 'I', '#'].includes(tile);
	}

	static isPickable(tile) {
		return ['C', 'L', 'R','E', '+', '-', '=', '$', '0'].includes(tile);
	}

	static isLethal(tile) {
		return ['T', 'Y'].includes(tile);
	}
}

Tile.size = 45;
Tile.ballSize = 45;class Sprite {
	constructor(i, j, sw, sh) {
		this.size = 40;
		this.sw = sw || this.size;
		this.sh = sh || this.size;
		this.sx = i;
		this.sy = j;
		this.dw = this.sw * (Tile.size / this.size);
		this.dh = this.sh * (Tile.size / this.size);

		if (!Sprite.image) {
      		Sprite.image = new Image();
      		Sprite.image.src = 'bounce/assets/tile/spritesheet.png';
    	}
	}

	draw(ctx, x, y) {
		ctx.drawImage(Sprite.image, this.sx, this.sy, this.sw, this.sh, x, y, this.dw, this.dh);
	}
}class Input {
  constructor() {
    this.down = {};
    this.up = {};
    this.pressed = {};
    this.keys = {};
    this.keymap = {
      32: 'space',
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down'
    };

    for (let code in this.keymap) {
      const key = this.keymap[code];
      this.keys[key] = {
        hold: false,
        pulse: false
      };
    }

    window.addEventListener('keydown', this.handler.bind(this));
    window.addEventListener('keyup', this.handler.bind(this));
  }

  handler(e) {
    const key = this.keymap[e.which];
    if (!key) {
      return true;
    }

    e.preventDefault();

    if (e.type === 'keydown') {
      if (!this.pressed[key]) {
        this.pressed[key] = true;
        this.down[key] = true;
      }
    }

    if (e.type === 'keyup') {
      this.pressed[key] = false;
      this.up[key] = true;
    }

    return false;
  }

  update() {
    for (let code in this.keymap) {
      let key = this.keymap[code];
      let up = this.up[key];
      let down = this.down[key];

      this.keys[key].pulse = down;

      if (down && up) {
        this.keys[key].hold = true;
        this.down[key] = false;
      }

      if (down && !up) {
        this.keys[key].hold = true;
        this.down[key] = false;
      }

      if (!down && up) {
        this.keys[key].hold = false;
        this.up[key] = false;
      }
    }
  }

  clear() {
    for (let code in this.keymap) {
      let key = this.keymap[code];
      this.keys[key] = {
        hold: false,
        pulse: false
      };
    }
  }
}
class Entity {
	constructor(game, x, y) {
		this.game = game;
		this.x = x;
		this.y = y;
	}

	draw() { }

	update() { }

	kill() {
		return false;
	}

	getCorners() {
		const offset = 1;
		const xs = [this.x + offset, this.x + this.width - offset];
		const ys = [this.y, this.y + this.height - offset];

		const corners = [];
		for (let i = 0; i < ys.length; i++) {
			for (let j = 0; j < xs.length; j++) {
				corners.push([xs[j], ys[i]]);
			}
		}

		return corners;
	}

	getTouchedTiles() {
		const touchedTiles = [];
		const corners = this.getCorners();

		for(let i = 0; i < corners.length; i++) {
			touchedTiles.push({
				x: corners[i][0],
				y: corners[i][1],
				tile: this.game.level.getTile(corners[i][0], corners[i][1])
			});
		}

		return touchedTiles;
	}

	clipped(direction) {
		const tiles = this.getTouchedTiles();

		for (let i = 0; i < tiles.length; i++) {
			if (tiles[i].tile === 'P' || tiles[i].tile === 'O') {
				this.game.isBig = true;
			} else if (tiles[i].tile === 'D' || tiles[i].tile === '%') {
				this.game.isBig = false;
			} else if (tiles[i].tile === 'I') {
				this.game.canBounce = true;
			}
		}

		const mapping = {
			up: [tiles[0].tile, tiles[1].tile],
			down: [tiles[2].tile, tiles[3].tile],
			left: [tiles[0].tile, tiles[2].tile],
			right: [tiles[1].tile, tiles[3].tile]
		};

		if (this.game.isBig && this.game.floatUp && (mapping.up[0] === 'B' || mapping.up[1] === 'B')) {
			this.game.floatUp = false;
		} else if (!this.game.floatUp && (mapping.up[0] != 'B' && mapping.up[1] != 'B')) {
			this.game.floatUp = true; 
		}


		return mapping[direction].map(Tile.isSolid).reduce((acc, cur) => acc || cur);
	}

	static pointInRect(x, y, rect) {
		return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
	}

	pointCollison(x, y) {
		return Entity.pointInRect(x, y, this);
	} 

	hasCollided(entity) {
		return (this.x < entity.x + entity.width &&
			this.x + this.width > entity.x &&
			this.y < entity.y + entity.height &&
			this.y + this.height > entity.y);
	}
}class Enemy extends Entity {
	constructor(game, x, y, d, dist) {
		super(game, x, y);
		this.width = Tile.size * 2;
		this.height = Tile.size * 2;
		this.sprite = 'throne';
		this.vel = 1;
		this.directionY = 1;
		this.directionX = 1;
		this.sideways = d;
		if (this.sideways === 1) {
			this.distance = dist;
		} else {
			this.distance = 4;
		}
		this.orgY = this.y;
		this.orgX = this.x;
		this.destY = (this.y + Tile.size * this.distance);
		this.destX = (this.x + Tile.size * this.distance);
	}

	move() {
		if (!this.sideways) {
			if (this.y < this.destY && this.directionY === 1) {
				this.y += this.vel;
				if (this.y === this.destY) 
					this.directionY = 0;
			} else if (this.y > this.orgY && this.directionY === 0) {
				this.y -= this.vel;
				if (this.y === this.orgY)
					this.directionY = 1;
			}
		} else {
			if (this.x < this.destX && this.directionX === 1) {
				this.x += this.vel;
				if (this.x === this.destX) 
					this.directionX = 0;
			} else if (this.x > this.orgX && this.directionX === 0) {
				this.x -= this.vel;
				if (this.x === this.orgX)
					this.directionX = 1;
			}
		}
	}

	update() {
		this.move();
		for (let i = 0; i < this.game.level.entities.length; i++) {
			let entity = this.game.level.entities[i];
			if (entity instanceof Player) {
				if (this.hasCollided(entity)) {
					entity.kill();
					return;
				}
			}
		}
	}

	draw() {
		this.game.canvas.drawSprite(this.x, this.y, this.sprite);
	}
}class Player extends Entity {
	constructor(game, position) {
		super(game, position.x * Tile.ballSize, position.y * Tile.ballSize);
		this.width = Tile.ballSize;
		this.height = Tile.ballSize;
		this.direction = 1;
		this.velY = 0;
		this.isJumping = false;
		this.t = 0;
		this.dead = false;
		this.passedAllRings = false;
		this.sprite = 'ball';
	}

	update() {
		const { keys } = this.game.input;
		const vel = 7;

		if (this.game.isBig === true) {
			this.sprite = 'bigball';
			// Tile.ballSize = 54;
			this.width = Tile.ballSize;
			this.height = Tile.ballSize;
		} else {
			this.sprite = 'ball';
			Tile.ballSize = Tile.size;
			this.width = Tile.ballSize;
			this.height = Tile.ballSize;
		}

		if(keys.up.hold) {
			if(!this.isJumping && this.canJump()) {
				this.t = 5;
          		this.isJumping = true;
          		this.velY = vel;
          		
          		if (!this.game.canBounce) {
          			if (this.game.isBig) {
          				this.jumpGoal = this.y - 6.6 * Tile.ballSize;
          			} else {
          				this.jumpGoal = this.y - 4.4 * Tile.ballSize;	
          			}
          		} else {
          			this.jumpGoal = this.y - 9 * Tile.ballSize;
          		}
			}
		}

		if (!this.isJumping && !this.canJump()) {
			this.y += this.velY;
			this.velY += 0.2;
			
			if(this.velY >= vel) {
				this.velY = vel;
			}

			this.adjustFall();
		}

		if (this.isJumping) {
			this.y -= this.velY;
			this.velY -= 0.01;
			
			if(this.y <= this.jumpGoal) {
				this.game.canBounce = false;
				this.y = this.jumpGoal;
				this.isJumping = false;
				this.velY = 0;
			}

			this.adjustJump();
		}

		if(keys.right.hold) {
			this.x += vel;
			this.direction = -1;
			this.adjustWalk('right');
		}

		if(keys.left.hold) {
			this.x -= vel;
			this.direction = -1;
			this.adjustWalk('left');
		}

		this.touchTiles();
	}

	canJump() {
		this.y++;
		const ret = this.clipped('down');
		this.y--;
		return ret;
	}

	adjustWalk(direction) {
		if(this.clipped(direction)) {
			if(direction === 'left') {
				this.x += this.width - 1;
			}
			this.x = Tile.ballSize * Math.floor(this.x / Tile.ballSize);
			if(direction === 'right') {
				return (this.x += Tile.ballSize - this.width);
			}
		} else {
			if(this.canJump()) {
				this.t++;
			}
		}
	}

	adjustJump() {
		if(this.clipped('up')) {
			this.y += Tile.ballSize;
			this.y = Tile.ballSize * Math.floor(this.y / Tile.ballSize);
			this.isJumping = false;
			this.velY = 0;
			this.game.canBounce = false;
		}
	}

	adjustFall() {
		if(this.clipped('down')) {
			this.y = Tile.ballSize * Math.floor(this.y / Tile.ballSize);
		}
	}

	draw() {
		this.game.canvas.drawSprite(this.x, this.y, this.sprite);
	}

	respawn() {
		this.dead = false;
		this.x = this.game.checkpoint.x;
		this.y = this.game.checkpoint.y;
		if (this.game.checkpoint.big === true) {
			this.game.isBig = true;
		} else {
			this.game.isBig = false;
		}
		this.game.canvas.drawSprite(this.x, this.y, this.sprite);
		this.game.canvas.setScroll(this.x);
	}
	
	touchTiles() {
		const tiles = this.getTouchedTiles();
		for (let tile of tiles) {
			if (Tile.isLethal(tile.tile)) {
				this.kill();
				return;
			}
			
			if (Tile.isPickable(tile.tile)) {
				if (tile.tile === 'C') {
					this.game.score += 500;
					this.game.level.clearTile(tile.x, tile.y, 'A');
					this.game.checkpoint = {x: tile.x, y: tile.y, big: this.game.isBig};
				}

				if (tile.tile === 'L') {
					this.game.lives++;
					this.game.score += 1000;
					this.game.level.clearTile(tile.x, tile.y);
				}

				if (tile.tile === 'R' || tile.tile === '+' || tile.tile === 'E' || tile.tile === '-') {
					this.game.score += 250;
					this.game.level.ringsCollected++;
					if (tile.tile === 'R') {
						this.game.level.clearTile(tile.x, tile.y, 'Q');
						this.game.level.clearTile(tile.x, tile.y + Tile.size, '*');
					} else if (tile.tile === '+') {
						this.game.level.clearTile(tile.x, tile.y - Tile.size, 'Q');
						this.game.level.clearTile(tile.x, tile.y, '*');
					} else if (tile.tile === 'E') {
						this.game.level.clearTile(tile.x, tile.y, 'W');
						this.game.level.clearTile(tile.x + Tile.size, tile.y, '*');
					} else if (tile.tile === '-') {
						this.game.level.clearTile(tile.x - Tile.size, tile.y, 'W');
						this.game.level.clearTile(tile.x, tile.y, '*');
					} else {
						return;
					}
				}

				if ((tile.tile === '=' || tile.tile === '$') && this.passedAllRings === true) {
					this.game.score += (1000 + this.game.lives * 500);

					if (this.game.lives >= 3 && this.passedAllRings) {
						this.game.stars = 3;
					} else if (this.game.lives >= 2 && this.game.score >= 4000) {
						this.game.stars = 2;
					} else {
						this.game.stars = 1;
					}

					if (this.game.gameData[this.game.currentLevel].stars < this.game.stars) {
						this.game.gameData[this.game.currentLevel].stars = this.game.stars;
					} 

					if (this.game.currentLevel < this.game.lastLevel - 1) {
						this.game.gameData[this.game.currentLevel + 1].locked = false;
					}

					this.game.saveGameData();
					this.game.levelComplete = true;
				}
				
				if (tile.tile === '0' && this.game.isBig === true) {
					if (this.y < tile.y && this.game.floatUp === true) {
						this.y -= 4;
					} else if (this.game.floatUp === false) {
						this.y = tile.y - Tile.size;
					}
				}
			}
		}
	}

	kill() {
		if(!this.dead) {
			this.dead = true;
			this.game.lives--;
			if (this.game.currentLevel === 2) {
				this.game.isBig = true;
				this.game.checkpoint.big = true;
			} else {
				this.game.isBig = false;
				this.game.checkpoint.big = false;
			}
			this.respawn();
		}
	}
}class Canvas {
	constructor(containerId, options) {
		this.canvas = document.createElement('canvas');
		this.container = document.getElementById(containerId);
		this.options = options || {};
		this.canvas.width = this.options.width || 640;
		this.canvas.height = this.options.height || 360;
		this.container.appendChild(this.canvas);
		this.ctx = this.canvas.getContext('2d');

		this.gbarLife = new Image();
		this.gbarLife.src = 'bounce/assets/tile/gbar_life.png'
		this.gbarRing = new Image();
		this.gbarRing.src = 'bounce/assets/tile/gbar_ring.png'

		this.gbarCanvas = document.createElement('canvas');
		this.canvas.insertAdjacentElement('afterend', this.gbarCanvas);
		this.gbarCtx = this.gbarCanvas.getContext('2d');
		this.gbarCanvas.width = 630;
		this.gbarCanvas.height = 40;
		this.gbarCanvas.classList.add('gbar');
		
		this.view = {
			x:0,
			y:0,
			width: this.canvas.width,
			height: this.canvas.height
		}; 

		this.sprites = {
			ball: new Sprite(99, 1), //small ball
			bigball: new Sprite(1, 1, 54, 54), //big ball
			throne: new Sprite(309 ,1, 80, 80), //throne enemy
			B: new Sprite(85, 165), //red wall block
			T: new Sprite(891, 1),  //throne
			Y: new Sprite(1, 165), //upside-down throne
			P: new Sprite(559, 1), //pumper
			O: new Sprite(601, 1), //upside-down pumper 
			S: new Sprite(517, 1), //power speed
			D: new Sprite(225, 1), //deflater
			'%': new Sprite(267, 1), //upside-down deflater 
			C: new Sprite(141, 1), //diamond checkpoint
			A: new Sprite(183, 1), //arrow checkpoint
			L: new Sprite(391, 1), //life
			pop: new Sprite(58, 1), //pop ball died
			Z: new Sprite(127, 165), //slanting block right
			V: new Sprite(169, 165), //upside-down slanting left
			X: new Sprite(211, 165), //slanting clock left
			N: new Sprite(253, 165), //upside-down slanting clock right
			I: new Sprite(43, 165), //bounce block
			G: new Sprite(1, 83, 80, 80), //gate closed
			'=': new Sprite(802, 83, 80, 80), //gate opened
			R: new Sprite(849, 1, 40, 80), //ring vertical
			E: new Sprite(767, 1, 80, 40), //ring horizontal
			Q: new Sprite(725, 1, 40, 80), //ring collected vertical
			W: new Sprite(643, 1, 80, 40), //ring collected horizontal
			'0': new Sprite(295, 165), //water
			'6': new Sprite(475, 1), //power jump
			'7': new Sprite(433, 1), //power gravity
		};
	}

	setScroll(dx, dy) {
		this.view.x = dx;
		this.view.y = dy;
	}

	drawTile(tile, i, j) {
		let x = i * Tile.size;
		let y = j * Tile.size;
		
		if (this.sprites[tile]) {

			this.drawSprite(x, y, tile);
			return;
		}

		this.ctx.fillStyle = '#E6F1E2';

		if (tile === '-' || tile === '+' || tile === '#' || tile === '*' || tile === '$') {
			return;
		} else {
			this.ctx.fillRect(x - this.view.x, y - this.view.y, Tile.size, Tile.size);
		}
	}

	drawSprite(x, y, sprite) {
		this.sprites[sprite].draw(this.ctx, x - this.view.x, y - this.view.y);
	}

	clear() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}class LevelMap {
	constructor(level) {
		this.maps = [
			{
				player: {
					x: 2,
					y: 1
				},
				tiles: [
					'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
					'BB   BBBBBB          BBB         BB         BBB                  BBB      BB  L   BB               BB         BB',
					'BB   BBBBBB          BBB         R          BB                    BB      BB      BB               BB         BB',
					'BB   BBBBBB   BB     BBB         +          BB         C          BB  BB  BB  BB  BB  BB           BB         BB',
					'BB   BBBBBB   BB     BBB  BBBB  BBBB  BBBB  BB                    BB  BB  BB  BB  BB  BB       BBE-BBE-BB     BB',
					'BB       R    BB          BB     BB     BB                            BB  R   BB  R   BB    BBTBB  C   BBTBB  G#',
					'BB       +    BB T        BB  T     T   BB        T  T   T   T        BB  +   BB  +   BB    BBBBB      BBBBB  ##',
					'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'
				],
				rings : 6
			},
			{
				player: {
					x: 9,
					y: 15
				},
				tiles: [
					'                                                                                                              BBBBBBBBBBBBBBBBBBBBBBBB',
					'                                                                                                              BBC                   BB',
					'                                                                                                              BB          R         BB',
					'                                                                                                              BB          +         BB',
					'                                                                                                              BBBBBBBBBBBBBB        BB',
					'                                                                                                              BB                    G#',
					'                                                                                                              BB                    ##',
					'                                                                                                              BB   BBBBBBBBBBBBBBBBBBB',
					'                                                                                                              BB                    BB',
					'                                                                                                              BB                    BB',
					'                                                                                                              BBBB      BB  BB      BB',
					'                                                                                                              BBC      BB    BB     BB',
					'                                                                                                              BB      BB      BB    BB',
					'                                                                                                              BB     BB   T    BB   BB',
					'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBE-BB',
					'BB                    R   BB      BB     R                        BB        C           BB         BB         R   BB         BB     BB',
					'BB                    +   BB      BB     +                        BB                    BB         BB         +   BB         BB     BB',
					'BB             BBBBBBBBB  BB  BB         BBBBB                    BB        XZ          BB         R          BB  BB    BB   BB  BBBBB',
					'BB             BB     BB  BB  BB         BBBBB                    BB       XBBZ         BB         +          BB  BB  BBBB          BB',
					'BB             BB L           BB         BBBBB                    R       XBBBBZ        R          BB         BB      L BB          BB',
					'BB           T BB             BBP        BBBBB                    +      XBBBBBBZ       +          BB         BB        BB        T BB',
					'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBDDDDDDDDDBBBBBBBBBBBBBBBBBBBBBBBB'
				],
				rings: 8,
				enemies: [
					{
						x: 2,
						y: 15,
						d: 0
					},
					{
						x: 4,
						y: 15,
						d: 0
					},
					{
						x: 49,
						y: 15,
						d: 0
					},
					{
						x: 55,
						y: 15,
						d: 0
					},
					{
						x: 61,
						y: 15,
						d: 0
					},
					{
						x: 93,
						y: 15,
						d: 0
					}
				]
			},
			{
				player:  {
					x: 52,
					y: 2
				},
				tiles: [
					'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
					'BBY Y   L BBC                             VBBB            R      BBBN    VBBBBBBBN         C         %%                           L BB',
					'BB        BB                               VBB            +      BBN      VBBBBBN                               BB  BB              BB',
					'BB        BBZ        XBB                    R             XZ     R             R                                          BB        BB',
					'BB        BBBZ      XBBB                    +            XBB     +             +                                  BB            BB  BB',
					'BB        BBBBZ    XBBBB                   XBB          XBG#     BBZ      XBBBBBZ     XBBZ      XBBBBBBBBBBBBBBB       BB      BB   BB',
					'BB        BBBBBZ  XBBBBB                  XBBB         XBB##     BBBZ    XBBBBBBBZ   XBBBB000000BBBBBBBBBBBBBBBB          BBTT    T BB',
					'BBBBB     BBBBBBE-BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB0000BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
					'BB                             BB    BB             Y     Y   VBBBBBBNY VBBBBBBBBBBBBBBBBBB0000BB             BB                      ',
					'BB                             BB    BB                        VBBBBN    VBBBBBBBBBBBBBBBBB0000BB  BB 0  BB   BB                      ',
					'BB    BB                       R     R                          VBBB      BBBBBBBBBBBBBBBBB0000BB     0       BB                      ',
					'BB    Y   BB0000000000BBBB     +     +      BBZ                  VBB      BBBBBBBBBBBBBBBBB0000BB    00  000  BB                      ',
					'BB        BBB00000000BBBBB     BB    BB     BBBZ                          BBBBBBBBBBBBBBBBB0000BB BB     0 0  BB                      ',
					'BB        BBBB000000BBBBBB     BB    BBT   TBBBBZ      S                  BBBBBBBBBBBBBBBBB0000BB        0 0  BB                      ',
					'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB    BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBZ     BBBBBBBBBBBBBBBBB0000BB     BB      BB                      ',
					'                      BB                    BB                    BBB     BBBBBBBBBBBBBBBBB0000BBBZ      XBBBBBB                      ',
					'                      BB                    BB                    BBB     BBBBBBBBBBBBBBBBB0000BBBN       BBBBBB                      ',
					'                      BBDD                  BB                    BBB     BBBBBBBBBBBBBBBBB0000BBN        VBBBBB                      ',
					'                      BBIIIIIIIIIIIIIIII    BB                    BBB     BBBBBBBBBBBBBBBBB0000BBZ         VBBBB                      ',
					'                      BBC                   BB                    BBB     BBBBBBBBBBBBBBBBB0000BBBZ         VBBB                      ',
					'                      BB                    BB                    BBB     BBBBBBBBBBBBBBBBB0000BBBBZ         VBB                      ',
					'                      BBBBBBBBBBBBBBBBBBBBBBBB                    BBB     BBBBBBBBBBBBBBBBB0000BBBBB         XBB                      ',
					'                                                                  BBB C   BBBBBBBBBBBBBBBBB0000BBBBBBZ      XBBB                      ',
					'                                                                  BBB     BBBBBBBBBBBBBBBBB0000BBBBBBN      VBBB                      ',
					'                                                                  BBB     BBBBBBBBBBBBBBBBB0000BBBBBN        VBB                      ',
					'                                                                  BBB C   BBBBBBBBBBBBBBBBB0000BBBBN         XBB                      ',
					'                                                                  BBB     BBBBBBBBBBBBBBBBB0000BBBN         XBBB                      ',
					'                                                                  BBB C   BBBBBBBBBBBBBBBBB0000BBN         XBBBB                      ',
					'                                                                  BBB     BBBBBBBBBBBBBBBBB0000BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
					'                                                                  BBB     BBBBBBBBBBBBBBBBB0000BB             BB                    BB',
					'                                                                  BBB     BBBBBBBBBBBBBBBBB0000BB             BB                 C  BB',
					'                                                                  BBB     BBBBBBBBBBBBBBBBB0000BB             BB                    BB',
					'                                                                  BBB     BBBBBBBBBBBBBBBBB0000BBBBBBBBBBBBBBBBB                    BB',
					'                                                                  BBB     R00000000000000000000000000000000000R           T         BB',
					'                                                                  BBB     +00000000000000000000000000000000000+           BB      P BB',
					'                                                                  BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'
				],
				rings: 9,
				enemies: [
					{
						x: 28,
						y: 1,
						d: 0
					},
					{
						x: 30,
						y: 1,
						d: 0
					},
					{
						x: 32,
						y: 1,
						d: 0
					},
					{
						x: 34,
						y: 1,
						d: 0
					},
					{
						x: 36,
						y: 1,
						d: 0
					},
					{
						x: 38,
						y: 1,
						d: 0
					},
					{
						x: 26,
						y: 8,
						d: 0
					},
					{
						x: 100,
						y: 16,
						d: 0
					},
					{
						x: 102,
						y: 16,
						d: 0
					},
					{
						x: 104,
						y: 16,
						d: 0
					},
					{
						x: 116,
						y: 29,
						d: 0
					},
					{
						x: 98,
						y: 29,
						d: 1,
						dist: 10
					}
				]
			},
			{
				player: {
					x: 99,
					y: 22
				},
				// player: {
				// 	x: 59,
				// 	y: 15
				// },
				tiles: [
					'                      BBBBBBBBBBBBBBBBBBBBBBBB                                                                                        ',
					'                      BBBBN              BBBBB                                                                                        ',
					'                      BBBB               BBBBB                                                                                        ',
					'                      BBG#               BBBBB                                                                                        ',
					'                      BB##               BBBBB                                                                                        ',
					'                      BBBBZ              BBBBB                                                                                        ',
					'                      BBBBBBBBBBBB          BB                                                                                        ',
					'                      BBBBBBBBBBBB          BB                                                                                        ',
					'                      BB    C               BB                                                                                        ',
					'                      BB                    BB                                                                                        ',
					'                      BB                    BB                                                                                        ',
					'                      BB                    BB                                                                                        ',
					'                      BB              T     BB                                                                                        ',
					'                      BB              BBIIIIBB                                                                                        ',
					'BBBBBBBBBBBBBBBBBBBBBBBB                    BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB                      ',
					'BBL                                                     R                 R    R                R             BB                      ',
					'BB                                                      +                 +    +                +             BB                      ',
					'BBE-                         XIIIIZ                  BBZ  XBB             VBBBBN        BB                    BB                      ',
					'BBC                   BBBBBBBBBBBBBZ              X  BBBZXBBB  Z           VBBN         BB      BB    BB  C   BB                      ',
					'BB                    BBBBBBBBBBBBBBZ            XB  BBBBBBBB  BZ     XT Z      XT Z    BB      BB    BB      BB                      ',
					'BB                    BBBBBBBBBBBBBBBZ          XBB  BB    BB  BBZ   XBBBBZ T  XBBBBZ   BB  T   BB    BB  DD  BB                      ',
					'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB    BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
					'                      BB    BB        BB                                               VBBBB  BBBN    VBBB  BBBBC                 C BB',
					'                      BB L  BB        BB                                                BBBB  BBN      VBB  BBBB                    BB',
					'                      BB    BB        BB    BB                       II  II    II  II   BBBB  BN  XBBZ  VB  BBBBBBBB          BBBBBBBB',
					'                      BB    BB        BB    BB    X    Z X   Z        IIII  C   IIII    BBBB  N  XBBBBZ  V  BBBBBBBN          VBBBBBBB',
					'                      BB                    BB   XB    BZB   BZ       IIII      IIII            XBBBBBBZ          R            R  O BB',
					'                      BB                    BB     IIII   III         IIIIIIIIIIIIII           XBBBBBBBBZ         +            +  P BB',
					'                      BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'

				],
				rings: 7,
				enemies: [
					{
						x: 5,
						y: 19,
						d: 1,
						dist: 15
					},
					{
						x: 51,
						y: 15,
						d: 0
					},
					{
						x: 61,
						y: 15,
						d: 0
					},
					{
						x: 92,
						y: 22,
						d: 0
					},
					{
						x: 106,
						y: 22,
						d: 0
					},
					{
						x: 118,
						y: 22,
						d: 0
					},
					{
						x: 106,
						y: 22,
						d: 0
					},
					{
						x: 122,
						y: 22,
						d: 0
					},
					{
						x: 31,
						y: 22,
						d: 0
					},
					{
						x: 33,
						y: 22,
						d: 0
					},
					{
						x: 35,
						y: 22,
						d: 0
					}
				]
			}
		];

		return this.maps[level];
	}
}class Level {
	constructor(game, n) {
		this.game = game;
		this.game.currentLevel = n;
		this.map = new LevelMap(n);
		this.tiles = [];
		this.entities = [];
		this.ringsCollected = 0;
		if (this.game.currentLevel === 2) {
			this.game.isBig = true;
		}
		this.player = new Player(this.game, this.map.player);
		this.entities.push(this.player);
		this.game.checkpoint = {x: this.map.player.x * Tile.size, y: this.map.player.y * Tile.size};
		if (this.map.enemies) {
      		for (let enemy of this.map.enemies) {
        		this.entities.push(new Enemy(this.game, enemy.x * Tile.size, enemy.y * Tile.size, enemy.d, enemy.dist));
      		}
    	}
	}

	getCoords(x, y) {
		const i = Math.floor(x / Tile.size);
		const j = Math.floor(y / Tile.size);
		return [i, j];
	}

	inBounds(i, j) {
		if (i < 0 || i >= this.map.tiles[0].length)
			return false;
		
		if (j < 0 || j >= this.map.tiles.length)
			return false;

		return true;
	}

	getTile(x, y) {
		const [i, j] = this.getCoords(x, y);

		if (!this.inBounds(i, j))
			return ' ';

		return this.map.tiles[j][i];
	}

	clearTile(x, y, z) {
		const [i, j] = this.getCoords(x, y);
		const k = z || ' ';

		if (this.inBounds(i, j)) {
			const line = this.map.tiles[j];
			this.map.tiles[j] = line.slice(0, +(i - 1) + 1 || undefined) + k + line.slice(i + 1);
		}
	}

	update() {
		this.entities.map(entity => entity.update());
	}

	showGbar() {
		const gbarCtx = this.game.canvas.gbarCtx;
		gbarCtx.clearRect(0, 0, 630, 40);
		gbarCtx.drawImage(this.game.canvas.gbarLife, 10, 5, 26, 26);
		gbarCtx.fillStyle = '#fff';
		gbarCtx.font = '26px GameFont';
		gbarCtx.textAlign = 'left';
		gbarCtx.fillText('X ' + this.game.lives, 42, 28);

		let ringX;
		for (let j = 0; j < (this.map.rings - Math.ceil(this.ringsCollected / 2)); j++) {
			ringX = 80 + (j * 15);
			gbarCtx.drawImage(this.game.canvas.gbarRing, ringX, 5, 11, 26);	
		}
		gbarCtx.textAlign = 'right';
		gbarCtx.fillText(this.game.score, 620, 28);

		gbarCtx.font = '18px GameFont';
		gbarCtx.fillText('LEVEL ' + (this.game.currentLevel + 1), 350, 24);
	}
	
	draw() {

		this.showGbar();

		let playerX = Math.floor(this.player.x);
		let playerY = Math.floor(this.player.y);
		let dx, dy;
		if (playerX <= 297) {
			dx = 0;
		}
		else if (playerX > (Tile.size * this.map.tiles[0].length - 342)) {
			dx = Tile.size * this.map.tiles[0].length - 640;
		} else {
			dx = this.player.x - 297;
		}

		if (playerY <= 157) {
			dy = 0;
		} else if(playerY > (Tile.size * this.map.tiles.length - 202)) {
			dy = Tile.size * this.map.tiles.length - 360;
		} else {
			dy = this.player.y - 157
		}
		

		this.game.canvas.setScroll(dx, dy);
		
		for (let j = 0; j < this.map.tiles.length; j++) {
			const line = this.map.tiles[j];
			for (let i = 0; i < line.length; i++) {
				const tile = line[i];
				this.drawTile(tile, i, j);

				if (tile === 'G') {
					if (Math.ceil(this.ringsCollected / 2) === this.map.rings) {
						let currentLine = this.map.tiles[j];
						let nextLine = this.map.tiles[j + 1];
						this.player.passedAllRings = true;
						currentLine = currentLine.slice(0, +(i - 1) + 1 || undefined) + '=' + line.slice(i + 1);
						currentLine = currentLine.slice(0, +(i) + 1 || undefined) + '$' + line.slice(i + 2);
						this.map.tiles[j] = currentLine;
						nextLine = nextLine.slice(0, +(i - 1) + 1 || undefined) + '$' + nextLine.slice(i + 1);
						nextLine = nextLine.slice(0, +(i) + 1 || undefined) + '$' + nextLine.slice(i + 2);
						this.map.tiles[j + 1] = nextLine;
					}
				}
			}
		}

		for (let entity of this.entities) {
			if (entity.dead) {
				let index = this.entities.indexOf(entity);
				this.entities.splice(index, 1);
			}
		}

		this.entities.map(entity => entity.draw());
	}

	drawTile(tile, i, j) {
		this.game.canvas.drawTile(tile, i, j);
	}
}class Game {
	constructor(containerId, options) {
		this.input;
		this.score;
		this.level;
		this.canvas;
		this.frame = 1;
		this.animator;
		this.lives = 3;
		this.restart = false;
		this.nextLevel = false;
		this.currentLevel = 0;
		this.lastLevel = 4;
		this.options = options;
		this.containerId = containerId;
		this.levelComplete = false;
		this.gameOver = false;
		this.gameWon = false;
		this.score = 0;
		this.stars = 0;
		this.checkpoint = {x: 0, y: 0, big: false};
		this.levelsCompleted = 0;
		this.isBig = false;
		this.canBounce = false;
		this.floatUp = true;
		this.inWater = false;
		this.gameData = this.readGameData();
		this.bg = new Image();
		this.bg.src = 'bounce/assets/bg/level-select.png';
		this.levelSelect();
	}

	loop() {
		if (this.update()) {
			this.render();
			this.animator = window.requestAnimationFrame(this.loop.bind(this));
		}
		console.log(this.currentLevel >= (this.lastLevel - 1));
	}

	update() {
		if (this.lives <= 0) {
			this.gameWon = false;
			this.isBig = false;
			this.end();
			window.cancelAnimationFrame(this.animator);
			return false;
		}

		if (this.levelComplete) {
			this.gameWon = true;
			this.isBig = false;
			this.passedAllRings = false;
			this.level.ringsCollected = 0;
			this.end();
			this.score = 0;
			this.lives = 3;
			window.cancelAnimationFrame(this.animator);
			return false;
		}

		if (this.nextLevel) {
			this.currentLevel++;
		}

		if (this.restart || this.nextLevel) {
			this.restart = false;
			this.nextLevel = false;
			this.gameWon = false;
			this.level = new Level(this, this.currentLevel);
			this.input.clear();
			this.frame = 1;
		}

		this.input.update();
		this.level.update();
		this.frame++;
		return true;
	}

	render() {
		this.level.draw();
	}

	readGameData() {
		let gameData;

		if (localStorage.getItem('gameData') === null) {
			gameData = [
				{
					locked: false,
					stars: 0
				},
				{
					locked: true,
					stars: 0
				},
				{
					locked: true,
					stars: 0
				},
				{
					locked: true,
					stars: 0
				}
			]
		} else {
			gameData = JSON.parse(localStorage.getItem('gameData'));
		}

		return gameData;
	}

	saveGameData() {
		localStorage.setItem('gameData', JSON.stringify(this.gameData));
	}

	initGameObjects(n) {
		this.input = new Input();
		this.canvas = new Canvas(this.containerId, this.options);
		this.level = new Level(this, n);
	}

	levelSelect() {
		this.currentLevel = 0;
		const self = this;
		const container = document.getElementById(self.containerId);
		const levelCanvas = document.createElement('canvas');
		const levelCtx = levelCanvas.getContext('2d');
		container.appendChild(levelCanvas);
		levelCanvas.classList.add('level-menu');
		const levelUnlocked = new Image();
		levelUnlocked.src = 'bounce/assets/tile/lselect_level.png';
		const levelLocked = new Image();
		levelLocked.src = 'bounce/assets/tile/lselect_level_locked.png';
		const lockIcon = new Image();
		lockIcon.src = 'bounce/assets/tile/lselect_keylock.png';
		const yellowStarIcon = new Image();
		yellowStarIcon.src = 'bounce/assets/tile/lselect_star.png';
		const greyStarIcon = new Image();
		greyStarIcon.src = 'bounce/assets/tile/lselect_star_grey.png';

		levelCanvas.width = 640;
		levelCanvas.height = 360

		setInterval(drawLevelScreen, 500);
		window.addEventListener('click', levelEventHandler);

		function drawLevelScreen() {
			levelCtx.drawImage(self.bg, 0, 0, 640, 360);
			levelCtx.fillStyle = '#fff';
			levelCtx.font = '70px GameFont';
			levelCtx.textAlign = 'center';
			let levelX;
			for (let i = 0; i < self.lastLevel; i++) {
				levelX = 120 + (i * 100);
				if (!self.gameData[i].locked) {
					levelCtx.drawImage(levelUnlocked, levelX, 100, 100, 100);	
					levelCtx.fillText(self.currentLevel + 1 + i, levelX + 50, 155);
					let smallStarX = 0;
					for (let j = 0; j < self.gameData[i].stars; j++) {
						smallStarX = levelX + 10 + (j * 30); 
						levelCtx.drawImage(yellowStarIcon, smallStarX, 170, 20, 20);
					}
					for (let k = self.gameData[i].stars; k < 3; k++) {
						smallStarX = levelX + 10 + (k * 30); 
						levelCtx.drawImage(greyStarIcon, smallStarX, 170, 20, 20);
					}
				} else {
					levelCtx.drawImage(levelLocked, levelX, 100, 100, 100);
					levelCtx.drawImage(lockIcon, levelX + 30, 125, 40, 50);
				}
			}
			levelCtx.font = '40px GameFont';
			levelCtx.fillText('SELECT LEVEL', 315, 290);
		}

		function levelEventHandler(e) {
			let rect = levelCanvas.getBoundingClientRect();
			// Scale click coords back into the canvas's native pixel space - on mobile
			// #gameArea is shrunk via CSS transform:scale, so rect.width no longer
			// equals the canvas's own width and a raw clientX-rect.left would read far
			// too small to ever cross the hardcoded hit-box thresholds below.
			let xVal = (e.clientX - rect.left) * (levelCanvas.width / rect.width);
			let yVal = (e.clientY - rect.top) * (levelCanvas.height / rect.height);
			if (xVal > 120 && xVal < 220 && yVal > 100 && yVal < 200) {
				if (!self.gameData[0].locked){
						self.frame = 1;
						self.score = 0;
						self.lives = 3;
						container.removeChild(levelCanvas);
						self.initGameObjects(0);
						self.loop();
						window.removeEventListener('click', levelEventHandler);
				}
			}

			if (xVal > 220 && xVal < 320 && yVal > 100 && yVal < 200) {
				if (!self.gameData[1].locked) {
					self.frame = 1;
						self.score = 0;
						self.lives = 3;
						container.removeChild(levelCanvas);
						self.initGameObjects(1);
						self.loop();
						window.removeEventListener('click', levelEventHandler);
				}
			}

			if (xVal > 320 && xVal < 420 && yVal > 100 && yVal < 200) {
				if (!self.gameData[2].locked) {
						self.frame = 1;
						self.score = 0;
						self.lives = 3;
						container.removeChild(levelCanvas);
						self.initGameObjects(2);
						self.loop();
						window.removeEventListener('click', levelEventHandler);
				}
			}

			if (xVal > 420 && xVal < 520 && yVal > 100 && yVal < 200) {
				if (!self.gameData[3].locked) {
						self.frame = 1;
						self.score = 0;
						self.lives = 3;
						container.removeChild(levelCanvas);
						self.initGameObjects(3);
						self.loop();
						window.removeEventListener('click', levelEventHandler);
				}
			}
		}
	}

	end() {
		const score = this.score;
		const lastLevel = this.lastLevel;
		const levelsCompleted = this.levelsCompleted;
		const gameWon = this.gameWon;
		const self = this;
		const container = document.getElementById(self.containerId);
		const endCanvas = document.createElement('canvas');
		self.canvas.canvas.insertAdjacentElement('afterend', endCanvas);
		const endCtx = endCanvas.getContext('2d');
		const crown = new Image();
		crown.src = 'bounce/assets/tile/crown.png';
		const failed = new Image();
		failed.src = 'bounce/assets/tile/failed_title.png';
		const yellowstar = new Image();
		yellowstar.src = 'bounce/assets/tile/star_yellow.png';
		const greystar = new Image();
		greystar.src = 'bounce/assets/tile/star_gray.png';
		const nextBtn = new Image();
		nextBtn.src = 'bounce/assets/tile/button_next.png'
		const retryBtnSmall = new Image();
		retryBtnSmall.src = 'bounce/assets/tile/small_button_retry.png'
		const retryBtnLarge = new Image();
		retryBtnLarge.src = 'bounce/assets/tile/button_retry.png'
		const menuBtn = new Image();
		menuBtn.src = 'bounce/assets/tile/button_menu.png'
		
		endCanvas.width = 480;
		endCanvas.height = 270;
		endCanvas.classList.add('game-finished');

		setInterval(drawEndScreen, 500);
		window.addEventListener('click', endScreenEventHandler);

		function drawEndScreen() {
			endCtx.fillStyle = '#fff';
			endCtx.fillRect(0, 0, 480, 270);
			endCtx.fillStyle = '#000';
			endCtx.lineWidth = 10;
			endCtx.strokeRect(0, 0, 480, 270);
			
			endCtx.font = '25px GameFont';
			endCtx.textAlign = 'center';

			let starX;
			let stars = self.gameData[self.currentLevel].stars;

			if (gameWon) {
				endCtx.drawImage(crown, 40, 60, 120, 60);
				endCtx.fillStyle = '#000';
				endCtx.fillText('LEVEL ' + (self.currentLevel + 1), 100, 150);
				endCtx.fillText('COMPLETE', 100, 175);
				endCtx.drawImage(nextBtn, 277, 185, 148, 50);
				endCtx.drawImage(retryBtnSmall, 217, 185, 50, 50);
				endCtx.drawImage(menuBtn, 157, 185, 50, 50);
				for (let j = 0; j < stars; j++) {
					starX = 295 + (j * 40);
					endCtx.drawImage(yellowstar, starX, 130);		
				}

				for (let i = stars; i < 3; i++) {
					starX = 295 + (i * 40);
					endCtx.drawImage(greystar, starX, 130);		
				}
			} else {
				endCtx.drawImage(failed, 40, 30, 120, 100);
				endCtx.fillStyle = '#000';
				endCtx.fillText('NICE TRY!', 100, 150);
				endCtx.fillText('LEVEL FAILED', 100, 175);
				endCtx.drawImage(retryBtnLarge, 277, 185, 148, 50);
				endCtx.drawImage(menuBtn, 217, 185, 50, 50);
				for (let i = 0; i < 3; i++) {
					starX = 295 + (i * 40);
					endCtx.drawImage(greystar, starX, 130);		
				}		
			}

			endCtx.fillStyle = 'red';
			endCtx.textAlign = 'right';
			endCtx.font = '50px GameFont';
			endCtx.fillText(score, 390, 110);
		}

		function endScreenEventHandler(e) {
			let rect = endCanvas.getBoundingClientRect();
			// Scale click coords back into the canvas's native pixel space - on mobile
			// #gameArea is shrunk via CSS transform:scale, so rect.width no longer
			// equals the canvas's own width and a raw clientX-rect.left would read far
			// too small to ever cross the hardcoded hit-box thresholds below.
			let xVal = (e.clientX - rect.left) * (endCanvas.width / rect.width);
			let yVal = (e.clientY - rect.top) * (endCanvas.height / rect.height);

			if (gameWon) {
				if (xVal > 277 && xVal < 425 && yVal > 185 && yVal < 235) {
					self.frame = 1;
					self.score = 0;
					self.lives = 3;
					if (self.currentLevel >= (self.lastLevel - 1)) {
						self.levelComplete = false;
						container.removeChild(endCanvas);
						container.removeChild(self.canvas.canvas);
						container.removeChild(self.canvas.gbarCanvas);
						window.removeEventListener('click', endScreenEventHandler);
						self.levelSelect();
					} else {
						self.nextLevel = true;
						self.levelComplete = false;
						container.removeChild(endCanvas);
						window.removeEventListener('click', endScreenEventHandler);
						self.loop();
					}
					
				}
				if (xVal > 217 && xVal < 267 && yVal > 185 && yVal < 235) {
					self.restart = true;
					self.lives = 3;
					self.score = 0;
					self.levelComplete = false;
					container.removeChild(endCanvas);
					window.removeEventListener('click', endScreenEventHandler);
					self.loop();
				}
				if (xVal > 157 && xVal < 207 && yVal > 185 && yVal < 235) {
					self.lives = 3;
					self.score = 0;
					self.levelComplete = false;
					container.removeChild(endCanvas);
					container.removeChild(self.canvas.canvas);
					container.removeChild(self.canvas.gbarCanvas);
					window.removeEventListener('click', endScreenEventHandler);
					self.levelSelect();
				}
			} else {
				if (xVal > 277 && xVal < 425 && yVal > 185 && yVal < 235) {
					self.restart = true;
					self.lives = 3;
					self.score = 0;
					container.removeChild(endCanvas);
					window.removeEventListener('click', endScreenEventHandler);
					self.loop();
				}

				if (xVal > 217 && xVal < 267 && yVal > 185 && yVal < 235) {
					container.removeChild(endCanvas);
					container.removeChild(self.canvas.canvas);
					container.removeChild(self.canvas.gbarCanvas);
					window.removeEventListener('click', endScreenEventHandler);
					self.levelSelect();
				}
			}
		}
	}
}let game = new Game('gameArea', {width: 640, height: 360});

window.addEventListener('keydown', (e) => {
	if (e.keyCode === 32 && game.gameOver) {
		const parentElement = document.getElementById(game.containerId);

		while (parentElement.firstChild) {
			parentElement.removeChild(parentElement.firstChild);
		}

		game = new Game('gameArea', {width: 640, height: 360});
	}
});