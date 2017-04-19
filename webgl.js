var canvas
var gl
var msecPerFrame = 1000.0/30.0
var cell_x = 30
var cell_y = 30
var cell_z = 30

function webGLStart() {
    fluid = new FluidSolver(cell_x, cell_z, cell_y, 0.00001)

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

    u_density_texture_location = gl.getUniformLocation(shaderProgram, "u_density_tbo_tex")
    u_density_texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_3D, u_density_texture)
    gl.texImage3D(gl.TEXTURE_3D, 0, gl.R32F, (cell_x+2), (cell_z+2), (cell_y+2), 0, gl.RED, gl.FLOAT, new Float32Array(fluid.dense.data))
    gl.texParameterf(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameterf(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameterf(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameterf(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameterf(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
}

function drawScene()
{
    console.log("updating")
    fluid.add_flow(0.45, 0.55, 0.45, 0.55, 0.45, 0.45, 1, 1, 1, 1)
    fluid.update(0.05)

    //Render
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    
    gl.uniform2i(u_screenSize_location, gl.viewportWidth, gl.viewportHeight)
    gl.uniform2i(u_cellCount_loaction, cell_x, cell_z)

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0)

    //Texture Buffer
    gl.activeTexture(gl.TEXTURE0)
    gl.uniform1i(u_density_texture_location, 0)
    gl.bindTexture(gl.TEXTURE_3D, u_density_texture)
    gl.texImage3D(gl.TEXTURE_3D, 0, gl.R32F, (cell_x+2), (cell_z+2), (cell_y+2), 0, gl.RED, gl.FLOAT, new Float32Array(fluid.dense.data))
    
    gl.drawArrays(gl.TRIANGLES, 0, 6)
}
