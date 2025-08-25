# Styling Guidelines

This document outlines the styling architecture and guidelines for the ouafouaf project.

## Overview

The project uses a unified styling approach with:
- **SCSS** for preprocessing and design tokens
- **CSS Modules** for scoped component styling
- **No global CSS** to prevent style conflicts
- **Design tokens** for consistent theming

## Architecture

### File Structure

```
apps/web/src/styles/
├── variables.scss          # Design tokens and mixins
└── globals.scss           # Global resets and base styles

apps/web/src/components/
└── ui/
    ├── button.tsx
    └── button.module.scss  # Component-specific styles

packages/ui/src/
└── components/
    └── Button/
        ├── Button.tsx
        └── Button.module.scss
```

### Design Tokens

All design tokens are centralized in `apps/web/src/styles/variables.scss`:

- **Colors**: Semantic color palette with neutral and primary scales
- **Spacing**: Consistent spacing scale (0.25rem increments)
- **Typography**: Font sizes, weights, and line heights
- **Shadows**: Elevation system for depth
- **Border Radius**: Consistent corner radius values

### CSS Modules Configuration

CSS modules are configured in Vite with:
- **Naming**: `camelCaseOnly` convention for JavaScript imports
- **Scoped Names**: `[name]__[local]___[hash:base64:5]` format
- **Auto-import**: SCSS variables available in all modules

## Naming Conventions

### SCSS Variables

```scss
// Colors: $color-{semantic}-{scale}
$color-primary-500: #0ea5e9;
$color-neutral-100: #f5f5f5;

// Spacing: $spacing-{scale}
$spacing-4: 1rem;    // 16px
$spacing-8: 2rem;    // 32px

// Typography: $font-{property}-{variant}
$font-size-lg: 1.125rem;
$font-weight-semibold: 600;
```

### CSS Module Classes

```scss
// Component base class
.btn { }

// Variants with PascalCase suffixes
.btnPrimary { }
.btnSecondary { }

// Sizes with PascalCase suffixes
.btnSm { }
.btnLg { }

// States
.disabled { }
.loading { }
```

### JavaScript Imports

```typescript
// Use camelCase for CSS module imports
import styles from './button.module.scss';

// Class composition
const classes = [
  styles.btn,
  styles.btnPrimary,
  styles.btnLg,
  className
].filter(Boolean).join(' ');
```

## Component Patterns

### Basic Component Structure

```typescript
import styles from './Component.module.scss';

interface ComponentProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Component({ 
  variant = 'primary', 
  size = 'md', 
  className,
  ...props 
}: ComponentProps) {
  const classes = [
    styles.component,
    styles[`component${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    styles[`component${size.charAt(0).toUpperCase() + size.slice(1)}`],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {/* component content */}
    </div>
  );
}
```

### SCSS Module Structure

```scss
// Base component styles
.component {
  // Use design tokens
  padding: $spacing-3;
  border-radius: $radius-md;
  font-size: $font-size-base;
  
  // Use mixins for common patterns
  @include transition-base;
}

// Variants
.componentPrimary {
  background-color: $color-primary-600;
  color: $color-neutral-0;
  
  &:hover:not(:disabled) {
    background-color: $color-primary-700;
  }
}

.componentSecondary {
  background-color: $color-neutral-100;
  color: $color-neutral-900;
}

// Sizes
.componentSm {
  padding: $spacing-2 $spacing-3;
  font-size: $font-size-sm;
}

.componentLg {
  padding: $spacing-4 $spacing-6;
  font-size: $font-size-lg;
}

// States
.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

## Best Practices

### Do's

- ✅ Use design tokens for all spacing, colors, and typography
- ✅ Leverage SCSS mixins for repeated patterns
- ✅ Keep component styles scoped with CSS modules
- ✅ Use semantic class names that describe purpose, not appearance
- ✅ Compose classes in JavaScript for dynamic styling
- ✅ Follow the established naming conventions consistently

### Don'ts

- ❌ Don't use global CSS classes (except in globals.scss)
- ❌ Don't hardcode spacing, colors, or typography values
- ❌ Don't use inline styles for anything beyond dynamic values
- ❌ Don't create deeply nested SCSS selectors (max 3 levels)
- ❌ Don't use `!important` declarations
- ❌ Don't duplicate common styling patterns (create mixins instead)

## Migration Guidelines

When creating new components or updating existing ones:

1. **Start with design tokens** - Use variables for all styling values
2. **Create CSS module** - Name it `Component.module.scss`
3. **Follow naming patterns** - Use established conventions for classes
4. **Leverage mixins** - Reuse common patterns like buttons, form fields
5. **Test responsiveness** - Ensure mobile-first responsive design
6. **Verify scoping** - Check that styles don't leak to other components

## Maintenance

### Adding New Design Tokens

1. Add to `variables.scss` following naming conventions
2. Update this documentation with examples
3. Consider if a mixin would be beneficial for the use case
4. Test across existing components to ensure consistency

### Updating Components

1. Always check for existing mixins before writing new styles
2. Ensure backward compatibility with existing class names
3. Update TypeScript interfaces if adding new variants
4. Test in Storybook if available

## Tools and Configuration

- **Vite**: SCSS preprocessing and CSS modules
- **CSS Modules**: Scoped styling with camelCase imports
- **SCSS**: Variables, mixins, and nesting
- **ESLint**: Consistent code formatting
- **Storybook**: Component development and testing

## Related Documentation

- [Design Tokens Reference](./design-tokens.md)
- [CSS Modules Guide](./css-modules-guide.md)
- [Component Patterns](./component-patterns.md)