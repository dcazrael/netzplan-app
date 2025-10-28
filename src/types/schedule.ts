export type TimesRecord = Record<number, number>;

export type EarliestTimes = {
    FAZ: TimesRecord;
    FEZ: TimesRecord;
};

export type LatestTimes = {
    SAZ: TimesRecord;
    SEZ: TimesRecord;
    projectDuration: number;
};

export type Floats = {
    GP: TimesRecord;
    FP: TimesRecord;
};

// Kantenstruktur: TaskId -> Nachfolger-Ids
export type Successors = Record<number, number[]>;

// Einziger Ort für die berechneten Felder
export type ComputedFields = {
    FAZ: number;
    FEZ: number;
    SAZ: number;
    SEZ: number;
    GP: number;
    FP: number;
    isCritical: boolean;
};
