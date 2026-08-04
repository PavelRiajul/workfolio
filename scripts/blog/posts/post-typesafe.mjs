import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/type-safe-mern/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-type-safe-mern',
  slug: 'type-safe-mern',
  title: 'Sharing TypeScript Types From Database to UI',
  category: 'fullstack',
  order: 33,
  readTime: '12 min read',
  date: 'August 2026',
  publishedAt: '2026-08-17',
  series: 'Type safety',
  excerpt:
    'One source of truth for your data shapes, so the compiler catches a mismatch between API and UI before a user does.',
  coverLabel: 'Type-safe stack — cover',
  body: body(
    p('The bug goes like this. Someone renames a field on the server — `fullName` becomes `name`, because the form only ever collected one. Every server test passes. The client keeps reading `user.fullName`, gets `undefined`, and renders an empty string where a name should be.'),
    p('Nothing errors. TypeScript is satisfied on both sides, because each side was told a different story about what a user is. It surfaces when somebody notices a blank space in a table, usually days later, usually in production.'),
    p('That class of bug is entirely preventable, and the prevention is not "use TypeScript" — both halves already were. It is having one definition of the shape rather than two that agree by convention.'),

    h2('Why does TypeScript not already catch this?'),
    p('Because types are erased at the network boundary. The server returns JSON, the client parses JSON, and JSON has no types. Whatever your client believes about the response is an assertion, not a check.'),
    p('Most codebases make that assertion twice. A `User` interface on the server describing what is sent, and a `User` interface on the client describing what is expected. They start identical, because someone copied one from the other, and they drift the first time one side changes.'),
    p('The compiler cannot help, because from its perspective both files are internally consistent. It has no way of knowing they were meant to describe the same thing.'),
    p('This is why "we use TypeScript everywhere" is not the reassurance it sounds like. Type safety within a module is nearly free and catches typos; type safety across a boundary requires that both sides derive from one definition, and almost nothing enforces that by default. A team can be rigorous about types on every file and still ship this bug on a Tuesday.'),
    img('two-truths', 'Two similar but subtly different shapes on either side of a gap', 'Two definitions that agree by convention. The compiler cannot tell they were meant to match.'),

    h2('Where should the types actually live?'),
    p('As close to the data as possible, generated rather than written, and imported by everything downstream.'),
    p('With Prisma, the schema is the source. `prisma generate` produces types for every model, and those types are derived from the same file the migrations come from — so a column that changed produces a type that changed, without anyone remembering to update an interface.'),
    p('That single property is what makes generation better than hand-written types, and it is not about saving typing. It is that a generated type cannot silently disagree with the database, whereas a hand-written one is always one forgotten edit away from doing so.'),
    code('ts', `
// schema.prisma is the source of truth.
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  orgId     String
  createdAt DateTime @default(now())
}

// Generated, not written. Changing the schema changes this.
import type { User } from '@prisma/client';
`),

    h2('How do you share them across the stack?'),
    p('A workspace package that both the server and the client depend on. The mechanics are unremarkable; the discipline about what goes in it is what matters.'),
    table('What belongs in the shared package', [
      ['Item', 'Shared?', 'Why'],
      ['Database model types', 'Yes', 'One definition, generated'],
      ['API request and response shapes', 'Yes', 'The contract itself'],
      ['Zod schemas for validation', 'Yes', 'Same rules on both sides'],
      ['Enums and constants', 'Yes', 'Status values drift otherwise'],
      ['Server-only utilities', 'No', 'Pulls server deps into the client bundle'],
      ['UI component props', 'No', 'Not part of the contract'],
    ]),
    p('The rule that keeps this from becoming a dumping ground: the shared package describes the contract between systems, not implementation details of either. Anything only one side uses stays where it is used.'),
    p('The failure mode is a shared package that imports server dependencies, which then get pulled into a client bundle. Types-only imports are erased at compile time and safe; a shared file that also exports a helper touching the filesystem is not.'),

    h2('What about the API response shape?'),
    p('The database model is rarely what the client should receive, and treating them as the same type is a mistake that surfaces as a leaked password hash.'),
    p('Define the response explicitly, derived from the model rather than duplicating it. TypeScript\'s utility types make this cheap, and deriving means a renamed column still propagates.'),
    code('ts', `
import type { User } from '@prisma/client';

// Derived, so a schema change still flows through — but explicit about
// what leaves the server. Adding a column does not silently expose it.
export type PublicUser = Pick<User, 'id' | 'name' | 'email' | 'createdAt'>;

export type GetUserResponse = { user: PublicUser };
`),
    p('The `Pick` is doing real work. With a spread of the whole model, adding a sensitive column later exposes it to every client immediately and silently. With an explicit list, adding a column does nothing until somebody decides it should.'),

    h2('Do types validate anything at runtime?'),
    p('No, and this is the misunderstanding that undoes otherwise careful setups.'),
    p('TypeScript types vanish at compile time. `await res.json() as GetUserResponse` compiles perfectly and tells you nothing about what actually arrived. If the server returned an error object, a stale shape, or nothing at all, the assertion is simply wrong and the failure happens later, somewhere unrelated.'),
    p('Anywhere data crosses a boundary you do not control, it needs parsing rather than asserting. That is what Zod is for, and it is the same tool used to [validate model output before it reaches the database](/blog/validating-llm-tool-calls-zod) — the principle is identical: never trust a shape you did not construct.'),
    code('ts', `
import { z } from 'zod';

export const PublicUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.coerce.date(),
});

// One definition produces both the runtime check and the static type.
export type PublicUser = z.infer<typeof PublicUserSchema>;
`),
    p('That last line is the pattern worth internalising. The schema is written once and yields both the validator and the type, so they cannot disagree — which is the same failure this whole post is about, one level down.'),
    img('parse-not-assert', 'A gate examining an incoming package before it enters a structure', 'A cast is a claim. A parse is a check. Only one of them fails where the problem is.'),

    h2('Where exactly should validation happen?'),
    p('At every boundary where the data originates outside your own code, and nowhere else.'),

    h3('Incoming requests'),
    p('Always. Request bodies come from the network and can contain anything. Parse into a validated type at the top of the handler, and let everything downstream take the parsed type.'),

    h3('Third-party API responses'),
    p('Always. An integration changing its response shape without telling you is routine, and the failure without parsing is a confusing error three functions away rather than a clear one at the point of entry.'),

    h3('Your own API, from your own client'),
    p('Usually not. If both sides import the same types from the same package and deploy together, the contract is enforced at build time. Parsing adds runtime cost and code for a class of error the build already prevents.'),

    h3('Your own API, from a mobile client'),
    p('Always, and this is the exception people miss. A mobile app on a user\'s phone can be months out of date, so an old client is talking to a new server. That is a boundary you do not control the timing of, whatever the type system says.'),

    h2('How does this work with a mobile client?'),
    p('The same shared package, with one significant addition: versioning that assumes old clients exist.'),
    p('On [a marketplace with a React Native companion app](/work/anchor), the web and mobile clients consumed the same API and the same types. Web deploys atomically with the server; mobile does not, and some proportion of users simply never update.'),
    p('That changes what a safe change is. Adding an optional field is safe. Adding a required one is not, because an old client will not send it. Renaming anything is not. Removing a field breaks whoever still reads it.'),
    table('API changes and old mobile clients', [
      ['Change', 'Safe for old clients?', 'Approach'],
      ['Add optional field', 'Yes', 'Ship it'],
      ['Add required request field', 'No', 'Default it server-side first'],
      ['Rename a field', 'No', 'Add new, keep old, remove later'],
      ['Remove a field', 'No', 'Deprecate, wait, then remove'],
      ['Tighten validation', 'No', 'Log violations before enforcing'],
    ]),
    p('Sharing types makes these changes visible at build time — the compiler shows you what breaks. It does not make them safe on its own; that still needs the expand-and-contract discipline in the right-hand column.'),

    h2('What about MongoDB specifically?'),
    p('The same approach with one extra hazard: the database will not stop you writing a document that does not match your type.'),
    p('With Postgres, a column that does not exist is an error. With MongoDB, a field spelled wrong is a new field, written happily, and the type says otherwise. The type system describes an intention rather than a constraint.'),
    p('Two things address it. Use an ODM or Prisma\'s Mongo connector so writes go through a typed layer rather than raw driver calls. And validate on read, at least for documents written before your current schema — a collection several years old contains shapes your types have never heard of.'),
    p('Optional fields deserve particular care. In Mongo, "the field is absent" and "the field is null" are different states, and a type declaring `name?: string` covers both while application code frequently handles only one.'),
    p('The same applies to identifiers. Mongo\'s `_id` is an ObjectId, not a string, and it serialises to a string when it crosses the network. A type that says `_id: string` is correct on the client and wrong on the server, which is exactly the kind of small mismatch that produces a lookup returning nothing with no error to explain it. Normalise at the boundary — convert once, on the way out — rather than letting both representations circulate.'),
    p('Dates carry the same hazard in a more common form. A `Date` on the server becomes an ISO string over JSON, and a type declaring `createdAt: Date` on the client is a lie that TypeScript will happily accept until something calls a date method on a string. Zod\'s `z.coerce.date()` handles it at the parse step, which is one more argument for parsing rather than casting.'),
    img('mongo-drift', 'A set of similar documents with one carrying an extra unmatched element', 'The database will not stop you writing a shape your types deny. Validate on read.'),

    h2('How do you keep the types honest over time?'),
    p('Three habits, all cheap, and the first is the one that matters.'),

    h3('Generate in CI, and fail on drift'),
    p('Run `prisma generate` in the pipeline and fail the build if the output differs from what is committed. That catches the case where someone edits the schema and forgets to regenerate, which is otherwise found at runtime.'),

    h3('Type-check the whole workspace, not per package'),
    p('A shared package change that breaks a consumer must fail the build. Checking packages in isolation is how a shared type change ships and breaks the client, which is exactly the failure the shared package existed to prevent.'),

    h3('Treat `any` and non-null assertions as debt'),
    p('Both silence the compiler at precisely the boundaries where it is most useful. A lint rule that flags them in shared code is worth the small friction, because one `any` at the API boundary erases the guarantee for everything downstream of it.'),

    h2('What about tRPC and the end-to-end alternatives?'),
    p('There is a category of tooling that removes the boundary entirely rather than typing across it, and it is worth knowing when it fits.'),

    h3('What tRPC actually does'),
    p('Your API procedures are TypeScript functions, and the client imports their types directly. There is no schema to keep in sync because the implementation is the contract. Rename a field and the client fails to compile immediately, with no shared package to maintain.'),
    p('Where it fits — a TypeScript monorepo where you own both ends and deploy them together — it is genuinely excellent and removes most of this post\'s work.'),

    h3('Where it stops fitting'),
    p('Anything that is not TypeScript consuming it. A public API, a partner integration, a mobile app in Swift or Kotlin, a webhook consumer. tRPC is not a wire format anyone else can read, so a second, conventional API appears alongside it and you now maintain two.'),

    h3('The middle option'),
    p('OpenAPI with generated clients gets you types across languages at the cost of a build step and a specification to keep honest. Heavier than tRPC, more portable, and the right answer when a third party will ever consume the API.'),

    h3('What I default to'),
    p('Conventional REST with shared types and Zod, because it degrades gracefully. It works when a second consumer appears in a language nobody anticipated, and the shared-package cost is a few hours rather than a rewrite. tRPC is better where it fits; my projects too often grow a consumer that does not.'),
    img('api-approaches', 'Three connection styles between two structures, of differing rigidity', 'tRPC is better where it fits. Shared types and Zod survive a consumer nobody anticipated.'),

    h2('What breaks when the shared package is wrong?'),
    p('Two failure modes worth recognising, because both look like tooling problems and are actually design problems.'),

    h3('The package that pulls the server into the browser'),
    p('Someone exports a helper alongside the types, that helper imports the database client, and suddenly the client bundle contains Prisma. It usually surfaces as a build error about Node built-ins, and the fix is discipline rather than configuration: types and schemas only, with `import type` where possible so the import is erased entirely.'),

    h3('The package everything depends on'),
    p('If every change to shared types rebuilds and redeploys everything, teams stop changing them. The types then drift by omission — people add fields locally rather than touching the shared file, which is the original problem wearing a hat.'),
    p('The mitigation is keeping the package genuinely small. It describes the contract. The moment it starts accumulating utilities, constants nobody shares and helper functions, it becomes a bottleneck and people route around it.'),
    img('shared-package-shape', 'A small central component connected to two larger ones, deliberately minimal', 'Keep it small enough that changing it is routine. A bottleneck gets routed around.'),

    h2('Is this worth it on a small project?'),
    p('Past two consumers of the same data, yes. Below that, the honest answer is that it is marginal.'),
    p('A single Next.js application with server components has no network boundary in the interesting sense — the same process reads the database and renders the page, and types flow naturally without any of this. Adding a shared package there is ceremony.'),
    p('The moment there is a second consumer — a mobile app, a separate dashboard, a public API, a background worker — the shapes exist in two places and will drift. That is the threshold, and it arrives sooner than people plan for.'),
    p('The setup cost is a few hours. The bug it prevents is the kind that reaches production silently and is diagnosed by staring at a blank cell in a table, which reliably costs more than that.'),
    quote('The compiler cannot check an agreement it was never shown. Sharing the definition is what turns a convention into a constraint.'),

    h2('What does this look like when it goes right?'),
    p('Unremarkably, which is the point. You rename a field in the schema, run generate, and the build fails in four places across two packages — each one a spot that would otherwise have been a silent `undefined`.'),
    p('You fix them, the build passes, and you ship with reasonable confidence that the client and server still agree. No test caught it, because no test needed to; the shape mismatch was structurally impossible to ship.'),
    p('The second-order benefit is that changing the data model stops being frightening. When a rename is a compiler error rather than a search-and-hope, the schema stays clean instead of accumulating fields nobody dares touch — and [a data model that stays clean is the thing that keeps a project cheap to change](/blog/project-stack-templates).'),
    img('build-fails-early', 'A chain of connected components with one flagged before assembly completes', 'Four build errors instead of four silent undefineds. That is the whole return.'),

    h2('Conclusion'),
    p('Generate types from the schema so they cannot disagree with the database. Put the contract — model types, request and response shapes, Zod schemas, enums — in one package both sides import. Derive response types explicitly rather than spreading the model, so adding a column never silently exposes it.'),
    p('Remember that types are not validation. Parse at every boundary whose data originates outside your code: incoming requests, third-party responses, and anything from a mobile client that may be months behind the server.'),
    p('Then enforce it in CI — generate and fail on drift, type-check the whole workspace, treat `any` at a boundary as debt. That is a few hours of setup for a category of bug that otherwise ships quietly and is found by a user noticing something blank.'),
    p('If you are retrofitting this onto a codebase where the shapes have already drifted, do it in the order that finds problems fastest. Generate types from the schema first and import them on the server — that alone surfaces places where the code and the database already disagree. Then create the shared package with only the response shapes, and switch the client to it; the build errors that appear are a list of every mismatch currently in production. Add Zod parsing at the boundaries last, once you know which ones are actually returning something other than what they claim.'),
    p('That sequence matters because the first step is cheap and the diagnostic value is front-loaded. Teams that start by writing Zod schemas for everything spend a week on validation before discovering the mismatch that was causing the bug they set out to fix.'),
  ),
  faqs: faq([
    ['How do you share types between frontend and backend?',
     'Put the contract — model types generated from the schema, request and response shapes, Zod schemas and enums — in a workspace package both sides import. Keep implementation details out of it, and never export anything touching server dependencies.'],
    ['Do TypeScript types validate data at runtime?',
     'No. Types are erased at compile time, so casting a JSON response tells you nothing about what arrived. Use Zod at boundaries where data originates outside your code, and infer the static type from the schema so the validator and the type cannot disagree.'],
    ['Should I generate types from my database schema?',
     'Yes. A generated type cannot silently disagree with the database, whereas a hand-written interface is always one forgotten edit away from doing so. Run generation in CI and fail the build if the committed output has drifted.'],
    ['How do you keep a mobile app in sync with API types?',
     'Share the same types, and assume old clients exist regardless. Adding optional fields is safe; adding required ones, renaming or removing is not. Use expand-and-contract, and always parse responses on mobile since the client may be months behind the server.'],
  ]),
};
