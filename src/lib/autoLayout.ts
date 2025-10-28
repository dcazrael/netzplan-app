import type { RawTask } from "@/types/task";

export function updateTaskPositions(updatedTasks: RawTask[]): RawTask[] {
    const newTasks = updatedTasks.map((t) => ({ ...t }));
    const occupied = new Map<string, boolean>();

    newTasks.forEach((task) => {
        if (task.dependencies.length === 0) {
            task.position = { row: 0, col: 0 };
            occupied.set(`0-0`, true);
        } else {
            const minCol = Math.min(
                ...task.dependencies.map((dep) => newTasks.find((t) => t.id === dep)?.position.col || 0)
            );
            const newCol = minCol + 2;
            let newRow = 0;

            while (occupied.has(`${newRow}-${newCol}`)) newRow += 2;

            task.position = { row: newRow, col: newCol };
            occupied.set(`${newRow}-${newCol}`, true);
        }
    });

    return newTasks;
}
