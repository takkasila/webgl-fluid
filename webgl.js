var canvas
var gl
var msecPerFrame = 1000.0/30.0
var cell_x = 100
var cell_y = 100

function webGLStart() {
    fluid = new FluidSolver(cell_x, cell_y, 0.00001)
    initWebGL()
    initShaders()
    initBuffer()
    setInterval(drawScene, msecPerFrame);
}

function initWebGL()
{
    canvas = document.getElementById("glCanvas")
    try
    {
        gl = canvas.getContext("webgl2")
            || canvas.getContext("experimental-webgl2")
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
        var extensions = gl.getSupportedExtensions()
        gl.getExtension('EXT_color_buffer_float')

        // console.log(gl)
        // console.log(extensions)
        // console.log(gl.getParameter(gl.VERSION));
        // console.log(gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
        // console.log(gl.getParameter(gl.VENDOR));

        gl.clearColor(1.0, 0.0, 0.0, 1.0)
        gl.clearDepth(1.0)
        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.LEQUAL)
    }
    catch (error)
    {
        alert("Browser does not support WebGL2")
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

    u_cellCount_loaction = gl.getUniformLocation(shaderProgram, "cellCount")

    u_density_texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, u_density_texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, (cell_x+2), (cell_y+2), 0, gl.RED, gl.FLOAT, new Float32Array(fluid.dense.data))
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
}

function drawScene()
{
    //Update fluid
    // fluid.add_flow(0.45, 0.55, 0.45, 0.55, -1, -1)
    fluid.add_flow(0.48, 0.52, 0, 0.03, 1, 0, 1)
    // fluid.add_flow(0.97, 1, 0.48, 0.52, 1, -1, 0)
    // fluid.add_flow(0.0, 0.1, 0.4, 0.7, 1, 0)
    // fluid.add_flow(0.4, 0.7, 0.0, 0.1, 0, 1)
    // fluid.add_flow(0.9, 1.0, 0.4, 0.7, -1, 0)
    fluid.update(0.05)

    //Render
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.uniform2i(u_screenSize_location, gl.viewportWidth, gl.viewportHeight)
    gl.uniform2i(u_cellCount_loaction, cell_x, cell_y)
    gl.bindTexture(gl.TEXTURE_2D, u_density_texture)
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0)

    //Texture Buffer
    gl.bindTexture(gl.TEXTURE_2D, u_density_texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, (cell_x+2), (cell_y+2), 0, gl.RED, gl.FLOAT, new Float32Array(fluid.dense.data))
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.drawArrays(gl.TRIANGLES, 0, 6)
}
