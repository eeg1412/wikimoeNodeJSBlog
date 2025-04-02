# WikimoeNodeJSBlog Project Development Guidelines

This document outlines the development standards and conventions for the WikimoeNodeJSBlog project across all three components: Server, Blog Frontend, and Admin Panel.

## Table of Contents

1. [Common Guidelines](#common-guidelines)

   - [Project Structure Philosophy](#project-structure-philosophy)
   - [Naming Conventions](#naming-conventions)
   - [Code Organization](#code-organization)
   - [Error Handling](#error-handling)
   - [Documentation](#documentation)
   - [Development Process](#development-process)
   - [Performance Considerations](#performance-considerations)

2. [Server-Specific Guidelines](#server-specific-guidelines)

   - [Project Structure](#server-project-structure)
   - [Database Operations](#database-operations)
   - [API Endpoints](#api-endpoints)
   - [Worker Threads](#worker-threads)
   - [Cache Management](#cache-management)
   - [Security Practices](#server-security-practices)

3. [Blog Frontend Guidelines](#blog-frontend-guidelines)

   - [Project Structure](#blog-project-structure)
   - [Component Organization](#blog-component-organization)
   - [State Management](#blog-state-management)
   - [API Integration](#blog-api-integration)
   - [Image Handling](#blog-image-handling)

4. [Admin Panel Guidelines](#admin-panel-guidelines)
   - [Project Structure](#admin-project-structure)
   - [Component Organization](#admin-component-organization)
   - [State Management](#admin-state-management)
   - [API Integration](#admin-api-integration)
   - [CRUD Implementation](#crud-implementation)
   - [Rich Editor Integration](#rich-editor-integration)

## Common Guidelines

### Project Structure Philosophy

- Organize code by domain and functionality
- Keep related files together
- Use consistent directory naming across the project
- Follow the principle of separation of concerns

### Naming Conventions

#### Files and Directories

- Use **lowercase** for directories: `api/`, `components/`, `utils/`
- Use **singular nouns** for modules representing entities: `user.js` not `users.js`
- Use **plural nouns** for collections or groups: `models/`, `utils/`

#### Variables and Functions

- Use **camelCase** for variables and functions: `userSettings`, `getPostList()`
- Use **PascalCase** for classes, components, and constructor functions: `UserModel`, `PostEditor`
- Use **UPPER_SNAKE_CASE** for constants: `MAX_FILE_SIZE`, `DEFAULT_PORT`
- Boolean variables should use prefixes like `is`, `has`, `should`: `isLoading`, `hasError`

### Code Organization

- Group related functionality together
- Follow the single responsibility principle
- Export functions and components with clear, descriptive names
- Use consistent patterns across similar files

### Error Handling

- Use try/catch blocks for asynchronous operations
- Provide meaningful error messages
- Log errors appropriately
- Return consistent error response formats
- Handle both expected and unexpected errors gracefully

```javascript
try {
  // Asynchronous operation
  const result = await someAsyncFunction()
} catch (error) {
  // Error handling
  logger.error(`Error in operation: ${error.message}`)
  return errorResponse(error)
} finally {
  // Cleanup if necessary
}
```

### Documentation

- Add comments for complex logic or business rules
- Use JSDoc style for function documentation:

```javascript
/**
 * Does something important with the provided data
 * @param {Object} data - The data to process
 * @param {Object} options - Processing options
 * @returns {Promise<Result>} The processed result
 */
function processData(data, options) {
  // Implementation
}
```

- Document component props and emits
- Maintain up-to-date README.md files with setup instructions

### Development Process

1. **Code Contribution**:

   - Create feature branches from `main`
   - Follow established code style guidelines
   - Write or update tests when necessary
   - Submit pull requests

2. **Code Review**:
   - All pull requests must be reviewed by at least one developer
   - CI checks must pass before merging
   - Review should check for:
     - Consistent naming
     - Proper error handling
     - Performance concerns
     - Security issues
     - Code quality and maintainability

### Performance Considerations

- Optimize expensive operations
- Implement caching for frequently accessed data
- Use pagination for large data sets
- Optimize asset sizes (images, scripts, styles)
- Minimize unnecessary re-renders in UI components
- Profile and benchmark where necessary

## Server-Specific Guidelines

### Server Project Structure

```
server/
├── api/               # API controllers organized by domain
│   ├── admin/         # Admin panel API endpoints
│   └── blog/          # Public blog API endpoints
├── bin/               # Server startup scripts
├── config/            # Configuration files
├── mongodb/           # Database related code
│   ├── index.js       # Database connection
│   ├── models/        # MongoDB schema definitions
│   └── utils/         # Database utility functions
├── routes/            # Express route definitions
├── utils/             # Utility functions
│   └── workers/       # Worker thread modules
└── [other directories]
```

### Database Operations

- Models should be named in **PascalCase** and singular: `PostModel`, `UserModel`
- Model utilities should be named in **camelCase** and plural: `postsUtils.js`, `usersUtils.js`
- Implement standard CRUD operations with consistent naming:

```javascript
exports.findPage = async function (
  params,
  sort,
  page,
  limit,
  projection,
  options = {}
) {
  const q = Model.find(params, projection)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)

  if (options.lean) {
    q.lean()
  }

  const list = await q
  const total = await Model.countDocuments(params)

  return { list, total }
}
```

### API Endpoints

- Each API endpoint should be defined in a separate file
- Each endpoint file should export a single function:

```javascript
module.exports = async function (req, res, next) {
  try {
    // Implementation
    res.json({ data: result })
  } catch (err) {
    next(err)
  }
}
```

### Worker Threads

- Use worker threads for CPU-intensive tasks
- Worker files should follow this pattern:

```javascript
const { parentPort } = require('worker_threads')

// Define action functions
const action = {
  actionName: async (param1, param2) => {
    // Implementation
    return result
  },
}

// Handle messages
parentPort.on('message', async (params) => {
  try {
    const result = await action[params.action](...params.data)
    parentPort.postMessage({ status: 'success', data: result })
  } catch (err) {
    parentPort.postMessage({ status: 'error', error: err })
  } finally {
    parentPort.close()
  }
})
```

### Cache Management

- Use `global.$cacheData` for application-level caching
- Implement cache refresh functions for each cached entity
- Use async locks for concurrent cache updates:

```javascript
utils.executeInLock('cacheKey', async () => {
  // Cache update operations
})
```

### Server Security Practices

- Sanitize user inputs
- Use JWT for authentication
- Verify MongoDB ObjectIds
- Implement proper authorization checks
- Rate limit API endpoints

## Blog Frontend Guidelines

### Blog Project Structure

```
blog/
├── api/                # API request modules
├── assets/             # Static assets
├── components/         # Vue components
├── layouts/            # Layout components
├── pages/              # Page components (auto-routed)
├── plugins/            # Nuxt plugins
├── store/              # Pinia stores
└── utils/              # Utility functions
```

### Blog Component Organization

- Use **PascalCase** for Vue component files: `WikimoeImage.vue`
- Component structure should follow this pattern:

```vue
<template>
  <!-- Properly structured and organized HTML -->
</template>

<script setup>
// Imports
// Props and emits
// Store
// Refs and reactivity
// Computed properties
// Methods
// Watchers
// Lifecycle hooks
</script>

<style scoped>
/* Component-specific styles */
</style>
```

### Blog State Management

- Use Pinia for state management
- Create separate stores for different domains
- Follow consistent pattern:

```typescript
export const useStore = defineStore('storeName', {
  state: () => ({
    // State properties
  }),

  actions: {
    // Actions
    async fetchData() {
      // Implementation
    },
  },
})
```

### Blog API Integration

- Use Nuxt's `$fetch` for API calls
- Place API calls in dedicated files in the `api/` directory
- Use consistent naming: `getEntityNameApi`, `postEntityNameApi`, etc.

```typescript
export const getPostListApi = (params) => {
  return $fetch('/api/blog/post/list', {
    method: 'GET',
    params,
  })
}
```

### Blog Image Handling

- Use dedicated image components for consistency
- Implement lazy loading for images
- Provide appropriate alt text for accessibility
- Handle responsive images correctly

## Admin Panel Guidelines

### Admin Project Structure

```
admin/
├── public/              # Static assets
├── src/
│   ├── api/             # API request modules
│   ├── assets/          # Project assets
│   ├── components/      # Vue components
│   ├── router/          # Vue Router configuration
│   ├── store/           # Vuex store modules
│   ├── utils/           # Utility functions
│   ├── views/           # Page components (routed)
│   ├── App.vue          # Root component
│   └── main.js          # Entry point
└── tools/               # Development tools
```

### Admin Component Organization

- Use **PascalCase** for Vue component files
- Component structure should follow this pattern:

```vue
<template>
  <!-- Organized HTML structure -->
</template>

<script>
export default {
  name: 'ComponentName',

  props: {
    // Props definitions
  },

  emits: ['update:modelValue', 'custom-event'],

  setup(props, { emit }) {
    // Component logic

    return {
      // Exposed properties and methods
    }
  },
}
</script>

<style scoped>
/* Component-specific styles */
</style>
```

### Admin State Management

- Use Vuex for state management
- Follow consistent pattern for mutations: `setState`
- Follow consistent pattern for actions: `fetchData`, `updateData`

### Admin API Integration

- Create API modules in `api/module/` directory
- Use consistent naming for API functions:
  - `getEntityList`
  - `getEntityDetail`
  - `createEntity`
  - `updateEntity`
  - `deleteEntity`

```javascript
export default function (api) {
  return {
    getEntityList(data, noLoading = false) {
      return api.get('/entity/list', {
        params: data,
        shouldAdminJWT: true,
        noLoading,
      })
    },

    // Other API functions
  }
}
```

### CRUD Implementation

- Use consistent table layouts with El-Table
- Implement pagination
- Include search/filter functionality
- Save filter state in sessionStorage
- Use consistent form layouts with El-Form

### Rich Editor Integration

- Use editor extensions in `utils/editorMenu/`
- Register custom elements, menus, and plugins systematically
- Follow modular architecture for custom editor elements

## CSS Naming Conventions

### Global Utility Classes

- Size: `w_05` (width 50%), `h_10` (height 100%)
- Margin/Padding: `mt10` (margin-top 10px), `pl20` (padding-left 20px)
- Text alignment: `tc` (text-center), `tr` (text-right)
- Text styles: `fb` (font-bold), `fs16` (font-size 16px)
- Display: `db` (display: block), `dib` (display: inline-block)
- Colors: `cWhite` (color: white), `bcGrayF2` (background-color: #f2f2f2)

### Component-Specific Classes

- Use BEM-like naming: `[component]-[element]-[modifier]`
- Examples: `blog-tweet-img-list-body`, `attachments-dialog-header`

## Responsive Design

- Use mobile-first approach
- Use standard breakpoints consistently:
  ```
  - Mobile: max-width: 767px
  - Tablet: 768px to 1023px
  - Desktop: min-width: 1024px
  ```
- Test on various device sizes

## Accessibility

- Use semantic HTML elements
- Provide alt text for images
- Ensure keyboard navigation works
- Maintain sufficient color contrast
- Test with screen readers

# Git Commit Conventions

To maintain a clear and organized commit history, all commits must follow these conventions:

## Commit Message Prefixes

Based on which part of the system is being modified, each commit message must start with an appropriate prefix:

- **【博客端】**: Blog frontend related changes
- **【API】**: Server API related changes
- **【管理端】**: Admin panel related changes
- **【文档】**: Documentation related changes
- **【配置】**: Configuration file related changes
- **【工具】**: Development tools related changes
- **【通用】**: Common changes affecting multiple systems
- **【部署】**: Deployment or CI/CD related changes
- **【数据库】**: Database structure or migration related changes
