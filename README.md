# 人人都会做系列之流程编辑器

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

`React`中拖拽组件有很多，最终选择了[react-dnd](https://github.com/react-dnd/react-dnd),具体原因不赘述了。
引入`react-dnd`后，创建两个容器组件：`drag-item`和`drag-container`，顾名思义，一个是用来包裹可拖拽对象的，另一个用来包裹接受被拖拽对象的容器。
关键就是在拖拽对象拖拽结束时，向外派发当前对象以及坐标。

```javascript
// drag-item.tsx
const DragItem: FC<DragItemProps> = ({ name, children, onDragEnd }) => {
  const [{ isDragging }, dragRef] = useDrag({
    item: { name, type: 'DragItem' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    end: (item, monitor: DragSourceMonitor) => {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        onDragEnd && onDragEnd(item, dropResult.position);
      }
    }
  });
  const opacity = isDragging ? 0.4 : 1;
  return (
    <li ref={dragRef} style={{ ...style, opacity }}>
      {children}
    </li>
  );
};
```

### 拖拽完成后添加节点

`G6`是有一套完善的坐标体系的:[G6 坐标系深度解析](https://antv-g6.gitee.io/zh/docs/manual/advanced/coordinate-system)
提供了将浏览器坐标转换为画布坐标的 API，但是后期在实现将内容居中显示时遇到了问题，本来以为直接使用浏览器坐标可以解决，就又用回了浏览器坐标，结果发现还是有问题。(在初始化画布时，如果使用了自动居中，画布的坐标原点会发生变化。)
代码很简单，就是判断如果拖拽元素落点处于画布中，添加一个对应的`node`，坐标就是落点，这样画布中就会在这个位置出现这个`node`
值得一提的是，可以为`node`设置`anchorPoint`来指定`node`的哪些位置可以作为连接点:[节点的连接点 anchorPoint](https://antv-g6.gitee.io/zh/docs/manual/middle/elements/nodes/anchorpoint)
另外还有一个属性叫[linkPoint](https://antv-g6.gitee.io/zh/docs/manual/middle/elements/nodes/built-in/circle/#linkpoints)

```javascript
// 根据不同工具类型，添加不同样式node
const getNodeStyle = (name: string) => {
  if (name === 'common') {
    return {
      type: 'circle',
      size: 80,
      style: {
        stroke: 'blue',
        fill: '#FFF'
      }
    };
  } else if (name === 'start') {
    return {
      type: 'rect',
      size: [80, 40],
      style: {
        fill: '#FFF',
        stroke: 'red'
      }
    };
  } else if (name === 'juge') {
    return {
      type: 'diamond',
      size: 80,
      style: {
        fill: '#FFF',
        stroke: 'yellow'
      }
    };
  }
};

const onDragEnd = (item: { name: string }, position: { x: number, y: number }) => {
  // const point = editor.current?.getPointByClient(position.x, position.y);
  // console.log(point);
  if (position && position.x > 160 && position.y > 50) {
    // 完全进入画布，则生成一个节点
    let key = `id-${id++}`;
    const style = getNodeStyle(item.name);
    const newNode = {
      ...style,
      id: key,
      x: position.x - (160 - NODE_WIDTH / 2),
      y: position.y - (50 - NODE_HEIGHT / 2),
      anchorPoints: [
        [0.5, 0],
        [1, 0.5],
        [0.5, 1],
        [0, 0.5]
      ],
      label: item.name
    };
    editor.current?.addItem('node', newNode);
  }
};
```

### 模拟拖拽实现生成连线

- 使用`G6`自带的[Behavior](https://antv-g6.gitee.io/zh/docs/manual/middle/states/defaultBehavior)来为两个`node`生成`edge`。
  [官网示例](https://antv-g6.gitee.io/zh/examples/interaction/createEdge)
  缺点是只能通过`click`事件来触发。

- 自己通过模拟拖拽的方式实现
  因为`node`本身也是可以拖拽的，这样就和拖拽连线产生来冲突。
  因此拖拽连线的起点，就需要做特殊出来，判断在`linkPoint`上才触发创建`edge`的事件。
  本来没有什么头绪，后来发现官网又一个类似的[示例](https://antv-g6.gitee.io/zh/examples/interaction/setMode)
  大致思路是当鼠标按下时，判断如果当前位置处于`linkPoint`上，则创建一个`source`和`target`均为当前`node`的`edge`，然后当`mousemove`的时候，去更新`edge`的位置(即`x`和`y`的值更新为当前鼠标的坐标),当鼠标松开时，则判断是否处于`node`范围，如果处于某个`node`范围中，则将`edge`的`target`更新为该`node`，否则删除该`edge`。

  比较好的实现方式是和示例一样,以`registerBehavior`的方式将相关事件都注册在一起。

```javascript
G6.registerBehavior('drag-point-add-edge', {
    getEvents() {
      return {
        click: 'onMouseClick',
        mousedown: 'onMouseDown',
        mousemove: 'onMouseMove',
        mouseup: 'onMouseUp',
        'node:click': 'onNodeClick',
        'edge:click': 'onEdgeClick'
      };
    },
    onMouseDown(ev: any) {
      ev.preventDefault();
      const self = this;
      const node = ev.item;
      if (node && ev.target.get('className').startsWith('link-point')) {
        const graph = self.graph as Graph;
        const model = node.getModel();

        if (!self.addingEdge && !self.edge) {
          self.edge = graph.addItem('edge', {
            source: model.id,
            target: model.id
          });
          self.addingEdge = true;
        }
      }
    },
    onMouseMove(ev: any) {
      ev.preventDefault();
      const self = this;
      const point = { x: ev.x, y: ev.y };
      if (self.addingEdge && self.edge) {
        (self.graph as Graph).updateItem(self.edge as IEdge, {
          target: point
        });
      }
    },
    onMouseUp(ev: any) {
      ev.preventDefault();
      const self = this;
      const node = ev.item;
      const graph = self.graph as Graph;
      // 这里会走两次，第二次destroyed为true
      // 因此增加判断
      if (node && !node.destroyed && node.getType() === 'node') {
        const model = node.getModel();
        console.log(model);
        if (self.addingEdge && self.edge) {
          graph.updateItem(self.edge as IEdge, {
            target: model.id
          });
          self.edge = null;
          self.addingEdge = false;
        }
      } else {
        if (self.addingEdge && self.edge) {
          graph.removeItem(self.edge as IEdge);
          self.edge = null;
          self.addingEdge = false;
        }
      }
    }
  });
```

### 选中`Node`或者`Edge`后编辑

`G6`提供了状态，以及状态样式:[State](https://antv-g6.gitee.io/zh/docs/manual/middle/states/state)
因此可以很方便实现选中后变更状态

### 右键菜单、底部 grid、minimap

这些都是`G6`提供的组件，只需要在初始化时传入`plugins`即可。
[Minimap](https://antv-g6.gitee.io/zh/examples/tool/minimap)
[ContextMenu](https://antv-g6.gitee.io/zh/examples/tool/contextMenu)

### 小结

至此，一个满足基础功能的流程编辑器就完成了。
（其实还有很多可以优化的点，比如拖拽时显示辅助线，对齐到网格时如果设置为居中会有坐标起点不在原点的问题等等。）
