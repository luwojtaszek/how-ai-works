# Writing guide

How text for "How AI works" / "Jak działa AI" is written, in every language. `AGENTS.md` sets the structure of a topic; this file sets how the text reads. When the owner corrects a text, add the rule here.

## Every language

- Assume an engineer who is new to the topic. If they probably have not met the idea, start with the problem and how the approach solves it, before any widget.
- Show the whole mechanism in the order it really runs: what is set up first, what goes in, the loop, what stops it, and the real scale next to the toy example.
- Keep one order. Notes under a widget follow the widget's stages, and what is decided first is explained first.
- One fact, one place. Notes carry what the widget doesn't show.
- Define a term at first use, with a concrete value. Keep confusable terms apart. A term that collides with a word the reader already knows gets a plain name throughout and the jargon once, as a definition: "GPU program", and once "called a compute kernel, nothing to do with the operating system kernel".
- A multiplier or number in a diagram says what it counts and why it is that value, in the diagram or right next to it. "× 4" alone leaves the reader guessing.
- Test each sentence with "which ones, of what, why". "Gives shorter sequences" fails the test.
- Challenge what a reader will conclude, not only whether a claim is true. For each number ask which conditions it depends on, whether it is a worst case, and what "but what about X" follows, and answer that on the page. "A replica fits 13 conversations" was true and still misleading.
- Name the action, not a metaphor. A metaphor belongs in the "In plain words" box, not mixed with technical terms.
- Use one word for one thing across the page, widget and self-check. When a term stands for a process, an object and an action, pick one for each. A widget's "step" is not the mechanism's step: the inference page keeps "step" for the player and says "model pass" for the computation.
- A frequency names its unit in words the reader already has: "once per request", "many times per token". "At every step, many times" says nothing, and neither do player step numbers such as "steps 12–14".
- Vary the sentence. Don't repeat one shape down a list ("X stops, X won't stop"), and don't end a paragraph on a slogan or punchline.
- Don't build the text on contrast ("not X but Y") or on groups of three unless the content has that shape.
- Say who does the thing. "SPIFFE keeps them out of the context" was wrong: the harness does.
- Bold only a short name at the start of a bullet. A bold phrase of several words reads like a stray heading.
- Keep labels short: a tile holds one or two lines at 390 px, a result is a few words, and a widget title is at most two lines.
- Keep additions plain: bullets inside existing sections, decision rules over numbers. Report word growth.
- Don't use dashes in place of commas, colons or full stops.

## Polish

Write the Polish on its own, as a Polish engineer would say it. Don't translate sentence by sentence, in either direction.

| Avoid | Write |
|---|---|
| kto dzwoni, woła system | kto wysłał żądanie, wywołuje usługę |
| dowód tożsamości (for a credential; a real ID in an analogy is fine) | poświadczenie |
| krótko ważny, krótko żyjący | krótkotrwały |
| urząd (alone) | urząd certyfikacji (CA), then CA |
| sekret na okaziciela | klucz, którego może użyć każdy, kto go ma |
| token na okaziciela | token bearer |
| wpis rejestracji (repeated) | wpis |
| demon | usługa |
| odcięcie | zablokowanie |
| shell (in prose) | powłoka |
| pod (Kubernetes) | Pod, Pody, Podów, so it isn't read as the Polish preposition "pod" |
| service account | konto usługi |
| natywna tożsamość obciążenia | name the mechanism, e.g. role IAM |
| zdezorientowany zastępca | confused deputy |
| skuteczne uprawnienia | uprawnienia, które faktycznie obowiązują |
| SVID-y, bundle’em, cache’u | SVID, zestaw kluczy (bundle), cache, without declension |

Other things to watch: "ty" in advice and impersonal in mechanisms, no "chcesz X" as a calque of "you want X", "do X" rather than "pod X" for targets, and nouns joined to a clause in headings ("Ograniczenia i kiedy to się opłaca"). "Czego nie chroni" asks about the protected thing; write "przed czym nie chroni".

## English

- Translated rhythm reads as badly as translated Polish. Check phrases such as "the area of one authority", "the decision has to see" and "where the model ends".
- Prefer concrete verbs. "Issues identity" is vague; say what is issued, to whom.
- Keep words for an object, a subject and an action apart. In identity topics, a credential is the object, identity is who the process is, and proof is what a handshake shows about a key.
- Keep "certificate authority (CA)" at first use, then "CA".

## Code and widgets

- Code blocks use English labels, as real code would. Comments and the explanation under the block stay in the page language.
- Never translate field names, methods, selectors or error codes.
- Align blocks so they fit 390 px without wrapping or scrolling where possible.

## Review before anyone reads it

Every new topic and every heavy rewrite passes this, per language, before the preview:

1. Run `python3 scripts/qa/copy.py`. It rejects known mistakes in visible text; add each new unconditional one to its list. Wording that depends on context stays in review.
2. Run the two reader reviews below, the learner and the sceptic, as read-only agents. Verify each finding, fix it, and repeat the sceptical read on what changed. Accuracy review doesn't replace them: a claim can be true and still leave the wrong picture.
3. Two independent reviewers from another provider score the language out of 10, as readers, without being told what the author intended. They judge natural language, terminology, clarity and repetition, and give exact replacements.
4. Language edits can distort facts. Compare the result with the previous version, line by line, and check every changed claim.
5. Both reviewers must score the final wording at least 8/10, with no open factual or terminology error. A later wording change repeats the word check and the review of what changed.
6. Write the scores, reviewers and reviewed revision in the handover.

### Learner

An engineer new to the topic reads the page and widget and reports where they got lost, terms used before they are defined, jumps that don't connect, what they still can't explain afterwards, and what needs a picture.

### Sceptic

A senior engineer who uses these products daily and doesn't accept a claim because it is true. They go through every number and strong claim, including widget text, steps, self-check answers and follow-ups, and for each one that fails they report the quote, the wrong conclusion or the unanswered "but what about X?", and a short fix.

They look for:

- Numbers without their conditions: a worst case read as typical, an example read as a limit. "A replica fits 13 conversations" was true and read as "a replica serves 13 users".
- Claims that don't square with the real world the reader knows, such as how large services actually run.
- Arithmetic a reader will redo. "140 GB over 80 GB per GPU, so four GPUs" invites "why not two?".
- Mechanisms a reader expects and can't find, such as swapping out memory.
- Contradictions between levels, or between the widget and the notes.
- Conclusions that hold only for this example, and "must" where it is a choice.
- Comparisons that break down. Say where the analogy stops.

They also ask the owner's questions, the ones that found what accuracy review missed:

- Scale it up. Multiply a number to real traffic, or to the reader's own use, and compare with what exists. "13 conversations per replica" against millions of chats; "500,000 tokens × millions of sessions" against the GPU memory on Earth. If the result is absurd, the page is missing a mechanism.
- Push past the limit. What happens to user 25 when 13 fit: wait, fail, swap?
- Follow the state through time. For anything stored, say where it lives, who owns it, how long it lasts and what happens next: after the answer, at the next message, when idle, when memory runs out. Stopping at the happy path is the usual gap.
- Start from the reader's own experience. They use these products daily and have seen a cache lasting an hour, a long session, a model that gets slower. Reconcile the page with what they have seen, and don't make them bring it up.
- Name the scope. "In vLLM by default" is not "at large providers". Say which system a claim covers, and keep what is documented apart from what is inferred. Where a provider publishes nothing, say so.
- Distrust absence. "There is no X", "not by Y" and "only Z" need a search for the counterexample first. "Routing uses tokens, not a thread ID" came from three systems checked; session-key routing exists in all of them.
- Look for the familiar comparison. A connection pool explained more than the numbers did, once its limit was stated.
- Ask whether it can be simpler. A precise label a reader can't parse is worse than a plain one with the nuance in the notes: "many times per token" beat "steps 12–14".

Answer the question on the page or cut the number. Prefer the one fix that removes the wrong conclusion over a caveat on every sentence. Run it on new text too: the sceptic's own fixes can be wrong, as "two 84 GB conversations fill 140 GB" was.

Reviewers tend to add caveats and clipped sentences. Take the correction, not the extra length. Details belong lower on the page, and the opening stays simple if every claim in it is still true.
