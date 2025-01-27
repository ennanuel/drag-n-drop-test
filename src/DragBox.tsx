import { useMemo } from 'react';
import { SelectedTab } from './constantsAndTypes';

export default function DragBox({ content, position, tabIsBeingDragged }: { content: SelectedTab | null; tabIsBeingDragged: boolean | undefined; position: { x: number; y: number } }) {
  const style = useMemo(() => ({ transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`, width: `${content?.width}px` }), [position, content]);

  if (!content || !tabIsBeingDragged) return;

  return (
    <div style={style} className="box flex items-center">
      <content.Icon className="icon" size={15} />
      <span>{content.title}</span>
    </div>
  )
}