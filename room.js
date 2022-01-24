let lorem = `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.

Why do we use it?
It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).`

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
        ctx.beginPath()
        ctx.strokeStyle = this.color;
        ctx.fillStyle = "white"
        ctx.moveTo(
            (this.points[0].x + this.offset.x) * this.scale,
            (this.points[0].y + this.offset.y) * this.scale
        );
        for (let point of this.points) {
            ctx.lineTo(
                (point.x + this.offset.x) * this.scale,
                (point.y + this.offset.y) * this.scale
            );
            ctx.stroke();
        }
        ctx.lineTo(
            (this.points[0].x + this.offset.x) * this.scale,
            (this.points[0].y + this.offset.y) * this.scale
        );
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.fill()
        ctx.font = "20px Helvetica"
        ctx.fillText(this.text, this.x + this.offset.x, this.y + this.offset.y);
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
}