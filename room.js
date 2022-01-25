let lorem = `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`
/* lorem = "bonsoir, je m'appelle henry et j'aime les gauffres surtout si elles sont à l'envers!" */

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

        this.text = lorem;
        this.angle = Math.random() * Math.PI * 2;


        this.points.push({
            x: this.x,
            y: this.y
        });
        this.points.push({
            x: this.width + this.x,
            y: this.y
        });
        this.points.push({
            x: this.width + this.x,
            y: this.height + this.y
        });
        this.points.push({
            x: this.x,
            y: this.height + this.y
        });

        this.color = "black"


    }

    draw(ctx) {
        ctx.translate(this.offset.x, this.offset.y)
        ctx.rotate(this.angle)
        ctx.beginPath()
        ctx.strokeStyle = this.color;
        ctx.fillStyle = "white"
        ctx.moveTo(
            (this.points[0].x) * this.scale,
            (this.points[0].y) * this.scale
        );
        for (let point of this.points) {
            ctx.lineTo(
                (point.x) * this.scale,
                (point.y) * this.scale
            );
            ctx.stroke();
        }
        ctx.lineTo(
            (this.points[0].x) * this.scale,
            (this.points[0].y) * this.scale
        );
        ctx.closePath()
        ctx.lineWidth = 12;
        ctx.stroke();
        ctx.fill()
        ctx.fillStyle = "black"
        ctx.font = "14px Helvetica"
        let lines = this.getText(ctx);
        let lineHeight = 2;
        for (let line of lines) {
            lineHeight += 20;
            ctx.fillText(line, this.x + 4, this.y + lineHeight);
        }
        ctx.resetTransform()
    }

    aabb(other) {
        if ((this.x > other.x && this.x < other.x + other.width) ||
            (this.x + this.width > other.x && this.x + this.width < other.x + other.width)) {
            if ((this.y > other.y && this.y < other.y + other.height) ||
                (this.y + this.height > other.y && this.y + this.height < other.y + other.height)) {
                return true;
            }
        }
    }

    getText(ctx) {
        let t = this.text.split(" ");
        let length = ctx.measureText(this.text)
        /* log(this.text.split(" ")) */
        let lines = []
        let line = ""
        for (let w of t) {
            line += " " + w;
            if (ctx.measureText(line).width >= this.width - 60 || t.length <= 0) {
                /* log(line) */
                lines.push(line);
                line = ""
            };
        }
        return lines
    }

    delete() {
        this.killed = true;
    }
}