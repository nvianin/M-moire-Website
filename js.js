let log = console.log;
Math.Clamp = (val, min, max) => {
    return Math.min(Math.max(val, min), max)
}

let canvas, ctx;
let rooms = []
let scale = 1;
document.angle = 0;
let tryspawn = () => {
    for (let i = 0; i < 50; i++) {
        rooms.push(
            new Room(
                innerWidth * 3 * Math.random(),
                innerHeight * 3 * Math.random(),
                Math.random() * 500 + 250,
                Math.random() * 300 + 100
            ));
    }
    /* let toRemove = []
    for (let i = 0; i < rooms.length; i++) {
        for (let j = 0; j < rooms.length; j++) {
            if (rooms[i].aabb(rooms[j])) {
                toRemove.push(j)
                log("delete")
            }
        }
    }
    if (toRemove.length > 0) {
        for (let i of toRemove) {
            rooms.splice(i, 1)
        }
    } */
}

window.onload = () => {
    canvas = document.querySelector("canvas")
    ctx = canvas.getContext("2d");
    ctx.lineCap = "square"
    canvas.width = window.innerWidth * (Math.PI / 2);
    canvas.height = window.innerWidth * (Math.PI / 2);

    while (rooms.length < 11) {
        tryspawn()
    }
    log("done, ",
        rooms.length)


    render()
}
let render = () => {
    document.offset = offset;
    let toRemove = []
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    requestAnimationFrame(render);
    /* ctx.translate(offset.x, offset.y); */
    ctx.scale(scale, scale);
    /* ctx.translate(-offset.x, -offset.y); */
    for (let i = 0; i < rooms.length; i++) {
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
window.onpointerdown = e => {
    canvas.style.cursor = "grabbing"
    mousedown = true;
    startPos.x = e.clientX - offset.x;
    startPos.y = e.clientY - offset.y;
}
window.onpointerup = e => {
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
    scale = Math.Clamp(scale - e.deltaY * .0001, .4, 5)
    log(scale)
    /* for (let r of rooms) {
        r.scale = scale;
    } */
}
window.onresize = () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
}
window.onkeydown = e => {
    let direction = {
        x: 0,
        y: 0
    }
    log(e.key)
    switch (e.key) {
        case "ArrowUp":
            direction.y -= 1;
            break;
        case "ArrowDown":
            direction.y += 1;
            break;
        case "ArrowRight":
            direction.x += 1;
            break;
        case "ArrowLeft":
            direction.x -= 1;
            break;
    }
    log(direction)
    document.angle += direction.x * .04;
    canvas.style.transform = "rotate(" + document.angle + "rad)" /* +" translate(-50%, -50%)" */
}