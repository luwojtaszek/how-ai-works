# Writing guide

How text for "How AI works" / "Jak działa AI" is written, in every language. `AGENTS.md` sets the structure of a topic; this file sets how the text reads. When the owner corrects a text, add the rule here.

## Every language

- Assume an engineer who is new to the topic. If they probably have not met the idea, start with the problem and how the approach solves it, before any widget.
- Show the whole mechanism in the order it really runs: what is set up first, what goes in, the loop, what stops it, and the real scale next to the toy example.
- Keep one order. Notes under a widget follow the widget's stages, and what is decided first is explained first.
- One fact, one place. Notes carry what the widget doesn't show.
- Define a term at first use, with a concrete value. Keep confusable terms apart.
- Test each sentence with "which ones, of what, why". "Gives shorter sequences" fails the test.
- Challenge what a reader will conclude, not only whether a claim is true. For each number ask which conditions it depends on, whether it is a worst case, and what "but what about X" follows, and answer that on the page. "A replica fits 13 conversations" was true and still misleading.
- Name the action, not a metaphor. A metaphor belongs in the "In plain words" box, not mixed with technical terms.
- Use one word for one thing across the page, widget and self-check. When a term stands for a process, an object and an action, pick one for each.
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
2. A sceptical reader goes through every number and claim, asks what a reader would wrongly conclude and how it fits the real world, and the findings are fixed before anyone else reads the text.
3. Two independent reviewers from another provider score the language out of 10, as readers, without being told what the author intended. They judge natural language, terminology, clarity and repetition, and give exact replacements.
4. Language edits can distort facts. Compare the result with the previous version, line by line, and check every changed claim.
5. Both reviewers must score the final wording at least 8/10, with no open factual or terminology error. A later wording change repeats the word check and the review of what changed.
6. Write the scores, reviewers and reviewed revision in the handover.

Reviewers tend to add caveats and clipped sentences. Take the correction, not the extra length. Details belong lower on the page, and the opening stays simple if every claim in it is still true.
