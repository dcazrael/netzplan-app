import { ScheduledTask } from "@/types/task";

type PathProps = {
    task: ScheduledTask;
    nodePositions: {
        [key: number]: { x: number; y: number; width: number; height: number };
    };
    tasks: ScheduledTask[];
};

/**
 * Renders SVG path elements representing dependency arrows between tasks in a network diagram.
 *
 * Each arrow is drawn from a dependency task to the current task, with visual differentiation
 * for critical paths. The arrows are positioned based on the provided node positions and styled
 * according to whether the dependency is critical.
 *
 * @param task - The current task node for which dependencies are being rendered.
 * @param nodePositions - A mapping of task IDs to their corresponding position and size information.
 * @param tasks - The list of all tasks, used to determine criticality and other properties.
 *
 * @returns A React fragment containing SVG `<path>` elements for each dependency arrow.
 */
export default function Path({ task, nodePositions, tasks }: PathProps) {
    return (
        <>
            {task.dependencies.map((depId, index, depArray) => {
                const fromTask = nodePositions[depId];
                const toTask = nodePositions[task.id];
                if (fromTask && toTask) {
                    const isCritical = tasks.find((t) => t.id === depId)?.isCritical && task.isCritical;

                    const isVertical = fromTask.x === toTask.x;
                    const gap = 16;
                    const offset = (index - (depArray.length - 1) / 2) * gap;

                    let startX = Math.round(fromTask.x + fromTask.width / 2);
                    let startY = Math.round(fromTask.y + offset);
                    let endX = Math.round(toTask.x - toTask.width / 2 - 12);
                    let endY = Math.round(toTask.y + offset);
                    let midX = (startX + endX) / 2;
                    let marker = isCritical ? "url(#arrow-r)" : "url(#arrow-b)";

                    if (isVertical) {
                        startX = Math.round(fromTask.x);
                        startY = Math.round(fromTask.y + fromTask.height / 2);
                        endX = Math.round(toTask.x);
                        endY = Math.round(toTask.y - toTask.height / 2 - 10);
                        midX = startX;
                        marker = isCritical ? "url(#arrow-r-down)" : "url(#arrow-b-down)";
                    }

                    return (
                        <path
                            key={`arrow-${depId}-${task.id}-${index}`}
                            d={`M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`}
                            className={isCritical ? "stroke-red-900" : "stroke-gray-200"}
                            strokeWidth={isCritical ? 3 : 2}
                            fill="none"
                            markerEnd={marker}
                        />
                    );
                }
                return null;
            })}
        </>
    );
}
