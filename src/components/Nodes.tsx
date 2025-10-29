"use client";

import type { ScheduledTask } from "@/types/task";
import { useCallback, useEffect, useRef, useState } from "react";
import Path from "./Path";
import Task from "./Task";

type NodesProps = {
    tasks: ScheduledTask[];
};

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

        // In rAF messen, um Layout-Thrashing zu vermeiden
        requestAnimationFrame(() => {
            const containerRect = container.getBoundingClientRect();
            tasks.forEach((task) => {
                const element = document.getElementById(`task-${task.id}`);
                if (!element) return;
                const rect = element.getBoundingClientRect();
                newPositions[task.id] = {
                    x: rect.left - containerRect.left + rect.width / 2,
                    y: rect.top - containerRect.top + rect.height / 2,
                    width: rect.width,
                    height: rect.height,
                };
            });
            setNodePositions(newPositions);
        });
    }, [tasks]);

    useEffect(() => {
        updatePositions();

        const container = containerRef.current;
        if (!container) return;

        // ResizeObserver: Container, Parent und Task-Knoten beobachten
        const resizeObserver = new ResizeObserver(() => updatePositions());

        resizeObserver.observe(container);
        if (container.parentElement) resizeObserver.observe(container.parentElement);
        // optional breit: body beobachten, falls äußeres Layout (Sidebar) die Breite ändert
        resizeObserver.observe(document.body);

        // Alle Task-Elemente beobachten (Breiten/Höhenänderungen)
        const observeTaskElements = () => {
            const nodes = container.querySelectorAll<HTMLElement>('[id^="task-"]');
            nodes.forEach((n) => resizeObserver.observe(n));
        };
        observeTaskElements();

        // MutationObserver: neue/entfernte Knoten erkennen und Positions-Update auslösen
        const mutationObserver = new MutationObserver(() => {
            observeTaskElements();
            updatePositions();
        });
        mutationObserver.observe(container, {
            childList: true,
            subtree: true,
        });

        // Bei Fenster-Resize und CSS-Transition-Ende neu messen
        const onResize = () => updatePositions();
        const onTransitionEnd = () => updatePositions();
        window.addEventListener("resize", onResize);
        container.addEventListener("transitionend", onTransitionEnd);

        return () => {
            window.removeEventListener("resize", onResize);
            container.removeEventListener("transitionend", onTransitionEnd);
            mutationObserver.disconnect();
            resizeObserver.disconnect();
        };
    }, [updatePositions]);

    return (
        <div ref={containerRef} className="relative min-w-fit">
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-20">
                {tasks.map((task) => (
                    <Path key={`paths-${task.id}`} task={task} nodePositions={nodePositions} tasks={tasks} />
                ))}
            </svg>

            <div className="netzplan-container z-10 p-4 border rounded bg-gray-800 relative grid gap-x-4 gap-y-2">
                {tasks.map((task) => (
                    <Task key={task.id} task={task} />
                ))}
            </div>

            <svg aria-hidden>
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
