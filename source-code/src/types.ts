export type Severity = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL' | string;

export interface LogRecord {
  id?: string;
  severity: Severity;
  message: string;
  source: string;
  timestamp: string; // ISO
}

export interface AlertRule {
  id: string;
  name: string;
  severities?: string[];
  sourceIncludes?: string;
  messageIncludes?: string;
  threshold: number;
  windowMinutes: number;
  enabled: boolean;
  webhookUrl?: string;
}

export interface AlertEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  matchedCount: number;
  windowStart: string;
  windowEnd: string;
  latestLog?: LogRecord;
  createdAt: string;
}