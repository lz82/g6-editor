import React, { FC } from 'react';
import { useDrop, DropTargetMonitor } from 'react-dnd';
import css from './index.module.less';
const DropContainer: FC = ({ children }) => {
  const [{ canDrop, isOver }, dropRef] = useDrop({
    accept: 'DragItem',
    drop: (item, monitor) => ({ item, position: monitor.getSourceClientOffset() }),
    collect: (monitor: DropTargetMonitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  });

  return (
    <div className={css['drop-container']} ref={dropRef}>
      {children}
    </div>
  );
};

export default DropContainer;
