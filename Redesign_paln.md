================================================================================
  ACTIVITY MONITOR — UI/UX REDESIGN IMPLEMENTATION PLAN
  Theme: Glassmorphism 2.0 (Premium Frosted Glass)
  Animations: Essential / Fully Alive
  Stack: Next.js 14 · TypeScript · Tailwind CSS · Framer Motion
================================================================================

DOCUMENT OVERVIEW
-----------------
This plan covers the complete UI/UX overhaul of the Activity Monitor & ML
Analytics Platform. All 5 pages are redesigned under a unified Glassmorphism
2.0 design system. The plan is structured as 5 sprints across 8 weeks, with
the Landing Page as the highest priority (P1) deliverable.


================================================================================
  SECTION 1 — DESIGN SYSTEM
================================================================================

1.1  VISUAL PHILOSOPHY
----------------------
Glassmorphism 2.0 is NOT the basic blurred-card trend from 2021. It is a
layered depth system with the following principles:

  - Depth through layers: background orbs > grid overlay > noise texture >
    glass panels > content. Every layer has a distinct purpose.
  - Light as material: panels "catch" ambient light from orbs behind them.
  - Restraint: glass is used for containers only, never for text or charts.
  - Motion is atmospheric: orbs drift, stats float, panels breathe subtly.
  - Dark substrate: the base is near-black (#070714) so frosted glass reads.


1.2  COLOR PALETTE
------------------
  Background layers:
    Base           #070714   (deepest background)
    Surface        #0D0D1F   (card substrate)
    Panel          rgba(255,255,255,0.03)  (glass panel fill)
    Panel hover    rgba(255,255,255,0.05)

  Orb colors (blurred, never used directly on UI):
    Indigo orb     rgba(99,102,241,0.18)
    Sky orb        rgba(14,165,233,0.14)
    Violet orb     rgba(168,85,247,0.12)
    Teal orb       rgba(20,184,166,0.10)

  Accent palette:
    Indigo         #6366f1   (primary accent, CTAs)
    Sky            #38bdf8   (secondary accent, charts)
    Violet         #a855f7   (ML insights, burnout)
    Emerald        #10b981   (success, live, low risk)
    Amber          #f59e0b   (warnings, medium risk)
    Red            #ef4444   (danger, high burnout)

  Text:
    Primary        rgba(255,255,255,0.92)
    Secondary      rgba(255,255,255,0.55)
    Tertiary       rgba(255,255,255,0.30)
    Muted          rgba(255,255,255,0.18)
    Accent         #a5b4fc   (indigo-300)

  Borders:
    Default        rgba(255,255,255,0.08)
    Hover          rgba(255,255,255,0.14)
    Active/Focus   rgba(99,102,241,0.50)
    Glow border    1px solid rgba(99,102,241,0.30)


1.3  TYPOGRAPHY
---------------
  Display / Headings:   Outfit (Google Fonts)
    H1    700  clamp(40px, 7vw, 72px)  tracking -0.03em
    H2    600  32px                     tracking -0.02em
    H3    600  22px                     tracking -0.01em
    H4    500  17px

  Monospace / Numbers:  DM Mono (Google Fonts)
    Stat values   500  32px   tracking -0.02em
    Code tags     400  11px
    Percentages   500  13px

  Body / UI:            Outfit
    Body          400  15-16px  line-height 1.65
    Label         400  12px     tracking 0.04em uppercase
    Caption       400  11px     color tertiary

  Font loading (add to layout.tsx):
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@
      300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
      rel="stylesheet">


1.4  GLASS COMPONENT TOKENS
----------------------------
  Standard glass card:
    background:        rgba(255,255,255,0.03)
    backdrop-filter:   blur(40px)
    border:            1px solid rgba(255,255,255,0.08)
    border-radius:     24px
    box-shadow:        0 32px 80px rgba(0,0,0,0.5),
                       0 0 0 1px rgba(255,255,255,0.03) inset

  Elevated glass card (modals, upload zone outer):
    background:        rgba(255,255,255,0.05)
    backdrop-filter:   blur(60px)
    border-radius:     32px
    box-shadow:        0 40px 100px rgba(0,0,0,0.6)

  Stat chip (floating):
    background:        rgba(255,255,255,0.04)
    backdrop-filter:   blur(24px)
    border:            1px solid rgba(255,255,255,0.10)
    border-radius:     14px

  Gradient border wrapper (active/dragging states):
    padding:           2px
    background:        linear-gradient(135deg, #6366f1, #38bdf8, #a855f7)
    border-radius:     [card-radius + 2px]

  Pill badge:
    background:        rgba(accent,0.12)
    border:            1px solid rgba(accent,0.28)
    border-radius:     999px
    padding:           5px 14px


1.5  BACKGROUND SYSTEM (used on every page)
--------------------------------------------
  Layer 1 — Base:      background: #070714
  Layer 2 — Top glow:  radial-gradient(ellipse 80% 50% at 50% -5%,
                         rgba(99,102,241,0.15), transparent 65%)
  Layer 3 — Grid:      repeating linear-gradient lines, 56px grid,
                         rgba(255,255,255,0.025), pointer-events:none
  Layer 4 — Noise:     SVG feTurbulence, opacity 0.03
  Layer 5 — Orbs:      4-5 absolute divs, large radial-gradient circles,
                         filter:blur(60px), animated with @keyframes

  Orb animation pattern (alternate direction per orb):
    @keyframes orbFloat {
      from { transform: translate(0,0) scale(1); }
      to   { transform: translate(Xpx, Ypx) scale(1.07); }
    }
    animation: orbFloat 18-26s ease-in-out Xs infinite alternate;


1.6  SPACING & LAYOUT
----------------------
  Page padding:        40px horizontal (mobile: 20px)
  Section gap:         80px vertical
  Card padding:        24px (large), 16px (medium), 12px (small)
  Grid gap:            16px (standard), 12px (tight), 24px (loose)
  Border radius:       8px (chip), 16px (card), 24px (large card),
                       32px (hero card), 999px (pill)

  Breakpoints (Tailwind):
    sm   640px
    md   768px
    lg   1024px
    xl   1280px


================================================================================
  SECTION 2 — ANIMATION SYSTEM
================================================================================

2.1  DEPENDENCIES
-----------------
  npm install framer-motion
  framer-motion version: 11.x (use motion.div, AnimatePresence, useMotionValue)


2.2  PAGE MOUNT — STAGGER CHILDREN
------------------------------------
  Every page wraps its main content in a Framer motion.div with:

    variants={{
      hidden: {},
      visible: { transition: { staggerChildren: 0.06 } }
    }}
    initial="hidden"
    animate="visible"

  Each child uses:

    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.4,
                  ease: [0, 0.55, 0.45, 1] } }
    }}

  Delay groups:
    Nav bar       0.1s delay
    Badge/label   0.2s delay
    Heading       0.3s delay
    Subheading    0.4s delay
    Main card     0.5s delay
    Footer note   0.9s delay


2.3  PAGE TRANSITIONS
----------------------
  In app/layout.tsx, wrap {children} in AnimatePresence mode="wait".
  Each page exports a motion.div wrapper:

    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >


2.4  CHART DRAW ANIMATIONS
---------------------------
  Line/area charts (Recharts):
    Use isAnimationActive={true} animationDuration={800}
    animationEasing="ease-out" on all chart components.
    Custom: patch SVG path with stroke-dasharray trick via useEffect.

  Bar charts:
    animationBegin={0} animationDuration={600}

  Donut/Pie:
    Segments stagger at 60ms each via animationBegin={index * 60}

  Arc gauge (custom SVG):
    Animate stroke-dashoffset from full-length to target value.
    Trigger via IntersectionObserver when element enters viewport.
    Duration: 1000ms, easing: cubic-bezier(0.34, 1.56, 0.64, 1)


2.5  NUMBER COUNT-UP HOOK
--------------------------
  Custom hook: useCountUp(target, duration=1000)
  Uses requestAnimationFrame + easeOutExpo curve.
  Triggered by IntersectionObserver (fires once on first viewport entry).
  Always format result with toLocaleString() or toFixed(n).

  Example:
    function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2,-10*t); }

    useEffect(() => {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) startCount();
      });
      observer.observe(ref.current);
    }, []);


2.6  HOVER MICRO-INTERACTIONS
------------------------------
  Cards:
    whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
    Also: border brightens from rgba(255,255,255,0.08) to 0.14

  Buttons/CTAs:
    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}

  Sidebar nav items:
    Animated background slides in from left on hover (layoutId trick)
    Active item: 2px left border (indigo) + rgba(99,102,241,0.12) background

  Stat cards:
    whileHover adds box-shadow: 0 0 20px rgba(99,102,241,0.15)
    Transition: 150ms ease


2.7  SPECIALIZED ANIMATIONS
-----------------------------
  Drop zone glow (drag-over state):
    Border switches to animated conic-gradient spinner:
    @keyframes spinBorder { to { transform: rotate(360deg); } }
    Fallback (Safari): pulsing box-shadow animation

  Parse progress bar:
    Width transitions with CSS transition: width 0.3s ease
    Glow: box-shadow: 0 0 12px rgba(99,102,241,0.6)
    Step dots morph from 6px circles to 20px pills

  Floating stat cards:
    Each has independent floatBob animation:
    @keyframes floatBob { from {translateY(0)} to {translateY(-10px)} }
    Durations: 5s, 5.5s, 6s, 6s — delays: 0s, 0.5s, 1s, 1.5s

  Alert banner (burnout risk):
    Slides in from top: y: -40 → 0
    High risk triggers shake: @keyframes shake (±6px x-translation)
    Color lerps green → amber → red based on risk score value

  Burnout thermometer fill:
    SVG rect height animates from 0 to risk% of total height
    Fill color: interpolated via JS between #10b981, #f59e0b, #ef4444

  Heatmap cells (peak hours):
    Each cell animates opacity: 0 → 1 with staggered delay
    delay = (row * cols + col) * 15ms

  Table row exit (sessions):
    Framer AnimatePresence + layout prop on each row
    exit: { opacity: 0, height: 0, marginBottom: 0 }
    Spring: stiffness 300, damping 30

  Orb background:
    4 divs, CSS-only, alternate animation direction
    Each orb: 18-26s duration, ease-in-out, infinite alternate

  Live indicator dot:
    @keyframes dotPulse { 50% { transform: scale(1.5); opacity: 0.7; } }
    Duration: 2s, ease, infinite

  Gradient headline shimmer:
    background-size: 200% auto
    @keyframes gradShift { 0%,100% { background-position: 0% 50% }
                           50%     { background-position: 100% 50% } }
    Duration: 4s, ease, infinite

  Reduce motion compliance:
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation: none !important;
                                transition: none !important; }
    }


================================================================================
  SECTION 3 — PAGE-BY-PAGE SPECIFICATIONS
================================================================================

────────────────────────────────────────────────────────────────────────────────
PAGE 1: LANDING / UPLOAD  (Priority: P1 · Week 3-4)
────────────────────────────────────────────────────────────────────────────────
File: frontend/app/page.tsx

Layout:
  - Full viewport height, centered column layout
  - Background system (all 5 layers) active
  - 4 floating stat chips positioned absolutely (corners, not overlapping card)
  - Nav bar: logo left, live-tracking badge right

Hero section (centered):
  - ML badge pill (indigo, pulsing dot)
  - H1: "Understand your" (plain) + "productivity patterns" (gradient shimmer)
  - Subheading: 15px, rgba(255,255,255,0.42), max-width 400px
  - Upload card (see below)
  - Security footnote: "🔒 All data processed locally · Never leaves your machine"

Upload card structure:
  Outer: elevated glass card (blur 48px, border-radius 32px)
    Inner gradient wrapper: 2px padding, linear-gradient border
      Drop zone inner: background rgba(10,10,22,0.84), border-radius 18px
        States:
          IDLE:     Cloud upload icon + "Drop your CSV here" + schema tags
          DRAGGING: Icon animates up, border becomes spinning conic-gradient,
                    card scales to 1.01, text changes to "Release to upload"
          PARSING:  Upload UI fades out, ParseProgress slides in
          DONE:     "Done! Redirecting…" for 600ms → router.push('/dashboard')
    Divider line with "smart column detection" label
    Feature pills: Burnout detection · Peak hours · Productivity score

ParseProgress component:
  - Step label (left) + percentage (right, DM Mono, indigo)
  - Progress track: height 4px, rgba(255,255,255,0.08) bg
  - Fill: gradient left to right #6366f1 → #38bdf8, glow box-shadow
  - Step dots: 6 dots, completed = wide pill (20px) with gradient + glow

Components to build:
  - <BackgroundSystem />     canvas-free, pure CSS orbs + grid + noise
  - <FloatingStat />         glass chip with value + label + floatBob anim
  - <GlowDropZone />         drag states, spinning border, icon animation
  - <ParseProgress />        progress bar + morphing step dots
  - <FeaturePill />          reusable accent pill

Framer usage:
  - AnimatePresence on ParseProgress ↔ UploadUI swap
  - motion.div stagger on page mount
  - motion.div on drop zone (scale on drag)

────────────────────────────────────────────────────────────────────────────────
PAGE 2: DASHBOARD  (Priority: P1 · Week 3-4)
────────────────────────────────────────────────────────────────────────────────
File: frontend/app/dashboard/page.tsx

Layout: Bento grid
  Row 1 (3 cols): Stat cards — Total Active Time, Top App, Productivity Score
  Row 2 (2 cols): Activity Timeline (wide) + App Distribution donut (narrow)
  Row 3 (3 cols): Top Applications list + Session count + Avg session length

Top bar:
  - Page title "Dashboard" (H2, Outfit 600)
  - Date range picker (glass card dropdown, slide-in calendar)
  - Export CSV button (ghost style, glass)
  - Live indicator dot

Stat cards (AnimatedStatCard):
  Glass card + useCountUp on value + delta badge (green/red pill + arrow)
  Icon: small rounded square, gradient fill, relevant SVG icon

Activity Timeline (Recharts AreaChart):
  Dark theme: fill="#6366f1" fillOpacity={0.15} stroke="#6366f1"
  Grid lines: rgba(255,255,255,0.06)
  Tooltip: glass card tooltip (backdrop-filter, custom component)
  Animation: animationDuration={800} animationEasing="ease-out"

App Distribution (Recharts PieChart):
  Donut style (innerRadius 60, outerRadius 90)
  Segment colors: indigo, sky, violet, emerald, amber (in order)
  Each segment: animationBegin={index * 60}
  Center label: total hours in DM Mono

Top Apps list:
  Each row: app icon (emoji/letter avatar) + name + bar + duration
  Bar: horizontal fill, gradient, animates width on mount
  Stagger: 40ms per row

Components to build:
  - <AnimatedStatCard />     glass card + countUp + delta badge
  - <GlassTooltip />         custom Recharts tooltip with backdrop-filter
  - <TopAppsBar />           animated horizontal bar rows
  - <DateRangePicker />      glass dropdown with slide animation
  - <BentoGrid />            CSS grid layout component

────────────────────────────────────────────────────────────────────────────────
PAGE 3: ML INSIGHTS  (Priority: P1 · Week 5-6)
────────────────────────────────────────────────────────────────────────────────
File: frontend/app/insights/page.tsx

Layout: Two-column (left: score + gauge, right: app category list)

Productivity Score section:
  - ArcGauge component: SVG arc, draws from 0 on scroll-enter
    strokeDasharray = 2πr (circumference), animate dashoffset
    Color: gradient indigo → sky (good), amber (medium), red (low)
  - Large score number (DM Mono, 64px) with useCountUp
  - Score breakdown: Deep Work %, Communication %, Distraction %

App Category list:
  CategoryBadge system:
    Deep Work    → indigo pill (bg rgba(99,102,241,0.15))
    Communication→ sky pill (bg rgba(56,189,248,0.12))
    Distraction  → red pill (bg rgba(239,68,68,0.12))

  Each app row: glass card + app name + category badge + time bar
  Horizontal bar animates width on mount (IntersectionObserver trigger)
  Stagger: 50ms per row

BarRace chart (top section):
  Recharts BarChart horizontal
  Bars animate in on mount, sorted by duration
  Gradient fills per category

Components to build:
  - <ArcGauge />             SVG arc with scroll-triggered draw animation
  - <CategoryBadge />        color-coded category pill
  - <AppCategoryRow />       glass card row with animated bar
  - <ScoreBreakdown />       three percentage bars with labels

────────────────────────────────────────────────────────────────────────────────
PAGE 4: FORECAST & BURNOUT  (Priority: P2 · Week 5-6)
────────────────────────────────────────────────────────────────────────────────
File: frontend/app/forecast/page.tsx

Layout: Two sections — Burnout Risk (left), Peak Hours (right)

Burnout Risk section:
  BurnoutThermometer component (custom SVG):
    - Vertical thermometer shape (rounded rect)
    - Fill animates height from 0 to risk% on mount
    - Fill color interpolated: 0-33% = emerald, 34-66% = amber, 67-100% = red
    - Risk label below: "Low Risk" / "Moderate" / "High Risk"
    - Large risk percentage (DM Mono) with useCountUp

  AlertBanner (slides in from top, AnimatePresence):
    Low:     hidden
    Medium:  amber glass banner, warning icon, slides down
    High:    red glass banner + shake animation + glowing border
    Text: actionable message + recommendation count

  RecommendationCards (3 cards, fan-in animation):
    Glass cards with numbered icon, headline, body text
    Animate: staggered slide-up, 80ms delay each

Peak Hours heatmap:
  7 columns (days) × 24 rows (hours) = 168 cells
  Each cell: small rounded square, opacity based on activity intensity
  Color: indigo (low) → sky (medium) → emerald (peak)
  Animation: each cell fades in, delay = (row * 7 + col) * 10ms
  Hover: cell scales 1.3, tooltip shows "Tuesday 2pm — 94% productivity"

Components to build:
  - <BurnoutThermometer />   SVG fill animation + color interpolation
  - <AlertBanner />          slide-in glass banner with severity levels
  - <RecommendationCard />   staggered glass card
  - <PeakHeatmap />          168-cell grid with staggered fade-in
  - <HeatmapTooltip />       hover tooltip on heatmap cells

────────────────────────────────────────────────────────────────────────────────
PAGE 5: SESSIONS  (Priority: P3 · Week 7)
────────────────────────────────────────────────────────────────────────────────
File: frontend/app/sessions/page.tsx

Layout: Full-width table with top filter bar

FilterChipBar:
  Glass container, horizontal scroll on mobile
  Filter chips: All / Deep Work / Communication / Distraction / Custom range
  Active chip: filled (indigo bg, white text)
  Chips slide in horizontally on mount (stagger 30ms each)

Data table:
  Header: App · Window Title · Start Time · Duration · Category
  Glass card wrapper for table
  Row hover: background rgba(255,255,255,0.03)
  Row selection: checkbox (left) + selected row bg rgba(99,102,241,0.08)
  Framer layout prop on each row for smooth reflow

Row animations:
  Mount: stagger slide-up (30ms each, max 20 rows animated)
  Exit:  AnimatePresence exit={{ opacity:0, height:0, marginBottom:0 }}
         Spring stiffness:300 damping:30

BulkActionBar (slides up from bottom when rows selected):
  Fixed position, glass card
  Contents: "N rows selected" + Delete button + Export button
  Animation: y: 80 → 0, AnimatePresence
  Delete: selected rows exit-animate, remaining rows spring-reflow

AnimatedEmptyState (no sessions):
  SVG illustration (abstract chart icon)
  CSS animation: gentle float + subtle rotate (±3deg)
  CTA: "Upload your first CSV" button

Components to build:
  - <FilterChipBar />        horizontal scrollable chip filter
  - <SessionsTable />        Framer layout table with animated rows
  - <BulkActionBar />        slide-up selection action bar
  - <AnimatedEmptyState />   floating empty state illustration


================================================================================
  SECTION 4 — SHARED COMPONENTS
================================================================================

4.1  AppShell (components/AppShell.tsx)
----------------------------------------
  Sidebar:
    Width: 240px (expanded), 64px (collapsed)
    Background: rgba(255,255,255,0.02), border-right rgba(255,255,255,0.06)
    Logo + app name at top
    Nav items: icon + label, animated label hide on collapse
    Active state: 2px left border (indigo) + rgba(99,102,241,0.10) bg
    Collapse toggle button at bottom
    Framer: AnimatePresence on label text, motion.div on sidebar width

  TopBar:
    Height: 56px
    Glass: backdrop-filter blur(20px), border-bottom rgba(255,255,255,0.06)
    Left: page title (H3)
    Right: live indicator + user avatar

  Main content area:
    margin-left: 240px (or 64px collapsed)
    padding: 32px 40px
    transition: margin-left 0.3s ease


4.2  Sidebar nav items
-----------------------
  Route        Icon (Lucide)     Label
  /            Upload            Upload
  /dashboard   LayoutDashboard   Dashboard
  /insights    Brain             ML Insights
  /forecast    Activity          Forecast
  /sessions    Table             Sessions


4.3  Reusable primitives
-------------------------
  <GlassCard />
    Props: padding, radius, blur, className
    Applies standard glass token styles

  <GradientText />
    Props: from, to, children
    Applies gradient + WebkitBackgroundClip text

  <Pill />
    Props: color ("indigo"|"sky"|"violet"|"emerald"|"amber"|"red"), children
    Maps color to bg + border + text rgba values

  <LiveDot />
    Pulsing green dot, used in nav and top bar

  <GlassTooltip />
    backdrop-filter: blur(20px)
    border: 1px solid rgba(255,255,255,0.12)
    Used as custom Recharts tooltip


================================================================================
  SECTION 5 — PACKAGE DEPENDENCIES
================================================================================

  Required (install now):
    framer-motion          npm install framer-motion
    lucide-react           npm install lucide-react

  Already in project (verify versions):
    next                   14.x
    react                  18.x
    typescript             5.x
    tailwindcss            3.x
    recharts               2.x

  Optional but recommended:
    clsx                   npm install clsx          (className utility)
    tailwind-merge         npm install tailwind-merge (Tailwind class merging)
    @radix-ui/react-*      npm install @radix-ui/react-dialog
                           npm install @radix-ui/react-tooltip
                           (accessible primitives for modals, tooltips)

  Font loading (no npm needed):
    Add to frontend/app/layout.tsx <head>:
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@
      300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
      rel="stylesheet" />



================================================================================
  SECTION 6 — GLOBALS.CSS KEYFRAMES (paste into globals.css)
================================================================================

  @keyframes orbFloat {
    from { transform: translate(0, 0) scale(1); }
    to   { transform: translate(var(--ox, 24px), var(--oy, 18px)) scale(1.07); }
  }
  @keyframes floatBob {
    from { transform: translateY(0px); }
    to   { transform: translateY(-10px); }
  }
  @keyframes staggerIn {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes gradShift {
    0%, 100% { background-position: 0% 50%; }
    50%       { background-position: 100% 50%; }
  }
  @keyframes spinBorder {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes dotPulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50%       { transform: scale(1.5); opacity: 0.7; }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-6px); }
    40%       { transform: translateX(6px); }
    60%       { transform: translateX(-4px); }
    80%       { transform: translateX(4px); }
  }
  @keyframes shimmer {
    from { background-position: -200% center; }
    to   { background-position:  200% center; }
  }
  @keyframes borderPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
    50%       { box-shadow: 0 0 24px 4px rgba(99,102,241,0.4); }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }


================================================================================
  SECTION 7 — CRITICAL IMPLEMENTATION NOTES
================================================================================

  1. BACKDROP-FILTER BROWSER SUPPORT
     Always include both:
       backdrop-filter: blur(40px);
       -webkit-backdrop-filter: blur(40px);
     Firefox does not support backdrop-filter by default. Add a fallback:
       background: rgba(10,10,22,0.90);   /* solid fallback */

  2. DARK BASE IS MANDATORY
     Glassmorphism only reads clearly against a very dark background.
     The #070714 base color must never be lightened. If panels are too
     transparent, increase rgba alpha, do NOT change the background.

  3. PERFORMANCE: WILL-CHANGE
     Add will-change: transform to all animated orbs and floating stats.
     Do NOT add will-change to every element — only persistent animations.

  4. AVOID ANIMATION JANK
     Test animations in Chrome DevTools > Performance > Frames.
     All animations must use transform and opacity only.
     Never animate: width, height, top, left, margin, padding on orbs.
     Chart animations (Recharts internal) are acceptable exceptions.

  5. FONT LOADING
     Use display=swap on Google Fonts URL to prevent FOUT blocking.
     Preconnect to fonts.googleapis.com and fonts.gstatic.com.

  6. FRAMER MOTION — NEXT.JS APP ROUTER
     All components using Framer Motion must be Client Components.
     Add "use client"; at the top of any file using motion.*, useAnimation,
     AnimatePresence, useMotionValue, etc.

  7. RECHARTS DARK THEME MINIMUM CONFIG
     <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
     <XAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
     <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
     Always use a custom <Tooltip content={<GlassTooltip />} />

  8. SPRINT ORDER IS NON-NEGOTIABLE
     Sprint 1 (shell + design tokens) MUST complete before any page work.
     A broken navigation system blocks all downstream development.
     Lock design tokens before writing a single component.

  9. ALREADY DELIVERED
     LandingPage.tsx has been built and is available as the output file.
     Use it as the reference implementation for animation patterns and
     glass styling across all other pages.


================================================================================
  END OF DOCUMENT
  Activity Monitor — UI/UX Redesign Implementation Plan v1.0
================================================================================