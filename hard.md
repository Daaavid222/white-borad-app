# 问题

1. canvas svg 各种 api
2. canvas 转换成 svg 动态创建 svg 标签，通过 canvas 属性构造 svg
3. 需要创建右键菜单
4. 使用时间戳动态生成 svgId，把 svg 中的必要属性通过工厂创建保存在 svgObj 中，存在一个 list 里
5. canvas 转换成 svg 的时候出现了 svg 会比 canvas 大的问题，原因是坐标由 canvas 决定，canvas 宽高会影响缩放比例，两种解决方案：将计算缩放比例或者将 svg 和 canvas 设置成宽高相等
6. canvas 坑：style 中修改 canvas 宽高相当于对默认宽度进行缩放，这个也是 canvas 模糊的原因，根据设备像素比 dpr 来动态确定 canvas 的宽高
7. 画角度：1. 计算内角 2. svg 绘制 3. 以端点为半径 4. 弧线绘制会涉及到内角外角，角度计算
8. 给 polygon 绑定事件无法触发，原因是默认屏蔽了鼠标事件屏蔽了，设置 css 属性 pointer-event：none 可以解决
9. 拖动的时候图形会抖动，性能问题，尝试使用节流，没有改善，最终使用 requestIdleCallback 解决
10. 角度长度显示问题：通过坐标运算，得出角度和长度，修改 widget 的 transform 属性，跟随鼠标