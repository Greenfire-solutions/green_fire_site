/* THE ONBOARDING QUESTIONS, and the one home for them. The /onboard page
   draws from this list and every answer is stored WITH its question's
   wording, so the operator shows what was asked without keeping a copy.

   Taken from AIWorkshops/make-intake-form.gs (the Google Form these replace)
   and made easier on a phone: anything that has a short list of answers is a
   tap, not a box to type in. Only what Jordan cannot plan the day without is
   required. No em dashes: Jordan reads them as machine written. */

export type Question = {
  id: string;
  label: string;
  help?: string;
  kind: 'text' | 'long' | 'one' | 'many';
  choices?: string[];
  required?: boolean;
  placeholder?: string;
};

export type Section = { title: string; help?: string; questions: Question[] };

export const SECTIONS: Section[] = [
  {
    title: 'Your work',
    help: 'This is the part that shapes our time together. Short answers are fine.',
    questions: [
      { id: 'week', kind: 'long', required: true, label: 'What do you do, and what does a normal week look like?', help: 'What takes the hours?' },
      { id: 'drain', kind: 'long', label: 'Where does your time disappear?', help: 'The task you do over and over and quietly resent.' },
      { id: 'one_task', kind: 'long', required: true, label: 'If one task could run itself, which one would you pick?', help: 'As specific as you can. "Reply to booking enquiries" is the right size; "automate my business" is too big.' },
      { id: 'shape', kind: 'text', label: 'Finish this: when ___ happens, I want it to ___, so I can ___.', placeholder: 'When a booking comes in, draft my reply, so I can answer in a minute' },
      { id: 'worth_it', kind: 'long', label: 'What would make this worth it to you?' },
    ],
  },
  {
    title: 'Where you are starting from',
    help: 'No wrong answers. It only tells me how fast to go.',
    questions: [
      { id: 'ai_use', kind: 'one', required: true, label: 'How much have you used AI tools like ChatGPT or Claude?', choices: [
        'Never opened one', 'Tried it a few times', 'Most weeks, for writing or ideas', 'Daily, I lean on it', 'I have tried to build something with one'] },
      { id: 'terminal', kind: 'one', label: 'Have you used a terminal or command line?', help: 'The window with text in it. Most people have not, and that is fine.', choices: [
        'No, and it sounds a bit scary', 'No, but I am not worried', 'A little, with instructions', 'Yes, I am comfortable'] },
      { id: 'done_before', kind: 'many', label: 'Which of these have you done? Tap any that are true.', choices: [
        'Built or edited a website', 'Used a spreadsheet for more than a list', 'Connected two apps (Zapier, Make)', 'Written any code', 'Installed software from a website'] },
    ],
  },
  {
    title: 'Your setup',
    help: 'So nobody spends the first hour installing things. "Do not know" is a useful answer.',
    questions: [
      { id: 'computer', kind: 'one', required: true, label: 'What computer will you use?', choices: ['Mac', 'Windows', 'Linux', 'Only a tablet or phone'] },
      { id: 'install', kind: 'one', label: 'Can you install software on it?', help: 'Work laptops are sometimes locked by an IT department.', choices: [
        'Yes, it is mine', 'I think so', 'No, someone else manages it', 'I do not know'] },
      { id: 'site_on', kind: 'one', label: 'What is your website built on?', choices: [
        'Squarespace', 'Wix', 'WordPress', 'Shopify', 'Someone built it for me', 'Something else', 'No website', 'I do not know'] },
      { id: 'tools', kind: 'text', label: 'What tools does your business run on?', help: 'Email, calendar, invoicing, booking, a shop. Just names, never logins.', placeholder: 'Gmail, Google Calendar, Square, Instagram' },
      { id: 'ai_paid', kind: 'many', label: 'Do you pay for any AI already?', choices: ['No', 'ChatGPT', 'Claude', 'Something else', 'Not sure'] },
    ],
  },
  {
    title: 'Before we meet',
    questions: [
      { id: 'examples', kind: 'long', label: 'Three real examples of the task you picked', help: 'Rough is fine. Change any names you would not want others to see.' },
      { id: 'barriers', kind: 'long', label: 'Anything that could get in the way?', help: 'Reading, hearing, focus, a hard stop, a slow connection, nerves. I would rather plan around it.' },
      { id: 'else', kind: 'long', label: 'Anything else I should know?' },
      { id: 'ready', kind: 'many', label: 'Tap to agree', required: true, choices: [
        'I will have my computer and charger', 'I will have one real task in mind',
        'I will never send passwords or keys to anyone, including Jordan'] },
    ],
  },
];
