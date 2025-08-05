type LogLevel = 'debug' | 'info' | 'warn' | 'error'

type LogContext = Record<string, unknown>

interface LoggerConfig {
  service?: string
  environment?: string
  version?: string
  debug?: boolean
}

class Logger {
  private service: string
  private environment: string
  private version: string
  private isDebug: boolean
  private static instance: Logger

  private constructor(config: LoggerConfig = {}) {
    this.service = config.service || 'frontend'
    this.environment = config.environment || process.env.NODE_ENV || 'development'
    this.version = config.version || '1.0.0'
    this.isDebug = config.debug ?? this.environment === 'development'
  }

  public static getInstance(config: LoggerConfig = {}): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config)
    }
    return Logger.instance
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      service: this.service,
      environment: this.environment,
      version: this.version,
      level,
      message,
      ...context,
    }
    return JSON.stringify(logEntry)
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    // Don't log anything in production
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, context);
    
    // Only log debug messages when in debug mode
    if (level === 'debug' && !this.isDebug) return;

    const logMethod = level === 'error' ? console.error : 
                     level === 'warn' ? console.warn : 
                     level === 'info' ? console.info : 
                     console.debug;
    
    try {
      logMethod(JSON.parse(formattedMessage));
    } catch (e) {
      logMethod(message, context);
    }

    // Here you can add integration with other services (e.g., Honeybadger, Sentry)
    // Example:
    // if (level === 'error' && process.env.NEXT_PUBLIC_HONEYBADGER_API_KEY) {
    //   Honeybadger.notify(new Error(message), { context })
    // }
  }

  // Public methods
  public debug(message: string, context?: LogContext): void {
    this.log('debug', message, context)
  }

  public info(message: string, context?: LogContext): void {
    this.log('info', message, context)
  }

  public warn(message: string, context?: LogContext): void {
    this.log('warn', message, context)
  }

  public error(message: string, error?: unknown, context?: LogContext): void {
    let errorContext = { ...context }
    
    if (error instanceof Error) {
      errorContext = {
        ...errorContext,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      }
    } else if (error) {
      errorContext = {
        ...errorContext,
        error: String(error)
      }
    }
    
    this.log('error', message, errorContext)
  }
}

// Create a default logger instance
export const logger = Logger.getInstance({
  service: 'frontend',
  environment: process.env.NODE_ENV || 'development',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  debug: process.env.NODE_ENV !== 'production',
})

export default logger
