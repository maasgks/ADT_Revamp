# Strip the card, sharpen the ink

Modern SaaS sign-in pages in 2024–2026 are built from a small set of quiet parts. There is one narrow form column, about **330–384px** wide, and it usually sits straight on the page surface with no floating card. Above it is a short heading of the "Log in to {Product}" kind. Full-width "Continue with X" buttons come with an "or" divider. Controls are compact, with 8–10px corners, and there is a muted one-line terms notice. When a split layout is used, the brand panel is dark and textured with a faded grid or dot pattern, a soft spotlight and grain. It carries a value statement or social proof, never a stock photo. shadcn/ui's five official login blocks, Supabase's open-source sign-in layout and Clerk's defaults all confirm this pattern in their source code. Vercel, Resend and Cal.com confirm it in their live page text. The HR/EOR players, such as Deel, Rippling, Remote and Personio, set themselves apart in the auth flow rather than in visuals. They use email-first progressive disclosure, tenant-controlled method lists and SSO routing by email domain. None of the inspectable HR login pages show compliance badges. For ADT, the current page already uses the right skeleton: a dark split screen with Inter. It looks dated for four reasons: the floating 24px-radius white card, the pill buttons, the "Welcome back" double-greeting, and the pre-filled credentials. The redesign below keeps the #1a1a1a ink palette and Inter. It replaces the card with a full-height cardless form pane, moves Google (plus Microsoft) above the form, upgrades the brand panel to a masked grid with a spotlight and grain, and meets WCAG 2.2 AA throughout. Every contrast ratio below was computed, not estimated.

A note on evidence: most live login pages render on the client, so text fetchers saw only loading shells. Visual details for **Linear, Stripe, Notion, Raycast, Deel, Rippling, Remote and Multiplier could not be verified** in this research. Everything said about those products below concerns auth flows documented in help centres and changelogs, not their pixels. The spec in the final section labels each item as **[Sourced]** or **[Recommendation]**.

## shadcn's five blocks codify "form first, quiet chrome"

There are exactly five official shadcn/ui login blocks, login-01 to login-05, and all of them are monochrome. Each is assembled only from Card, Field, Input, Button and Separator ([shadcn blocks](https://ui.shadcn.com/blocks/login); [registry](https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/new-york-v4/blocks)):

- **login-01, login-03 and login-05** are centred.
- **login-02** is a full-viewport 50/50 split. The form sits on the left with **no card**, and a cover image fills the right. The image only appears at 1024px and up, and in dark mode it is dimmed to `brightness-[0.2] grayscale` ([login-02](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/blocks/login-02/page.tsx)).
- **login-04** puts the split inside a single 896px card on a muted page.

Four of the five place social buttons *below* the email form, behind an "Or continue with" divider. Only login-03 leads with Apple and Google ([login-03](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/blocks/login-03/components/login-form.tsx)). With three providers, login-04 collapses them into an icon-only 3-column row with `sr-only` labels ([login-04](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/blocks/login-04/components/login-form.tsx)). None of the official blocks includes a password reveal, "remember me", OTP or a passkey button. Those come from community libraries.

The component tokens are where shadcn's "modern" feel actually lives:

- **Controls.** Inputs and buttons are **36px tall** (`h-9`) with an **8px radius**. Inputs use a 1px border and a `shadow-xs`, have a transparent fill in light mode, and use a 4.5% white tint (`bg-input/30`) in dark mode ([input.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/input.tsx)).
- **Focus.** Focus is a **3px semi-transparent ring** plus a border colour change: `focus-visible:border-ring ring-[3px] ring-ring/50`.
- **Labels.** Labels are 14px/500.
- **Spacing.** The newer Field component puts **28px between fields and 12px between label and input** ([field.tsx](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/field.tsx)).
- **Headings.** On cardless layouts the heading is `text-2xl font-bold` (24px/700). Card titles are 20px semibold.
- **Radius scale.** The radius scale is multiplicative from a 10px base: `rounded-md` = 8px and `rounded-xl` = 14px ([theming](https://ui.shadcn.com/docs/theming)).
- **Dark theme.** The neutral dark theme makes borders and inputs translucent white (`oklch(1 0 0 / 10%)` and `15%`) rather than solid grey. Cards sit one step above the background (oklch 0.205 vs 0.145, roughly #171717 vs #0a0a0a), and primary flips to near-white.

Even shadcn now acknowledges that this look has become ubiquitous. In December 2025 it introduced five alternative visual styles (Vega, Nova, Maia, Lyra, Mira), framed as a response to the complaint that "all apps started looking the same" ([shadcn create changelog](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/changelog/2025-12-shadcn-create.mdx)).

Community blocks add atmosphere on top of these primitives. ReUI's auth set includes a split screen with a **masked animated grid**, testimonial carousels, a "blueprint-framed" passwordless card, and method pickers with **passkey and SAML SSO** ([ReUI auth-1](https://reui.io/blocks/application/auth/auth-1)). shadcn.io's full-viewport login drops the card entirely. It frames the form with hairline rules and "+" corner marks over a 10%-opacity dot field that is masked clear behind the form ([shadcn.io](https://www.shadcn.io/blocks/login-full-viewport)). That blueprint frame and the masked grid are the clearest 2025–26 visual signatures beyond the stock blocks. ADT's existing faint corner-bracket pattern is an early, weaker version of the same idea.

## Leading products converge on one narrow column and provider buttons first

Where the live pages could be read, the leading dev-tool products share one idiom.

| Product | Heading | Method order | Sign-up link | Terms line |
|---|---|---|---|---|
| Vercel | "Log in to Vercel" | A stack of equal "Continue with …" buttons: Email, Google, GitHub, ChatGPT, SAML SSO, Passkey, then "Show other options" | Top-right header and below the form | Yes |
| Resend | "Log in to Resend" | Google, GitHub, then "or", then email and password | Directly under the heading | "By signing in, you agree to our Terms and Privacy Policy." |
| Cal.com | Brand name with welcome-back sub-copy | Google, Microsoft, then "or", then email and password with an inline "Forgot?" link, then a "Continue" button | Near the SAML/OIDC link | Not detected |
| Linear | (not verified) | Email magic link plus code, passkeys, Google, SAML SSO; no password | (not verified) | (not verified) |

Sources: [Vercel](https://vercel.com/login), [Resend](https://resend.com/login), [Cal.com](https://app.cal.com/auth/login), [Linear docs](https://linear.app/docs/login-methods), [Linear passkeys](https://linear.app/changelog/2024-05-30-passkeys-a-fast-and-secure-way-to-log-in-to-linear).

**Supabase** is the best-documented split screen because its code is open source ([SignInLayout.tsx](https://raw.githubusercontent.com/supabase/supabase/master/apps/studio/components/layouts/SignInLayout/SignInLayout.tsx)):

- **Form column.** The form is **330px wide, rising to 384px at the sm breakpoint and up**. It sits directly on a column background with a right border, and there is no card.
- **Logo.** The logo is 24px tall and sits top-left, not above the form.
- **Type.** The h1 is `text-3xl` (about 30px). The sub-copy is 14px and muted, and there is a 40px gap before the form. The terms line is 12px.
- **Right panel.** The right panel holds a single large customer quote with an avatar. It appears only at the xl breakpoint and up.

**Clerk**, a widely embedded reference component, defaults to the following ([Clerk layout](https://clerk.com/docs/react/guides/customizing-clerk/appearance-prop/layout.md); [Clerk variables](https://clerk.com/docs/react/guides/customizing-clerk/appearance-prop/variables.md)):

- **Placement.** `socialButtonsPlacement: 'top'`.
- **Button shape.** Full-width buttons when there are fewer than three providers, and icon buttons for three or more.
- **Density and motion.** A **6px radius and 13px base font**, with `animations: true`.
- **"Last used" badge.** In September 2025 Clerk shipped a "Last used" badge on the previously used method. It is restricted to sign-in only ([Clerk changelog](https://clerk.com/changelog/2025-09-12-last-used-sign-in); [PR #7100](https://github.com/clerk/javascript/pull/7100)).

Three patterns follow from this evidence:

- **Social placement is contested.** shadcn's stock blocks put social last. Clerk, Resend and Cal.com, which ship to large real user bases, put providers first. Production products lean toward providers first.
- **"Welcome back" is not the dominant headline.** Product-named, verb-first headings dominate.
- **Cards are optional at best.** Supabase, Vercel-style pages, login-02 and login-05 are all cardless. The card survives mainly in embeddable widgets like Clerk, which have to float over a host page.

The Linear observation is about its theming system, not its login screen. Linear's March 2024 redesign raised contrast in both themes and moved its theme generator from HSL to **LCH for perceptually uniform neutrals** ([Linear changelog](https://linear.app/changelog/2024-03-20-new-linear-ui); [Linear blog](https://linear.app/blog/how-we-redesigned-the-linear-ui)). This supports building ADT's greys as a deliberate ramp rather than ad-hoc hex values.

## HR and EOR platforms compete on flow, not polish

The HR/EOR evidence is thinner. Deel, Rippling, Remote, Multiplier, Oyster, Gusto, Personio and HiBob all render on the client or sit behind bot protection, so their visual layouts could not be observed. What is documented is the auth flow.

**Deel**

- The page shows "Log in / Choose a method to log in / Or / Email", plus a "Having trouble logging in?" menu that includes "I can't log in with SSO" ([Deel](https://app.deel.com/login?lang=en)).
- Admins can **enforce SSO by role or group**. Each org gets its own SSO login link, and password login is kept as an admin fallback ([Deel help](https://help.letsdeel.com/hc/en-gb/articles/20955980375313-How-to-Configure-Single-Sign-On)).

**Rippling**

- The flow is **email, then "Confirm", then password, then 2FA** ([help article](https://finni.help.usepylon.com/articles/8672745517-how-to-sign-in-on-ripping-via-web-browser)).

**Remote**

- SSO runs through Okta or Google Workspace on a domain verified by a DNS TXT record ([Remote help](https://support.remote.com/hc/en-us/articles/5327685530765)).

**Personio**

- Several methods can be enabled at once.
- The **SSO button label is customisable** ([Personio FAQ](https://support.personio.de/hc/en-us/articles/28339886661405-Frequently-asked-questions-on-single-sign-on-SSO-in-Personio)).

The common model across these four is identifier-first progressive disclosure, with SSO detected from the email domain rather than offered as a generic button.

The server-rendered HR pages show what dated looks like:

- **Keka (2026 assets).** Keka pairs "Login to Keka" and a Continue button with "Continue with Mobile / Microsoft / Google / Username". **Microsoft comes before Google**, which suits enterprise and Indian customers. But the visual panel is a **generic beach-and-rowboat stock photo** with app-store badges ([Keka](https://app.keka.com/); [image](https://cdn.keka.com/login/v/2026/images/login-image.jpg)).
- **BambooHR.** BambooHR still makes users type their company subdomain ([BambooHR](https://bamboohr.com/login)).
- **Zoho.** Zoho lists more than ten federated providers ([Zoho](https://accounts.zoho.com/signin?servicename=zohopeople)).
- **greytHR.** greytHR's login still centres on rotating feature and compliance cards, a design that dates to 2017 ([greytHR](https://www.greythr.com/blog/with-greythrs-all-new-interactive-trial-and-improved-support-you-are-in-control/)).

A raw-HTML scan for "SOC 2" and "ISO 27001" on the Keka, BambooHR, HiBob, Remote and Multiplier login URLs found **no matches**. That result is inconclusive for pages that render on the client. Even so, among the HR login pages that could be inspected, none carries compliance signalling.

For ADT this creates an opening. In the HR category, a monochrome, typographic, cardless page with a restrained trust line would look closer to Vercel than to its direct peers. The strongest evidence-backed functional gap is **Microsoft sign-in next to Google**, because HR buyers often run on Microsoft Entra ID.

## Accessibility and motion rules put hard numbers on "modern"

The usability guidance is specific ([web.dev](https://web.dev/articles/sign-in-form-best-practices); [GOV.UK password input](https://design-system.service.gov.uk/components/password-input/)):

- **Labels.** Labels sit above the inputs, never as placeholders.
- **Email input.** Use `type="email" autocomplete="username"`. Add `webauthn` to the autocomplete value when passkeys are offered ([passkey autofill](https://web.dev/articles/passkey-form-autofill)).
- **Password input.** Use `autocomplete="current-password"`, `spellcheck="false"` and `autocapitalize="off"`, and **no `maxlength`**.
- **Show/hide toggle.** The toggle is a `type="button"`, so it does not submit the form.
- **Paste.** Never block paste.
- **Submit button.** The submit button should say "Sign in", not "Submit". It may be disabled after the first click, but **not while fields are empty**.
- **Failed sign-in.** Show a generic error that does not reveal which field was wrong, and clear the password field.
- **Show-password evidence.** Baymard recommends a show-password feature, because masking hides typos ([Baymard](https://baymard.com/guidelines/665-show-password-feature)).
- **Single-step vs two-step.** web.dev favours a single-page form. If two steps are used, it recommends keeping them in one `<form>`. An email-first flow is only worth it if ADT routes SSO by domain.

**WCAG 2.2 sets the numeric floors:**

- **Text.** 4.5:1 for normal text and 3:1 for large text.
- **Non-text contrast (1.4.11).** 3:1 for anything that identifies a control or its state, including focus indicators. A field border needs 3:1 only when nothing else, such as a visible label, identifies the field ([W3C 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)).
- **Focus Appearance (2.4.13, AAA).** The indicator must have the area of a 2px perimeter and show a 3:1 change between its focused and unfocused states ([W3C 2.4.13](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)).
- **Target size (2.5.8).** At least 24×24px. web.dev recommends 44–48px for touch ([W3C 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)).
- **Accessible Authentication (3.3.8).** Blocking paste or autofill fails. **Passkeys and OS biometrics are a compliant non-cognitive route** ([W3C 3.3.8](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html)).

On a #1a1a1a surface, computed ratios show the following:

- **Body text.** #737373 fails for body text at 3.67:1. #8a8a8a is the floor at 5.04:1.
- **Hairline borders.** The fashionable #333 or #404040 hairlines reach only 1.4–1.7:1. They are acceptable only because labels identify the fields.

The motion guidance is equally concrete ([Emil Kowalski](https://emilkowal.ski/ui/great-animations)):

- Keep UI animation **under 300ms** and use **ease-out**.
- Animate only `transform` and `opacity`.
- Use interruptible CSS transitions.
- Honour `prefers-reduced-motion` by swapping motion for fades or nothing.

The background vocabulary used by Vercel, Linear, Magic UI and Aceternity is:

- **Masked grids and dots.** Grid or dot patterns faded with a radial `mask-image`.
- **Grain.** An `feTurbulence` grain layer (`baseFrequency='0.65' numOctaves='3'`) to kill gradient banding ([CSS-Tricks](https://css-tricks.com/grainy-gradients/)).
- **Spotlight.** One radial spotlight.
- **Animated border (optional).** A conic border animated through `@property --angle` ([Ryan Mulligan](https://ryanmulligan.dev/blog/css-property-new-style/)).

Magic UI's Border Beam defaults to orange-to-purple over 6 seconds ([Magic UI](https://magicui.design/docs/components/border-beam)). A monochrome palette needs greys there instead.

## Implementation-ready spec for the ADT login

Tags: **[Sourced]** means the value or rule comes directly from a cited source. **[Computed]** means a WCAG ratio calculated with the relative-luminance formula. **[Recommendation]** is a design decision that follows from the evidence but is not quoted from any source.

### 1. What changes from the current page

| Current | New | Basis |
|---|---|---|
| White floating card, 24px radius, on a dark right side | **No card.** The right pane is a full-height white surface, and the form column sits on it directly | [Recommendation], following cardless login-02 and Supabase [Sourced] |
| Black pill (fully rounded) buttons | 10px radius buttons, 44px tall | [Recommendation]; shadcn uses 8px/36px [Sourced] and web.dev recommends 44px+ touch targets [Sourced] |
| "Welcome to ADT SOLUTIONS" plus "Welcome back to ADT!" | Brand panel shows a value statement; the form says "Sign in to ADT" | [Recommendation]; product-named, verb-first headings dominate [Sourced: Vercel, Resend, Keka] |
| Pre-filled email and password | Empty fields with correct `autocomplete`; the browser or password manager fills them | [Recommendation]; web.dev autocomplete guidance [Sourced] |
| Google button below "Or continue with" | Google + Microsoft row **above** the form, then "or", then email | [Recommendation]; social-first in Clerk default, Resend and Cal.com, and Microsoft-first in Keka [Sourced] |
| Faint corner-bracket pattern | Masked 48px grid + spotlight + grain, with "+" marks at four grid intersections | [Recommendation]; technique [Sourced: CSS-Tricks, shadcn.io blueprint frame] |
| "powered by dhi" bottom-left | Kept, in the brand-panel footer row with a © line | [Recommendation] |

### 2. Layout and exact sizes [Recommendation unless tagged]

| Element | Value |
|---|---|
| Page | `display:grid; grid-template-columns: minmax(480px, 5fr) 7fr; min-height:100svh` at ≥1024px |
| Brand panel | `padding: 40px 48px`; flex column with `justify-content: space-between` (logo row at the top, content in the middle, footer at the bottom); `border-right: 1px solid rgb(255 255 255 / .08)` |
| Below 1024px | Brand panel hidden. The form pane shows a 56px top bar with a black ADT logo (left) and a "Need help?" link (right). This follows the login-02 rule of `hidden lg:block` for the image panel [Sourced] |
| Form pane | `display:flex; align-items:center; justify-content:center; padding: 40px 24px`; optional top-right "Need help?" text link at 24px/32px offset |
| Form column | `width:100%; max-width:380px` (Supabase uses 330/384px [Sourced]) |
| Vertical rhythm | Logo mark to heading 32px; heading block to provider row 32px; provider row to divider 24px; divider to email 24px; between fields 20px; label to input 8px; password to submit 24px; submit to sign-up line 24px; terms line pinned 32px from the pane bottom |
| Inputs | Height 44px; padding `0 14px`; radius 10px; 1px border; 15px text (16px below 640px to prevent iOS zoom, per the shadcn `text-base md:text-sm` rule [Sourced]) |
| Buttons | Height 44px; radius 10px; 15px/500 text; full width; 8px icon gap; 18px icons |
| Provider row | `display:grid; grid-template-columns:1fr 1fr; gap:12px`; stacks to one column below 360px |
| Hit areas | Show/hide toggle 36×36 inside the input; text links have a minimum 24px line box (WCAG 2.5.8 [Sourced]) |

### 3. Colour tokens and contrast

All ratios are [Computed] with the WCAG formula. The palette is neutral, without the cool tint of zinc, so it matches #1a1a1a ink.

| Token | Hex | Used for | Ratio vs its surface | Requirement |
|---|---|---|---|---|
| `--ink` | #1a1a1a | Primary text, primary button fill, focus ring on the light pane | 17.40:1 on #fff | AA text |
| `--ink-hover` | #2e2e2e | Primary button hover | Label #fff on it: 13.6:1 | AA |
| `--fg-muted` | #525252 | Sub-copy, labels' helper text on the light pane | 7.81:1 on #fff | AA text |
| `--fg-subtle` | #6b6b6b | Terms line, placeholder | 5.33:1 on #fff | AA text (≥4.5) |
| `--border` | #e5e5e5 | Divider line, outline-button border (decorative, since buttons carry text labels) | 1.26:1 | Decorative / label-identified |
| `--input-border` | #8f8f8f | Input border (the field's own boundary) | 3.23:1 on #fff | 1.4.11 ≥3:1 |
| `--surface` | #ffffff | Form pane | — | — |
| `--surface-subtle` | #f5f5f5 | Outline-button hover, "Last used" pill fill | Ink on it: 15.96:1 | AA |
| `--danger` | #b91c1c | Error text and invalid border | 6.47:1 on #fff | AA text |
| `--brand-bg` | #111111 | Brand panel base | — | — |
| `--brand-fg` | #fafafa | Brand headline | 18.09:1 on #111 | AA |
| `--brand-muted` | #a3a3a3 | Brand sub-copy and proof points | 7.49:1 on #111 | AA |
| `--brand-faint` | #8a8a8a | "powered by dhi", © line | 5.47:1 on #111 | AA (floor) |
| `--brand-line` | rgb(255 255 255 / .06) | Grid lines | — | Decorative (exempt from 1.4.11 [Sourced]) |

Do not use #737373 for text on the brand panel: it reaches only 3.98:1 on #111 [Computed]. On white, #737373 passes at 4.74:1, but #6b6b6b leaves more margin. If a fully dark form pane is ever wanted, these alternatives work: surface #1a1a1a, text #fafafa (16.67:1), muted #a3a3a3 (6.90:1), input border #666 (3.03:1 [Sourced table]), and a white primary button with #1a1a1a text.

### 4. Typography (Inter) [Recommendation; sizes anchored to sourced ranges]

| Role | Size / line height | Weight | Tracking |
|---|---|---|---|
| Brand headline | 40px / 1.1 (32px at 1024–1279px) | 600 | -0.03em |
| Brand sub-copy | 16px / 1.6 | 400 | -0.005em |
| Brand proof-point label | 14px / 1.5 | 500 | 0 |
| Form h1 | 28px / 1.2 (Supabase uses ~30px; shadcn uses 24px [Sourced]) | 600 | -0.02em |
| Form sub-copy | 15px / 1.5 | 400 | 0 |
| Label | 14px / 1.4 (shadcn 14px/500 [Sourced]) | 500 | 0 |
| Input and button text | 15px | 400 / 500 | 0 |
| Divider label, terms | 13px / 1.5 (Supabase terms 12px [Sourced]) | 400 | 0 |
| "Last used" pill | 11px uppercase | 500 | 0.04em |

Use `font-feature-settings: "cv11", "ss01"` for Inter's single-storey "a" and open digits, and `-webkit-font-smoothing: antialiased`. Use `text-wrap: balance` on the h1 and the brand headline. [Recommendation]

### 5. Components

**Provider buttons (outline).** White fill, `1px solid var(--border)`, ink text, and a 0 1px 2px rgb(0 0 0 / .05) shadow, which is shadcn's `shadow-xs` as recalled from Tailwind and not verified at source. Hover changes the fill to `--surface-subtle` and the border to #d4d4d4. Use full-colour Google and Microsoft logos at 18px; brand logos are the one permitted colour on the page. The labels are "Google" and "Microsoft" in the 2-up row, with the group labelled by a visually hidden "Continue with" heading. A **"Last used" pill** sits absolutely positioned at the top-right of the remembered provider (`top:-8px; right:8px`). It is drawn with an ink border, a white fill and 11px text, and the method is read from `localStorage`. [Recommendation; pattern Sourced from Clerk and Better Auth UI]

**Divider.** A 1px `--border` line with a centred "or" label (13px, `--fg-subtle`, 12px side padding, background `--surface`), matching shadcn's FieldSeparator construction [Sourced].

**Inputs.** Labels sit above the inputs [Sourced]. On the password label row, "Forgot password?" is right-aligned at 13px/500 ink, with no underline until hover (shadcn pattern [Sourced]). The password field holds a trailing ghost icon button (eye / eye-off, 18px, `--fg-muted`) in a 36×36 hit area, with `aria-pressed` and `aria-label="Show password"`. Placeholders: "name@company.com" and none for the password.

**Primary button.** `--ink` fill, white text, label "Sign in". It has an inner highlight of `inset 0 1px 0 rgb(255 255 255 / .08)` and a shadow of `0 1px 2px rgb(0 0 0 / .2)`. Hover changes the fill to `--ink-hover`, and active applies `transform: scale(.985)`. [Recommendation]

**Error banner.** Placed above the form when sign-in fails. It uses `role="alert"`, a 1px #fecaca border, #fef2f2 fill and `--danger` text: "That email and password don't match. Try again or reset your password." It never says which field was wrong [Sourced rule].

**Brand panel content.** From the top:

1. The white ADT logo (28px tall).
2. Vertically centred: an eyebrow "Employer of Record · Payroll · Compliance" (13px, `--brand-muted`, uppercase, 0.08em tracking).
3. The headline "Hire, pay and manage your global team — compliantly."
4. A 16px sub-line.
5. Three proof rows, each a 20px stroke icon in #fafafa followed by 14px text: "Contracts and onboarding in one place", "Payroll and invoices across entities", "Compliance tracked for every country".
6. Optionally, below the proof rows, a single cropped, greyscale product-UI tile (a timesheet or contract card) at 85% opacity with a 1px rgb(255 255 255 / .1) border and 12px radius. Use real product UI, not stock imagery, which is the Keka anti-pattern [Sourced].
7. The footer row: "powered by dhi" on the left and "© 2026 ADT Solutions" on the right, both in `--brand-faint`.

If ADT actually holds the certifications, add a trust line ("SOC 2 Type II · ISO 27001 · GDPR") as 12px `--brand-muted` text. Never claim badges ADT does not hold. [Recommendation]

### 6. Background CSS for the brand panel [technique Sourced; values Recommendation]

```css
.auth-brand { position: relative; background: #111111; isolation: isolate; overflow: hidden; color: #fafafa; }
/* Grid, faded by a radial mask */
.auth-brand::before {
  content: ""; position: absolute; inset: 0; z-index: -2;
  background-image:
    linear-gradient(to right, rgb(255 255 255 / .06) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(255 255 255 / .06) 1px, transparent 1px);
  background-size: 48px 48px; background-position: -1px -1px;
  -webkit-mask-image: radial-gradient(ellipse 80% 70% at 30% 35%, #000 25%, transparent 75%);
          mask-image: radial-gradient(ellipse 80% 70% at 30% 35%, #000 25%, transparent 75%);
}
/* Single soft spotlight */
.auth-brand::after {
  content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background: radial-gradient(640px circle at 25% 20%, rgb(255 255 255 / .07), transparent 60%);
}
/* Grain (feTurbulence values from CSS-Tricks) */
.auth-brand .grain {
  position: absolute; inset: 0; z-index: -1; pointer-events: none; opacity: .05; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
/* "+" blueprint marks at grid intersections (place 4 absolutely, aligned to the 48px grid) */
.auth-brand .plus { position: absolute; width: 11px; height: 11px; color: rgb(255 255 255 / .35); }
.auth-brand .plus::before, .auth-brand .plus::after { content: ""; position: absolute; background: currentColor; }
.auth-brand .plus::before { left: 5px; top: 0; width: 1px; height: 11px; }
.auth-brand .plus::after  { top: 5px; left: 0; height: 1px; width: 11px; }
```

The form pane has no texture: a flat #ffffff, so contrast and focus stay unambiguous. Keep all effects off the form. [Recommendation, following the research note's synthesis]

An optional accent is a slow monochrome conic beam on the product-UI tile only, using `@property --angle` and a `conic-gradient(from var(--angle), #262626 0deg 300deg, #ededed 340deg, #262626 360deg)` border animated over 8s linear. Disable it under reduced motion. Never put it on the form. [Technique Sourced; placement Recommendation]

### 7. Focus states and motion

| Interaction | Spec | Basis |
|---|---|---|
| Input focus | Border to `--ink`, plus `box-shadow: 0 0 0 3px rgb(26 26 26 / .12)`, plus `outline: 2px solid #1a1a1a; outline-offset: 2px` on `:focus-visible` | 2px solid outline is the simplest 2.4.13 pass [Sourced]; the ink ring and #fff unfocused pixels give 17.4:1 change [Computed] |
| Button and link focus | `outline: 2px solid #1a1a1a; outline-offset: 2px` on the light pane; `#fafafa` on the brand panel | [Recommendation] |
| Field transitions | `transition: border-color 150ms ease-out, box-shadow 150ms ease-out`; the ring is never delayed | <300ms and ease-out [Sourced]; values [Recommendation] |
| Button hover / press | 120ms background change; `:active { transform: scale(.985) }` | [Recommendation] |
| Page entry | Form column fades in with `opacity 0→1` and `translateY(8px)→0` over 240ms using `cubic-bezier(.2,.8,.2,1)`; brand content follows 60ms later. No motion on repeat visits within a session | Transform and opacity only [Sourced]; curve is convention, not sourced |
| Loading | Button keeps its width; the label becomes a 16px spinner (700ms linear rotation) plus "Signing in…"; `aria-busy="true"`; a `role="status"` region announces the state; double submits are blocked | Disable-after-click allowed [Sourced]; values [Recommendation] |
| Error | Error banner fades in over 150ms; focus moves to the banner. No shake | [Recommendation] |
| Success | Form pane opacity drops to 0 over 200ms, then the route changes; the password form is removed from the DOM | [Sourced: web.dev]; timing [Recommendation] |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` removes entry motion, beam and scale; keeps colour changes | [Sourced: Emil Kowalski] |

### 8. Accessibility checklist

| Check | Requirement |
|---|---|
| Labels | A visible `<label for>` on every input; no placeholder-as-label [Sourced] |
| Email input | `type="email" name="email" autocomplete="username"` (or `"username webauthn"` if passkeys ship), `required` [Sourced] |
| Password input | `type="password" autocomplete="current-password" spellcheck="false" autocapitalize="off"`, no `maxlength`, paste allowed [Sourced]; reset to `type="password"` on submit [Sourced] |
| Show/hide | `<button type="button" aria-pressed aria-label="Show password">`, 36×36 hit area [Sourced/Recommendation] |
| Text contrast | All text tokens ≥4.5:1 (table in §3) [Computed] |
| Control boundaries | Input border #8f8f8f at 3.23:1 [Computed]; outline buttons identified by their text labels [Sourced rule] |
| Focus | Visible `:focus-visible` on every interactive element; 2px solid; ≥3:1 change [Sourced] |
| Targets | Inputs and buttons 44px; links ≥24px line box [Sourced] |
| Errors | `aria-invalid` + `aria-describedby` on the field; banner uses `role="alert"`; generic credential error; password cleared [Sourced] |
| Validation styling | `:invalid:not(:placeholder-shown)`, so empty fields are not flagged early [Sourced] |
| Accessible authentication | No CAPTCHA puzzles without an alternative; password managers and paste work; Google, Microsoft or passkey offered as a non-cognitive route [Sourced: WCAG 3.3.8] |
| Structure | One `<main>`; the brand panel is an `<aside>` with decorative layers `aria-hidden="true"`; one `<h1>` ("Sign in to ADT"); the brand headline is a `<p>` styled large |
| Language and zoom | `lang="en"`; layout holds at 200% zoom and 320px width (the brand panel already hides below 1024px) |
| Motion | Every animation respects `prefers-reduced-motion` [Sourced] |
| Caps Lock | Optional hint "Caps Lock is on" via `getModifierState('CapsLock')` in a polite live region; community practice only, not a standard [Sourced as convention] |

### 9. Copy deck [Recommendation]

| Slot | Text |
|---|---|
| Brand eyebrow | Employer of Record · Payroll · Compliance |
| Brand headline | Hire, pay and manage your global team — compliantly. |
| Brand sub-line | Contracts, payroll, timesheets and compliance for every entity, in one workspace. |
| Form h1 | Sign in to ADT |
| Form sub-copy | Use your work account or email. |
| Providers | Google · Microsoft (group label: "Continue with") |
| Divider | or |
| Labels | Work email · Password |
| Links | Forgot password? · Sign in with SSO (a fallback text link under the submit button, if SAML is supported) |
| Submit / loading | Sign in / Signing in… |
| Sign-up line | New to ADT? Create an account. If accounts are invite-only, use instead: Don't have access? Ask your company admin. |
| Terms | By signing in, you agree to the Terms and Privacy Policy. |
| Failed sign-in | That email and password don't match. Try again or reset your password. |
| Empty field | Enter your work email / Enter your password |

## Conclusion

The evidence shows that "modern" in 2024–2026 means removing elements, not adding them. The floating card, the pill shapes and the second greeting are the oldest-looking parts of ADT's current page. The most distinctive way left to stand out is to texture the brand panel and to have a confident, typographic form pane. That puts ADT in a promising position within its category: the HR/EOR peers that could be inspected still use stock photos, domain gates or provider walls, so a Vercel-grade monochrome page with Microsoft sign-in and an honest trust line would be noticeable among them.

Two things remain open and should be settled before final sign-off:

1. **A manual screenshot pass on Deel, Remote, Rippling, Multiplier and Linear.** Their visual treatments could not be verified here, and confirming them would show whether any HR peer already uses this aesthetic.
2. **A product decision on the auth flow.** ADT needs to decide between a single-step password form and an email-first flow with SSO routing by domain. Deel and Remote moved to the email-first model as their enterprise customers grew. If ADT expects SAML customers, building email-first now avoids a second redesign.
