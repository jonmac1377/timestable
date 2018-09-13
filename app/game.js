const React = require("react");

class Game extends React.Component {

    constructor(props) {
        super(props);

        this.aliens = [];
        this.guns = [];
        this.verts = [];
        this.height = 600;
        this.start = Date.now();
        this.alienSpeed = 1 / 5;//pixels per millisecond
        this.alienSize = 40;
        
        this.width = 400 - this.alienSize;
        this.pathLength = this.width * this.height / this.alienSize;

        for(var c=0;c<1000;c++){
            const delay = 60000 * Math.random();
            this.aliens.push(this.makeAlien(delay,c));
        }

        this.state = { sprites: [], verts: [] };

        requestAnimationFrame(this.animate);
    }

    makeAlien(delay, key)
    {
        return { startAt: this.start+ delay, complete: false, className: "fa-wolf-pack-battalion", id: key };
    }

    animate = () => {
        const now = Date.now();
        this.aliens.forEach(a => this.calculatePosition(a, now));
        //console.log(this.aliens);
        this.aliens = this.aliens.filter(a=>!a.complete);

        this.setState((prev, props) => {
            return { sprites: this.aliens };
        });

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
            return;
        }

        alien.on = true;

        const linesTravelled = Math.floor(distanceTravelled / this.width);

        const y = Math.floor(linesTravelled * this.alienSize);

        const odd = linesTravelled % 2 === 1;

        const x = Math.floor((odd ? this.width : 0) + (odd ? -1 : 1) * (distanceTravelled - linesTravelled * this.width));

        alien.style = { top: y, left: x, width: this.alienSize, height: this.alienSize, fontSize: this.alienSize };
    }


    render() {
        return (
            <div className="playfield">
                {this.state.sprites.map(s => {
                    return (<i key={s.id} className={"playfield__sprite fab " + s.className} style={s.style}></i>);
                })}

                {
                    this.state.verts.map(v => { return (<div className="playfield__vert" htmlStyle={v.style}></div>); })
                }
            </div>
        );
    }
}

module.exports = Game;