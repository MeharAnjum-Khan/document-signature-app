import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { documentAPI, signatureAPI, auditAPI, shareAPI } from '../api';
import {
  ArrowLeft,
  PenTool,
  Send,
  FileText,
  History,
  Trash2,
  Download,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocData {
  _id: string;
  title: string;
  fileName: string;
  fileSize: number;
  status: string;
  createdAt: string;
  signedFilePath: string | null;
}

interface SignatureData {
  _id: string;
  signerEmail: string;
  signerName: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  status: string;
  signedAt: string | null;
  token: string;
}

interface AuditEntry {
  _id: string;
  action: string;
  performerEmail: string;
  performerName: string;
  ip: string;
  createdAt: string;
}

const actionLabels: Record<string, string> = {
  document_uploaded: 'Document uploaded',
  document_viewed: 'Document viewed',
  document_deleted: 'Document deleted',
  signature_requested: 'Signature requested',
  signature_placed: 'Signature placed',
  signature_signed: 'Document signed',
  signature_rejected: 'Signature rejected',
  document_signed_pdf_generated: 'Signed PDF generated',
  signing_link_created: 'Signing link sent',
  signing_link_accessed: 'Signing link accessed',
};

export default function DocumentView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [doc, setDoc] = useState<DocData | null>(null);
  const [signatures, setSignatures] = useState<SignatureData[]>([]);
  const [audits, setAudits] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'signatures' | 'audit'>('signatures');

  // Signature placement
  const [showAddSig, setShowAddSig] = useState(false);
  const [placingSignature, setPlacingSignature] = useState(false);
  const [sigPosition, setSigPosition] = useState({ x: 100, y: 100 });
  const [sigForm, setSigForm] = useState({ signerEmail: '', signerName: '' });
  const [savingSig, setSavingSig] = useState(false);

  // Share
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareName, setShareName] = useState('');
  const [sharing, setSharing] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [docRes, sigRes, auditRes] = await Promise.all([
        documentAPI.getById(id),
        signatureAPI.getByDocument(id),
        auditAPI.getByDocument(id),
      ]);
      setDoc(docRes.data.document);
      setSignatures(sigRes.data.signatures);
      setAudits(auditRes.data.audits);
    } catch (err: any) {
      toast.error('Failed to load document');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePdfClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!placingSignature || !pdfContainerRef.current) return;
    const rect = pdfContainerRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setSigPosition({ x, y });
  };

  const handleAddSignature = async () => {
    if (!sigForm.signerEmail) {
      toast.error('Signer email is required');
      return;
    }
    setSavingSig(true);
    try {
      const { data } = await signatureAPI.create({
        documentId: id!,
        signerEmail: sigForm.signerEmail,
        signerName: sigForm.signerName,
        page: currentPage,
        x: sigPosition.x,
        y: sigPosition.y,
      });
      toast.success('Signature field placed!');
      setShowAddSig(false);
      setPlacingSignature(false);
      setSigForm({ signerEmail: '', signerName: '' });
      fetchData();

      // Copy signing link
      if (data.signingLink) {
        navigator.clipboard.writeText(data.signingLink).then(() => {
          toast.success('Signing link copied to clipboard!');
        });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add signature');
    } finally {
      setSavingSig(false);
    }
  };

  const handleShare = async (signerEmail: string, signerName: string) => {
    if (!signerEmail) {
      toast.error('Email is required');
      return;
    }
    setSharing(true);
    try {
      const { data } = await shareAPI.send(id!, { signerEmail, signerName });
      toast.success(data.message);
      if (data.signingLink) {
        setCopiedLink(data.signingLink);
      }
      setShowShareModal(false);
      setShareEmail('');
      setShareName('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send');
    } finally {
      setSharing(false);
    }
  };

  const handleDeleteSignature = async (sigId: string) => {
    try {
      await signatureAPI.delete(sigId);
      toast.success('Signature removed');
      fetchData();
    } catch {
      toast.error('Failed to delete signature');
    }
  };

  const handleDownload = async () => {
    try {
      const response = await documentAPI.download(id!);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = doc?.fileName || 'document.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Download failed');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(text);
    toast.success('Link copied!');
    setTimeout(() => setCopiedLink(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!doc) return null;

  const statusColor: Record<string, string> = {
    draft: 'badge-draft',
    pending: 'badge-pending',
    completed: 'badge-completed',
    rejected: 'badge-rejected',
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-surface-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-surface-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-surface-900">{doc.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={statusColor[doc.status] || 'badge-draft'}>
                {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
              </span>
              <span className="text-xs text-surface-400">{doc.fileName}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleDownload} className="btn-secondary text-sm py-2 px-3 flex items-center gap-1.5">
            <Download className="w-4 h-4" />
            Download
          </button>
          {doc.status !== 'completed' && (
            <>
              <button
                onClick={() => { setPlacingSignature(true); setShowAddSig(true); }}
                className="btn-primary text-sm py-2 px-3 flex items-center gap-1.5"
              >
                <PenTool className="w-4 h-4" />
                Add Signature
              </button>
              {signatures.filter(s => s.status === 'pending').length > 0 && (
                <button onClick={() => setShowShareModal(true)} className="btn-success text-sm py-2 px-3 flex items-center gap-1.5">
                  <Send className="w-4 h-4" />
                  Send Request
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* PDF Viewer */}
        <div className="lg:col-span-2">
          <div className="card p-4">
            {/* Page Controls */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="p-1.5 hover:bg-surface-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-surface-600">
                Page {currentPage} of {numPages || '?'}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                disabled={currentPage >= numPages}
                className="p-1.5 hover:bg-surface-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {placingSignature && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 mb-4 flex items-center gap-2 text-sm text-primary-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Click on the PDF to place the signature field
              </div>
            )}

            {/* PDF */}
            <div
              ref={pdfContainerRef}
              className="relative border border-surface-200 rounded-lg overflow-hidden bg-surface-100 cursor-crosshair"
              onClick={handlePdfClick}
            >
              <Document
                file={documentAPI.getFileUrl(id!)}
                onLoadSuccess={({ numPages: n }) => setNumPages(n)}
                loading={
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                  </div>
                }
                error={
                  <div className="flex flex-col items-center justify-center py-20 text-surface-400">
                    <FileText className="w-12 h-12 mb-2" />
                    <p className="text-sm">Failed to load PDF</p>
                  </div>
                }
              >
                <Page pageNumber={currentPage} width={700} renderTextLayer={true} renderAnnotationLayer={true} />
              </Document>

              {/* Signature overlays for current page */}
              {signatures
                .filter((s) => s.page === currentPage)
                .map((sig) => (
                  <div
                    key={sig._id}
                    className={`absolute border-2 rounded flex items-center justify-center text-xs font-medium ${
                      sig.status === 'signed'
                        ? 'border-green-400 bg-green-50/80 text-green-700'
                        : sig.status === 'rejected'
                        ? 'border-red-400 bg-red-50/80 text-red-700'
                        : 'border-primary-400 bg-primary-50/80 text-primary-700 border-dashed'
                    }`}
                    style={{
                      left: sig.x,
                      top: sig.y,
                      width: sig.width,
                      height: sig.height,
                    }}
                  >
                    {sig.status === 'signed' ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3" /> Signed
                      </span>
                    ) : sig.status === 'rejected' ? (
                      'Rejected'
                    ) : (
                      <span className="truncate px-1">{sig.signerEmail}</span>
                    )}
                  </div>
                ))}

              {/* Placement preview */}
              {placingSignature && (
                <div
                  className="absolute border-2 border-dashed border-blue-500 bg-blue-100/60 rounded flex items-center justify-center text-xs text-blue-600 pointer-events-none"
                  style={{
                    left: sigPosition.x,
                    top: sigPosition.y,
                    width: 200,
                    height: 50,
                  }}
                >
                  Signature here
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Add Signature Form */}
          {showAddSig && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-surface-900 text-sm">Add Signature Field</h3>
                <button onClick={() => { setShowAddSig(false); setPlacingSignature(false); }} className="text-surface-400 hover:text-surface-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-surface-600 mb-1 block">Signer Email *</label>
                  <input
                    type="email"
                    value={sigForm.signerEmail}
                    onChange={(e) => setSigForm({ ...sigForm, signerEmail: e.target.value })}
                    className="input-field text-sm"
                    placeholder="signer@example.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-surface-600 mb-1 block">Signer Name</label>
                  <input
                    type="text"
                    value={sigForm.signerName}
                    onChange={(e) => setSigForm({ ...sigForm, signerName: e.target.value })}
                    className="input-field text-sm"
                    placeholder="John Doe"
                  />
                </div>
                <p className="text-xs text-surface-400">
                  Position: ({sigPosition.x}, {sigPosition.y}) on page {currentPage}
                </p>
                <button onClick={handleAddSignature} disabled={savingSig} className="btn-primary w-full text-sm flex items-center justify-center gap-2">
                  {savingSig ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {savingSig ? 'Saving...' : 'Place Signature'}
                </button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="card p-0">
            <div className="flex border-b border-surface-100">
              <button
                onClick={() => setActiveTab('signatures')}
                className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
                  activeTab === 'signatures'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-surface-500 hover:text-surface-700'
                }`}
              >
                <PenTool className="w-4 h-4 inline mr-1.5" />
                Signatures ({signatures.length})
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
                  activeTab === 'audit'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-surface-500 hover:text-surface-700'
                }`}
              >
                <History className="w-4 h-4 inline mr-1.5" />
                Audit Trail
              </button>
            </div>

            <div className="p-4 max-h-[500px] overflow-y-auto">
              {activeTab === 'signatures' ? (
                signatures.length === 0 ? (
                  <p className="text-sm text-surface-400 text-center py-6">No signatures yet</p>
                ) : (
                  <div className="space-y-3">
                    {signatures.map((sig) => (
                      <div key={sig._id} className="border border-surface-100 rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-surface-900 truncate">
                              {sig.signerName || sig.signerEmail}
                            </p>
                            <p className="text-xs text-surface-400 truncate">{sig.signerEmail}</p>
                            <p className="text-xs text-surface-400 mt-1">
                              Page {sig.page} &middot; ({sig.x}, {sig.y})
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className={`${
                              sig.status === 'signed' ? 'badge-signed' :
                              sig.status === 'rejected' ? 'badge-rejected' : 'badge-pending'
                            }`}>
                              {sig.status.charAt(0).toUpperCase() + sig.status.slice(1)}
                            </span>
                            {sig.status === 'pending' && (
                              <button
                                onClick={() => handleDeleteSignature(sig._id)}
                                className="p-1 text-surface-400 hover:text-red-500 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        {sig.status === 'pending' && sig.token && (
                          <button
                            onClick={() => copyToClipboard(`${window.location.origin}/sign/${sig.token}`)}
                            className="mt-2 text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                          >
                            {copiedLink?.includes(sig.token) ? (
                              <><Check className="w-3 h-3" /> Copied!</>
                            ) : (
                              <><Copy className="w-3 h-3" /> Copy signing link</>
                            )}
                          </button>
                        )}
                        {sig.signedAt && (
                          <p className="text-xs text-surface-400 mt-1">
                            Signed: {new Date(sig.signedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )
              ) : (
                audits.length === 0 ? (
                  <p className="text-sm text-surface-400 text-center py-6">No audit entries</p>
                ) : (
                  <div className="space-y-3">
                    {audits.map((a) => (
                      <div key={a._id} className="border-l-2 border-surface-200 pl-3 py-1">
                        <p className="text-sm font-medium text-surface-800">
                          {actionLabels[a.action] || a.action}
                        </p>
                        <p className="text-xs text-surface-500">
                          {a.performerName || a.performerEmail || 'System'}
                        </p>
                        <p className="text-xs text-surface-400 mt-0.5">
                          {new Date(a.createdAt).toLocaleString()}
                          {a.ip && ` · ${a.ip}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-surface-100">
              <h3 className="text-lg font-semibold text-surface-900">Send Signing Request</h3>
              <button onClick={() => setShowShareModal(false)} className="p-1 text-surface-400 hover:text-surface-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-surface-500">
                Select a pending signer to send them an email with the signing link:
              </p>
              {signatures.filter(s => s.status === 'pending').map(sig => (
                <div key={sig._id} className="border border-surface-200 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{sig.signerName || sig.signerEmail}</p>
                    <p className="text-xs text-surface-400">{sig.signerEmail}</p>
                  </div>
                  <button
                    onClick={() => handleShare(sig.signerEmail, sig.signerName)}
                    disabled={sharing}
                    className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                  >
                    {sharing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    Send
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
