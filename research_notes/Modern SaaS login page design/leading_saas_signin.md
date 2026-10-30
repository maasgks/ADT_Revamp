# Leading SaaS sign-in screen design (Linear, Vercel, Stripe, Clerk, Supabase, Raycast, Resend, Notion, Figma, Cal.com), 2024–2026

Method note (read first): Researched 2026-10-30. Most live login pages are client-rendered, so the fetch tool returned only a loading shell for Linear ("Loading…"), Supabase ("Taking longer than expected?…"), and Notion ("Notion"). Stripe returned an "Incompatible browser" notice. Text content was retrieved for Vercel, Resend and Cal.com. Supabase's layout was retrieved from its open-source React code (exact Tailwind classes). Clerk's design was retrieved from its docs. Visual details (colours, glows, radii) for Linear, Stripe, Notion, Figma and Raycast could not be confirmed from a primary or gallery source, and are listed under Gaps as unverified recollections. Gallery pages (Lazyweb, SaaSFrame) hold screenshots as images only, which the text fetcher cannot read.

## Per-product descriptions

### Takeaway
Where the pages could be read, every product uses one narrow column of full-width "Continue with X" / "Log in with X" buttons and a short "Log in to {Product}" heading. Social/SSO options come before or alongside email. Sign-up is a single inline link. Terms text is a tiny muted line. Supabase is the clearest example of a split screen (a form column plus a testimonial panel shown only on very wide screens).

### Cited Findings
**Vercel (vercel.com/login), text retrieved Oct 2026**
- Heading: "Log in to Vercel". Page title: "Login – Vercel". — [vercel.com/login](https://vercel.com/login)
- Auth options in page order: "Continue with Email", "Continue with Google", "Continue with GitHub", "Continue with ChatGPT", "Continue with SAML SSO", "Continue with Passkey", followed by a "Show other options" link (this likely reveals GitLab/Bitbucket, which were absent from the default list). — [vercel.com/login](https://vercel.com/login)
- Sign-up appears in two places: a "Sign Up" link in the top-right header and "Don't have an account? Sign Up" at the bottom of the form. There are "Terms" and "Privacy Policy" links. — [vercel.com/login](https://vercel.com/login)
- No "last used" label appeared in the logged-out, server-delivered content. Such a label may depend on a cookie or local state. — [vercel.com/login](https://vercel.com/login)

**Resend (resend.com/login), text retrieved Oct 2026**
- Heading: "Log in to Resend". The sub-copy directly under the heading is "Don't have an account? Sign up.", so the sign-up link sits at the top, not in the footer. — [resend.com/login](https://resend.com/login)
- Order: "Log in with Google", "Log in with GitHub", an "or" divider, then an Email + Password form ("Forgot your password?" link) and a "Log In" submit button. — [resend.com/login](https://resend.com/login)
- Footer: "By signing in, you agree to our Terms and Privacy Policy." — [resend.com/login](https://resend.com/login)

**Cal.com (app.cal.com/auth/login), text retrieved Oct 2026**
- The heading area shows the brand ("Cal.com") with welcome-back sub-copy (the fetcher paraphrased it as "Welcome back! Sign in to continue", so exact wording is unconfirmed). — [app.cal.com/auth/login](https://app.cal.com/auth/login)
- Order: "Sign in with Google", "Sign in with Microsoft", an "or" divider, Email + Password (a short "Forgot?" link sits inline beside the password field), a "Continue" submit button, then a separate "Sign in with SAML/OIDC" link near the "Create account" link. — [app.cal.com/auth/login](https://app.cal.com/auth/login)
- No terms text was detected. There is a PWA "add to home screen" prompt with "Dismiss". — [app.cal.com/auth/login](https://app.cal.com/auth/login)

**Supabase (supabase.com/dashboard/sign-in), structure from open-source code**
- Outer wrapper: `min-h-screen`, `bg-alternative`. An absolutely positioned top nav holds the logo (24px tall by default, 48px when a flag is on; dark and light SVG variants) on the left and a Docs button on the right (`hidden md:flex`). — [SignInLayout.tsx](https://raw.githubusercontent.com/supabase/supabase/master/apps/studio/components/layouts/SignInLayout/SignInLayout.tsx)
- Split screen: the form column (`bg-studio border-r shadow-lg`) has an inner width of **330px, or 384px from the sm breakpoint up** (`w-[330px] sm:w-[384px]`) and is vertically centred. The form sits directly on the column background, with no card. — [SignInLayout.tsx](https://raw.githubusercontent.com/supabase/supabase/master/apps/studio/components/layouts/SignInLayout/SignInLayout.tsx)
- Heading: h1 at `lg:text-3xl` with `mb-2`. Sub-heading: `text-sm text-foreground-light` (muted). The block has `mb-10` below it. — [SignInLayout.tsx](https://raw.githubusercontent.com/supabase/supabase/master/apps/studio/components/layouts/SignInLayout/SignInLayout.tsx)
- Right panel (only at xl, `hidden xl:flex`): a large `text-3xl` blockquote of a randomly chosen customer tweet. Behind it is a decorative 160px quote mark at 30% opacity. Below it sits a 48px round avatar and an @handle in muted medium weight. — [SignInLayout.tsx](https://raw.githubusercontent.com/supabase/supabase/master/apps/studio/components/layouts/SignInLayout/SignInLayout.tsx)
- Terms footer: centred, `text-xs text-foreground-lighter`, `text-balance`, max-w-sm. Its text says that by continuing, the user agrees to the ToS and Privacy Policy. — [SignInLayout.tsx](https://raw.githubusercontent.com/supabase/supabase/master/apps/studio/components/layouts/SignInLayout/SignInLayout.tsx)
- Supabase brand context: the marketing site is described as charcoal backgrounds with signature green #3ECF8E. — [SaaSFrame](https://www.saasframe.io/examples/supabase-landing-page)

**Linear (linear.app/login)**
- The login screen offers Continue with Google, email, SAML SSO and passkey sign-in (Lazyweb flow, updated May 2026; screenshots dated 2026-02 and 2026-05). — [Lazyweb](https://www.lazyweb.com/canvas/flows/linear/sign-in)
- "Continue with Email" sends a login link **and** a code. The user can click the link or paste the code into an "Enter code" field, so Linear uses magic link/OTP and no password. — [Linear docs](https://linear.app/docs/login-methods)
- Passkeys were added in May 2024 "in addition to email and SSO options". — [Linear changelog](https://linear.app/changelog/2024-05-30-passkeys-a-fast-and-secure-way-to-log-in-to-linear)

**Clerk `<SignIn/>` (reference implementation)**
- Default variables: `borderRadius: 0.375rem` (6px), `fontSize: 0.8125rem` (13px), `spacing: 1rem`, `fontFamily: inherit`, and font weights 400/500/600/700. The available colour tokens are colorPrimary, colorPrimaryForeground, colorBackground, colorForeground, colorMuted, colorMutedForeground, colorInput, colorInputForeground, colorBorder, colorRing, colorShadow, colorDanger, colorSuccess, colorWarning, colorNeutral, colorModalBackdrop and colorShimmer. Defaults for the colour tokens are not documented on that page. — [Clerk variables](https://clerk.com/docs/react/guides/customizing-clerk/appearance-prop/variables.md)
- Layout defaults: `socialButtonsPlacement: 'top'` (social buttons above the email form by default). `socialButtonsVariant: 'auto'` gives full-width block buttons with fewer than 3 providers and a row of icon buttons with 3 or more. `logoPlacement: 'inside'` (logo inside the card). `animations: true`. `termsPageUrl`/`privacyPageUrl` render links. — [Clerk layout](https://clerk.com/docs/react/guides/customizing-clerk/appearance-prop/layout.md)
- A "Last used" sign-in method badge shipped on 2025-09-12. It is automatic for new apps and opt-in for existing ones. — [Clerk changelog](https://clerk.com/changelog/2025-09-12-last-used-sign-in)
- A later PR restricted the badge to sign-in only, so it no longer appears on sign-up (`showLastAuthenticationStrategy`). Custom flows read `client.lastAuthenticationStrategy` and show a badge beside the matching OAuth button. — [GitHub PR #7100](https://github.com/clerk/javascript/pull/7100); [Clerk docs](https://clerk.com/docs/guides/development/custom-flows/authentication/last-authentication-strategy)

**Stripe, Notion, Figma, Raycast**
- Stripe dashboard login could not be rendered: the fetcher got "Incompatible browser". The page title is "Stripe Login | Sign in to the Stripe Dashboard". — [dashboard.stripe.com/login](https://dashboard.stripe.com/login)
- Notion's /login now 301-redirects to app.notion.com/login, which is client-rendered. — [notion.so/login](https://www.notion.so/login)
- Raycast has a captured "log in with Google" flow on Lazyweb, but the screenshot content was not readable. — [Lazyweb](https://lazyweb.com/canvas/flows/raycast/log-in-with-google)

### Inferences
- Heading convention: "Log in to {Product}" (Vercel, Resend) is the dominant form of the h1. It is short and verb-first, with no marketing copy.
- Button label convention: "Continue with X" (Vercel, Linear) is the modern default because one screen serves both sign-in and sign-up. "Log in with X" (Resend) and "Sign in with X" (Cal.com) are the alternatives.
- Vercel puts email first but uses the same "Continue with" button style for every method. Email is just one option among equals, and its fields only appear after the button is clicked (progressive disclosure). Linear does the same. Resend and Cal.com show the email/password fields inline below an "or" divider.

### Gaps
- Visual details for Linear, Stripe, Notion, Figma and Raycast could not be verified. The following are **unverified recollections (pre-2025) that need a screenshot check**. Linear: a dark near-black page with no card, a centred logo mark, a "Log in to Linear" heading, and stacked full-width buttons (a white/light primary Google button, then secondary dark buttons). Stripe: a light page with a white card on a soft grey background, the Stripe wordmark above it, email + password fields, a blurple (#635BFF) primary button, and "Sign in with Google" and passkey/SSO options. Notion: a light, white page, large bold "Think it. Make it." / "Log in to your Notion account" style copy, stacked Google/Apple/Microsoft/passkey/SSO buttons, then an email field with a "Continue" button. Figma: a light modal-like card with Google first, then email/password. Raycast: dark, with an app-icon logo.
- No confirmed px values for input/button heights, focus-ring styles, background grid/glow treatments, or loading-state animations were found for any product.
- Cal.com's exact sub-copy wording is unconfirmed (the fetcher paraphrased it).

## Cross-product synthesis: what makes these screens feel "modern"

### Takeaway
The confirmed shared patterns are these:
- One narrow centred column (Supabase: 330–384px), usually with no card; Clerk is the exception and keeps a card by default.
- Full-width provider buttons placed above an "or" divider, or a full list of "Continue with" buttons.
- Passwordless options: magic link/OTP, passkeys, SAML SSO.
- A short "Log in to X" heading with muted sub-copy.
- A sign-up link as one inline sentence.
- A tiny muted terms line.
- An optional "Last used" badge.

### Cited Findings
- Layout: the form column is about 330–384px wide, is vertically centred, and sits on the page/column background without a card. An optional social-proof panel appears only on very wide screens. — [Supabase SignInLayout.tsx](https://raw.githubusercontent.com/supabase/supabase/master/apps/studio/components/layouts/SignInLayout/SignInLayout.tsx)
- Social buttons come first by default in the reference component (`socialButtonsPlacement: 'top'`). They switch to compact icon buttons when there are 3 or more providers. — [Clerk layout](https://clerk.com/docs/react/guides/customizing-clerk/appearance-prop/layout.md)
- Social-first order with an "or" divider before email/password: Resend (Google, GitHub) and Cal.com (Google, Microsoft). — [Resend](https://resend.com/login); [Cal.com](https://app.cal.com/auth/login)
- A list of equal "Continue with …" buttons that includes Passkey and SAML SSO, with an overflow link ("Show other options"): Vercel. — [Vercel](https://vercel.com/login)
- Passwordless: Linear uses a magic link + code and passkeys with no password. Vercel lists passkeys as a first-class option. — [Linear docs](https://linear.app/docs/login-methods); [Linear changelog](https://linear.app/changelog/2024-05-30-passkeys-a-fast-and-secure-way-to-log-in-to-linear); [Vercel](https://vercel.com/login)
- "Last used" indicator: a badge on the previously used method, shown on sign-in only. — [Clerk changelog](https://clerk.com/changelog/2025-09-12-last-used-sign-in); [PR #7100](https://github.com/clerk/javascript/pull/7100)
- Typography: the h1 is about 30px (`text-3xl`) on desktop, the sub-copy is 14px muted (`text-sm text-foreground-light`), there is a generous 40px gap before the form, and the terms line is 12px in a lighter muted colour. The logo is small (24px) in the top-left corner, not above the form. — [Supabase](https://raw.githubusercontent.com/supabase/supabase/master/apps/studio/components/layouts/SignInLayout/SignInLayout.tsx)
- Compact density in the reference component: 13px base font and a 6px radius. — [Clerk variables](https://clerk.com/docs/react/guides/customizing-clerk/appearance-prop/variables.md)
- Animations are enabled by default in Clerk components (`animations: true`). — [Clerk layout](https://clerk.com/docs/react/guides/customizing-clerk/appearance-prop/layout.md)
- Footer: "By signing in, you agree to our Terms and Privacy Policy." (Resend), with a similar line on Supabase. The sign-up link is either the sub-copy directly under the heading (Resend) or a line below the form plus a header link (Vercel). — [Resend](https://resend.com/login); [Vercel](https://vercel.com/login)
- Dev-tool brands skew dark (Linear, Vercel, Supabase marketing), while finance products skew light. This is opinion from marketing-site roundups, not from login-page analysis. — [saasui.design](https://www.saasui.design/blog/7-saas-ui-design-trends-2026); [SaaSFrame](https://www.saasframe.io/examples/supabase-landing-page)

### Inferences
Spec-ready recommendations, inferred from the patterns above:
- **Layout:** a centred column of about 360–400px with the logo above it or in a corner. Use no card, or a very subtle one, on a plain background with at most a faint radial glow. A split screen is optional and should only show a side panel (testimonial or product image) at xl widths.
- **Heading and copy:** h1 "Log in to {Product}" at about 24–30px in semibold. One muted 14px sub-line can carry the "Don't have an account? Sign up" link.
- **Auth order:** for an enterprise HR/EOR product, put SSO/Google/Microsoft first as full-width "Continue with …" buttons, then an "or" divider, then email. Use a "Continue" step for progressive disclosure (email first, then a password or code step). Add a passkey button and a "Last used" pill badge on the remembered method.
- **Inputs and buttons:** compact controls (about 36–40px tall, 6–8px radius, 1px neutral border, a visible focus ring from a ring token). Make the primary button full-width and high-contrast monochrome: black on light or white on dark.
- **Micro-interactions:** subtle transitions, with a spinner or disabled state on the submit button while it works.
- **Footer:** a 12px muted, centred terms/privacy sentence.
- These numbers are **inferred** design norms, not measured values. Only the Supabase widths/type sizes and the Clerk radius/font size are sourced.

### Gaps
- No sources found with measured input/button heights, focus-ring specs, or loading-state behaviour for any of the 10 products. Capturing screenshots via a real browser (or Mobbin/Refero with a login) is needed.
- No confirmed evidence of background treatments (grid, dots, noise, glow) on any of these login pages specifically.
- Figma, Notion, Stripe, Raycast and Linear visuals remain unverified (see the per-product Gaps above).
