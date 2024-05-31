import { svgSelectedId } from "./canvasToSvg.js";
import { proxyList } from "./svgObjFactory.js";

const attributeTab = document.querySelector("#attribute-tab");
const noneTab = document.querySelector("#none-content");
const colorPicker = document.querySelector("#color-picker");
const toTopBtn = document.querySelector("#to-top-btn");
const toBottomBtn = document.querySelector("#to-bottom-btn");

// 显示隐藏逻辑
export function showAttributeTab(isSelected) {
  if (isSelected) {
    colorPicker.value = proxyList[svgSelectedId].color;
    attributeTab.style.display = "flex";
    noneTab.style.display = "none";
  } else {
    attributeTab.style.display = "none";
    noneTab.style.display = "block";
  }
}

// 绑定colorPicker改变同步到viewModel
colorPicker.addEventListener("input", (e) => {
  if (!svgSelectedId) return;
  proxyList[svgSelectedId].color = e.target.value;
});

// 绑定层级交换
toTopBtn.addEventListener("click", () => handleChangeLayer(true));
toBottomBtn.addEventListener("click", () => handleChangeLayer(false));

function handleChangeLayer(toTop) {
  if (toTop) {
    proxyList[svgSelectedId].layerIndex = 1;
  } else {
    proxyList[svgSelectedId].layerIndex = 0;
  }
}
