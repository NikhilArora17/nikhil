# StudioBee Case Study

**Role:** Lead UX/UI Designer
**Year:** 2026
**Deliverables:** Brand system, UI design, prototype
**Live site:** studiobee.co.in

---

## Overview

StudioBee is a creative studio in Gurgaon, offering branding, social content, video production, studio rental, and AI automation under one roof. The brief was short: make the website feel like the best agency in the room.

That's a positioning problem before it's a visual one. Plenty of agency sites reach for "premium" through more, more gradients, more stock photography, more copy explaining how great they are. I wanted the opposite: a site that earns trust through restraint and lets the actual work do the convincing.

## Who I was designing for

The realistic visitor is a founder or marketing lead in India, comparing two or three agencies on their phone, often on a commute. They are not going to read a manifesto. They're going to scroll fast, look for proof of real work, and decide in seconds whether this studio feels credible.

That single assumption, mobile-first and time-poor, shaped almost every layout and pacing decision on the site. Design started at a phone-sized viewport and scaled up, never the reverse.

**What this visitor needed from the site:**
- Proof of real client work, fast, not a paragraph about "who we are"
- A sense of taste and restraint, not a wall of icons and gradients
- A form that respects an Indian phone number and city, not a generic template
- A scroll experience that feels considered rather than busy

## Brand principles

I set three principles early and used them to settle every design disagreement later in the project.

**Premium restraint.** Every element has to earn its place. If it doesn't communicate something, it comes out. The goal was curated, not busy.

**Motion with purpose.** Animation is not decoration here. Every transition either shows state, guides attention, or reinforces the brand's energy. Nothing moves just because motion is easy to add.

**Mobile-first craft.** The first visit happens on a phone, so the phone layout isn't a "collapsed" version of the desktop design. It's the design.

## The visual system

**Color.** The palette is deliberately small: a saturated brand blue (#2F48DF) and near-black (#0A0A0A) carry most of the site, with an off-white for light sections. A warm cream is reserved for a single section, the team page, where the goal was to feel human and warm rather than corporate. Keeping cream out of every other section is what makes it land when it finally shows up.

**Type.** Headlines use Kulim Park, a display serif with enough character to feel like a studio rather than a template, set with tight negative tracking so large type reads as confident rather than loose. Body copy, buttons, and form fields all sit in DM Sans, a clean, neutral workhorse that gets out of the way. Pairing a display face with a plain sans is a small decision that does a lot of work: it's the difference between a site that looks designed and one that looks like a slide deck.

## Turning research into decisions

A few insights from competitor research and user thinking mapped directly onto layout choices:

| Insight | Decision |
|---|---|
| Most first contact happens on mobile, in short bursts of attention | The design starts at a phone-sized layout, not a shrunk-down desktop version |
| Portfolio work is the real decision factor, not the About page | Work is surfaced early in the scroll, before the services pitch, in a 9:16 portrait format that reads naturally on a phone |
| Dark, restrained visuals read as more premium than bright, busy ones | Services runs on near-black, the CTA runs on brand blue, and cream is held back for the one section that needs warmth |

I looked at three very different agency sites while shaping the direction: a UK studio running black backgrounds and unapologetic motion, a scaled-up agency leaning on white space and case studies, and a brand studio using cream tones and editorial type. None of them were copied. They were reference points for how restraint, confidence, and warmth each read differently, and I picked the mix that fit StudioBee.

## Information architecture

Section order on this site is a conversion decision, not a filing system. The visitor lands on the hero, sees proof of work almost immediately, understands the process, and reaches the contact form in a handful of scrolls.

**Page order:** Hero, Services, Work, Stats, Process, Testimonials, Team, Contact. Navigation stays fixed and visible throughout, with a single pill-shaped "Start a project" button as the one call to action. Everything else in the nav is a plain text link, so the one thing you're meant to click is never ambiguous.

Work sits third, right after the hero, ahead of the services pitch. That's the whole idea behind "proof before pitch": showing the work first answers the credibility question before the visitor even has to ask it, so by the time they reach the services section they're reading it with more trust, not less.

## Design decisions that changed along the way

Not everything shipped the way it started. A few sections went through real iteration before landing.

### The hero needed less, not more

The hero uses a signature wave effect, animated strips that reveal the background as the page loads, with the headline, logo, and menu icon shifting color as the wave passes over them. The earliest version leaned hard into this idea and ended up overcrowded, with too many moving parts competing for attention in the first three seconds.

I went back through it the way I'd edit typography: does this particular movement earn its place, or is it just motion for motion's sake? Anything that didn't clearly reinforce the brand's energy came out. What's left is a single, confident gesture instead of a dozen small distractions.

### Testimonials went through three looks before shipping

The testimonials section went through a light split-screen layout, then a cream card stack, before landing on a dark, frosted-glass card stack that visitors can drag through. The first version felt too corporate for a creative studio. The second felt warm but visually flat next to the rest of the site. The glass treatment finally gave it the full-bleed, tactile impact the brand needed, so it was worth carrying through to the final design.

### A uniform grid over a busy one

Case studies (eight projects, mixed formats and aspect ratios) went through an irregular masonry layout before shipping. It looked interesting in isolation, but with real content it turned into visual noise, every card seemed to compete to be the focal point. A uniform four-column grid ended up being the more disciplined, more confident choice: consistent proportions let the photography and video thumbnails do the talking instead of the grid shape.

### One button, one moving part

The ghost button that appears throughout the site (the "Our services" arrow link, for instance) only animates its arrow on hover, not the whole button. Early versions animated the entire button, which felt heavy and a little clumsy against the rest of the site's restraint. Isolating the motion to just the arrow made the gesture feel more intentional: a nudge, not a shape flying across the screen.

## The final UI, section by section

**Hero.** A wave reveal paired with a scrambled-text animation on the headline sets the tone in the first second: kinetic, confident, brand-forward.

**Services.** A dark, near-black section with blue-topped cards laying out what the studio actually does: social content, brand identity, video, studio space, and AI automation, all positioned as one integrated offering rather than a menu of disconnected services.

**Work.** An auto-scrolling marquee of 9:16 portrait project cards, a ratio that mirrors how this audience already consumes content on Instagram.

**Testimonials.** A stack of draggable, frosted-glass client quote cards that invites a bit of interaction rather than sitting static.

**Team.** The one section that shifts to the warm cream background. Team photos sit in grayscale by default and shift to full color on hover, a quiet, human touch that rewards curiosity without demanding it.

**Contact.** A blue, full-bleed section with a form built around who's actually filling it out: name, an Indian phone number format, email, city, and a message field, followed by an animated success state instead of a flat "thank you" page.

## Outcomes and reflection

**Reads like a top-tier agency.** The combination of restraint, tight type, and purposeful motion consistently draws comparisons to international studios, from a client base rooted firmly in the Indian market.

**The IA bet paid off.** Putting the work before the pitch was a hypothesis going in. It held up in how people actually used the site: work is the second thing anyone sees, right after the hero, and it's still doing the heaviest lifting in earning trust.

**What I'd revisit next time.** A small component library before the design system grew as large as it did. And I'd fight harder to get case studies into the primary navigation rather than leaving it one scroll away from the footer.
