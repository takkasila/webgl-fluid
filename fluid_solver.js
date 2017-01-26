class FluidSolver
{
    constructor(width, height, diffusion_rate)
    {
        this.width = width
        this.height= height
        this.diffusion_rate = diffusion_rate
        this.cellSize = 1.0/Math.min(width, height)

        this.dense = new FluidQuantity(this.width, this.height, this.cellSize)
        this.speed_x = new FluidQuantity(this.width, this.height, this.cellSize)
        this.speed_y = new FluidQuantity(this.width, this.height, this.cellSize)

        this.totalBlock = (this.width + 2) * (this.height + 2)
        this.dense_f = new Array()
        this.dense_f.length = this.totalBlock
        this.dense_f.fill(0.0)
        this.p = new Array()
        this.p.length = this.totalBlock
        this.p.fill(0.0)
        this.div = new Array()
        this.div.length = this.totalBlock
        this.div.fill(0.0)
    }

    update(timeStep)
    {
        velocityStep(timeStep)
        densityStep(timeStep)
    }

    velocityStep(timeStep)
    {

    }

    densityStep(timeStep)
    {

    }

    diffuse(data, data_prev, timeStep, u_cond, v_cond)
    {

    }

    advect(data, data_prev, u, v, timeStep, u_cond, v_cond)
    {

    }

    project(u, v)
    {

    }

    linear_solver(data, data_prev, coeff1, coeff2, u_cond, v_cond)
    {

    }

    set_boundary(data, u_cond, v_cond)
    {

    }

    add_flow(x_begin, x_end, y_begin, y_end, dense, speed_x, speed_y)
    {

    }

    double_to_float()
    {

    }

    AT(i, j)
    {

    }

    SWAP(a, b)
    {

    }

    lerp(a, b, amount)
    {

    }
}
