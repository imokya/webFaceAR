export const gaussBlur = function (imgData, radius) {

  radius *= 3 

  const pixes = new Uint8ClampedArray(imgData.data)
  const width = imgData.width
  const height = imgData.height

  let gaussSum = 0,
    x, y,
    r, g, b, a, i;

  radius = Math.floor(radius)
  //sigma越小中心点权重越高, sigma越大越接近平均模糊
  const sigma = radius / 3
  //两个分布无相关性, 为了各方向上权重分布一致
  const Ror = 0

  const L = radius * 2 + 1  //矩阵宽度

  const Ror2 = Ror * Ror
  const s2 = sigma * sigma
  const c1 = 1 / (2 * Math.PI * s2 * Math.sqrt(1 - Ror * Ror))
  const c2 = -1 / (2 * (1 - Ror2))

  //定义高斯矩阵 , 存储在一维数组中
  const gaussMatrix = []

  //根据 xy 计算 index
  gaussMatrix.getIndex = (x, y) => {
    return (x + radius) + (y + radius) * L
  }
  //根据 xy 获取权重
  gaussMatrix.getWeight = (x, y) => {
    return gaussMatrix[gaussMatrix.getIndex(x, y)]
  }
  //根据 index 获取 x 偏移
  gaussMatrix.getX = (index) => {
    return index % L - radius
  }
  //根据 index 获取 y 偏移
  gaussMatrix.getY = (index) => {
    return Math.floor(index / L) - radius
  }

  //覆写forEach , 方便遍历
  gaussMatrix.forEach = (f) => {
    gaussMatrix.map((w, i) => {
      f(w, gaussMatrix.getX(i), gaussMatrix.getY(i))
    })
  }

  //生成高斯矩阵
  for (y = -radius; y <= radius; y++) {
    for (x = -radius; x <= radius; x++) {
      let i = gaussMatrix.getIndex(x, y)
      g = c1 * Math.exp(c2 * (x * x + 2 * Ror * x * y + y * y) / s2)
      gaussMatrix[i] = g
    }
  }

  //快捷获取像素点数据
  const getPixel = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) {
      return null
    }
    let p = (x + y * width) * 4
    return pixes.subarray(p, p + 4)
  }

  i = 0
  for (y = 0; y < height; y++) {
    for (x = 0; x < width; x++) {

      //重置 r g b a Sum
      r = g = b = a = 0
      gaussSum = 0

      //遍历模糊半径内的其他点
      gaussMatrix.forEach((w, dx, dy) => {
        let p = getPixel(x + dx, y + dy)
        if (!p) return

        //求加权和
        r += p[0] * w
        g += p[1] * w
        b += p[2] * w
        a += p[3] * w
        gaussSum += w
      });

      imgData.data.set([r, g, b, a].map(v => v / gaussSum), i)

      i += 4
    }
  }

  return imgData
}