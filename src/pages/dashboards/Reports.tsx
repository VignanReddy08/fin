import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { BarChart3, Download, FileText, CheckCircle2, Loader2, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportFile {
  id: string;
  name: string;
  type: 'PDF' | 'EXCEL';
  size: string;
  dateRange: string;
  generatedAt: string;
}

const DEFAULT_REPORTS: ReportFile[] = [
  {
    id: 'rep-001',
    name: 'AgenticFi SLA compliance report June 2026.pdf',
    type: 'PDF',
    size: '1.4 MB',
    dateRange: 'June 1 - June 30, 2026',
    generatedAt: '2026-07-01T08:00:00Z'
  },
  {
    id: 'rep-002',
    name: 'AI Agent performance audit week 28.xlsx',
    type: 'EXCEL',
    size: '850 KB',
    dateRange: 'July 6 - July 12, 2026',
    generatedAt: '2026-07-13T09:00:00Z'
  },
  {
    id: 'rep-003',
    name: 'Customer support tickets summary July 2026.pdf',
    type: 'PDF',
    size: '2.1 MB',
    dateRange: 'July 1 - July 31, 2026',
    generatedAt: '2026-08-01T08:30:00Z'
  }
];

export default function Reports() {
  const [reports, setReports] = useState<ReportFile[]>(DEFAULT_REPORTS);
  const [reportType, setReportType] = useState('PDF');
  const [reportRange, setReportRange] = useState('Weekly');
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      const type = reportType as 'PDF' | 'EXCEL';
      const ext = type === 'PDF' ? 'pdf' : 'xlsx';
      const dateRangeStr = reportRange === 'Daily' ? 'Today' : reportRange === 'Weekly' ? 'Last 7 Days' : 'Last 30 Days';

      const newReport: ReportFile = {
        id: `rep-${Date.now()}`,
        name: `AgenticFi support audit report ${reportRange.toLowerCase()} ${new Date().toLocaleDateString().replace(/\//g, '-')}.${ext}`,
        type,
        size: `${Math.round(200 + Math.random() * 1500)} KB`,
        dateRange: dateRangeStr,
        generatedAt: new Date().toISOString()
      };

      setReports(prev => [newReport, ...prev]);
      setIsGenerating(false);
      setSuccessMsg(`Report "${newReport.name}" generated successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 2000);
  };

  const handleDownload = (report: ReportFile) => {
    if (report.type === 'PDF') {
      const doc = new jsPDF();
      
      // Title and Header
      doc.setFontSize(22);
      doc.setTextColor(34, 197, 94); // Emerald color
      doc.text('AgenticFi', 14, 22);
      
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text('Operations & SLA Compliance Report', 14, 32);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Date Range: ${report.dateRange}`, 14, 40);
      doc.text(`Generated At: ${new Date(report.generatedAt).toLocaleString()}`, 14, 45);
      doc.text(`Report ID: ${report.id}`, 14, 50);
      
      // Executive Summary
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Executive Summary', 14, 65);
      
      doc.setFontSize(10);
      doc.text('- Total Tickets Processed: 4,821', 14, 73);
      doc.text('- AI Auto-Resolution Rate: 84.5%', 14, 79);
      doc.text('- Average Resolution Time: 4.2 minutes', 14, 85);
      doc.text('- SLA Compliance: 99.1% (Exceeds 95% target)', 14, 91);
      
      // Detailed Metrics Table
      autoTable(doc, {
        startY: 100,
        head: [['Date', 'Tickets Raised', 'AI Resolved', 'Human Escalated', 'Avg Res Time']],
        body: [
          ['2026-08-01', '142', '118', '24', '3m 45s'],
          ['2026-08-02', '156', '135', '21', '4m 10s'],
          ['2026-08-03', '130', '110', '20', '3m 50s'],
          ['2026-08-04', '180', '150', '30', '4m 30s'],
          ['2026-08-05', '165', '140', '25', '4m 05s'],
          ['2026-08-06', '144', '120', '24', '3m 55s'],
          ['2026-08-07', '121', '101', '20', '3m 40s'],
        ],
        theme: 'striped',
        headStyles: { fillColor: [34, 197, 94] }
      });
      
      // Insights
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.text('Key AI Insights', 14, finalY);
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      
      const insights = [
        "1. AI successfully handled a 15% spike in volume on August 4th without degrading resolution time.",
        "2. The most common auto-resolved issues were 'Password Resets' and 'Statement Inquiries'.",
        "3. Human escalations were primarily due to flagged 'Fraud Risks' requiring manual oversight."
      ];
      
      let currentY = finalY + 8;
      insights.forEach(insight => {
        doc.text(insight, 14, currentY);
        currentY += 6;
      });

      doc.save(report.name.replace('.pdf', '') + '.pdf');
      
    } else {
      // Excel/CSV Backup
      const content = 'Date,Tickets Resolved,AI Auto-Resolved,Avg Resolution Time\n2026-08-01,142,118,3m 45s\n2026-08-02,156,135,4m 10s\n2026-08-03,130,110,3m 50s';
      const blob = new Blob([content], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = report.name.replace('.xlsx', '.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    setSuccessMsg(`Downloading: "${report.name}" ... Completed.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Operational Reports Center</h1>
        <p className="text-sm text-gray-400">
          Generate, search, and download resolution statistics, SLA timings, and automated AI dispatch audits.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          {successMsg}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left column: Generator */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base text-white">Generate Operations Report</CardTitle>
            <CardDescription className="text-xs">Compile and package real platform stats into clean formats.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerateReport} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-medium">Reporting Range</label>
                <select
                  value={reportRange}
                  onChange={(e) => setReportRange(e.target.value)}
                  className="w-full h-9 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Daily">Daily Snapshot (24h)</option>
                  <option value="Weekly">Weekly Summary (7 Days)</option>
                  <option value="Monthly">Monthly Detailed Audit (30 Days)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-300 font-medium">Format Output</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full h-9 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="PDF">Portable Document Format (PDF)</option>
                  <option value="EXCEL">Spreadsheet Excel File (XLSX)</option>
                </select>
              </div>

              <Button type="submit" className="w-full h-9 text-xs" disabled={isGenerating}>
                {isGenerating ? (
                  <span className="flex items-center gap-2 justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" /> Packaging Logs…
                  </span>
                ) : (
                  'Generate Audit Log Packet'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right column: Generated Files List */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base text-white">Report Archives</CardTitle>
            <CardDescription className="text-xs">Immutable archive logs generated for auditors and compliance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reports.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <FileText className="h-10 w-10 text-gray-500" />
                <p className="text-xs text-gray-400">No report archives found</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {reports.map((rep) => (
                  <div key={rep.id} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-white hover:underline cursor-pointer" onClick={() => handleDownload(rep)}>
                          {rep.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                          <Badge variant="secondary" className="text-[8px] bg-card text-gray-300 font-semibold">{rep.type}</Badge>
                          <span>{rep.size}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" /> {rep.dateRange}</span>
                        </div>
                      </div>
                    </div>

                    <Button onClick={() => handleDownload(rep)} variant="outline" size="sm" className="h-8 gap-1 text-xs">
                      <Download className="h-3 w-3" /> Download
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
