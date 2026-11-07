// Single place for studio facts. Values marked TODO are placeholders to confirm.
export const site = {
  name: 'Studio Jio',
  domain: 'studioj.io',
  headline: 'Clear websites for real businesses.',
  tagline: 'Built with intent.',
  description:
    'Studio Jio plans, designs and builds websites for founders and local businesses. Built with intent.',
  email: 'hello@studioj.io', // TODO confirm
  location: 'Texas, USA', // TODO confirm
  timeZone: 'America/Chicago', // TODO confirm
  availability: 'Taking projects for 2027', // TODO confirm
  ctaLabel: 'Start a project',
  callLabel: 'Book a 20-minute intro call',
  social: [
    { label: 'Instagram', href: '#' }, // TODO
    { label: 'LinkedIn', href: '#' }, // TODO
  ],
  version: 'v1.0',
};

export const process = [
  {
    name: 'Strategy',
    body: 'We learn the business, the customer and the one action the site must drive, then agree on structure before any design.',
    deliverables: ['Goals and audience brief', 'Sitemap and page outlines', 'Copy direction'],
  },
  {
    name: 'Design',
    body: 'Layouts built from the brief and your brand. You review real pages with real copy, not mood boards.',
    deliverables: ['Desktop and mobile designs', 'Two rounds of revisions', 'Clickable prototype'],
  },
  {
    name: 'Build',
    body: 'Hand-coded, fast and easy to update. We launch it, connect your domain and stay on call after go-live.',
    deliverables: ['Production website', 'SEO and analytics setup', '30 days of support'],
  },
];

export const values = ['Clarity', 'Craft', 'Follow-through'];

export const pad = (n: number) => String(n).padStart(2, '0');
