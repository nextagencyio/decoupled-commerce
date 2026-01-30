import Link from 'next/link'
import { Store, FileText, Terminal, ExternalLink } from 'lucide-react'

export default function SetupGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
            <Store className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Decoupled Commerce
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your hybrid commerce starter combining Drupal CMS with Shopify&apos;s powerful commerce engine.
            Let&apos;s get you set up!
          </p>
        </div>

        {/* Quick Setup */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Terminal className="h-6 w-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Quick Setup</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Run the interactive setup command to configure both Drupal and Shopify:
          </p>
          <div className="bg-gray-900 rounded-lg p-4 mb-6">
            <code className="text-green-400 text-sm font-mono">npm run setup</code>
          </div>
          <p className="text-sm text-gray-500">
            This will guide you through connecting your Drupal space (for blog content) and your Shopify store (for products).
          </p>
        </div>

        {/* What You'll Need */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What You&apos;ll Need</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Drupal */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Drupal (CMS Content)</h3>
              </div>
              <p className="text-gray-600 text-sm">
                For blog posts, pages, and other editorial content. The setup script will create a space for you automatically.
              </p>
              <a
                href="https://decoupled.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
              >
                Learn more about Decoupled.io
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>

            {/* Shopify */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Store className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Shopify (Commerce)</h3>
              </div>
              <p className="text-gray-600 text-sm">
                For products, collections, and checkout. You&apos;ll need a Shopify store with a Storefront API token.
              </p>
              <a
                href="https://help.shopify.com/en/manual/apps/app-types/custom-apps"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-green-600 hover:text-green-700"
              >
                How to create a Storefront API token
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
        </div>

        {/* Manual Setup */}
        <details className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <summary className="p-8 cursor-pointer hover:bg-gray-50 transition-colors">
            <span className="text-lg font-semibold text-gray-900">Manual Setup Instructions</span>
          </summary>
          <div className="px-8 pb-8 border-t">
            <div className="space-y-6 pt-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">1. Copy the environment file</h4>
                <div className="bg-gray-100 rounded-lg p-3">
                  <code className="text-sm">cp .env.example .env.local</code>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">2. Add your Shopify credentials</h4>
                <div className="bg-gray-100 rounded-lg p-3 space-y-1">
                  <code className="text-sm block">NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com</code>
                  <code className="text-sm block">SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-token</code>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">3. Add your Drupal credentials (optional)</h4>
                <div className="bg-gray-100 rounded-lg p-3 space-y-1">
                  <code className="text-sm block">NEXT_PUBLIC_DRUPAL_BASE_URL=https://xxx.decoupled.website</code>
                  <code className="text-sm block">DRUPAL_CLIENT_ID=your-client-id</code>
                  <code className="text-sm block">DRUPAL_CLIENT_SECRET=your-client-secret</code>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">4. Restart the development server</h4>
                <div className="bg-gray-100 rounded-lg p-3">
                  <code className="text-sm">npm run dev</code>
                </div>
              </div>
            </div>
          </div>
        </details>

        {/* Architecture Overview */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            This starter uses <strong>Drupal</strong> for content management and <strong>Shopify</strong> for commerce.
            <br />
            Checkout is handled by Shopify&apos;s secure, hosted checkout.
          </p>
        </div>
      </div>
    </div>
  )
}
