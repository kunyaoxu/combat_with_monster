var keyboard = { up: false, down: false, left: false, right: false, fire: false };
var kb_upgrade = { atk: false, firerate: false, move: false };
var gameloaded = false;
var stage = new Object();
stage.width = parseInt($("#stage").css("width"));
stage.height = parseInt($("#stage").css("height"));

var canvas = $("#canvas")[0];
canvas.width = stage.width;
canvas.height = stage.height;
var ctx = $("#canvas")[0].getContext('2d');

var source_num = 0;
//var count_killed_num = 0;
var player_img = new Image();
var bullet_img = new Image();
var enemy_img = new Image();
player_img.onload = function() { resourceLoaded(); }
bullet_img.onload = function() { resourceLoaded(); }
enemy_img.onload = function() { resourceLoaded(); }
player_img.src = "img/player.png";
bullet_img.src = "img/black_bullet.png";
enemy_img.src = "img/enemy.png";

var time = window.performance.now();


function cal_overflow(obj_xy, obj_len, stage_len) {
    var max = stage_len - obj_len;
    if (obj_xy > max) {
        return max;
    } else if (obj_xy < 0) {
        return 0;
    } else
        return obj_xy;
}

function check_overflow(obj_xy, obj_len, stage_xy, stage_len) {
    var max = stage_xy + stage_len - obj_len;
    if (obj_xy > max) {
        return true;
    } else if (obj_xy < stage_xy) {
        return true;
    } else
        return false;
}

function cal_midPos_X(x, weapon_len, obj_len) { // cal_midPos_X only calculate x-axis
    return x + ((obj_len - weapon_len) / 2);
}

function openfire() {

}

function rm_bullet() {
    //$( "div" ).remove(".bullets");
}

function weapon_obj(width, height) {
    this.fired = false;
    this.width = width;
    this.height = height;
    this.speed = 3.2;
    this.atk = 10;
    // this.speed = 3.5;
    // this.atk = 10;
    this.x = -100;
    this.y = -100;

    this.setAblity = function(atk_l) {
        this.speed = 3.8 + (atk_l * 0.2);
        this.atk = 10 + (atk_l * 5);
    }

    this.checkHit = function(enemy) {
        if (enemy.length != undefined) {
            for (var i = 0; i < enemy.length; i++) {
                if (check_overflow(this.x, this.width, enemy[i].x, enemy[i].width) == false && enemy[i].isAlive == true) {
                    if (check_overflow(this.y, this.height, enemy[i].y, enemy[i].height) == false) {
                        this.fired = false;
                        enemy[i].blood -= this.atk;
                        console.log("hello");
                        return;
                    }
                }
            }
        } else if (enemy != undefined) {
            //console.log(enemy.x + " " + enemy.width + "this.x=" + this.x);
            if (check_overflow(this.x, this.width, enemy.x, enemy.width) == false && enemy.isAlive == true) {
                if (check_overflow(this.y, this.height, enemy.y, enemy.height) == false) {
                    this.fired = false;
                    enemy.blood -= this.atk;
                    console.log("hello");
                    return;
                }
            }
        }
    }

}



function game_obj(obj_img, type, setAlive) {
    //this.obj = $(obj_id);
    //this.width = parseInt($(this.obj).css("width"));
    // this.height = parseInt($(this.obj).css("height"));
    this.isAlive = setAlive;
    this.width = obj_img.width;
    this.height = obj_img.height;
    this.speed = 3.2;
    this.blood = 100;
    this.explosionAtk = 10;
    // this.x = parseInt($(this.obj).css("left"));
    // this.y = parseInt($(this.obj).css("top"));
    this.x = 200;
    this.y = 400;
    this.enemy = null;
    let firerate = 1200; //more lower , more firerate per second
    let fireon = false;

    this.checkAtkByEnemy = function(enemy_bullets) {
        //TODO
    }
    switch (type) {
        case "monster":
            this.speedY = 0;
            this.updatePos = function() {
                if (this.isAlive) {
                    this.x -= this.speed;
                    this.y += this.speedY;
                    if (check_overflow(this.x, this.width, 0, stage.width)) {
                        this.speed = this.speed * -1;
                    }
                    if (check_overflow(this.y, this.height, -stage.height, stage.height + stage.height)) {
                        this.isAlive = false;
                        this.enemy.blood -= this.explosionAtk;
                        $("#life").text(this.enemy.blood);
                        console.log("this.enemy.blood :" + this.enemy.blood);
                    }
                    //console.log("enemy blood:" + this.blood);
                    if (this.blood <= 0) {
                        this.isAlive = false;
                        this.enemy.count_killed();
                    }

                }
            }
            break;
        default:
            this.bullet = Array(50);
            // atk_weight:10 , firerate_weight:firerate/(abl.firerate_l * 0.4 + 0.96) ,speed_weight:0.2
            let abl = { atk_l: 0, firerate_l: 0, speed_l: 0 }; //ability level
            this.level = 0;
            let up_point = 0;
            let count_killed_num = 0;
            let count_to_lvup = 0;
            let spd_add = 0;
            $("#life").text(this.blood);
            $("#lv").text(this.level);
            this.count_killed = function() {
                count_killed_num += 1;
                count_to_lvup += 1;
                if (count_to_lvup == (this.level * 3 + 1)) {
                    count_to_lvup = 0;
                    this.level += 1;
                    up_point += 3;
                    //this.updateVal();
                    $("#lv").text(this.level);
                    $("#up_val").text(up_point);
                }
                console.log("player killed:" + count_killed_num + ", level:" + this.level);
            }
            for (var i = 0; i < this.bullet.length; i++) {
                this.bullet[i] = new weapon_obj(bullet_img.width, bullet_img.height);
            }
            this.updateVal = function() {
                // body...
                if (abl.atk_l < 25)
                    $("#atk_val").text("LV:" + abl.atk_l);
                else
                    $("#atk_val").text("LV:" + abl.atk_l + "(MAX)");

                if (abl.speed_l < 25) {
                    $("#spd_val").text("LV:" + abl.speed_l);
                } else
                    $("#spd_val").text("LV:" + abl.speed_l + "(MAX)");

                if (abl.firerate_l < 25) {
                    $("#frr_val").text("LV:" + abl.firerate_l);
                } else
                    $("#frr_val").text("LV:" + abl.firerate_l + "(MAX)");

                $("#up_val").text(up_point);
            }
            this.upgradeAbl = function(ablity) {
                console.log(abl);
                console.log("before :" + up_point);
                //TODO
                if (up_point <= 0)
                    return;

                switch (ablity) {
                    case "atk":
                        if (abl.atk_l >= 25) {
                            console.log("atk max!!!");
                            return;
                        }
                        abl.atk_l += 1;
                        console.log("atk upgrade!!!");
                        //abl.atk_l += 1;

                        break;
                    case "frr":
                        if (abl.firerate_l >= 25) {
                            console.log("firerate max!!!");
                            return;
                        }
                        abl.firerate_l += 1;
                        console.log("firerate upgrade!!!");
                        break;
                    case "spd":
                        if (abl.speed_l >= 25) {
                            console.log("spd max!!!");
                            return;
                        }
                        abl.speed_l += 1;
                        //this.speed = 2.8 + (0.3 * abl.speed_l);
                        console.log("speed upgrade!!!");
                        break;
                }
                up_point -= 1;
                console.log(abl);
                console.log(up_point);
                this.updateVal();

            }
            this.updatePos = function() {
                if (this.isAlive) {
                    if (this.blood <= 0) {
                        this.isAlive = false;
                    }
                    if (keyboard.fire) { //z
                        //TODO
                        if (fireon == false) {
                            for (var i = 0; i < this.bullet.length; i++) {
                                if (this.bullet[i].fired == false) {
                                    fireon = true;
                                    this.bullet[i].fired = true;
                                    this.bullet[i].x = cal_midPos_X(this.x, this.bullet[i].width, this.width);
                                    this.bullet[i].y = this.y;
                                    this.bullet[i].setAblity(abl.atk_l);
                                    break;
                                }
                            }
                            setTimeout(function() { fireon = false; }, parseInt(firerate / (abl.firerate_l * 0.36 + 1)));
                        }
                    }
                    spd_add = (0.4 * abl.speed_l);
                    if (keyboard.right) { //right
                        this.x += (this.speed + spd_add);
                    }
                    if (keyboard.left) { //left
                        this.x -= (this.speed + spd_add);
                    }
                    if (keyboard.up) { //up
                        this.y -= (this.speed + spd_add);
                    }
                    if (keyboard.down) { //down
                        this.y += (this.speed + spd_add);
                    }

                    this.x = cal_overflow(this.x, this.width, stage.width);
                    this.y = cal_overflow(this.y, this.height, stage.height);

                    for (var i = 0; i < this.bullet.length; i++) { //update bullets position and check overflow
                        if (this.bullet[i].fired == true) {
                            //this.bullet[i].fired = true;
                            //this.bullet[i].x = cal_midPos_X(this.x, this.bullet[i].width, this.width);
                            if (check_overflow(this.bullet[i].y, this.bullet[i].height, 0, stage.height)) {
                                this.bullet[i].fired = false;
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
            }
            break;
    }

}



//var $player = $("#player");
//var speed = 10;
// var stage = new Object();
// var player = new game_obj("#player");
//var player = new game_obj(img);
var player;
var enemy_num = 15;
var enemy = new Array(enemy_num);

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (player.isAlive) {
        ctx.drawImage(player_img, player.x, player.y);
        // ctx.save();
        // ctx.translate(player.x+40, player.y+40);
        // ctx.rotate(45*Math.PI/180);
        // ctx.drawImage(player_img, -40,-40);
        // ctx.restore();
    }
    enemy.forEach(function display(obj) {
        if (obj.isAlive)
            ctx.drawImage(enemy_img, obj.x, obj.y);
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
    for (var i = 0; i < player.bullet.length && player.isAlive; i++) {
        // if bullet is fired , then display it.
        if (player.bullet[i].fired == true) {
            ctx.drawImage(bullet_img, player.bullet[i].x, player.bullet[i].y);
        }
    }
}

$("#page").keydown(function(e) {

    switch (e.keyCode) {
        case 68: //for d or right key
        case 39:
            keyboard.right = true;
            break;
        case 65: //for a or left key
        case 37:
            keyboard.left = true;
            break;
        case 87: //for w or up key
        case 38:
            keyboard.up = true;
            break;
        case 83: //for s or down key
        case 40:
            keyboard.down = true;
            break;
        case 90: //for z key
            keyboard.fire = true;
            break;
        case 49: //for 1 key
            if (kb_upgrade.atk == false && gameloaded) {
                kb_upgrade.atk = true;
                player.upgradeAbl("atk");
                console.log("atk upgrade");
            }
            break;
        case 50: //for 2 key
            if (kb_upgrade.firerate == false && gameloaded) {
                kb_upgrade.firerate = true;
                player.upgradeAbl("frr");
                console.log("firerate upgrade");
            }
            break;
        case 51: //for 3 key
            if (kb_upgrade.move == false && gameloaded) {
                kb_upgrade.move = true;
                player.upgradeAbl("spd");
                console.log("move upgrade");
            }
            break;
    }
    console.log("keydown:" + e.keyCode);
});

$("#page").keyup(function(e) {

    switch (e.keyCode) {
        case 68: //for d or right key
        case 39:
            keyboard.right = false;
            break;
        case 65: //for a or left key
        case 37:
            keyboard.left = false;
            break;
        case 87: //for w or up key
        case 38:
            keyboard.up = false;
            break;
        case 83: //for s or down key
        case 40:
            keyboard.down = false;
            break;
        case 90: //for z key
            keyboard.fire = false;
            break;
        case 49: //for 1 key
            kb_upgrade.atk = false;
            break;
        case 50: //for 1 key
            kb_upgrade.firerate = false;
            break;
        case 51: //for 1 key
            kb_upgrade.move = false;
            break;
    }
    console.log("keyup:" + e.keyCode);
});

const geretateInt = 8000 / 20; //change it
var count = 8000 / 20;

function resourceLoaded() {


    source_num += 1;
    if (source_num == 3) {
        player = new game_obj(player_img, null, true);

        for (var i = 0; i < enemy.length; i++) {
            enemy[i] = new game_obj(enemy_img, "monster", false);
            enemy[i].enemy = player;
        }
        // enemy = new game_obj(enemy_img, "monster", true);
        // enemy.y = 100;
        player.enemy = enemy;
        gameloaded = true;
        // enemy.enemy = player;
        setInterval(function() {
            count++;
            if (count >= geretateInt) { //geretate new enemy
                count = parseInt(player.level * 17.5);
                for (var i = 0, j = 0; i < enemy.length && j < 2; i++) {
                    console.log("12313213133");
                    if (enemy[i].isAlive == false) {
                        enemy[i].isAlive = true;
                        enemy[i].blood = 30 + (50 * player.level);
                        enemy[i].speed = (0.03 + (0.03 * player.level) + (Math.random() / 2)) * (parseInt(Math.random() * 3) - 1);
                        enemy[i].speedY = 0.22 + (0.1 * player.level) + (Math.random() / 2);
                        enemy[i].y = -80 * (j + 1);
                        enemy[i].x = parseInt(Math.random() * 200 + (j * 200));
                        //break;
                        j++;
                        console.log("j: " + j);
                    }
                }
            }
            // enemy.forEach(function init(obj) {
            //     if (obj.isAlive == false) {
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
            // x = cal_overflow(x, player.width, stage.width);
            // y = cal_overflow(y, player.height, stage.height);

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
