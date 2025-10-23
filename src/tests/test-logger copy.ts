enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug',
}

class TestLogger {
  private currentTest: string = '';
  private verbose: boolean;

  constructor(verbose: boolean = process.env.TEST_VERBOSE === 'true') {
    this.verbose = verbose;
  }

  setCurrentTest(testName: string) {
    this.currentTest = testName;
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    const prefix = this.currentTest ? `[${this.currentTest}]` : '';
    return `${timestamp} ${level.toUpperCase()} ${prefix} ${message}`;
  }

  info(message: string) {
    if (this.verbose) {
      console.info(this.formatMessage(LogLevel.INFO, message));
    }
  }

  warn(message: string) {
    console.warn(this.formatMessage(LogLevel.WARN, message));
  }

  error(message: string, error?: unknown) {
    console.error(this.formatMessage(LogLevel.ERROR, message));
    if (error && this.verbose) {
      console.error(error);
    }
  }

  debug(message: string) {
    if (this.verbose) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message));
    }
  }

  dockerProgress(message: string) {
    if (this.verbose) {
      // Limpa a mensagem do Docker para ser mais concisa
      const cleanMessage = message.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
      this.debug(`Docker: ${cleanMessage}`);
    }
  }
}

export const logger = new TestLogger();
