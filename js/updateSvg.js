import { proxyList } from "./svgObjFactory.js";
import { createDraggableBorder, setupDragListeners } from "./dragBorder.js";
import { showAttributeTab } from "./updateSvgAttributes.js";

const editor = document.querySelector("#white-borad");

const renderCaseMap = {
  width: sizeChange,
  height: sizeChange,
  selected: selectedChange,
  color: colorChange,
  layerIndex: layerIndexChange,
  posX: posChange,
  posY: posChange,
  points: pointsChange,
  scale: scaleChange,
};

export default function renderFn(target, key) {
  renderCaseMap[key](target);
}

function pointsChange(target) {
  const { points, instance } = target;
  // TODO:修改点坐标
}

function sizeChange(target) {
  const { instance, width, height } = target;
  const svgContainer = instance;
  const svg = svgContainer.children[0];
  const svgBorder = svgContainer.children[1];
  svgContainer.style.width = width + "px";
  svgContainer.style.height = height + "px";
  svgBorder.style.width = width + "px";
  svgBorder.style.height = height + "px";
  svg.style.width = width + "px";
  svg.style.height = height + "px";
}

function selectedChange(target) {
  const { selected, instance } = target;
  const svgContainer = instance;

  if (selected) {
    // 获取 svgContainer 的宽高
    const { width, height } = svgContainer.getBoundingClientRect();
    // 创建可拖动边框
    if (!svgContainer.border) {
      svgContainer.border = true;
      const controlPoints = createDraggableBorder(svgContainer, width, height);
      setupDragListeners(svgContainer, controlPoints);
    }
  } else {
    // 隐藏边框
    if (svgContainer.border) {
      svgContainer.border = false;
      svgContainer.removeChild(svgContainer.children[1]);
    }
  }
  showAttributeTab(selected);
}

function colorChange(target) {
  const { color, instance } = target;
  const svgContainer = instance;
  const svgPolygon = svgContainer.children[0].children[0];
  svgPolygon.style.fill = color;
}

function layerIndexChange(target) {
  if (target.layerIndex === 1) {
    editor.removeChild(target.instance);
    editor.appendChild(target.instance);
  } else {
    editor.insertBefore(target.instance, editor.firstChild);
  }
}

function posChange(target) {
  const { posX, posY, id } = target;
  const svgContainer = document.querySelector("#" + id);
  svgContainer.style.transform = "translate(" + posX + "px," + posY + "px)";
}

function scaleChange(target) {
//   const { scale, instance } = target;
//   const svgChildren = instance.children[0].children;
//   for (let i = 0; i < svgChildren.length; i++) {
//     let width = svgChildren[i].getAttribute("stroke-width");
//     width /= scale;
//     svgChildren[i].setAttribute("stroke-width", width);
//   }
}
