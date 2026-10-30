# Login / Sign-in Page Designs of HR, EOR, Payroll and Workforce Platforms (2024–2026)

> **Method note (read first):** Research was done on 2026-10-30. Most of these login pages are client-rendered SPAs (React/Next) or sit behind bot protection, so automated fetches got **no visible UI** for Deel, Rippling, Remote, Multiplier, Oyster, Gusto, Personio or HiBob. Their bodies were empty, returned 403, returned an error state, or hit a Cloudflare or Vercel challenge. Only **Keka** and **BambooHR** (server-rendered) and **Zoho Accounts** gave observable on-page text. For the others, the findings come from official help-centre or SSO documentation. Each finding notes which kind of evidence it rests on. Visual descriptions not backed by a source are listed under Gaps or marked as unverified inference. I found no reliable screenshot gallery (Mobbin, saasframe, Page Flows, Nicely Done) that I could fetch for these specific web login screens.

## Q1. Layout: split screen vs centered, and what fills the brand panel

### Takeaway
The layouts I could check from source split two ways. Keka (2026 build) uses a form next to a large full-bleed photo plus app-store badges. BambooHR and Zoho use a single centered card on a light background. I could not reliably verify the brand-panel content (product UI, testimonials, badges) of the EOR players Deel, Remote, Multiplier and Oyster, because their pages render client-side.

### Cited Findings
- **Keka (live HTML, 2026 asset path `cdn.keka.com/login/v/2026/`):** The page loads its logo, a `smartphone.svg` icon, a lazy-loaded `login-image.jpg`, and App Store and Google Play badges. The image is a generic stock landscape (a beach at sunset with a rowing boat), not product UI and not a testimonial. Page colours are neutral greys and white (`#F2F3F5`, `#F9FAFB`, `#FFFFFF`). This means a split layout with a decorative photo panel, plus a "get the mobile app" prompt — [Keka login HTML](https://app.keka.com/); [image asset](https://cdn.keka.com/login/v/2026/images/login-image.jpg)
- **BambooHR (live HTML):** The page is a minimal centered form. It has a BambooHR wordmark SVG, the prompt "Enter your BambooHR Domain to login.", a `companydomain` input with a fixed `.bamboohr.com` suffix, a "Continue" button, a "What's my domain?" helper, and a Privacy Policy · Terms of Service footer. It has no brand panel, testimonials or badges. The domain helper opens a small explainer with an image (`whats-my-domain.png`) and the text "Take a look at the address bar when you are logged in to BambooHR (or ask a colleague, since you are not logged in)… Great, thanks!" — [BambooHR login](https://bamboohr.com/login)
- **Zoho Accounts (Zoho People sign-in):** The page is a single sign-in card headed "Sign in" with the sub-line "to access People" and a step indicator ("STEP 1 OF 2"). The fetched text had no side-panel copy. It also carried a OneAuth promo block, "Keep your account secure" — [Zoho Accounts sign-in](https://accounts.zoho.com/signin?servicename=zohopeople)
- **greytHR:** Its login redesign announcement (originally July 2017, updated May 2024) describes a "Minimalistic design and more real estate for your company logo against a clean white background". It also describes rotating "dynamic feature cards" with "reminders for important compliance-related events", educational links, and seasonal feature cards. This is a content/news panel, not testimonials or trust badges — [greytHR blog](https://www.greythr.com/blog/with-greythrs-all-new-interactive-trial-and-improved-support-you-are-in-control/)
- **HiBob:** The page title is "Customer login". The body is fully client-rendered, so the layout could not be observed — [HiBob login](https://app.hibob.com/login)
- **Deel:** The page is client-rendered. The only server text is the meta title "Deel - Your forever people platform". A search snippet of the rendered page shows the strings "Log in / Choose a method to log in / Or / Email / Having trouble logging in?" — [Deel login](https://app.deel.com/login?lang=en)
- **Rippling:** The fetch returned only an error shell: "Something went wrong while loading the page." A help article describes the web flow (see Q2) but not the visual layout — [Rippling login](https://app.rippling.com/login); [Finni help: sign in to Rippling via web](https://finni.help.usepylon.com/articles/8672745517-how-to-sign-in-on-ripping-via-web-browser)

### Inferences
- **Tenant branding:** Indian HRMS vendors (Keka, greytHR) put white-label or company branding and mobile-app promotion on the login page. Keka's stock-photo panel and greytHR's feature/news cards are the older style of "brand panel" content.
- **Domain-first gate:** BambooHR's page is a pure routing step to the tenant subdomain, not a brand surface. This is a dated but functional multi-tenant pattern.
- **Unverified EOR panels:** From general design knowledge and **not verified in this session**, the EOR players (Deel, Remote, Rippling) tend to use a clean, mostly centered white form with a small logo and little marketing in the panel. The report writer should treat this as a hypothesis to confirm with live screenshots.

### Gaps
- I could not observe the brand-panel content (product screenshots, testimonials, customer logos) for Deel, Rippling, Remote, Multiplier, Oyster, Gusto, Personio, HiBob or Darwinbox. The pages are client-rendered or bot-protected (403 for Gusto and Multiplier; a Vercel checkpoint for Personio). A manual browser screenshot pass is needed.
- Darwinbox login is per-tenant (`<company>.darwinbox.in`). `login.darwinbox.in` served the marketing site, so there was no generic login page to inspect.
- Oyster (`app.hioyster.com`) returned an empty body.

## Q2. Auth options, their order, and how SSO is surfaced

### Takeaway
The dominant 2024–26 pattern is identifier-first: email (or username, phone or domain), then "Continue", then a method chosen per user or tenant. Google and Microsoft appear as "Continue with…" buttons, and SAML SSO is detected from the email domain or reached through an org-specific link rather than as a generic button. Admins can enforce SSO and hide password or other options, so the visible buttons vary by tenant.

### Cited Findings
- **Keka (exact on-page order):**
  - "Login to Keka", then an "Email or Username" field, then **Continue**, then "Or".
  - After that come "Continue with Mobile", "Continue with Microsoft", "Continue with Google" and "Continue with Username".
  - Footer: "By logging in, you agree to Keka Terms of Use and Privacy Policy".
  - Source: [Keka login HTML](https://app.keka.com/)
- **Keka (admin-controlled methods):**
  - Organisations choose among Microsoft, Google, Keka Password and OTP. Disabled options are hidden.
  - Microsoft is for a work or school account; Google is for a Workspace account.
  - Captcha applies to password and mobile-OTP logins only.
  - Sources: [Keka help: Logging in](https://help.keka.com/hc/en-us/articles/39946848342673-Logging-in-to-Keka); [Keka help: enable authentication](https://help.keka.com/hc/en-us/articles/39946568994705-How-to-enable-authentication-for-logging-in-to-Keka)
- **Deel:**
  - The login offers "Choose a method to log in", an "Or" divider and Email.
  - The help menu ("Having trouble logging in?") includes "I can't log in with SSO". Source: [Deel login (search snippet)](https://app.deel.com/login?lang=en)
  - Admins can enforce SSO for all workers and managers or for chosen roles and groups. Deel gives each org a dedicated SSO login link on its custom-domain login page, and org admins keep password login as a fallback. Source: [Deel help: Configure SSO](https://help.letsdeel.com/hc/en-gb/articles/20955980375313-How-to-Configure-Single-Sign-On)
- **Rippling:**
  - The flow is an "Email" field, then **Confirm**, then a password field, then 2FA (authenticator app, SMS or email code) if the company requires it, then the dashboard.
  - There is a "Forgot Password" link.
  - This is email-first progressive disclosure.
  - Source: [Finni help article](https://finni.help.usepylon.com/articles/8672745517-how-to-sign-in-on-ripping-via-web-browser)
- **Remote:**
  - SSO works through an existing IdP "such as Okta or Google Workspace".
  - An admin sets it up in Company settings → Security → Single sign-on. This requires a domain verified by a DNS TXT record.
  - Google Workspace is configured as a custom SAML app.
  - Sources: [Remote help: enable SSO](https://support.remote.com/hc/en-us/articles/5327685530765); [Remote help: Google Workspace SSO](https://support.remote.com/hc/en-us/articles/6351516421645)
- **Personio:**
  - Multiple methods can be enabled at once: Personio credentials with 2FA, Google, Microsoft Entra ID, or other OIDC/SAML providers.
  - Google SSO can be "not enforced", giving users a choice between Google and email login.
  - **The SSO button text can be customised.**
  - Personio recommends keeping email login as a backup.
  - Sources: [Personio SSO FAQ](https://support.personio.de/hc/en-us/articles/28339886661405-Frequently-asked-questions-on-single-sign-on-SSO-in-Personio); [Personio security authentication overview](https://support.personio.de/hc/en-us/articles/36109768207645-Overview-of-the-Security-authentication-area)
- **BambooHR:**
  - Login starts with the company domain (`companydomain.bamboohr.com`), then the tenant page.
  - Once Google SSO is enabled, users choose a "Log in with Google" button.
  - If an admin turns off password login, the password option disappears.
  - Sources: [BambooHR login](https://bamboohr.com/login); [BambooHR Google SSO](https://bamboohr.screenstepslive.com/m/53920/l/587786-google-single-sign-on-marketplace-partner)
- **HiBob:** Users sign in with credentials or the available SSO options. A vendor guide (not official HiBob documentation) describes either a username prompt or an SSO link — [Sprinto HiBob docs](https://docs.sprinto.com/integrations/overview/hibob-integration); [miniOrange HiBob](https://www.miniorange.com/hibob-single-sign-on-sso)
- **Zoho People (Zoho Accounts):**
  - The first step is an email or mobile field with a country code, then "Sign in using password".
  - Other methods: "Sign in using LDAP password", "Signin using Time-based OTP", push approval and QR codes, "Sign-in via email OTP" and backup codes.
  - Federated buttons cover Google, Microsoft, Apple, Yahoo, Facebook, LinkedIn, X, Slack, GitHub and others.
  - Links: "Have a tenant account? Sign in here" and "Don't have a Zoho account? Sign up now".
  - Source: [Zoho Accounts sign-in](https://accounts.zoho.com/signin?servicename=zohopeople)
- **greytHR:**
  - Web login is Login ID plus Password. With MFA on, a 6-digit OTP follows by email or SMS.
  - SSO works through SAML SP, which an admin enables.
  - The mobile app offers OTP by phone or email, web-address login, and "Login for Enterprise IDP (SSO)".
  - Sources: [greytHR mobile login methods](https://www.greythr.com/help-ess-mobile/get-started-ess-mobile-app/login-greythr-mobile-app); [greytHR SSO enable](https://greythr.freshdesk.com/support/solutions/articles/1060000065666-how-can-admin-enable-sso-based-login-with-greythr-)

### Inferences
- **Common order:** Primary identifier field and Continue come first, then an "Or" divider, then federated buttons. Keka orders them Mobile, Microsoft, Google, Username. Microsoft is placed before Google, which is consistent with an enterprise and India market.
- **SSO surfacing:** Enterprise SAML is surfaced in one of three ways: domain detection after email entry (Deel, Remote, HiBob), an org-specific SSO URL (Deel), or a tenant-customisable button (Personio). A generic "Sign in with SSO" button is less common among these vendors than in dev-tools SaaS.
- **Multi-entity selection:** No vendor puts workspace or entity selection on the login page itself. BambooHR and Darwinbox resolve the tenant by subdomain, and Zoho links to a separate tenant sign-in. Deel and Rippling appear to handle account or entity switching after login (unverified, see Gaps).

### Gaps
- I found no sources for the exact button order on Deel, Remote, Multiplier, Oyster, Gusto or HiBob.
- I found no evidence of magic-link or passkey login at any of these vendors in fetched material. Zoho lists many methods, but passkey was not seen.
- I found no source describing the post-login entity or workspace picker on Deel, Rippling or Multiplier.

## Q3. Trust and security signalling on the login page

### Takeaway
None of the login pages I could inspect (Keka, BambooHR, Zoho) shows SOC 2, ISO 27001 or GDPR badges, and the raw HTML of the pages I scanned contained no "SOC 2" or "ISO 27001" strings. Trust signalling is limited to Terms and Privacy links, consent microcopy, captcha, browser and device warnings, and MFA prompts. Compliance badges live on marketing and trust-centre pages instead.

### Cited Findings
- **Keka:** Consent microcopy "By logging in, you agree to Keka Terms of Use and Privacy Policy"; captcha on password and OTP logins — [Keka login](https://app.keka.com/); [Keka help](https://help.keka.com/hc/en-us/articles/39946848342673-Logging-in-to-Keka)
- **BambooHR:** Only a Privacy Policy · Terms of Service footer — [BambooHR login](https://bamboohr.com/login)
- **Zoho:**
  - The OneAuth promo "Keep your account secure".
  - The prompt "Don't trust browsers on public or shared devices."
  - An outdated-browser warning and a cookies-disabled warning.
  - The footer "© 2026, Zoho Corporation Pvt. Ltd."
  - Source: [Zoho Accounts](https://accounts.zoho.com/signin?servicename=zohopeople)
- **Scan result:** A regex scan of the raw HTML for `SOC 2` or `ISO 27001` on the Keka, BambooHR, HiBob, Remote and Multiplier login URLs found no matches. For the client-rendered pages this is inconclusive, because their badges could be injected by JavaScript — [Keka](https://app.keka.com/); [BambooHR](https://bamboohr.com/login)

### Inferences
- For an EOR product handling payroll data, a small "SOC 2 Type II · ISO 27001 · GDPR" line or a "Secured by SSO / 256-bit encryption" note on the login page would set it apart from this peer set. It is not standard practice among these vendors, based on the evidence available.

### Gaps
- I could not verify whether Deel, Remote, Rippling, Multiplier or Oyster show compliance badges in the rendered login UI.

## Q4. Copywriting: headline and sub-copy patterns

### Takeaway
Observed headlines are short and functional: "Login to Keka", "Sign in / to access People" (Zoho), "Log in / Choose a method to log in" (Deel), and "Enter your BambooHR Domain to login." Buttons say "Continue" or "Confirm" rather than "Log in", which reflects identifier-first flows.

### Cited Findings
- **Keka:** "Login to Keka", with a Continue button and "Continue with Microsoft / Google / Mobile / Username" — [Keka](https://app.keka.com/)
- **Deel:** "Log in", "Choose a method to log in", and the help prompt "Having trouble logging in?" — [Deel](https://app.deel.com/login?lang=en)
- **Zoho:** "Sign in", "to access People", "STEP 1 OF 2" — [Zoho](https://accounts.zoho.com/signin?servicename=zohopeople)
- **BambooHR:** "Enter your BambooHR Domain to login.", "What's my domain?", "Great, thanks!" — [BambooHR](https://bamboohr.com/login)
- **Rippling:** Field label "Email", button "Confirm" — [Finni help](https://finni.help.usepylon.com/articles/8672745517-how-to-sign-in-on-ripping-via-web-browser)
- **HiBob:** Page title "Customer login" — [HiBob](https://app.hibob.com/login)

### Inferences
- "Welcome back"-style headlines were not observed in any verified source for this set. Product-named headlines ("Login to Keka") and plain "Log in" or "Sign in" dominate.
- Using "login" as a verb (Keka, BambooHR) is a minor copy-quality flag. "Log in" is the correct verb form.

### Gaps
- I could not observe the exact headline copy for Remote, Multiplier, Oyster, Gusto, Personio or Darwinbox.

## Q5. Which look most modern vs dated, and why

### Takeaway
On verifiable evidence, the more modern patterns are identifier-first progressive disclosure, tenant-controlled method lists, and SSO detection from the email domain (Deel, Rippling, Remote, Personio). The dated signals are a stock scenery photo as the brand panel (Keka 2026), a domain-typing gate (BambooHR), a long wall of social providers (Zoho), and a rotating news/feature-card panel (greytHR, a pattern dating to 2017).

### Cited Findings
- **Keka:** Even the 2026 asset version uses a generic beach and boat stock photo, plus app-store badges, as its visual panel — [Keka image](https://cdn.keka.com/login/v/2026/images/login-image.jpg)
- **BambooHR:** Users must know and type their company subdomain, and there is a helper explaining how to find it — [BambooHR](https://bamboohr.com/login)
- **Zoho:** The page lists more than 10 federated providers plus LDAP, TOTP, push and QR methods — [Zoho](https://accounts.zoho.com/signin?servicename=zohopeople)
- **greytHR:** Its login design centres on the company logo and rotating compliance and feature cards (2017 design, page updated 2024) — [greytHR blog](https://www.greythr.com/blog/with-greythrs-all-new-interactive-trial-and-improved-support-you-are-in-control/)
- **Modern flows:**
  - Deel: method chooser, org SSO links, SSO enforcement by role — [Deel help](https://help.letsdeel.com/hc/en-gb/articles/20955980375313-How-to-Configure-Single-Sign-On)
  - Rippling: email, then Confirm, then password, then 2FA — [Finni help](https://finni.help.usepylon.com/articles/8672745517-how-to-sign-in-on-ripping-via-web-browser)
  - Remote: IdP SSO with Okta or Google Workspace through a verified domain — [Remote help](https://support.remote.com/hc/en-us/articles/5327685530765)
  - Personio: customisable SSO button and multiple methods at once — [Personio FAQ](https://support.personio.de/hc/en-us/articles/28339886661405-Frequently-asked-questions-on-single-sign-on-SSO-in-Personio)

### Inferences
- **Recommendation for an EOR product (ADT):**
  - Use an email-first form with Continue, then Google and Microsoft buttons, then SSO detected automatically from the email domain, with a secondary "Use SSO" link as a fallback.
  - Let admins hide methods, and keep a password fallback for the owner or admin, as Deel does.
  - Add a restrained trust line (compliance badges or a "Privacy" link) to stand out from these peers, who largely omit it.
  - Use product UI or a value statement in the panel rather than stock photography.
- These are design recommendations, not findings.

### Gaps
- I could not compare the visual modernity (typography, dark vs light panel, product-UI screenshots, testimonials) of Deel, Rippling, Remote, Multiplier, Oyster, Gusto, HiBob, Personio or Darwinbox, because rendered screenshots were not obtainable here. A manual capture in a real browser, or a Mobbin or Page Flows lookup with an account, is needed to close this gap and to confirm whether any of them use split-screen testimonial or product-UI panels in 2025–26.
