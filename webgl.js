var canvas
var gl
var msecPerFrame = 1000.0/60.0

class Timer {
    constructor(interval) {
        this.startTime = Date.now()
        this.markTime = this.startTime
        this.counter = this.startTime
        this.msecPerFrame = interval
    }

    isReady()
    {
        this.counter = Date.now()
        if(this.counter - this.markTime >= this.interval)
            return true
        else
            return false
    }

    tick()
    {
        this.counter = this.markTime = Date.now()
    }
}

function webGLStart() {
    initWebGL()
    gl.clearColor(1.0, 0.0, 0.0, 1.0)
    gl.clearDepth(1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)

    while(true)
    {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        console.log(Date.now())
    }
}

function initWebGL() {
    canvas = document.getElementById("glCanvas")
    try {
        gl = canvas.getContext("webgl") ||
            canvas.getContext("experimental-webgl") ||
            canvas.getContext("moz-webgl") ||
            canvas.getContext("webkit-3d")
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
        var extensions = gl.getSupportedExtensions()
        console.log(gl)
        console.log(extensions)
    } catch (error) {
        alert("Browser does not support WebGL");
    }
}
