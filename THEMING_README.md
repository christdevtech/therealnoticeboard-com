# Theming System Documentation

This document explains the comprehensive theming system implemented for The Notice Board website, allowing easy customization of the entire website's appearance through CSS variables.

## Overview

The theming system is built on CSS custom properties (variables) defined in `src/app/(frontend)/globals.css` and uses Tailwind CSS utility classes for consistent application across all components.

## Theme Structure

### Base Theme Variables

All theme variables are defined in the `:root` selector for light mode and `[data-theme="dark"]` selector for dark mode in `globals.css`.

#### Core Colors
- `--background`: Main background color
- `--foreground`: Primary text color
- `--card`: Card/container background
- `--card-foreground`: Text color on cards
- `--popover`: Popover background
- `--popover-foreground`: Popover text color
- `--primary`: Primary brand color
- `--primary-foreground`: Text on primary backgrounds
- `--primary-hover`: Primary color hover state
- `--secondary`: Secondary color
- `--secondary-foreground`: Text on secondary backgrounds
- `--secondary-hover`: Secondary color hover state
- `--muted`: Muted/subtle background
- `--muted-foreground`: Muted text color
- `--accent`: Accent color for highlights
- `--accent-foreground`: Text on accent backgrounds
- `--accent-hover`: Accent color hover state

#### Status Colors
- `--destructive`: Error/danger color
- `--destructive-foreground`: Text on destructive backgrounds
- `--destructive-hover`: Destructive color hover state
- `--success`: Success color
- `--success-foreground`: Text on success backgrounds
- `--success-hover`: Success color hover state
- `--warning`: Warning color
- `--warning-foreground`: Text on warning backgrounds
- `--warning-hover`: Warning color hover state
- `--error`: Error color (alias for destructive)
- `--error-foreground`: Text on error backgrounds
- `--error-hover`: Error color hover state

#### UI Elements
- `--border`: Default border color
- `--input`: Input field background
- `--input-foreground`: Input field text color
- `--ring`: Focus ring color
- `--radius`: Border radius value

#### Specialized Areas
- `--nav-background`: Navigation background
- `--nav-foreground`: Navigation text color
- `--nav-border`: Navigation border color
- `--sidebar-background`: Sidebar background
- `--sidebar-foreground`: Sidebar text color
- `--sidebar-border`: Sidebar border color
- `--content-background`: Content area background
- `--content-foreground`: Content area text color
- `--card-border`: Card border color

#### Shadows
- `--shadow-sm`: Small shadow
- `--shadow-md`: Medium shadow
- `--shadow-lg`: Large shadow
- `--shadow-xl`: Extra large shadow

## Utility Classes

Custom utility classes are defined in the `@layer utilities` section to make theme variables easily accessible:

### Background Colors
- `.bg-nav`: Navigation background
- `.bg-sidebar`: Sidebar background
- `.bg-content`: Content background
- `.bg-success`: Success background
- `.bg-warning`: Warning background
- `.bg-error`: Error background

### Text Colors
- `.text-nav`: Navigation text
- `.text-sidebar`: Sidebar text
- `.text-content`: Content text
- `.text-input`: Input text
- `.text-success`: Success text
- `.text-success-foreground`: Success foreground text
- `.text-warning`: Warning text
- `.text-warning-foreground`: Warning foreground text
- `.text-error`: Error text
- `.text-error-foreground`: Error foreground text

### Border Colors
- `.border-nav`: Navigation border
- `.border-sidebar`: Sidebar border
- `.border-card`: Card border

### Hover States
- `.hover:bg-primary-hover:hover`: Primary hover background
- `.hover:bg-secondary-hover:hover`: Secondary hover background
- `.hover:bg-accent-hover:hover`: Accent hover background
- `.hover:bg-destructive-hover:hover`: Destructive hover background
- `.hover:bg-success-hover:hover`: Success hover background
- `.hover:bg-warning-hover:hover`: Warning hover background
- `.hover:bg-error-hover:hover`: Error hover background

### Shadows
- `.shadow-theme`: Theme-aware shadow that adapts to light/dark mode

## How to Customize the Theme

### 1. Modify Color Values

To change the website's appearance, edit the HSL values in `src/app/(frontend)/globals.css`:

```css
:root {
  /* Change primary color from blue to green */
  --primary: 142 76% 36%; /* Green instead of blue */
  --primary-foreground: 355.7 100% 97.3%;
  --primary-hover: 142 76% 32%;
}

[data-theme="dark"] {
  /* Ensure dark mode primary color is also updated */
  --primary: 142 76% 45%;
  --primary-foreground: 142 76% 10%;
  --primary-hover: 142 76% 50%;
}
```

### 2. Adjust Contrast Ratios

For accessibility, ensure sufficient contrast between foreground and background colors:

```css
/* Light mode - ensure dark text on light backgrounds */
:root {
  --background: 0 0% 100%; /* White */
  --foreground: 222.2 84% 4.9%; /* Very dark blue */
}

/* Dark mode - ensure light text on dark backgrounds */
[data-theme="dark"] {
  --background: 222.2 84% 4.9%; /* Very dark blue */
  --foreground: 210 40% 98%; /* Very light blue */
}
```

### 3. Create Custom Color Schemes

You can create entirely new color schemes by replacing all color values:

```css
/* Example: Warm color scheme */
:root {
  --background: 30 40% 98%;
  --foreground: 20 14.3% 4.1%;
  --primary: 24 9.8% 10%;
  --secondary: 30 4.8% 95.9%;
  --accent: 36 64% 57%;
  /* ... continue with all other colors */
}
```

### 4. Modify Component-Specific Areas

Customize specific areas of the website:

```css
/* Make navigation stand out with different colors */
:root {
  --nav-background: 217.2 32.6% 17.5%; /* Dark blue */
  --nav-foreground: 210 40% 98%; /* Light text */
  --nav-border: 217.2 32.6% 20%;
}
```

## Theme Switching

The website supports automatic theme switching based on:

1. **User preference**: Stored in localStorage as `payload-theme`
2. **System preference**: Uses `prefers-color-scheme` media query
3. **Manual selection**: Via the theme selector component

The theme is applied by setting the `data-theme` attribute on HTML elements.

## Components Using the Theme System

The following components have been updated to use theme variables:

- **Dashboard**: All dashboard components use theme-aware colors
- **Verification System**: Admin verification request components
- **UI Components**: Button, Card, Input, Select, and other UI components
- **Navigation**: Header and footer components
- **Forms**: All form elements respect theme colors

## Best Practices

### 1. Maintain Contrast
Always ensure sufficient contrast ratios (WCAG AA: 4.5:1 for normal text, 3:1 for large text).

### 2. Test Both Themes
When modifying colors, test both light and dark modes to ensure consistency.

### 3. Use Semantic Colors
Use semantic color names (primary, secondary, success, warning, error) rather than specific color names (blue, red, green).

### 4. Consistent Hover States
Ensure hover states provide clear visual feedback while maintaining accessibility.

### 5. Shadow Consistency
Use the theme-aware shadow utilities for consistent depth across light and dark modes.

## Example: Creating a Brand-Specific Theme

```css
/* Company brand colors */
:root {
  /* Brand primary: Company blue */
  --primary: 210 100% 50%;
  --primary-foreground: 0 0% 100%;
  --primary-hover: 210 100% 45%;
  
  /* Brand secondary: Company orange */
  --secondary: 25 95% 53%;
  --secondary-foreground: 0 0% 100%;
  --secondary-hover: 25 95% 48%;
  
  /* Neutral grays matching brand guidelines */
  --muted: 210 40% 96%;
  --muted-foreground: 210 10% 40%;
  
  /* Success: Brand green */
  --success: 120 60% 45%;
  --success-foreground: 0 0% 100%;
  
  /* Warning: Brand yellow */
  --warning: 45 100% 50%;
  --warning-foreground: 0 0% 0%;
  
  /* Error: Brand red */
  --error: 0 75% 50%;
  --error-foreground: 0 0% 100%;
}
```

## Troubleshooting

### Colors Not Applying
1. Check that CSS variables are properly defined in `globals.css`
2. Ensure Tailwind is recognizing the custom utilities
3. Verify that components are using theme classes instead of hardcoded colors

### Dark Mode Issues
1. Confirm `data-theme="dark"` is being set on the HTML element
2. Check that dark mode variables are defined
3. Ensure sufficient contrast in dark mode

### Performance
The theming system uses CSS custom properties which are highly performant and don't require JavaScript for color changes.

## Future Enhancements

- **Multiple Theme Support**: Extend beyond light/dark to support multiple named themes
- **Theme Builder**: Create a visual theme builder interface
- **Component Variants**: Add more component-specific theme variations
- **Animation Themes**: Include theme-aware animations and transitions

This theming system provides a robust foundation for maintaining consistent, accessible, and easily customizable styling across the entire Notice Board website.