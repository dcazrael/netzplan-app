'use client';

import { useEffect, useRef, useState } from 'react';

// Task Interface
type Task = {
  id: number;
  name: string;
  duration: number;
  dependencies: number[];
  position: { row: number; col: number };
  FAZ?: number;
  FEZ?: number;
  SAZ?: number;
  SEZ?: number;
  GP?: number;
  FP?: number;
  isCritical?: boolean;
};

type NodesProps = {
  tasks: Task[];
};

export default function Nodes({ tasks }: NodesProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [nodePositions, setNodePositions] = useState<{
    [key: number]: { x: number; y: number; width: number; height: number };
  }>({});

  const updatePositions = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    if (!container) return;
    const newPositions: {
      [key: number]: { x: number; y: number; width: number; height: number };
    } = {};
    tasks.forEach((task) => {
      const element = document.getElementById(`task-${task.id}`);
      if (element) {
        const containerRect = container.getBoundingClientRect();
        const rect = element.getBoundingClientRect();
        newPositions[task.id] = {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2,
          width: rect.width,
          height: rect.height,
        };
      }
    });
    setNodePositions(newPositions);
  };

  useEffect(() => {
    const handleResize = () => updatePositions();
    updatePositions();
    const observer = new MutationObserver(updatePositions);
    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
      });
    }
    window.addEventListener('resize', handleResize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [tasks]);

  return (
    <div ref={containerRef} className='relative'>
      <svg className='absolute top-0 left-0 w-full h-full pointer-events-none z-20'>
        {tasks.map((task) =>
          task.dependencies.map((depId, index, depArray) => {
            const fromTask = nodePositions[depId];
            const toTask = nodePositions[task.id];
            if (fromTask && toTask) {
              const isCritical =
                tasks.find((t) => t.id === depId)?.isCritical &&
                task.isCritical;

              const isVertical = fromTask.x === toTask.x;
              const gap = 16;
              const offset = (index - (depArray.length - 1) / 2) * gap;

              let startX = Math.round(fromTask.x + fromTask.width / 2);
              let startY = Math.round(fromTask.y + offset);
              let endX = Math.round(toTask.x - toTask.width / 2 - 12);
              let endY = Math.round(toTask.y + offset);
              let midX = (startX + endX) / 2;
              let marker = isCritical ? 'url(#arrow-r)' : 'url(#arrow-b)';

              if (isVertical) {
                startX = Math.round(fromTask.x);
                startY = Math.round(fromTask.y + fromTask.height / 2);
                endX = Math.round(toTask.x);
                endY = Math.round(toTask.y - toTask.height / 2 - 10);
                midX = startX;
                marker = isCritical
                  ? 'url(#arrow-r-down)'
                  : 'url(#arrow-b-down)';
              }

              return (
                <path
                  key={`arrow-${depId}-${task.id}-${index}`}
                  d={`M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`}
                  className={isCritical ? 'stroke-red-500' : 'stroke-gray-200'}
                  strokeWidth={isCritical ? 3 : 2}
                  fill='none'
                  markerEnd={marker}
                />
              );
            }
            return null;
          })
        )}
      </svg>
      <div className='netzplan-container z-10 p-4 border rounded bg-gray-800 relative grid grid-cols-[repeat(11,_1fr)] grid-rows-10 gap-x-4 gap-y-2'>
        {tasks.map((task) => (
          <div
            key={task.id}
            id={`task-${task.id}`}
            className={`p-2 border rounded shadow-md text-sm text-center relative ${
              task.isCritical ? 'bg-red-500' : 'bg-gray-200 text-gray-800'
            }`}
            style={{
              gridColumn: task.position.col + 1,
              gridRow: task.position.row + 1,
            }}
          >
            <div className='flex justify-between text-xs font-bold'>
              <span>FAZ: {task.FAZ ?? '-'} </span>
              <span>FEZ: {task.FEZ ?? '-'} </span>
            </div>
            <div className='flex justify-between mt-1'>
              <span className='font-bold'>{task.id}</span>
              <span>{task.name || 'Task ' + task.id}</span>
            </div>
            <div className='flex justify-between mt-1'>
              <span>D: {task.duration}</span>
              <span>GP: {task.GP ?? '-'} </span>
              <span>FP: {task.FP ?? '-'} </span>
            </div>
            <div className='flex justify-between text-xs font-bold mt-1'>
              <span>SAZ: {task.SAZ ?? '-'} </span>
              <span>SEZ: {task.SEZ ?? '-'} </span>
            </div>
          </div>
        ))}
      </div>
      <svg>
        <defs>
          <marker
            id='arrow-b'
            viewBox='0 0 10 10'
            refX='5'
            refY='5'
            markerWidth='6'
            markerHeight='6'
            orient='auto-start-reverse'
          >
            <path d='M 0 0 L 10 5 L 0 10 z' className='fill-gray-200' />
          </marker>
          <marker
            id='arrow-r'
            viewBox='0 0 10 10'
            refX='5'
            refY='5'
            markerWidth='6'
            markerHeight='6'
            orient='auto-start-reverse'
          >
            <path d='M 0 0 L 10 5 L 0 10 z' className='fill-red-500' />
          </marker>
          <marker
            id='arrow-b-down'
            viewBox='0 0 10 10'
            refX='5'
            refY='5'
            markerWidth='6'
            markerHeight='6'
            orient='90'
          >
            <path d='M 0 0 L 10 5 L 0 10 z' className='fill-gray-200' />
          </marker>
          <marker
            id='arrow-r-down'
            viewBox='0 0 10 10'
            refX='5'
            refY='5'
            markerWidth='6'
            markerHeight='6'
            orient='90'
          >
            <path d='M 0 0 L 10 5 L 0 10 z' className='fill-red-500' />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
