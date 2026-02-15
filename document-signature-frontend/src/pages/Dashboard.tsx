import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { documentAPI } from '../api';
import {
  Upload,
  FileText,
  Search,
  Filter,
  Trash2,
  Eye,
  Plus,
  Loader2,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Document {
  _id: string;
  title: string;
  fileName: string;
  fileSize: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const statusColors: Record<string, string> = {
  draft: 'badge-draft',
  pending: 'badge-pending',
  completed: 'badge-completed',
  rejected: 'badge-rejected',
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await documentAPI.getAll({
        page,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search || undefined,
      });
      setDocuments(data.documents);
      setPagination(data.pagination);
    } catch (error: any) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchDocuments(1);
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchDocuments]);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.querySelector<HTMLInputElement>('input[type="file"]');
    const titleInput = form.querySelector<HTMLInputElement>('input[name="title"]');

    if (!fileInput?.files?.length) {
      toast.error('Please select a PDF file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    if (titleInput?.value) {
      formData.append('title', titleInput.value);
    }

    try {
      await documentAPI.upload(formData);
      toast.success('Document uploaded!');
      setShowUploadModal(false);
      fetchDocuments(1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await documentAPI.delete(id);
      toast.success('Document deleted');
      fetchDocuments(pagination.page);
    } catch {
      toast.error('Failed to delete document');
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">My Documents</h1>
          <p className="text-surface-500 text-sm mt-1">
            Manage your documents and track signature progress
          </p>
        </div>
        <button onClick={() => setShowUploadModal(true)} className="btn-primary flex items-center gap-2 self-start">
          <Plus className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field pl-10 pr-8 appearance-none cursor-pointer min-w-[140px]"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Document List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : documents.length === 0 ? (
        <div className="card text-center py-16">
          <FileText className="w-16 h-16 text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-700 mb-2">No documents yet</h3>
          <p className="text-surface-500 text-sm mb-6">Upload your first PDF to get started.</p>
          <button onClick={() => setShowUploadModal(true)} className="btn-primary inline-flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload PDF
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block card p-0 overflow-visible">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100 bg-surface-50/50">
                  <th className="text-left py-3 px-5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Document</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Size</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Date</th>
                  <th className="text-right py-3 px-5 text-xs font-semibold text-surface-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc._id} className="border-b border-surface-50 hover:bg-surface-50/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-surface-900 truncate">{doc.title}</p>
                          <p className="text-xs text-surface-400 truncate">{doc.fileName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={statusColors[doc.status] || 'badge-draft'}>
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-sm text-surface-500">
                      {formatFileSize(doc.fileSize)}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5 text-sm text-surface-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(doc.createdAt)}
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/documents/${doc._id}`}
                          className="p-2 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(doc._id)}
                          className="p-2 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {documents.map((doc) => (
              <Link to={`/documents/${doc._id}`} key={doc._id} className="card block hover:shadow-soft transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-surface-900 truncate text-sm">{doc.title}</p>
                      <p className="text-xs text-surface-400 mt-0.5">{formatFileSize(doc.fileSize)} &middot; {formatDate(doc.createdAt)}</p>
                    </div>
                  </div>
                  <span className={statusColors[doc.status] || 'badge-draft'}>
                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-surface-500">
                Showing {(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => fetchDocuments(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-2 rounded-lg hover:bg-surface-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => fetchDocuments(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="p-2 rounded-lg hover:bg-surface-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowUploadModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-surface-100">
              <h3 className="text-lg font-semibold text-surface-900">Upload Document</h3>
              <button onClick={() => setShowUploadModal(false)} className="p-1 text-surface-400 hover:text-surface-600 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Title (optional)</label>
                <input name="title" type="text" className="input-field" placeholder="Document title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">PDF File</label>
                <div className="border-2 border-dashed border-surface-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                  <Upload className="w-8 h-8 text-surface-400 mx-auto mb-2" />
                  <input type="file" accept=".pdf,application/pdf" className="w-full text-sm text-surface-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer" />
                  <p className="text-xs text-surface-400 mt-2">PDF only, max 10MB</p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowUploadModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={uploading} className="btn-primary flex items-center gap-2">
                  {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
