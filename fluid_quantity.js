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

    }
}
