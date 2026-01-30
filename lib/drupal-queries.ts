import { gql } from '@apollo/client'

// Article (Blog Post) Queries
export const GET_ARTICLES = gql`
  query GetArticles($first: Int = 10) {
    nodeArticles(first: $first) {
      nodes {
        id
        title
        path
        created {
          timestamp
        }
        body {
          processed
          summary
        }
        featuredImage {
          url
          width
          height
          alt
        }
      }
    }
  }
`

export const GET_ARTICLE_BY_PATH = gql`
  query GetArticleByPath($path: String!) {
    route(path: $path) {
      ... on RouteInternal {
        entity {
          ... on NodeArticle {
            id
            title
            path
            created {
              timestamp
            }
            body {
              processed
            }
            featuredImage {
              url
              width
              height
              alt
            }
          }
        }
      }
    }
  }
`

export const GET_ALL_ARTICLE_PATHS = gql`
  query GetAllArticlePaths {
    nodeArticles(first: 100) {
      nodes {
        path
      }
    }
  }
`

// Page Queries
export const GET_PAGE_BY_PATH = gql`
  query GetPageByPath($path: String!) {
    route(path: $path) {
      ... on RouteInternal {
        entity {
          ... on NodePage {
            id
            title
            path
            body {
              processed
            }
            heroImage {
              url
              width
              height
              alt
            }
          }
        }
      }
    }
  }
`

export const GET_ALL_PAGE_PATHS = gql`
  query GetAllPagePaths {
    nodePages(first: 100) {
      nodes {
        path
      }
    }
  }
`
