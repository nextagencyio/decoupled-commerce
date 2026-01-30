// Shopify Types
export interface ShopifyImage {
  url: string
  altText: string | null
  width: number
  height: number
}

export interface ShopifyPrice {
  amount: string
  currencyCode: string
}

export interface ShopifyProductVariant {
  id: string
  title: string
  availableForSale: boolean
  quantityAvailable: number
  price: ShopifyPrice
  compareAtPrice: ShopifyPrice | null
  selectedOptions: {
    name: string
    value: string
  }[]
  image: ShopifyImage | null
}

export interface ShopifyProduct {
  id: string
  handle: string
  title: string
  description: string
  descriptionHtml: string
  availableForSale: boolean
  featuredImage: ShopifyImage | null
  images: {
    edges: {
      node: ShopifyImage
    }[]
  }
  options: {
    id: string
    name: string
    values: string[]
  }[]
  variants: {
    edges: {
      node: ShopifyProductVariant
    }[]
  }
  priceRange: {
    minVariantPrice: ShopifyPrice
    maxVariantPrice: ShopifyPrice
  }
  tags: string[]
  vendor: string
}

export interface ShopifyCollection {
  id: string
  handle: string
  title: string
  description: string
  image: ShopifyImage | null
  products: {
    edges: {
      node: ShopifyProduct
    }[]
  }
}

export interface ShopifyCartLine {
  id: string
  quantity: number
  merchandise: {
    id: string
    title: string
    product: {
      title: string
      handle: string
      featuredImage: ShopifyImage | null
    }
    price: ShopifyPrice
    selectedOptions: {
      name: string
      value: string
    }[]
  }
}

export interface ShopifyCart {
  id: string
  checkoutUrl: string
  totalQuantity: number
  cost: {
    subtotalAmount: ShopifyPrice
    totalAmount: ShopifyPrice
    totalTaxAmount: ShopifyPrice | null
  }
  lines: {
    edges: {
      node: ShopifyCartLine
    }[]
  }
}

// Drupal Types (for blog/CMS content)
export interface DrupalImage {
  url: string
  width: number
  height: number
  alt: string
}

export interface DrupalAuthor {
  name: string
}

export interface DrupalTerm {
  id: string
  name: string
  path: string
}

export interface DrupalArticle {
  id: string
  title: string
  path: string
  created: string
  body: {
    processed: string
    summary?: string
  }
  featuredImage?: DrupalImage
  author?: DrupalAuthor
  category?: DrupalTerm[]
}

export interface DrupalPage {
  id: string
  title: string
  path: string
  body: {
    processed: string
  }
  heroImage?: DrupalImage
}

// Cart Context Types
export interface CartItem {
  variantId: string
  quantity: number
}

export interface CartState {
  cartId: string | null
  items: CartItem[]
  totalQuantity: number
  isOpen: boolean
}
