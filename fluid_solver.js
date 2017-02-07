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
        this.p = new Array()
        this.p.length = this.totalBlock
        this.p.fill(0.0)
        this.div = new Array()
        this.div.length = this.totalBlock
        this.div.fill(0.0)
    }

    update(timeStep)
    {
        this.velocityStep(timeStep)
        this.densityStep(timeStep)
    }

    velocityStep(timeStep)
    {
        this.diffuse(this.speed_x.data, this.speed_x.data_prev, timeStep, true, false)
        this.diffuse(this.speed_y.data, this.speed_y.data_prev, timeStep, false, true)
        this.project(this.speed_x.data, this.speed_y.data)
        this.advect(this.speed_x.data_prev, this.speed_x.data, this.speed_x.data, this.speed_y.data, timeStep, true, false)
        this.advect(this.speed_y.data_prev, this.speed_y.data, this.speed_x.data, this.speed_y.data, timeStep, false, true)
        this.project(this.speed_x.data_prev, this.speed_y.data_prev)
        this.SWAP(this.speed_x.data, this.speed_x.data_prev)
        this.SWAP(this.speed_y.data, this.speed_y.data_prev)
    }

    densityStep(timeStep)
    {
        this.diffuse(this.dense.data, this.dense.data_prev, timeStep, false, false)
        this.advect(this.dense.data_prev, this.dense.data, this.speed_x.data, this.speed_y.data, timeStep, false, false)
        this.SWAP(this.dense.data, this.dense.data_prev)
    }

    diffuse(data, data_prev, timeStep, u_cond, v_cond)
    {
        var coeff1 = timeStep*this.diffusion_rate*this.width*this.height
        var coeff2 = 1 + 4 * coeff1
        this.linear_solver(data, data_prev, coeff1, coeff2, u_cond, v_cond)
    }

    advect(data, data_prev, u, v, timeStep, u_cond, v_cond)
    {
        var x, y
        var i0, i1, j0, j1
        for (var j = 1; j <= this.height; j++)
			for (var i = 1; i <= this.width; i++)
			{
				//Traceback particle
				x = i - u[this.AT(i, j)]*timeStep*this.width
				y = j - v[this.AT(i, j)]*timeStep*this.height
				//Screen boundary condition
				if (x < 0.5) x = 0.5
				if (x > this.width + 0.5) x = this.width + 0.5
				if (y < 0.5) y = 0.5
				if (y > this.height + 0.5) y = this.height + 0.5
				//Find four closest neighbor
				i0 = Math.round(x)
				i1 = i0 + 1
				j0 = Math.round(y)
				j1 = j0 + 1
				//Interpolate four closest neighbor
				data[this.AT(i, j)] =
					this.lerp(
						this.lerp(data_prev[this.AT(i0, j0)], data_prev[this.AT(i1, j0)], x - i0) // bottom
						, this.lerp(data_prev[this.AT(i0, j1)], data_prev[this.AT(i1, j1)], x - i0) // top
						, y-j0)
			}
		this.set_boundary(data, u_cond, v_cond)
    }

    project(u, v)
    {
        for (var j = 1; j <= this.height; j++)
            for (var i = 1; i <= this.width; i++)
            {
                this.div[this.AT(i, j)] = -0.5*this.cellSize*(u[this.AT(i + 1, j)] - u[this.AT(i - 1, j)]
                    + v[this.AT(i, j + 1)] - v[this.AT(i, j - 1)])
                this.p[this.AT(i, j)] = 0
            }
        this.set_boundary(this.div, false, false)
        this.set_boundary(this.p, false, false)

        this.linear_solver(this.p, this.div, 1, 4, 0, 0)

        for (var j = 1; j <= this.height; j++)
            for (var i = 1; i <= this.width; i++)
            {
                u[this.AT(i, j)] -= 0.5*(this.p[this.AT(i + 1, j)] - this.p[this.AT(i - 1, j)])/this.cellSize
                v[this.AT(i, j)] -= 0.5*(this.p[this.AT(i, j + 1)] - this.p[this.AT(i, j - 1)])/this.cellSize
            }
        this.set_boundary(u, true, false)
        this.set_boundary(v, false, true)
    }

    linear_solver(data, data_prev, coeff1, coeff2, u_cond, v_cond)
    {
        for (var k = 0; k < 20; k++)
        {
            for (var j = 1; j <= this.height; j++)
                for (var i = 1; i <= this.width; i++)
                {
                    data[this.AT(i, j)] =
                        (
                        data_prev[this.AT(i, j)]
                        +
                        coeff1 *
                        (
                        data[this.AT(i - 1, j)] + data[this.AT(i + 1, j)] + data[this.AT(i, j - 1)] + data[this.AT(i, j + 1)]
                        )
                        )
                        /
                        (coeff2);
                }
            this.set_boundary(data, u_cond, v_cond);
        }
    }

    set_boundary(data, u_cond, v_cond)
    {
        //Edge
		var coef_u = u_cond == true ? -1 : 1
		var coef_v = v_cond == true ? -1 : 1
		for (var i = 1; i <= this.width; i++)
		{
			data[this.AT(i, 0)] = data[this.AT(i, 1)] * coef_v
			data[this.AT(i, this.height + 1)] = data[this.AT(i, this.height)] * coef_v
		}
		for (var j = 1; j <= this.height; j++)
		{
			data[this.AT(0, j)] = data[this.AT(1, j)] * coef_u
			data[this.AT(this.width + 1, j)] = data[this.AT(this.width, j)] * coef_u
		}
		//Corner
		data[this.AT(0, 0)] = (data[this.AT(0, 1)] + data[this.AT(1, 0)]) / 2;
		data[this.AT(this.width + 1, 0)] = (data[this.AT(this.width, 0)] + data[this.AT(this.width + 1, 1)]) / 2;
		data[this.AT(this.width + 1, this.height + 1)] = (data[this.AT(this.width, this.height + 1)] + data[this.AT(this.width + 1, this.height)]) / 2;
		data[this.AT(0, this.height+1)] = (data[this.AT(1, this.height+1)] + data[this.AT(0, this.height)]) / 2;
    }

    add_flow(x_begin, x_end, y_begin, y_end, dense, speed_x, speed_y)
    {
        this.dense.add_source(x_begin, x_end, y_begin, y_end, dense)
        this.speed_x.add_source(x_begin, x_end, y_begin, y_end, speed_x)
        this.speed_y.add_source(x_begin, x_end, y_begin, y_end, speed_y)
    }

    AT(i, j)
    {
        return i + j*(this.width+2)
    }

    SWAP(a, b)
    {
        var temp = a
        a = b
        b = temp
    }

    lerp(a, b, amount)
    {
        return a + (b-a) * Math.min( Math.max(amount, 0), 1)
    }

}
