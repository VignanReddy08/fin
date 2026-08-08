import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { FileText, Search, Upload, Trash2, BookOpen, AlertCircle, Database, CheckCircle2 } from 'lucide-react';

interface RAGDocument {
  id: string;
  title: string;
  type: 'PDF' | 'TXT' | 'DOCX';
  size: string;
  uploadedAt: string;
  status: 'Indexed' | 'Indexing' | 'Failed';
  version: string;
  chunksCount: number;
}

const DEFAULT_DOCUMENTS: RAGDocument[] = [
  {
    id: 'doc-001',
    title: 'Refund Limits and Escalation Matrix Policy.pdf',
    type: 'PDF',
    size: '1.2 MB',
    uploadedAt: '2026-06-01T10:00:00Z',
    status: 'Indexed',
    version: 'v2.4',
    chunksCount: 42
  },
  {
    id: 'doc-002',
    title: 'Security Breach Lockout SOP.txt',
    type: 'TXT',
    size: '340 KB',
    uploadedAt: '2026-07-12T14:30:00Z',
    status: 'Indexed',
    version: 'v1.1',
    chunksCount: 12
  },
  {
    id: 'doc-003',
    title: 'Adyen vs Stripe Payout Resolution SOP.docx',
    type: 'DOCX',
    size: '890 KB',
    uploadedAt: '2026-07-28T09:15:00Z',
    status: 'Indexing',
    version: 'v1.0',
    chunksCount: 0
  }
];

export default function KnowledgeBase() {
  const [documents, setDocuments] = useState<RAGDocument[]>(DEFAULT_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');
    if (!uploadFile) {
      setUploadError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setTimeout(() => {
      const type = uploadFile.name.split('.').pop()?.toUpperCase() as any || 'TXT';
      const sizeMB = (uploadFile.size / (1024 * 1024)).toFixed(1);
      
      const newDoc: RAGDocument = {
        id: `doc-${Date.now()}`,
        title: uploadFile.name,
        type: ['PDF', 'TXT', 'DOCX'].includes(type) ? type : 'PDF',
        size: `${sizeMB} MB`,
        uploadedAt: new Date().toISOString(),
        status: 'Indexing',
        version: 'v1.0',
        chunksCount: 0
      };

      setDocuments(prev => [newDoc, ...prev]);
      setUploadFile(null);
      setIsUploading(false);

      // Simulate vector indexing completing after 4 seconds
      setTimeout(() => {
        setDocuments(current => 
          current.map(d => d.id === newDoc.id ? { ...d, status: 'Indexed', chunksCount: Math.round(15 + Math.random() * 25) } : d)
        );
      }, 4000);

    }, 2000);
  };

  const handleDelete = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexedCount = documents.filter(d => d.status === 'Indexed').length;
  const indexingCount = documents.filter(d => d.status === 'Indexing').length;
  const totalChunks = documents.reduce((acc, curr) => acc + curr.chunksCount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Knowledge Base Manager (RAG)</h1>
        <p className="text-sm text-gray-400">
          Upload and index internal policy documentation, FAQ manuals, and SOP directives to feed the AI Decision model.
        </p>
      </div>

      {/* RAG Health KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover:border-primary/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Indexed SOP Files</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{indexedCount} / {documents.length}</div>
            <p className="text-xs text-gray-500 mt-1">Status: Active RAG Pipeline</p>
          </CardContent>
        </Card>

        <Card className="hover:border-yellow-500/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Vector Index Density</CardTitle>
            <Database className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalChunks} Chunks</div>
            <p className="text-xs text-gray-500 mt-1">Chunk Size: 512 Tokens (Overlap: 64)</p>
          </CardContent>
        </Card>

        <Card className="hover:border-emerald-500/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Embedding Health</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">100% Vector Lock</div>
            <p className="text-xs text-gray-500 mt-1">Cosine Similarity Confidence: &gt;0.86</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Upload card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base text-white">Upload New Document</CardTitle>
            <CardDescription className="text-xs">Support formats: PDF, TXT, DOCX up to 10MB.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {uploadError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-xs flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors relative">
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadFile(e.target.files[0]);
                      setUploadError('');
                    }
                  }}
                  accept=".pdf,.txt,.docx"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-300 font-medium">
                  {uploadFile ? uploadFile.name : 'Click to select or drag file here'}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">PDF, TXT, DOCX</p>
              </div>

              <Button type="submit" className="w-full h-9 text-xs" disabled={isUploading || !uploadFile}>
                {isUploading ? 'Chunking & Indexing...' : 'Upload & Start Embedding'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Documents Listing */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <CardTitle className="text-base text-white">Indexed RAG Corpus</CardTitle>
                <CardDescription className="text-xs">Currently indexed documentation matching similarities.</CardDescription>
              </div>
              <div className="relative w-48 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-500" />
                <Input
                  placeholder="Search indexed files..."
                  className="pl-8 bg-black/25 text-xs border-border h-8 focus-visible:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredDocs.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <FileText className="h-10 w-10 text-gray-500" />
                <p className="text-xs text-gray-400">No documents found matching search query</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {filteredDocs.map((doc) => (
                  <div key={doc.id} className="py-3.5 flex justify-between items-center first:pt-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-white">{doc.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                          <span>{doc.type}</span>
                          <span>•</span>
                          <span>{doc.size}</span>
                          <span>•</span>
                          <span>Version: {doc.version}</span>
                          <span>•</span>
                          <span>{doc.chunksCount} chunks vector mapped</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={
                        doc.status === 'Indexed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]' :
                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[10px] animate-pulse'
                      }>
                        {doc.status}
                      </Badge>
                      <Button onClick={() => handleDelete(doc.id)} variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
