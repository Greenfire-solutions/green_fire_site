/* THE READINESS QUESTIONS, and the one home for them. This is the form a person
   fills in AFTER they have chosen a package (/readiness?for=learn|build|partner):
   how organised they are, so nobody builds an AI system on top of chaos.

   Everything about an answer lives on the answer itself:
     s     how ready it is, 0 to 3 (only questions with an `area` are scored)
     todo  what the person should gather or decide, in their own words
     sys   what that tool could connect to, and how hard (for Jordan, never shown to them)
   so the page, the server and the operator never carry a second copy of the rules.

   WHAT THIS FORM NEVER ASKS FOR: a password, a key or a login. It asks who holds
   each one and whether the person can get in. Access is shared live in the session.
   Short on purpose: a question only shows when the answer before it makes it matter
   (no website means no hosting questions). No em dashes: Jordan reads them as machine written. */

export type Effort = 'easy' | 'medium' | 'manual';
export type Sys = { what: string; effort: Effort };
export type Choice = { v: string; s?: number; todo?: string; sys?: Sys };
export type ShowIf = { q: string; in?: string[]; notin?: string[] };
export type AreaKey = 'web' | 'foundation' | 'people' | 'money' | 'tools' | 'ready';
export type RQ = {
  id: string;
  label: string;
  help?: string;
  kind: 'one' | 'many' | 'text' | 'long';
  choices?: Choice[];
  required?: boolean;
  placeholder?: string;
  hidden?: boolean;
  area?: AreaKey;      // scored into this area
  fact?: string;       // also kept as a plain fact (Jordan plans the onboarding from these)
  showIf?: ShowIf;
  /* For a 'many' question: shown when fewer than this many positive answers were picked. */
  fewTodo?: string;
  fewBelow?: number;
};
export type RSection = { title: string; heading: string; help: string; questions: RQ[] };

export const AREAS: Record<AreaKey, string> = {
  web: 'Website and domain',
  foundation: 'Business foundation',
  people: 'People and roles',
  money: 'Money',
  tools: 'Tools and data',
  ready: 'Time and commitment',
};

const easy = (what: string): Sys => ({ what, effort: 'easy' });
const med = (what: string): Sys => ({ what, effort: 'medium' });
const hand = (what: string): Sys => ({ what, effort: 'manual' });

const NO_SITE = 'No website yet';

export const READINESS: RSection[] = [
  {
    title: 'You',
    heading: 'Let’s get your build ready',
    help: 'A few minutes now saves days later. Most answers are a tap, and only what applies to you is asked.',
    questions: [], // the page puts name, email, business, website and the package at the top
  },
  {
    title: 'Website and domain',
    heading: 'Your website and domain',
    help: 'Never type a password here. I only need to know who holds the keys.',
    questions: [
      { id: 'web_has', kind: 'one', required: true, area: 'web', fact: 'has_site', label: 'Do you have a website?', choices: [
        { v: 'Yes, live and up to date', s: 3 },
        { v: 'Yes, but out of date or unfinished', s: 2, todo: 'Make a short list of what is out of date or missing on your site, so we know what to fix first.' },
        { v: 'Someone is building it now', s: 1, todo: 'Ask whoever is building your site for the finish date and for admin access once it is done.' },
        { v: NO_SITE, s: 0, todo: 'Think of the name you want for the business online, so we can look at domains together.' }] },
      { id: 'web_platform', kind: 'one', fact: 'platform', showIf: { q: 'web_has', notin: [NO_SITE] }, label: 'What is it built on?', help: 'The footer or your web person will usually say.', choices: [
        { v: 'Squarespace', sys: med('Products and orders can be read through its commerce tools. Page content is edited by hand or with code added to the site.') },
        { v: 'Wix', sys: med('Stores, forms and bookings have APIs. Page design stays in the Wix editor.') },
        { v: 'WordPress', sys: easy('Full access through its built in API once a connection is set up.') },
        { v: 'Shopify', sys: easy('Products, orders and customers through the admin API.') },
        { v: 'Webflow', sys: easy('The content (CMS) can be read and edited through its API.') },
        { v: 'GoDaddy or another site builder', sys: hand('Little or no API access. Changes are made by hand, or the site is moved to something connectable.') },
        { v: 'Custom code, built by a developer', sys: easy('Depends on how it was built, and usually the easiest to connect to.') },
        { v: 'I do not know', todo: 'Find out what your site is built on. Your web person, or the bottom of the site, usually says.' }] },
      { id: 'web_domain', kind: 'one', required: true, area: 'web', fact: 'domain_access', showIf: { q: 'web_has', notin: [NO_SITE] }, label: 'Who holds your domain name?', help: 'The address, like yourname.com, and the account where it was bought.', choices: [
        { v: 'I own it and can log in', s: 3 },
        { v: 'I own it but cannot find the login', s: 1, todo: 'Find the email you got when the domain was bought, or ask the company that sold it to reset the login.' },
        { v: 'Someone else holds it, like a web person or a friend', s: 1, todo: 'Ask whoever holds your domain to make you the owner, or to send you the details to move it to your own account.' },
        { v: 'I do not know', s: 0, todo: 'Look your domain up at lookup.icann.org and write down which company it is registered with.' }] },
      { id: 'web_admin', kind: 'one', area: 'web', showIf: { q: 'web_has', notin: [NO_SITE] }, label: 'Can you log in to edit your website?', choices: [
        { v: 'Yes, I can get in myself', s: 3 },
        { v: 'Someone else manages it, and I can ask them', s: 2, todo: 'Ask your web person to add you as an admin of your website.' },
        { v: 'I cannot get in', s: 0, todo: 'Find or reset the login to your website admin before we start.' },
        { v: 'I do not know', s: 0, todo: 'Find out who can log in to your website and ask them to add you as an admin.' }] },
    ],
  },
  {
    title: 'Your business',
    heading: 'What is written down',
    help: 'This is what the AI will learn from. Rough notes count.',
    questions: [
      { id: 'found_docs', kind: 'many', required: true, area: 'foundation', fact: 'docs', fewBelow: 3,
        fewTodo: 'Write rough notes for what is missing: your goals for this year, who your ideal customer is, and how you do your work.',
        label: 'Which of these do you have in writing?', help: 'Tap all that are true.', choices: [
          { v: 'A business plan', s: 1 }, { v: 'My mission or values', s: 1 }, { v: 'Goals for this year', s: 1 },
          { v: 'What I offer, with prices', s: 1 }, { v: 'A description of my ideal customer', s: 1 },
          { v: 'Brand files: logo, colors, fonts', s: 1 }, { v: 'How the work gets done: steps or checklists', s: 1 },
          { v: 'None of these are written down', s: 0, todo: 'Write three lines before we start: what you sell, who it is for, and your goal for this year. Rough is fine.' }] },
      { id: 'found_where', kind: 'one', area: 'foundation', showIf: { q: 'found_docs', notin: ['None of these are written down'] }, label: 'Where do those live?', choices: [
        { v: 'In one shared place, like Google Drive, Notion or Dropbox', s: 3 },
        { v: 'In folders on my own computer', s: 2, todo: 'Put your business documents in one shared folder, such as Google Drive, so we can work from the same place.' },
        { v: 'On paper, or scattered about', s: 1, todo: 'Gather your business documents in one place, even photos of the paper ones.' }] },
      { id: 'team_size', kind: 'one', required: true, fact: 'team', label: 'Who works in the business?', choices: [
        { v: 'Just me' }, { v: 'Me and one to three people' }, { v: 'Four to ten people' }, { v: 'More than ten' }] },
      { id: 'roles', kind: 'one', area: 'people', showIf: { q: 'team_size', notin: ['Just me'] }, label: 'Are roles and responsibilities written down?', choices: [
        { v: 'Yes, written down and everyone knows them', s: 3 },
        { v: 'Mostly clear, but not written down', s: 2, todo: 'List who does what, one line per person. Rough is fine.' },
        { v: 'Unclear, or they keep changing', s: 1, todo: 'List who does what today, one line per person, and mark anything that is unclear.' },
        { v: 'We have never talked about it', s: 0, todo: 'List who does what today, one line per person. We will tidy it together.' }] },
      { id: 'point_person', kind: 'text', showIf: { q: 'team_size', notin: ['Just me'] }, label: 'Who on your team will work with me on this?', placeholder: 'A name, and their role' },
      { id: 'decider', kind: 'one', area: 'people', fact: 'decider', label: 'Who decides on spending and tools?', choices: [
        { v: 'Me', s: 3 },
        { v: 'Me and a partner', s: 2, todo: 'Have your partner join our first session, or agree beforehand what you can decide on your own.' },
        { v: 'A team or a board', s: 1, todo: 'Check who has to approve this, and have them in the first session or agree in advance.' }] },
    ],
  },
  {
    title: 'Money',
    heading: 'The money side',
    help: 'No numbers needed. This is about whether the build can be planned around them.',
    questions: [
      { id: 'budget', kind: 'one', required: true, area: 'money', fact: 'budget', label: 'Is the budget for this decided?', choices: [
        { v: 'Yes, set aside and ready', s: 3 },
        { v: 'Roughly decided', s: 2 },
        { v: 'Not decided yet', s: 1, todo: 'Decide a range you are comfortable with. The build is shaped around it, so this saves time.' }] },
      { id: 'finance_how', kind: 'one', area: 'money', fact: 'finance', label: 'How are your finances tracked?', choices: [
        { v: 'Accounting software', s: 3 },
        { v: 'A bookkeeper or accountant keeps them', s: 2, todo: 'Ask your bookkeeper what they can share with us, and how.' },
        { v: 'A spreadsheet', s: 2 },
        { v: 'Not really tracked', s: 0, todo: 'Start a simple sheet of money in and money out. Even one month of it helps.' }] },
      { id: 'money_tools', kind: 'many', fact: 'money_tools', label: 'Which of these do you use for money?', help: 'Tap all that apply, or skip.', choices: [
        { v: 'QuickBooks', sys: med('Income, expenses and invoices through its API, once you approve the connection.') },
        { v: 'Xero', sys: med('Invoices, contacts and bank data through its API.') },
        { v: 'FreshBooks', sys: med('Invoices and expenses through its API.') },
        { v: 'Wave', sys: hand('Very limited API. Usually works by export.') },
        { v: 'Stripe', sys: easy('Payments and customers can be read safely with a read only key.') },
        { v: 'Square', sys: easy('Sales, customers and bookings through its API.') },
        { v: 'PayPal', sys: med('Transactions can be read through its API.') },
        { v: 'Only Venmo, Zelle or cash', todo: 'Move toward one place that records payments, so each sale is written down.' }] },
    ],
  },
  {
    title: 'Your tools',
    heading: 'The tools you already use',
    help: 'This tells me what the system can plug into, so nothing is built twice.',
    questions: [
      { id: 'email_type', kind: 'one', required: true, area: 'tools', fact: 'email', label: 'What email do you use for the business?', choices: [
        { v: 'Google Workspace: Gmail on my own domain', s: 3, sys: easy('Mail, calendar and Drive connect safely with Google sign in. Drafts only, nothing sends without you.') },
        { v: 'Microsoft 365 or Outlook', s: 3, sys: med('Works through Microsoft Graph. Some organisations need an admin to approve it.') },
        { v: 'A free Gmail address', s: 2, sys: easy('Connects the same way as Google Workspace.') },
        { v: 'Email that comes with my website host', s: 1, todo: 'Find out where your business email is hosted. We may move it to something easier to connect.', sys: hand('Usually only plain mail access. Often best moved to Google or Microsoft.') },
        { v: 'I am not sure', s: 0, todo: 'Find out which company hosts your business email.' }] },
      { id: 'tools', kind: 'many', fact: 'tools', label: 'Which of these do you use?', help: 'Tap all that apply.', choices: [
        { v: 'Google Calendar', sys: easy('Read and add events with your approval.') },
        { v: 'Calendly or Acuity', sys: easy('Bookings can be read and acted on through its API and webhooks.') },
        { v: 'Zoom', sys: easy('Meetings and recordings through its API.') },
        { v: 'HubSpot', sys: easy('Contacts, deals and notes through its API.') },
        { v: 'Salesforce', sys: med('Strong API, but setup and permissions take care.') },
        { v: 'Pipedrive', sys: easy('Contacts and deals through its API.') },
        { v: 'GoHighLevel', sys: easy('Contacts, pipelines and messages through its API.') },
        { v: 'Mailchimp', sys: easy('Audiences and campaigns through its API.') },
        { v: 'Klaviyo', sys: easy('Profiles and campaigns through its API.') },
        { v: 'Kit (ConvertKit)', sys: easy('Subscribers and sequences through its API.') },
        { v: 'Notion', sys: easy('Pages and databases through its API, for what you share with it.') },
        { v: 'Airtable', sys: easy('Bases and records through its API.') },
        { v: 'Asana, Trello or Monday', sys: easy('Tasks and boards through their APIs.') },
        { v: 'Google Drive or Dropbox', sys: easy('Files can be read and organised with your approval.') },
        { v: 'Slack', sys: easy('Messages and alerts through a bot.') },
        { v: 'Instagram or Facebook', sys: med('Needs a business account and Meta app approval. Posting and comments are possible, DMs are limited.') },
        { v: 'LinkedIn', sys: hand('Posting is tightly limited. Mostly drafts you post yourself.') },
        { v: 'YouTube or TikTok', sys: med('Upload and analytics are possible with each platform’s approval.') },
        { v: 'Etsy or Eventbrite', sys: med('Orders and events can be read through their APIs.') },
        { v: 'None of these', todo: 'Write down which tools you use every week, even a notebook. It tells us where to start.' }] },
      { id: 'customers_where', kind: 'one', required: true, area: 'tools', fact: 'customers', label: 'Where does your customer list live?', choices: [
        { v: 'In a CRM', s: 3 },
        { v: 'In an email list tool', s: 2 },
        { v: 'In a spreadsheet', s: 2 },
        { v: 'In my phone contacts and inbox', s: 1, todo: 'Export your customers to one spreadsheet: name, email, and what they bought. Rough is fine.' },
        { v: 'Nowhere, it is all in my head', s: 0, todo: 'Start a spreadsheet of your customers: name, email, and what they bought. Even your top twenty helps.' }] },
      { id: 'tools_admin', kind: 'one', area: 'tools', label: 'Are you the admin of your main tools?', help: 'The person who can approve connecting an app.', choices: [
        { v: 'Yes, I am', s: 3 },
        { v: 'Of some of them', s: 2 },
        { v: 'Someone else is', s: 1, todo: 'Ask whoever is the admin of your tools to join the first session. They may need to approve connections.' },
        { v: 'I do not know', s: 1, todo: 'Find out who the admin is for your email and your main tools.' }] },
    ],
  },
  {
    title: 'Time and go',
    heading: 'Last step: time and first job',
    help: 'So the plan fits your life, and the first thing we build is the right thing.',
    questions: [
      { id: 'hours', kind: 'one', required: true, area: 'ready', fact: 'hours', label: 'How many hours a week can you give this while we build?', choices: [
        { v: 'Under one hour', s: 0, todo: 'Put two hours a week on your calendar for the build. It goes far faster with your time.' },
        { v: 'One to three hours', s: 2 }, { v: 'Four to eight hours', s: 3 }, { v: 'More than eight', s: 3 }] },
      { id: 'when', kind: 'one', required: true, fact: 'when', label: 'When do you want it working?', choices: [
        { v: 'No set date' }, { v: 'Within a month' }, { v: 'In one to three months' }, { v: 'In three to six months' }, { v: 'There is a date I must hit' }] },
      { id: 'first_job', kind: 'long', required: true, fact: 'first_job', label: 'What is the first job you want your AI system to take over?', help: 'As specific as you can. "Reply to booking enquiries" is the right size.' },
      { id: 'worry', kind: 'long', label: 'What could get in the way?', help: 'Time, people, tools, nerves. I would rather plan around it.' },
      { id: 'public_ok', kind: 'one', fact: 'public_ok', label: 'May I look at your public website and social pages before we meet?', choices: [{ v: 'Yes, please' }, { v: 'I would rather you did not' }] },
      { id: 'agree', kind: 'many', required: true, label: 'Tap to agree', choices: [
        { v: 'I will never send passwords or keys by form or email. I will share access live in our session.' }] },
      { id: 'tz', kind: 'text', hidden: true, label: 'Their time zone' },
    ],
  },
];

/** Every question, flat. */
export const READINESS_QUESTIONS: RQ[] = READINESS.flatMap((s) => s.questions);
