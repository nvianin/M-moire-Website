(function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = typeof require == "function" && require;
        if (!u && a) return a(o, !0);
        if (i) return i(o, !0);
        var f = new Error("Cannot find module '" + o + "'");
        throw f.code = "MODULE_NOT_FOUND", f
      }
      var l = n[o] = {
        exports: {}
      };
      t[o][0].call(l.exports, function (e) {
        var n = t[o][1][e];
        return s(n ? n : e)
      }, l, l.exports, e, t, n, r)
    }
    return n[o].exports
  }
  var i = typeof require == "function" && require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s
})({
  1: [function (require, module, exports) {
    /*
     * @copyright 2016 Sean Connelly (@voidqk), http://syntheti.cc
     * @license MIT
     * @preserve Project Home: https://github.com/voidqk/polybooljs
     */
    var BuildLog = require("./lib/build-log");
    var Epsilon = require("./lib/epsilon");
    var Intersecter = require("./lib/intersecter");
    var SegmentChainer = require("./lib/segment-chainer");
    var SegmentSelector = require("./lib/segment-selector");
    var GeoJSON = require("./lib/geojson");
    var buildLog = false;
    var epsilon = Epsilon();
    var PolyBool;
    PolyBool = {
      buildLog: function (bl) {
        if (bl === true) buildLog = BuildLog();
        else if (bl === false) buildLog = false;
        return buildLog === false ? false : buildLog.list
      },
      epsilon: function (v) {
        return epsilon.epsilon(v)
      },
      segments: function (poly) {
        var i = Intersecter(true, epsilon, buildLog);
        poly.regions.forEach(i.addRegion);
        return {
          segments: i.calculate(poly.inverted),
          inverted: poly.inverted
        }
      },
      combine: function (segments1, segments2) {
        var i3 = Intersecter(false, epsilon, buildLog);
        return {
          combined: i3.calculate(segments1.segments, segments1.inverted, segments2.segments, segments2.inverted),
          inverted1: segments1.inverted,
          inverted2: segments2.inverted
        }
      },
      selectUnion: function (combined) {
        return {
          segments: SegmentSelector.union(combined.combined, buildLog),
          inverted: combined.inverted1 || combined.inverted2
        }
      },
      selectIntersect: function (combined) {
        return {
          segments: SegmentSelector.intersect(combined.combined, buildLog),
          inverted: combined.inverted1 && combined.inverted2
        }
      },
      selectDifference: function (combined) {
        return {
          segments: SegmentSelector.difference(combined.combined, buildLog),
          inverted: combined.inverted1 && !combined.inverted2
        }
      },
      selectDifferenceRev: function (combined) {
        return {
          segments: SegmentSelector.differenceRev(combined.combined, buildLog),
          inverted: !combined.inverted1 && combined.inverted2
        }
      },
      selectXor: function (combined) {
        return {
          segments: SegmentSelector.xor(combined.combined, buildLog),
          inverted: combined.inverted1 !== combined.inverted2
        }
      },
      polygon: function (segments) {
        return {
          regions: SegmentChainer(segments.segments, epsilon, buildLog),
          inverted: segments.inverted
        }
      },
      polygonFromGeoJSON: function (geojson) {
        return GeoJSON.toPolygon(PolyBool, geojson)
      },
      polygonToGeoJSON: function (poly) {
        return GeoJSON.fromPolygon(PolyBool, epsilon, poly)
      },
      union: function (poly1, poly2) {
        return operate(poly1, poly2, PolyBool.selectUnion)
      },
      intersect: function (poly1, poly2) {
        return operate(poly1, poly2, PolyBool.selectIntersect)
      },
      difference: function (poly1, poly2) {
        return operate(poly1, poly2, PolyBool.selectDifference)
      },
      differenceRev: function (poly1, poly2) {
        return operate(poly1, poly2, PolyBool.selectDifferenceRev)
      },
      xor: function (poly1, poly2) {
        return operate(poly1, poly2, PolyBool.selectXor)
      }
    };

    function operate(poly1, poly2, selector) {
      var seg1 = PolyBool.segments(poly1);
      var seg2 = PolyBool.segments(poly2);
      var comb = PolyBool.combine(seg1, seg2);
      var seg3 = selector(comb);
      return PolyBool.polygon(seg3)
    }
    if (typeof window === "object") window.PolyBool = PolyBool;
    module.exports = PolyBool
  }, {
    "./lib/build-log": 2,
    "./lib/epsilon": 3,
    "./lib/geojson": 4,
    "./lib/intersecter": 5,
    "./lib/segment-chainer": 7,
    "./lib/segment-selector": 8
  }],
  2: [function (require, module, exports) {
    function BuildLog() {
      var my;
      var nextSegmentId = 0;
      var curVert = false;

      function push(type, data) {
        my.list.push({
          type: type,
          data: data ? JSON.parse(JSON.stringify(data)) : void 0
        });
        return my
      }
      my = {
        list: [],
        segmentId: function () {
          return nextSegmentId++
        },
        checkIntersection: function (seg1, seg2) {
          return push("check", {
            seg1: seg1,
            seg2: seg2
          })
        },
        segmentChop: function (seg, end) {
          push("div_seg", {
            seg: seg,
            pt: end
          });
          return push("chop", {
            seg: seg,
            pt: end
          })
        },
        statusRemove: function (seg) {
          return push("pop_seg", {
            seg: seg
          })
        },
        segmentUpdate: function (seg) {
          return push("seg_update", {
            seg: seg
          })
        },
        segmentNew: function (seg, primary) {
          return push("new_seg", {
            seg: seg,
            primary: primary
          })
        },
        segmentRemove: function (seg) {
          return push("rem_seg", {
            seg: seg
          })
        },
        tempStatus: function (seg, above, below) {
          return push("temp_status", {
            seg: seg,
            above: above,
            below: below
          })
        },
        rewind: function (seg) {
          return push("rewind", {
            seg: seg
          })
        },
        status: function (seg, above, below) {
          return push("status", {
            seg: seg,
            above: above,
            below: below
          })
        },
        vert: function (x) {
          if (x === curVert) return my;
          curVert = x;
          return push("vert", {
            x: x
          })
        },
        log: function (data) {
          if (typeof data !== "string") data = JSON.stringify(data, false, "  ");
          return push("log", {
            txt: data
          })
        },
        reset: function () {
          return push("reset")
        },
        selected: function (segs) {
          return push("selected", {
            segs: segs
          })
        },
        chainStart: function (seg) {
          return push("chain_start", {
            seg: seg
          })
        },
        chainRemoveHead: function (index, pt) {
          return push("chain_rem_head", {
            index: index,
            pt: pt
          })
        },
        chainRemoveTail: function (index, pt) {
          return push("chain_rem_tail", {
            index: index,
            pt: pt
          })
        },
        chainNew: function (pt1, pt2) {
          return push("chain_new", {
            pt1: pt1,
            pt2: pt2
          })
        },
        chainMatch: function (index) {
          return push("chain_match", {
            index: index
          })
        },
        chainClose: function (index) {
          return push("chain_close", {
            index: index
          })
        },
        chainAddHead: function (index, pt) {
          return push("chain_add_head", {
            index: index,
            pt: pt
          })
        },
        chainAddTail: function (index, pt) {
          return push("chain_add_tail", {
            index: index,
            pt: pt
          })
        },
        chainConnect: function (index1, index2) {
          return push("chain_con", {
            index1: index1,
            index2: index2
          })
        },
        chainReverse: function (index) {
          return push("chain_rev", {
            index: index
          })
        },
        chainJoin: function (index1, index2) {
          return push("chain_join", {
            index1: index1,
            index2: index2
          })
        },
        done: function () {
          return push("done")
        }
      };
      return my
    }
    module.exports = BuildLog
  }, {}],
  3: [function (require, module, exports) {
    function Epsilon(eps) {
      if (typeof eps !== "number") eps = 1e-10;
      var my = {
        epsilon: function (v) {
          if (typeof v === "number") eps = v;
          return eps
        },
        pointAboveOrOnLine: function (pt, left, right) {
          var Ax = left[0];
          var Ay = left[1];
          var Bx = right[0];
          var By = right[1];
          var Cx = pt[0];
          var Cy = pt[1];
          return (Bx - Ax) * (Cy - Ay) - (By - Ay) * (Cx - Ax) >= -eps
        },
        pointBetween: function (p, left, right) {
          var d_py_ly = p[1] - left[1];
          var d_rx_lx = right[0] - left[0];
          var d_px_lx = p[0] - left[0];
          var d_ry_ly = right[1] - left[1];
          var dot = d_px_lx * d_rx_lx + d_py_ly * d_ry_ly;
          if (dot < eps) return false;
          var sqlen = d_rx_lx * d_rx_lx + d_ry_ly * d_ry_ly;
          if (dot - sqlen > -eps) return false;
          return true
        },
        pointsSameX: function (p1, p2) {
          return Math.abs(p1[0] - p2[0]) < eps
        },
        pointsSameY: function (p1, p2) {
          return Math.abs(p1[1] - p2[1]) < eps
        },
        pointsSame: function (p1, p2) {
          return my.pointsSameX(p1, p2) && my.pointsSameY(p1, p2)
        },
        pointsCompare: function (p1, p2) {
          if (my.pointsSameX(p1, p2)) return my.pointsSameY(p1, p2) ? 0 : p1[1] < p2[1] ? -1 : 1;
          return p1[0] < p2[0] ? -1 : 1
        },
        pointsCollinear: function (pt1, pt2, pt3) {
          var dx1 = pt1[0] - pt2[0];
          var dy1 = pt1[1] - pt2[1];
          var dx2 = pt2[0] - pt3[0];
          var dy2 = pt2[1] - pt3[1];
          return Math.abs(dx1 * dy2 - dx2 * dy1) < eps
        },
        linesIntersect: function (a0, a1, b0, b1) {
          var adx = a1[0] - a0[0];
          var ady = a1[1] - a0[1];
          var bdx = b1[0] - b0[0];
          var bdy = b1[1] - b0[1];
          var axb = adx * bdy - ady * bdx;
          if (Math.abs(axb) < eps) return false;
          var dx = a0[0] - b0[0];
          var dy = a0[1] - b0[1];
          var A = (bdx * dy - bdy * dx) / axb;
          var B = (adx * dy - ady * dx) / axb;
          var ret = {
            alongA: 0,
            alongB: 0,
            pt: [a0[0] + A * adx, a0[1] + A * ady]
          };
          if (A <= -eps) ret.alongA = -2;
          else if (A < eps) ret.alongA = -1;
          else if (A - 1 <= -eps) ret.alongA = 0;
          else if (A - 1 < eps) ret.alongA = 1;
          else ret.alongA = 2;
          if (B <= -eps) ret.alongB = -2;
          else if (B < eps) ret.alongB = -1;
          else if (B - 1 <= -eps) ret.alongB = 0;
          else if (B - 1 < eps) ret.alongB = 1;
          else ret.alongB = 2;
          return ret
        },
        pointInsideRegion: function (pt, region) {
          var x = pt[0];
          var y = pt[1];
          var last_x = region[region.length - 1][0];
          var last_y = region[region.length - 1][1];
          var inside = false;
          for (var i = 0; i < region.length; i++) {
            var curr_x = region[i][0];
            var curr_y = region[i][1];
            if (curr_y - y > eps != last_y - y > eps && (last_x - curr_x) * (y - curr_y) / (last_y - curr_y) + curr_x - x > eps) inside = !inside;
            last_x = curr_x;
            last_y = curr_y
          }
          return inside
        }
      };
      return my
    }
    module.exports = Epsilon
  }, {}],
  4: [function (require, module, exports) {
    var GeoJSON = {
      toPolygon: function (PolyBool, geojson) {
        function GeoPoly(coords) {
          if (coords.length <= 0) return PolyBool.segments({
            inverted: false,
            regions: []
          });

          function LineString(ls) {
            var reg = ls.slice(0, ls.length - 1);
            return PolyBool.segments({
              inverted: false,
              regions: [reg]
            })
          }
          var out = LineString(coords[0]);
          for (var i = 1; i < coords.length; i++) out = PolyBool.selectDifference(PolyBool.combine(out, LineString(coords[i])));
          return out
        }
        if (geojson.type === "Polygon") {
          return PolyBool.polygon(GeoPoly(geojson.coordinates))
        } else if (geojson.type === "MultiPolygon") {
          var out = PolyBool.segments({
            inverted: false,
            regions: []
          });
          for (var i = 0; i < geojson.coordinates.length; i++) out = PolyBool.selectUnion(PolyBool.combine(out, GeoPoly(geojson.coordinates[i])));
          return PolyBool.polygon(out)
        }
        throw new Error("PolyBool: Cannot convert GeoJSON object to PolyBool polygon")
      },
      fromPolygon: function (PolyBool, eps, poly) {
        poly = PolyBool.polygon(PolyBool.segments(poly));

        function regionInsideRegion(r1, r2) {
          return eps.pointInsideRegion([(r1[0][0] + r1[1][0]) * .5, (r1[0][1] + r1[1][1]) * .5], r2)
        }

        function newNode(region) {
          return {
            region: region,
            children: []
          }
        }
        var roots = newNode(null);

        function addChild(root, region) {
          for (var i = 0; i < root.children.length; i++) {
            var child = root.children[i];
            if (regionInsideRegion(region, child.region)) {
              addChild(child, region);
              return
            }
          }
          var node = newNode(region);
          for (var i = 0; i < root.children.length; i++) {
            var child = root.children[i];
            if (regionInsideRegion(child.region, region)) {
              node.children.push(child);
              root.children.splice(i, 1);
              i--
            }
          }
          root.children.push(node)
        }
        for (var i = 0; i < poly.regions.length; i++) {
          var region = poly.regions[i];
          if (region.length < 3) continue;
          addChild(roots, region)
        }

        function forceWinding(region, clockwise) {
          var winding = 0;
          var last_x = region[region.length - 1][0];
          var last_y = region[region.length - 1][1];
          var copy = [];
          for (var i = 0; i < region.length; i++) {
            var curr_x = region[i][0];
            var curr_y = region[i][1];
            copy.push([curr_x, curr_y]);
            winding += curr_y * last_x - curr_x * last_y;
            last_x = curr_x;
            last_y = curr_y
          }
          var isclockwise = winding < 0;
          if (isclockwise !== clockwise) copy.reverse();
          copy.push([copy[0][0], copy[0][1]]);
          return copy
        }
        var geopolys = [];

        function addExterior(node) {
          var poly = [forceWinding(node.region, false)];
          geopolys.push(poly);
          for (var i = 0; i < node.children.length; i++) poly.push(getInterior(node.children[i]))
        }

        function getInterior(node) {
          for (var i = 0; i < node.children.length; i++) addExterior(node.children[i]);
          return forceWinding(node.region, true)
        }
        for (var i = 0; i < roots.children.length; i++) addExterior(roots.children[i]);
        if (geopolys.length <= 0) return {
          type: "Polygon",
          coordinates: []
        };
        if (geopolys.length == 1) return {
          type: "Polygon",
          coordinates: geopolys[0]
        };
        return {
          type: "MultiPolygon",
          coordinates: geopolys
        }
      }
    };
    module.exports = GeoJSON
  }, {}],
  5: [function (require, module, exports) {
    var LinkedList = require("./linked-list");

    function Intersecter(selfIntersection, eps, buildLog) {
      function segmentNew(start, end) {
        return {
          id: buildLog ? buildLog.segmentId() : -1,
          start: start,
          end: end,
          myFill: {
            above: null,
            below: null
          },
          otherFill: null
        }
      }

      function segmentCopy(start, end, seg) {
        return {
          id: buildLog ? buildLog.segmentId() : -1,
          start: start,
          end: end,
          myFill: {
            above: seg.myFill.above,
            below: seg.myFill.below
          },
          otherFill: null
        }
      }
      var event_root = LinkedList.create();

      function eventCompare(p1_isStart, p1_1, p1_2, p2_isStart, p2_1, p2_2) {
        var comp = eps.pointsCompare(p1_1, p2_1);
        if (comp !== 0) return comp;
        if (eps.pointsSame(p1_2, p2_2)) return 0;
        if (p1_isStart !== p2_isStart) return p1_isStart ? 1 : -1;
        return eps.pointAboveOrOnLine(p1_2, p2_isStart ? p2_1 : p2_2, p2_isStart ? p2_2 : p2_1) ? 1 : -1
      }

      function eventAdd(ev, other_pt) {
        event_root.insertBefore(ev, function (here) {
          var comp = eventCompare(ev.isStart, ev.pt, other_pt, here.isStart, here.pt, here.other.pt);
          return comp < 0
        })
      }

      function eventAddSegmentStart(seg, primary) {
        var ev_start = LinkedList.node({
          isStart: true,
          pt: seg.start,
          seg: seg,
          primary: primary,
          other: null,
          status: null
        });
        eventAdd(ev_start, seg.end);
        return ev_start
      }

      function eventAddSegmentEnd(ev_start, seg, primary) {
        var ev_end = LinkedList.node({
          isStart: false,
          pt: seg.end,
          seg: seg,
          primary: primary,
          other: ev_start,
          status: null
        });
        ev_start.other = ev_end;
        eventAdd(ev_end, ev_start.pt)
      }

      function eventAddSegment(seg, primary) {
        var ev_start = eventAddSegmentStart(seg, primary);
        eventAddSegmentEnd(ev_start, seg, primary);
        return ev_start
      }

      function eventUpdateEnd(ev, end) {
        if (buildLog) buildLog.segmentChop(ev.seg, end);
        ev.other.remove();
        ev.seg.end = end;
        ev.other.pt = end;
        eventAdd(ev.other, ev.pt)
      }

      function eventDivide(ev, pt) {
        var ns = segmentCopy(pt, ev.seg.end, ev.seg);
        eventUpdateEnd(ev, pt);
        return eventAddSegment(ns, ev.primary)
      }

      function calculate(primaryPolyInverted, secondaryPolyInverted) {
        var status_root = LinkedList.create();

        function statusCompare(ev1, ev2) {
          var a1 = ev1.seg.start;
          var a2 = ev1.seg.end;
          var b1 = ev2.seg.start;
          var b2 = ev2.seg.end;
          if (eps.pointsCollinear(a1, b1, b2)) {
            if (eps.pointsCollinear(a2, b1, b2)) return 1;
            return eps.pointAboveOrOnLine(a2, b1, b2) ? 1 : -1
          }
          return eps.pointAboveOrOnLine(a1, b1, b2) ? 1 : -1
        }

        function statusFindSurrounding(ev) {
          return status_root.findTransition(function (here) {
            var comp = statusCompare(ev, here.ev);
            return comp > 0
          })
        }

        function checkIntersection(ev1, ev2) {
          var seg1 = ev1.seg;
          var seg2 = ev2.seg;
          var a1 = seg1.start;
          var a2 = seg1.end;
          var b1 = seg2.start;
          var b2 = seg2.end;
          if (buildLog) buildLog.checkIntersection(seg1, seg2);
          var i = eps.linesIntersect(a1, a2, b1, b2);
          if (i === false) {
            if (!eps.pointsCollinear(a1, a2, b1)) return false;
            if (eps.pointsSame(a1, b2) || eps.pointsSame(a2, b1)) return false;
            var a1_equ_b1 = eps.pointsSame(a1, b1);
            var a2_equ_b2 = eps.pointsSame(a2, b2);
            if (a1_equ_b1 && a2_equ_b2) return ev2;
            var a1_between = !a1_equ_b1 && eps.pointBetween(a1, b1, b2);
            var a2_between = !a2_equ_b2 && eps.pointBetween(a2, b1, b2);
            if (a1_equ_b1) {
              if (a2_between) {
                eventDivide(ev2, a2)
              } else {
                eventDivide(ev1, b2)
              }
              return ev2
            } else if (a1_between) {
              if (!a2_equ_b2) {
                if (a2_between) {
                  eventDivide(ev2, a2)
                } else {
                  eventDivide(ev1, b2)
                }
              }
              eventDivide(ev2, a1)
            }
          } else {
            if (i.alongA === 0) {
              if (i.alongB === -1) eventDivide(ev1, b1);
              else if (i.alongB === 0) eventDivide(ev1, i.pt);
              else if (i.alongB === 1) eventDivide(ev1, b2)
            }
            if (i.alongB === 0) {
              if (i.alongA === -1) eventDivide(ev2, a1);
              else if (i.alongA === 0) eventDivide(ev2, i.pt);
              else if (i.alongA === 1) eventDivide(ev2, a2)
            }
          }
          return false
        }
        var segments = [];
        while (!event_root.isEmpty()) {
          var ev = event_root.getHead();
          if (buildLog) buildLog.vert(ev.pt[0]);
          if (ev.isStart) {
            if (buildLog) buildLog.segmentNew(ev.seg, ev.primary);
            var surrounding = statusFindSurrounding(ev);
            var above = surrounding.before ? surrounding.before.ev : null;
            var below = surrounding.after ? surrounding.after.ev : null;
            if (buildLog) {
              buildLog.tempStatus(ev.seg, above ? above.seg : false, below ? below.seg : false)
            }

            function checkBothIntersections() {
              if (above) {
                var eve = checkIntersection(ev, above);
                if (eve) return eve
              }
              if (below) return checkIntersection(ev, below);
              return false
            }
            var eve = checkBothIntersections();
            if (eve) {
              if (selfIntersection) {
                var toggle;
                if (ev.seg.myFill.below === null) toggle = true;
                else toggle = ev.seg.myFill.above !== ev.seg.myFill.below;
                if (toggle) eve.seg.myFill.above = !eve.seg.myFill.above
              } else {
                eve.seg.otherFill = ev.seg.myFill
              }
              if (buildLog) buildLog.segmentUpdate(eve.seg);
              ev.other.remove();
              ev.remove()
            }
            if (event_root.getHead() !== ev) {
              if (buildLog) buildLog.rewind(ev.seg);
              continue
            }
            if (selfIntersection) {
              var toggle;
              if (ev.seg.myFill.below === null) toggle = true;
              else toggle = ev.seg.myFill.above !== ev.seg.myFill.below;
              if (!below) {
                ev.seg.myFill.below = primaryPolyInverted
              } else {
                ev.seg.myFill.below = below.seg.myFill.above
              }
              if (toggle) ev.seg.myFill.above = !ev.seg.myFill.below;
              else ev.seg.myFill.above = ev.seg.myFill.below
            } else {
              if (ev.seg.otherFill === null) {
                var inside;
                if (!below) {
                  inside = ev.primary ? secondaryPolyInverted : primaryPolyInverted
                } else {
                  if (ev.primary === below.primary) inside = below.seg.otherFill.above;
                  else inside = below.seg.myFill.above
                }
                ev.seg.otherFill = {
                  above: inside,
                  below: inside
                }
              }
            }
            if (buildLog) {
              buildLog.status(ev.seg, above ? above.seg : false, below ? below.seg : false)
            }
            ev.other.status = surrounding.insert(LinkedList.node({
              ev: ev
            }))
          } else {
            var st = ev.status;
            if (st === null) {
              throw new Error("PolyBool: Zero-length segment detected; your epsilon is " + "probably too small or too large")
            }
            if (status_root.exists(st.prev) && status_root.exists(st.next)) checkIntersection(st.prev.ev, st.next.ev);
            if (buildLog) buildLog.statusRemove(st.ev.seg);
            st.remove();
            if (!ev.primary) {
              var s = ev.seg.myFill;
              ev.seg.myFill = ev.seg.otherFill;
              ev.seg.otherFill = s
            }
            segments.push(ev.seg)
          }
          event_root.getHead().remove()
        }
        if (buildLog) buildLog.done();
        return segments
      }
      if (!selfIntersection) {
        return {
          calculate: function (segments1, inverted1, segments2, inverted2) {
            segments1.forEach(function (seg) {
              eventAddSegment(segmentCopy(seg.start, seg.end, seg), true)
            });
            segments2.forEach(function (seg) {
              eventAddSegment(segmentCopy(seg.start, seg.end, seg), false)
            });
            return calculate(inverted1, inverted2)
          }
        }
      }
      return {
        addRegion: function (region) {
          var pt1;
          var pt2 = region[region.length - 1];
          for (var i = 0; i < region.length; i++) {
            pt1 = pt2;
            pt2 = region[i];
            var forward = eps.pointsCompare(pt1, pt2);
            if (forward === 0) continue;
            eventAddSegment(segmentNew(forward < 0 ? pt1 : pt2, forward < 0 ? pt2 : pt1), true)
          }
        },
        calculate: function (inverted) {
          return calculate(inverted, false)
        }
      }
    }
    module.exports = Intersecter
  }, {
    "./linked-list": 6
  }],
  6: [function (require, module, exports) {
    var LinkedList = {
      create: function () {
        var my = {
          root: {
            root: true,
            next: null
          },
          exists: function (node) {
            if (node === null || node === my.root) return false;
            return true
          },
          isEmpty: function () {
            return my.root.next === null
          },
          getHead: function () {
            return my.root.next
          },
          insertBefore: function (node, check) {
            var last = my.root;
            var here = my.root.next;
            while (here !== null) {
              if (check(here)) {
                node.prev = here.prev;
                node.next = here;
                here.prev.next = node;
                here.prev = node;
                return
              }
              last = here;
              here = here.next
            }
            last.next = node;
            node.prev = last;
            node.next = null
          },
          findTransition: function (check) {
            var prev = my.root;
            var here = my.root.next;
            while (here !== null) {
              if (check(here)) break;
              prev = here;
              here = here.next
            }
            return {
              before: prev === my.root ? null : prev,
              after: here,
              insert: function (node) {
                node.prev = prev;
                node.next = here;
                prev.next = node;
                if (here !== null) here.prev = node;
                return node
              }
            }
          }
        };
        return my
      },
      node: function (data) {
        data.prev = null;
        data.next = null;
        data.remove = function () {
          data.prev.next = data.next;
          if (data.next) data.next.prev = data.prev;
          data.prev = null;
          data.next = null
        };
        return data
      }
    };
    module.exports = LinkedList
  }, {}],
  7: [function (require, module, exports) {
    function SegmentChainer(segments, eps, buildLog) {
      var chains = [];
      var regions = [];
      segments.forEach(function (seg) {
        var pt1 = seg.start;
        var pt2 = seg.end;
        if (eps.pointsSame(pt1, pt2)) {
          console.warn("PolyBool: Warning: Zero-length segment detected; your epsilon is " + "probably too small or too large");
          return
        }
        if (buildLog) buildLog.chainStart(seg);
        var first_match = {
          index: 0,
          matches_head: false,
          matches_pt1: false
        };
        var second_match = {
          index: 0,
          matches_head: false,
          matches_pt1: false
        };
        var next_match = first_match;

        function setMatch(index, matches_head, matches_pt1) {
          next_match.index = index;
          next_match.matches_head = matches_head;
          next_match.matches_pt1 = matches_pt1;
          if (next_match === first_match) {
            next_match = second_match;
            return false
          }
          next_match = null;
          return true
        }
        for (var i = 0; i < chains.length; i++) {
          var chain = chains[i];
          var head = chain[0];
          var head2 = chain[1];
          var tail = chain[chain.length - 1];
          var tail2 = chain[chain.length - 2];
          if (eps.pointsSame(head, pt1)) {
            if (setMatch(i, true, true)) break
          } else if (eps.pointsSame(head, pt2)) {
            if (setMatch(i, true, false)) break
          } else if (eps.pointsSame(tail, pt1)) {
            if (setMatch(i, false, true)) break
          } else if (eps.pointsSame(tail, pt2)) {
            if (setMatch(i, false, false)) break
          }
        }
        if (next_match === first_match) {
          chains.push([pt1, pt2]);
          if (buildLog) buildLog.chainNew(pt1, pt2);
          return
        }
        if (next_match === second_match) {
          if (buildLog) buildLog.chainMatch(first_match.index);
          var index = first_match.index;
          var pt = first_match.matches_pt1 ? pt2 : pt1;
          var addToHead = first_match.matches_head;
          var chain = chains[index];
          var grow = addToHead ? chain[0] : chain[chain.length - 1];
          var grow2 = addToHead ? chain[1] : chain[chain.length - 2];
          var oppo = addToHead ? chain[chain.length - 1] : chain[0];
          var oppo2 = addToHead ? chain[chain.length - 2] : chain[1];
          if (eps.pointsCollinear(grow2, grow, pt)) {
            if (addToHead) {
              if (buildLog) buildLog.chainRemoveHead(first_match.index, pt);
              chain.shift()
            } else {
              if (buildLog) buildLog.chainRemoveTail(first_match.index, pt);
              chain.pop()
            }
            grow = grow2
          }
          if (eps.pointsSame(oppo, pt)) {
            chains.splice(index, 1);
            if (eps.pointsCollinear(oppo2, oppo, grow)) {
              if (addToHead) {
                if (buildLog) buildLog.chainRemoveTail(first_match.index, grow);
                chain.pop()
              } else {
                if (buildLog) buildLog.chainRemoveHead(first_match.index, grow);
                chain.shift()
              }
            }
            if (buildLog) buildLog.chainClose(first_match.index);
            regions.push(chain);
            return
          }
          if (addToHead) {
            if (buildLog) buildLog.chainAddHead(first_match.index, pt);
            chain.unshift(pt)
          } else {
            if (buildLog) buildLog.chainAddTail(first_match.index, pt);
            chain.push(pt)
          }
          return
        }

        function reverseChain(index) {
          if (buildLog) buildLog.chainReverse(index);
          chains[index].reverse()
        }

        function appendChain(index1, index2) {
          var chain1 = chains[index1];
          var chain2 = chains[index2];
          var tail = chain1[chain1.length - 1];
          var tail2 = chain1[chain1.length - 2];
          var head = chain2[0];
          var head2 = chain2[1];
          if (eps.pointsCollinear(tail2, tail, head)) {
            if (buildLog) buildLog.chainRemoveTail(index1, tail);
            chain1.pop();
            tail = tail2
          }
          if (eps.pointsCollinear(tail, head, head2)) {
            if (buildLog) buildLog.chainRemoveHead(index2, head);
            chain2.shift()
          }
          if (buildLog) buildLog.chainJoin(index1, index2);
          chains[index1] = chain1.concat(chain2);
          chains.splice(index2, 1)
        }
        var F = first_match.index;
        var S = second_match.index;
        if (buildLog) buildLog.chainConnect(F, S);
        var reverseF = chains[F].length < chains[S].length;
        if (first_match.matches_head) {
          if (second_match.matches_head) {
            if (reverseF) {
              reverseChain(F);
              appendChain(F, S)
            } else {
              reverseChain(S);
              appendChain(S, F)
            }
          } else {
            appendChain(S, F)
          }
        } else {
          if (second_match.matches_head) {
            appendChain(F, S)
          } else {
            if (reverseF) {
              reverseChain(F);
              appendChain(S, F)
            } else {
              reverseChain(S);
              appendChain(F, S)
            }
          }
        }
      });
      return regions
    }
    module.exports = SegmentChainer
  }, {}],
  8: [function (require, module, exports) {
    function select(segments, selection, buildLog) {
      var result = [];
      segments.forEach(function (seg) {
        var index = (seg.myFill.above ? 8 : 0) + (seg.myFill.below ? 4 : 0) + (seg.otherFill && seg.otherFill.above ? 2 : 0) + (seg.otherFill && seg.otherFill.below ? 1 : 0);
        if (selection[index] !== 0) {
          result.push({
            id: buildLog ? buildLog.segmentId() : -1,
            start: seg.start,
            end: seg.end,
            myFill: {
              above: selection[index] === 1,
              below: selection[index] === 2
            },
            otherFill: null
          })
        }
      });
      if (buildLog) buildLog.selected(result);
      return result
    }
    var SegmentSelector = {
      union: function (segments, buildLog) {
        return select(segments, [0, 2, 1, 0, 2, 2, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0], buildLog)
      },
      intersect: function (segments, buildLog) {
        return select(segments, [0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 1, 1, 0, 2, 1, 0], buildLog)
      },
      difference: function (segments, buildLog) {
        return select(segments, [0, 0, 0, 0, 2, 0, 2, 0, 1, 1, 0, 0, 0, 1, 2, 0], buildLog)
      },
      differenceRev: function (segments, buildLog) {
        return select(segments, [0, 2, 1, 0, 0, 0, 1, 1, 0, 2, 0, 2, 0, 0, 0, 0], buildLog)
      },
      xor: function (segments, buildLog) {
        return select(segments, [0, 2, 1, 0, 2, 0, 0, 1, 1, 0, 0, 2, 0, 1, 2, 0], buildLog)
      }
    };
    module.exports = SegmentSelector
  }, {}]
}, {}, [1]);