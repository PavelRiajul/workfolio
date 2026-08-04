import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string' }),
    defineField({ name: 'role', title: 'Role / title', type: 'string' }),
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
