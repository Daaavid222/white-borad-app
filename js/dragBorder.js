import { svgSelectedId } from "./canvasToSvg.js";
import { proxyList } from "./svgObjFactory.js";

const editor = document.querySelector("#white-borad");
let currentPoint = null;
let curSvgContainer = null;
export function createDraggableBorder(container, width, height) {
  // 创建一个用于定位的 div
  const borderContainer = document.createElement("div");
  borderContainer.style.position = "absolute";
  borderContainer.style.width = width + "px";
  borderContainer.style.height = height + "px";
  borderContainer.style.left = "0px";
  borderContainer.style.top = "0px";
  borderContainer.style.border = "2px dashed #000";

  // 创建四个控制点
  const controlPoints = {
    topLeft: createControlPoint(-5, -5, "top-left"),
    topRight: createControlPoint(width - 5, -5, "top-right"),
    bottomLeft: createControlPoint(-5, height - 5, "bottom-left"),
    bottomRight: createControlPoint(width - 5, height - 5, "bottom-right"),
  };

  // 将控制点添加到容器中
  Object.values(controlPoints).forEach((point) => {
    borderContainer.appendChild(point);
  });

  // 将边框容器添加到传入的容器中
  container.appendChild(borderContainer);

  // 返回创建的控制点对象
  return controlPoints;
}

function createControlPoint(x, y, position) {
  const circle = document.createElement("div");
  circle.style.position = "absolute";
  circle.style.width = "10px";
  circle.style.height = "10px";
  circle.style.borderRadius = "50%";
  circle.style.backgroundColor = "blue";
  circle.style.cursor = "pointer";
  circle.style.left = x + "px";
  circle.style.top = y + "px";
  circle.className = "control-point";
  return circle;
}

export function setupDragListeners(svgContainer, controlPoints) {
  Object.entries(controlPoints).forEach(([key, point]) => {
    point.startX = 0;
    point.startY = 0;
    point.startWidth = parseFloat(svgContainer.style.width);
    point.startHeight = parseFloat(svgContainer.style.height);
    point.position = key; // 例如 'top-left'
    point.addEventListener("mousedown", (e) => {
      e.preventDefault();
      point.startX = e.clientX;
      point.startY = e.clientY;
      currentPoint = point;
      curSvgContainer = svgContainer;
      editor.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  });
}

const onMouseMove = (e) => {
  if (!currentPoint || !curSvgContainer) return;
  const controlPoints = document.querySelectorAll(".control-point");
  for (let i = 0; i < controlPoints.length; i++) {
    controlPoints[i].style.opacity = 0;
  }
  console.log(controlPoints);
  const svgObjProxy = proxyList[svgSelectedId];
  const deltaX = e.clientX - currentPoint.startX;
  const scale = currentPoint.startHeight / currentPoint.startWidth;
  const deltaY = deltaX * scale;

  // 计算新的宽度和高度
  let newWidth = currentPoint.startWidth + deltaX;
  let newHeight = currentPoint.startHeight + deltaY;

  // 确保新的尺寸不小于最小值
  newWidth = Math.max(newWidth, 50);

  switch (currentPoint.position) {
    case "top-left":
      svgObjProxy[posX] += deltaX;
      svgObjProxy[posY] += deltaY;
      break;
    case "top-right":
      svgObjProxy[posY] -= deltaY;
      break;
    case "bottom-left":
      svgObjProxy[posX] += deltaX;
      break;
    case "bottom-right":
      break;
  }

  // TODO:修改点坐标
  //   proxyList[svgSelectedId].points = proxyList[svgSelectedId].points.map(
  //     (point) => {}
  //   );
  proxyList[svgSelectedId].width = newWidth;
  proxyList[svgSelectedId].height = newHeight;
  proxyList[svgSelectedId].scale = newWidth / currentPoint.startWidth;
};

const onMouseUp = () => {
  const controlPoints = document.querySelectorAll(".control-point");
  for (let i = 0; i < controlPoints.length; i++) {
    controlPoints[i].style.opacity = 0;
  }
  editor.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
};
