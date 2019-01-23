var currentSprite_x = 0;
var currentSprite_y = 0;

var canvasSize = 8;

var image, imagectx, canvas, canvasctx;

document.addEventListener('DOMContentLoaded', function() {
    image = document.getElementById("sprites");
    imagectx = image.getContext("2d");
    canvas = document.getElementById("canvas");
    canvasctx = canvas.getContext("2d");

    imagectx['webkitImageSmoothingEnabled'] = false
    canvasctx['webkitImageSmoothingEnabled'] = false

    //imagectx.filter = 'url(#remove-alpha)';
    //canvasctx.filter = 'url(#remove-alpha)';
    //imagectx.moveTo(0, 0);
    //imagectx.lineTo(110, 89);
    //imagectx.stroke();
    //imagectx.filter = 'none';

    drawCanvas();

    $(".colors .color").on("click", function () {
        $(".colors .color").removeClass("selected");
        $(this).addClass("selected");
    });

    $(".tools .tool").on("click", function () {
        $(".tools .tool").removeClass("selected");
        $(this).addClass("selected");
    });

    function canvasEvent(name, e) {
        if (name != "mouseup" && e.buttons != 1) return;
        var x = Math.floor(e.offsetX / canvas.getBoundingClientRect().width * canvasSize) + currentSprite_x;
        var y = Math.floor(e.offsetY / canvas.getBoundingClientRect().height * canvasSize) + currentSprite_y;
        var color = window.getComputedStyle($(".colors .color.selected")[0], null).getPropertyValue("background-color");
        currentTool = $(".tools .tool.selected").attr("data-name");
        tools[currentTool][name](x, y, color);
    }

    $(canvas).on("mousedown", function (e) { canvasEvent("mousedown", e) });
    $(canvas).on("mousemove", function (e) { canvasEvent("mousemove", e) });
    $(canvas).on("mouseup", function (e) { canvasEvent("mouseup", e) });
});
function drawCanvas() {
    canvasctx.clearRect(0, 0, canvasSize, canvasSize);
    canvasctx.drawImage(image, currentSprite_x, currentSprite_y, canvasSize, canvasSize, 0, 0, canvasSize, canvasSize);
}

function spritescontainer_mousemove(e) {
    var rect = document.getElementById("spritescontainer").getBoundingClientRect();
    var x = e.pageX - rect.x;
    var y = e.pageY - rect.y;

    document.getElementById("sectionpickerindicator").style.display = "block";
    document.getElementById("sectionpickerindicator").style.left = (x - x % canvasSize) + "px";
    document.getElementById("sectionpickerindicator").style.top = (y - y % canvasSize) + "px";
    document.getElementById("sectionpickerindicator").style.width = canvasSize + "px";
    document.getElementById("sectionpickerindicator").style.height = canvasSize + "px";

    if (e.buttons == 1) {
        spritescontainer_mousedown(e);
    }
}

function spritescontainer_mouseleave(e) {
    document.getElementById("sectionpickerindicator").style.display = "none";
}

function spritescontainer_mousedown(e) {
    var rect = document.getElementById("spritescontainer").getBoundingClientRect();
    var x = e.pageX - rect.x;
    var y = e.pageY - rect.y;
    x = (x - x % canvasSize);
    y = (y - y % canvasSize)

    document.getElementById("sectionpicker").style.left = x + "px";
    document.getElementById("sectionpicker").style.top = y + "px";
    document.getElementById("sectionpicker").style.width = canvasSize + "px";
    document.getElementById("sectionpicker").style.height = canvasSize + "px";

    currentSprite_x = x;
    currentSprite_y = y;

    drawCanvas();
}

var tools = {
    pen: {
        mousedown: function (x, y, c) {
            imagectx.fillStyle = c;
            imagectx.fillRect(x, y, 1, 1);
            drawCanvas();
        },
        mousemove: function (x, y, c) {
            imagectx.fillStyle = c;
            imagectx.fillRect(x, y, 1, 1);
            drawCanvas();
        },
        mouseup: function (x, y, c) {

        }
    },

    line: {
        startx: 0, starty: 0,
        mousedown: function (x, y, c) {
            tools.line.startx = x;
            tools.line.starty = y;

            drawCanvas();
            canvasctx.fillStyle = c;
            canvasctx.fillRect(x - currentSprite_x, y - currentSprite_y, 1, 1);
        },
        mousemove: function (x, y, c) {
            drawCanvas();
            canvasctx.fillStyle = c;
            drawLine(canvasctx,
                tools.line.startx - currentSprite_x, tools.line.starty - currentSprite_y,
                x - currentSprite_x, y - currentSprite_y);
        },
        mouseup: function (x, y, c) {
            imagectx.fillStyle = c;
            drawLine(imagectx,
                tools.line.startx, tools.line.starty,
                x, y);
            drawCanvas();
        }
    },

    rect: {
        startx: 0, starty: 0,
        mousedown: function (x, y, c) {
            tools.rect.startx = x;
            tools.rect.starty = y;

            drawCanvas();
            canvasctx.fillStyle = c;
            canvasctx.fillRect(x - currentSprite_x, y - currentSprite_y, 1, 1);
        },
        mousemove: function (x, y, c) {
            drawCanvas();
            canvasctx.fillStyle = c;
            drawRect(canvasctx,
                tools.rect.startx - currentSprite_x, tools.rect.starty - currentSprite_y,
                x - currentSprite_x, y - currentSprite_y);
        },
        mouseup: function (x, y, c) {
            imagectx.fillStyle = c;
            drawRect(imagectx,
                tools.rect.startx, tools.rect.starty,
                x, y);
            drawCanvas();
        }
    },

    circle: {
        startx: 0, starty: 0,
        mousedown: function (x, y, c) {
            tools.circle.startx = x;
            tools.circle.starty = y;

            drawCanvas();
            canvasctx.fillStyle = c;
            canvasctx.fillRect(x - currentSprite_x, y - currentSprite_y, 1, 1);
        },
        mousemove: function (x, y, c) {
            drawCanvas();
            canvasctx.fillStyle = c;
            var a = tools.circle.startx - x;
            var b = tools.circle.starty - y;
            var radius = Math.floor(Math.sqrt(a * a + b * b)) + 1;
            drawCircle(canvasctx,
                tools.circle.startx - currentSprite_x, tools.circle.starty - currentSprite_y,
                radius);
        },
        mouseup: function (x, y, c) {
            imagectx.fillStyle = c;
            var a = tools.circle.startx - x;
            var b = tools.circle.starty - y;
            var radius = Math.floor(Math.sqrt(a * a + b * b)) + 1;
            drawCircle(imagectx,
                tools.circle.startx, tools.circle.starty,
                radius);
            drawCanvas();
        }
    },

    fill: {
        tolerance: 0, confined: true, diagonal: false,
        mousedown: function (x, y, c) {
        },
        mousemove: function (x, y, c) {
        },
        mouseup: function (x, y, c) {
            imagectx.fillStyle = c;

            var area = undefined;
            if (tools.fill.confined) {
                area = { x: currentSprite_x, y: currentSprite_y, w: canvasSize, h: canvasSize }
            }

            floodFill.fill(x, y, tools.fill.tolerance, imagectx, tools.fill.diagonal, area);

            drawCanvas();
        }
    },

    pick: {
        mousedown: function (x, y, c) {
        },
        mousemove: function (x, y, c) {
        },
        mouseup: function (x, y, c) {
        }
    },

    select: {
        mousedown: function (x, y, c) {
        },
        mousemove: function (x, y, c) {
        },
        mouseup: function (x, y, c) {
        }
    },

}

function drawRect(ctx, x1, y1, x2, y2) {
    drawLine(ctx, x1, y1, x2, y1);
    drawLine(ctx, x1, y1, x1, y2);
    drawLine(ctx, x1, y2, x2, y2);
    drawLine(ctx, x2, y1, x2, y2);
}

function drawLine(ctx, x1, y1, x2, y2) {
    x1 = Math.round(x1);
    y1 = Math.round(y1);
    x2 = Math.round(x2);
    y2 = Math.round(y2);
    const dx = Math.abs(x2 - x1);
    const sx = x1 < x2 ? 1 : -1;
    const dy = -Math.abs(y2 - y1);
    const sy = y1 < y2 ? 1 : -1;
    var e2, er = dx + dy, end = false;
    ctx.beginPath();
    while (!end) {
        ctx.rect(x1, y1, 1, 1);
        if (x1 === x2 && y1 === y2) {
            end = true;
        } else {
            e2 = 2 * er;
            if (e2 > dy) {
                er += dy;
                x1 += sx;
            }
            if (e2 < dx) {
                er += dx;
                y1 += sy;
            }
        }
    }
    ctx.fill();
};

function drawCircle(ctx, x0, y0, radius) {
    var x = radius - 1;
    var y = 0;
    var dx = 3;
    var dy = 3;
    var err = dx - (radius << 1);

    ctx.beginPath();
    while (x >= y) {
        ctx.rect(x0 + x, y0 + y, 1, 1);
        ctx.rect(x0 + y, y0 + x, 1, 1);
        ctx.rect(x0 - y, y0 + x, 1, 1);
        ctx.rect(x0 - x, y0 + y, 1, 1);
        ctx.rect(x0 - x, y0 - y, 1, 1);
        ctx.rect(x0 - y, y0 - x, 1, 1);
        ctx.rect(x0 + y, y0 - x, 1, 1);
        ctx.rect(x0 + x, y0 - y, 1, 1);

        if (err <= 0) {
            y++;
            err += dy;
            dy += 2;
        }

        if (err > 0) {
            x--;
            dx += 2;
            err += dx - (radius << 1);
        }
    }
    ctx.fill();
}
