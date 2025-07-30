export const LOG_LEVELS = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
};
export class Logger {
    constructor(context) {
        this.context = context;
    }
    formatMessage(level, message, context) {
        const timestamp = new Date().toISOString();
        const contextStr = context ? ` ${JSON.stringify(context)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}] [${this.context}] ${message}${contextStr}`;
    }
    info(message, context) {
        console.log(this.formatMessage('info', message, context));
    }
    warn(message, context) {
        console.warn(this.formatMessage('warn', message, context));
    }
    error(message, context) {
        console.error(this.formatMessage('error', message, context));
    }
    debug(message, context) {
        var _a;
        if (typeof process !== 'undefined' && ((_a = process.env) === null || _a === void 0 ? void 0 : _a.NODE_ENV) === 'development') {
            console.debug(this.formatMessage('debug', message, context));
        }
    }
}
//# sourceMappingURL=logger.js.map