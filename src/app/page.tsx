'use client';

import { useCallback, useEffect, useState } from 'react';
import Nodes from './components/Nodes';
import TaskInput from './components/TaskInput';

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

export default function Netzplan() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 0,
      name: 'Task A',
      duration: 2,
      dependencies: [],
      position: { row: 0, col: 0 },
    },
    {
      id: 1,
      name: 'Task B',
      duration: 4,
      dependencies: [0],
      position: { row: 0, col: 2 },
    },
    {
      id: 2,
      name: 'Task C',
      duration: 4,
      dependencies: [1],
      position: { row: 0, col: 4 },
    },
    {
      id: 3,
      name: 'Task D',
      duration: 2,
      dependencies: [1],
      position: { row: 1, col: 4 },
    },
    {
      id: 4,
      name: 'Task E',
      duration: 4,
      dependencies: [2, 3],
      position: { row: 0, col: 6 },
    },
  ]);

  const calculateSchedule = useCallback((taskList: Task[]) => {
    const updatedTasks = [...taskList];

    updatedTasks.forEach((task) => {
      if (task.dependencies.length === 0) {
        task.FAZ = 0;
      } else {
        task.FAZ = Math.max(
          ...task.dependencies.map(
            (depId) => updatedTasks.find((t) => t.id === depId)?.FEZ || 0
          )
        );
      }
      task.FEZ = task.FAZ + task.duration;
    });

    for (let i = updatedTasks.length - 1; i >= 0; i--) {
      const task = updatedTasks[i];
      if (updatedTasks.some((t) => t.dependencies.includes(task.id))) {
        task.SEZ = Math.min(
          ...updatedTasks
            .filter((t) => t.dependencies.includes(task.id))
            .map((t) => t.SAZ || 0)
        );
      } else {
        task.SEZ = task.FEZ;
      }
      task.SAZ = task.SEZ - task.duration;
    }

    updatedTasks.forEach((task) => {
      task.GP = (task.SEZ || 0) - (task.FEZ || 0);
      task.FP = Math.min(
        ...updatedTasks
          .filter((t) => t.dependencies.includes(task.id))
          .map((t) => (t.FAZ || 0) - (task.FEZ || 0)),
        task.GP
      );
    });

    updatedTasks.forEach((task) => {
      task.isCritical = task.GP === 0;
    });

    return updatedTasks;
  }, []);

  useEffect(() => {
    setTasks((prevTasks) => calculateSchedule(prevTasks));
  }, [calculateSchedule]);

  useEffect(() => {
    setTasks((prevTasks) => calculateSchedule(prevTasks));
  }, [tasks.length, calculateSchedule]);

  return (
    <div className='p-4'>
      <TaskInput tasks={tasks} setTasks={setTasks} />
      <Nodes tasks={tasks} />
    </div>
  );
}
