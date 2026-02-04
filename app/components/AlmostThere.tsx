import { CheckCircle2, Circle, Store, ExternalLink } from 'lucide-react'

export default function AlmostThere() {
  const needsDomain = !process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
  const needsToken = !process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Almost There!
          </h1>
          <p className="text-gray-600">
            Drupal is connected. Just add your Shopify credentials to enable commerce.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Status checklist */}
          <div className="p-5 border-b border-gray-200">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-gray-900">Drupal connected</span>
              </div>
              <div className="flex items-center gap-3">
                <Circle className="w-5 h-5 text-gray-400" />
                <span className="text-gray-500">Shopify credentials</span>
              </div>
            </div>
          </div>

          {/* Shopify instructions */}
          <div className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Store className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">
                  Connect Your Shopify Store
                </h4>
                <p className="text-sm text-gray-500 mb-3">
                  Create a custom app in your Shopify admin and enable the Storefront API.
                </p>
                <ol className="text-sm text-gray-600 space-y-2 mb-3">
                  <li className="flex items-start gap-2">
                    <span className="font-medium text-gray-900">1.</span>
                    <span>
                      Go to{' '}
                      <a
                        href="https://admin.shopify.com/store/YOUR-STORE/settings/apps/development"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
                      >
                        Shopify Admin → Settings → Apps → Develop apps
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium text-gray-900">2.</span>
                    <span>Create an app and configure Storefront API scopes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium text-gray-900">3.</span>
                    <span>Install the app and copy your Storefront access token</span>
                  </li>
                </ol>
                <a
                  href="https://help.shopify.com/en/manual/apps/app-types/custom-apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Full setup guide
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Environment variables hint */}
          <div className="p-5 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              Add these to your <code className="text-primary-600 bg-gray-200 px-1.5 py-0.5 rounded">.env.local</code> file:
            </p>
            <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm overflow-x-auto space-y-1">
              {needsDomain && (
                <div className="text-gray-100">
                  <span className="text-green-400">NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN</span>=your-store.myshopify.com
                </div>
              )}
              {needsToken && (
                <div className="text-gray-100">
                  <span className="text-green-400">NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN</span>=your-token
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Restart your dev server after adding the credentials.
        </p>
      </div>
    </div>
  )
}
