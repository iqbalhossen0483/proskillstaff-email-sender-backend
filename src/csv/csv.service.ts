/* eslint-disable no-irregular-whitespace */
import { Injectable } from '@nestjs/common';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ParseEmailsResult {
  emails: string[];
  totalRows: number;
  invalidRows: number;
  duplicateRows: number;
}

@Injectable()
export class CsvService {
  parseEmails(buffer: Buffer): ParseEmailsResult {
    const text = buffer.toString('utf8').replace(/^﻿/, '');
    const lines = text.split(/\r\n|\n|\r/);

    const emails: string[] = [];
    const seen = new Set<string>();
    let totalRows = 0;
    let invalidRows = 0;
    let duplicateRows = 0;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line === '') continue;
      totalRows += 1;

      const firstCell = this.firstCell(line);
      const candidate = firstCell.toLowerCase();

      if (!EMAIL_REGEX.test(candidate)) {
        invalidRows += 1;
        continue;
      }
      if (seen.has(candidate)) {
        duplicateRows += 1;
        continue;
      }

      seen.add(candidate);
      emails.push(candidate);
    }

    return { emails, totalRows, invalidRows, duplicateRows };
  }

  private firstCell(line: string): string {
    if (line.startsWith('"')) {
      let i = 1;
      let value = '';
      while (i < line.length) {
        const ch = line[i];
        if (ch === '"') {
          if (line[i + 1] === '"') {
            value += '"';
            i += 2;
            continue;
          }
          break;
        }
        value += ch;
        i += 1;
      }
      return value.trim();
    }

    const commaIndex = line.indexOf(',');
    const cell = commaIndex === -1 ? line : line.slice(0, commaIndex);
    return cell.trim();
  }
}
