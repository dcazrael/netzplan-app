import type { EarliestTimes, Floats, LatestTimes, Successors } from "@/types/schedule";
import type { RawTask, ScheduledTask } from "@/types/task";

export function buildSuccessors(tasks: RawTask[]): Successors {
    const succ: Successors = {};
    tasks.forEach((t) => {
        succ[t.id] = succ[t.id] ?? [];
    });
    tasks.forEach((t) => {
        t.dependencies.forEach((depId) => {
            (succ[depId] ??= []).push(t.id);
        });
    });
    return succ;
}

export function topoOrder(tasks: RawTask[]): number[] {
    const byId = new Map(tasks.map((t) => [t.id, t]));
    const indeg: Record<number, number> = {};
    tasks.forEach((t) => {
        const count = t.dependencies.filter((d) => byId.has(d)).length;
        indeg[t.id] = count;
    });

    const q: number[] = Object.keys(indeg)
        .map(Number)
        .filter((id) => indeg[id] === 0);

    const order: number[] = [];
    const succ = buildSuccessors(tasks);

    while (q.length) {
        const id = q.shift()!;
        order.push(id);
        for (const s of succ[id] ?? []) {
            indeg[s] = (indeg[s] ?? 0) - 1;
            if (indeg[s] === 0) q.push(s);
        }
    }

    if (order.length !== tasks.length) {
        const missing = tasks.map((t) => t.id).filter((id) => !order.includes(id));
        order.push(...missing);
    }
    return order;
}

export function computeEarliest(tasks: RawTask[], order: number[]): EarliestTimes {
    const FEZ: Record<number, number> = {};
    const FAZ: Record<number, number> = {};

    const byId = new Map(tasks.map((t) => [t.id, t]));
    for (const id of order) {
        const t = byId.get(id);
        if (!t) continue;
        const depFEZ = t.dependencies.map((d) => FEZ[d] ?? 0);
        const faz = depFEZ.length ? Math.max(...depFEZ) : 0;
        FAZ[id] = faz;
        FEZ[id] = faz + t.duration;
    }
    return { FAZ, FEZ };
}

export function computeLatest(
    tasks: RawTask[],
    order: number[],
    successors: Successors,
    earliest: EarliestTimes
): LatestTimes {
    const SAZ: Record<number, number> = {};
    const SEZ: Record<number, number> = {};

    const byId = new Map(tasks.map((t) => [t.id, t]));
    const projectDuration = Math.max(...tasks.map((t) => earliest.FEZ[t.id] ?? 0), 0);

    for (let i = order.length - 1; i >= 0; i--) {
        const id = order[i];
        const t = byId.get(id);
        if (!t) continue;

        const succs = successors[id] ?? [];
        if (succs.length === 0) {
            SEZ[id] = projectDuration;
            SAZ[id] = projectDuration - t.duration;
        } else {
            const sazSucc = succs.map((s) => SAZ[s]).filter((v): v is number => typeof v === "number");
            const sez = sazSucc.length ? Math.min(...sazSucc) : projectDuration;
            SEZ[id] = sez;
            SAZ[id] = sez - t.duration;
        }
    }

    return { SAZ, SEZ, projectDuration };
}

export function computeFloats(
    tasks: RawTask[],
    successors: Successors,
    earliest: EarliestTimes,
    latest: LatestTimes
): Floats {
    const GP: Record<number, number> = {};
    const FP: Record<number, number> = {};

    for (const t of tasks) {
        const gp = (latest.SEZ[t.id] ?? 0) - (earliest.FEZ[t.id] ?? 0);
        GP[t.id] = gp;

        const succs = successors[t.id] ?? [];
        if (succs.length === 0) {
            FP[t.id] = gp;
        } else {
            const candidates = succs.map((s) => (earliest.FAZ[s] ?? 0) - (earliest.FEZ[t.id] ?? 0));
            FP[t.id] = candidates.length ? Math.min(...candidates) : gp;
        }
    }

    return { GP, FP };
}

export function markCritical(tasks: RawTask[], floats: Floats): Set<number> {
    const critical = new Set<number>();
    for (const t of tasks) {
        if ((floats.GP[t.id] ?? 0) === 0) critical.add(t.id);
    }
    return critical;
}

export function mergeSchedule(
    tasks: RawTask[],
    earliest: EarliestTimes,
    latest: LatestTimes,
    floats: Floats,
    critical: Set<number>
): ScheduledTask[] {
    return tasks.map((t) => ({
        ...t,
        FAZ: earliest.FAZ[t.id] ?? 0,
        FEZ: earliest.FEZ[t.id] ?? 0,
        SAZ: latest.SAZ[t.id] ?? 0,
        SEZ: latest.SEZ[t.id] ?? 0,
        GP: floats.GP[t.id] ?? 0,
        FP: floats.FP[t.id] ?? 0,
        isCritical: critical.has(t.id),
    }));
}

export const calculateSchedule = (taskList: RawTask[]): ScheduledTask[] => {
    const tasks = taskList.map((t) => ({ ...t })); // keine Mutation am Input
    const order = topoOrder(tasks);
    const succ = buildSuccessors(tasks);
    const earliest = computeEarliest(tasks, order);
    const latest = computeLatest(tasks, order, succ, earliest);
    const floats = computeFloats(tasks, succ, earliest, latest);
    const critical = markCritical(tasks, floats);
    return mergeSchedule(tasks, earliest, latest, floats, critical);
};
