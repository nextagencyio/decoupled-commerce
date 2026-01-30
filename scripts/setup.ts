import { spawn, ChildProcess } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
}

// Helper functions
function log(message: string) {
  console.log(message)
}

function success(message: string) {
  console.log(`${colors.green}✓${colors.reset} ${message}`)
}

function warn(message: string) {
  console.log(`${colors.yellow}!${colors.reset} ${message}`)
}

function error(message: string) {
  console.log(`${colors.red}✗${colors.reset} ${message}`)
}

function info(message: string) {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`)
}

function heading(message: string) {
  console.log(`\n${colors.bold}${colors.magenta}${message}${colors.reset}\n`)
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}?${colors.reset} ${prompt}`, (answer) => {
      resolve(answer.trim())
    })
  })
}

function runCommand(
  command: string,
  args: string[],
  options: { silent?: boolean } = {}
): Promise<{ code: number; output: string }> {
  return new Promise((resolve) => {
    let output = ''
    const fullCommand = [command, ...args].join(' ')
    const child: ChildProcess = spawn(fullCommand, [], {
      stdio: options.silent ? 'pipe' : 'inherit',
      shell: true,
    })

    if (options.silent && child.stdout) {
      child.stdout.on('data', (data: Buffer) => {
        output += data.toString()
      })
    }
    if (options.silent && child.stderr) {
      child.stderr.on('data', (data: Buffer) => {
        output += data.toString()
      })
    }

    child.on('close', (code: number | null) => {
      resolve({ code: code ?? 1, output })
    })
  })
}

async function waitForSpace(spaceId: number, maxWaitSeconds = 200): Promise<boolean> {
  const startTime = Date.now()
  const spinnerChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
  let spinnerIdx = 0

  process.stdout.write('\n')

  while ((Date.now() - startTime) / 1000 < maxWaitSeconds) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000)
    const spinner = spinnerChars[spinnerIdx % spinnerChars.length]
    process.stdout.write(`\r${colors.cyan}${spinner}${colors.reset} Waiting for space to be ready... (${elapsed}s / ${maxWaitSeconds}s)`)
    spinnerIdx++

    // Silent status check
    const result = await runCommand(
      'npx',
      ['decoupled-cli@latest', 'spaces', 'status', spaceId.toString()],
      { silent: true }
    )

    // Check for "Ready: Yes" in the output
    if (result.output.includes('Ready: Yes')) {
      process.stdout.write(`\r${colors.green}✓${colors.reset} Space is ready!                                    \n`)
      return true
    }

    await new Promise((resolve) => setTimeout(resolve, 5000))
  }

  process.stdout.write(`\r${colors.red}✗${colors.reset} Timeout waiting for space (${maxWaitSeconds}s)              \n`)
  return false
}

async function checkCLI(): Promise<boolean> {
  info('Checking for decoupled-cli...')
  const result = await runCommand('npx', ['decoupled-cli@latest', '--version'], { silent: true })
  if (result.code === 0) {
    success(`decoupled-cli found: ${result.output.trim()}`)
    return true
  }
  return false
}

async function checkAuth(): Promise<boolean> {
  info('Checking authentication status...')
  const result = await runCommand('npx', ['decoupled-cli@latest', 'auth', 'status', '2>&1'], { silent: true })
  // CLI outputs "not authenticated" when logged out, otherwise shows user info
  return result.code === 0 && !result.output.includes('not authenticated')
}

async function login(): Promise<boolean> {
  heading('Login to Decoupled.io')
  log('You need to authenticate with Decoupled.io first.')
  log('')
  const shouldAuth = await question('Open browser to authenticate? [Y/n] ')

  if (shouldAuth.toLowerCase() === 'n') {
    error('Authentication required to continue.')
    return false
  }

  info('Opening browser for authentication...')
  const result = await runCommand('npx', ['decoupled-cli@latest', 'auth', 'login'])

  if (result.code !== 0) {
    return false
  }

  // Verify auth worked
  const verified = await checkAuth()
  return verified
}

async function selectOrCreateSpace(): Promise<number | null> {
  heading('Drupal Space Setup')

  const listResult = await runCommand('npx', ['decoupled-cli@latest', 'spaces', 'list', '--json'], { silent: true })

  let spaces: Array<{ id: number; name: string; status: string }> = []
  try {
    const parsed = JSON.parse(listResult.output)
    spaces = parsed.spaces || []
  } catch {
    spaces = []
  }

  if (spaces.length > 0) {
    log('Existing spaces:')
    spaces.forEach((space, i) => {
      log(`  ${i + 1}. ${space.name} (ID: ${space.id}, Status: ${space.status})`)
    })
    log(`  ${spaces.length + 1}. Create a new space`)
    log('')

    const choice = await question(`Select a space [1-${spaces.length + 1}]: `)
    const choiceNum = parseInt(choice, 10)

    if (choiceNum > 0 && choiceNum <= spaces.length) {
      return spaces[choiceNum - 1].id
    }
  }

  // Create new space
  const defaultName = 'My Store'
  const spaceName = await question(`Enter a name for your new Drupal space (${defaultName}): `) || defaultName

  log('')
  info(`Creating space "${spaceName}"...`)
  const createResult = await runCommand(
    'npx',
    ['decoupled-cli@latest', 'spaces', 'create', `"${spaceName}"`, '--json'],
    { silent: true }
  )

  if (createResult.code !== 0) {
    error('Failed to create space')
    return null
  }

  let spaceId: number | null = null
  try {
    const parsed = JSON.parse(createResult.output)
    spaceId = parsed.space?.id || parsed.id
  } catch {
    const match = createResult.output.match(/ID[:\s]+(\d+)/i)
    if (match) {
      spaceId = parseInt(match[1], 10)
    }
  }

  if (!spaceId) {
    error('Could not determine space ID')
    return null
  }

  success(`Space created with ID: ${spaceId}`)

  // Wait for provisioning with spinner
  info('New spaces take ~90 seconds to provision...')
  const ready = await waitForSpace(spaceId)

  if (ready) {
    // Give OAuth client a few more seconds to be fully configured
    info('Waiting a few more seconds for OAuth setup...')
    await new Promise((resolve) => setTimeout(resolve, 10000))
  } else {
    warn('Space provisioning is taking longer than expected.')
    const shouldContinue = await question('Continue anyway? [y/N] ')
    if (shouldContinue.toLowerCase() !== 'y') {
      return null
    }
  }

  return spaceId
}

async function configureDrupal(spaceId: number): Promise<boolean> {
  heading('Configuring Drupal Environment')

  const envPath = path.join(process.cwd(), '.env.local')
  const envExists = fs.existsSync(envPath)

  if (envExists) {
    const overwrite = await question('.env.local already exists. Overwrite? [y/N] ')
    if (overwrite.toLowerCase() !== 'y') {
      info('Skipping environment configuration')
      return true
    }
  }

  info('Fetching OAuth credentials...')
  await runCommand(
    'npx',
    ['decoupled-cli@latest', 'spaces', 'env', spaceId.toString(), '--write', '.env.local']
  )
  success('Environment configured in .env.local')
  return true
}

async function checkDrupalContent(): Promise<boolean> {
  info('Checking for existing Drupal content...')

  // Read env file to get Drupal URL
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) {
    return false
  }

  const envContent = fs.readFileSync(envPath, 'utf-8')
  const baseUrlMatch = envContent.match(/NEXT_PUBLIC_DRUPAL_BASE_URL=(.+)/)
  const clientIdMatch = envContent.match(/DRUPAL_CLIENT_ID=(.+)/)
  const clientSecretMatch = envContent.match(/DRUPAL_CLIENT_SECRET=(.+)/)

  if (!baseUrlMatch || !clientIdMatch || !clientSecretMatch) {
    return false
  }

  const baseUrl = baseUrlMatch[1].trim()
  const clientId = clientIdMatch[1].trim()
  const clientSecret = clientSecretMatch[1].trim()

  try {
    // Get OAuth token
    const tokenResponse = await fetch(`${baseUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    })

    if (!tokenResponse.ok) return false
    const tokenData = await tokenResponse.json()

    // Check for articles
    const graphqlResponse = await fetch(`${baseUrl}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
      body: JSON.stringify({
        query: '{ nodeArticles(first: 1) { nodes { id } } }',
      }),
    })

    if (!graphqlResponse.ok) return false
    const data = await graphqlResponse.json()

    return data.data?.nodeArticles?.nodes?.length > 0
  } catch {
    return false
  }
}

async function importDrupalContent(spaceId: number): Promise<void> {
  heading('Import Drupal Content')

  info('Importing sample blog content...')
  // Use --space flag to import via dashboard API (more reliable than OAuth)
  const result = await runCommand(
    'npx',
    ['decoupled-cli@latest', 'content', 'import', '--space', spaceId.toString(), '--file', 'data/commerce-content.json']
  )
  if (result.code === 0) {
    success('Sample content imported successfully!')
  } else {
    warn('Content import had some issues. You can try again with:')
    log(`  npx decoupled-cli@latest content import --space ${spaceId} --file data/commerce-content.json`)
  }
}

function cleanShopifyDomain(input: string): string {
  let domain = input.trim()

  // Remove protocol (https:// or http://)
  domain = domain.replace(/^https?:\/\//i, '')

  // Remove trailing slashes and paths
  domain = domain.split('/')[0]

  // Remove any query parameters
  domain = domain.split('?')[0]

  return domain
}

async function configureShopify(): Promise<{ storeDomain: string; storefrontToken: string; adminToken?: string } | null> {
  heading('Shopify Configuration')

  log('To connect your Shopify store, you need:')
  log('  1. Your store domain (e.g., my-store.myshopify.com)')
  log('  2. A Storefront API access token')
  log('  3. (Optional) Admin API token for seeding products')
  log('')
  log(`${colors.dim}To create API tokens:${colors.reset}`)
  log(`${colors.dim}  1. Go to Shopify Admin > Settings > Apps > Develop apps${colors.reset}`)
  log(`${colors.dim}  2. Create an app and configure Storefront API scopes${colors.reset}`)
  log(`${colors.dim}  3. Install the app and copy the Storefront API access token${colors.reset}`)
  log('')

  const rawStoreDomain = await question('Shopify store domain (e.g., my-store.myshopify.com): ')
  if (!rawStoreDomain) {
    warn('Skipping Shopify configuration. You can add it later to .env.local')
    return null
  }

  // Clean up the domain (handle full URLs, trailing slashes, etc.)
  const storeDomain = cleanShopifyDomain(rawStoreDomain)
  if (storeDomain !== rawStoreDomain.trim()) {
    info(`Using cleaned domain: ${storeDomain}`)
  }

  const storefrontToken = await question('Storefront API access token: ')
  if (!storefrontToken) {
    warn('Skipping Shopify configuration. You can add it later to .env.local')
    return null
  }

  // Test connection
  info('Testing Shopify connection...')
  try {
    const response = await fetch(`https://${storeDomain}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontToken,
      },
      body: JSON.stringify({
        query: `{ shop { name } }`,
      }),
    })

    const data = await response.json()
    if (data.data?.shop?.name) {
      success(`Connected to Shopify store: ${data.data.shop.name}`)
    } else {
      error('Could not verify Shopify connection. Please check your credentials.')
      return null
    }
  } catch (err) {
    error('Could not verify Shopify connection. Please check your credentials.')
    return null
  }

  // Ask for Admin API token (optional)
  log('')
  const adminToken = await question('Admin API access token (optional, for seeding products - press Enter to skip): ')

  // Append to .env.local
  const envPath = path.join(process.cwd(), '.env.local')
  let envContent = ''

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8')
  }

  // Add Shopify vars
  envContent += `\n# Shopify Storefront API\n`
  envContent += `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=${storeDomain}\n`
  envContent += `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=${storefrontToken}\n`

  if (adminToken) {
    envContent += `\n# Shopify Admin API (for seeding products)\n`
    envContent += `SHOPIFY_ADMIN_ACCESS_TOKEN=${adminToken}\n`
  }

  fs.writeFileSync(envPath, envContent)
  success('Shopify credentials added to .env.local')

  return { storeDomain, storefrontToken, adminToken: adminToken || undefined }
}

async function checkShopifyProducts(storeDomain: string, storefrontToken: string): Promise<boolean> {
  info('Checking for existing Shopify products...')

  try {
    const response = await fetch(`https://${storeDomain}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontToken,
      },
      body: JSON.stringify({
        query: '{ products(first: 1) { edges { node { id } } } }',
      }),
    })

    const data = await response.json()
    return data.data?.products?.edges?.length > 0
  } catch {
    return false
  }
}

async function seedShopifyProducts(storeDomain: string, adminToken: string): Promise<void> {
  heading('Seed Shopify Products')

  // First get publications to find the Storefront API channel
  info('Finding Storefront API sales channel...')

  let publicationId: string | null = null

  try {
    const pubResponse = await fetch(`https://${storeDomain}/admin/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminToken,
      },
      body: JSON.stringify({
        query: '{ publications(first: 10) { edges { node { id name } } } }',
      }),
    })

    const pubData = await pubResponse.json()
    const publications = pubData.data?.publications?.edges || []
    const storefrontPub = publications.find((p: any) =>
      p.node.name.toLowerCase().includes('storefront') ||
      p.node.name.toLowerCase().includes('headless')
    )

    if (storefrontPub) {
      publicationId = storefrontPub.node.id
      success(`Found sales channel: ${storefrontPub.node.name}`)
    } else {
      warn('Could not find Storefront API sales channel. Products may not be visible.')
    }
  } catch (err) {
    warn('Could not fetch publications. Make sure Admin API has read_publications scope.')
  }

  // Sample products
  const products = [
    {
      title: 'Classic Cotton T-Shirt',
      body_html: '<p>A comfortable everyday essential made from 100% organic cotton.</p>',
      vendor: 'Decoupled Apparel',
      product_type: 'Clothing',
      tags: ['cotton', 'basics', 't-shirt'],
      variants: [
        { option1: 'Small', price: '29.99', sku: 'TSHIRT-S' },
        { option1: 'Medium', price: '29.99', sku: 'TSHIRT-M' },
        { option1: 'Large', price: '29.99', sku: 'TSHIRT-L' },
      ],
      options: [{ name: 'Size' }],
      images: [{ src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800' }],
    },
    {
      title: 'Leather Backpack',
      body_html: '<p>Premium full-grain leather backpack with laptop compartment.</p>',
      vendor: 'Decoupled Goods',
      product_type: 'Bags',
      tags: ['leather', 'backpack', 'travel'],
      variants: [
        { option1: 'Black', price: '149.99', sku: 'BAG-BLK' },
        { option1: 'Brown', price: '149.99', sku: 'BAG-BRN' },
      ],
      options: [{ name: 'Color' }],
      images: [{ src: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800' }],
    },
    {
      title: 'Wireless Headphones',
      body_html: '<p>Premium noise-canceling wireless headphones with 30-hour battery life.</p>',
      vendor: 'Decoupled Audio',
      product_type: 'Electronics',
      tags: ['audio', 'wireless', 'headphones'],
      variants: [{ option1: 'Default', price: '199.99', sku: 'HEAD-001' }],
      images: [{ src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800' }],
    },
    {
      title: 'Ceramic Coffee Mug',
      body_html: '<p>Handcrafted ceramic mug. Microwave and dishwasher safe.</p>',
      vendor: 'Decoupled Home',
      product_type: 'Home',
      tags: ['ceramic', 'mug', 'kitchen'],
      variants: [
        { option1: 'White', price: '24.99', sku: 'MUG-WHT' },
        { option1: 'Black', price: '24.99', sku: 'MUG-BLK' },
      ],
      options: [{ name: 'Color' }],
      images: [{ src: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800' }],
    },
    {
      title: 'Running Sneakers',
      body_html: '<p>Lightweight running shoes with responsive cushioning.</p>',
      vendor: 'Decoupled Active',
      product_type: 'Footwear',
      tags: ['shoes', 'running', 'athletic'],
      variants: [
        { option1: '8', price: '129.99', sku: 'SHOE-8' },
        { option1: '9', price: '129.99', sku: 'SHOE-9' },
        { option1: '10', price: '129.99', sku: 'SHOE-10' },
        { option1: '11', price: '129.99', sku: 'SHOE-11' },
      ],
      options: [{ name: 'Size' }],
      images: [{ src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800' }],
    },
    {
      title: 'Minimalist Watch',
      body_html: '<p>Classic minimalist design with Japanese quartz movement.</p>',
      vendor: 'Decoupled Time',
      product_type: 'Accessories',
      tags: ['watch', 'accessories', 'minimalist'],
      variants: [
        { option1: 'Silver', price: '179.99', sku: 'WATCH-SLV' },
        { option1: 'Gold', price: '199.99', sku: 'WATCH-GLD' },
      ],
      options: [{ name: 'Color' }],
      images: [{ src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800' }],
    },
  ]

  info(`Creating ${products.length} sample products...`)

  const createdIds: string[] = []

  for (const product of products) {
    try {
      const response = await fetch(`https://${storeDomain}/admin/api/2024-01/products.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': adminToken,
        },
        body: JSON.stringify({ product }),
      })

      const data = await response.json()
      if (data.product?.id) {
        createdIds.push(data.product.id.toString())
        process.stdout.write(`${colors.green}✓${colors.reset} `)
      } else {
        process.stdout.write(`${colors.red}✗${colors.reset} `)
      }
    } catch {
      process.stdout.write(`${colors.red}✗${colors.reset} `)
    }
  }
  console.log('')

  success(`Created ${createdIds.length} products`)

  // Publish products to Storefront API channel
  if (publicationId && createdIds.length > 0) {
    info('Publishing products to Storefront API channel...')

    let published = 0
    for (const productId of createdIds) {
      try {
        const response = await fetch(`https://${storeDomain}/admin/api/2024-01/graphql.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': adminToken,
          },
          body: JSON.stringify({
            query: `mutation { productPublish(input: {id: "gid://shopify/Product/${productId}", productPublications: [{publicationId: "${publicationId}"}]}) { product { id } userErrors { message } } }`,
          }),
        })

        const data = await response.json()
        if (data.data?.productPublish?.product) {
          published++
        }
      } catch {
        // Ignore errors
      }
    }

    success(`Published ${published} products to Storefront API`)
  }
}

function printSuccessBox() {
  const lines = [
    '',
    '  Setup Complete!                                    ',
    '',
    '  Next steps:                                        ',
    '    1. npm run dev        Start development server   ',
    '    2. Open http://localhost:3000                    ',
    '',
    '  Your hybrid commerce store is ready!               ',
    '    - Products & checkout powered by Shopify         ',
    '    - Blog & content powered by Drupal               ',
    '',
  ]

  console.log('')
  console.log(`${colors.green}╔${'═'.repeat(54)}╗${colors.reset}`)
  lines.forEach((line) => {
    const paddedLine = line.padEnd(54, ' ')
    console.log(`${colors.green}║${colors.reset}${paddedLine}${colors.green}║${colors.reset}`)
  })
  console.log(`${colors.green}╚${'═'.repeat(54)}╝${colors.reset}`)
  console.log('')
}

async function runShopifySetup() {
  const shopifyConfig = await configureShopify()

  if (shopifyConfig) {
    // Check if products exist
    const hasProducts = await checkShopifyProducts(shopifyConfig.storeDomain, shopifyConfig.storefrontToken)

    if (hasProducts) {
      success('Shopify store already has products - skipping seed')
    } else if (shopifyConfig.adminToken) {
      // Seed products
      await seedShopifyProducts(shopifyConfig.storeDomain, shopifyConfig.adminToken)
    } else {
      warn('No products in store and no Admin API token provided.')
      log('  To seed products, run setup again with an Admin API token,')
      log('  or add products manually in Shopify Admin.')
    }
  }

  return shopifyConfig
}

async function main() {
  const args = process.argv.slice(2)
  const shopifyOnly = args.includes('--shopify-only') || args.includes('--shopify')

  if (shopifyOnly) {
    // Shopify-only setup
    console.log('')
    console.log(`${colors.bold}${colors.magenta}╔════════════════════════════════════════════════════════╗${colors.reset}`)
    console.log(`${colors.bold}${colors.magenta}║       Decoupled Commerce - Shopify Setup               ║${colors.reset}`)
    console.log(`${colors.bold}${colors.magenta}╚════════════════════════════════════════════════════════╝${colors.reset}`)
    console.log('')

    try {
      await runShopifySetup()
      printSuccessBox()
    } catch (err) {
      error(`Shopify setup failed: ${err}`)
      process.exit(1)
    } finally {
      rl.close()
    }
    return
  }

  // Full setup
  console.log('')
  console.log(`${colors.bold}${colors.magenta}╔════════════════════════════════════════════════════════╗${colors.reset}`)
  console.log(`${colors.bold}${colors.magenta}║       Decoupled Commerce - Setup Wizard                ║${colors.reset}`)
  console.log(`${colors.bold}${colors.magenta}║       Drupal CMS + Shopify Commerce                    ║${colors.reset}`)
  console.log(`${colors.bold}${colors.magenta}╚════════════════════════════════════════════════════════╝${colors.reset}`)
  console.log('')

  try {
    // ========================================
    // DRUPAL SETUP
    // ========================================

    // Check CLI
    const hasCLI = await checkCLI()
    if (!hasCLI) {
      error('decoupled-cli not found. Installing...')
      await runCommand('npm', ['install', '-g', 'decoupled-cli@latest'])
    }

    // Check auth
    const isAuthenticated = await checkAuth()
    if (!isAuthenticated) {
      const loggedIn = await login()
      if (!loggedIn) {
        error('Authentication failed. Please try again.')
        process.exit(1)
      }
    } else {
      success('Already authenticated with Decoupled.io')
    }

    // Drupal space setup
    const spaceId = await selectOrCreateSpace()
    if (spaceId) {
      await configureDrupal(spaceId)
      await importDrupalContent(spaceId)
    } else {
      warn('Skipping Drupal configuration')
    }

    // ========================================
    // SHOPIFY SETUP
    // ========================================

    await runShopifySetup()

    printSuccessBox()
  } catch (err) {
    error(`Setup failed: ${err}`)
    process.exit(1)
  } finally {
    rl.close()
  }
}

main()
