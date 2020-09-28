import React, { useRef, useEffect, useState } from 'react';

import classnames from 'classnames';

import G6, { Minimap, Grid, Graph } from '@antv/g6';
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
  // const [currentEdge, setCurrentEdge] = useState(null);
  const edgeRef = useRef<IEdge>();

  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    // 边集
    edges: []
  });

  G6.registerBehavior('drag-point-add-edge', {
    getEvents() {
      return {
        mousedown: 'onMouseDown',
        mousemove: 'onMouseMove',
        mouseup: 'onMouseUp',
        'edge:click': 'onEdgeClick'
      };
    },
    onMouseDown(ev: any) {
      const self = this;
      const node = ev.item;
      console.log(node, self);
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
      const self = this;
      const point = { x: ev.x, y: ev.y };
      if (self.addingEdge && self.edge) {
        (self.graph as Graph).updateItem(self.edge as IEdge, {
          target: point
        });
      }
    },
    onMouseUp(ev: any) {
      const self = this;
      const node = ev.item;
      const graph = self.graph as Graph;
      if (node) {
        const model = node.getModel();

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

  useEffect(() => {
    // const canvasDom = document.querySelector('#editor-wrapper') as HTMLElement;

    // plugins define
    const minimap = new Minimap({
      container: minimapRef.current,
      size: [200, 160]
    });

    const grid = new G6.Grid();
    editor.current = new G6.Graph({
      container: editorRef.current as HTMLDivElement,
      width: editorRef.current?.scrollWidth || 1000,
      height: editorRef.current?.scrollHeight || 800,
      fitCenter: true,
      // layout: {
      //   type: 'dagre',
      //   rankdir: 'TB', // 可选，默认为图的中心
      //   align: undefined, // 可选
      //   nodesep: 20, // 可选
      //   ranksep: 50, // 可选
      //   controlPoints: true // 可选
      // },
      layout: {
        type: 'dagre',
        rankdir: 'TB'
      },
      plugins: [grid, minimap],
      modes: {
        default: [
          'drag-node',
          'drag-point-add-edge'
          // {
          //   type: 'create-edge',
          //   trigger: 'drag'
          // }
        ]
      },
      defaultNode: {
        size: 80,
        style: {
          fill: '#fff',
          stroke: 'blue',
          lineWidth: 1
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
      defaultEdge: {
        type: 'polyline',
        style: {
          stroke: '#F6BD16'
        }
      }
    });

    editor.current.data(graphData);

    editor.current.render();
  }, [graphData]);

  const onDragEnd = (item: { name: string }, position: { x: number; y: number }) => {
    const point = editor.current?.getPointByClient(position.x, position.y);
    if (point && point.x > 0 && point.y > 0) {
      // 完全进入画布，则生成一个节点
      let key = `id-${id++}`;
      const newNode = {
        id: key,
        x: position.x - (160 - NODE_WIDTH / 2),
        y: position.y - (50 - NODE_HEIGHT / 2),
        anchorPoints: [
          [0.5, 0],
          [1, 0.5],
          [0.5, 1],
          [0, 0.5]
        ],
        label: key
      };
      editor.current?.addItem('node', newNode);
      // setGraphData((data) => ({
      //   edges: data.edges,
      //   nodes: [...(data.nodes || []), newNode]
      // }));

      // editor.current && editor.current.data(graphData);

      // editor.current && editor.current.render();
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
  return (
    <div className={css['home']}>
      <header>
        流程编辑器 顶部 <button onClick={onRefresh}>refresh</button>
      </header>

      <div className={css['content-wrapper']}>
        <div className={css['tool-box']}>
          <ul>
            <DragItem name="start" onDragEnd={onDragEnd}>
              <div className={classnames(css['node-start'], css['node'])}>起点</div>
            </DragItem>
            <DragItem name="cross" onDragEnd={onDragEnd}>
              <div className={classnames(css['node-juge'], css['node'])}>分叉</div>
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
        </div>
      </div>
    </div>
  );
};

export default Home;
