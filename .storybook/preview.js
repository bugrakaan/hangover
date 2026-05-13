import '../src/components/Dropdown/Dropdown.scss'

// Google Font — Inter
const fontLink = document.createElement('link')
fontLink.rel = 'stylesheet'
fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap'
document.head.appendChild(fontLink)

// CSS custom properties + demo trigger button styles
const style = document.createElement('style')
style.textContent = `
  :root {
    --hangover-font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
  }

  .ho-demo-trigger {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 500;
    font-family: 'Inter', system-ui, sans-serif;
    color: #0f172a;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    transition: background 120ms ease, border-color 120ms ease, box-shadow 120ms ease, transform 80ms ease;
    white-space: nowrap;
    outline: none;
    letter-spacing: -0.01em;
  }

  .ho-demo-trigger:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.09);
  }

  .ho-demo-trigger:active {
    background: #f1f5f9;
    transform: translateY(1px);
    box-shadow: none;
  }

  .ho-demo-trigger.is-selected {
    color: #4f46e5;
    border-color: #c7d2fe;
    background: #eef2ff;
  }

  .ho-demo-trigger--sm {
    padding: 4px 10px;
    font-size: 11px;
    border-radius: 6px;
  }
`
document.head.appendChild(style)

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          'Dropdown',
          [
            '1. Basic',
            '2. Scroll Spy',
            '3. Tab Mode',
            '4. Checkbox',
            '5. Controlled',
            '6. Events',
            '7. Placement',
          ],
        ],
      },
    },
  },
};

export default preview;