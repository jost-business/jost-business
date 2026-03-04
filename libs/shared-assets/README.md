# Shared Assets Library

This library contains shared assets that are used across all micro-frontend applications in the Jost monorepo.

## Structure

```
libs/shared-assets/
  src/
    images/     # Shared image assets (PNG, JPG, SVG, etc.)
```

## Usage

Each application includes this library's assets in their respective `project.json` build configuration:

```json
"assets": [
  "apps/{app}/src/favicon.ico",
  "apps/{app}/src/assets",
  "libs/shared-assets/src/images"
]
```

During the build process, assets from this library are copied to each application's dist folder as `/assets/images/`, making them accessible with paths like:

```html
<img src="/assets/images/legend.png" alt="Legend" />
```

## Adding New Shared Assets

1. Place your image files in `libs/shared-assets/src/images/`
2. Build the applications using `nx build` or `nx run-many --target=build --projects=shell,finance,about-me,playground`
3. Reference the images using the `/assets/images/{filename}` path in your templates

## Notes

- All applications automatically include images from this library during build
- Assets are copied to maintain a consistent path structure across all micro-frontends
- This ensures shared resources can be accessed from any application using the same relative paths
