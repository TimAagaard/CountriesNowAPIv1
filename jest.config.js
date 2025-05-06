/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
    preset: "ts-jest/presets/default-esm",
    testEnvironment: "node",
    transform: {
        "^.+\.tsx?$": [
            "ts-jest",
            {
                useESM: true,
                tsconfig: "./tsconfig.json",
            },
        ],
    },
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    extensionsToTreatAsEsm: [".ts", ".tsx", ".mts"],
    setupFilesAfterEnv: ["jest-sorted", "<rootDir>/testConfig.ts"],
    setupFiles: ["<rootDir>/testEnv.ts"],
};
