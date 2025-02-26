'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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

  // Berechnungsfunktion für den Netzplan
  const calculateSchedule = useCallback((taskList: Task[]) => {
    const updatedTasks = [...taskList];

    // Vorwärtsrechnung (FAZ & FEZ)
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

    // Rückwärtsrechnung (SEZ & SAZ)
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

    // Pufferzeiten berechnen (GP & FP)
    updatedTasks.forEach((task) => {
      task.GP = (task.SEZ || 0) - (task.FEZ || 0);
      task.FP = Math.min(
        ...updatedTasks
          .filter((t) => t.dependencies.includes(task.id))
          .map((t) => (t.FAZ || 0) - (task.FEZ || 0)),
        task.GP
      );
    });

    // Kritischen Pfad markieren
    updatedTasks.forEach((task) => {
      task.isCritical = task.GP === 0;
    });

    return updatedTasks;
  }, []);

  // Memoization: Tasks nur neu berechnen, wenn sich die Task-Liste ändert
  const updatedTasks = useMemo(
    () => calculateSchedule(tasks),
    [tasks, calculateSchedule]
  );

  // State-Update nur, wenn sich wirklich etwas geändert hat
  useEffect(() => {
    setTasks((prevTasks) => {
      if (JSON.stringify(prevTasks) !== JSON.stringify(updatedTasks)) {
        return updatedTasks;
      }
      return prevTasks;
    });
  }, [updatedTasks]);

  return (
    <div className='p-4 flex space-x-2'>
      <TaskInput tasks={tasks} setTasks={setTasks} />
      <Nodes tasks={tasks} />
    </div>
  );
}
