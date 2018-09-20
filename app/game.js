const React = require("react");
const makeAlien = require("./makeAlien");

class Game extends React.Component {

    constructor(props) {
        super(props);
        this.missilesLeft = props.perfect * 3;
        this.bulletsLeft = props.bullets - this.missilesLeft;
        this.bombsLeft = 10;
        this.dogbots = 0;
        this.botmasters = 0;
        this.escaped = 0;
        this.rescued = 0;
        this.bulletCt = 0;
        this.aliens = [];
        this.guns = [];
        this.bombs = [];
        this.bullets = [];
        this.lastBullet = {};
        this.bulletSize = { width: 17, height: 20 };
        this.incoming = [];
        this.height = 600;
        this.start = Date.now();
        this.explosions = [];
        this.alienSpeed = 1 / 5;//pixels per millisecond??
        this.gunSize = { width: 30, height: 40 };
        this.alienSize = { width: 40, height: 40 };
        this.makeAlien = new makeAlien({ alienSpeed: this.alienSpeed, alienSize: this.alienSize.height, start: this.start });
        this.width = 400 - this.alienSize.width;
        this.pathLength = this.width * this.height / this.alienSize.width;
        this.lastFrame = 0;
        let cumulativeDelay = 0;
        for (var c = 0; c < 12; c++) {
            const someAliens = this.makeAlien.gimmeSome(cumulativeDelay, 5);

            this.aliens.push(...someAliens);
            cumulativeDelay += this.makeAlien.calculateTimeWidth(5) * 2.5;
        }

        this.state = { sprites: [], stats:this.makeScore() };

        this.makeGuns();

        requestAnimationFrame(this.animate);
    }

    makeGuns() {
        const y = this.height - this.gunSize.height;
        const deltaX = (400 - (5 * this.gunSize.width)) / 4 + this.gunSize.width;

        for (let ct = 0; ct < 5; ct++) {
            const x = ct * deltaX;
            this.guns.push({
                className: "fas fa-air-freshener", id: ct + "gun",
                centerLine: x + this.gunSize.width / 2,
                style: {
                    color: this.missilesLeft>0?"#FFCC44":"#FF4422",
                     top: y, left: x, fontSize: this.gunSize.height
                }
            });
        }
    }
    //fas fa-arrow-up == bullets
    //fas fa-bomb
    //fas fa-angry = angry face for game over
    //fas faykal = explosion
    animate = (timeElapsed) => {
        if (timeElapsed - this.lastFrame > 16) {

            const now = Date.now();

            this.aliens.forEach(a => this.calculatePosition(a, now));//use timelapsed

            this.aliens = this.aliens.filter(a => !a.complete);            

            this.bullets.forEach(b => {
                b.style = {
                    left: b.style.left,
                    top: b.style.top - b.speed * (timeElapsed - this.lastFrame)
                };
            });

            this.detectCollisions(timeElapsed);

            this.animateExplosions(timeElapsed);

            let sprites = this.aliens.filter(a => a.on);
            if(sprites.length===0){
                sprites.push({
                    className: "fas fa-angry", id: "gameOver",
                style: {
                     //top: 100 + 50* Math.cos(now/300),left:100+ 70*Math.sin(now/200), fontSize: 150
                     top:100,left:100,fontSize:125
                }
                });
            }
            sprites.push(...this.guns);

            this.bullets = this.bullets.filter(b => b.style.top > 0);

            sprites.push(...this.bullets);

            sprites.push(...this.explosions);

            this.setState((prev, props) => {
                return { sprites, bulletsLeft: this.bulletsLeft,
                    missilesLeft:this.missilesLeft, dogbots: this.dogbots, botmasters: this.botmasters,
                stats:this.makeScore() };
            });

            this.lastFrame = timeElapsed;
        }
        requestAnimationFrame(this.animate);
    }

    calculatePosition(alien, now) {

        if (alien.complete || alien.startAt > now) {
            alien.on = false;
            return;
        }

        const distanceTravelled = this.alienSpeed * (now - alien.startAt);

        if (distanceTravelled > this.pathLength) {
            alien.complete = true;
            alien.on = false;
            this.rescued+=alien.friend?1:0;
            this.escaped+=alien.friend?0:1;
            return;
        }

        alien.on = true;

        let opacity = (now - alien.startAt) / 1000;
        opacity = opacity > 1 ? 1 : opacity;

        const linesTravelled = Math.floor(distanceTravelled / this.width);

        const y = Math.floor(linesTravelled * this.alienSize.height);

        const odd = linesTravelled % 2 === 1;

        const x = Math.floor((odd ? this.width : 0) + (odd ? -1 : 1) * (distanceTravelled - linesTravelled * this.width));

        alien.style = {
            top: y,
            left: x,
            fontSize: this.alienSize.height,
            color: alien.className.indexOf("wolf") === -1 ? "#4f6" : "#DD3322",
            opacity: opacity
        };
    }

    makeScore = ()=>{
        return {
            aliensShot:this.dogbots,
            friendsShot:this.botmasters,
            aliensInvaded:this.escaped,
            friendsRescued:this.rescued,
            score:10*this.dogbots -4 * this.botmasters - 6 * this.escaped + 20 * this.rescued
        }
    }

    animateExplosions(timeElapsed) {
        this.explosions.forEach(e => {
            const newFontSize = e.style.fontSize + (timeElapsed - e.started) / 50;
            const rotate = (timeElapsed - e.started) / 5;
            e.style = {
                fontSize: newFontSize,
                top: e.startTop - (newFontSize - 40) / 2,
                left: e.startLeft - (newFontSize - 40) / 2,
                color: "#FFAA00",
                transform: "rotate(" + rotate + "deg)"
            }
        });
        this.explosions = this.explosions.filter(e => timeElapsed - e.started < 400);
    }

    detectCollisions(timeElapsed) {
        const bulletHit = [];
        const alienHit = [];
        const gunHit = [];
        this.bullets.forEach(b => {
            this.aliens.some(a => {
                if (!a.on || a.complete || (b.isMissile && a.friend)) {
                    return;
                }
                var rect1 = { x: a.style.left, y: a.style.top, width: this.alienSize.width, height: this.alienSize.height };
                var rect2 = { x: b.style.left, y: b.style.top, width: this.bulletSize.width, height: this.bulletSize.height };


                if (rect1.x < rect2.x + rect2.width &&
                    rect1.x + rect1.width > rect2.x &&
                    rect1.y < rect2.y + rect2.height &&
                    rect1.height + rect1.y > rect2.y) {
                    bulletHit.push(b);
                    alienHit.push(a);
                    return true;
                }

                return false;
            });
        });

        this.bullets = this.bullets.filter(b => !bulletHit.some(bh => bh === b));
        this.aliens = this.aliens.filter(a => !alienHit.some(ah => ah === a));

        this.explosions.push(...alienHit.map(exp => {

            if (exp.className.indexOf("android") !== -1) {
                this.botmasters++;
            }
            else {
                this.dogbots++;
            }
            //end use map reduce
            return {
                style: {
                    top: exp.style.top,
                    left: exp.style.left,
                    fontSize: this.alienSize.width,
                    color: "#FFAA00"
                },
                startTop: exp.style.top,
                startLeft: exp.style.left,//hack 10
                id: "explosion" + this.bulletCt++,
                started: timeElapsed,
                className: "fas fa-haykal"
            };
        }));
    }

    componentWillMount() {
        document.addEventListener("keyup", this.handleKeyPress);
    }


    componentWillUnmount() {
        document.removeEventListener("keyup", this.handleKeyPress);
    }

    handleKeyPress = (event) => {
        const asNumber = +event.key;
        if (!isNaN(asNumber) && asNumber && asNumber > 0 && asNumber < 6) {
            this.makeBullet(asNumber);
        }
    }

    makeBullet = (gunNumber) => {//what's the problem with using a prototype method anyway
        if (this.bulletsLeft < 1 && this.missilesLeft < 1) {
            return;
        }
        const now = Date.now();
        if (this.lastBullet.gunNumber && now - this.lastBullet.gunNumber < 100) {
            return;
        }
                
        if(this.missilesLeft>0){
            this.missilesLeft--;
        }
        else{
            this.bulletsLeft--;
        }
        if(this.missilesLeft==0){
            this.guns.length = 0;
            this.makeGuns();
        }
        this.lastBullet.gunNumber = now;
        let y = this.height - this.gunSize.height - this.bulletSize.height;

        this.bullets.push({
            id: this.bulletCt + "bullet",
            speed: 1,
            isMissile:this.missilesLeft>0,
            className: "fas fa-arrow-up", style: {
                top: this.height - this.gunSize.height - this.bulletSize.height,
                left: this.guns[gunNumber - 1].centerLine - (this.bulletSize.width / 2),
                fontSize: this.bulletSize.height,
                color: this.missilesLeft>0?"#33ffff": "#33ff99"
            }
        });

        this.bulletCt++;
    }


    render() {
        return (
            <div>
                <div className="playfield" tabIndex="0">
                    {this.state.sprites.map(s => {
                        return (<i key={s.id} className={"playfield__sprite " + s.className} style={s.style}></i>);
                    })}
<div className="scores">
<h1>{this.state.stats.score}</h1>
<h2>{this.state.stats.aliensShot} aliens shot</h2>
<h2>{this.state.stats.friendsShot} friends shot</h2>
<h2>{this.state.stats.aliensInvaded} aliens invaded</h2>
<h2>{this.state.stats.friendsRescued} friends rescued</h2>
</div>
                </div>
                
                <div className="stats">
                    {this.state.bulletsLeft} bullets, {this.state.missilesLeft} missiles
            </div>
            </div>
        );
    }
}

module.exports = Game;