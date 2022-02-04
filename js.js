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
        minDistance: 600,
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
    } else if ((prevpullfails == pullfails || pullfails > 3000) && !pulldone && pushdone) {
        log(prevpullfails, pullfails)
        log("vertical pull done");
        pulldone = true;
        /* solidifyWalls() */
        walls()
        /* dowallsbutitworks(); */
    } else if (!pulldone || !pushdone) {
        log(pushfails, pullfails)
    }
    prevPushFails = pushfails;
    prevpullfails = pullfails;

    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    requestAnimationFrame(render);
    if (shapeready) {
        ctx.strokeStyle = "black"
        /* log(shape) */
        /* for (let region of shape) { */
        for (let poly of shape) {
            /* log(poly) */
            /* ctx.strokeStyle = '#' + (Math.random().toString(16) + '00000').slice(2, 8) */
            ctx.beginPath();
            ctx.moveTo((poly[0][0] + offset.x) * scale, (poly[0][1] + offset.y) * scale)
            for (let point of poly) {
                /* log(point) */
                ctx.lineTo((point[0] + offset.x) * scale, (point[1] + offset.y) * scale);
            }
            ctx.lineTo((poly[0][0] + offset.x) * scale, (poly[0][1] + offset.y) * scale)
            ctx.closePath()
            ctx.stroke()
            ctx.fillStyle = "red"
            ctx.fill()
        }
        /* } */
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
    ctx.beginPath()
    ctx.fillStyle = "red"
    let m = rotateMouse()
    /* log(m) */
    ctx.arc(m.x, m.y, 100, 0, Math.PI * 2);
    ctx.fill()
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
    x: innerWidth / 2,
    y: 700
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

function walls() {
    let regions = []
    let roompoints = []

    for (let r of rooms) {
        roompoints.push(r.gatherPoints())
    }

    regions = (PolyBool.union({
        regions: roompoints
    }, {
        regions: regions
    }).regions)
    log(regions)

    shape = regions;
    shapeready = true;
}


function solidifyWalls() {
    let regions = []
    let result = []
    log(rooms.map(r => {
        r.gatherPoints()
    }))
    regions = fuse(
        rooms.map(r =>
            r.gatherPoints()
        ),
        rooms.map(r =>
            r.gatherPoints()
        )
    )
    /* for (let r of rooms) {
        let room = []
        for (let r2 of rooms) {
            let s = PolyBool.union({
                regions: [r2.gatherPoints()],
                inverted: false
            }, {
                regions: [r.gatherPoints()],
                inverted: false
            }).regions[0]
            if (s.length > 4) room.push(s);
        }
        regions.push(room)
    } */
    for (let region of regions) {
        /* log(region) */
        result = PolyBool.union({
            regions: result,
            inverted: false
        }, {
            regions: region,
            inverted: false
        }).regions
    }
    result = regions


    for (let r of result) {
        log(r);
    }

    log(regions)
    log(result)
    shape = result;
    shapeready = true;
}

function fuse(a, b) {
    let regions = []
    let fails = 0;
    for (let a1 of a) {
        let room = [a1]
        for (let b1 of b) {
            let s = PolyBool.union({
                regions: [a1],
                inverted: false
            }, {
                regions: [b1],
                inverted: false
            }).regions[0]
            if (s.length > 4) {
                room.push(s);
                fails++;
            }
        }
        regions.push(room)
    }
    log("regions:", regions)
    return fails > 0 ? fuse(regions, b) : regions;
}

function dowallsbutitworks() {
    let result = [rooms[0].gatherPoints()]
    for (let r of rooms) {
        result.push(PolyBool.union({
                regions: [r.gatherPoints()],
                inverted: false
            }, {
                regions: result,
                inverted: false
            }

        ).regions)
    }

    log(result)

    shape = result;
    shapeready = true;
}