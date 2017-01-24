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
    initShaders()
    initBuffer()
    drawScene()
}

function initWebGL()
{
    canvas = document.getElementById("glCanvas")
    try
    {
        gl = canvas.getContext("webgl") ||
            canvas.getContext("experimental-webgl") ||
            canvas.getContext("moz-webgl") ||
            canvas.getContext("webkit-3d")
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
        var extensions = gl.getSupportedExtensions()
        // console.log(gl)
        // console.log(extensions)
        gl.clearColor(1.0, 0.0, 0.0, 1.0)
        gl.clearDepth(1.0)
        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.LEQUAL)
    }
    catch (error)
    {
        alert("Browser does not support WebGL")
    }
}

function initShaders()
{
    var vertexShader = getShader("shader-vs", gl.VERTEX_SHADER)
    var fragmentShader = getShader("shader-fs", gl.FRAGMENT_SHADER)

    shaderProgram = gl.createProgram()
    gl.attachShader(shaderProgram, vertexShader)
    gl.attachShader(shaderProgram, fragmentShader)
    gl.linkProgram(shaderProgram)

    if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
        console.log("Unable to initialize the shader program: " + gl.getProgramInfoLog(shaderProgram))

    gl.useProgram(shaderProgram)

    vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "pos")
    gl.enableVertexAttribArray(vertexPositionAttribute)
}

function getShader(id, type)
{
    var shaderScript, theSource, currentChild, shader

    shaderScript = document.getElementById(id)
    if(!shaderScript)
        return null

    theSource = shaderScript.text
    if(!type)
    {
        if(shaderScript.type == "x-shader/x-fragment")
            type = gl.FRAGMENT_SHADER
        else if (shaderScript.type == "x-shader/x-vertex")
            type = gl.VERTEX_SHADER
        else
            return null
    }

    shader = gl.createShader(type)
    gl.shaderSource(shader, theSource)
    gl.compileShader(shader)

    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    {
        console.log("Error compiling shader: " + gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
    }

    return shader
}

function initBuffer()
{
    var vertex_buffer_data =
    [
        -1.0, -1.0, 0.0
        , 1.0, -1.0, 0.0
        , 1.0, 1.0, 0.0
        , -1.0, -1.0, 0.0
        , 1.0, 1.0, 0.0
        , -1.0, 1.0, 0.0
    ]
    vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex_buffer_data), gl.STATIC_DRAW)

    u_screenSize_location = gl.getUniformLocation(shaderProgram, "screenSize")
}

function drawScene()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.uniform2i(u_screenSize_location, gl.viewportWidth, gl.viewportHeight)
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
}
