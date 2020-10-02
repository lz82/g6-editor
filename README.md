# 人人都会做系列之流程设计图

## 前言

很长一段时间以来，一些诸如 BPM 啊，或者所谓的 xxx 自动化的产品，在介绍亮点的时候，其中都会有一条是可视化编辑流程图。
正好最近有个契机，就实现了一下基础功能。

## 技术栈

1. `React` + `Hook` + `TypeScript`,这个是未来至少一两年最主流的（之一）

2. AntV 的`G6`(3.8.0)

3. 基于`Cra`脚手架初始化的项目，基于`customize-cra`对`webpack`做了一些基础配置变更，比如支持`less module`，支持`alias`这些就不赘述了。

4. `react-dnd`实现从工具栏拖拽至画布

## 项目地址

- 代码: [github](https://github.com/lz82/g6-editor)
- 演示: [preview](https://github.com/lz82/g6-editor)

## G6 简介

[G6](https://antv-g6.gitee.io/zh/docs/manual/introduction)是一个图可视化引擎，简单的说就是用来展示关系的。既然是关系，那数据中必不可少的就是`nodes`和`edges`了，其中`nodes`用来描述节点，`edges`用来描述边，最基础的如下所示:

```javasrcipt
const graphData = {
  nodes: [
    {
      id: 'node-1',
      label: 'node1'
    },
    {
      id: 'node-2',
      label: 'node2'
    }
  ],
  edges: [
    {
      source: 'node-1',
      target: 'node-2',
      label: 'edge1'
    }
  ]
}

```

有了以上格式的数据，`G6`就会自动生成`关系图`(以“图”的形式，展示主体与关系)。

## 思路

流程图本质上来说，其实也就是“关系图”，每一个过程就是一个节点，过程之间的关系就是边。
有了这个认知，再基于现在的数据驱动的思路，如何基于`G6`生成流程图就很简单了。

- 从工具栏拖动工具到画布上，触发增加`node`的事件，为图数据增加一个`node`
- 从`node`的`anchorPointer`开始拖拽时，触发增加`edge`的事件，为图数据增加一条`edge`
- 当鼠标拖拽着`node`移动时，触发更新`edge`坐标事件，实时修改`edge`的坐标（x 和 y 的值）
- 当鼠标松开时，判断当前鼠标位置。如果在某个 node 上，增将当前`edge`的`target`指定为当前`node`，否则删除当前`edge`
- 选中某个`node`或者`edge`时，获取其属性(label)，当修改`label`值并按下保存后，将新的`label`的值更新至图数据
- 在`node`或者`edge`上使用鼠标右键点击时，呼出`contextMenu`,点击删除后，删除`node`或者`edge`。需要注意的是，如果删除的是`edge`，直接删除即可。如果是`node`的话，则需要同时将起点(source)和终点(target)为该`node`的`edge`也同时删除

## 具体实现

### 工具栏拖拽
