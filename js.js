let log = console.log;
let polybool = document.polygonBoolean;
Math.Clamp = (val, min, max) => {
    return Math.min(Math.max(val, min), max)
}
Math.DegToRad = (deg) => {
    return deg * .0174533;
}

function distance(x, y, x1, y1) {
    var dx = x1 - x;
    var dy = y1 - y;
    return Math.sqrt(dx * dx + dy * dy);
}
Math.HALF_PI = Math.PI / 2;
Math.TWO_PI = Math.PI * 2;

let angle_input;
let canvas, ctx;
let rooms = []
let scale = .2;
document.angle = 0;
let debug = true;

noise.seed(Math.random())

let hatching;

let shape;
let shapeready = false;
let validPoints = []
let validPointsFound = false;

let text;
let textLoaded = false;
loadText()

let paper;
let paperSize = 800;

let tryspawn = () => {
    let p = new PoissonDiskSampling({
        shape: [innerWidth * 3, innerHeight * 3],
        minDistance: 300,
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
let getLongest = () => {
    return innerWidth > innerHeight ? innerWidth : innerHeight;
}
let longest = getLongest()

window.onload = () => {
    canvas = document.querySelector("canvas")
    ctx = canvas.getContext("2d");
    ctx.lineCap = "square"
    longest = getLongest();
    canvas.width = longest * (Math.HALF_PI);
    canvas.height = longest * (Math.HALF_PI);

    hatching = ctx.createPattern(document.querySelector("#hatching"), "repeat")
    paper = document.querySelector("#paper")
    paper.style.backgroundPosition = offset.x + "px " + offset.y + "px"
    paper.style.backgroundOrigin = (offset.x + innerWidth / 2) + "px " + (offset.y + innerHeight / 2) + "px"
    paper.style.backgroundSize = paperSize * scale + "px"

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
            mouseX = e.changedTouches[0].layerX;
            mouseY = e.changedTouches[0].layerY;
            clientMouseX = e.changedTouches[0].clientX;
            clientMouseY = e.changedTouches[0].clientY;
        } else {
            mouseX = e.layerX;
            mouseY = e.layerY;
            clientMouseX = e.clientX;
            clientMouseY = e.clientY;
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

        paper.style.backgroundPosition = offset.x + "px " + offset.y + "px"
        paper.style.backgroundOrigin = (offset.x) + "px " + (offset.y) + "px"
        /* log(paper.style.backgroundPosition) */

    }
}
let mouseX, mouseY
let clientMouseX, clientMouseY
let pushdone = false;
let pulldone = false;
mouseX = mouseY = 0;
clientMouseX = clientMouseY = 0
let frame = 0;
let render = () => {
    frame++
    if ((prevPushFails == pushfails || pushfails > 2500) && !pushdone) {
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
    let cursorColor = "red"
    if (shapeready && textLoaded) {
        ctx.strokeStyle = "black"
        /* log(shape) */
        /* for (let region of shape) { */
        ctx.translate(offset.x, offset.y)
        /* ctx.rotate(angle) */
        ctx.lineWidth = 54 * scale;
        for (let poly of shape) {
            /* log(poly) */
            /* ctx.strokeStyle = '#' + (Math.random().toString(16) + '00000').slice(2, 8) */
            ctx.beginPath();
            ctx.moveTo((poly[0][0]) * scale, (poly[0][1]) * scale)
            for (let point of poly) {
                /* log(point) */
                ctx.lineTo((point[0]) * scale, (point[1]) * scale);
            }
            ctx.lineTo((poly[0][0]) * scale, (poly[0][1]) * scale)
            ctx.closePath()
            ctx.strokeStyle = hatching
            ctx.stroke()
            ctx.fillStyle = "white"
            ctx.fill()
            let m = getWorldMouse()
        }
        ctx.resetTransform()
        if (validPointsFound) {
            displayValidPoints()
            printText()
        } else {
            testCollisions(ctx)
        }

        if (debug) {
            ctx.beginPath()
            let m = rotateMouse()
            m.x -= offset.x;
            m.y -= offset.y;
            m.x /= scale;
            m.y /= scale;
            /* log(m) */
            ctx.fillStyle = isLocationValid(m.x, m.y) ? "lime" : "red"
            /* log(m) */
            m = rotateMouse()
            ctx.arc(
                m.x,
                m.y,
                20, 0, Math.PI * 2
            );
            ctx.fill()
        }
        /* } */
    } /* else { */
    for (let i = 0; i < rooms.length; i++) {
        /* rooms[i].scale = scale;
        if (rooms[i].cull()) rooms[i].draw(ctx); */
    }
    /* } */

    document.offset = offset;
    let toRemove = []
    /* ctx.translate(offset.x, offset.y); */


    /* ctx.arc(
        m.x + (Math.PI / 2 * longest - longest) / 2,
        m.y + (Math.PI / 2 * longest - longest) / 2,
        100, 0, Math.PI * 2
    ); */
    // debug draw
    /* ctx.scale(scale, scale); */
    /* ctx.translate(-offset.x, -offset.y); */
    if (debug) {
        ctx.beginPath()
        ctx.fillStyle = "lime"
        ctx.arc(offset.x, offset.y, 10, 0, Math.PI * 2)
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
/* offset.x = 0;
offset.y = 0; */
window.onwheel = e => {
    scale = Math.Clamp(scale - e.deltaY * .001, .15, 5)
    log(scale)
    paper.style.backgroundSize = paperSize * scale + "px";
    /* for (let r of rooms) {
        r.scale = scale;
    } */
}
window.onresize = () => {
    longest = innerWidth > innerHeight ? innerWidth : innerHeight;
    canvas.width = longest * (Math.HALF_PI);
    canvas.height = longest * (Math.HALF_PI);
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

function getWorldPos(x, y) {
    x *= scale;
    y *= scale;
    x += offset.x
    y += offset.y

    return {
        x,
        y
    }
}

function getWorldMouse() {
    let m = rotateMouse();
    m = getWorldPos(m.x, m.y);
    m.x -= (longest * Math.HALF_PI - innerWidth) / 2 + offset.x
    m.y -= (longest * Math.HALF_PI - innerHeight) / 2 + offset.y
    /* if (Math.random() < .01) {
        log(m.x, m.y)
    } */
    m.x *= scale;
    m.y *= scale;

    /* 
     */
    return m;
}

function loadText() {
    fetch("./text.md").then(data => {
        data.text().then(data => {
            let split = data.split("    ");
            let filtered = []
            log(split.length)
            for (let part of split) {
                if (part.length > 0) {
                    filtered.push(part)
                }
            }
            /* for (let part of filtered) {
                log(part, part.length)
            } */
            textLoaded = true;
            log("text loaded")
            text = filtered;
        })
    })
}
let textPoints = []

function prepareText() {
    for (let i = 0; i < text.length; i++) {
        /* log(text[i]) */
        textPoints.push(validPoints[Math.floor(Math.random() * validPoints.length)])
    }
}

function printText() {
    ctx.fillStyle = "black"
    ctx.font = 20 * scale + "px Helvetica"
    ctx.measureText(text[i])
    for (let i = 0; i < text.length; i++) {
        ctx.fillText(
            text[i],
            textPoints[i].x * scale + offset.x,
            textPoints[i].y * scale + offset.y
        )
    }
}

function walls() {
    let regions = []
    let roompoints = []

    for (let r of rooms) {
        r = r.gatherPoints();
        regions = PolyBool.union({
            regions: [r]
        }, {
            regions: regions
        }).regions
    }

    regions = (PolyBool.union({
        regions: roompoints
    }, {
        regions: regions
    }).regions)
    log(regions)

    log(regions[0][0])
    regions = regions.map(r => r.map(p => worldNoise(p[0], p[1])))
    log(regions[0][0])
    shapeready = true;
    shape = regions;
}

function worldNoise(x, y) {
    let point = [x, y]
    let sc = .0004;
    point[0] += noise.simplex2(x * sc * .5, y * sc * .5) * 30
    point[1] += noise.simplex2(y * sc, x * sc) * 30
    return point
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

function transformPoly(poly, offset, scale, angle = 0) {
    let new_poly = []
    for (let p of poly) {
        let point = {
            x: (p.x + offset.x) * scale,
            y: (p.y + offset.y) * scale
        }
        new_poly.push(point)
    }
    return new_poly;
}

function isLocationValid(x, y) {
    let test = false;
    for (let poly of shape) {
        if (pointInPolygon([x, y], poly)) {
            test = true;
        };
    }
    return test;
}

function testCollisions(ctx) {
    let points = []
    for (x = 0; x < 100; x++) {
        for (y = 0; y < 100; y++) {
            /* let p = getWorldPos(x * innerWidth * .037, y * innerHeight * .04); */
            let p = {
                x: x * innerWidth * .037,
                y: y * innerHeight * .04
            }
            let noised = worldNoise(p.x, p.y)
            p.x = noised[0]
            p.y = noised[1]
            p.collision = false;
            points.push(p)
        }
    }
    /* log(points) */

    for (let i = 0; i < points.length; i++) {
        for (let poly of shape) {

            /* ctx.beginPath() */
            let test = pointInPolygon([points[i].x, points[i].y], poly);
            if (test) {
                points[i].collision = true;
            }
            /* ctx.fillStyle = test ? "lime" : "red" */
        }
    }

    /* let maxDist = (Math.sin(frame * .1) + 1) / 2 * 10; */
    let maxDist = 50;
    log(maxDist)
    for (let i = 0; i < points.length; i++) {
        let deactivated = true;
        if (points[i].collision == true) {
            deactivated = false;
            for (let j = 0; j < points.length; j++) {
                if (
                    points[j].collision == false &&
                    distance(points[i].x, points[i].y, points[j].x, points[j].y) < maxDist) {
                    deactivated = true;
                }
            }
        }
        if (!deactivated) validPoints.push(points[i])
    }
    displayValidPoints()

    prepareText()

    validPointsFound = true;

    /* if (debug) {
        validPoints = []
    } else {
        validPointsFound = true;
    } */


    /* ctx.fillStyle = "purple"
    ctx.arc(offset.x, offset.y, 10, 0, Math.TWO_PI);
    ctx.fill() */
}

function displayValidPoints() {
    for (let p of validPoints) {
        ctx.fillStyle = p.collision ? "lime" : "red";
        ctx.beginPath()
        p = getWorldPos(p.x, p.y);
        ctx.arc(p.x, p.y, 10 * scale, 0, Math.TWO_PI)
        /* ctx.closePath() */
        ctx.fill()
    }
}