import { ScheduledTask } from "@/types/task";

type TaskProps = {
    task: ScheduledTask;
};

/**
 * Renders a visual representation of a project task with its scheduling and critical path information.
 *
 * @param task - The task object containing scheduling data, position, and display properties.
 * @returns A styled div element displaying task details such as FAZ, FEZ, duration, GP, FP, SAZ, SEZ, and critical status.
 *
 * @remarks
 * - Highlights the task in red if it is on the critical path (`isCritical`).
 * - Uses CSS grid positioning based on the task's `position` property.
 * - Displays task identifiers and scheduling parameters for project management visualization.
 */
export default function Task({ task }: TaskProps) {
    return (
        <div
            key={task.id}
            id={`task-${task.id}`}
            className={`w-48 p-2 border rounded shadow-lg font-semibold text-base text-center relative ${
                task.isCritical ? "bg-red-900" : "bg-gray-200 text-gray-800"
            }`}
            style={{
                gridColumn: task.position.col + 1,
                gridRow: task.position.row + 1,
            }}
        >
            <div
                className={`flex justify-between text-sm font-bold ${
                    task.isCritical ? "text-gray-400" : "text-gray-600"
                }`}
            >
                <span>FAZ: {task.FAZ} </span>
                <span>FEZ: {task.FEZ} </span>
            </div>
            <div className="flex justify-between mt-1">
                <span className="font-bold">{task.id}</span>
                <span>{task.name || "Task " + task.id}</span>
            </div>
            <div className="flex justify-between mt-1">
                <span>D: {task.duration}</span>
                <span>GP: {task.GP} </span>
                <span>FP: {task.FP} </span>
            </div>
            <div
                className={`flex justify-between text-sm font-bold mt-1 ${
                    task.isCritical ? "text-gray-400" : "text-gray-600"
                }`}
            >
                <span>SAZ: {task.SAZ} </span>
                <span>SEZ: {task.SEZ} </span>
            </div>
        </div>
    );
}
