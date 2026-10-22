---
title: Bioregional AI and Bioregional Technology | Green Fire
description: BioRegional OS is open source bioregional technology: ecoregions, watersheds, soil and species data, consent gates, and an AI that follows the same rules.
h1: Bioregional AI and bioregional technology
kicker: Bioregional technology
keyword: bioregional AI
tags: [bioregional AI, bioregional technology, bioregionalism, bioregional commons, watershed, ecoregion, BioRegional OS, open source]
date: 2026-10-22
status: published
cta: open-source
---

Bioregionalism starts from a simple idea: the place you live is defined by its water, soil, climate and living things, not by the lines a county drew. A bioregion is a watershed and the communities of plants, animals and people that share it. Bioregional technology is any tool that helps people see that place clearly and organise around it. Bioregional AI is the same thing with a machine helping, and it is only worth having if it follows the same rules the community does.

Green Fire builds both. Our main project is BioRegional OS, an open source operating system for a bioregional commons. This page explains what it does, how the AI part works, and what it refuses to do, which matters as much.

## What BioRegional OS does

BioRegional OS runs on one computer, with no account and no cloud. You open it, click find my bioregion, and give it a place. From that point it builds a picture of where you are out of real public data.

**Your ecoregion.** The software ships with an offline copy of every EPA Level III and Level IV ecoregion in the United States, so it knows which ecological region a point falls in even with no internet.

**Your watershed.** It looks up the watershed boundaries from the USGS Watershed Boundary Dataset, down to the small sub watersheds that a creek group or a neighbourhood can actually walk.

**Your water.** It reads live river and stream gauges from USGS, so a chapter can see what the creek is doing today and how that compares with the season.

**Your soil and living things.** It pulls soil survey data from USDA, species observations from community science projects such as iNaturalist and GBIF, and hazard and drought data from public agencies, then compiles all of it into a regional file that keeps working offline.

**Where every fact came from.** Each source and its licence are written in one registry, and the credit line on every layer is generated from it. Nobody types a licence by hand, so nobody gets it wrong.

The result is a living atlas of your bioregion in 3D, sitting next to the people, projects and decisions of the commons that cares for it.

## The protocol, enforced in code

A bioregional commons is not just a map. It is a way of making decisions together. BioRegional OS carries the BioRegional Commons protocol, a manual Green Fire wrote for chapters, and turns its rules into gates the software will not let anyone skip.

A project moves through twelve stages: a signal that something needs attention, listening, a baseline of the land, council review, research, co design, a resource plan, a prototype, teaching and telling, testing, a decision, and a report that lets the next community repeat it. Along the way it has to pass gates including an ecological assessment, Indigenous consent, youth safeguarding and data consent. A gate closes on evidence and a named person, never on a checkbox. If a gate does not apply, one sentence from a person saying why is enough, and that sentence becomes part of the permanent record.

The most important rule is about consent. **No dataset can ever close a consent gate.** A map of Indigenous territories can tell a chapter that a conversation is needed. It can never stand in for the conversation. Cultural information is never downloaded automatically, and threatened species are named and counted but never placed on a map, because a location is the one thing a poacher needs.

## How the bioregional AI works

Every capability in BioRegional OS is defined once, as a tool with a clear description and a strict set of inputs. The same tools appear in three places: the screens a person clicks through, a plain web API, and the Model Context Protocol, which lets an AI assistant such as Claude use them.

That design is the whole point. An AI working on your commons calls exactly the same tools a steward does, and hits exactly the same gates. It can ask what is next for a project, compile the data for a new area, draft a baseline report or summarise a season of gauge readings. It cannot mark Indigenous consent as given, skip council review, or publish a member's private observation, because the tool it would need does not let anyone do that.

There is also an operator inside the software that walks every stage of every project and reports what is blocked, what has slipped and what is missing, each with the protocol rule it comes from. Ask it before guessing. It is the closest thing a volunteer chapter has to a coordinator who never forgets.

## Why open source, and why local first

Bioregional data is about people's homes, water and sacred places. Putting it on a platform owned by someone else, in a building in another state, is the opposite of bioregionalism. BioRegional OS keeps the commons on the chapter's own machine, backs it up into one file the chapter controls, and erases it properly when someone withdraws, because a record that only looks deleted is a consent failure.

The code is public under the AGPL. Any community can run it, adapt it to their land and laws, and share their changes. It connects to other open projects through their published data and protocols rather than copying their code, so it stays genuinely open. Find it on GitHub at [Greenfire-solutions/Bioregional-OS](https://github.com/Greenfire-solutions/Bioregional-OS), and read about the wider [open source work](/open-source).

## Where it fits with the rest of our work

BioRegional OS is the bioregional layer of a larger set of [solarpunk tools](/solarpunk). For a land project or eco village, the regional dossier it builds becomes the starting point for site design, see [permaculture AI](/permaculture-ai), and the projects it shapes can be run day to day in Civil X, our [eco village software](/eco-village-technology). For a developer or a new land project, the same data feeds the interactive 3D maps on our [tech page](/tech).

## Common questions

### What is bioregional technology?

Bioregional technology is any tool that helps people understand and organise around their bioregion, the watershed and ecological region they live in. It includes mapping ecoregions and watersheds, monitoring water, soil and species, and software that helps a community make decisions about its place together.

### What is bioregional AI?

Bioregional AI is artificial intelligence that works on behalf of a place and the people who care for it. In BioRegional OS, the AI uses the same tools a human steward uses and is held to the same consent and review gates, so it can gather data, draft reports and track projects without ever deciding something only a person should decide.

### Is BioRegional OS free?

Yes. BioRegional OS is open source under the AGPL licence. You can download it from GitHub and run it on your own computer. Green Fire offers paid help with setup, training and adapting it to a specific region.

### Does BioRegional OS work outside the United States?

The built in ecoregion and watershed layers are for the United States. A global ecoregion layer can be added as a file, and the species and community science sources are worldwide. A chapter outside the US can still run the protocol, the gates and the decision making.

### How is this different from a GIS map?

A GIS map shows data. BioRegional OS holds a community's projects, decisions and consent alongside the data, and enforces the steps between noticing a problem and acting on it. The map is one tab of it.
