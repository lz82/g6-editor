import React, { useRef, useEffect, useState } from 'react';

import classnames from 'classnames';

import G6, { Minimap, Grid, Graph, ToolBar, Menu } from '@antv/g6';
import DragItem from '@/components/drag-item';
import { GraphData } from '@antv/g6/lib/types';
import { IEdge } from '@antv/g6/lib/interface/item';

import DropContainer from '@/components/drop-container';
import css from './index.module.less';

const NODE_WIDTH = 80;
const NODE_HEIGHT = 80;

let id = 1;

const Home = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);
  const editor = useRef<Graph>();
  const [currentEditor, setCurrentEditor] = useState<{ id: string; node: any; label: string }>({
    id: '',
    node: null,
    label: ''
  });

  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    // 边集
    edges: []
  });

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
    onMouseClick(ev: any) {
      ev.preventDefault();
      if (!ev.item) {
        setCurrentEditor({
          id: '',
          node: null,
          label: ''
        });
      }
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
    },
    onNodeClick(ev: any) {
      ev.preventDefault();
      const self = this;
      const graph = self.graph as Graph;
      const item = ev.item;
      if (item) {
        // 将当前是click的都设为false
        const clickNodes = graph.findAllByState('node', 'click');
        clickNodes.forEach((cn) => {
          graph.setItemState(cn, 'click', false);
        });
        // 将当前是click的都设为false
        const clickEdgees = graph.findAllByState('edge', 'click');
        clickEdgees.forEach((cn) => {
          graph.setItemState(cn, 'click', false);
        });
        // 将当前node设为click
        console.log('to click item', item);
        graph.setItemState(item, 'click', true);
        const model = item.getModel();

        setCurrentEditor({ id: model.id, node: item, label: model.label });
      }
    },
    onEdgeClick(ev: any) {
      ev.preventDefault();
      const self = this;
      const graph = self.graph as Graph;
      const item = ev.item;
      // 将当前是click的都设为false
      const clickNodes = graph.findAllByState('node', 'click');
      clickNodes.forEach((cn) => {
        graph.setItemState(cn, 'click', false);
      });
      const clickEdgees = graph.findAllByState('edge', 'click');
      clickEdgees.forEach((cn) => {
        graph.setItemState(cn, 'click', false);
      });
      // 将当前node设为click
      graph.setItemState(item, 'click', true);
      const model = item.getModel();
      console.log(model);

      setCurrentEditor({ id: model.id, node: item, label: model.label || '' });
    }
  });

  useEffect(() => {
    // const canvasDom = document.querySelector('#editor-wrapper') as HTMLElement;

    // plugins define
    const minimap = new Minimap({
      container: minimapRef.current,
      size: [200, 160]
    });

    const grid = new Grid();
    const toolbar = new ToolBar();
    const contextMenu = new Menu({
      getContent(graph: any) {
        console.log('graph', graph);
        return `<ul>
          <li title='1'>测试01</li>
          <li title='2'>测试02</li>
          <li>测试03</li>
          <li>测试04</li>
          <li>测试05</li>
        </ul>`;
      },
      handleMenuClick: (target: any, item: any) => {
        console.log(target, item);
      },
      // offsetX and offsetY include the padding of the parent container
      // 需要加上父级容器的 padding-left 16 与自身偏移量 10
      offsetX: 16 + 10,
      // 需要加上父级容器的 padding-top 24 、画布兄弟元素高度、与自身偏移量 10
      offsetY: 24 + 28 + 10,
      // the types of items that allow the menu show up
      // 在哪些类型的元素上响应
      itemTypes: ['node', 'edge']
    });

    editor.current = new G6.Graph({
      container: editorRef.current as HTMLDivElement,
      enabledStack: true,
      maxStep: 20,
      width: editorRef.current?.scrollWidth || 1000,
      height: editorRef.current?.scrollHeight || 800,
      layout: {
        type: 'dagre',
        rankdir: 'TB',
        ranksep: 30,
        类型: 30
      },
      plugins: [grid, minimap, toolbar, contextMenu],
      modes: {
        default: [
          'drag-node',
          'drag-point-add-edge'
          // 'tooltip',
          // 'edge-tooltip',
        ]
      },
      defaultNode: {
        style: {
          fill: '#FFF'
        },
        linkPoints: {
          top: true,
          right: true,
          bottom: true,
          left: true,
          size: 10,
          fill: '#fff'
        }
      },
      nodeStateStyles: {
        click: {
          fill: '#C6E5FF'
        }
      },
      defaultEdge: {
        type: 'polyline',
        style: {
          stroke: '#F6BD16',
          lineAppendWidth: 10
        }
      },
      edgeStateStyles: {
        click: {
          lineWidth: 5
        }
      }
    });

    editor.current.data(graphData);

    editor.current.render();
  }, [graphData]);

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

  const onDragEnd = (item: { name: string }, position: { x: number; y: number }) => {
    console.log(item);
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

  const onRefresh = () => {
    if (editor.current) {
      // editor.current.refreshPositions();
      // editor.current.render();
      console.log(editor.current.save());
      const newData = editor.current.save() as GraphData;
      editor.current.read(newData);
      // editor.current.changeData();
    }
  };

  const onEditorSave = (e: any) => {
    e.preventDefault();
    editor.current?.updateItem(currentEditor.node, { label: currentEditor.label });
  };

  const onInputChange = (e: any) => {
    setCurrentEditor({ ...currentEditor, label: e.target.value });
  };

  const onShowData = () => {
    console.log(editor.current?.save());
  };

  return (
    <div className={css['home']}>
      <header>
        流程编辑器 顶部 <button onClick={onRefresh}>对齐</button>
        <button onClick={onShowData}>show Data</button>
      </header>

      <div className={css['content-wrapper']}>
        <div className={css['tool-box']}>
          <ul>
            <DragItem name="start" onDragEnd={onDragEnd}>
              <div className={classnames(css['node-start'], css['node'])}>起点</div>
            </DragItem>
            <DragItem name="common" onDragEnd={onDragEnd}>
              <div className={classnames(css['node-common'], css['node'])}>常规</div>
            </DragItem>
            <DragItem name="juge" onDragEnd={onDragEnd}>
              <div className={classnames(css['node-juge'], css['node'])}>
                <span>判断</span>
              </div>
            </DragItem>
          </ul>
        </div>

        <div id="editor-wrapper" className={css['editor-wrapper']}>
          <DropContainer>
            <div ref={editorRef}></div>
          </DropContainer>
        </div>

        <div className={css['info-wrapper']}>
          <div ref={minimapRef} className="minimap-container"></div>
          {currentEditor.id ? (
            <div className={css['info-editor']}>
              <form>
                <label>节点名称:</label>
                <input value={currentEditor.label} onChange={onInputChange} />

                <button onClick={onEditorSave}>保存</button>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Home;
