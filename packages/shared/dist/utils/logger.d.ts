export interface LogLevel {
    ERROR: 'error';
    WARN: 'warn';
    INFO: 'info';
    DEBUG: 'debug';
}
export declare const LOG_LEVELS: LogLevel;
export interface LogContext {
    [key: string]: any;
}
export declare class Logger {
    private context;
    constructor(context: string);
    private formatMessage;
    info(message: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    error(message: string, context?: LogContext): void;
    debug(message: string, context?: LogContext): void;
}
//# sourceMappingURL=logger.d.ts.map