# Login-form UX, WCAG 2.2 accessibility, and 2024-2026 visual/motion trends for dark monochrome sign-in pages

Scope: evidence-backed rules for redesigning a dark split-screen login page (Inter, ink palette around #1a1a1a). Each claim has an inline source. Contrast ratios marked "computed" were calculated by this researcher with the WCAG 2.x relative-luminance formula (Node script). They are not quoted from a source.

---

## Q1. Usability: password toggle, labels, single vs two-step, autocomplete, passkeys, errors, Caps Lock, password managers

### Takeaway
Use one form with labels above the fields. Mark the inputs up correctly (`type="email"` + `autocomplete="username"`, or `"username webauthn"` when passkeys are offered; `autocomplete="current-password"`). Add a `type="button"` "Show password" toggle, never block paste or autofill, and use a specific "Sign in" button. After a failed login, show a generic error that does not say whether the username or the password was wrong, and clear the password field. The sources favour a single-page form. If you use two steps, keep them in one `<form>`. A Caps Lock hint is common community practice; no authoritative standard covers it.

### Cited Findings
**Labels and layout**
- Label every input with `<label for>`. Don't use placeholders as labels. Put labels **above** inputs so the layout stays the same on mobile and desktop. — [web.dev Sign-in form best practices](https://web.dev/articles/sign-in-form-best-practices)
- On mobile, put only the email field, password field and sign-in button at the top of the page so the on-screen keyboard does not hide the button. Test on real devices. — [web.dev](https://web.dev/articles/sign-in-form-best-practices)
- Use one `<form>` per UI component; don't wrap the whole page in a form. — [web.dev](https://web.dev/articles/sign-in-form-best-practices)

**Single vs two-step**
- web.dev says a two-stage flow can be one `<form>`: show only the email first, then reveal the password field with JS. If email and password are on separate pages (as Amazon and eBay do), page 2 must include a hidden input holding the email so password managers still work. — [web.dev](https://web.dev/articles/sign-in-form-best-practices)

**Autocomplete / input attributes**
- Email: `type="email" autocomplete="username"`. Sign-in password: `autocomplete="current-password" id="current-password"`. Sign-up or reset: `new-password`. Keep `name`/`id` stable across deployments, and use different values for sign-up and sign-in. — [web.dev](https://web.dev/articles/sign-in-form-best-practices)
- Set `spellcheck="false"` and `autocapitalize="off"` (or `none`) on the password field. On submit, switch the input back to `type="password"` so browsers don't save the password as an ordinary field value. — [GOV.UK Design System – Password input](https://design-system.service.gov.uk/components/password-input/)
- Don't use `maxlength` on passwords, because truncation gives no feedback. Support all characters. — [GOV.UK](https://design-system.service.gov.uk/components/password-input/)

**Password visibility toggle**
- Add a "Show password" toggle with `type="button"` so it doesn't submit the form. web.dev suggests an aria-label that warns the password will be displayed. — [web.dev](https://web.dev/articles/sign-in-form-best-practices)
- GOV.UK: hide the password by default. Use a visible "Show" button with the accessible label "Show password". If there are two password fields, give each toggle a distinct label. Known issue: screen readers, browsers and password managers may add their own reveal controls, so the button label can fall out of sync with the field's real state. — [GOV.UK](https://design-system.service.gov.uk/components/password-input/)
- GOV.UK research: a second "confirm password" field is not helpful, especially when show/hide is available. — [GOV.UK](https://design-system.service.gov.uk/components/password-input/)
- Baymard: masked fields stop users from catching typos before submitting, which slows sign-in. Baymard recommends a show-password feature. — [Baymard guideline #665](https://baymard.com/guidelines/665-show-password-feature)
- NN/g (Katie Sherwin, as quoted by CXL; the original NN/g article was not retrieved): mask by default on desktop with a "Show" option, and consider unmasked by default on mobile. — [CXL, Password UX](https://cxl.com/password-ux/)
- A 2024 ACM CCS study (Hu et al., 600 participants) found that most users understand what masking is for, but a sizable minority misunderstand what it protects. — [PasswordMasking CCS24 (Georgia Tech)](https://faculty.cc.gatech.edu/~frankli/papers/PasswordMasking_CCS24.pdf)

**Buttons and submission**
- Label the button with its action ("Sign in"), not "Submit". You may disable it after the first click to prevent double submission. Do **not** disable it while required fields are empty; if you must, explain what is missing on click. After success, navigate or use the History API. With AJAX, remove the password form from the DOM. — [web.dev](https://web.dev/articles/sign-in-form-best-practices)

**Errors**
- Use `required` and `type="email"` for native validation. Style invalid fields with `:invalid:not(:placeholder-shown)` so empty fields aren't flagged early. Always validate on the server too. — [web.dev](https://web.dev/articles/sign-in-form-best-practices)
- After a failed login, don't reveal whether the username or the password was wrong, and clear the password field. Example empty-field message: "Enter a password". — [GOV.UK](https://design-system.service.gov.uk/components/password-input/)
- Always allow copy and paste on password fields. — [GOV.UK](https://design-system.service.gov.uk/components/password-input/)

**Passkeys / WebAuthn conditional UI**
- Put `autocomplete="username webauthn"` on the username field. `autofocus` is optional and opens the autofill prompt on load. — [web.dev Passkey form autofill](https://web.dev/articles/passkey-form-autofill)
- Feature-detect with `PublicKeyCredential.getClientCapabilities()` and check `capabilities.conditionalGet === true`. Then call `navigator.credentials.get({ publicKey: options, signal: abortController.signal, mediation: 'conditional' })`. The request stays pending, with no UI, until the user picks a passkey from autofill. — [web.dev](https://web.dev/articles/passkey-form-autofill)
- UX rules from the same page:
  - Keep the password option in the same autofill prompt.
  - After a password sign-in, offer to create a passkey.
  - Don't ask for a second factor after a passkey sign-in.
  - If the server finds no matching credential, call `PublicKeyCredential.signalUnknownCredential()`.
  — [web.dev](https://web.dev/articles/passkey-form-autofill)

**Caps Lock warning**
- Detect it with `event.getModifierState('CapsLock')` on key events. — [javascripttutorial.net](https://www.javascripttutorial.net/?p=86574)
- WordPress core added a Caps Lock notice to its password input. It skips the notice on macOS Safari and Firefox, where the browser already shows its own indicator. — [WordPress Trac changeset 60988](https://core.trac.wordpress.org/changeset/60988/)
- Whether the hint needs a live region is disputed. One implementation uses `role="status" aria-live="polite"`. A Joomla discussion argued screen readers already announce Caps Lock in password fields and suggested `<output>` as an implicit live region. — [GitHub PR example](https://github.com/hzb666/LabStorageManager/pull/26); [Joomla tracker #40628](https://issues.joomla.org/tracker/joomla-cms/40628)

### Inferences
- For ADT: use one page with email and password together (top-aligned labels), plus an inline show/hide toggle shaped like a text button ("Show"/"Hide") or an eye icon with `aria-pressed` and `aria-label="Show password"`. A two-step email-first flow only pays off if SSO or IdP routing by domain is needed.
- Floating labels are not endorsed by any source retrieved. The labels-above guidance in web.dev and GOV.UK points to static top-aligned labels as the safer choice.
- "Remember me": no authoritative 2024-2026 guidance was found (see Gaps). With correct autocomplete markup and long-lived sessions, the checkbox matters less.

### Gaps
- The original NN/g article on password masking and NN/g's floating-label guidance were not retrieved directly. The NN/g position above is second-hand via CXL.
- No primary Baymard statistic on login error messages could be verified. Figures circulating on blogs (for example "61% abandonment") could not be traced to Baymard and are omitted.
- No authoritative source on "remember me" checkbox UX was found.
- The GOV.UK pattern pages say nothing about Caps Lock. Caps Lock guidance is community practice only.

---

## Q2. Accessibility (WCAG 2.2) on dark backgrounds

### Takeaway
Minimums:
- Body text: 4.5:1 (1.4.3).
- Field boundaries that identify a control, and focus indicators: 3:1 (1.4.11).
- Focus indicator, AAA target (2.4.13): at least a 2px-perimeter area with a 3:1 change between focused and unfocused states.
- Pointer targets: at least 24×24 CSS px (2.5.8); web.dev recommends 44-48px for touch.

Do not block paste or autofill (3.3.8). Passkeys and OS biometrics count as a compliant non-cognitive route. On #1a1a1a, muted text must be about #8a8a8a or lighter. Field borders need about #666 or lighter **if the border is the only cue that a field is there**.

### Cited Findings
- **1.4.11 Non-text Contrast (AA):** "a contrast ratio of at least 3:1 against adjacent color(s)" for visual information needed to identify UI components and states. 2.999:1 fails. — [W3C Understanding 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- **Input borders:** a border must meet 3:1 only when nothing else visually identifies the control. A visible, contrasting label can identify it. A bottom-border-only input must meet 3:1. W3C still recommends delineating every control for users with cognitive disabilities. — [W3C 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- Focus indicators must contrast with the adjacent background. Disabled controls are exempt. — [W3C 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- **2.4.13 Focus Appearance (AAA):** the indicator area must be at least that of a 2 CSS px thick perimeter of the unfocused component, with at least a 3:1 *change of contrast* between the same pixels when focused vs unfocused. A solid 2px outline is the simplest way to pass. The SC does not apply if the author has not modified the UA default indicator. — [W3C Understanding 2.4.13](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)
- **1.4.3:** 4.5:1 for normal text and 3:1 for large text. — [LogRocket summary](https://blog.logrocket.com/how-do-you-implement-accessible-linear-design-across-light-and-dark-modes/) (standard WCAG values)
- **2.5.8 Target Size (Minimum, AA):** at least 24×24 CSS px. Smaller targets pass if a 24px-diameter circle centred on each does not overlap another target. Inline links in sentences are exempt. — [W3C Understanding 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- web.dev touch guidance: at least 44×44 CSS px (Apple suggests 48×48). About 15px padding on mobile inputs and buttons, about 10px on desktop, and about one finger-width between inputs. Text 13-16px on desktop and around 20px on mobile. — [web.dev](https://web.dev/articles/sign-in-form-best-practices)
- **3.3.8 Accessible Authentication (Minimum, AA):** no cognitive function test (remembering a password, transcribing, puzzles) unless there is an alternative, a mechanism that helps (password managers count), object recognition, or personal content. Blocking paste or autofill fails. So do split OTP boxes that won't accept a pasted code. WebAuthn, hardware keys, Windows Hello and Touch ID/Face ID are not cognitive tests. Math CAPTCHAs are not exempt. — [W3C Understanding 3.3.8](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html)

**Computed contrast table (WCAG formula, this researcher):**

| Foreground | on #0a0a0a | on #141414 | on #1a1a1a |
|---|---|---|---|
| #ffffff | 19.80 | 18.42 | 17.40 |
| #ededed | 16.91 | 15.74 | 14.87 |
| #a1a1a1 | 7.66 | 7.13 | 6.74 |
| #8a8a8a | 5.73 | 5.34 | 5.04 |
| #737373 | 4.18 | 3.89 | 3.67 |
| #666666 | 3.45 | 3.21 | 3.03 |
| #5c5c5c | 2.96 | 2.76 | 2.60 |
| #525252 | 2.53 | 2.36 | 2.23 |
| #404040 | 1.91 | 1.78 | 1.68 |
| #333333 | 1.57 | 1.46 | 1.38 |

### Inferences
- On a #1a1a1a panel:
  - Sub-copy and placeholder text: #a1a1a1 or lighter (6.7:1) is comfortable; #8a8a8a (5.0:1) is the floor. #737373 fails for body text (3.67:1).
  - Input borders: the common "hairline" #333 or #404040 (1.4-1.7:1) passes only because labels identify the fields. If you rely on the border, use about #666 or lighter (3.03:1).
  - Hover/focus border: shift to #a1a1a1 or #ededed, plus a 2px outline (for example `outline: 2px solid #ededed; outline-offset: 2px`). That clears both 1.4.11 and the 2.4.13 change-of-contrast test.
- Hairlines like #262626 for decorative grid and background lines are fine. Decoration is not subject to 1.4.11.
- Design the inline show/hide toggle and "Forgot password?" link with a hit area of at least 24×24 (ideally 44×44 on touch). Full-width buttons and inputs should be at least 44px tall.
- Keep the passkey path available alongside the password path. It is the cleanest way to satisfy 3.3.8.

### Gaps
- The 2.4.11 Focus Not Obscured (Minimum) Understanding page was not fetched. In short (WCAG text, not quoted here), the focused element must not be entirely hidden by author-created content such as sticky footers or cookie banners.
- No source gave a recommended contrast specifically for *placeholder* text. Treat it as normal text (4.5:1) if it carries information.

---

## Q3. Visual trends for dark monochrome auth pages and CSS techniques

### Takeaway
The current vocabulary (Vercel, Linear, Magic UI, Aceternity) is:
- a near-black neutral base;
- faint grid or dot patterns faded out with a radial mask;
- a low-opacity noise layer to remove gradient banding;
- one soft spotlight;
- an optional single animated "beam" or conic border on a key card.

Linear's 2024 redesign moved to higher-contrast, perceptually uniform (LCH) neutrals. Use these effects sparingly and keep them behind a reduced-motion guard.

### Cited Findings
- Linear's March 2024 redesign raised contrast in its default dark and light themes. Its theme generator uses LCH instead of HSL for perceptual uniformity. — [Linear changelog 2024-03-20](https://linear.app/changelog/2024-03-20-new-linear-ui); [Linear blog: How we redesigned the Linear UI](https://linear.app/blog/how-we-redesigned-the-linear-ui)
- Secondary write-ups say Linear reduced its theme definition to three variables (base, accent, contrast). One unverified blog lists a dark base of about LCH L=12 C=2 H=270, which is a near-black with a faint cool tint. — [sspai](https://sspai.com/post/104449); [thedjpetersen (unverified)](https://astro-thedjpetersen-com.pages.dev/thoughts/linear-theme)
- Magic UI's catalogue includes the background components Grid Pattern, Dot Pattern and Retro Grid, and the effects Border Beam and Shine Border. — [Magic UI Border Beam docs](https://magicui.design/docs/components/border-beam)
- Magic UI **Border Beam** defaults: `size` 50, `duration` 6 (seconds), `delay` 0, `colorFrom #ffaa40`, `colorTo #9c40ff`, `borderWidth` 1. It is placed inside a `relative overflow-hidden` container. — [Magic UI](https://magicui.design/docs/components/border-beam)
- Aceternity UI ships a "Grid and Dot Backgrounds" component (Tailwind + `motion`). Its code was not extractable from the page. — [Aceternity UI](https://ui.aceternity.com/components/grid-and-dot-backgrounds)
- **Grain / noise technique:** an SVG `<filter>` with `<feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/>` applied to a `<rect>` and used as a background image. Layer it under or over a gradient, and sharpen with `filter: contrast(170%) brightness(1000%)`. Blend with `mix-blend-mode: multiply` and use `isolation: isolate` on the parent. — [CSS-Tricks, Grainy Gradients](https://css-tricks.com/grainy-gradients/)
- **Animated conic border:** register `@property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false/true; }`. Use `conic-gradient(from var(--angle), ...)` on the border box, with a solid fill on the padding box and a transparent 1px border. Animate `--angle` in `@keyframes`. Alternatives are a wrapper element, a `::before` layer, or `border-image`. With `border-image`, the last colour must repeat the first to avoid a seam. — [Ryan Mulligan, CSS @property and the New Style](https://ryanmulligan.dev/blog/css-property-new-style/); [Learn With Jason / CodeTV](https://learnwithjason.dev/blog/animated-css-gradient-border)

### Example CSS (synthesised by this researcher from the techniques above; values are suggestions, not quoted)
```css
/* 1. Grid with radial fade (brand panel) */
.auth-brand { position: relative; background: #0a0a0a; isolation: isolate; }
.auth-brand::before {
  content: ""; position: absolute; inset: 0; z-index: -1;
  background-image:
    linear-gradient(to right, rgb(255 255 255 / .06) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(255 255 255 / .06) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, #000 30%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, #000 30%, transparent 100%);
}
/* Dot variant: background-image: radial-gradient(rgb(255 255 255 / .12) 1px, transparent 1px); background-size: 20px 20px; */

/* 2. Spotlight */
.auth-brand::after {
  content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background: radial-gradient(600px circle at 30% 20%, rgb(255 255 255 / .08), transparent 60%);
}

/* 3. Grain overlay (inline SVG data URI, per CSS-Tricks feTurbulence values) */
.grain { position: absolute; inset: 0; pointer-events: none; opacity: .06; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }

/* 4. Conic animated border (monochrome beam) */
@property --angle { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
.beam-card {
  border: 1px solid transparent; border-radius: 12px;
  background:
    linear-gradient(#141414, #141414) padding-box,
    conic-gradient(from var(--angle), #262626 0deg, #262626 300deg, #ededed 340deg, #262626 360deg) border-box;
  animation: spin 6s linear infinite;
}
@keyframes spin { to { --angle: 360deg; } }
@media (prefers-reduced-motion: reduce) { .beam-card { animation: none; } }
```

### Inferences
- For an Inter, monochrome ADT login:
  - Brand (left) panel: grid or dots with a radial fade, one spotlight and a grain layer at 4-8% opacity.
  - Form (right) panel: clean flat #0a0a0a-#1a1a1a, so contrast and focus states stay unambiguous.
  - Keep effects off the form itself.
- For a monochrome palette, swap Magic UI's orange-purple beam defaults for greys (#262626 to #ededed).
- Typography (Vercel/Linear look, not formally sourced): display heading in Inter 600 at 28-40px with negative letter-spacing (about -0.02em to -0.03em); sub-copy in #a1a1a1 at 14-15px.
- Bento grids or product-screenshot panels and glassmorphism (`backdrop-filter: blur()`) are common in marketing heroes. Glass is risky for contrast on dark grids, so if used, keep panel text over an opaque fill.

### Gaps
- No primary Vercel (Geist) design-blog source on auth-page aesthetics was retrieved. The typography tracking values above are practitioner convention, not sourced.
- The exact Aceternity grid code and the Magic UI Grid Pattern defaults were not extractable.
- No quantitative trend data (surveys of SaaS login pages) was found. The "trend" status is inferred from component-library catalogues and Linear's redesign.

---

## Q4. Micro-interactions: loading, focus, success transitions, durations/easing, reduced motion

### Takeaway
Keep UI motion under about 300ms. Use ease-out, and animate only `transform` and `opacity`. Prefer interruptible CSS transitions. Don't animate high-frequency keyboard actions. Under `prefers-reduced-motion: reduce`, swap motion for fades or nothing. For the button: give immediate feedback, then an inline spinner with the label kept or announced, and block double submits.

### Cited Findings
- Keep most UI animations under 300ms. Use `ease-out` for most UI, because it starts fast and settles, which feels responsive. — [Emil Kowalski, Great animations](https://emilkowal.ski/ui/great-animations)
- Animate only `transform` and `opacity` (compositor-only). Avoid padding and margin, which trigger layout. Prefer CSS animations or WAAPI over rAF-driven JS when the main thread may be busy. — [Emil Kowalski](https://emilkowal.ski/ui/great-animations)
- Animations should be interruptible (CSS transitions or Framer Motion). Don't animate keyboard-initiated actions repeated many times a day. — [Emil Kowalski](https://emilkowal.ski/ui/great-animations)
- Respect `prefers-reduced-motion`, for example by replacing a bounce or slide with a fade. In React, use `useReducedMotion`. — [Emil Kowalski](https://emilkowal.ski/ui/great-animations)
- On submit: disabling the button after the first click to prevent double submits is acceptable. After success, navigate (or use the History API) and remove the password form from the DOM. — [web.dev](https://web.dev/articles/sign-in-form-best-practices)

### Inferences (suggested values, not sourced numerically beyond the 300ms ceiling)
- Input focus: `transition: border-color 150ms ease-out, box-shadow 150ms ease-out`. The focus ring appears instantly or within 100-150ms; never delay it.
- Button hover and press: 120-150ms background change; `transform: scale(.98)` on `:active`.
- Loading state:
  - Keep the button width fixed and swap the label for a 16px spinner plus "Signing in…".
  - Set `aria-busy="true"` and `aria-disabled="true"` rather than removing the button from the tab order.
  - Announce the state via a `role="status"` region.
  - Spinner rotation: about 600-800ms linear infinite.
- Success transition: a 200-300ms fade/scale (opacity 1 to 0, scale 1 to .98) of the form panel, or a View Transition, before routing to the app. Under reduced motion, cut directly.
- Error: a short horizontal shake (at most 300ms) is common but is motion. Under reduced motion, show only colour, icon and text. Move focus to the error summary or first invalid field, linked with `aria-describedby`.
- Ambient effects (beam, spotlight drift): slow (6s or more, linear), paused under `prefers-reduced-motion: reduce`.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important;
    transition-duration: .01ms !important; scroll-behavior: auto !important; }
}
```

### Gaps
- No authoritative published easing curve (cubic-bezier) for auth UIs was retrieved. Commonly used curves such as `cubic-bezier(.16,1,.3,1)` (ease-out-expo) or `cubic-bezier(.2,.8,.2,1)` are convention, not sourced here.
- WCAG 2.3.3 Animation from Interactions (AAA) Understanding doc was not fetched.
- No source gave spinner-timing research. The 600-800ms rotation is convention.
