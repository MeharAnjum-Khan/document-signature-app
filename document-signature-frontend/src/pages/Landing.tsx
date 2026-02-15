import { Link } from 'react-router-dom';
import {
  FileSignature,
  Shield,
  Send,
  ClipboardCheck,
  ArrowRight,
  Upload,
  PenTool,
  FileCheck,
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="border-b border-surface-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                <FileSignature className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-surface-900">DocSign</span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login" className="btn-secondary text-sm py-2 px-4">
                Log in
              </Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Secure Digital Signatures
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-surface-900 leading-tight mb-6">
              Sign Documents{' '}
              <span className="text-primary-600">Digitally</span>,{' '}
              <br className="hidden sm:inline" />
              Anytime, Anywhere
            </h1>
            <p className="text-lg md:text-xl text-surface-500 mb-10 leading-relaxed max-w-2xl mx-auto">
              Upload PDFs, place signature fields, share signing links, and generate
              legally traceable signed documents — all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-base py-3 px-8 flex items-center justify-center gap-2">
                Start Signing Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn-secondary text-base py-3 px-8">
                Log in to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-surface-900 mb-4">
              How It Works
            </h2>
            <p className="text-surface-500 text-lg max-w-2xl mx-auto">
              Three simple steps to get your documents signed digitally.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Upload,
                title: 'Upload Document',
                desc: 'Upload your PDF document securely to the platform.',
                step: '01',
              },
              {
                icon: PenTool,
                title: 'Place Signatures',
                desc: 'Drag and drop signature fields exactly where you need them.',
                step: '02',
              },
              {
                icon: FileCheck,
                title: 'Get It Signed',
                desc: 'Share a secure link and get the document signed digitally.',
                step: '03',
              },
            ].map((item) => (
              <div key={item.step} className="card text-center group hover:shadow-soft transition-all duration-300">
                <div className="text-xs font-bold text-primary-400 mb-4">{item.step}</div>
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:bg-primary-600 transition-colors duration-300">
                  <item.icon className="w-7 h-7 text-primary-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-semibold text-surface-900 mb-2">{item.title}</h3>
                <p className="text-surface-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-surface-900 mb-4">
              Built for Security & Simplicity
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Secure Auth', desc: 'JWT-based authentication with encrypted passwords' },
              { icon: Send, title: 'Email Sharing', desc: 'Send signing requests directly via email' },
              { icon: ClipboardCheck, title: 'Audit Trail', desc: 'Track who signed, when, and from where' },
              { icon: FileSignature, title: 'PDF Processing', desc: 'Embed signatures directly into PDF documents' },
            ].map((f) => (
              <div key={f.title} className="p-5 rounded-xl border border-surface-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-300">
                <f.icon className="w-6 h-6 text-primary-600 mb-3" />
                <h4 className="font-semibold text-surface-900 mb-1">{f.title}</h4>
                <p className="text-sm text-surface-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Go Paperless?
          </h2>
          <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">
            Join thousands who trust DocSign for fast, secure, and legally traceable document signing.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold py-3 px-8 rounded-lg hover:bg-primary-50 transition-colors">
            Create Free Account
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-900 text-surface-400 py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-600 rounded-md flex items-center justify-center">
              <FileSignature className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold">DocSign</span>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} DocSign. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
