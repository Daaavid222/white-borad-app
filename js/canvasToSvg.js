import { getLengthAndAngle } from "./index.js";
import { createViewModel, proxyList } from "./svgObjFactory.js";
import renderFn from "./updateSvg.js";

const container = document.querySelector("#white-borad");
const editor = document.querySelector("#white-borad");
export let svgSelectedId = null;

export default function canvasToSvg(points) {
  // 获取多边形大小;
  const [width, height, minX, minY] = calPolygonSize(points);

  const svg = createSvg(width, height);
  points = points.map((point) => ({
    x: point.x - minX,
    y: point.y - minY,
  }));
  const [svgContainer, svgObjProxy] = createSvgContainer(
    width,
    height,
    minX,
    minY,
    points
  );
  const svgPolygon = createSvgPolygon(points);
  // 将多边形元素添加到 SVG 元素中
  svg.appendChild(svgPolygon);
  const angles = calculateAngles(points);
  drawArcAndAnnotation(svg, points, angles);
  // 将 SVG 元素添加到 SVG 容器中
  svgContainer.appendChild(svg);
  // 将 SVG 容器添加到编辑器中
  container.appendChild(svgContainer);

  // 绑定点击选中状态
  svgPolygon.addEventListener("click", () => {
    if (svgSelectedId) {
      proxyList[svgSelectedId].selected = false;
    }
    svgSelectedId = svgObjProxy.id;
    svgObjProxy.selected = true;
  });
}

function calPolygonSize(points) {
  // 获取最小和最大的 x 和 y 坐标值
  const minX = Math.min(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxX = Math.max(...points.map((point) => point.x));
  const maxY = Math.max(...points.map((point) => point.y));

  // 计算多边形的宽度和高度
  const width = maxX - minX;
  const height = maxY - minY;
  return [width, height, minX, minY];
}

function createSvgContainer(width, height, minX, minY, points) {
  // 创建 SVG 容器
  const svgContainer = document.createElement("div");
  svgContainer.style.position = "absolute";
  svgContainer.style.transform = "translate(" + minX + "px, " + minY + "px)";
  svgContainer.style.width = width + "px";
  svgContainer.style.height = height + "px";

  // 动态生成基于时间戳的唯一 id
  const uniqueId = `svgObj-${Date.now()}`;
  svgContainer.id = uniqueId;

  // 创建svgObjProxy
  const svgObjProxy = createViewModel(
    {
      width: width,
      height: height,
      points: points,
      posX: minX,
      posY: minY,
      selected: false,
      points: points,
      id: uniqueId,
      color: "none",
      layerIndex: -1, // 表示默认
      instance: svgContainer,
    },
    renderFn
  );

  proxyList[uniqueId] = svgObjProxy;

  return [svgContainer, svgObjProxy];
}

function createSvgPolygon(points) {
  // 创建 SVG 的多边形元素
  const svgPolygon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "polygon"
  );

  // 构建多边形的点坐标字符串，并进行缩放和平移
  const pointsString = points.map((point) => `${point.x},${point.y}`).join(" ");

  // 设置多边形的点坐标属性
  svgPolygon.setAttribute("points", pointsString);
  svgPolygon.setAttribute("fill", "none");
  svgPolygon.setAttribute("stroke", "black");
  svgPolygon.setAttribute("stroke-width", "2");
  return svgPolygon;
}

function createSvg(width, height) {
  // 创建 SVG 元素
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.style.position = "absolute";
  svg.style.zIndex = "1000";
  return svg;
}

function calculateAngles(points) {
  const angles = [];
  const pointsLen = points.length;
  if (pointsLen < 2) return null;
  for (let i = 0; i < pointsLen; i++) {
    const pointA = points[i];
    const pointB = points[(i + 1) % pointsLen];
    const pointC = points[(i + 2) % pointsLen];

    const [, angle] = getLengthAndAngle(pointB, pointC, pointA);
    angles.push(angle);
  }

  return angles;
}

function drawArcAndAnnotation(svg, points, angles) {
  // 假设radius是预先确定的，或者基于多边形大小动态计算
  const radius = 30;

  points.forEach((point, index) => {
    // 计算当前点、下一点和上一点的坐标
    const currentPoint = point;
    const nextPoint = points[(index + 1) % points.length];
    const prevPoint = points[(index - 1 + points.length) % points.length];

    // 计算当前点到下一点的向量
    const vectorToNext = {
      x: nextPoint.x - currentPoint.x,
      y: nextPoint.y - currentPoint.y,
    };

    // 计算当前点到上一点的向量
    const vectorToPrev = {
      x: prevPoint.x - currentPoint.x,
      y: prevPoint.y - currentPoint.y,
    };

    // 计算两个向量与x轴正方向的夹角（作为扇形的起始和结束角度）
    const startAngle = Math.atan2(vectorToNext.y, vectorToNext.x);
    const endAngle = Math.atan2(vectorToPrev.y, vectorToPrev.x);

    // 计算内角扇形的角度差
    let angleDiff = endAngle - startAngle;

    // SVG arc命令是顺时针绘制的，largeArcFlag设置为0以绘制小角度扇形（内角）
    const largeArcFlag = 0;

    // 创建扇形路径
    const arcPathD = `
        M ${currentPoint.x} ${currentPoint.y}
        L ${currentPoint.x + radius * Math.cos(startAngle)} ${
      currentPoint.y + radius * Math.sin(startAngle)
    }
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${
      currentPoint.x + radius * Math.cos(endAngle)
    } ${currentPoint.y + radius * Math.sin(endAngle)}
        Z
      `;

    // 创建弧线元素并添加到SVG
    const arc = document.createElementNS("http://www.w3.org/2000/svg", "path");
    arc.setAttribute("d", arcPathD);
    arc.setAttribute("fill", "none");
    arc.setAttribute("stroke", "black");
    arc.setAttribute("stroke-width", "1");
    svg.appendChild(arc);

    // 计算文本标注位置（扇形弧的中点）
    const midAngle = startAngle + angleDiff / 2;
    const textPosition = {
      x: currentPoint.x + radius * Math.cos(midAngle),
      y: currentPoint.y + radius * Math.sin(midAngle),
    };

    // 创建文本元素并添加到SVG
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", textPosition.x);
    text.setAttribute("y", textPosition.y);
    text.setAttribute("font-size", "12px");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "central");
    text.textContent = `${angles[index].toFixed(1)}°`;
    svg.appendChild(text);
  });
}

editor.addEventListener("click", (e) => {
  if (svgSelectedId && e.target.tagName !== "polygon") {
    proxyList[svgSelectedId].selected = false;
    svgSelectedId = null;
  }
});
