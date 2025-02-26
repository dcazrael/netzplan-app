'use client';

import { Dispatch, SetStateAction } from 'react';

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
  const addTask = () => {
    const lastTask = tasks.length > 0 ? tasks[tasks.length - 1] : null;
    let newRow = 0;
    let newCol = 0;
    let newDependencies: number[] = [];

    if (lastTask) {
      newCol = lastTask.position.col + 2;
      newRow = lastTask.position.row;
      newDependencies = [lastTask.id];
    }

    const newTasks = [
      ...tasks,
      {
        id: tasks.length,
        name: '',
        duration: 1,
        dependencies: newDependencies,
        position: { row: newRow, col: newCol },
      },
    ];
    setTasks(newTasks);
  };

  const deleteTask = (id: number) => {
    const updatedTasks = tasks
      .filter((task) => task.id !== id)
      .map((task, index) => ({ ...task, id: index }));
    setTasks(updatedTasks);
  };

  return (
    <div className='mb-4 p-4 border rounded bg-gray-800'>
      <h2 className='font-bold mb-2 text-lg text-center'>Task-Eingabe</h2>
      <div className='flex space-x-4 mb-2 items-center'>
        <span className='w-1/12 text-center font-bold'>Index</span>
        <span className='w-1/4 text-center font-bold'>Taskname</span>
        <span className='w-1/12 text-center font-bold'>Dauer</span>
        <span className='w-1/12 text-center font-bold'>Abhängigkeiten</span>
      </div>
      {tasks.map((task, index) => (
        <div key={task.id} className='flex space-x-4 mb-2 items-center'>
          <span className='w-1/12 text-center font-bold'>{task.id}</span>
          <input
            type='text'
            className='border p-1 w-1/4'
            placeholder='Taskname'
            value={task.name}
            onChange={(e) => {
              const updated = [...tasks];
              updated[index].name = e.target.value;
              setTasks(updated);
            }}
          />
          <input
            type='number'
            className='border p-1 w-1/12'
            placeholder='Dauer'
            value={task.duration}
            min='1'
            onChange={(e) => {
              const updated = [...tasks];
              updated[index].duration = Math.max(1, Number(e.target.value));
              setTasks(updated);
            }}
          />
          <input
            type='text'
            className='border p-1 w-1/12'
            placeholder='0'
            value={task.dependencies.join(',')}
            onChange={(e) => {
              if (index !== 0) {
                const updated = [...tasks];
                updated[index].dependencies = e.target.value
                  .split(',')
                  .map(Number)
                  .filter((n) => !isNaN(n));
                setTasks(updated);
              }
            }}
            disabled={index === 0}
          />
          <button
            onClick={() => deleteTask(task.id)}
            className='bg-red-500 text-white px-2 py-1'
          >
            X
          </button>
        </div>
      ))}
      <button
        onClick={addTask}
        className='bg-blue-500 text-white px-4 py-2 mt-2'
      >
        + Task
      </button>
    </div>
  );
}
