import { body, p, h2, h3, ul, ol, quote, code, table, faq } from '../pt.mjs';

const img = (name, alt, caption) => ({
  _type: 'image', _key: `img-${name}`,
  src: `/blog/signed-upload-urls/${name}.avif`, alt, caption,
});

export default {
  _id: 'post-signed-upload-urls',
  slug: 'signed-upload-urls',
  title: 'Direct File Uploads With Signed URLs, Done Safely',
  category: 'backend',
  order: 55,
  readTime: '12 min read',
  date: 'February 2026',
  publishedAt: '2026-02-26',
  series: 'Foundations',
  excerpt:
    'The browser uploads straight to storage and your server never holds the bytes — plus the four checks that stop a signed URL being an open write endpoint.',
  coverLabel: 'Signed upload URLs — cover',
  body: body(
    p('The obvious way to handle file uploads is to post them to your API, which then forwards them to storage. It works, it is easy to reason about, and it stops working the first time somebody uploads a 400MB video.'),
    p('The problem is not any single large file. It is that every byte crosses your server twice, a request stays open for the duration, and a platform with a request timeout — which is all of them — will cut a slow upload off partway through with no useful error.'),
    p('The fix is to take your server out of the data path entirely. It signs a short-lived URL, the browser uploads directly to storage, and your API is told afterwards. Here is that flow with the security holes closed, because the naive version has several.'),

    h2('Why not just proxy the upload?'),
    p('Four reasons, and the last one is the one that decides it on serverless platforms.'),
    table('Proxying versus direct upload', [
      ['', 'Through your API', 'Direct to storage'],
      ['Bandwidth paid', 'Twice', 'Once'],
      ['Request duration', 'Length of the upload', 'Milliseconds'],
      ['Memory used', 'File size, or streaming complexity', 'None'],
      ['Works on a serverless platform', 'Up to the body limit', 'Any size'],
    ]),
    p('That body limit is a hard wall rather than a slow degradation. Most serverless request handlers cap the request body at a few megabytes, and no amount of streaming cleverness gets around it because the limit is enforced before your code runs.'),
    p('The direct pattern makes file size irrelevant to your application. A 2KB avatar and a 2GB export use the same code path, and the only thing that changes is how long the browser is busy.'),
    img('two-paths', 'One route where data passes through an intermediate stop, and one where it goes straight to its destination', 'Take the server out of the data path and file size stops being an application concern.'),

    h2('What does the flow actually look like?'),
    p('Three steps, and the third is the one people skip.'),
    ol([
      '**Request permission.** The client tells your API what it wants to upload — filename, content type, size. The API decides whether that is allowed, generates a key, and returns a signed URL.',
      '**Upload directly.** The browser PUTs the file to that URL. Your server is not involved and does not know when it finishes.',
      '**Confirm.** The client calls your API again. The API verifies the object exists, checks its actual size and type, and only then creates the database record.',
    ]),
    code('ts', `
// Step 1 — the server decides the key. Never accept one from the client.
const key = \`\${orgId}/\${crypto.randomUUID()}\${extname(filename)}\`;
const url = await storage.signedUrl(key, {
  method: 'PUT',
  expiresIn: 300,
  contentType,                 // baked into the signature
  contentLengthRange: [1, MAX_BYTES],
});
await db.upload.create({ data: { key, orgId, status: 'pending' } });
`),
    p('Creating a pending record at step one rather than at step three gives you something to reconcile against. Without it, an upload that completes but never gets confirmed is an orphaned object nobody knows about, and there is no way to distinguish it from a file somebody deleted.'),

    p('The other thing step one is for is refusing the upload before it happens. A user on a plan with a 10MB limit trying to send 400MB, an account over its storage quota, a file type you do not accept — all of these should be a clear error from your API in a hundred milliseconds, not a rejection after the browser has spent four minutes transferring. The signing endpoint is where every policy decision belongs, because it is the last point at which refusing is cheap.'),

    h2('Why must the server generate the key?'),
    p('Because a client-supplied key is a client-supplied path, and a path is where the data ends up.'),
    p('If the client sends `filename` and you sign a URL for it, a client sending `../../config/settings.json` or another tenant\'s known key gets a signed URL to write there. Signing is not authorization — it authorizes exactly what you signed, which is the whole problem when what you signed came from the caller.'),
    code('ts', `
// Wrong: the caller chooses where its data lands.
const key = \`uploads/\${req.body.filename}\`;

// Right: the server composes the key from facts it controls.
const key = \`\${orgId}/\${crypto.randomUUID()}\${sanitizedExt}\`;
`),

    h3('Keep the original filename as metadata, not as the path'),
    p('Users care that their download is called `Q3 report.pdf`. That belongs in a database column and in the `Content-Disposition` header at download time — not in the storage key, where it introduces encoding problems, collisions and the traversal risk above.'),

    p('Random identifiers rather than sequential ones matter here too. A key containing an incrementing number tells anyone who obtains one URL that neighbouring files exist, and invites walking the range to find out what else is there.'),

    h3('Prefix every key with the tenant'),
    p('Object storage has no tenant column, so the prefix is the only structure available. Leading every key with the organization id means a storage-level policy can be written against it, and it makes an accidental cross-tenant read visible rather than plausible.'),
    img('key-control', 'A destination path assembled from server-held facts rather than from an incoming value', 'Signing authorizes exactly what you signed. If the caller chose the path, you signed the caller\'s choice.'),

    h2('What must the signature constrain?'),
    p('Four things, and a signed URL missing any of them is looser than it looks.'),
    table('What to bake into the signature', [
      ['Constraint', 'Without it'],
      ['Expiry', 'A permanent write capability for that key'],
      ['Method', 'A URL meant for upload may also allow other operations'],
      ['Content type', 'An "image" upload accepts an HTML file that then serves from your domain'],
      ['Content length range', 'A user fills your bucket with a single request'],
    ]),
    p('The content-type row is the one with teeth. If a user can upload HTML or SVG to a bucket served on your domain, they can serve script from your origin — which is a cross-site scripting hole delivered through a file upload, and it bypasses every content security policy scoped to self.'),

    p('The size constraint is worth insisting on even though it is the one most often skipped, because it is the difference between a storage bill you can predict and one you cannot. Without a length range in the signature, a signed URL issued for a profile photo will happily accept a hundred gigabytes, and the only thing stopping that is the goodwill of whoever holds the URL.'),

    h3('Keep the expiry short'),
    p('Five minutes is generous for starting an upload. The window only needs to cover the time between your API responding and the browser beginning the transfer — not the transfer itself, which continues once started.'),

    h3('Serve user content from a separate domain'),
    p('Even with content types constrained, user-uploaded files should not be served from the domain that holds your session cookies. A separate domain means a file that does manage to execute has no access to anything that matters. This is cheap to set up on day one and awkward once URLs are in circulation.'),

    h2('Why does the confirm step matter?'),
    p('Because everything the client told you before the upload was a claim, and the upload is where claims become checkable facts.'),
    p('A client can request a signed URL for a 2MB PNG and then upload nothing at all, or upload something else within the constraints, or upload correctly and then lie about it. Only the server checking the object after the fact resolves any of that.'),
    code('ts', `
// Step 3 — verify against storage, not against what the client says.
const head = await storage.head(key);
if (!head) return badRequest('upload_not_found');
if (head.size > MAX_BYTES) { await storage.delete(key); return badRequest('too_large'); }
if (!ALLOWED.has(head.contentType)) { await storage.delete(key); return badRequest('bad_type'); }

await db.upload.update({ where: { key }, data: { status: 'ready', size: head.size } });
`),

    h3('Content type from the header is still a claim'),
    p('The stored content type is whatever was declared at upload. For anything that will be rendered or processed, check the actual bytes — the file signature in the first few bytes tells you what it really is, and a mismatch between that and the declared type is a strong signal that something deliberate is happening.'),

    p('There is a second reason the confirm step earns its place, and it is not about security at all. It is the only moment where your application learns that a file is actually usable. Without it, every downstream feature has to cope with a record that might point at nothing, and that uncertainty spreads — the gallery, the export, the email attachment all need a defensive check. One confirm step removes it from all of them.'),

    h3('Reconcile the pending records'),
    p('A scheduled job that deletes pending uploads older than an hour — both the row and any object — keeps the orphans from accumulating. Without it, every abandoned upload is storage you pay for indefinitely and cannot identify later.'),
    img('confirm-step', 'A claimed result being checked against the actual stored artifact before being accepted', 'Everything before the upload was a claim. The head request is where it becomes a fact.'),

    h2('How do you handle large files?'),
    p('Multipart uploads, which are the same pattern with more signatures.'),
    p('Above a few hundred megabytes a single PUT becomes fragile — a dropped connection at ninety percent means starting again. Multipart splits the file into parts, each uploaded independently and retryable on its own, then combined by storage at the end.'),
    ol([
      '**Initiate** on the server, which returns an upload id.',
      '**Sign a URL per part.** The client uploads parts in parallel and collects an identifier for each.',
      '**Complete** on the server with the ordered list of part identifiers.',
    ]),
    p('The operational detail nobody expects: an initiated multipart upload that is never completed leaves its uploaded parts in storage, billed, and invisible in a normal object listing. A lifecycle rule that aborts incomplete uploads after a few days is the only thing that cleans them up, and it is one setting.'),

    img('multipart', 'A single large item divided into independently transferred segments, reassembled at the destination', 'Each part retries on its own. The trap is the parts left behind when the upload is never completed.'),

    h3('Do not build this until you need it'),
    p('Multipart triples the number of round trips and adds real state to manage. For a product where uploads are images and documents, a single PUT with a size cap is simpler and sufficient. Add multipart when file sizes actually demand it, not in anticipation.'),

    h2('What happens after the file lands?'),
    p('Usually something — a thumbnail, a text extraction, a conversion — and where you trigger it decides how the whole thing fails.'),

    h3('Trigger from your confirm step, not from a storage event'),
    p('Storage event notifications look like the elegant option and they decouple the processing from a call you control. The cost is that the event carries no application context: it knows a key appeared and nothing about which record, which tenant or whether the upload was ever confirmed. Triggering from your own confirm handler means the job starts with everything it needs.'),

    h3('Process in a job, not in the request'),
    p('Image resizing and document parsing are slow and occasionally fail. Doing them inline makes the confirm call slow and turns a processing failure into an upload failure, which is a confusing thing to show a user whose file uploaded perfectly. Enqueue, return, and let the record carry a processing status.'),

    h3('Keep the original, always'),
    p('Derived files can be regenerated; originals cannot. Storing only the resized version saves storage and removes the ability to change your mind about dimensions, formats or quality later — which you will, the first time the design changes.'),

    h3('Make the status visible in the API'),
    p('A record that is uploaded but not yet processed should say so, rather than appearing complete with a missing thumbnail. Three states — pending, ready, failed — is enough, and it lets the client show something honest instead of a broken image.'),
    img('post-upload', 'A stored artifact branching into derived outputs while the original is retained', 'Derive in a job, keep the original, and let the record say which state it is in.'),

    h2('How do downloads work?'),
    p('The same way in reverse, and the access decision has to happen on every single one.'),
    p('The tempting shortcut is to store the signed URL in the database when the file is uploaded. That turns a time-limited capability into a permanent one, and it means anyone who obtains the URL — from a shared screenshot, a forwarded email, a browser history — has the file forever.'),
    code('ts', `
// Generate at read time, after the permission check. Never store the URL.
const file = await db.upload.findFirst({ where: { id, orgId: session.orgId } });
if (!file) return notFound();
return { url: await storage.signedUrl(file.key, { method: 'GET', expiresIn: 60 }) };
`),
    p('Notice that the ownership check is part of the query rather than a comparison afterwards — the same rule as [everywhere else a record is fetched](/blog/role-based-auth-nextjs-express), and for the same reason: a scoped query cannot return the wrong row, while a comparison can be skipped.'),

    p('Expiry on downloads should be short for a reason people find counterintuitive: a download URL only needs to survive long enough for the browser to start fetching it. Once the transfer has begun it continues regardless of whether the signature has since expired, so sixty seconds is ample even for a large file, and it drastically narrows the window in which a leaked URL is worth anything.'),

    h3('Public files can just be public'),
    p('Not everything needs signing. Product images on a storefront, blog illustrations and marketing assets are public by intent, and putting them behind signed URLs costs a round trip per view and breaks CDN caching for no security benefit. Signing is for files with an access rule.'),

    h3('Signed URLs and caching do not mix'),
    p('Every signed URL is unique, so a CDN caches each one separately and the hit rate collapses. For private files served frequently — a document viewer, an image gallery behind auth — a longer expiry with a stable URL per session, or a proxy that authenticates and caches, is usually better than signing per request.'),
    img('download-flow', 'An access decision preceding the issue of a time-limited retrieval capability', 'Generate at read time, after the check. A stored signed URL is a permanent capability wearing an expiry.'),

    h2('What breaks in practice?'),
    p('Five things, in roughly the order I encounter them on projects that already have uploads working.'),
    ul([
      '**CORS.** Direct browser uploads need the bucket to allow your origin, and the deployed origin is invariably the one that was never added. It works locally and fails in production.',
      '**Clock skew.** Signatures are time-based. A server whose clock has drifted issues URLs that are already expired or not yet valid, and the error message says neither.',
      '**Progress reporting.** A direct upload gives the browser real progress events, which is a genuine improvement — but only if the client uses them. Otherwise a large upload looks frozen.',
      '**Retries duplicating objects.** A retried upload with a freshly generated key leaves the first object behind. Reuse the key on retry so the second attempt overwrites rather than accumulates.',
      '**No virus scanning.** If users upload files that other users download, something has to scan them. Trigger it on the confirm step and keep the file unavailable until it passes.',
    ]),
    p('The last one is easy to dismiss on an internal tool and not dismissible at all on anything where one customer\'s upload reaches another customer. That is a distinction worth making explicitly rather than by default.'),
    quote('A signed URL is a capability, not a request. Everything you did not constrain in the signature is something the holder is allowed to do.'),

    h2('What does this cost to build?'),
    p('Half a day, and most of that is the parts that are not the upload.'),
    p('The signing endpoint, the client PUT and the confirm handler are perhaps an hour between them on either [R2 or S3](/blog/r2-vs-s3), since the API is the same shape on both. What takes the rest is CORS configuration on the bucket, the cleanup job for pending records, the lifecycle rule for incomplete multipart uploads, and deciding where user content is served from.'),
    p('The honest counterweight is that this is more moving parts than a proxied upload. Three round trips instead of one, a pending state to reconcile, and a failure mode — the confirm call never arriving — that does not exist when your server holds the file. On a project where uploads are small and rare, proxying is genuinely the simpler choice and I would not talk anybody out of it.'),

    h2('Conclusion'),
    p('Sign a short-lived URL on the server, let the browser upload directly to storage, and confirm afterwards. Your API never holds the bytes, so file size stops being an application concern and serverless body limits stop mattering.'),
    p('Generate the key on the server from facts you control — tenant prefix, random identifier, sanitized extension — and never from anything the client sent. A signature authorizes exactly what you signed, so a caller-supplied path is a caller-chosen destination.'),
    p('Constrain the signature on all four axes: expiry, method, content type and size range. The content type matters most, because an unconstrained upload of HTML or SVG to a bucket on your own domain is a scripting hole that bypasses a self-scoped content security policy.'),
    p('Verify after the upload rather than trusting the confirmation. Head the object, check its real size and type, delete it if it fails, and reconcile pending records on a schedule so abandoned uploads do not accumulate as storage nobody can identify.'),
    p('For downloads, generate the URL at read time after an ownership-scoped query, and never store a signed URL — that converts a time-limited capability into a permanent one. Serve user content from a separate domain, and skip signing entirely for files that are public by intent. If you are adding uploads to something and want the signing path reviewed before users can reach it, [that is a quick job](/start).'),
  ),
  faqs: faq([
    ['Why upload directly to storage instead of through the API?',
     'Bandwidth is paid once instead of twice, the request finishes in milliseconds instead of staying open for the transfer, and file size stops mattering. On serverless platforms the request body limit is a hard wall enforced before your code runs, so proxying caps uploads at a few megabytes.'],
    ['Is a signed upload URL safe to give to the browser?',
     'Only if the signature is constrained. Bake in a short expiry, the HTTP method, the content type and a maximum size, and generate the storage key server-side. An unconstrained signed URL is an open write endpoint for whoever holds it, for as long as it lasts.'],
    ['Do you still need to check the file after a direct upload?',
     'Yes. Everything the client said before the upload was a claim. Head the object to confirm it exists, check the real size and content type against your limits, delete it if it fails, and only then create the record. For rendered files, check the actual bytes rather than the declared type.'],
    ['Should download URLs be signed and stored in the database?',
     'Signed yes, stored no. A stored signed URL turns a time-limited capability into a permanent one that works for anyone who obtains it. Generate it at read time after an ownership-scoped query, with a short expiry. Files that are public by intent do not need signing at all.'],
  ]),
};
