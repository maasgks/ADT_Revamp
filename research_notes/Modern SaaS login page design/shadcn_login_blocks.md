# shadcn/ui Login / Authentication Blocks and the shadcn Sign-in Design Language (2024–2026)

Primary-source note: The block, component, and theme values below come from the raw source files in the official repo (`shadcn-ui/ui`, `main` branch, `apps/v4/...`), which I downloaded on 2026-10-30. Paths:
- Blocks: `apps/v4/registry/new-york-v4/blocks/login-0N/page.tsx` and `.../components/login-form.tsx` — https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/new-york-v4/blocks
- UI primitives: `apps/v4/registry/new-york-v4/ui/{card,input,button,field,label,separator}.tsx` — https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/new-york-v4/ui
- Theme docs: `apps/v4/content/docs/(root)/theming.mdx` — https://ui.shadcn.com/docs/theming
- Zinc theme: `apps/v4/registry/themes.ts` — https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/themes.ts
- Auth example: `apps/v4/app/(app)/examples/authentication/` — https://ui.shadcn.com/examples/authentication

Tailwind-to-px conversions below assume 1rem = 16px and Tailwind's 0.25rem spacing unit (gap-6 = 24px, p-6 = 24px, p-10 = 40px, h-9 = 36px, max-w-sm = 24rem = 384px, max-w-xs = 20rem = 320px, max-w-4xl = 56rem = 896px). These conversions are my arithmetic, not quoted values.

## Q1. What does each official login block look like (layout, card, image panel, social placement, divider, footer)?

### Takeaway
There are exactly five official login blocks (login-01 to login-05), plus five matching signup blocks (signup-01 to 05). All are monochrome and use only Card, Field, Input, Button, and Separator. Three are centered and two are split. Social buttons go below the email form in 01, 02, 04, and 05, and above it only in login-03. The divider says "Or continue with", or just "Or" in login-05. Blocks 03, 04, and 05 put a muted legal line ("By clicking continue, you agree to our Terms of Service and Privacy Policy.") below the form. The older /examples/authentication page is a split layout with a testimonial quote.

### Cited Findings
**Block index (official descriptions):** login-01 "A simple login form"; login-02 "A two column login page with a cover image"; login-03 "A login page with a muted background color"; login-04 "A login page with form and image"; login-05 "A simple email-only login page". No OTP block is listed in the login section, and Signup has its own category — [ui.shadcn.com/blocks/login](https://ui.shadcn.com/blocks/login). The repo contains `login-01..05` and `signup-01..05` and no other login, OTP, or auth block names — [GitHub registry tree](https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/new-york-v4/blocks)

**login-01: centered card, simple**
- Page: `flex min-h-svh w-full items-center justify-center p-6 md:p-10`, wrapper `w-full max-w-sm` (384px) — [login-01/page.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/blocks/login-01/page.tsx)
- The page uses the default `bg-background` with no muted backdrop. It has no logo.
- The Card holds a CardHeader that is left-aligned by default. CardTitle reads "Login to your account". It has no size override, so it renders at the base size with `leading-none font-semibold`. CardDescription reads "Enter your email below to login to your account".
- Fields: Email (placeholder `m@example.com`). The Password row puts the label on the left and a `ml-auto inline-block text-sm underline-offset-4 hover:underline` "Forgot your password?" link on the right.
- Actions: a primary "Login" button stacked above an **outline** "Login with Google" button, which has no icon. Under them is the centered FieldDescription "Don't have an account? Sign up". It has **no divider** and no legal footer — [login-01/login-form.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/blocks/login-01/components/login-form.tsx)

**login-02: two-column split with a cover image, no card**
- Page: `grid min-h-svh lg:grid-cols-2`. The left column is `flex flex-col gap-4 p-6 md:p-10`. A logo row sits at the top: `flex justify-center gap-2 md:justify-start`, with a 24px `size-6 rounded-md bg-primary text-primary-foreground` icon tile (lucide `GalleryVerticalEnd` at `size-4`) and the text "Acme Inc." in `font-medium`. The form is centered with `flex flex-1 items-center justify-center` inside `w-full max-w-xs` (320px) — [login-02/page.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/blocks/login-02/page.tsx)
- The right column is `relative hidden bg-muted lg:block`, so it shows only at the lg breakpoint (1024px) and up. It holds a full-bleed `<img class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale">`. In dark mode the photo is dimmed to 20% brightness and made grayscale. The image itself is a placeholder.
- Form, with no card: the centered heading block is `flex flex-col items-center gap-1 text-center`. The h1 is `text-2xl font-bold` (24px/700), "Login to your account". The sub-copy is `text-sm text-balance text-muted-foreground`.
- Order: Email, Password with a forgot link, primary Login, `FieldSeparator` "Or continue with", an outline "Login with GitHub" button with an inline GitHub SVG, then "Don't have an account? Sign up" — [login-02/login-form.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/blocks/login-02/components/login-form.tsx)

**login-03: muted page background, centered card, social first**
- Page: `flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10`. The column is `flex w-full max-w-sm flex-col gap-6`. Above the card is a centered logo link (`self-center font-medium`) with the same 24px primary icon tile and "Acme Inc." — [login-03/page.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/blocks/login-03/page.tsx)
- Card: CardHeader is `text-center`. CardTitle is `text-xl` (20px, semibold), "Welcome back". The description is "Login with your Apple or Google account".
- **Social buttons sit above the form.** Two full-width outline buttons, "Login with Apple" and "Login with Google", stack vertically with inline SVG icons. Then comes `FieldSeparator` "Or continue with". Its label gets a card-colored background through `*:data-[slot=field-separator-content]:bg-card`, so the line visually "breaks" on the card surface. Then Email, Password with a forgot link, primary Login, and "Don't have an account? Sign up".
- Below the card: `FieldDescription className="px-6 text-center"` "By clicking continue, you agree to our Terms of Service and Privacy Policy." The links are underlined — [login-03/login-form.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/blocks/login-03/components/login-form.tsx)

**login-04: muted page, wide card split into form and image**
- Page: `flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10`. The wrapper is `w-full max-w-sm md:max-w-4xl` (384px on mobile, 896px from md up) — [login-04/page.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/blocks/login-04/page.tsx)
- Card: `overflow-hidden p-0`. CardContent is `grid p-0 md:grid-cols-2`. The form pane is `p-6 md:p-8` (24px, then 32px). The image pane is `relative hidden bg-muted md:block`, with the same `object-cover dark:brightness-[0.2] dark:grayscale` image. The image is clipped to the card's rounded corners.
- Heading: `flex flex-col items-center gap-2 text-center`. The h1 is `text-2xl font-bold`, "Welcome back". The sub-copy is `text-balance text-muted-foreground` at base size, "Login to your Acme Inc account".
- Order: Email, Password with a forgot link (`underline-offset-2`), primary Login, separator "Or continue with" (with a card background), then a **3-column icon-only row** of outline buttons (`grid grid-cols-3 gap-4`) for Apple, Google, and Meta, with `sr-only` labels. Then "Don't have an account? Sign up". The legal line sits below the card — [login-04/login-form.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/blocks/login-04/components/login-form.tsx)

**login-05: email-only (magic-link style), no card**
- Page: `flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10`, with `max-w-sm` — [login-05/page.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/blocks/login-05/page.tsx)
- Header stack (`flex flex-col items-center gap-2 text-center`): a logo icon (GalleryVerticalEnd at `size-6` inside a `size-8 rounded-md` box with no fill), the h1 `text-xl font-bold` "Welcome to Acme Inc.", then the FieldDescription "Don't have an account? Sign up". **The sign-up link sits at the top.**
- Only an Email field (no password), then a primary Login button, then `FieldSeparator` "**Or**", then a 2-up outline grid (`grid gap-4 sm:grid-cols-2`) with "Continue with Apple" and "Continue with Google". The legal line sits below — [login-05/login-form.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/blocks/login-05/components/login-form.tsx)

**Older/legacy "Authentication" example page (/examples/authentication)**
- Layout: `container ... md:grid lg:max-w-none lg:grid-cols-2 lg:px-0`. A ghost-variant "Login" link button sits at the top right (`absolute top-4 right-4 md:top-8 md:right-8`).
- The left brand panel (lg and up) is `relative hidden h-full flex-col p-10 text-primary lg:flex dark:border-r`, with an overlay `absolute inset-0 bg-primary/5`. The current version uses a very faint primary tint; older versions used a solid dark `bg-zinc-900` panel, which I did not verify in this session. Logo plus "Acme Inc" is `text-lg font-medium` at the top. At the bottom (`mt-auto`) is a testimonial blockquote: "This library has saved me countless hours of work and helped me deliver stunning designs to my clients faster than ever before." – Sofia Davis.
- The right side is a form column `sm:w-[350px]`, `gap-6`. The h1 is `text-2xl font-semibold tracking-tight`, "Create an account". The sub-copy is `text-sm text-muted-foreground`. The form has an email input with a **visually hidden label** (`sr-only`, placeholder `name@example.com`) and a "Sign In with Email" button that shows a spinner while loading. Then come the separator "Or continue with", an outline "GitHub" button, and the legal FieldDescription — [authentication/page.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/app/(app)/examples/authentication/page.tsx); [user-auth-form.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/app/(app)/examples/authentication/components/user-auth-form.tsx)
- On mobile (below md) the example page shows only a static screenshot (`/examples/authentication-light.png` and `-dark.png`) — same source.

**Older (pre-Field component, early-2025) version of the blocks**: The legacy `new-york` registry JSON for login-03 uses `grid gap-6` and `grid gap-2` wrappers with Label and Input, not Field. Its divider is hand-rolled: `relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border`, with label span `relative z-10 bg-background px-2 text-muted-foreground`. Its legal text is `text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary`. The legal text was **text-xs (12px)** in the old version and is **text-sm (14px)** via FieldDescription now — [public/r/styles/new-york/login-03.json](https://github.com/shadcn-ui/ui/blob/main/apps/v4/public/r/styles/new-york/login-03.json)

### Inferences
- The shadcn sign-in idiom is "form first, socials second". Only login-03 leads with social providers, and it is the only one titled "Welcome back" inside a card with a centered header.
- Only two kinds of split appear: a full-viewport 50/50 split (login-02 and the auth example) and a split *inside* a large card on a muted page (login-04). The image or brand panel always sits on the right in the blocks and on the left in the legacy example.
- No official block has a password show/hide toggle, a "remember me" checkbox, OTP, a passkey option, or a "last used" badge. These all come from the community.

### Gaps
- I did not visually verify the rendered blocks. The repo has preview PNGs (`public/r/styles/new-york/login-0N-light.png` and `-dark.png`), but I could not view them in this session.
- The signup-01..05 blocks exist, but I did not inspect them.
- The new create-styles (Vega, Nova, Maia, Lyra, Mira) rewrite component class strings. I did not check how login blocks render under them.

## Q2. Exact styling tokens (card, input, button, label, focus ring, type sizes)

### Takeaway
The current (v4 / new-york-v4) system works out to:
- **36px controls** (`h-9`), `rounded-md` inputs and buttons, and a `rounded-xl` card with a 1px border and `shadow-sm`, padded 24px.
- **14px medium labels**, muted grey sub-copy, and 24px bold headings on cardless layouts (`text-2xl font-bold`) or a 20px or 16px semibold card title.
- A **3px semi-transparent ring** on focus (`ring-[3px] ring-ring/50` plus `border-ring`).

### Cited Findings
**Card** — [card.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/card.tsx)
- Card: `flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm`, which gives 24px vertical padding and a 24px gap between header and content.
- CardHeader: `grid auto-rows-min ... items-start gap-2 px-6`, with an 8px gap between title and description.
- CardTitle: `leading-none font-semibold`, with no font size, so it inherits 16px. The blocks override it to `text-xl` in login-03.
- CardDescription: `text-sm text-muted-foreground`.
- CardContent: `px-6`.

**Input** — [input.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/input.tsx)
- Base: `h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground md:text-sm dark:bg-input/30`
- Focus: `focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50`
- Invalid: `aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40`
- Disabled: `disabled:opacity-50 disabled:cursor-not-allowed`
- Input text is 16px on mobile (to avoid iOS zoom) and 14px from md up. Inputs have a transparent background in light mode and a 30%-opacity `--input` tint in dark mode.

**Button** — [button.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/button.tsx)
- Base: `inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4`. Icons are 16px with an 8px gap.
- `default`: `bg-primary text-primary-foreground hover:bg-primary/90`
- `outline`: `border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50`
- `ghost`: `hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50`
- `link`: `text-primary underline-offset-4 hover:underline`
- Sizes:
  - `default`: `h-9 px-4 py-2 has-[>svg]:px-3` (36px)
  - `sm`: `h-8` (32px)
  - `lg`: `h-10 px-6` (40px)
  - `icon`: `size-9`
- The login blocks use the default size everywhere, so the submit button is 36px tall and full width (via Field's `[&>*]:w-full`).

**Label / FieldLabel** — [label.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/label.tsx); [field.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/field.tsx)
- Label: `flex items-center gap-2 text-sm leading-none font-medium select-none` (14px/500)
- FieldLabel adds `leading-snug`

**Field layout (vertical rhythm)** — [field.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/field.tsx)
- FieldGroup: `flex w-full flex-col gap-7`, which puts **28px between fields**.
- Field (vertical): `flex w-full flex-col gap-3 [&>*]:w-full`, which puts **12px between label and input**. It also stacks Login, the outline button, and the "Sign up" line at 12px apart.
- FieldDescription: `text-sm leading-normal font-normal text-muted-foreground`, with `[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary`. It also has `nth-last-2:-mt-1`, a small negative margin.
- FieldSeparator: `relative -my-2 h-5 text-sm`. Inside it are a 1px `Separator` (`bg-border h-px`) at `top-1/2` and a centered label span `relative mx-auto block w-fit bg-background px-2 text-muted-foreground`. It is a 20px-tall row with the line through the middle and the label masked by the page background, or by the card background when overridden with `bg-card`.
- Older layout (2024 to early 2025): `grid gap-6` between fields and `grid gap-2` between label and input, so 24px and 8px — [legacy login-03.json](https://github.com/shadcn-ui/ui/blob/main/apps/v4/public/r/styles/new-york/login-03.json)

**Typography used in the login blocks** — the block sources above:
- Cardless h1: `text-2xl font-bold` (24px/700) in login-02 and login-04, and `text-xl font-bold` (20px) in login-05.
- Card title: `text-xl` semibold in login-03, or the default 16px semibold in login-01.
- Legacy auth example h1: `text-2xl font-semibold tracking-tight`.
- Sub-copy: `text-sm text-muted-foreground` with `text-balance`. login-04 uses the base size (16px).
- Links: `text-sm underline-offset-4 hover:underline`. Forgot-password links have no underline until hover. "Sign up" and legal links are always underlined.

**Radius** — [Theming docs](https://ui.shadcn.com/docs/theming)
- Default `--radius: 0.625rem` (10px).
- The current derived scale is **multiplicative**: `--radius-sm: calc(var(--radius) * 0.6)`, `--radius-md: * 0.8`, `--radius-lg: var(--radius)`, `--radius-xl: * 1.4`, `--radius-2xl: * 1.8`, `--radius-3xl: * 2.2`, `--radius-4xl: * 2.6`.
- At the default this gives: inputs and buttons (`rounded-md`) = **8px**, card (`rounded-xl`) = **14px**, logo tile (`rounded-md`) = 8px.
- Earlier Tailwind-v4-era docs (2025) used a subtractive scale (`--radius-sm: calc(var(--radius) - 4px)`, `--radius-md: calc(var(--radius) - 2px)`, `--radius-lg: var(--radius)`, `--radius-xl: calc(var(--radius) + 4px)`). That gives md = 8px and xl = 14px at a 10px base, so the result is identical at the default radius. This older formula is from memory and was not re-verified in this session.

**Global base** — [apps/v4/app/globals.css](https://github.com/shadcn-ui/ui/blob/main/apps/v4/app/globals.css)
- `* { @apply border-border outline-ring/50; }`, so every bare `border` uses the `--border` color.

### Inferences
- Plain-CSS recipe for an input:
  `height:36px; padding:4px 12px; border:1px solid var(--input); border-radius:8px; font-size:14px; box-shadow:0 1px 2px 0 rgb(0 0 0 / .05); background:transparent;`
  On `:focus-visible`: `border-color:var(--ring); box-shadow:0 0 0 3px color-mix(in oklch, var(--ring) 50%, transparent);`
  The `shadow-xs` value is Tailwind v4's `0 1px 2px 0 rgb(0 0 0 / 0.05)`. That value is from my knowledge of Tailwind, not quoted from the shadcn source.
- Card recipe: `border-radius:14px; border:1px solid var(--border); background:var(--card); padding:24px 0; box-shadow: shadow-sm`. In Tailwind v4, `shadow-sm` is `0 1px 3px 0 rgb(0 0 0 / .1), 0 1px 2px -1px rgb(0 0 0 / .1)` (also from Tailwind knowledge).

### Gaps
- I did not extract the exact shadow-xs and shadow-sm values from Tailwind v4's source in this session. They are stated above from general knowledge and should be checked against tailwindcss.com/docs/box-shadow.

## Q3. Dark theme color values (neutral default and zinc)

### Takeaway
shadcn v4 uses OKLCH. HSL colors were converted to OKLCH, and the "default" style was deprecated in favor of new-york ([Tailwind v4 changelog, Feb 2025](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/changelog/2025-02-tailwind-v4.mdx)). In dark mode, border and input are **translucent white** (10% and 15%), not solid greys. The card is one step lighter than the background, and primary is near-white.

### Cited Findings
**Default theme (Neutral), from the theming docs "Default Theme CSS"** — [ui.shadcn.com/docs/theming](https://ui.shadcn.com/docs/theming)

| Token | Light | Dark |
|---|---|---|
| --background | oklch(1 0 0) | oklch(0.145 0 0) |
| --foreground | oklch(0.145 0 0) | oklch(0.985 0 0) |
| --card | oklch(1 0 0) | oklch(0.205 0 0) |
| --primary | oklch(0.205 0 0) | oklch(0.922 0 0) |
| --primary-foreground | oklch(0.985 0 0) | oklch(0.205 0 0) |
| --muted | oklch(0.97 0 0) | oklch(0.269 0 0) |
| --muted-foreground | oklch(0.556 0 0) | oklch(0.708 0 0) |
| --accent | oklch(0.97 0 0) | oklch(0.371 0 0)* |
| --border | oklch(0.922 0 0) | oklch(1 0 0 / 10%) |
| --input | oklch(0.922 0 0) | oklch(1 0 0 / 15%) |
| --ring | oklch(0.708 0 0) | oklch(0.556 0 0) |
| --destructive | oklch(0.577 0.245 27.325) | oklch(0.704 0.191 22.216) |
| --radius | 0.625rem | — |

*Accent dark = 0.371 in the shadcn site's own globals.css ([globals.css](https://github.com/shadcn-ui/ui/blob/main/apps/v4/app/globals.css)). The site's globals.css also differs from the docs default in light mode: it sets foreground and primary to pure black `oklch(0% 0 0)`. Use the docs values for the canonical theme.

**Zinc theme (`registry/themes.ts`)** — [themes.ts](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/themes.ts)

| Token | Light | Dark |
|---|---|---|
| background | oklch(1 0 0) | oklch(0.141 0.005 285.823) |
| foreground | oklch(0.141 0.005 285.823) | oklch(0.985 0 0) |
| card | oklch(1 0 0) | oklch(0.21 0.006 285.885) |
| primary | oklch(0.21 0.006 285.885) | oklch(0.92 0.004 286.32) |
| primary-foreground | oklch(0.985 0 0) | oklch(0.21 0.006 285.885) |
| muted / secondary / accent | oklch(0.967 0.001 286.375) | oklch(0.274 0.006 286.033) |
| muted-foreground | oklch(0.552 0.016 285.938) | oklch(0.705 0.015 286.067) |
| border | oklch(0.92 0.004 286.32) | oklch(1 0 0 / 10%) |
| input | oklch(0.92 0.004 286.32) | oklch(1 0 0 / 15%) |
| ring | oklch(0.705 0.015 286.067) | oklch(0.552 0.016 285.938) |
| destructive | oklch(0.577 0.245 27.325) | oklch(0.704 0.191 22.216) |
| radius | 0.625rem | — |

Base colors available now: neutral, stone, zinc, mauve, olive, mist, taupe — [base-colors.ts](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/base-colors.ts)

### Inferences
- Hex approximations: these OKLCH values match the Tailwind v4 palette steps. This is my mapping and should be verified at https://tailwindcss.com/docs/colors.

  | Neutral OKLCH | Tailwind step | Hex |
  |---|---|---|
  | 0.145 | neutral-950 | #0a0a0a |
  | 0.205 | neutral-900 | #171717 |
  | 0.269 | neutral-800 | #262626 |
  | 0.371 | neutral-700 | #404040 |
  | 0.556 | neutral-500 | #737373 |
  | 0.708 | neutral-400 | #a1a1a1 |
  | 0.922 | neutral-200 | #e5e5e5 |
  | 0.97 | neutral-100 | #f5f5f5 |
  | 0.985 | neutral-50 | #fafafa |

  | Zinc OKLCH | Tailwind step | Hex |
  |---|---|---|
  | 0.141 | zinc-950 | #09090b |
  | 0.21 | zinc-900 | #18181b |
  | 0.274 | zinc-800 | #27272a |
  | 0.552 | zinc-500 | #71717b |
  | 0.705 | zinc-400 | #9f9fa9 |
  | 0.92 | zinc-200 | #e4e4e7 |
  | 0.967 | zinc-100 | #f4f4f5 |

  These are the v4 hexes. Tailwind v3's zinc-400 and zinc-500 were #a1a1aa and #71717a.
- In dark mode, inputs and outline buttons use `bg-input/30`, which is white at 15% × 30% ≈ 4.5% over the background. They read as very slightly raised wells.

### Gaps
- I did not compute exact sRGB hex values from the OKLCH. The hexes above are palette-equivalent approximations.

## Q4. Community variations built on shadcn (shadcnblocks, Origin UI, ReUI, shadcn.io, Magic UI): what modern touches they add

### Takeaway
Community auth blocks keep the shadcn primitives and add:
- Atmosphere: masked or animated grid and dot backgrounds, gradients, photo backdrops, and blueprint frames with plus-mark corners.
- Social proof: testimonial or carousel sidebars, customer logo walls, and Trustpilot panels.
- Modern auth methods: magic link, passkey or WebAuthn, SAML SSO pickers, OTP dialogs, and "last used" badges.
- Small usability touches: a password show/hide toggle and "remember me".

### Cited Findings
- **shadcn's own Dec 2025 pivot:** `npx shadcn create` introduced five visual styles, framed as a response to the fact that "all apps started looking the same":
  - Vega: classic shadcn
  - Nova: reduced padding
  - Maia: soft and rounded, with generous spacing
  - Lyra: boxy and sharp, pairs with mono fonts
  - Mira: compact, dense

  Users also choose Radix or Base UI, icons, base color, and fonts — [changelog 2025-12-shadcn-create](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/changelog/2025-12-shadcn-create.mdx)
- **ReUI (reui.io) auth-1..20:**
  - auth-1 is a split screen with a "masked animated grid" whose squares light up around the form but not under it, plus a full-height editorial photo and a password show/hide toggle.
  - auth-2 has an autoplaying founder testimonial carousel and a Trustpilot rating panel.
  - auth-3 is a magic link with a testimonial and trust-brand sidebar on a dot-grid background.
  - auth-5 has an animated gradient background.
  - auth-7 is a "blueprint-framed" passwordless card with customer trust logos.
  - auth-8 is a centered card over a softened photo backdrop.
  - auth-9 has an animated brand-logo grid and a rotating testimonial.
  - auth-10 has a customer logo wall.
  - auth-12 is a split method picker with **passkey and SAML SSO**.
  - auth-16 has an app header, an SSO + "work email continue" form, and a logo strip.
  - auth-17 is a centered method picker with **WebAuthn passkey** and an email reveal step.
  - auth-19 is invite-only workspace sign-in.

  — [reui.io/blocks/application/auth/auth-1](https://reui.io/blocks/application/auth/auth-1)
- **shadcnblocks.com** login category: Login 1–9. These include "Minimal email and password", "Borderless centered", "Login with social provider buttons", "muted card and social buttons", "Google-first login with a divider", "Card login with Google and credentials", and "Social login with an email option". The site has separate categories for **Passkey, Two Factor, and Magic Link** — [shadcnblocks.com/blocks/login](https://www.shadcnblocks.com/blocks/login)
- **shadcn.io (unofficial) "Login Full Viewport":**
  - There is no card. The form is centered in a band between two full-width horizontal rules, with vertical side rails and **"+" marks where the rules meet the rails** (the blueprint/Vercel-style frame).
  - A static dot pattern sits at 10% foreground opacity, masked clear in the middle and faded toward the rows.
  - The top row has a logo plus "New to X? Create an account". The footer row has Terms, Privacy, Help, and a language picker.
  - It uses a "Shine Button" for the primary CTA.

  Sibling blocks include "Login Dark Side Panel" (a testimonial sidebar) and "Login Carousel Testimonials" — [shadcn.io/blocks/login-full-viewport](https://www.shadcn.io/blocks/login-full-viewport); [login-carousel-testimonials](https://www.shadcn.io/blocks/login-carousel-testimonials); [login-testimonial-sidebar](https://www.shadcn.io/blocks/login-testimonial-sidebar)
- **Origin UI** (now distributed via the 21st.dev registry):
  - A **Sign-in dialog**: a modal with email, a "Remember me" checkbox, a forgot-password link, and a Google button.
  - A separate **OTP dialog** built on the `input-otp` library, with an error message and a "Resend code" link.
  - A sign-up dialog.

  — [21st.dev originui sign-in-dialog](https://21st.dev/@originui/components/dialog/sign-in-dialog); [otp-dialog](https://21st.dev/@originui/components/dialog/otp-dialog). shadcn itself added an InputOTP component in March 2024 — [changelog 2024-03-breadcrumb-otp](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/changelog/2024-03-breadcrumb-otp.mdx). I saw that changelog filename but did not read the file.
- **"Last used" badge:**
  - It is not in official shadcn.
  - Better Auth UI ships a shadcn-registry item, `last-login-method`, that adds a localized last-used indicator to email and social sign-in methods — [better-auth-ui.com/r/last-login-method.json](https://better-auth-ui.com/r/last-login-method.json)
  - shadcn.io has a Svelte "login social buttons" block with a badge that follows the last-pressed provider row — [shadcn.io/blocks/svelte/login-social-buttons](https://www.shadcn.io/blocks/svelte/login-social-buttons)
  - A DEV tutorial stores the method in localStorage — [dev.to](https://dev.to/stephengade/adding-a-last-used-badge-to-your-website-login-page-43c5)
- **Other shadcn-based split and testimonial auth pages:** shadcn/studio has a two-column split with social buttons, a form, and a testimonial card — [shadcnstudio.com](https://shadcnstudio.com/blocks/marketing-ui/login-page). Creative Tim has authentication blocks with social buttons — [creative-tim.com](https://www.creative-tim.com/ui/blocks/marketing-presentation/authentication)

### Inferences
- Common modern recipe on top of shadcn primitives:
  - Layout: either a centered 384px column on a subtle masked dot or grid background (radial-gradient dots, with a radial mask fading to transparent at the edges), or a 50/50 split with a testimonial or logo-wall brand panel.
  - Sign-in methods: a social-first or method-picker layout (Google, GitHub, passkey, SSO), then "Or", then email with magic link or password. A "Last used" pill sits on the last provider.
  - Footer: an underlined legal line.
- The "blueprint frame" (hairline rules with + corner marks) and masked grids are the main 2025–26 visual signature beyond the stock blocks.

### Gaps
- **Magic UI:** I did not retrieve any of its auth templates. It is best known for effect components (dot and grid patterns, shine borders, marquees), but I found no confirmed login template details.
- **Community block values:** I did not get concrete CSS (dot size, spacing, mask) for the community blocks. The pages describe them in prose only, and the code is mostly behind Pro paywalls (shadcn.io "Part of Pro"; shadcnblocks Pro).
- **Origin UI's site:** coss.com/origin/sign-in returned 404. Origin UI's current canonical home was not confirmed beyond 21st.dev mirrors.
