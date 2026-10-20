---
title: How I Run My Music Business With AI, and What Broke
description: An independent artist's real AI setup for booking, posting, merch and royalties, what each part does, and the mistakes that taught me where the limits are.
date: 2026-10-20
status: draft
cluster: ai-for-artists
keyword: automate music business with ai
tags: [musicians, independent artist, automation, booking]
cta: start
---

I make bass and electronic music as The Great Medicine Show. I have released more than 100 songs, and in 2025 they reached 1.20 million streams from 226,000 listeners in 166 countries. I am also the booking agent, the social media manager, the merch department, the bookkeeper and the person who registers every song for royalties.

For a long time that second list ate the first one. So I built an AI operator to run the business side, and this is an honest account of what it does, what it does not, and what went wrong on the way.

If you are an independent artist wondering whether AI can take the admin off your plate, the short answer is yes, with a few rules you should not skip.

## The shape of it

Everything runs from one page on my laptop. I open it in the morning and it shows me the few things that need me. Behind that page are a handful of jobs that run on their own:

- **Booking.** It keeps my list of venues and festivals, drafts a personal letter to each one, and tracks who replied.
- **Posting.** It picks a moment from a song, cuts a short video, writes a caption, and schedules it to Instagram, Facebook, Bluesky and Discord.
- **Merch.** It turns public domain artwork into garment designs and lists them in my store.
- **Royalties.** It checks every released song against what is registered with my performing rights organisation, so nothing earns without me getting paid.
- **Watching.** It checks every morning that all of the above actually ran.

None of these sends anything on its own. Each one finishes by putting a card in front of me. I say yes, or I fix it, or I skip it.

## Booking: personal, small, and never a blast

The booking pipeline was the first thing I built and the one I rebuilt the most.

The tempting version is a mail merge to every venue you can find. Do not do it. Mass email from a small domain gets flagged, and once your domain is flagged your fan newsletter and your normal replies start landing in spam as well. You trade one bad week of outreach for months of damaged email.

What works for me is a short daily limit of personal letters, each one written for the room it is going to. A dance night gets a different set and a different pitch than a festival. The AI drafts the letter from my real credits and the venue's own page. I read it and send it. When a reply comes in, it drafts the answer and moves the venue along.

The biggest lesson came from a stranger. A booker read one of the early drafts and said it was obviously written by a machine. The tell was punctuation: long dashes where a person would use a comma. AI models love them and people almost never type them. Every public line my system writes is now checked for that before it can go out, and reply rates on personal letters are the reason I care.

## Posting without posting the same thing forever

Short video does not pay much directly, so I treat posting as the front door rather than the business. The goal is to be seen often without looking like a bot.

The system finds the strongest moment in a song, cuts a vertical clip on the beat, writes a caption in my voice, and queues it at a sensible time. Two rules stopped it from looking automated:

1. **Never the same picture under a new song.** If a visual has been used, it is retired. People notice repetition faster than you would think.
2. **Check the batch, not just the post.** Given similar instructions, an AI writes similar captions. One week, five posts in a row opened with nearly the same sentence. Now openers are compared across the whole week before anything is queued.

## Royalties: the money already owed to you

This is the least exciting part and probably the most valuable. Every song you release can earn performance royalties, but only if it is registered as a composition with your performing rights organisation, separately from the recording your distributor handles.

My system reads my distributor's catalogue export and turns it into registrations, field by field, and flags the songs that are released but not registered. The traps are mostly in the forms: the composition and the recording are different things, writer splits have to add up, and some fields silently cost you money when they are left blank. If you have a back catalogue and have never done this, it is worth an afternoon before anything else on this list.

## Merch from art nobody owns

Old artwork whose copyright has expired is free to print. The hard part is being sure. My merch tool only uses images whose public domain status is stated by the museum that holds them, and it refuses anything where that is unclear. Then it lays the art onto a garment, checks that no name or detail is cut off at the seams, and drafts a product.

## The watchdog, or the day I found out it had stopped

One night a mail check froze. The morning routine waited on it, and for four days none of the daily jobs ran. The dashboard looked completely normal, because it showed what was scheduled, not what had happened.

That was the most useful failure I had. Now a watchdog reads the log of what actually ran and puts a warning at the top of the page the moment the two disagree. If you build anything like this, build that first. A system that fails silently is worse than no system, because you stop checking.

## What I would tell another artist

Start with the one job you dread most and that follows the same steps every time. For most artists that is booking emails or royalty registration. Automate the drafting, keep the sending in your own hands, and add a check that tells you when it stops.

You do not need to write code to get most of this. I teach the setup in a small group [AI workflow workshop](/start), and I can set it up with you one to one on your own catalogue and calendar. If you run a business outside music, the same approach is written up in [what an AI dashboard actually does for a small business](/blog/ai-dashboard-for-small-business/).
