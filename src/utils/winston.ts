import winston from "winston";

export const logger = winston.createLogger();
const { combine, colorize, timestamp, splat, printf } = winston.format;
const colorizer = colorize({ colors: { info: 'blue' } });

export const createLogFile = (filename: string, level = "info") =>
    winston.createLogger({
        transports: [
            new winston.transports.File({
                level: level,
                dirname: process.env.LOG_ROOT || "public/logs",
                filename: filename,
                format: combine(
                    timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
                    splat(),
                    printf(({ timestamp, level, message, ...args }) =>
                        `[${timestamp}] ${level.toUpperCase()}: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ""}`
                    )
                ),
            })
        ]
    });

logger.add(new winston.transports.Console({
    level: process.env.NODE_ENV === "production" ? "info" : (process.env.NODE_ENV === "development" ? "debug" : "error"),
    format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
        splat(),
        printf(({ timestamp, level, message, ...args }) =>
            colorizer.colorize(level, `[${timestamp}] ${level.toUpperCase()}: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ""}`)
        )
    )
}));

if (process.env.NODE_ENV === "production") {
    logger.add(new winston.transports.File({
        level: "error",
        dirname: process.env.LOG_ROOT || "public/logs",
        filename: "errors.log",
        format: combine(
            timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
            splat(),
            printf(({ timestamp, level, message, ...args }) =>
                `[${timestamp}] ${level.toUpperCase()}: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ""}`
            )
        ),
    }));
}
