"use client";

import type { ScheduledTask } from "@/types/task";
import { useMemo } from "react";

type GanttChartProps = {
    tasks: ScheduledTask[];
};

export default function GanttChart({ tasks }: GanttChartProps) {
    // Einstellungen
    const pxPerUnit = 48; // Breite pro Zeiteinheit
    const rowHeight = 36;
    const barHeight = 22;
    const labelWidth = 220;

    const { rows, projectDuration } = useMemo(() => {
        if (!tasks?.length) return { rows: [] as ScheduledTask[], projectDuration: 0 };
        const sorted = [...tasks].sort((a, b) => (a.FAZ === b.FAZ ? a.id - b.id : a.FAZ - b.FAZ));
        const total = Math.max(...tasks.map((t) => t.FEZ), 0);
        return { rows: sorted, projectDuration: total };
    }, [tasks]);

    const timelineWidth = Math.max(1, projectDuration) * pxPerUnit;

    return (
        <div className="border rounded bg-gray-800 text-gray-100 p-3 mt-auto">
            <h2 className="font-bold mb-2 text-lg">Gantt</h2>

            <div className="overflow-x-auto">
                {/* Header mit Zeiteinheiten */}
                <div className="relative" style={{ paddingLeft: labelWidth }}>
                    <div className="text-xs text-gray-300" style={{ width: timelineWidth }}>
                        <div className="flex">
                            {Array.from({ length: projectDuration || 1 }, (_, i) => (
                                <div
                                    key={i}
                                    className="border-r border-gray-600 flex items-center justify-center"
                                    style={{ width: pxPerUnit, height: 24 }}
                                    title={`Periode ${i}`}
                                >
                                    {i}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="relative">
                    {rows.map((t) => {
                        const left = t.FAZ * pxPerUnit;
                        const width = Math.max(1, (t.FEZ - t.FAZ) * pxPerUnit);

                        return (
                            <div key={t.id} className="relative flex items-center" style={{ height: rowHeight }}>
                                {/* Label-Spalte */}
                                <div
                                    className="pr-3 truncate"
                                    style={{ width: labelWidth }}
                                    title={`${t.name || `Task ${t.id}`} (ID ${t.id})`}
                                >
                                    <div className="text-sm font-medium">{t.name || `Task ${t.id}`}</div>
                                    <div className="text-xs text-gray-300">
                                        ID {t.id} • D: {t.duration} • FAZ {t.FAZ} • FEZ {t.FEZ}
                                    </div>
                                </div>

                                {/* Timeline-Zeile mit vertikalen Linien */}
                                <div
                                    className="relative w-full"
                                    style={{
                                        height: rowHeight,
                                        width: timelineWidth,
                                        backgroundImage:
                                            "repeating-linear-gradient(to right, rgba(75,85,99,0.35) 0, rgba(75,85,99,0.35) 1px, transparent 1px, transparent 48px)",
                                    }}
                                >
                                    {/* Task-Bar */}
                                    <div
                                        className={`absolute rounded-sm shadow ${
                                            t.isCritical ? "bg-red-600" : "bg-blue-500"
                                        }`}
                                        style={{
                                            left,
                                            top: (rowHeight - barHeight) / 2,
                                            width,
                                            height: barHeight,
                                        }}
                                        title={`${t.name || `Task ${t.id}`} • ${t.FAZ} → ${t.FEZ}`}
                                    >
                                        <div className="px-2 text-xs whitespace-nowrap overflow-hidden text-ellipsis">
                                            {t.name || `Task ${t.id}`} ({t.FAZ} → {t.FEZ})
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Bodenlinie */}
                    <div
                        className="border-t border-gray-700"
                        style={{ marginLeft: labelWidth, width: timelineWidth }}
                    />
                </div>
            </div>
        </div>
    );
}
