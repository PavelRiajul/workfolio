import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/r2-vs-s3/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-r2-vs-s3',
  slug: 'r2-vs-s3',
  title: 'Cloudflare R2 vs S3: Where the Bill Actually Comes From',
  category: 'backend',
  order: 52,
  readTime: '12 min read',
  date: 'September 2026',
  publishedAt: '2026-09-06',
  series: 'Foundations',
  excerpt:
    'Zero egress fees is the headline. The decision is really about egress volume, ecosystem depth and how much of your architecture assumes AWS is nearby.',
  coverLabel: 'R2 versus S3 — cover',
  body: body(
    p('Object storage is the least interesting decision in a stack right up until the bill arrives, at which point it becomes the only interesting one. The storage itself is cheap on every provider and roughly the same price. The variable that actually moves the number is how much data leaves.'),
    p('That is the whole of R2\'s pitch: storage at a comparable rate with no charge for egress. Whether that matters to you depends entirely on what your application does with the files after it stores them, and for a meaningful share of projects the honest answer is that it does not.'),
    p('This is a decision I make on most builds — R2 sits in my [stack templates](/stack) alongside Cloudflare Pages — so here is the actual comparison rather than the marketing one.'),

    h2('What are you actually being charged for?'),
    p('Four things, and only two of them differ meaningfully between the providers.'),
    table('The four line items', [
      ['Charge', 'S3', 'R2', 'Matters when'],
      ['Storage per GB/month', 'Low', 'Comparable', 'You hold a lot of data'],
      ['Egress per GB', 'Charged', 'Free', 'Data leaves often'],
      ['Class A ops (write, list)', 'Charged', 'Charged', 'You write constantly'],
      ['Class B ops (read)', 'Charged', 'Charged, cheaper', 'You read constantly'],
    ]),
    p('Storage is the row everyone compares and the row that almost never decides anything. At typical project scale — tens or hundreds of gigabytes — the monthly difference is a few dollars, which is noise against the time spent choosing.'),
    p('Egress is the row that produces the surprising invoices. It is charged per gigabyte leaving the provider, and "leaving" includes every image loaded by a browser, every file downloaded by a customer, and every object read by a service running somewhere else.'),
    img('four-lines', 'Four cost components of differing weight, with one substantially larger than the rest', 'Storage is the line everyone compares. Egress is the line that produces the invoice nobody expected.'),

    h2('When does egress actually dominate?'),
    p('When the ratio of reads to stored bytes is high — which is a property of the application, not of its size.'),
    ul([
      '**User-uploaded media served publicly.** Every profile photo, product image and attachment is egress on every view that misses a cache.',
      '**Video or large downloads.** A single 200MB file downloaded a thousand times is 200GB of egress from a fifth of a gigabyte of storage.',
      '**Serving assets to another cloud.** Anything read by a service outside the provider pays egress every time, including your own infrastructure if it lives elsewhere.',
      '**Data exports.** A B2B product where customers export their data monthly can move more bytes out than it holds.',
    ]),
    p('And where it does not dominate: private documents read occasionally by their owner, backups written often and read almost never, and anything sitting behind a CDN with a high hit rate. In those cases you are paying for storage, the storage prices are similar, and the choice can be made on other grounds.'),
    p('Notice that all four have the same shape: bytes leaving many times relative to bytes stored once. That ratio, not the absolute size of either number, is the thing to estimate. A hundred gigabytes read twice a month and a hundred gigabytes read ten thousand times cost the same to store and differ by four orders of magnitude to serve.'),
    p('The useful calculation takes a minute. Estimate stored gigabytes and monthly egress gigabytes, multiply each by the provider rates, and see whether the second number is a rounding error or the entire bill. If it is a rounding error, stop optimizing and pick on ecosystem fit.'),

    h3('The trap: egress you did not know you had'),
    p('The bills that shock people are usually not from the obvious downloads. They are from a misconfigured image pipeline fetching originals on every request, a log shipper reading objects back, a scraper hitting public URLs, or a build step that pulls a large dataset on every CI run. All four are invisible in the application code and all four are pure egress.'),
    p('Whatever you choose, put a spend alert on the account. It is a five-minute setup and it is the only thing standing between a misconfiguration and a month of it.'),

    h2('What does R2 give up?'),
    p('Depth. S3 has had two decades to accumulate features, and some of them are load-bearing in ways you only notice when they are absent.'),
    table('What S3 has that R2 does not match', [
      ['Capability', 'Why it might matter'],
      ['Storage classes and lifecycle tiering', 'Cold archival at a fraction of standard pricing'],
      ['Deep IAM integration', 'Fine-grained policies shared with the rest of an AWS estate'],
      ['Event notifications to a mature ecosystem', 'Triggering functions, queues and pipelines on upload'],
      ['Cross-region replication controls', 'Explicit residency and disaster-recovery placement'],
      ['Third-party tooling assuming S3', 'Backup tools, data platforms and SDKs that target it by default'],
    ]),
    p('The last row is broader than it looks. A great deal of software speaks S3 natively, and while R2 offers an S3-compatible API that covers the common operations, compatibility is not identity — an integration that reaches for a less-common feature will find it missing, and the failure arrives at integration time rather than at decision time.'),

    h3('S3 compatibility is good, not total'),
    p('The core operations work: put, get, list, multipart upload, presigned URLs. That covers nearly everything an application does directly. What tends to be missing or different is the periphery — specific ACL semantics, some header behaviors, certain lifecycle configurations. Test your actual tooling against it before committing rather than assuming the compatibility label is complete.'),

    h3('Cold storage is a real gap'),
    p('If your workload is "write once, read almost never, keep for seven years", S3\'s archival tiers are dramatically cheaper than any standard-rate storage. Compliance archives and log retention are the obvious cases, and they are the ones where the storage row finally does decide the answer.'),
    img('capability-gap', 'Two feature sets of different breadth, overlapping substantially at the center', 'The overlap covers what most applications do. The difference is at the edges, and the edges arrive at integration time.'),

    h2('What does R2 give you beyond price?'),
    p('Two things that are genuinely architectural rather than financial.'),

    h3('It sits inside the Cloudflare network'),
    p('If your site is on Pages and your API is a Worker, R2 is a binding rather than a network call — no credentials to manage, no signing, no round trip out of the network. That is a real simplification, and it is the reason R2 fits the templates where the rest of the stack is already Cloudflare.'),
    code('ts', `
// A binding, not an SDK client. No keys in the environment.
export default {
  async fetch(req: Request, env: Env) {
    const object = await env.BUCKET.get(new URL(req.url).pathname.slice(1));
    return object ? new Response(object.body) : new Response('Not found', { status: 404 });
  },
};
`),

    h3('Public buckets have a CDN in front of them by default'),
    p('An R2 bucket exposed on a custom domain is served through the same edge network as everything else on Cloudflare, with caching, and without a separate distribution to configure. On AWS the equivalent is S3 plus CloudFront plus an origin access configuration, which is three things instead of one.'),
    p('Neither of these matters if your infrastructure is already AWS. A Lambda reading from S3 in the same region is the mirror image of the same argument, and the correct conclusion is usually that object storage should live wherever the compute reading it lives.'),

    h2('How do you decide?'),
    p('Three questions, in order, and most projects are answered by the first.'),
    ol([
      '**Where does your compute run?** Storage next to compute avoids egress entirely and removes a network hop. If everything is on AWS, use S3. If everything is on Cloudflare, use R2. This decides the majority of cases on its own.',
      '**How much data leaves per month, relative to what you store?** If egress dwarfs storage, R2\'s pricing is a structural advantage rather than a discount. If it does not, this row is noise.',
      '**Does anything in your toolchain assume S3 beyond the basics?** Backup software, data pipelines, analytics platforms. Check before choosing, not after.',
    ]),
    p('What should not decide it: a per-gigabyte storage comparison. The rates are close enough that at any scale below terabytes the difference is smaller than an hour of your time.'),
    img('decision-order', 'Three sequential questions with the first branching to most outcomes', 'Where the compute runs answers most of these. The pricing argument only decides the cases it does not.'),

    h2('How do uploads actually work on each?'),
    p('Identically, and this is the part of the comparison that turns out not to be a comparison at all — which is good news, because it is the part most applications spend their code on.'),
    p('The pattern on both is that the browser uploads directly to storage and your server never touches the bytes. The server issues a short-lived presigned URL, the client PUTs to it, and the server is told afterwards. Routing uploads through your API instead means paying for the bandwidth twice and holding a request open for the duration of a large file.'),
    code('ts', `
// Same shape on both. The server signs; the browser uploads.
const url = await storage.signedUrl(key, 300);   // five minutes is plenty
// ...client does a PUT to url with the file as the body.
`),

    h3('Constrain what the signature permits'),
    p('A presigned PUT URL is a capability. Whoever holds it can write to that exact key until it expires, so it should be scoped narrowly: a specific key you generated, a content type, a maximum size, and the shortest expiry the upload realistically needs. An unconstrained signed URL with a one-hour life is an open write endpoint for an hour.'),

    h3('CORS is configured on the bucket, not in your app'),
    p('Direct browser uploads need the bucket to allow your origin, and this is the step that breaks in production after working locally because the deployed origin was never added. Both providers configure it the same way; both fail the same way when it is missed.'),

    h3('Verify after the upload, never trust the client'),
    p('The browser tells your API the upload succeeded. That claim is unverified. Confirm the object exists and check its size and type from the server before marking a record complete — otherwise a user can create a database row pointing at a file that was never uploaded, or one whose contents do not match what they declared.'),
    img('direct-upload', 'A file moving from a client straight to a storage endpoint, with a separate short signaling path to a server', 'The server signs and is told. It never carries the bytes, on either provider.'),

    h2('How do you write code that can move later?'),
    p('By putting a thin interface between your application and whichever one you picked, and keeping it genuinely thin.'),
    code('ts', `
// The whole surface most applications need.
export interface Storage {
  put(key: string, body: ReadableStream | Buffer, contentType: string): Promise<void>;
  get(key: string): Promise<ReadableStream | null>;
  delete(key: string): Promise<void>;
  signedUrl(key: string, expiresIn: number): Promise<string>;
}
`),
    p('Four methods covers the overwhelming majority of real usage. Implement it twice if you actually need to, and keep provider-specific concepts — bucket policies, storage classes, event configuration — out of it entirely, since those are the parts that do not port and pretending otherwise produces a leaky abstraction that is worse than either concrete option.'),

    h3('Do not build an abstraction you will never use'),
    p('This is worth saying plainly, because "make it swappable" is how simple things become complicated. The interface above is justified because it is four methods and it makes the code testable with an in-memory implementation. An abstraction layer that tries to model both providers\' full feature sets is a project of its own and it will still not be portable.'),

    h3('Key naming is the part that actually locks you in'),
    p('Migrating objects between providers is a copy job — annoying but mechanical. What is not mechanical is a key scheme with provider assumptions baked in, or URLs to specific object paths stored in your database and shared with customers. Store keys, derive URLs at read time, and the move stays a copy job. This is the same reasoning behind [signed upload URLs](/blog/supabase-row-level-security) generally: the path should never be the access control.'),
    img('thin-interface', 'A narrow connector between an application and two interchangeable backing stores', 'Four methods. Anything wider stops being portable and starts being a second product.'),

    h2('What about backups of the bucket itself?'),
    p('This is the question neither provider\'s marketing raises and it applies equally to both. Durability is not the same thing as recoverability.'),
    p('Object storage is extremely unlikely to lose your data. It is entirely willing to delete it when your code asks, and application bugs, a wrong prefix in a cleanup script and a compromised key all look like legitimate delete requests from the storage layer\'s side.'),

    h3('Turn on versioning, or accept that delete is final'),
    p('Versioning keeps overwritten and deleted objects retrievable for a configured window, which turns a catastrophic script into an annoying afternoon. It costs storage for the retained versions, which is exactly the trade you want.'),

    h3('Separate the credentials that can delete'),
    p('The application usually needs to write and read. It rarely needs to delete in bulk. Issuing a key without delete permission to the running application, and keeping deletion behind a separate credential used by a specific job, removes the largest single cause of accidental loss.'),

    h3('Replicate to a second place if the files are the product'),
    p('For a document product or anything where the uploads are irreplaceable, a periodic copy to a bucket on a different provider is worth the egress it costs. It is the same argument as [backups you have actually restored](/blog/tested-database-backups): the copy that has never been read is a guess, not a backup.'),
    img('bucket-backup', 'A primary store with a versioned history layer and a separate offsite copy', 'Durability protects against hardware. Versioning and a separate copy protect against your own code.'),

    h2('What does a migration between them involve?'),
    p('Less than expected for the data, more than expected for everything referencing it.'),
    p('The object copy itself is a well-trodden path — R2 has a migration mode that pulls objects from an S3 bucket on first request, so the copy happens gradually under real traffic rather than as a big-bang job. That handles the bytes.'),
    p('What takes the time is the rest: updating every signed-URL generator, checking that any hardcoded URLs in old records still resolve, repointing whatever writes uploads, verifying CORS behaves the same for direct browser uploads, and confirming your backup process points at the new bucket. None of these is hard and all of them are easy to miss one of.'),
    quote('The bytes are the easy part. It is the URLs already sitting in your database, and in somebody\'s email, that make the migration a project.'),

    h3('Run both for a period'),
    p('Write to both, read from the old, verify, then flip reads. The same expand-and-contract shape as [a schema change](/blog/zero-downtime-migrations), and for the same reason — there is no moment where a rollback loses data.'),

    h2('What do I actually use?'),
    p('R2 on most of my builds, and S3 where the project already lives in AWS. That is less of a preference than it sounds.'),
    p('The templates put the site on Cloudflare Pages and the API in Workers or on Render, so R2 is either a binding or a same-network call, and the assets it serves are behind the same edge cache as everything else. In that arrangement it is the least-friction option, and the egress pricing is a benefit rather than the reason.'),
    p('The honest counterweight: on a project with an existing AWS footprint — an RDS instance, Lambdas, an IAM structure the team already reasons about — putting object storage on a different provider adds a second set of credentials, a second dashboard and a second place to look during an incident. That operational cost is real and it usually outweighs an egress line that was not large to begin with.'),
    p('There is also a case where neither is the answer. If the files are small, few, and only ever read by your own application, the database you already have may be the simpler place for them — one system to back up, one thing to secure, no signed URLs. That stops being true quickly as size and volume grow, but it is worth checking before adding infrastructure to a project that could avoid it.'),

    h2('Conclusion'),
    p('Put object storage next to the compute that reads it. That single rule decides most projects correctly, avoids egress entirely, and removes a network hop and a set of credentials — it is a better reason than any per-gigabyte comparison.'),
    p('If you do have real egress — public media, video, large downloads, exports, or reads from outside the provider — R2\'s zero-egress pricing is a structural difference rather than a discount, and it is worth building around. If you do not, the storage rates are close enough that the decision should be made on ecosystem fit.'),
    p('Know what S3 has that R2 does not: archival tiers for write-once-read-never data, deeper IAM, a mature event ecosystem, and a long tail of third-party tools that target it natively. Test your actual toolchain against R2\'s S3-compatible API rather than trusting the compatibility label, because the gaps are at the edges and they surface during integration.'),
    p('Keep a four-method interface between your application and whichever you chose, store keys rather than URLs, and derive links at read time. That keeps a future move to a copy job instead of a rewrite. And whichever you pick, set a spend alert on the first day — the expensive bills come from a misconfigured pipeline nobody noticed, not from the traffic you planned for. If you want a second opinion on which side your project falls, [get in touch](/start).'),
  ),
  faqs: faq([
    ['Is Cloudflare R2 actually cheaper than S3?',
     'For workloads with significant egress, substantially — R2 does not charge for data leaving. Storage rates are close enough to be noise at typical project scale. If your files are read rarely or sit behind a high-hit-rate CDN, the two bills look similar and price should not decide it.'],
    ['Is R2 fully S3-compatible?',
     'The core operations are: put, get, list, multipart upload and presigned URLs, which covers nearly everything an application does directly. The gaps are at the edges — some ACL semantics, lifecycle configurations and less-common headers. Test your specific tooling before committing rather than assuming parity.'],
    ['What does R2 not have that S3 does?',
     'Archival storage classes for write-once-read-never data, deep IAM integration with the rest of an AWS estate, a mature event-notification ecosystem, and the long tail of third-party software that targets S3 natively. Compliance archives and log retention are where these gaps decide the answer.'],
    ['How hard is it to migrate from S3 to R2?',
     'The object copy is straightforward — R2 can pull objects from an S3 bucket on first request, so it happens gradually under real traffic. The work is everything referencing the objects: signed-URL generation, CORS for direct uploads, hardcoded URLs in old records, and the backup process.'],
  ]),
};
