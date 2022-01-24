let log = console.log;
Math.Clamp = (val, min, max) => {
    return Math.min(Math.max(val, min), max)
}

let canvas, ctx;
let rooms = []
let scale = 1;

window.onload = () => {
    canvas = document.querySelector("canvas")
    ctx = canvas.getContext("2d");
    ctx.lineCap = "square"
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    for (let i = 0; i < 80; i++) {
        rooms.push(
            new Room(
                innerWidth * 3 * Math.random(),
                innerHeight * 3 * Math.random(),
                Math.random() * 300 + 100,
                Math.random() * 300 + 100
            ));
    }


    render()
}
let render = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    requestAnimationFrame(render);
    for (let i = 0; i < rooms.length; i++) {
        /* for (let j = 0; j < rooms.length; j++) {
            if (rooms[j].aabb(rooms[i])) {
                rooms[i].color = "red"
                rooms[j].color = "red"
            }
        } */
        rooms[i].draw(ctx);
    }
}
let mousedown = false;
let startPos = {
    x: 0,
    y: 0
}
let offset = {
    x: 0,
    y: 0
}
window.onmousedown = e => {
    canvas.style.cursor = "grabbing"
    mousedown = true;
    startPos.x = e.clientX - offset.x;
    startPos.y = e.clientY - offset.y;
}
window.onmouseup = e => {
    offset.x = e.clientX - startPos.x;
    offset.y = e.clientY - startPos.y;
    canvas.style.cursor = "grab"
    mousedown = false;
}
window.onmousemove = e => {
    if (mousedown) {
        for (let r of rooms) {
            r.offset.x = e.clientX - startPos.x;
            r.offset.y = e.clientY - startPos.y;
        }
    }
}
window.onwheel = e => {
    /*  scale = Math.Clamp(scale - e.deltaY * .0001, .4, 5)
     log(scale)
     for (let r of rooms) {
         r.scale = scale;
     } */
}
window.onresize = () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
}