// Original parallax geometry by Hakadao (MIT).
if (matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) {
const mouse = { x: innerWidth / 2, y: innerHeight / 2 } // 遊標位置
const pos = { ...mouse } // 跟蹤到達位置

document
  .querySelector('body')
  .addEventListener('mousemove', ({ x, y }) => {
    mouse.x = x
    mouse.y = y
  })

window.addEventListener('resize', () => {
  mouse.x = pos.x = innerWidth / 2
  mouse.y = pos.y = innerHeight / 2
})

requestAnimationFrame(function movement() {
  const easting = 10
  pos.x += (mouse.x - pos.x) / easting
  pos.y += (mouse.y - pos.y) / easting
  const xValue = calcValue(pos.x, window.innerWidth)
  const yValue = calcValue(pos.y, window.innerHeight)

  document.querySelector(
    '#media-layer-view'
  ).style.transform = `translate3d(${xValue}px, ${yValue}px, 0) rotateX(${-yValue}deg) rotateY(${xValue}deg)`
  document.querySelector('#media-layer-front').style.transform = `translate3d(${
    xValue * 7.7
  }px, ${yValue * 3}px, 50px) rotateX(${-yValue}deg) rotateY(${
    xValue
  }deg)`

  requestAnimationFrame(movement)
})

function calcValue(a, b) {
  const range = 20
  return (a / b) * range - range / 2
}

}
