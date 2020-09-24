import React, { FC } from 'react';
import { useDrag, DragSourceMonitor } from 'react-dnd';

interface DragItemProps {
  name: string;
  onDragEnd: Function;
}

const style: React.CSSProperties = {
  cursor: 'move'
};

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

export default DragItem;
