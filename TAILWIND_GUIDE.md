# Tailwind CSS Integration Guide

Tailwind CSS is now integrated into your Angular monorepo! Here's how to get started and learn it.

## Installation

After pulling the latest changes, install the new dependencies:

```bash
npm install
```

This will install:
- **tailwindcss** - The CSS framework
- **postcss** - CSS transformer
- **autoprefixer** - Adds vendor prefixes automatically

## Configuration Files

- **tailwind.config.js** - Tailwind configuration (at root level)
- **postcss.config.js** - PostCSS configuration (at root level)

Both are already set up to scan all components in your apps and libraries.

## Serve Your Application

```bash
nx serve about-me
```

The page will reload with Tailwind CSS available!

## Learning Tailwind CSS

### Basic Concept
Instead of writing custom CSS, you add utility classes directly to your HTML:

```html
<!-- Without Tailwind -->
<div style="display: flex; justify-content: center; padding: 16px;">

<!-- With Tailwind -->
<div class="flex justify-center p-4">
```

### Common Utility Classes

**Spacing:**
- `p-4` = padding: 1rem (16px)
- `m-2` = margin: 0.5rem (8px)
- `px-6` = padding-left & right: 1.5rem
- `py-8` = padding-top & bottom: 2rem

**Flexbox:**
- `flex` = display: flex
- `justify-center` = justify-content: center
- `items-center` = align-items: center
- `gap-4` = gap: 1rem

**Colors:**
- `bg-blue-500` = background color (blue)
- `text-gray-700` = text color (gray)
- `border-red-400` = border color (red)
- `bg-primary` = uses your custom color (see tailwind.config.js)

**Typography:**
- `text-lg` = font-size: 1.125rem
- `font-bold` = font-weight: 700
- `text-center` = text-align: center

**Responsive Design:**
- `md:text-lg` = apply on medium+ screens
- `lg:p-8` = apply on large+ screens
- `sm:block md:hidden` = show on small, hide on medium+

**Hover & States:**
- `hover:bg-blue-600` = apply on hover
- `focus:outline-none` = apply on focus
- `active:scale-95` = apply when active

### Example: Converting Your About Me Page

Your current custom SCSS hero section:
```scss
.hero-section {
  background: linear-gradient(135deg, var(--primary) 0%, var(--dark) 100%);
  color: white;
  text-align: center;
  padding: 80px 24px;
}
```

With Tailwind (in HTML):
```html
<section class="bg-gradient-to-r from-primary to-dark text-white text-center py-20 px-6">
  ...
</section>
```

### Workflow for Learning

1. **Start with simple components** - Try converting the button styles first
2. **Use Tailwind UI** - Visit https://tailwindui.com for component examples
3. **Refer to docs** - https://tailwindcss.com/docs for all utilities
4. **Experiment in place** - Change class names and see live updates!

## Key Advantages of Tailwind

✅ **No CSS files to maintain** - All styling in HTML/templates
✅ **Consistent spacing & colors** - Uses design tokens
✅ **Smaller bundle** - Only includes CSS you actually use (with purging)
✅ **Responsive by default** - Easy breakpoint prefixes
✅ **Dark mode ready** - Built-in dark mode support
✅ **Highly customizable** - Extend colors, spacing in tailwind.config.js

## Custom Colors (Already Added)

In `tailwind.config.js`, your brand colors are available:
```html
<div class="bg-primary">Primary Blue (#1976d2)</div>
<div class="bg-dark">Dark Blue (#0d47a1)</div>
<div class="bg-accent">Orange Accent (#ff6f00)</div>
```

## Next Steps

1. **Gradually migrate** - You can use Tailwind alongside SCSS (no need to remove all custom CSS at once)
2. **Try the about-me page** - Consider converting some sections to Tailwind to learn
3. **Check the docs** - https://tailwindcss.com/docs has everything!

## Common Tailwind Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

Example responsive button:
```html
<button class="px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 text-sm md:text-base lg:text-lg">
  Responsive Button
</button>
```

## Troubleshooting

If Tailwind styles aren't appearing:
1. Make sure you ran `npm install`
2. Check that `@tailwind` directives are in your global styles.scss
3. Restart your dev server: `nx serve about-me`

Happy learning! 🎨
