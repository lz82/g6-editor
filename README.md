# 人人都会做系列之流程设计图

## 前言

很长一段时间以来，一些诸如 BPM 啊，或者所谓的 xxx 自动化的产品，在介绍亮点的时候，其中都会有一条是可视化编辑流程图。
正好最近有个契机，就实现了一下基础功能。

## 技术栈

1. `React` + `Hook` + `TypeScript`,这个是未来至少一两年最主流的（之一）

2. AntV 的`G6`(3.8.0)

3. 基于`Cra`脚手架初始化的项目，基于`customize-cra`对`webpack`做了一些基础配置变更，比如支持`less module`，支持`alias`这些就不赘述了。

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
