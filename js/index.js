import canvasToSvg from "./canvasToSvg.js";
import "./drag.js";

const editor = document.querySelector("#white-borad");
const drawBtn = document.querySelector("#draw-btn");
const widget = document.querySelector("#info-widget");
let actualWidth = null;
let actualHeight = null;
let canvas = null;
let ctx = null;
let pixelRatio = 1;
let points = [];
let isDrawing = false;
let tempPoint = null;

// 画笔按钮点击事件
drawBtn.addEventListener("click", () => {
  isDrawing = true;
  if (canvas !== null) {
    editor.removeChild(canvas);
    points = [];
  }
  createCanvas();
});

// 动态创建canvas
function createCanvas() {
  actualWidth = editor.getBoundingClientRect().width;
  actualHeight = editor.getBoundingClientRect().height;
  canvas = document.createElement("canvas");
  ctx = canvas.getContext("2d");
  // 根据分辨率动态创建canvas
  pixelRatio = window.devicePixelRatio || 1;
  canvas.width = actualWidth * pixelRatio;
  canvas.height = actualHeight * pixelRatio;
  canvas.style.border = "1px solid black";
  canvas.style.width = actualWidth + "px";
  canvas.style.height = actualHeight + "px";
  canvas.style.position = "absolute";
  ctx.scale(pixelRatio, pixelRatio);
  editor.appendChild(canvas);

  document.addEventListener("contextmenu", handleRightClick);
  canvas.addEventListener("click", handleCanvasClick);
  canvas.addEventListener("mousemove", handleCanvasMouseMove);
}

// 鼠标右键事件处理函数
function handleRightClick(e) {
  e.preventDefault();
  if (points.length > 1) {
    endAndCanvasToSvg();
  } else {
    widget.style.display = "none";
    endDrawing();
    editor.removeChild(canvas);
    canvas = null;
  }
}

// 画布点击事件处理函数
function handleCanvasClick(e) {
  if (!isDrawing) return;
  e.preventDefault();
  if (points.length > 2 && isNearStartPoint(e)) {
    endAndCanvasToSvg();
  } else {
    const [curPoint] = addPoint(e);
    points.push(curPoint);
  }
}

// 画布鼠标移动事件处理函数
function handleCanvasMouseMove(e) {
  if (!isDrawing || points.length === 0) return;

  let length = 0;
  let angle = 0;

  if (isNearStartPoint(e) && points.length > 2) {
    [, length, angle] = addPoint(e);
    tempPoint = points[0];
  } else {
    [tempPoint, length, angle] = addPoint(e);
  }

  showWidget(e, length, angle);
  draw();
}

function showWidget(e, length, angle) {
  widget.style.display = "block";
  const { x, y } = { x: e.clientX, y: e.clientY };
  widget.style.transform = `translate(${x + 20}px, ${y + 20}px)`;
  widget.innerText = `长度：${length.toFixed(1)} 角度：${angle.toFixed(1)}°`;
}

// 连成多边形，初始化参数
function endDrawing() {
  points = [];
  isDrawing = false;
  tempPoint = null;
}

// 获取当前点坐标
function getCurPointPos(e) {
  const rect = editor.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  return { x, y };
}

// 添加点到数组中
function addPoint(e) {
  const { x, y } = getCurPointPos(e);
  const point = { x, y };
  let length = 0;
  let angle = 0;

  if (points.length === 1) {
    const lastPoint = points[points.length - 1];
    [length, angle] = getLengthAndAngle(lastPoint, point);
  }
  if (points.length > 1) {
    const p1 = points[points.length - 2];
    const p2 = points[points.length - 1];
    [length, angle] = getLengthAndAngle(p2, point, p1);
  }

  return [point, length, angle];
}

// 绘制多边形背景
function fillBackground(curPoints) {
  if (curPoints.length > 2) {
    ctx.fillStyle = "rgba(128, 128, 128, 0.4)";
    ctx.beginPath();
    ctx.moveTo(curPoints[0].x, curPoints[0].y);
    for (let i = 1; i < curPoints.length; i++) {
      ctx.lineTo(curPoints[i].x, curPoints[i].y);
    }
    ctx.closePath();
    ctx.fill();
  }
}

// 绘制函数
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < points.length; i++) {
    ctx.beginPath();
    ctx.arc(points[i].x, points[i].y, 2, 0, 2 * Math.PI);
    ctx.fillStyle = i === points.length - 1 ? "red" : "black";
    ctx.fill();

    if (i > 0) {
      ctx.moveTo(points[i - 1].x, points[i - 1].y);
      ctx.lineTo(points[i].x, points[i].y);
      ctx.stroke();
    }
  }

  if (tempPoint) {
    ctx.beginPath();
    ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.lineTo(tempPoint.x, tempPoint.y);
    ctx.stroke();
    fillBackground([...points, tempPoint]);
  }
}

// 求连线长度和角度
export function getLengthAndAngle(point1, point2, point3) {
  let length = 0;
  let angle = 0;
  if (point3 === undefined) {
    length = Math.sqrt((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2);
    angle =
      (Math.atan2(point2.y - point1.y, point2.x - point1.x) * 180) / Math.PI;
  } else {
    const x1 = point2.x - point1.x;
    const y1 = point2.y - point1.y;

    // 计算向量AC的分量
    const x2 = point3.x - point1.x;
    const y2 = point3.y - point1.y;

    // 计算余弦值
    const dotProduct = x1 * x2 + y1 * y2;
    const lengthAB = Math.sqrt(x1 * x1 + y1 * y1);
    const lengthAC = Math.sqrt(x2 * x2 + y2 * y2);
    const cosTheta = dotProduct / (lengthAB * lengthAC);

    // 将余弦值转换为角度值
    const angleInRadians = Math.acos(cosTheta);
    angle = (angleInRadians * 180) / Math.PI;
    length = lengthAB;
  }

  return [length, angle];
}

// 判断鼠标是否靠近起始点
function isNearStartPoint(e) {
  const { x, y } = getCurPointPos(e);
  const distance = Math.sqrt((x - points[0].x) ** 2 + (y - points[0].y) ** 2);
  return distance < 10;
}

// 根据canvas的点信息生成svg，并将points设为空
function endAndCanvasToSvg() {
  widget.style.display = "none";
  canvasToSvg(points, actualWidth, actualHeight, pixelRatio);
  endDrawing();
  editor.removeChild(canvas);
  canvas = null;
}
