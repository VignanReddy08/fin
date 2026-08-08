import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Download, Printer, Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

export default function BackupCodes() {
  const [codes, setCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const generateCodes = () => {
    const list: string[] = [];
    for (let i = 0; i < 8; i++) {
      const code = Math.random().toString(36).substring(2, 6).toUpperCase() + '-' +
                   Math.random().toString(36).substring(2, 6).toUpperCase();
      list.push(code);
    }
    setCodes(list);
    setCopied(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = `AGENTICFI ENTERPRISE BACKUP RECOVERY CODES\nGenerated: ${new Date().toLocaleString()}\n\nKeep these codes secure. Each code can only be used once.\n\n` + codes.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'agenticfi-backup-codes.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>AgenticFi Backup Codes</title>
            <style>
              body { font-family: monospace; padding: 40px; }
              h1 { font-size: 20px; margin-bottom: 20px; }
              ul { list-style-type: none; padding: 0; }
              li { font-size: 16px; margin: 10px 0; letter-spacing: 1px; }
            </style>
          </head>
          <body>
            <h1>AgenticFi Enterprise Recovery Codes</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <p><strong>Warning:</strong> Keep these codes secure. Each code is for single-use recovery.</p>
            <hr />
            <ul>
              ${codes.map((c) => `<li>[ ] ${c}</li>`).join('')}
            </ul>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-4">
      {codes.length === 0 ? (
        <div className="p-6 text-center border border-dashed border-border/80 rounded-lg space-y-3.5 bg-card/25">
          <ShieldCheck className="h-10 w-10 text-gray-500 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-white">Emergency Recovery Codes</h4>
            <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
              If you lose access to your MFA device, you can use backup codes to access your account.
            </p>
          </div>
          <Button onClick={generateCodes} variant="outline" size="sm">
            Generate Recovery Codes
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border border-border/60 bg-card/40 rounded-lg space-y-4"
        >
          <div className="flex items-center justify-between border-b border-border/30 pb-2">
            <span className="text-xs font-semibold text-white uppercase tracking-wider">Verification Backup Codes</span>
            <button
              onClick={generateCodes}
              className="text-[10px] text-primary flex items-center gap-1 hover:underline"
            >
              <RefreshCw className="h-3 w-3" /> Regenerate
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5 font-mono text-center text-sm text-white select-all">
            {codes.map((c, i) => (
              <div key={i} className="p-2 rounded bg-background/60 border border-border/40 hover:border-primary/20 transition-colors">
                {c}
              </div>
            ))}
          </div>

          <div className="flex gap-2 justify-end text-xs pt-2 border-t border-border/30">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded bg-muted text-gray-400 hover:text-white flex items-center gap-1 transition-all"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded bg-muted text-gray-400 hover:text-white flex items-center gap-1 transition-all"
            >
              <Download className="h-3.5 w-3.5" /> Download
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded bg-muted text-gray-400 hover:text-white flex items-center gap-1 transition-all"
            >
              <Printer className="h-3.5 w-3.5" /> Print
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
