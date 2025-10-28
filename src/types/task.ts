import type { ComputedFields } from "./schedule";

export type RawTask = {
    id: number;
    name: string;
    duration: number;
    dependencies: number[];
    position: { row: number; col: number };
};

// Alias für bestehende Stellen
export type Task = RawTask;

export type ScheduledTask = RawTask & ComputedFields;
