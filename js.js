let canvas, ctx;
let rooms = []

window.onload = () => {
    canvas = document.querySelector("canvas")
    ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    for (let i = 0; i < 2; i++) {
        rooms.push(new Room(400 * Math.random(), 400 * Math.random(), Math.random() * 200, Math.random() * 200));
    }
}

let render = () => {
    requestAnimationFrame(render);
    for (room of rooms) {
        room.draw(ctx);
    }
}