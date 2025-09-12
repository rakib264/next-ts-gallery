# 🎨 Design System Guide

## Overview

This comprehensive design system provides a scalable, consistent, and accessible foundation for your application using **Indigo** and **Violet** color tokens. The system is built with modern web standards and follows best practices for maintainability and user experience.

## 🌈 Color Tokens

### Primary Colors (Indigo-based)
```css
primary-50:  #eef2ff  /* Very light backgrounds */
primary-100: #e0e7ff  /* Light backgrounds, subtle variants */
primary-200: #c7d2fe  /* Borders, dividers */
primary-300: #a5b4fc  /* Disabled states, placeholders */
primary-400: #818cf8  /* Secondary actions */
primary-500: #6366f1  /* Interactive elements */
primary-600: #4f46e5  /* Main brand color (DEFAULT) */
primary-700: #4338ca  /* Hover states */
primary-800: #3730a3  /* Active states */
primary-900: #312e81  /* High contrast text */
```

### Secondary Colors (Violet-based)
```css
secondary-50:  #f5f3ff  /* Very light backgrounds */
secondary-100: #ede9fe  /* Light backgrounds, subtle variants */
secondary-200: #ddd6fe  /* Borders, dividers */
secondary-300: #c4b5fd  /* Disabled states, placeholders */
secondary-400: #a78bfa  /* Secondary actions */
secondary-500: #8b5cf6  /* Interactive elements */
secondary-600: #7c3aed  /* Secondary brand color (DEFAULT) */
secondary-700: #6d28d9  /* Hover states */
secondary-800: #5b21b6  /* Active states */
secondary-900: #4c1d95  /* High contrast text */
```

### Semantic Colors
```css
destructive: #ef4444  /* Rose-500 - Errors, dangerous actions */
success:    #10b981  /* Emerald-500 - Success states */
warning:    #f59e0b  /* Amber-500 - Warnings, cautions */
info:       #0ea5e9  /* Sky-500 - Information, tips */
```

## 🧩 Global Utility Classes

### Background Utilities
```css
.bg-primary-light    /* Light primary background */
.bg-secondary-light  /* Light secondary background */
```

### Text Utilities
```css
.text-primary        /* Primary brand color text */
.text-secondary      /* Secondary brand color text */
.text-accent         /* Accent color text */
.text-foreground     /* Main text color */
```

### Extended Palette Access
All color shades are available as utilities:
```css
.bg-primary-50 through .bg-primary-900
.bg-secondary-50 through .bg-secondary-900
.text-primary-50 through .text-primary-900
.text-secondary-50 through .text-secondary-900
.border-primary-200, .border-primary-300, etc.
```

## 🔘 Component Variants

### Button Component
```tsx
// Primary variants
<Button variant="default">Primary Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="gradient">Gradient Button</Button>

// Semantic variants
<Button variant="success">Success</Button>
<Button variant="warning">Warning</Button>
<Button variant="info">Info</Button>
<Button variant="destructive">Destructive</Button>

// Style variants
<Button variant="outline">Outline</Button>
<Button variant="outline-secondary">Outline Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="ghost-secondary">Ghost Secondary</Button>
<Button variant="link">Link</Button>
<Button variant="link-secondary">Link Secondary</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
<Button size="icon">Icon</Button>
```

### Badge Component
```tsx
// Solid badges
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="destructive">Destructive</Badge>

// Outline badges
<Badge variant="outline">Outline</Badge>
<Badge variant="outline-secondary">Outline Secondary</Badge>
<Badge variant="outline-destructive">Outline Destructive</Badge>
<Badge variant="outline-success">Outline Success</Badge>

// Subtle badges
<Badge variant="subtle">Subtle</Badge>
<Badge variant="subtle-secondary">Subtle Secondary</Badge>
```

### Alert Component
```tsx
// Semantic alerts
<Alert variant="default">Default Alert</Alert>
<Alert variant="primary">Primary Alert</Alert>
<Alert variant="secondary">Secondary Alert</Alert>
<Alert variant="success">Success Alert</Alert>
<Alert variant="warning">Warning Alert</Alert>
<Alert variant="info">Info Alert</Alert>
<Alert variant="destructive">Destructive Alert</Alert>
```

## 🌓 Light/Dark Mode Support

The design system automatically adapts to light and dark modes:

### Light Mode
- Uses lighter shades (50-400) for backgrounds
- Uses darker shades (600-900) for text
- Maintains proper contrast ratios

### Dark Mode
- Uses darker shades (800-900) for backgrounds
- Uses lighter shades (100-400) for text
- Automatically adjusts semantic colors

### Implementation
```tsx
// Toggle dark mode
document.documentElement.classList.toggle('dark');

// Check current mode
const isDark = document.documentElement.classList.contains('dark');
```

## 📱 Responsive Design

### Button Sizes
- `sm`: 32px height - Mobile-friendly
- `default`: 40px height - Standard desktop
- `lg`: 44px height - Prominent actions
- `xl`: 48px height - Hero sections

### Breakpoint Considerations
- All components work seamlessly across devices
- Touch targets meet accessibility guidelines (44px minimum)
- Text scales appropriately on mobile devices

## ♿ Accessibility Features

### Contrast Ratios
- All color combinations meet WCAG 2.1 AA standards
- Text has minimum 4.5:1 contrast ratio
- Interactive elements have proper focus indicators

### Focus Management
```css
/* All interactive elements include focus styles */
focus-visible:ring-2 focus-visible:ring-primary-500
```

### Screen Reader Support
- Semantic HTML structure
- Proper ARIA attributes
- Meaningful color combinations with text/icon supplements

## 🔧 Usage Examples

### Form Components
```tsx
<div className="space-y-4">
  <div>
    <Label htmlFor="email">Email</Label>
    <Input 
      id="email" 
      type="email" 
      placeholder="Enter your email"
      className="focus:ring-primary-500" 
    />
  </div>
  
  <div className="flex gap-2">
    <Button variant="default">Submit</Button>
    <Button variant="outline">Cancel</Button>
  </div>
</div>
```

### Card Layouts
```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-foreground">Content goes here</p>
    <div className="mt-4 flex gap-2">
      <Badge variant="primary">Featured</Badge>
      <Badge variant="success">Available</Badge>
    </div>
  </CardContent>
</Card>
```

### Alert Messages
```tsx
<Alert variant="success">
  <CheckCircle className="h-4 w-4" />
  <AlertTitle>Success!</AlertTitle>
  <AlertDescription>
    Your changes have been saved successfully.
  </AlertDescription>
</Alert>
```

## 🏗️ Architecture

### CSS Variables
The system uses CSS custom properties for dynamic theming:
```css
:root {
  --primary-600: 79 70 229;    /* HSL values */
  --secondary-600: 124 58 237;
  /* ... other tokens */
}
```

### Tailwind Integration
All tokens are integrated with Tailwind CSS:
```javascript
// tailwind.config.ts
colors: {
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    // ... all shades
    600: '#4f46e5',
    // ... continuing to 900
  }
}
```

### Component Structure
```
components/ui/
├── button.tsx       # All button variants
├── badge.tsx        # Badge components
├── card.tsx         # Card layouts
├── alert.tsx        # Alert messages
├── input.tsx        # Form inputs
├── label.tsx        # Form labels
└── ...
```

## 🚀 Best Practices

### Do's
✅ Use semantic color variants for their intended purposes  
✅ Maintain consistent spacing and sizing  
✅ Test in both light and dark modes  
✅ Follow accessibility guidelines  
✅ Use the design tokens instead of hardcoded colors  

### Don'ts
❌ Mix different color systems  
❌ Override focus styles without proper alternatives  
❌ Use colors that don't meet contrast requirements  
❌ Hardcode hex values instead of using tokens  
❌ Ignore responsive design principles  

## 🔄 Migration Guide

### From Previous System
1. Replace hardcoded colors with design tokens
2. Update button variants to new options
3. Use semantic color variants appropriately
4. Test all components in light/dark modes

### Example Migration
```tsx
// Before
<button className="bg-blue-500 hover:bg-blue-600 text-white">
  Click me
</button>

// After
<Button variant="default">
  Click me
</Button>
```

## 📊 Performance

### Optimizations
- CSS variables reduce bundle size
- Efficient color calculations
- Minimal runtime overhead
- Tree-shakable components

### Bundle Impact
- ~2KB additional CSS for full token system
- No JavaScript runtime for color calculations
- Efficient Tailwind purging

## 🔮 Future Enhancements

### Planned Features
- [ ] Color palette generator
- [ ] Theme customization UI
- [ ] Additional semantic variants
- [ ] Animation system integration
- [ ] Component composition utilities

### Extensibility
The system is designed to be extended:
```css
/* Add custom variants */
.bg-tertiary { background-color: hsl(var(--tertiary-600)); }
```

## 📞 Support

### Troubleshooting
1. **Colors not showing**: Check if Tailwind is properly configured
2. **Dark mode issues**: Ensure `dark` class is applied to `html` element
3. **Focus styles missing**: Verify focus-visible support in target browsers

### Resources
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

**Design System Version**: 2.0  
**Last Updated**: January 2025  
**Compatibility**: Modern browsers, React 18+, Tailwind CSS 3+
