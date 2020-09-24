import React, { useRef, useEffect } from 'react';

import classnames from 'classnames';
import G6, { Minimap, Grid, Graph } from '@antv/g6';

import DragItem from '@/components/drag-item';
import DropContainer from '@/components/drop-container';

import css from './index.module.less';

const TOOLBAR_WIDTH = 160;
const HEADER_HEIGHT = 50;
const NODE_WIDTH = 80;

const Home = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);
  const editor = useRef<Graph>();

  let data = {
    // 点集
    nodes: [
      {
        id: 'node1', // String，该节点存在则必须，节点的唯一标识
        x: 100, // Number，可选，节点位置的 x 值
        y: 200 // Number，可选，节点位置的 y 值
      },
      {
        id: 'node2', // String，该节点存在则必须，节点的唯一标识
        x: 300, // Number，可选，节点位置的 x 值
        y: 200 // Number，可选，节点位置的 y 值
      }
    ],
    // 边集
    edges: [
      {
        source: 'node1', // String，必须，起始点 id
        target: 'node2' // String，必须，目标点 id
      }
    ]
  };

  useEffect(() => {
    const minimap = new Minimap({
      container: minimapRef.current,
      size: [200, 160]
    });
    const grid = new Grid();
    editor.current = new G6.Graph({
      container: editorRef.current as HTMLDivElement,
      width: editorRef.current?.scrollWidth || 1000,
      height: editorRef.current?.scrollHeight || 800,
      plugins: [minimap, grid],
      modes: {
        default: ['drag-node']
      },
      defaultNode: {
        size: 80,
        style: {
          fill: '#fff',
          stroke: 'blue',
          lineWidth: 1
        }
      }
    });

    editor.current.data(data);

    editor.current.render();
  }, [data]);

  const onDragEnd = (item: { name: string }, position: { x: number; y: number }) => {
    console.log(item, position);
    if (position.x > TOOLBAR_WIDTH && position.y > HEADER_HEIGHT) {
      // 完全进入画布，则生成一个节点
      data.nodes.push({
        id: new Date() + '',
        x: position.x - (160 - NODE_WIDTH / 2),
        y: position.y - (50 - NODE_WIDTH / 2)
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
        <DropContainer>
          <div ref={editorRef} className={css['editor-wrapper']}></div>
        </DropContainer>
        <div className={css['info-wrapper']}>
          <div ref={minimapRef} className="minimap-container"></div>
        </div>
      </div>
    </div>
  );
};

export default Home;
