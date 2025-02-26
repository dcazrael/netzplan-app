'use client';

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
  return (
    <div
      key='netzplan'
      className='netzplan-container z-10 p-4 border rounded bg-gray-50 relative grid grid-cols-[repeat(11,_1fr)] grid-rows-10 gap-x-4 gap-y-2'
    >
      {tasks.map((task) => (
        <>
          <div
            key={task.id}
            className={`p-2 border rounded shadow-md text-sm text-center relative ${
              task.isCritical ? 'bg-red-200' : 'bg-white'
            }`}
            style={{
              gridColumn: task.position.col + 1,
              gridRow: task.position.row + 1,
            }}
          >
            <div className='flex justify-between text-xs font-bold'>
              <span>FAZ: {task.FAZ ?? '-'}</span>
              <span>FEZ: {task.FEZ ?? '-'}</span>
            </div>
            <div className='flex justify-between mt-1'>
              <span className='font-bold'>{task.id}</span>
              <span>{task.name || 'Task ' + task.id}</span>
            </div>
            <div className='flex justify-between mt-1'>
              <span>D: {task.duration}</span>
              <span>GP: {task.GP ?? '-'}</span>
              <span>FP: {task.FP ?? '-'}</span>
            </div>
            <div className='flex justify-between text-xs font-bold mt-1'>
              <span>SAZ: {task.SAZ ?? '-'}</span>
              <span>SEZ: {task.SEZ ?? '-'}</span>
            </div>
          </div>
          {task.dependencies.map((depId) => {
            const fromTask = tasks.find((t) => t.id === depId);
            if (fromTask) {
              const isCritical = fromTask.isCritical && task.isCritical;
              return (
                <svg
                  key={`arrow-${fromTask.id}-${task.id}`}
                  className='absolute h-full'
                  style={{
                    pointerEvents: 'none',
                    gridColumn: task.position.col,
                    gridRow: task.position.row,
                  }}
                >
                  <line
                    x1={0}
                    y1={fromTask.position.row * 100 + 50}
                    x2={150}
                    y2={task.position.row * 100 + 50}
                    stroke={isCritical ? 'red' : 'black'}
                    strokeWidth={isCritical ? 3 : 2}
                    markerEnd={isCritical ? 'url(#arrow-r)' : 'url(#arrow-b)'}
                  />
                </svg>
              );
            }
            return null;
          })}
        </>
      ))}
      <svg className=''>
        <defs>
          <marker
            id='arrow-r'
            viewBox='0 0 10 10'
            refX='5'
            refY='5'
            markerWidth='6'
            markerHeight='6'
            orient='auto-start-reverse'
          >
            <path d='M 0 0 L 10 5 L 0 10 z' fill='red' />
          </marker>
          <marker
            id='arrow-b'
            viewBox='0 0 10 10'
            refX='5'
            refY='5'
            markerWidth='6'
            markerHeight='6'
            orient='auto-start-reverse'
          >
            <path d='M 0 0 L 10 5 L 0 10 z' fill='black' />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
