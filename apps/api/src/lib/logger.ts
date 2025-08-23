interface Logger {
  info: (message: string, ...args: any[]) => void;
  error: (message: string, error?: Error) => void;
  warn: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
}

class LoggerService implements Logger {
  private static instance: LoggerService;
  private logger: Logger | null = null;

  private constructor() {}

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  initialize(logger: Logger): void {
    this.logger = logger;
  }

  info(message: string, ...args: any[]): void {
    if (this.logger) {
      this.logger.info(message, ...args);
    } else {
      console.log(message, ...args);
    }
  }

  error(message: string, error?: Error): void {
    if (this.logger) {
      this.logger.error(message, error);
    } else {
      console.error(message, error);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.logger) {
      this.logger.warn(message, ...args);
    } else {
      console.warn(message, ...args);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.logger) {
      this.logger.debug(message, ...args);
    } else {
      console.debug(message, ...args);
    }
  }
}

export const logger = LoggerService.getInstance();