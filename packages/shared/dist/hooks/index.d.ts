export declare function useAsync<T, E = string>(asyncFunction: () => Promise<T>, immediate?: boolean): {
    execute: () => Promise<T>;
    status: "error" | "pending" | "idle" | "success";
    data: T | null;
    error: E | null;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
};
export declare function useDebounce<T>(value: T, delay: number): T;
export declare function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void];
export declare function usePrevious<T>(value: T): T | undefined;
//# sourceMappingURL=index.d.ts.map