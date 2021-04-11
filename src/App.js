import styled from 'styled-components';
import './App.css';
import { useEffect, useRef } from 'react';

const WIDTH = 375;
const HEIGHT = 667;
const ABILITY_MAX_LEVEL = 25;

function App() {
  const ctxRef = useRef();
  useEffect(() => {
    const ctx = ctxRef.current;
    if (ctx) {
      let keyboard = {
        up: false,
        down: false,
        left: false,
        right: false,
        fire: false,
      };
      let kb_upgrade = { atk: false, fireRate: false, speed: false };
      let isGameLoaded = false;
      // let stage = new Object();
      // WIDTH = parseInt(// $("#stage").css("width"));
      // HEIGHT = parseInt(// $("#stage").css("height"));

      // let canvas = // $("#canvas")[0];
      // canvas.width = WIDTH;
      // canvas.height = HEIGHT;
      // let ctx = // $("#canvas")[0].getContext('2d');

      let source_num = 0;
      //let count_killed_num = 0;
      let player_img = new Image();
      let bullet_img = new Image();
      let enemy_img = new Image();
      player_img.onload = function () {
        resourceLoaded();
      };
      bullet_img.onload = function () {
        resourceLoaded();
      };
      enemy_img.onload = function () {
        resourceLoaded();
      };
      player_img.src = `${process.env.PUBLIC_URL}/img/player.png`;
      bullet_img.src = `${process.env.PUBLIC_URL}/img/black_bullet.png`;
      enemy_img.src = `${process.env.PUBLIC_URL}/img/enemy.png`;

      let time = window.performance.now();

      function cal_overflow(obj_xy, obj_len, stage_len) {
        let max = stage_len - obj_len;
        if (obj_xy > max) {
          return max;
        } else if (obj_xy < 0) {
          return 0;
        } else return obj_xy;
      }

      function check_overflow(obj_xy, obj_len, stage_xy, stage_len) {
        let max = stage_xy + stage_len - obj_len;
        if (obj_xy > max) {
          return true;
        } else if (obj_xy < stage_xy) {
          return true;
        } else return false;
      }

      function cal_midPos_X(x, weapon_len, obj_len) {
        // cal_midPos_X only calculate x-axis
        return x + (obj_len - weapon_len) / 2;
      }

      function weapon_obj(width, height) {
        this.isFired = false;
        this.width = width;
        this.height = height;
        this.speed = 3.2;
        this.atk = 10;
        // this.speed = 3.5;
        // this.atk = 10;
        this.x = -100;
        this.y = -100;

        this.setAbility = function (atk_l) {
          this.speed = 3.8 + atk_l * 0.2;
          this.atk = 10 + atk_l * 5;
        };

        this.checkHit = function (enemy) {
          if (enemy.length !== undefined) {
            for (let i = 0; i < enemy.length; i++) {
              if (
                check_overflow(
                  this.x,
                  this.width,
                  enemy[i].x,
                  enemy[i].width
                ) === false &&
                enemy[i].isAlive === true
              ) {
                if (
                  check_overflow(
                    this.y,
                    this.height,
                    enemy[i].y,
                    enemy[i].height
                  ) === false
                ) {
                  this.isFired = false;
                  enemy[i].blood -= this.atk;
                  console.log('hello');
                  return;
                }
              }
            }
          } else if (enemy !== undefined) {
            //console.log(enemy.x + " " + enemy.width + "this.x=" + this.x);
            if (
              check_overflow(this.x, this.width, enemy.x, enemy.width) ===
                false &&
              enemy.isAlive === true
            ) {
              if (
                check_overflow(this.y, this.height, enemy.y, enemy.height) ===
                false
              ) {
                this.isFired = false;
                enemy.blood -= this.atk;
                console.log('hello');
                return;
              }
            }
          }
        };
      }

      function game_obj(obj_img, type, setAlive) {
        this.isAlive = setAlive;
        this.width = obj_img.width;
        this.height = obj_img.height;
        this.speed = 3.2;
        this.blood = 100;
        this.explosionAtk = 10;
        this.x = 200;
        this.y = 400;
        this.enemy = null;
        let fireRate = 1200; // 越低表示開火速度越快
        let fireLock = false;

        this.checkAtkByEnemy = function (enemy_bullets) {
          //TODO
        };
        switch (type) {
          case 'monster':
            this.speedY = 0;
            this.updatePos = function () {
              if (this.isAlive) {
                this.x -= this.speed;
                this.y += this.speedY;
                if (check_overflow(this.x, this.width, 0, WIDTH)) {
                  this.speed = this.speed * -1;
                }
                if (
                  check_overflow(this.y, this.height, -HEIGHT, HEIGHT + HEIGHT)
                ) {
                  this.isAlive = false;
                  this.enemy.blood -= this.explosionAtk;
                  // $("#life").text(this.enemy.blood);
                  console.log('this.enemy.blood :' + this.enemy.blood);
                }
                //console.log("enemy blood:" + this.blood);
                if (this.blood <= 0) {
                  this.isAlive = false;
                  this.enemy.count_killed();
                }
              }
            };
            break;
          default:
            this.bullet = Array(50);
            // atk_weight:10 , fireRate_weight:fireRate/(ability.fireRate_l * 0.4 + 0.96) ,speed_weight:0.2
            let ability = { atk_l: 0, fireRate_l: 0, speed_l: 0 }; //ability level
            this.level = 0;
            let up_point = 0;
            let count_killed_num = 0;
            let count_to_lvup = 0;
            let spd_add = 0;
            // $("#life").text(this.blood);
            // $("#lv").text(this.level);
            this.count_killed = function () {
              count_killed_num += 1;
              count_to_lvup += 1;
              if (count_to_lvup === this.level * 3 + 1) {
                count_to_lvup = 0;
                this.level += 1;
                up_point += 3;
                //this.updateVal();
                // $("#lv").text(this.level);
                // $("#up_val").text(up_point);
              }
              console.log(
                'player killed:' + count_killed_num + ', level:' + this.level
              );
            };
            for (let i = 0; i < this.bullet.length; i++) {
              this.bullet[i] = new weapon_obj(
                bullet_img.width,
                bullet_img.height
              );
            }
            this.updateVal = function () {
              // TODO: 顯示 level MAX
              // if (ability.atk_l < ABILITY_MAX_LEVEL) $("#atk_val").text("LV:" + ability.atk_l);
              // else $("#atk_val").text("LV:" + ability.atk_l + "(MAX)");
              // if (ability.speed_l < ABILITY_MAX_LEVEL) {
              //   $("#spd_val").text("LV:" + ability.speed_l);
              // } else $("#spd_val").text("LV:" + ability.speed_l + "(MAX)");
              // if (ability.fireRate_l < ABILITY_MAX_LEVEL) {
              //   $("#frr_val").text("LV:" + ability.fireRate_l);
              // } else $("#frr_val").text("LV:" + ability.fireRate_l + "(MAX)");
              // $("#up_val").text(up_point);
            };
            this.upgradeAbility = function (ability) {
              console.log(ability);
              console.log('before :' + up_point);
              //TODO
              if (up_point <= 0) return;

              switch (ability) {
                case 'atk':
                  if (ability.atk_l >= ABILITY_MAX_LEVEL) {
                    console.log('atk max!!!');
                    return;
                  }
                  ability.atk_l += 1;
                  console.log('atk upgrade!!!');
                  break;
                case 'frr':
                  if (ability.fireRate_l >= ABILITY_MAX_LEVEL) {
                    console.log('fireRate max!!!');
                    return;
                  }
                  ability.fireRate_l += 1;
                  console.log('fireRate upgrade!!!');
                  break;
                case 'spd':
                  if (ability.speed_l >= ABILITY_MAX_LEVEL) {
                    console.log('spd max!!!');
                    return;
                  }
                  ability.speed_l += 1;
                  //this.speed = 2.8 + (0.3 * ability.speed_l);
                  console.log('speed upgrade!!!');
                  break;
                default:
                  console.error('error value');
                  break;
              }
              up_point -= 1;
              console.log(ability);
              console.log(up_point);
              this.updateVal();
            };
            this.updatePos = function () {
              if (this.isAlive) {
                if (this.blood <= 0) {
                  this.isAlive = false;
                }
                if (keyboard.fire) {
                  //z
                  //TODO
                  if (fireLock === false) {
                    for (let i = 0; i < this.bullet.length; i++) {
                      if (this.bullet[i].isFired === false) {
                        fireLock = true;
                        this.bullet[i].isFired = true;
                        this.bullet[i].x = cal_midPos_X(
                          this.x,
                          this.bullet[i].width,
                          this.width
                        );
                        this.bullet[i].y = this.y;
                        this.bullet[i].setAbility(ability.atk_l);
                        break;
                      }
                    }
                    // TODO: 思考其他方案來改善
                    setTimeout(function () {
                      fireLock = false;
                    }, parseInt(fireRate / (ability.fireRate_l * 0.36 + 1)));
                  }
                }
                spd_add = 0.4 * ability.speed_l;
                if (keyboard.right) {
                  //right
                  this.x += this.speed + spd_add;
                }
                if (keyboard.left) {
                  //left
                  this.x -= this.speed + spd_add;
                }
                if (keyboard.up) {
                  //up
                  this.y -= this.speed + spd_add;
                }
                if (keyboard.down) {
                  //down
                  this.y += this.speed + spd_add;
                }

                this.x = cal_overflow(this.x, this.width, WIDTH);
                this.y = cal_overflow(this.y, this.height, HEIGHT);

                for (let i = 0; i < this.bullet.length; i++) {
                  //update bullets position and check overflow
                  if (this.bullet[i].isFired === true) {
                    //this.bullet[i].isFired = true;
                    //this.bullet[i].x = cal_midPos_X(this.x, this.bullet[i].width, this.width);
                    if (
                      check_overflow(
                        this.bullet[i].y,
                        this.bullet[i].height,
                        0,
                        HEIGHT
                      )
                    ) {
                      this.bullet[i].isFired = false;
                    }
                    this.bullet[i].y = this.bullet[i].y - this.bullet[i].speed;
                    this.bullet[i].checkHit(this.enemy);

                    //break;
                  }
                }
                //this.obj.css("left", this.x + "px");
                //this.obj.css("top", this.y + "px");
                //console.log("x:" + (this.x).toFixed(2));
              }
            };
            break;
        }
      }

      //let $player = // $("#player");
      //let speed = 10;
      // let stage = new Object();
      // let player = new game_obj("#player");
      //let player = new game_obj(img);
      let player;
      let enemy_num = 15;
      let enemy = new Array(enemy_num);

      function update() {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        if (player.isAlive) {
          ctx.drawImage(player_img, player.x, player.y);
          // ctx.save();
          // ctx.translate(player.x+40, player.y+40);
          // ctx.rotate(45*Math.PI/180);
          // ctx.drawImage(player_img, -40,-40);
          // ctx.restore();
        }
        enemy.forEach(function display(obj) {
          if (obj.isAlive) ctx.drawImage(enemy_img, obj.x, obj.y);
          // body...
        });
        // if (enemy.isAlive)
        //     ctx.drawImage(enemy_img, enemy.x, enemy.y);
        // else {
        //     if (window.performance.now() - time > 10000) {
        //         time = window.performance.now();
        //         enemy.isAlive = true;
        //         enemy.blood = 100;
        //     }
        // }
        for (let i = 0; i < player.bullet.length && player.isAlive; i++) {
          // if bullet is isFired , then display it.
          if (player.bullet[i].isFired === true) {
            ctx.drawImage(bullet_img, player.bullet[i].x, player.bullet[i].y);
          }
        }
      }

      document.body.onkeydown = function (e) {
        switch (e.code) {
          case 'ArrowRight': // right key
            keyboard.right = true;
            break;
          case 'ArrowLeft': // left key
            keyboard.left = true;
            break;
          case 'ArrowUp': // up key
            keyboard.up = true;
            break;
          case 'ArrowDown': // down key
            keyboard.down = true;
            break;
          case 'KeyZ': // z key
            keyboard.fire = true;
            break;
          case 'Digit1': // 1 key
            if (kb_upgrade.atk === false) {
              kb_upgrade.atk = true;
              player.upgradeAbility('atk');
              console.log('atk upgrade');
            }
            break;
          case 'Digit2': // 2 key
            if (kb_upgrade.fireRate === false) {
              kb_upgrade.fireRate = true;
              player.upgradeAbility('frr');
              console.log('fireRate upgrade');
            }
            break;
          case 'Digit3': // 3 key
            if (kb_upgrade.speed === false && isGameLoaded) {
              kb_upgrade.speed = true;
              player.upgradeAbility('spd');
              console.log('speed upgrade');
            }
            break;
          default:
            break;
        }
        console.log('keydown:' + e.code);
      };

      document.body.onkeyup = function (e) {
        switch (e.code) {
          case 'ArrowRight': // right key
            keyboard.right = false;
            break;
          case 'ArrowLeft': // left key
            keyboard.left = false;
            break;
          case 'ArrowUp': // up key
            keyboard.up = false;
            break;
          case 'ArrowDown': // down key
            keyboard.down = false;
            break;
          case 'KeyZ': // z key
            keyboard.fire = false;
            break;
          case 'Digit1': // 1 key
            kb_upgrade.atk = false;
            break;
          case 'Digit2': // 2 key
            kb_upgrade.fireRate = false;
            break;
          case 'Digit3': // 3 key
            kb_upgrade.speed = false;
            break;
          default:
            break;
        }
        console.log('keyup:' + e.code);
      };

      const geretateInt = 8000 / 20; //change it
      let count = 8000 / 20;

      function resourceLoaded() {
        source_num += 1;
        if (source_num === 3) {
          player = new game_obj(player_img, null, true);

          for (let i = 0; i < enemy.length; i++) {
            enemy[i] = new game_obj(enemy_img, 'monster', false);
            enemy[i].enemy = player;
          }
          // enemy = new game_obj(enemy_img, "monster", true);
          // enemy.y = 100;
          player.enemy = enemy;
          isGameLoaded = true;
          // enemy.enemy = player;
          setInterval(function () {
            count++;
            if (count >= geretateInt) {
              //geretate new enemy
              count = parseInt(player.level * 17.5);
              for (let i = 0, j = 0; i < enemy.length && j < 2; i++) {
                console.log('12313213133');
                if (enemy[i].isAlive === false) {
                  enemy[i].isAlive = true;
                  enemy[i].blood = 30 + 50 * player.level;
                  enemy[i].speed =
                    (0.03 + 0.03 * player.level + Math.random() / 2) *
                    (parseInt(Math.random() * 3) - 1);
                  enemy[i].speedY =
                    0.22 + 0.1 * player.level + Math.random() / 2;
                  enemy[i].y = -80 * (j + 1);
                  enemy[i].x = parseInt(Math.random() * 200 + j * 200);
                  //break;
                  j++;
                  console.log('j: ' + j);
                }
              }
            }
            // enemy.forEach(function init(obj) {
            //     if (obj.isAlive === false) {
            //         obj.isAlive = true;
            //         obj.blood = 30;
            //         obj.y = 0;
            //         obj.x = parseInt(Math.random() * 400);
            //         return;
            //     }
            // });
            // if (keyboard.right) { //right
            //     player.x += speed;
            // }
            // if (keyboard.left) { //left
            //     player.x -= speed;
            // }
            // if (keyboard.up) { //up
            //     player.y -= speed;
            // }
            // if (keyboard.down) { //down
            //     player.y += speed;
            // }
            // x = cal_overflow(x, player.width, WIDTH);
            // y = cal_overflow(y, player.height, HEIGHT);

            // $player.css("left", x + "px");
            // $player.css("top", y + "px");

            player.updatePos();
            enemy.forEach(function updatePos(obj) {
              obj.updatePos();
            });
            //enemy.updatePos();
            update();
          }, 20);
        }
      }
    }
  }, []);

  return (
    <Wrapper>
      <Canvas
        width={WIDTH}
        height={HEIGHT}
        ref={(ref) => (ctxRef.current = ref?.getContext('2d'))}
      />
    </Wrapper>
  );
}

export default App;

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
`;

const Canvas = styled.canvas`
  display: block;
  object-fit: contain;
  width: 100%;
  height: 100%;
`;
