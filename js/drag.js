import { proxyList } from "./svgObjFactory.js";

const editor = document.querySelector("#white-borad");

editor.addEventListener("mousedown", handleMouseDown);
editor.addEventListener("mousemove", handleMouseMove);
document.addEventListener("mouseup", handleMouseUp);

let dragging = false;
let currentSvgObjProxy = null;
let initialOffset = { x: 0, y: 0 };

function handleMouseDown(e) {
  e.stopPropagation();
  if (e.target.tagName === "polygon") {
    dragging = true;
    const svgContainer = e.target.parentNode.parentNode;
    const svgContainerId = svgContainer.id;
    currentSvgObjProxy = proxyList[svgContainerId];
    if (currentSvgObjProxy) {
      const boundingRect = svgContainer.getBoundingClientRect();
      initialOffset = {
        x: e.clientX - boundingRect.left,
        y: e.clientY - boundingRect.top,
      };
    }
  }
}

function handleMouseMove(e) {
  e.stopPropagation();
  if (!dragging || !currentSvgObjProxy) return;

  const svgContainer = currentSvgObjProxy.instance;
  const boundingRect = svgContainer.getBoundingClientRect();
  const offsetX = e.clientX - boundingRect.left;
  const offsetY = e.clientY - boundingRect.top;

  // 计算偏移量
  const deltaX = offsetX - initialOffset.x;
  const deltaY = offsetY - initialOffset.y;

  // 更新svgObj
  currentSvgObjProxy.posX += deltaX;
  currentSvgObjProxy.posY += deltaY;
}

function handleMouseUp(e) {
  e.stopPropagation();
  dragging = false;
  currentSvgObjProxy = null;
}
