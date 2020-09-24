import React, { FC } from 'react';
import { useDrop, DropTargetMonitor } from 'react-dnd';

const DropContainer: FC = ({ children }) => {
  const [{ canDrop, isOver }, dropRef] = useDrop({
    accept: 'DragItem',
    drop: (item, monitor) => ({ item, position: monitor.getSourceClientOffset() }),
    collect: (monitor: DropTargetMonitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  });

  // console.log('canDrop', canDrop);
  // console.log('isOver', isOver);
  return <div ref={dropRef}>{children}</div>;
};

export default DropContainer;
