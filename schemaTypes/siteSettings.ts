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
      name: 'socials',
      title: 'Socials',
      type: 'object',
      fields: [
        { name: 'github', title: 'GitHub URL', type: 'url' },
        { name: 'githubHandle', title: 'GitHub display handle', type: 'string' },
        { name: 'linkedin', title: 'LinkedIn URL', type: 'url' },
        { name: 'linkedinHandle', title: 'LinkedIn display handle', type: 'string' },
        { name: 'x', title: 'X (Twitter) URL', type: 'url' },
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
