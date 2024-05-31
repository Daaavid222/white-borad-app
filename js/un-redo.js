export const historyList = [];

export function CreateHistoryObj(ctx) {
  this.type = ctx.type; // 新增还是删除 type属性有 'add' 'delete'
  this.id = ctx.id; // 与svg对应
  this.points = ctx.points;
  this.width = ctx.width;
  this.height = ctx.height;
  this.posX = ctx.posX;
  this.posY = ctx.posY;
  this.color = ctx.color;
  this.layerIndex = ctx.layerIndex;
  this.scale = ctx.scale;
  this.instance = ctx.instance;
}
