'use client';

import { Dispatch, SetStateAction, useRef, useState } from 'react';

// Task Interface
type Task = {
  id: number;
  name: string;
  duration: number;
  dependencies: number[];
  position: { row: number; col: number };
  isCritical?: boolean;
};

type TaskInputProps = {
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
};

export default function TaskInput({ tasks, setTasks }: TaskInputProps) {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const updateTaskPositions = (updatedTasks: Task[]) => {
    const newTasks = [...updatedTasks];
    const occupiedPositions = new Map<string, boolean>();

    newTasks.forEach((task) => {
      if (task.dependencies.length === 0) {
        task.position = { row: 0, col: 0 };
        occupiedPositions.set(`0-0`, true);
      } else {
        const minCol = Math.min(
          ...task.dependencies.map(
            (dep) => newTasks.find((t) => t.id === dep)?.position.col || 0
          )
        );
        const newCol = minCol + 2;
        let newRow = 0;

        while (occupiedPositions.has(`${newRow}-${newCol}`)) {
          newRow += 2;
        }

        task.position = { row: newRow, col: newCol };
        occupiedPositions.set(`${newRow}-${newCol}`, true);
      }
    });

    return newTasks;
  };

  const addTask = () => {
    setTasks((prevTasks) => {
      const lastTaskId = prevTasks.length - 1;
      const newTask = {
        id: prevTasks.length,
        name: '',
        duration: 1,
        dependencies: lastTaskId >= 0 ? [lastTaskId] : [],
        position: {
          row: 0,
          col: lastTaskId >= 0 ? prevTasks[lastTaskId].position.col + 2 : 0,
        },
      };
      return updateTaskPositions([...prevTasks, newTask]);
    });
  };

  const deleteTask = (id: number) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks
        .filter((task) => task.id !== id)
        .map((task) => ({
          ...task,
          dependencies: task.dependencies.filter((dep) => dep !== id),
        }));
      return updateTaskPositions(updatedTasks);
    });
  };

  return (
    <div className='mb-4 p-4 border rounded bg-gray-800 w-1/4'>
      <h2 className='font-bold mb-2 text-lg text-center'>Task-Eingabe</h2>
      <div className='flex space-x-2 mb-2 items-center'>
        <span className='w-1/12 text-center font-bold'>ID</span>
        <span className='w-1/3 text-center font-bold'>Task</span>
        <span className='w-10 text-center font-bold'>Dauer</span>
        <span className='w-1/3 text-center font-bold'>Abhängigkeit</span>
      </div>
      {tasks.map((task, index) => (
        <div key={task.id} className='flex space-x-2 mb-2 items-center'>
          <span className='w-1/12 text-center font-bold'>{task.id}</span>
          <input
            type='text'
            className='border p-1 w-1/3 bg-gray-400 text-gray-800 h-8'
            placeholder='Taskname'
            value={task.name}
            onChange={(e) => {
              setTasks((prevTasks) => {
                const updated = [...prevTasks];
                updated[index].name = e.target.value;
                return updateTaskPositions(updated);
              });
            }}
          />
          <input
            type='number'
            className='border p-1 w-12 bg-gray-400 text-gray-800 h-8'
            placeholder='Dauer'
            value={task.duration}
            min='1'
            onChange={(e) => {
              setTasks((prevTasks) => {
                const updated = [...prevTasks];
                updated[index].duration = Math.max(1, Number(e.target.value));
                return updateTaskPositions(updated);
              });
            }}
          />
          {index > 0 && (
            <div className='relative w-1/3' ref={dropdownRef}>
              <div
                className='border p-1 cursor-pointer w-full bg-gray-400 text-gray-800 h-8'
                onClick={() => setOpenDropdown(task.id)}
                tabIndex={0}
                onBlur={() => setOpenDropdown(null)}
              >
                {task.dependencies.map((dep) => (
                  <span
                    key={dep}
                    className='bg-gray-600 text-white px-2 py-1 mr-1 h-5 text-sm rounded inline-flex items-center'
                  >
                    {dep}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTasks((prevTasks) => {
                          const updated = [...prevTasks];
                          updated[index] = {
                            ...updated[index],
                            dependencies: updated[index].dependencies.filter(
                              (d) => d !== dep
                            ),
                          };
                          return updateTaskPositions(updated);
                        });
                      }}
                      className='ml-1 text-red-500 hover:text-red-700 text-xs'
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {openDropdown === task.id && (
                <div className='absolute bg-gray-400 text-gray-800 border mt-1 w-full max-h-40 overflow-y-auto z-50'>
                  {tasks
                    .filter((t) => t.id !== task.id)
                    .map((t) => (
                      <div
                        key={t.id}
                        className='p-1 cursor-pointer hover:bg-gray-500'
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setTasks((prevTasks) => {
                            const updated = [...prevTasks];
                            updated[index] = {
                              ...updated[index],
                              dependencies: [
                                ...new Set([
                                  ...updated[index].dependencies,
                                  t.id,
                                ]),
                              ],
                            };
                            return updateTaskPositions(updated);
                          });
                          setOpenDropdown(null);
                        }}
                      >
                        {t.id}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => deleteTask(task.id)}
            className='bg-red-500 text-white px-1.5 py-0.5 rounded-md text-sm'
          >
            X
          </button>
        </div>
      ))}
      <button
        onClick={addTask}
        className='bg-blue-500 text-white px-4 py-2 mt-2 rounded-md'
      >
        + Task
      </button>
    </div>
  );
}
