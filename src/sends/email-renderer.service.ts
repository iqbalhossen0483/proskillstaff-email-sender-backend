import { Injectable } from '@nestjs/common';

export interface TeamMember {
  name: string;
  title: string;
  photoUrl?: string;
  bio?: string;
}

export type LayoutAContent = {
  name: string;
  description?: string;

  subjectLine: string;
  companyName: string;
  tagline?: string;

  headerBgColor: string;

  bodyParagraphs: string[];

  ctaLabel?: string;
  ctaUrl?: string;

  teamMembers: TeamMember[];

  contactEmail?: string;
  contactPhone?: string;
  contactWebsite?: string;
  contactAddress?: string;
};

export type LayoutBContent = {
  name: string;
  description?: string;

  subjectLine: string;
  companyName: string;
  tagline?: string;

  headerBgColor: string;

  greetingText?: string;

  bodyParagraphs: string[];

  ctaLabel?: string;
  ctaUrl?: string;

  highlights: string[];

  contactEmail?: string;
  contactPhone?: string;
  contactWebsite?: string;
  contactAddress?: string;
};

@Injectable()
export class EmailRendererService {
  // ======================
  // ✅ Layout A Renderer
  // ======================
  renderLayoutA(content: LayoutAContent): string {
    const themeColor = content.headerBgColor || '#2563EB';

    // ── Body paragraphs ──────────────────────────────────────────────
    const bodyHtml = (content.bodyParagraphs ?? [])
      .map(
        (p) =>
          `<p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">${p}</p>`,
      )
      .join('');

    // ── CTA button ───────────────────────────────────────────────────
    const ctaHtml =
      content.ctaLabel && content.ctaUrl
        ? `<div style="text-align:center;margin:24px 0;">
          <a href="${content.ctaUrl}"
             style="display:inline-block;
                    background:${themeColor};
                    color:#ffffff;
                    padding:12px 28px;
                    border-radius:6px;
                    text-decoration:none;
                    font-size:15px;
                    font-weight:600;">
            ${content.ctaLabel}
          </a>
        </div>`
        : '';

    // ── Team members ─────────────────────────────────────────────────
    const teamHtml =
      content.teamMembers?.length > 0
        ? `<hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0;" />
         <p style="margin:0 0 20px;font-size:16px;font-weight:600;color:#111827;">
           Meet the Team
         </p>
         ${content.teamMembers
           .map((m) => {
             const avatar = m.photoUrl
               ? `<img src="${m.photoUrl}" width="56" height="56"
                    style="border-radius:50%;object-fit:cover;display:block;" />`
               : `<div style="width:56px;height:56px;border-radius:50%;
                             background:#E5E7EB;display:flex;align-items:center;
                             justify-content:center;font-size:18px;color:#9CA3AF;">
                    ${m.name?.[0] ?? '?'}
                  </div>`;
             return `
               <table width="100%" cellpadding="0" cellspacing="0"
                      style="margin-bottom:20px;">
                 <tr>
                   <td width="72" style="vertical-align:top;padding-right:16px;">
                     ${avatar}
                   </td>
                   <td style="vertical-align:top;">
                     <p style="margin:0;font-size:15px;font-weight:600;
                                color:#111827;">${m.name}</p>
                     <p style="margin:3px 0 0;font-size:13px;
                                color:#6B7280;">${m.title}</p>
                   </td>
                 </tr>
               </table>`;
           })
           .join('')}`
        : '';

    // ── Contact block ────────────────────────────────────────────────
    const hasContact =
      content.contactEmail ||
      content.contactPhone ||
      content.contactWebsite ||
      content.contactAddress;

    const contactHtml = hasContact
      ? `<hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0;" />
       <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#6B7280;
                 text-transform:uppercase;letter-spacing:0.05em;">Contact</p>
       ${content.contactEmail ? `<p style="margin:0 0 4px;font-size:14px;color:#374151;">${content.contactEmail}</p>` : ''}
       ${content.contactPhone ? `<p style="margin:0 0 4px;font-size:14px;color:#374151;">${content.contactPhone}</p>` : ''}
       ${content.contactWebsite ? `<p style="margin:0 0 4px;font-size:14px;color:#374151;">${content.contactWebsite}</p>` : ''}
       ${content.contactAddress ? `<p style="margin:0;font-size:14px;color:#374151;">${content.contactAddress}</p>` : ''}`
      : '';

    // ── Footer ───────────────────────────────────────────────────────
    const footerHtml = `
    <tr>
      <td style="background:#F9FAFB;padding:16px 40px;
                 border-top:1px solid #E5E7EB;
                 border-radius:0 0 8px 8px;">
        <p style="margin:0;font-size:12px;color:#9CA3AF;text-align:center;">
          ${content.companyName ?? ''} · Unsubscribe
        </p>
      </td>
    </tr>`;

    // ── Assemble ─────────────────────────────────────────────────────
    const innerBody = `
    <!-- HEADER -->
    <tr>
      <td style="background:${themeColor};padding:32px 40px;
                 border-radius:8px 8px 0 0;">
        <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">
          ${content.companyName ?? 'Company Name'}
        </p>
        ${
          content.tagline
            ? `<p style="margin:6px 0 0;font-size:14px;
                          color:rgba(255,255,255,0.85);">
                 ${content.tagline}
               </p>`
            : ''
        }
      </td>
    </tr>

    <!-- BODY -->
    <tr>
      <td style="padding:32px 40px;">
        ${bodyHtml}
        ${ctaHtml}
        ${teamHtml}
        ${contactHtml}
      </td>
    </tr>

    <!-- FOOTER -->
    ${footerHtml}`;

    return this.wrap(innerBody);
  }

  // ======================
  // ✅ Layout B Renderer
  // ======================
  renderLayoutB(content: LayoutBContent): string {
    const themeColor = content.headerBgColor || '#7C3AED';

    // ── Greeting ─────────────────────────────────────────────────────
    const greetingHtml = content.greetingText
      ? `<p style="margin:0 0 20px;font-size:16px;color:#111827;font-weight:500;">
         ${content.greetingText}
       </p>`
      : '';

    // ── Body paragraphs ───────────────────────────────────────────────
    const bodyHtml = (content.bodyParagraphs ?? [])
      .map(
        (p) =>
          `<p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">${p}</p>`,
      )
      .join('');

    // ── CTA button ────────────────────────────────────────────────────
    const ctaHtml =
      content.ctaLabel && content.ctaUrl
        ? `<div style="text-align:center;margin:24px 0;">
           <a href="${content.ctaUrl}"
              style="display:inline-block;
                     background:${themeColor};
                     color:#ffffff;
                     padding:12px 28px;
                     border-radius:6px;
                     text-decoration:none;
                     font-size:15px;
                     font-weight:600;">
             ${content.ctaLabel}
           </a>
         </div>`
        : '';

    // ── Highlights ────────────────────────────────────────────────────
    const highlightsHtml =
      content.highlights?.length > 0
        ? `<hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0;" />
         <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#111827;">
           Highlights
         </p>
         ${content.highlights
           .map(
             (item, i) => `
             <table width="100%" cellpadding="0" cellspacing="0"
                    style="margin-bottom:12px;">
               <tr>
                 <td width="36" style="vertical-align:top;padding-right:12px;">
                   <div style="width:24px;height:24px;border-radius:50%;
                               background:${themeColor};color:#ffffff;
                               font-size:12px;font-weight:700;
                               text-align:center;line-height:24px;">
                     ${i + 1}
                   </div>
                 </td>
                 <td style="vertical-align:top;padding-top:4px;">
                   <p style="margin:0;font-size:14px;color:#374151;line-height:1.5;">
                     ${item}
                   </p>
                 </td>
               </tr>
             </table>`,
           )
           .join('')}`
        : '';

    // ── Contact block ─────────────────────────────────────────────────
    const hasContact =
      content.contactEmail ||
      content.contactPhone ||
      content.contactWebsite ||
      content.contactAddress;

    const contactHtml = hasContact
      ? `<hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0;" />
       <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#6B7280;
                 text-transform:uppercase;letter-spacing:0.05em;">Contact</p>
       ${content.contactEmail ? `<p style="margin:0 0 4px;font-size:14px;color:#374151;">${content.contactEmail}</p>` : ''}
       ${content.contactPhone ? `<p style="margin:0 0 4px;font-size:14px;color:#374151;">${content.contactPhone}</p>` : ''}
       ${content.contactWebsite ? `<p style="margin:0 0 4px;font-size:14px;color:#374151;">${content.contactWebsite}</p>` : ''}
       ${content.contactAddress ? `<p style="margin:0;font-size:14px;color:#374151;">${content.contactAddress}</p>` : ''}`
      : '';

    // ── Footer ────────────────────────────────────────────────────────
    const footerHtml = `
    <tr>
      <td style="background:#F9FAFB;padding:16px 40px;
                 border-top:1px solid #E5E7EB;
                 border-radius:0 0 8px 8px;">
        <p style="margin:0;font-size:12px;color:#9CA3AF;text-align:center;">
          ${content.companyName ?? ''} · Unsubscribe
        </p>
      </td>
    </tr>`;

    // ── Assemble ──────────────────────────────────────────────────────
    const innerBody = `
    <!-- HEADER -->
    <tr>
      <td style="background:${themeColor};padding:32px 40px;
                 border-radius:8px 8px 0 0;">
        <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">
          ${content.companyName ?? 'Company Name'}
        </p>
        ${
          content.tagline
            ? `<p style="margin:6px 0 0;font-size:14px;
                          color:rgba(255,255,255,0.85);">
                 ${content.tagline}
               </p>`
            : ''
        }
      </td>
    </tr>

    <!-- BODY -->
    <tr>
      <td style="padding:32px 40px;">
        ${greetingHtml}
        ${bodyHtml}
        ${ctaHtml}
        ${highlightsHtml}
        ${contactHtml}
      </td>
    </tr>

    <!-- FOOTER -->
    ${footerHtml}`;

    return this.wrap(innerBody);
  }

  // ======================
  // ✅ Wrapper (shared)
  // ======================
  private wrap(rows: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#F9FAFB;
             font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:8px;
                 box-shadow:0 1px 3px rgba(0,0,0,.08);
                 max-width:600px;width:100%;">
          ${rows}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}
