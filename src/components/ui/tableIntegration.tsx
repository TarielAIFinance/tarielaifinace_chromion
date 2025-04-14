import React from 'react';
import { cn } from '@/lib/utils';

// Types
export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface ContentSegment {
  type: 'text' | 'table';
  content: string;
}

// Trigger patterns for table detection
const TABLE_PATTERNS = {
  MARKDOWN_TABLE: /^\|[\s\S]*\|$/m,
  EXPLICIT_TABLE: /^(Table|Here is a table|Showing table|Comparison table):/i,
  DATA_ROWS: /^\|\s*[\w\s.%-]+(?:\s*\|\s*[\w\s.%-]+)*\s*\|$/
};

// Function to detect if content should be displayed as a table
export function shouldDisplayAsTable(content: string): boolean {
  // Check for markdown table format
  if (TABLE_PATTERNS.MARKDOWN_TABLE.test(content)) {
    return true;
  }

  // Check for explicit table mentions
  if (TABLE_PATTERNS.EXPLICIT_TABLE.test(content)) {
    return true;
  }

  // Check for data rows
  const lines = content.split('\n');
  const dataRowCount = lines.filter(line => TABLE_PATTERNS.DATA_ROWS.test(line)).length;
  if (dataRowCount >= 2) {
    return true;
  }

  return false;
}

// Parse table data from different formats
export function parseTableData(content: string): TableData {
  const lines = content.split('\n').filter(line => line.trim());
  
  // Handle markdown table format
  if (lines.some(line => TABLE_PATTERNS.MARKDOWN_TABLE.test(line))) {
    const tableLines = lines.filter(line => line.trim().startsWith('|'));
    const headers = tableLines[0]
      .split('|')
      .filter(cell => cell.trim())
      .map(cell => cell.trim());

    const rows = tableLines
      .slice(2) // Skip header and separator
      .map(line => 
        line
          .split('|')
          .filter(cell => cell.trim())
          .map(cell => cell.trim())
      );

    return { headers, rows };
  }

  // Handle year-based data format
  if (content.includes('Year') || content.includes('USDC') || content.includes('USDT')) {
    const yearPattern = /(\d{4})\s*\|\s*([\d.]+)/g;
    const matches = [...content.matchAll(yearPattern)];
    
    if (matches.length > 0) {
      const headers = ['Year', 'Yield (%)'];
      const rows = matches.map(match => [match[1], match[2]]);
      return { headers, rows };
    }
  }

  // Default table structure if no specific format is detected
  return {
    headers: ['Property', 'Value'],
    rows: content
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [prop, ...rest] = line.split(':');
        return [prop.trim(), rest.join(':').trim()];
      })
  };
}

// Content segmentation function
export function parseContent(text: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  let currentSegment = '';
  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1] || '';
    const isTableStart = shouldDisplayAsTable(line + '\n' + nextLine);

    if (isTableStart) {
      // Push accumulated text if exists
      if (currentSegment.trim()) {
        segments.push({ type: 'text', content: currentSegment.trim() });
        currentSegment = '';
      }

      // Collect table content
      let tableContent = line + '\n';
      let j = i + 1;
      while (j < lines.length && (shouldDisplayAsTable(lines[j]) || lines[j].trim().startsWith('|'))) {
        tableContent += lines[j] + '\n';
        j++;
      }
      i = j - 1;

      segments.push({ type: 'table', content: tableContent.trim() });
    } else {
      currentSegment += line + '\n';
    }
  }

  // Push remaining text
  if (currentSegment.trim()) {
    segments.push({ type: 'text', content: currentSegment.trim() });
  }

  return segments;
}

// Table component
export const ChatTable: React.FC<{ content: string }> = ({ content }) => {
  const tableData = parseTableData(content);

  return (
    <div className="w-full overflow-x-auto my-4">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-Tariel-dark-bg border-b border-Tariel-border">
            {tableData.headers.map((header, i) => (
              <th key={i} className="p-3 text-left text-sm font-semibold text-Tariel-text-light">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.rows.map((row, i) => (
            <tr 
              key={i} 
              className={cn(
                "border-b border-Tariel-border",
                i % 2 === 0 ? "bg-Tariel-dark-bg/50" : "bg-Tariel-dark-bg/30"
              )}
            >
              {row.map((cell, j) => (
                <td key={j} className="p-3 text-sm text-Tariel-text-light">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 