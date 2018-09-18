class makeAlien {

    constructor(props){
        this.start = props.start;
        this.alienSpeed = props.alienSpeed;
        this.alienSize = props.alienSize;
        this.counter = 0;
    }

    justOne(delay, icon)
    {
        const key = this.counter + "alien";
        this.counter++;
        return { startAt: this.start + delay, complete: false, className: "fab " + icon, id: key };
        
    }

    gimmeSome(delay, quantity){
        const delta = this.calculateTimeWidth(1) ;
        let result = [];
        for(let ct=0;ct<quantity;ct++){
            let icon = ct!==2?"fa-wolf-pack-battalion":"fa-android";
            result.push(this.justOne(delay + (delta * ct), icon));
        }
        return result;
    }

    calculateTimeWidth(quantity)
    {
       return quantity * (this.alienSize / this.alienSpeed) + (this.alienSize /2)
    }


}

module.exports = makeAlien;