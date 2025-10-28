"use client";

import type { ScheduledTask } from "@/types/task";
import { useCallback, useEffect, useRef, useState } from "react";
import Path from "./Path";
import Task from "./Task";

type NodesProps = {
    tasks: ScheduledTask[];
};

/**
 * Renders a container for critical path (Netzplan) nodes and their connecting paths.
 *
 * This component is responsible for:
 * - Measuring and tracking the positions and sizes of each task node within the container.
 * - Rendering SVG paths between nodes using the `Path` component, based on their positions.
 * - Displaying each task node using the `Task` component.
 * - Providing SVG marker definitions for arrowheads used in the paths.
 * - Updating node positions on DOM mutations and window resize events to ensure accurate path rendering.
 *
 * @param tasks - An array of task objects to be rendered as nodes in the network plan.
 * @returns A React element containing the nodes, connecting paths, and marker definitions.
 */
export default function Nodes({ tasks }: NodesProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [nodePositions, setNodePositions] = useState<{
        [key: number]: { x: number; y: number; width: number; height: number };
    }>({});

    const updatePositions = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        const newPositions: {
            [key: number]: { x: number; y: number; width: number; height: number };
        } = {};

        // Layout-Messung in rAF, um Layout-Thrashing zu vermeiden
        requestAnimationFrame(() => {
            tasks.forEach((task) => {
                const element = document.getElementById(`task-${task.id}`);
                if (element) {
                    const containerRect = container.getBoundingClientRect();
                    const rect = element.getBoundingClientRect();
                    newPositions[task.id] = {
                        x: rect.left - containerRect.left + rect.width / 2,
                        y: rect.top - containerRect.top + rect.height / 2,
                        width: rect.width,
                        height: rect.height,
                    };
                }
            });
            setNodePositions(newPositions);
        });
    }, [tasks]);

    useEffect(() => {
        updatePositions();

        const observer = new MutationObserver(() => updatePositions());
        if (containerRef.current) {
            observer.observe(containerRef.current, {
                childList: true,
                subtree: true,
            });
        }

        const handleResize = () => updatePositions();
        window.addEventListener("resize", handleResize);

        return () => {
            observer.disconnect();
            window.removeEventListener("resize", handleResize);
        };
    }, [updatePositions]);

    return (
        <div ref={containerRef} className="relative w-full h-full">
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-20">
                {tasks.map((task) => (
                    <Path key={`path-${task.id}`} task={task} nodePositions={nodePositions} tasks={tasks} />
                ))}
            </svg>
            <div className="netzplan-container w-full z-10 p-4 border rounded bg-gray-800 relative grid gap-x-8 gap-y-2">
                {tasks.map((task) => (
                    <Task key={task.id} task={task} />
                ))}
            </div>
            <svg>
                <defs>
                    <marker
                        id="arrow-b"
                        viewBox="0 0 10 10"
                        refX="5"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                    >
                        <path d="M 0 0 L 10 5 L 0 10 z" className="fill-gray-200" />
                    </marker>
                    <marker
                        id="arrow-r"
                        viewBox="0 0 10 10"
                        refX="5"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                    >
                        <path d="M 0 0 L 10 5 L 0 10 z" className="fill-red-900" />
                    </marker>
                    <marker
                        id="arrow-b-down"
                        viewBox="0 0 10 10"
                        refX="5"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="90"
                    >
                        <path d="M 0 0 L 10 5 L 0 10 z" className="fill-gray-200" />
                    </marker>
                    <marker
                        id="arrow-r-down"
                        viewBox="0 0 10 10"
                        refX="5"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="90"
                    >
                        <path d="M 0 0 L 10 5 L 0 10 z" className="fill-red-900" />
                    </marker>
                </defs>
            </svg>
        </div>
    );
}
