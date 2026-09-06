import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string' }),
    defineField({ name: 'role', title: 'Role / title', type: 'string' }),
    defineField({
      name: 'seo',
      title: 'Default SEO',
      description: 'Used by any page that does not set its own title and description.',
      type: 'seo',
    }),

    // Site chrome. Every one of these is queried by `getSite` and rendered on
    // every page, but none was declared here — so the Studio listed them as
    // "unknown fields" with a Remove button beside each, and no editor could
    // change the navigation or the footer.
    defineField({
      name: 'nav',
      title: 'Navigation (bottom tab bar)',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'navItem',
          fields: [
            { name: 'label', title: 'Label', type: 'string' },
            { name: 'href', title: 'Link', type: 'string' },
            {
              name: 'icon',
              title: 'Icon',
              description: 'Full Font Awesome class, e.g. "fa-solid fa-house". Must exist in src/lib/icons.ts.',
              type: 'string',
            },
            {
              name: 'match',
              title: 'Active path prefix',
              description: 'Marks the tab active. Defaults to the link — set it when they differ, e.g. "/start" for "/start?tab=form".',
              type: 'string',
            },
          ],
          preview: { select: { title: 'label', subtitle: 'href' } },
        },
      ],
    }),
    defineField({ name: 'footerLinks', title: 'Footer links', type: 'array', of: [{ type: 'cta' }] }),
    defineField({ name: 'copyrightYear', title: 'Copyright year', type: 'string' }),
    defineField({ name: 'openToWorkLabel', title: '"Open to work" label', type: 'string' }),
    defineField({ name: 'skipLinkLabel', title: 'Skip-to-content label', type: 'string' }),
    defineField({ name: 'backHomeLabel', title: '"Back home" pill label', type: 'string' }),
    defineField({
      name: 'closingCta',
      title: 'Default closing CTA buttons',
      // Not the shared `closingCta` object: that one carries a title, and the
      // site-wide default supplies only the buttons — each page writes its own
      // headline. Reusing it would show an editor a field nothing reads.
      description: 'The two buttons in the closing band. Each page supplies its own title.',
      type: 'object',
      fields: [
        defineField({ name: 'primary', title: 'Primary button', type: 'cta' }),
        defineField({ name: 'secondary', title: 'Secondary button', type: 'cta' }),
      ],
    }),

    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'phone', title: 'Phone', type: 'string' }),
    defineField({ name: 'location', title: 'Location', type: 'string' }),
    defineField({
      name: 'timeZone',
      title: 'IANA time zone (for footer clock)',
      type: 'string',
      initialValue: 'Asia/Dhaka',
    }),
    defineField({ name: 'gmtLabel', title: 'GMT label', type: 'string', initialValue: 'GMT+6' }),
    defineField({ name: 'openToWork', title: 'Open to work', type: 'boolean', initialValue: true }),
    defineField({ name: 'footerWordmark', title: 'Footer wordmark', type: 'string' }),
    defineField({
      name: 'whatsappPhone',
      title: 'WhatsApp number (digits only)',
      type: 'string',
    }),
    defineField({ name: 'whatsappMessage', title: 'WhatsApp prefilled message', type: 'string' }),
    defineField({
      name: 'socialLinks',
      title: 'Social profiles',
      type: 'array',
      description:
        'Every profile to link to, in the order they should appear. Drives the footer icons, the résumé contact line and the sameAs entries in the structured data — so adding one here is the only step.',
      of: [
        {
          type: 'object',
          name: 'socialLink',
          fields: [
            {
              name: 'label',
              title: 'Platform',
              type: 'string',
              description: 'Shown as the link’s accessible name, e.g. "GitHub".',
              validation: (r: any) => r.required(),
            },
            {
              name: 'url',
              title: 'Profile URL',
              type: 'string',
              description:
                'Full URL or just the path, e.g. github.com/yourname. A bare domain with no profile path is ignored — it would claim the wrong entity.',
              validation: (r: any) => r.required(),
            },
            {
              name: 'icon',
              title: 'Icon',
              type: 'string',
              description:
                'Font Awesome class pair, e.g. "fa-brands fa-github". Available: github, linkedin-in, x-twitter, instagram, youtube, facebook, threads, tiktok, telegram, discord, mastodon, reddit, pinterest, twitch, medium, dev, stack-overflow, codepen, gitlab, dribbble, behance, upwork, whatsapp. Anything else falls back to a link icon — run `npm run icons -- brands:<name>` to add a glyph.',
              validation: (r: any) => r.required(),
            },
          ],
          preview: {
            select: { title: 'label', subtitle: 'url' },
          },
        },
      ],
    }),
    defineField({
      name: 'socials',
      title: 'Socials (legacy)',
      type: 'object',
      description:
        'Superseded by Social profiles above, and only read when that list is empty. Kept so an un-migrated dataset keeps rendering.',
      options: { collapsed: true, collapsible: true },
      fields: [
        { name: 'github', title: 'GitHub URL', type: 'url' },
        { name: 'githubHandle', title: 'GitHub display handle', type: 'string' },
        { name: 'linkedin', title: 'LinkedIn URL', type: 'url' },
        { name: 'linkedinHandle', title: 'LinkedIn display handle', type: 'string' },
        { name: 'x', title: 'X (Twitter) URL', type: 'url' },
        {
          name: 'xHandle',
          title: 'X (Twitter) display handle',
          type: 'string',
          description:
            'e.g. x.com/yourname. The footer icon and the sameAs entry only appear once this resolves to a real profile — a link to the bare homepage claims the wrong entity.',
        },
      ],
    }),
    defineField({ name: 'website', title: 'Portfolio URL (display)', type: 'string' }),
    defineField({
      name: 'techStack',
      title: 'Tech stack (marquee)',
      type: 'array',
      of: [{ type: 'string' }],
    }),
  ],
  preview: { prepare: () => ({ title: 'Site Settings' }) },
});
