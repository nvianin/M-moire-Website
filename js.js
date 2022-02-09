let log = console.log;
let polybool = document.polygonBoolean;
Math.Clamp = (val, min, max) => {
    return Math.min(Math.max(val, min), max)
}
Math.DegToRad = (deg) => {
    return deg * .0174533;
}
Math.Lerp = (start, end, amt) => {
    return (1 - amt) * start + amt * end
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
let debug = false;

let offset = {
    x: innerWidth / 2,
    y: 700
}
let offset_goal = {
    x: offset.x,
    y: offset.y
}
let current_goal = 0;
let attached_to_mouse = false;

noise.seed(Math.random())

let hatching;

let shape;
let shapeready = false;
let validPoints = []
let validPointsFound = false;

let text;
let textLoaded = false;

let paper;
let paperSize = 250;

let leftarrow, rightarrow;

let tryspawn = () => {
    let p = new PoissonDiskSampling({
        shape: [1333 * 3.2, 1333 * 3.2],
        minDistance: 400,
        maxDistance: 800,
        tries: 10
    })
    p = p.fill();
    log(p)
    for (let i = 0; i < p.length; i++) {
        let r = new Room(
            p[i][0],
            p[i][1] * 1,
            Math.random() * 450 + 250,
            Math.random() * 800 + 200
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
    loadText();

    leftarrow = document.querySelector("#left-arrow")
    rightarrow = document.querySelector("#right-arrow")

    leftarrow.onclick = () => {
        attached_to_mouse = false;
        if (current_goal > 0) {
            current_goal--;
        } else {
            current_goal = order.length - 1
        }
        let center = getTextBoxCenter(order[current_goal][0]);
        log(current_goal, center)
        offset_goal.x = -center.x * scale + longest / 2 * Math.HALF_PI;
        offset_goal.y = -center.y * scale + longest / 2 * Math.HALF_PI;
    }
    rightarrow.onclick = () => {
        attached_to_mouse = false;
        if (current_goal < order.length - 1) {
            current_goal++;
        } else {
            current_goal = 0;
        }
        let center = getTextBoxCenter(order[current_goal][0]);
        log(current_goal, center)
        offset_goal.x = -center.x * scale + longest / 2 * Math.HALF_PI;
        offset_goal.y = -center.y * scale + longest / 2 * Math.HALF_PI;
    }

    hatching = ctx.createPattern(document.querySelector("#hatching"), "repeat")
    paper = document.querySelector("#paper")
    paper.style.backgroundPosition = offset.x + "px " + offset.y + "px"
    /* paper.style.backgroundOrigin = (offset.x + longest / 2) + "px " + (offset.y + longest / 2) + "px" */
    paper.style.backgroundSize = paperSize * scale + "px"

    while (rooms.length < 11) {
        tryspawn()
    }
    log("done, ",
        rooms.length)
    render()
    angle_input = document.querySelector("#angle");
    angle_input.style.display = "none"
    angle_input.addEventListener("input", e => {
        /* log(angle_input.value) */
        document.angle = parseFloat(angle_input.value)
        canvas.style.transform = "rotate(" + document.angle + "deg)" /* +" translate(-50%, -50%)" */
    })

    canvas.onpointerdown = e => {
        canvas.style.cursor = "grabbing"
        mousedown = true;
        if (!attached_to_mouse) {
            attached_to_mouse = true;
        }
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
        /* paper.style.backgroundOrigin = (-offset.x) + "px " + (-offset.y) + "px" */
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

    if (distance(offset.x, offset.y, offset_goal.x, offset_goal.y) > 1 && !attached_to_mouse) {
        offset.x = Math.Lerp(offset.x, offset_goal.x, .1);
        offset.y = Math.Lerp(offset.y, offset_goal.y, .1);
        paper.style.backgroundPosition = offset.x + "px " + offset.y + "px"
    }

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
            if (debug) {
                displayValidPoints()
            }
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
    if (textBoxesInitialized) {
        /* fillTextBoxes() */
        fillTextChain()
        displaySpline()
        if (debug) {
            try {
                ctx.lineWidth = 5 * scale
                ctx.strokeStyle = "maroon"
                for (let l of links) {
                    /* log(l) */
                    ctx.beginPath()
                    ctx.moveTo(l[0][0] * scale + offset.x, l[0][1] * scale + offset.y);
                    ctx.lineTo(l[1][0] * scale + offset.x, l[1][1] * scale + offset.y);
                    ctx.closePath()
                    ctx.stroke()
                }
            } catch {}
            let i = 0;
            for (let box of textBoxes) {
                if (box[4]) {
                    ctx.strokeStyle = "blue"
                } else {
                    ctx.strokeStyle = "rgb(255,0," + i / textBoxes.length * 255 + ")"
                }
                ctx.beginPath();
                ctx.moveTo(box[0][0] * scale + offset.x, box[0][1] * scale + offset.y);
                ctx.lineTo(box[1][0] * scale + offset.x, box[1][1] * scale + offset.y);
                ctx.lineTo(box[2][0] * scale + offset.x, box[2][1] * scale + offset.y);
                ctx.lineTo(box[3][0] * scale + offset.x, box[3][1] * scale + offset.y);
                ctx.closePath()
                ctx.stroke()
                i++;
            }
        }
    }

}
let mousedown = false;
let startPos = {
    x: 0,
    y: 0
}
/* offset.x = 0;
offset.y = 0; */
window.onwheel = e => {
    scale = Math.Clamp(scale - e.deltaY * .001, .15, 5)
    log(scale)
    /* offset.x /= scale;
    offset.y /= scale; */
    paper.style.backgroundSize = paperSize * scale + "px";
    /* paper.style.backgroundOrigin = (-offset.x) + "px " + (-offset.y) + "px" */
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
            let split = data.split("***");
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
            let slicedText = []
            for (let i = 0; i < text.length; i++) {
                slicedText[i] = sliceLines(text[i], 200);
                /* log(slicedText[i]) */
            }
        })
    })
}
let textPoints = []
let borders = []

function prepareBorders() {

}

function prepareText() {
    log("preparing text")
    for (let i = 0; i < text.length; i++) {
        /* log(text[i]) */
        /* textPoints.push(validPoints[Math.floor(Math.random() * validPoints.length)]) */
        textPoints.push(validPoints[Math.floor(validPoints.length / text.length * i)])
        /* textBoxes.push(findValidArea()) */
        /* textPoints.push(findValidArea(200, 200)) */
    }
    findValidAreas()
}

function isAreaValid(_x, _y, width, height) {
    let res = 10;
    let valid = true;
    let max = {
        x: _x + width,
        y: _y + height
    }
    for (let x = _x; x < max.x; x += res) {
        if (valid) {
            for (let y = _y; y < max.y; y += res) {
                if (!isLocationValid(x, y)) {
                    valid = false;
                    break;
                }
            }
        }
    }
    return valid;
}

let textBoxes = []
let textBoxesInitialized = false;

// Needs to also check for previously allowed areas that are now blocked by text
function findValidArea(width, height, fails = 0) {
    let potentialSpot = validPoints[Math.floor(Math.random() * validPoints.length)]
    if (isAreaValid(potentialSpot.x, potentialSpot.y, width, height)) {
        return potentialSpot
    } else if (fails < 5) {
        fails++
        return findValidArea(width, height, fails);
    } else {
        return potentialSpot
    }
}

let order = []
let neighbourhood = []

function findValidAreas() {
    let i = 0;
    for (let p of validPoints) {
        let box = {
            w: 300,
            h: 250,
            x: p.x,
            y: p.y
        }
        let test = isAreaValid(box.x, box.y, box.w, box.h);

        let aabb = new AABB([box.x, box.y], [box.x + box.w, box.y + box.h]);
        for (let b of textBoxes) {
            let aabb2 = new AABB(b[0], b[2]);
            let test_2 = aabb.overlaps(aabb2);
            if (test_2) test = false
        }
        /* log(test, i); */

        if (test) {
            textBoxes.push([
                [box.x, box.y],
                [box.x + box.w, box.y],
                [box.x + box.w, box.y + box.h],
                [box.x, box.y + box.h]
            ])
        }
        i++
    }
    log(textBoxes);

    let minDist = 400;

    for (let i = 0; i < textBoxes.length; i++) {
        neighbourhood[i] = []
        for (let j = i + 1; j < textBoxes.length; j++) {
            if (distance(textBoxes[i][0][0], textBoxes[i][0][1], textBoxes[j][0][0], textBoxes[j][0][1]) < minDist) {
                neighbourhood[i].push(j)
            }
        }
    }

    log(neighbourhood)
    i = 0;
    while (!neighbourhood[i][0]) {
        i++;
    }
    order.push([0, neighbourhood[i][0]]);
    i = 0;
    log(order)
    let previous = order[0][1]
    while (i < 200) {
        i++;
        try {
            log(i, previous)
            let found = false
            for (let n of neighbourhood[previous]) {
                log(n)
                if (!textBoxes[n][4]) {
                    order.push([previous, n]);
                    found = true
                    previous = n;
                    textBoxes[n][4] = true;
                    textBoxes[previous][4] = true;
                    break;
                }
            }
            if (!found) {
                log("no neighbour")
                log(neighbourhood[previous])
                previous++;

            } else {
                log("found neighbour,")
            }
        } catch (e) {
            log(e)
            break;
        }
    }

    buildSplineFromOrder()

    let center = getTextBoxCenter(order[current_goal][0]);
    log(current_goal, center)
    offset_goal.x = -center.x * scale + longest / 2 * Math.HALF_PI;
    offset_goal.y = -center.y * scale + longest / 2 * Math.HALF_PI;

    /* for (let i = 0; i < textBoxes.length; i++) {
        for (let n of neighbourhood[i]) {
            if (!textBoxes[n][4]) {
                order.push([i, n])
                textBoxes[n][4] = true;
                textBoxes[i][4] = true
            }
            break;
        }
    } */

    log(order)

    textBoxesInitialized = true;
}

function printText() {
    return false
    ctx.fillStyle = "black"
    ctx.font = 20 * scale + "px Helvetica"
    for (let i = 0; i < text.length; i++) {
        /* log(ctx.measureText(text[i])) */
        let lines = sliceLines(text[i], 200);

        let lineHeight = 2;
        for (let j = 0; j < lines.length; j++) {
            ctx.fillText(
                lines[j],
                textPoints[i].x * scale + offset.x,
                textPoints[i].y * scale + offset.y + lineHeight * scale
            )
            lineHeight += 20
        }
    }
}

function sliceLines(text, width, height = 9000) {
    let t = text.split(" ");
    /* log(this.text.split(" ")) */
    let lines = []
    let line = ""
    for (let k = 0; k < t.length; k++) {
        line += " " + t[k];
        ctx.font = 14 * scale + "px Helvetica";
        let lineWidth = ctx.measureText(line).width / scale;
        if ( /* !isLocationValid(textPoints[i].x + lineWidth, textPoints[i].y) || */ k >= t.length - 1 || line.length > 75 || lineWidth > width) {
            lines.push(line);
            line = ""
        };
    }
    return lines;
}


function walls() {
    log("loading walls")
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

function isTextLocationValid(x, y) {
    let test = false;
    for (let poly of shape) {
        if (pointInPolygon([x, y], poly)) {
            test = true;
        }
    }
    for (let box of textBoxes) {
        if (pointInPolygon([x, y], box)) {
            test = true;
        }
    }
    return test;
}
let spline;

function buildSplineFromOrder() {
    let points = []
    for (let i = 0; i < order.length; i++) {
        let c = getTextBoxCenter(order[i][0])
        points.push(c.x);
        points.push(c.y);
    }
    spline = points

}

function testCollisions(ctx) {
    let points = []
    for (x = 0; x < 120; x++) {
        for (y = 0; y < 120; y++) {
            /* let p = getWorldPos(x * innerWidth * .037, y * innerHeight * .04); */
            let p = {
                x: x * 1333 * .037,
                y: y * 1333 * .04
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
                let length_test = false;
                for (let x = 0; x < 350; x += 10) {
                    if (!pointInPolygon([points[i].x + x, points[i].y], poly)) {
                        length_test = true;
                    }
                }
                if (length_test) {
                    points[i].collision = false;
                }
            }
            /* ctx.fillStyle = test ? "lime" : "red" */
        }
    }

    /* let maxDist = (Math.sin(frame * .1) + 1) / 2 * 10; */
    let maxDist = 20;
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
    if (debug) {
        displayValidPoints()
    }

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
    let i = 0;
    for (let p of validPoints) {
        ctx.fillStyle = p.collision ? "lime" : "red";
        ctx.fillStyle = "rgb(0, 255, " + i / validPoints.length * 255 + ")";
        ctx.beginPath()
        p = getWorldPos(p.x, p.y);
        ctx.arc(p.x, p.y, 10 * scale, 0, Math.TWO_PI)
        /* ctx.closePath() */
        ctx.fill()
        i++;
    }
}

function transformSpline() {
    let transformed_spline = []
    for (let i = 0; i < spline.length; i += 2) {
        transformed_spline.push(spline[i] * scale + offset.x)
        transformed_spline.push(spline[i + 1] * scale + offset.y)
    }
    return transformed_spline
}

function displaySpline() {
    /* ctx.moveTo(spline) */
    ctx.setLineDash([1, 3])
    ctx.lineWidth = 10 * scale
    ctx.strokeStyle = "#333"
    let s = transformSpline();
    ctx.beginPath()
    ctx.fillStyle = "maroon"
    ctx.arc(textBoxes[order[0][0]][0][0], textBoxes[order[0][0]][0][1], 10, 0, Math.TWO_PI)
    ctx.closePath()
    ctx.fill()
    ctx.moveTo(s[0], s[1])
    ctx.curve(transformSpline())
    ctx.stroke()
    ctx.setLineDash([])
}

function fillTextChain() {
    ctx.fillStyle = "black"
    ctx.font = 20 * scale + "px Helvetica"
    let leftover = []
    /* log(text) */
    for (let i = 0; i < order.length; i++) {
        let lines;
        let textBox = textBoxes[order[i][0]];
        if (leftover.length > 0) {
            lines = leftover;
            leftover = []
        } else {
            try {
                lines = sliceLines(text[i], textBox[1][0] - textBox[0][0] - 50)
            } catch {
                log("FUCK")
                log(order.length, text.length)
                setTimeout(() => {
                    log("FUCK FUCK FUCK")
                    location.reload()
                }, 1000)
            }
        }
        let lineHeight = 2;
        let lineMargin = 20
        let broke = false;
        for (let j = 0; j < lines.length; j++) {
            if (!broke) {
                ctx.fillText(
                    lines[j],
                    textBox[0][0] * scale + offset.x,
                    (textBox[0][1] + lineHeight) * scale + offset.y
                )
                lineHeight += lineMargin;
                if (lineMargin * j + 2 > textBox[2][1] - textBox[1][1] - 20) {
                    for (let k = j + 1; k < lines.length; k++) {
                        leftover.push(lines[k])
                    }
                    broke = true
                }
            }
        }
    }
}

function fillTextBoxes() {
    let links = []
    ctx.fillStyle = "black"
    ctx.font = 20 * scale + "px Helvetica"
    let leftover = []
    for (let i = 0; i < text.length + leftover.length; i++) {
        let textBox = textBoxes[i * 2];
        /*     log(part) */
        if (i > 0) {
            links.push(
                [
                    [textBox[0][0],
                        textBox[0][1]
                    ],
                    [textBoxes[(i - 1) * 2][0][0],
                        textBoxes[(i - 1) * 2][0][1]
                    ]
                ]
            )
        }
        let lines;
        if (leftover.length > 0) {
            lines = leftover
            leftover = []
        } else {
            lines = sliceLines(text[i], textBox[1][0] - textBox[0][0] - 50)
        }
        /* log(ctx.measureText(text[i])) */
        /* let lines = sliceLines(text[i], 200); */
        let lineHeight = 2;

        let broke = false;
        for (let j = 0; j < lines.length; j++) {
            if (!broke) {
                ctx.fillText(
                    lines[j],
                    textBox[0][0] * scale + offset.x,
                    (textBox[0][1] + lineHeight) * scale + offset.y
                )
                lineHeight += lineMargin
                if (lineMargin * j + 2 > textBox[2][1] - textBox[1][1] - 20) {
                    for (let k = j + 1; k < lines.length; k++) {
                        leftover.push(lines[k])
                    }
                    broke = true;
                }
            }
        }
    }

}

function getTextBoxCenter(i) {
    let center = {
        x: 0,
        y: 0
    }

    center.x = textBoxes[i][0][0] + (textBoxes[i][1][0] - textBoxes[i][0][0]) / 2
    center.y = textBoxes[i][0][1] + (textBoxes[i][3][1] - textBoxes[i][0][1]) / 2

    return center;
}

function makeSpline(data, k) {

    if (k == null) k = 1;

    var size = data.length;
    var last = size - 4;

    var path = "M" + [data[0], data[1]];

    for (var i = 0; i < size - 2; i += 2) {

        var x0 = i ? data[i - 2] : data[0];
        var y0 = i ? data[i - 1] : data[1];

        var x1 = data[i + 0];
        var y1 = data[i + 1];

        var x2 = data[i + 2];
        var y2 = data[i + 3];

        var x3 = i !== last ? data[i + 4] : x2;
        var y3 = i !== last ? data[i + 5] : y2;

        var cp1x = x1 + (x2 - x0) / 6 * k;
        var cp1y = y1 + (y2 - y0) / 6 * k;

        var cp2x = x2 - (x3 - x1) / 6 * k;
        var cp2y = y2 - (y3 - y1) / 6 * k;

        path += "C" + [cp1x, cp1y, cp2x, cp2y, x2, y2];
    }

    return path;
}