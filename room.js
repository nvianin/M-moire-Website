let lorem = `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`
/* lorem = "bonsoir, je m'appelle henry et j'aime les gauffres surtout si elles sont à l'envers!" */
let pushfails = 0;
let prevPushFails = -1;

let pullfails = 0;
let prevpullfails = -1;


class Room {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;

        this.offset = {
            x: 0,
            y: 0
        }
        this.scale = 1;

        this.width = w;
        this.height = h;

        this.points = [];

        this.updateText(lorem);
        this.textNeedsUpdate = true;
        /* this.angle = Math.random() * Math.PI * 2; */
        this.angle = 0;

        this.aabb = new AABB([this.x, this.y], [this.x + this.width, this.y + this.width])


        this.points.push({
            x: 0,
            y: 0
        });
        this.points.push({
            x: this.width,
            y: 0
        });
        this.points.push({
            x: this.width,
            y: this.height
        });
        this.points.push({
            x: 0,
            y: this.height
        });

        this.color = "black"


    }

    draw(ctx) {
        if (this.textNeedsUpdate) {
            this.updateText(this.text)
            this.textNeedsUpdate = false;
        }
        ctx.translate(this.offset.x, this.offset.y)
        ctx.rotate(this.angle)
        ctx.beginPath()
        ctx.strokeStyle = this.color;
        ctx.fillStyle = "white"
        ctx.moveTo(
            (this.points[0].x + this.x) * this.scale,
            (this.points[0].y + this.y) * this.scale
        );
        for (let point of this.points) {
            ctx.lineTo(
                (point.x + this.x) * this.scale,
                (point.y + this.y) * this.scale
            );
            ctx.stroke();
        }
        ctx.lineTo(
            (this.points[0].x + this.x) * this.scale,
            (this.points[0].y + this.y) * this.scale
        );
        ctx.closePath()
        ctx.lineWidth = 12 * this.scale;
        ctx.stroke();
        ctx.fill()
        ctx.fillStyle = "black"
        ctx.font = 14 * this.scale + "px Helvetica"
        let lineHeight = 2;
        for (let line of this.lines) {
            lineHeight += 20;
            ctx.fillText(line, (this.x + 4) * this.scale, (this.y + lineHeight) * this.scale);
        }
        ctx.resetTransform()

        /* return false */
        for (let room of rooms) {
            this.aabb = new AABB([this.x, this.y], [this.x + this.width, this.y + this.height])
            if (room != this && room.aabb.overlaps(this.aabb)) {
                if (!pushdone) {
                    pushfails++;
                    /* prevPushFails = pushfails; */
                    let speed = Math.abs(this.y - canvas.height / 2) * .1 + .1;
                    if (this.y > canvas.height / 2) {
                        this.y += Math.random() * speed;
                    } else {
                        this.y -= Math.random() * speed;
                    }
                    if (this.x > canvas.width / 2) {
                        this.x += Math.random() * speed;
                    } else {
                        this.x -= Math.random() * speed;
                    }
                } else {
                    this.color = "red"
                    this.fixed = true;
                }

            } else {
                if (pushdone && !this.fixed) {
                    pullfails++;
                    let speed = Math.abs(canvas.height / 2 - this.y) * .001 + .1;
                    if (this.y > canvas.height / 2) {
                        this.y -= Math.random() * speed;
                    } else {
                        this.y += Math.random() * speed;
                    }
                    if (this.x > canvas.width / 2) {
                        this.x -= Math.random() * speed;
                    } else {
                        this.x += Math.random() * speed;
                    }
                }
            }
        }
    }

    // aabb(other) {
    //     if ((this.x > other.x && this.x < other.x + other.width) ||
    //         (this.x + this.width > other.x && this.x + this.width < other.x + other.width)) {
    //         /* other.color = "maroon" */
    //         if ((this.y > other.y && this.y < other.y + other.height) ||
    //             (this.y + this.height > other.y && this.y + this.height < other.y + other.height)) {
    //             /* other.color = "green" */
    //             return true;
    //         }
    //     }
    //     return false;
    // }

    updateText(text) {
        this.text = text;
        this.lines = this.getText(ctx);
    }

    getText(ctx) {
        let t = this.text.split(" ");
        /* log(this.text.split(" ")) */
        let lines = []
        let line = ""
        let i = 0;
        for (let w of t) {
            line += " " + w;
            ctx.font = 14 * this.scale + "px Helvetica";
            if (ctx.measureText(line).width / this.scale >= this.width - 65 || i >= t.length - 1) {
                /* log(line) */
                lines.push(line);
                line = ""
            };
            i++
        }
        return lines
    }

    delete() {
        this.killed = true;
    }

    cull() {
        /* return strue; */
        let other = new Room(-offset.x, -offset.y, innerWidth * 1.5, innerHeight * 1.5)
        /* if (Math.abs((this.offset.x + this.offset.y) + (offset.x + offset.y)) < innerWidth * 2) {
            return true
        } else {
            ctx.moveTo(this.x, this.y)
            ctx.lineTo(offset.x, offset.y)
            ctx.stroke()
            return false
        } */
        return true;
        return this.aabb(other);
    }

    center() {
        return (this.points[0] + this.points[1] + this.points[2] + this.points[3] + this.points[4]) / 4
    }
    gatherPoints() {
        let points = []
        for (let p of this.points) {
            points.push([Math.round(p.x), Math.round(p.y)]);
        }
        /* points.push(0) */
        /* log(points) */
        return points
    }
}