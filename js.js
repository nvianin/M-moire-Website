let log = console.log;
let polybool = document.polygonBoolean;
Math.Clamp = (val, min, max) => {
    return Math.min(Math.max(val, min), max)
}
Math.DegToRad = (deg) => {
    return deg * .0174533;
}
let angle_input;
let canvas, ctx;
let rooms = []
let scale = .2;
document.angle = 0;

let shape;
let shapeready = false;

let tryspawn = () => {
    let p = new PoissonDiskSampling({
        shape: [innerWidth * 3, innerHeight * 3],
        minDistance: 500,
        maxDistance: 600,
        tries: 10
    })
    p = p.fill();
    log(p)
    for (let i = 0; i < p.length; i++) {
        let r = new Room(
            p[i][0],
            p[i][1] * 1,
            Math.random() * 200 + 250,
            Math.random() * 400 + 200
        );
        r.offset.x = offset.x;
        r.offset.y = offset.y;
        rooms.push(r)
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
    let longest = innerWidth > innerHeight ? innerWidth : innerHeight;
    canvas.width = longest * (Math.PI / 2);
    canvas.height = longest * (Math.PI / 2);

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
}
let mouseX, mouseY
let pushdone = false;
let pulldone = false;
mouseX = mouseY = 0;
let render = () => {
    if (prevPushFails == pushfails && !pushdone) {
        log("vertical push done")
        pushdone = true;
    } else if (prevpullfails == pullfails && !pulldone && pushdone) {
        log(prevpullfails, pullfails)
        log("vertical pull done");
        pulldone = true;
        solidifyWalls()
    }
    prevPushFails = pushfails;
    prevpullfails = pullfails;

    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    requestAnimationFrame(render);
    if (shapeready) {
        ctx.strokeStyle = "black"
        for (let poly of shape) {
            ctx.beginPath();
            for (let point of poly) {
                ctx.lineTo(point[0], point[1]);
            }
            ctx.stroke()
        }
    } else {
        log("preparing")
        for (let i = 0; i < rooms.length; i++) {
            rooms[i].scale = scale;
            if (rooms[i].cull()) rooms[i].draw(ctx);
        }
    }

    document.offset = offset;
    let toRemove = []
    /* ctx.translate(offset.x, offset.y); */
    /* ctx.beginPath()
    ctx.fillStyle = "red"
    let m = rotateMouse()
    ctx.arc(m.x, m.y, 100, 0, Math.PI * 2);
    ctx.fill() */
    // debug draw
    /* ctx.scale(scale, scale); */
    /* ctx.translate(-offset.x, -offset.y); */
    if (true) {
        ctx.beginPath()
        ctx.fillStyle = "green"
        ctx.arc(offset.x, offset.yo, 100, 0, Math.PI * 2)
        ctx.fill()
    }

}
let mousedown = false;
let startPos = {
    x: 0,
    y: 0
}
let offset = {
    x: 500,
    y: 750
}
window.onwheel = e => {
    scale = Math.Clamp(scale - e.deltaY * .001, .15, 5)
    log(scale)
    /* for (let r of rooms) {
        r.scale = scale;
    } */
}
window.onresize = () => {
    let longest = innerWidth > innerHeight ? innerWidth : innerHeight;
    canvas.width = longest * (Math.PI / 2);
    canvas.height = longest * (Math.PI / 2);
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

function loadText() {
    fetch("./text.md").then(data => {
        data.text().then(data => {
            return data;
        })
    })
}

function solidifyWalls() {
    let regions = []
    for (let r of rooms) {
        regions.push(r.gatherPoints())
    }
    log(regions)
    let result = PolyBool.union({
        regions: regions,
        inverted: false
    }, {
        regions: regions,
        inverted: false
    })
    log(result)
    shape = result.regions;
    shapeready = true;
}