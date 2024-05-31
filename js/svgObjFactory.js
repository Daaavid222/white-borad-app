import { CreateHistoryObj } from "./un-redo.js";

function SvgObj(ctx) {
  this.width = ctx.width;
  this.height = ctx.height;
  this.points = ctx.points;
  this.posX = ctx.posX;
  this.posY = ctx.posY;
  this.selected = this.selected;
  this.id = ctx.id;
  this.color = ctx.color;
  this.layerIndex = ctx.layerIndex;
  this.scale = ctx.scale;
  this.instance = ctx.instance;
}

let isRendering = false;

export function createViewModel(ctx, renderFn) {
  const svgObj = new SvgObj(ctx);
  const svgObjProxy = new Proxy(svgObj, {
    set(target, key, value) {
      Reflect.set(target, key, value);
      // CreateHistoryObj(svgObj);
      if (!isRendering) {
        Promise.resolve().then(() => {
          renderFn(target, key, value);
          isRendering = false;
        });
      }

      return true;
    },
  });

  return svgObjProxy;
}

export const proxyList = {};
