class FluidQuantity
{
    constructor(width, height, cellSize)
    {
        this.width = width
        this.height = height
        this.cellSize = cellSize
        this.totalBlock = (this.width + 2) * (this.height + 2)
        this.data_prev = new Array()
        this.data_prev.length = this.totalBlock
        this.data = new Array()
        this.data.length = this.totalBlock
        this.data_prev.fill(0)
        this.data.fill(0)
    }

    addSource(x_begin, x_end, y_begin, y_end, value)
    {
        var ix_begin = x_begin*this.width + 1
        var ix_end = x_end*this.width + 1
        var iy_begin = y_begin*this.height + 1
        var iy_end = y_end*this.height + 1

        // BUG: Border
        for(var i=ix_begin; i<=ix_end; i++)
            for(var j=iy_begin; j<=iy_end; j++)
                this.data_prev[i+j*(this.width+2)] = value
        console.log(this.data_prev);
    }
}
