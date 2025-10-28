export type TaskTemplate = {
    key: string;
    name: string;
    duration: number;
};

export const TASK_TEMPLATES: TaskTemplate[] = [
    { key: "kickoff", name: "Kickoff", duration: 1 },
    { key: "anforderungen", name: "Anforderungsanalyse", duration: 3 },
    { key: "entwurf", name: "Systementwurf", duration: 2 },
    { key: "implementierung", name: "Implementierung", duration: 5 },
    { key: "code-review", name: "Code Review", duration: 1 },
    { key: "test", name: "Testen", duration: 3 },
    { key: "integration", name: "Integration", duration: 2 },
    { key: "deployment", name: "Deployment", duration: 1 },
    { key: "abnahme", name: "Abnahme", duration: 1 },
    { key: "dokumentation", name: "Dokumentation", duration: 2 },
];
