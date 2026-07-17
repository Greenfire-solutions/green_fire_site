# Content Status — Greenfire Innovation Center

Use this document before publishing website updates. It distinguishes verified facts from pilot, planned, and vision language.

## Verified active statements

- **Greenfire Innovation Center** is the public-facing name for this website and pilot initiative.
- **Greenfire Creator Commons** is the name of the open operating model being developed.
- **Greenfire Sessions** is the name for public events and activations connected to projects.
- Contact email: `civilizationexplorer@gmail.com`
- Professional **offerings** (media, studio, workshops, cinematic production) are available for booking via the contact form when Web3Forms is configured.
- Website CMS at `/admin` can edit offerings and page copy.

## Pilot development (in progress, not fully operational)

- Community intake and listening sessions
- Pilot governance / council concepts
- Bioregional mapping framework
- Greenfire Sessions event model
- Contribution credits (design only)
- Vercel Blob CMS publishing
- Event revenue allocation example (illustrative percentages only)

## Planned systems (not yet built)

- Formal participatory budgeting
- Live impact dashboard with real metrics
- Youth cohort enrollment with safeguarding workflow
- Community-governed data infrastructure
- Conflict repair formal process
- Open-source repository publication
- Donation URL integration
- Chapter certification standards

## Long-term vision (do not present as current)

- Multi-community chapter network
- Formal tribal partnerships (unless written confirmation exists)
- Named Elder advisory board
- Published open-source license and repository
- Functioning credit ledger / wallet
- AI-assisted governance (decisions remain human)
- Completed “Shade the Block” example project (used as illustration only)

## External links still needed

Configure in `src/config/linksConfig.ts`:

| Key | Status |
|-----|--------|
| `donationUrl` | Empty — add when verified |
| `repositoryUrl` | Empty — add when LICENSE + repo published |
| `documentationUrl` | Empty |
| `eventTicketUrl` | Empty |

## Forms

| Form | Endpoint | Status |
|------|----------|--------|
| General contact / booking | Web3Forms (`VITE_WEB3FORMS_ACCESS_KEY`) | Requires Vercel env var |
| Get Involved intake | Same Web3Forms API | Same |
| Admin publish | Vercel Blob + optional GitHub | Requires Blob storage connected |

## Partnerships requiring confirmation

Do not add partner names, tribal endorsements, grant sponsors, or government relationships without written approval.

## Privacy and legal

- Privacy policy page: **not yet created** — footer links to contact for data questions
- Nonprofit / legal entity status: **not claimed** on site unless verified
- Youth data: general interest form only until safeguarding policy exists

## Open-source license status

`linksConfig.openSourceStatus` = **`planned`**

Do not change to `published` until a real `LICENSE` file and repository URL exist.

## Before each publish

1. Review new copy for “active now” claims that should be pilot/planned/vision
2. Confirm no fake statistics or member counts were added
3. Confirm no invented URLs in `linksConfig`
4. Run `npm run build`
5. Redeploy Vercel after CMS publish if using Blob storage
