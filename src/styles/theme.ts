import { type Config } from "tailwindcss"

// CSS variable references
const cssVar = (name: string) => `var(--${name})`

// Theme interface for type safety
export interface Theme {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: {
      light: string
      dark: string
      paper: {
        light: string
        dark: string
      }
      elevated: {
        light: string
        dark: string
      }
    }
    text: {
      light: string
      dark: string
      muted: {
        light: string
        dark: string
      }
      link: {
        light: string
        dark: string
      }
    }
    gradient: {
      primary: string
      secondary: string
      dark: string
      glow: string
    }
    chart: {
      positive: string
      negative: string
      neutral: string
      series: string[]
      grid: {
        light: string
        dark: string
      }
    }
    status: {
      success: {
        light: string
        dark: string
      }
      warning: {
        light: string
        dark: string
      }
      error: {
        light: string
        dark: string
      }
      info: {
        light: string
        dark: string
      }
    }
    border: {
      light: string
      dark: string
      hover: {
        light: string
        dark: string
      }
    }
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    xxl: string
    layout: {
      page: string
      section: string
      content: string
      element: string
    }
  }
  breakpoints: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    xxl: string
    mobile: string
    tablet: string
    laptop: string
    desktop: string
  }
  animation: {
    duration: {
      fast: string
      normal: string
      slow: string
      page: string
    }
    easing: {
      easeInOut: string
      easeOut: string
      easeIn: string
      spring: string
    }
    keyframes: {
      fadeIn: {
        from: { opacity: number }
        to: { opacity: number }
      }
      slideIn: {
        from: { transform: string; opacity: number }
        to: { transform: string; opacity: number }
      }
      pulse: {
        '0%, 100%': { opacity: number }
        '50%': { opacity: number }
      }
    }
  }
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
    colored: {
      primary: string
      success: string
      warning: string
      error: string
    }
    inner: string
  }
  typography: {
    fontFamily: {
      sans: string
      mono: string
    }
    fontSize: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
      '4xl': string
      display: {
        sm: string
        base: string
        lg: string
      }
    }
    fontWeight: {
      normal: string
      medium: string
      semibold: string
      bold: string
    }
    lineHeight: {
      none: string
      tight: string
      snug: string
      normal: string
      relaxed: string
      loose: string
    }
    letterSpacing: {
      tighter: string
      tight: string
      normal: string
      wide: string
      wider: string
      widest: string
    }
  }
  radius: {
    sm: string
    md: string
    lg: string
    xl: string
    full: string
  }
  zIndex: {
    hide: number
    auto: string
    base: number
    docked: number
    dropdown: number
    sticky: number
    banner: number
    overlay: number
    modal: number
    popover: number
    toast: number
    tooltip: number
  }
  blur: {
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
  }
  grid: {
    cols: {
      sm: number
      md: number
      lg: number
    }
    gutter: {
      sm: string
      md: string
      lg: string
    }
  }
}

// Theme implementation using CSS variables
export const theme: Theme = {
  colors: {
    primary: cssVar('primary'),
    secondary: cssVar('secondary'),
    accent: cssVar('accent'),
    background: {
      light: cssVar('background-light'),
      dark: cssVar('background-dark'),
      paper: {
        light: cssVar('background-paper-light'),
        dark: cssVar('background-paper-dark')
      },
      elevated: {
        light: cssVar('background-elevated-light'),
        dark: cssVar('background-elevated-dark')
      }
    },
    text: {
      light: cssVar('text-light'),
      dark: cssVar('text-dark'),
      muted: {
        light: cssVar('text-muted-light'),
        dark: cssVar('text-muted-dark')
      },
      link: {
        light: cssVar('text-link-light'),
        dark: cssVar('text-link-dark')
      }
    },
    gradient: {
      primary: cssVar('gradient-primary'),
      secondary: cssVar('gradient-secondary'),
      dark: cssVar('gradient-dark'),
      glow: cssVar('gradient-glow')
    },
    chart: {
      positive: cssVar('chart-positive'),
      negative: cssVar('chart-negative'),
      neutral: cssVar('chart-neutral'),
      series: [
        cssVar('chart-1'),
        cssVar('chart-2'),
        cssVar('chart-3'),
        cssVar('chart-4'),
        cssVar('chart-5'),
        cssVar('chart-6')
      ],
      grid: {
        light: cssVar('chart-grid-light'),
        dark: cssVar('chart-grid-dark')
      }
    },
    status: {
      success: {
        light: cssVar('status-success-light'),
        dark: cssVar('status-success-dark')
      },
      warning: {
        light: cssVar('status-warning-light'),
        dark: cssVar('status-warning-dark')
      },
      error: {
        light: cssVar('status-error-light'),
        dark: cssVar('status-error-dark')
      },
      info: {
        light: cssVar('status-info-light'),
        dark: cssVar('status-info-dark')
      }
    },
    border: {
      light: cssVar('border-light'),
      dark: cssVar('border-dark'),
      hover: {
        light: cssVar('border-hover-light'),
        dark: cssVar('border-hover-dark')
      }
    }
  },
  spacing: {
    xs: cssVar('spacing-xs'),
    sm: cssVar('spacing-sm'),
    md: cssVar('spacing-md'),
    lg: cssVar('spacing-lg'),
    xl: cssVar('spacing-xl'),
    xxl: cssVar('spacing-xxl'),
    layout: {
      page: cssVar('spacing-layout-page'),
      section: cssVar('spacing-layout-section'),
      content: cssVar('spacing-layout-content'),
      element: cssVar('spacing-layout-element')
    }
  },
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    xxl: '1536px',
    mobile: '640px',
    tablet: '768px',
    laptop: '1024px',
    desktop: '1280px'
  },
  animation: {
    duration: {
      fast: cssVar('animation-duration-fast'),
      normal: cssVar('animation-duration-normal'),
      slow: cssVar('animation-duration-slow'),
      page: cssVar('animation-duration-page')
    },
    easing: {
      easeInOut: cssVar('animation-easing-ease-in-out'),
      easeOut: cssVar('animation-easing-ease-out'),
      easeIn: cssVar('animation-easing-ease-in'),
      spring: cssVar('animation-easing-spring')
    },
    keyframes: {
      fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 }
      },
      slideIn: {
        from: { transform: 'translateY(20px)', opacity: 0 },
        to: { transform: 'translateY(0)', opacity: 1 }
      },
      pulse: {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.5 }
      }
    }
  },
  shadows: {
    sm: cssVar('shadow-sm'),
    md: cssVar('shadow-md'),
    lg: cssVar('shadow-lg'),
    xl: cssVar('shadow-xl'),
    colored: {
      primary: cssVar('shadow-colored-primary'),
      success: cssVar('shadow-colored-success'),
      warning: cssVar('shadow-colored-warning'),
      error: cssVar('shadow-colored-error')
    },
    inner: cssVar('shadow-inner')
  },
  typography: {
    fontFamily: {
      sans: 'var(--font-geist-sans)',
      mono: 'var(--font-geist-mono)'
    },
    fontSize: {
      xs: cssVar('font-size-xs'),
      sm: cssVar('font-size-sm'),
      base: cssVar('font-size-base'),
      lg: cssVar('font-size-lg'),
      xl: cssVar('font-size-xl'),
      '2xl': cssVar('font-size-2xl'),
      '3xl': cssVar('font-size-3xl'),
      '4xl': cssVar('font-size-4xl'),
      display: {
        sm: cssVar('font-size-display-sm'),
        base: cssVar('font-size-display-base'),
        lg: cssVar('font-size-display-lg')
      }
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    },
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2'
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    }
  },
  radius: {
    sm: cssVar('radius-sm'),
    md: cssVar('radius-md'),
    lg: cssVar('radius-lg'),
    xl: cssVar('radius-xl'),
    full: cssVar('radius-full')
  },
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    toast: 1600,
    tooltip: 1700
  },
  blur: {
    sm: cssVar('blur-sm'),
    md: cssVar('blur-md'),
    lg: cssVar('blur-lg'),
    xl: cssVar('blur-xl'),
    '2xl': cssVar('blur-2xl')
  },
  grid: {
    cols: {
      sm: 4,
      md: 8,
      lg: 12
    },
    gutter: {
      sm: cssVar('grid-gutter-sm'),
      md: cssVar('grid-gutter-md'),
      lg: cssVar('grid-gutter-lg')
    }
  }
}

// Export theme values for Tailwind config
export const tailwindTheme = {
  extend: {
    colors: {
      primary: 'var(--primary)',
      secondary: 'var(--secondary)',
      accent: 'var(--accent)',
      background: 'var(--background)',
      foreground: 'var(--foreground)',
    },
    spacing: {
      xs: 'var(--spacing-xs)',
      sm: 'var(--spacing-sm)',
      md: 'var(--spacing-md)',
      lg: 'var(--spacing-lg)',
      xl: 'var(--spacing-xl)',
      xxl: 'var(--spacing-xxl)',
    },
    borderRadius: {
      sm: 'var(--radius-sm)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      xl: 'var(--radius-xl)',
      full: 'var(--radius-full)',
    },
    boxShadow: {
      sm: 'var(--shadow-sm)',
      md: 'var(--shadow-md)',
      lg: 'var(--shadow-lg)',
      xl: 'var(--shadow-xl)',
    },
    fontFamily: {
      sans: ['var(--font-geist-sans)'],
      mono: ['var(--font-geist-mono)'],
    },
    fontSize: {
      xs: 'var(--font-size-xs)',
      sm: 'var(--font-size-sm)',
      base: 'var(--font-size-base)',
      lg: 'var(--font-size-lg)',
      xl: 'var(--font-size-xl)',
      '2xl': 'var(--font-size-2xl)',
      '3xl': 'var(--font-size-3xl)',
      '4xl': 'var(--font-size-4xl)',
    },
    blur: {
      sm: 'var(--blur-sm)',
      md: 'var(--blur-md)',
      lg: 'var(--blur-lg)',
      xl: 'var(--blur-xl)',
      '2xl': 'var(--blur-2xl)',
    },
  },
}
