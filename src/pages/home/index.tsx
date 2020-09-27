import React, { useRef, useEffect } from 'react';

import classnames from 'classnames';
import G6, { Minimap, Grid, Graph } from '@antv/g6';

import DragItem from '@/components/drag-item';
import DropContainer from '@/components/drop-container';

import css from './index.module.less';
import { GraphData } from '@antv/g6/lib/types';
import { tuple } from 'antd/lib/_util/type';

const NODE_WIDTH = 80;
const NODE_HEIGHT = 80;

const Home = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);
  const editor = useRef<Graph>();

  let data: GraphData = {
    // 点集
    nodes: [],
    // 边集
    edges: []
  };

  useEffect(() => {
    const minimap = new Minimap({
      container: minimapRef.current,
      size: [200, 160]
    });
    const canvasDom = document.querySelector('#editor-wrapper') as HTMLElement;
    console.log(canvasDom);
    const grid = new Grid();

    editor.current = new G6.Graph({
      container: editorRef.current as HTMLDivElement,
      width: canvasDom.scrollWidth || 1000,
      height: canvasDom.scrollHeight || 800,
      plugins: [minimap, grid],
      modes: {
        default: ['drag-node']
      }
    });

    editor.current.data(data);

    editor.current.render();

    editor.current.on('node:mouseenter', (evt: any) => {
      console.log(typeof evt);
      const { item } = evt;
      console.log(item, evt);
      editor.current?.setItemState(item, 'hover', true);
      editor.current?.updateItem(item, {
        linkPoints: {
          top: true,
          bottom: true,
          left: true,
          right: true,
          size: 10,
          fill: '#fff',
          color: '#eee'
        }
      });
    });

    editor.current.on('node:mouseleave', (evt: any) => {
      console.log(typeof evt);
      const { item } = evt;
      console.log(item, evt);
      editor.current?.setItemState(item, 'hover', false);
      editor.current?.updateItem(item, {
        linkPoints: {
          top: false,
          bottom: false,
          left: false,
          right: false,
          size: 10
        }
      });
    });
  }, [data]);

  const onDragEnd = (item: { name: string }, position: { x: number; y: number }) => {
    const point = editor.current?.getPointByClient(position.x, position.y);
    if (point && point.x > 0 && point.y > 0) {
      // 完全进入画布，则生成一个节点
      const point = editor.current?.getPointByClient(position.x, position.y);
      console.log('point', point);
      data.nodes?.push({
        id: Math.random() * 10000000 + '',
        x: (point ? point.x : 0) + NODE_WIDTH / 2,
        y: (point ? point.y : 0) + NODE_HEIGHT / 2,
        label: item.name,
        size: 80,
        type: 'circle',
        style: {
          fill: '#fff',
          stroke: 'blue',
          lineWidth: 1
        },
        anchorPoints: [
          [0, 1],
          [0.5, 1]
        ]
      });
      editor.current && editor.current.data(data);

      editor.current && editor.current.render();
    }
  };
  return (
    <div className={css['home']}>
      <header>流程编辑器 顶部</header>

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
