import { buildSuccessors, topoOrder } from "@/lib/schedule";
import type { RawTask } from "@/types/task";

// Ancestor-Map aufbauen: id -> Set aller (transitiven) Vorgänger
function buildAncestorsMap(tasks: RawTask[]): Map<number, Set<number>> {
    const byId = new Map<number, RawTask>(tasks.map((t) => [t.id, t]));
    const memo = new Map<number, Set<number>>();

    const dfs = (id: number, visiting: Set<number>): Set<number> => {
        if (memo.has(id)) return memo.get(id)!;
        if (visiting.has(id)) return new Set(); // Zyklen-Schutz
        visiting.add(id);

        const anc = new Set<number>();
        const t = byId.get(id);
        if (t) {
            for (const dep of t.dependencies) {
                anc.add(dep);
                const sub = dfs(dep, visiting);
                sub.forEach((x) => anc.add(x));
            }
        }

        visiting.delete(id);
        memo.set(id, anc);
        return anc;
    };

    tasks.forEach((t) => {
        if (!memo.has(t.id)) dfs(t.id, new Set());
    });
    return memo;
}

// Ungerichtete Nachbarschaft: für Komponentenbildung
function buildNeighbors(tasks: RawTask[]): Map<number, Set<number>> {
    const succ = buildSuccessors(tasks);
    const neighbors = new Map<number, Set<number>>();
    const ensure = (id: number) => {
        if (!neighbors.has(id)) neighbors.set(id, new Set());
        return neighbors.get(id)!;
    };
    for (const t of tasks) {
        ensure(t.id);
    }
    for (const t of tasks) {
        for (const d of t.dependencies) {
            ensure(t.id).add(d);
            ensure(d).add(t.id);
        }
        for (const s of succ[t.id] ?? []) {
            ensure(t.id).add(s);
            ensure(s).add(t.id);
        }
    }
    return neighbors;
}

function indegreeMap(tasks: RawTask[]): Record<number, number> {
    const indeg: Record<number, number> = {};
    tasks.forEach((t) => (indeg[t.id] = 0));
    tasks.forEach((t) => t.dependencies.forEach((d) => (indeg[t.id] = (indeg[t.id] ?? 0) + 1)));
    return indeg;
}

// Verbund-Komponenten bilden (ung. Nachbarschaft), sortiert nach kleinstem Root (indegree==0) in der Komponente
function componentsSorted(tasks: RawTask[]): number[][] {
    const neighbors = buildNeighbors(tasks);
    const indeg = indegreeMap(tasks);
    const visited = new Set<number>();
    const comps: number[][] = [];

    for (const t of tasks) {
        const id = t.id;
        if (visited.has(id)) continue;
        const comp: number[] = [];
        const q: number[] = [id];
        visited.add(id);

        while (q.length) {
            const cur = q.shift()!;
            comp.push(cur);
            for (const nb of neighbors.get(cur) ?? []) {
                if (!visited.has(nb)) {
                    visited.add(nb);
                    q.push(nb);
                }
            }
        }
        comps.push(comp.sort((a, b) => a - b));
    }

    // Sortierschlüssel: kleinstes Root (indeg==0) in der Komponente; Fallback: kleinstes Id
    const compKey = (comp: number[]) => {
        const roots = comp.filter((id) => indeg[id] === 0);
        return Math.min(...(roots.length ? roots : comp));
    };

    return comps.sort((a, b) => compKey(a) - compKey(b));
}

export function updateTaskPositions(updatedTasks: RawTask[]): RawTask[] {
    // Kopie erstellen (keine Mutation des Inputs)
    const newTasks = updatedTasks.map((t) => ({ ...t, position: { ...t.position } }));
    const byId = new Map<number, number>();
    newTasks.forEach((t, idx) => byId.set(t.id, idx));

    // Precompute
    const ancestors = buildAncestorsMap(newTasks);
    const areRelated = (a: number, b: number) => ancestors.get(b)?.has(a) === true || ancestors.get(a)?.has(b) === true;

    // Belegung
    const occupiedCell = new Set<string>(); // "row-col"
    const rows: number[][] = []; // Row -> TaskIds (für verwandtschafts-Check)
    const key = (row: number, col: number) => `${row}-${col}`;

    // Globale topologische Reihenfolge
    const globalOrder = topoOrder(newTasks);
    const inOrderIndex = new Map(globalOrder.map((id, i) => [id, i]));

    // Komponenten-reihenfolge: komplette Komponente layouten, dann nächste
    const comps = componentsSorted(newTasks);

    for (const comp of comps) {
        // Lokale Topo-Reihenfolge: Filter der globalen, um Stabilität zu behalten
        const localOrder = [...comp].sort((a, b) => (inOrderIndex.get(a) ?? 0) - (inOrderIndex.get(b) ?? 0));

        for (const id of localOrder) {
            const idx = byId.get(id);
            if (idx === undefined) continue;
            const task = newTasks[idx];

            // Ziel-Spalte bestimmen
            let targetCol = 0;
            if (task.dependencies.length > 0) {
                const depCols = task.dependencies.map((depId) => {
                    const depIdx = byId.get(depId);
                    return depIdx === undefined ? 0 : newTasks[depIdx].position.col ?? 0;
                });
                const minCol = depCols.length ? Math.min(...depCols) : 0;
                targetCol = minCol + 2;
            } else {
                targetCol = 0; // Wurzelaufgaben starten links
            }

            // Erste Row finden, in der:
            // - die Zelle (row, targetCol) frei ist UND
            // - alle bereits in dieser Row liegenden Knoten “verwandt” sind
            let targetRow = 0;
            while (true) {
                const occupants = rows[targetRow] ?? [];
                const cellFree = !occupiedCell.has(key(targetRow, targetCol));
                const relatedToAll = occupants.every((occId) => areRelated(task.id, occId));
                if (cellFree && relatedToAll) break;
                targetRow += 1;
            }

            task.position = { row: targetRow, col: targetCol };
            occupiedCell.add(key(targetRow, targetCol));
            if (!rows[targetRow]) rows[targetRow] = [];
            rows[targetRow].push(task.id);
        }
    }

    return newTasks;
}
