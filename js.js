let canvas, ctx;

window.onload = () => {
    canvas = document.querySelector("canvas")
    ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let start = {
        x: 0,
        y: 0
    }
    for (var i = 0; i < 5; i++) {
        ctx.beginPath()
        ctx.strokeStyle = "black"
        start.x = Math.random() * window.innerWidth;
        start.y = Math.random() * window.innerHeight;
        ctx.moveTo(start.x, start.y);
        for (var j = 0; j < 3; j++) {
            ctx.lineTo(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
            ctx.stroke();
        }
        ctx.lineTo(start.x, start.y);
        ctx.stroke()
    }
}

let render = () => {
    requestAnimationFrame(render);
}