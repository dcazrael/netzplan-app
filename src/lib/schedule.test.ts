import type { Successors } from "@/types/schedule";
import type { RawTask } from "@/types/task";
import { buildSuccessors } from "./schedule";

describe("buildSuccessors", () => {
    it("returns empty object for empty input", () => {
        expect(buildSuccessors([])).toEqual({});
    });

    it("handles tasks with no dependencies", () => {
        const tasks: RawTask[] = [
            { id: 1, name: "A", duration: 2, dependencies: [] },
            { id: 2, name: "B", duration: 3, dependencies: [] },
        ];
        const expected: Successors = {
            1: [],
            2: [],
        };
        expect(buildSuccessors(tasks)).toEqual(expected);
    });

    it("handles single dependency", () => {
        const tasks: RawTask[] = [
            { id: 1, name: "A", duration: 2, dependencies: [] },
            { id: 2, name: "B", duration: 3, dependencies: [1] },
        ];
        const expected: Successors = {
            1: [2],
            2: [],
        };
        expect(buildSuccessors(tasks)).toEqual(expected);
    });

    it("handles multiple dependencies", () => {
        const tasks: RawTask[] = [
            { id: 1, name: "A", duration: 2, dependencies: [] },
            { id: 2, name: "B", duration: 3, dependencies: [1] },
            { id: 3, name: "C", duration: 1, dependencies: [1, 2] },
        ];
        const expected: Successors = {
            1: [2, 3],
            2: [3],
            3: [],
        };
        expect(buildSuccessors(tasks)).toEqual(expected);
    });

    it("handles tasks with dependencies not in the list", () => {
        const tasks: RawTask[] = [
            { id: 1, name: "A", duration: 2, dependencies: [99] },
            { id: 2, name: "B", duration: 3, dependencies: [1] },
        ];
        const expected: Successors = {
            1: [2],
            2: [],
            99: [1],
        };
        expect(buildSuccessors(tasks)).toEqual(expected);
    });

    it("does not duplicate successors", () => {
        const tasks: RawTask[] = [
            { id: 1, name: "A", duration: 2, dependencies: [] },
            { id: 2, name: "B", duration: 3, dependencies: [1] },
            { id: 3, name: "C", duration: 1, dependencies: [1] },
        ];
        const expected: Successors = {
            1: [2, 3],
            2: [],
            3: [],
        };
        expect(buildSuccessors(tasks)).toEqual(expected);
    });
});
