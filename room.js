class Room {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;

        this.width = w;
        this.height = h;

        this.points = [];

        for (var i = 0; i < 5; i++) {
            let start = {};
            start.x = Math.random() * window.innerWidth;
            start.y = Math.random() * window.innerHeight;
            this.points.push({
                x: start.x,
                y: start.y
            });
            for (var j = 0; j < 3; j++) {
                this.points.push({
                    x: Math.random() * window.innerWidth * this.width + start.x,
                    y: Math.random() * window.innerHeight * this.width + start.y
                });
            }
        }

    }

    draw(ctx) {
        ctx.beginPath()
        ctx.strokeStyle = "black"
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let point of this.points) {
            ctx.lineTo(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
            ctx.stroke();
        }
        ctx.lineTo(this.points[0].x, this.points[0].y);
        ctx.stroke();
    }
}