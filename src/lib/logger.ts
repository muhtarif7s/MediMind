/**
 * @fileOverview Centralized logging utility for Smart Dentist.
 * Provides structured logging for debugging and error tracking.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 100;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, category: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
    };

    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      const color = level === 'error' ? 'color: #ff4d4d' : level === 'warn' ? 'color: #ffa500' : 'color: #0ea5e9';
      console.log(`%c[${entry.timestamp}] [${level.toUpperCase()}] [${category}]: ${message}`, color, data || '');
    }

    this.logs.unshift(entry);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.pop();
    }
  }

  public info(category: string, message: string, data?: any) {
    this.log('info', category, message, data);
  }

  public warn(category: string, message: string, data?: any) {
    this.log('warn', category, message, data);
  }

  public error(category: string, message: string, data?: any) {
    this.log('error', category, message, data);
  }

  public debug(category: string, message: string, data?: any) {
    this.log('debug', category, message, data);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }
}

export const logger = Logger.getInstance();
