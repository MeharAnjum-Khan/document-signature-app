import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { signatureAPI, documentAPI } from '../api';
import {
  FileSignature,
  Check,
  X,
  Loader2,
  PenTool,
  Type,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface SignatureInfo {
  _id: string;
  document: {
    _id: string;
    title: string;
    fileName: string;
    status: string;
  };
  signerEmail: string;
  signerName: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  status: string;
}

export default function SignPage() {
  const { token } = useParams<{ token: string }>();
  const [signatureInfo, setSignatureInfo] = useState<SignatureInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Signing
  const [signatureType, setSignatureType] = useState<'text' | 'draw'>('text');
  const [textSignature, setTextSignature] = useState('');
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [rejected, setRejected] = useState(false);

  // Rejection
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  // Drawing
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const fetchSignature = async () => {
      try {
        const { data } = await signatureAPI.getByToken(token!);
        setSignatureInfo(data.signature);
        setCurrentPage(data.signature.page);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Invalid or expired signing link');
      } finally {
        setLoading(false);
      }
    };
    fetchSignature();
  }, [token]);

  // Canvas drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e40af';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSign = async () => {
    let signatureData = '';

    if (signatureType === 'text') {
      if (!textSignature.trim()) {
        toast.error('Please type your signature');
        return;
      }
      signatureData = textSignature.trim();
    } else {
      if (!hasDrawn || !canvasRef.current) {
        toast.error('Please draw your signature');
        return;
      }
      signatureData = canvasRef.current.toDataURL('image/png');
    }

    setSigning(true);
    try {
      await signatureAPI.sign(token!, { signatureData, signatureType });
      setSigned(true);
      toast.success('Document signed successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to sign');
    } finally {
      setSigning(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      await signatureAPI.reject(token!, { reason: rejectReason });
      setRejected(true);
      toast.success('Signature rejected.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-surface-900 mb-2">Unable to Sign</h2>
          <p className="text-surface-500">{error}</p>
        </div>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-surface-900 mb-2">Document Signed!</h2>
          <p className="text-surface-500">
            Thank you, your signature has been recorded. The document owner will be notified.
          </p>
        </div>
      </div>
    );
  }

  if (rejected) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-surface-900 mb-2">Signature Rejected</h2>
          <p className="text-surface-500">
            You've declined to sign this document. The document owner has been notified.
          </p>
        </div>
      </div>
    );
  }

  if (!signatureInfo) return null;

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="bg-white border-b border-surface-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <FileSignature className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-surface-900">DocSign</span>
          </div>
          <span className="text-sm text-surface-500">Signing as: {signatureInfo.signerEmail}</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Document Info */}
        <div className="card mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="font-semibold text-surface-900">{signatureInfo.document.title}</h2>
              <p className="text-sm text-surface-500">
                Please review the document and sign at the highlighted area on page {signatureInfo.page}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* PDF Preview */}
          <div className="lg:col-span-2">
            <div className="card p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                  className="p-1.5 hover:bg-surface-100 rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-surface-600">Page {currentPage} of {numPages || '?'}</span>
                <button
                  onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                  disabled={currentPage >= numPages}
                  className="p-1.5 hover:bg-surface-100 rounded-lg disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="relative border border-surface-200 rounded-lg overflow-hidden bg-surface-100">
                <Document
                  file={documentAPI.getFileUrl(signatureInfo.document._id)}
                  onLoadSuccess={({ numPages: n }) => setNumPages(n)}
                  loading={
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                    </div>
                  }
                >
                  <Page pageNumber={currentPage} width={600} />
                </Document>

                {/* Signature spot highlight */}
                {currentPage === signatureInfo.page && (
                  <div
                    className="absolute border-2 border-dashed border-primary-500 bg-primary-100/50 rounded animate-pulse"
                    style={{
                      left: signatureInfo.x,
                      top: signatureInfo.y,
                      width: signatureInfo.width,
                      height: signatureInfo.height,
                    }}
                  >
                    <span className="absolute -top-5 left-0 text-xs font-medium text-primary-600">Sign here</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Signing Panel */}
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-semibold text-surface-900 mb-4">Your Signature</h3>

              {/* Signature Type Toggle */}
              <div className="flex gap-1 bg-surface-100 p-1 rounded-lg mb-4">
                <button
                  onClick={() => setSignatureType('text')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                    signatureType === 'text' ? 'bg-white shadow text-primary-600' : 'text-surface-500 hover:text-surface-700'
                  }`}
                >
                  <Type className="w-4 h-4" />
                  Type
                </button>
                <button
                  onClick={() => setSignatureType('draw')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                    signatureType === 'draw' ? 'bg-white shadow text-primary-600' : 'text-surface-500 hover:text-surface-700'
                  }`}
                >
                  <PenTool className="w-4 h-4" />
                  Draw
                </button>
              </div>

              {/* Type Signature */}
              {signatureType === 'text' && (
                <div>
                  <input
                    type="text"
                    value={textSignature}
                    onChange={(e) => setTextSignature(e.target.value)}
                    className="input-field text-lg"
                    placeholder="Type your full name"
                  />
                  {textSignature && (
                    <div className="mt-3 p-4 bg-surface-50 border border-surface-200 rounded-lg text-center">
                      <p className="text-2xl text-primary-800" style={{ fontFamily: 'cursive' }}>
                        {textSignature}
                      </p>
                      <p className="text-xs text-surface-400 mt-1">Signature preview</p>
                    </div>
                  )}
                </div>
              )}

              {/* Draw Signature */}
              {signatureType === 'draw' && (
                <div>
                  <div className="border-2 border-surface-200 rounded-lg overflow-hidden bg-white">
                    <canvas
                      ref={canvasRef}
                      width={300}
                      height={120}
                      className="w-full cursor-crosshair"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                  </div>
                  <button onClick={clearCanvas} className="text-xs text-surface-500 hover:text-surface-700 mt-2">
                    Clear drawing
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <button
              onClick={handleSign}
              disabled={signing}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {signing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {signing ? 'Signing...' : 'Sign Document'}
            </button>

            {!showReject ? (
              <button
                onClick={() => setShowReject(true)}
                className="btn-secondary w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Decline to Sign
              </button>
            ) : (
              <div className="card">
                <h4 className="text-sm font-medium text-surface-900 mb-2">Reason for declining</h4>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="input-field text-sm"
                  rows={3}
                  placeholder="Optional reason..."
                />
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setShowReject(false)} className="btn-secondary flex-1 text-sm py-2">
                    Cancel
                  </button>
                  <button onClick={handleReject} disabled={rejecting} className="btn-danger flex-1 text-sm py-2 flex items-center justify-center gap-1.5">
                    {rejecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                    Decline
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
