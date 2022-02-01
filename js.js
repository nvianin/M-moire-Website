let log = console.log;
Math.Clamp = (val, min, max) => {
    return Math.min(Math.max(val, min), max)
}
Math.DegToRad = (deg) => {
    return deg * .0174533;
}
let angle_input;
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
    angle_input = document.querySelector("#angle");
    angle_input.addEventListener("input", e => {
        /* log(angle_input.value) */
        document.angle = parseFloat(angle_input.value)
        canvas.style.transform = "rotate(" + document.angle + "deg)" /* +" translate(-50%, -50%)" */
    })

    canvas.onpointerdown = e => {
        canvas.style.cursor = "grabbing"
        mousedown = true;
        let m = rotateMouse()
        startPos.x = m.x - offset.x;
        startPos.y = m.y - offset.y;
    }
    canvas.onpointerup = e => {
        let m = rotateMouse()
        offset.x = m.x - startPos.x;
        offset.y = m.y - startPos.y;
        canvas.style.cursor = "grab"
        mousedown = false;
    }
    canvas.onmousemove = canvas.ontouchmove = e => {
        if (e.changedTouches) {
            log(e.changedTouches[0])
            mouseX = e.changedTouches[0].clientX;
            mouseY = e.changedTouches[0].clientY;
        } else {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }

        if (mousedown) {
            let m = rotateMouse()
            /* mouseX = rot_mouse.x
            mouseY = rot_mouse.y */

            for (let r of rooms) {
                r.offset.x = m.x - startPos.x;
                r.offset.y = m.y - startPos.y;
            }
            offset.x = m.x - startPos.x;
            offset.y = m.y - startPos.y;
        }
    }
    canvas.onpointer
}
let mouseX, mouseY
mouseX = mouseY = 0;
let render = () => {
    document.offset = offset;
    let toRemove = []
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    requestAnimationFrame(render);
    /* ctx.translate(offset.x, offset.y); */
    ctx.beginPath()
    ctx.fillStyle = "red"
    let m = rotateMouse()
    ctx.arc(m.x, m.y, 100, 0, Math.PI * 2);
    ctx.fill()

    ctx.scale(scale, scale);
    /* ctx.translate(-offset.x, -offset.y); */
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].cull()) rooms[i].draw(ctx);
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
window.onwheel = e => {
    /* scale = Math.Clamp(scale - e.deltaY * .0001, .4, 5) */
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
    /* log(direction) */
    document.angle = Math.Clamp(document.angle + direction.x * 2, -180, 180);
    canvas.style.transform = "rotate(" + document.angle + "deg)" /* +" translate(-50%, -50%)" */
    angle_input.value = document.angle;
}

function rotateVector(vec, angle) {
    return {
        x: Math.cos(angle) * vec.x - Math.sin(angle) * vec.y,
        y: Math.sin(angle) * vec.x + Math.cos(angle) * vec.y
    }
}

function rotateMouse() {
    let vec = {
        x: mouseX,
        y: mouseY
    }
    /* return vec */
    return rotateVector(vec, -Math.DegToRad(document.angle))
}