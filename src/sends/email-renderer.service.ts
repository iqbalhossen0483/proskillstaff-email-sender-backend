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
    const themeColor = content.headerBgColor || '#1d8b52';

    const bodyHtml = content.bodyParagraphs
      .map(
        (p) =>
          `<p style="margin:0 0 12px;font-size:15px;color:#374151;">${p}</p>`,
      )
      .join('');

    const membersHtml = content.teamMembers.length
      ? content.teamMembers
          .map(
            (m) => `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
          <tr>
            ${
              m.photoUrl
                ? `<td width="70" style="padding-right:12px;">
                    <img src="${m.photoUrl}" width="60" height="60"
                      style="border-radius:50%;object-fit:cover;" />
                  </td>`
                : ''
            }
            <td>
              <p style="margin:0;font-weight:bold;color:#111827;">${m.name}</p>
              <p style="margin:4px 0;font-size:13px;color:#6B7280;">${m.title}</p>
              ${
                m.bio
                  ? `<p style="margin:6px 0;font-size:14px;color:#374151;">${m.bio}</p>`
                  : ''
              }
            </td>
          </tr>
        </table>`,
          )
          .join('')
      : '';

    const cta =
      content.ctaLabel && content.ctaUrl
        ? `<div style="margin:24px 0;">
            <a href="${content.ctaUrl}"
               style="display:inline-block;
                      padding:10px 18px;
                      background:${themeColor};
                      color:#fff;
                      border-radius:6px;
                      text-decoration:none;">
              ${content.ctaLabel}
            </a>
          </div>`
        : '';

    return this.wrap(`
      <!-- HEADER -->
      <div style="background:${themeColor};padding:16px;border-radius:6px;margin-bottom:20px;">
        <h2 style="margin:0;color:#fff;font-size:18px;">
          ${content.companyName}
        </h2>
        ${
          content.tagline
            ? `<p style="margin:6px 0 0;color:#e5e7eb;font-size:13px;">
                ${content.tagline}
              </p>`
            : ''
        }
      </div>

      <h1 style="font-size:22px;color:#111827;margin:0 0 10px;">
        ${content.subjectLine}
      </h1>

      <hr style="border:none;border-top:1px solid #E5E7EB;margin:16px 0;" />

      <!-- BODY -->
      ${bodyHtml}

      <!-- CTA -->
      ${cta}

      <!-- TEAM -->
      ${membersHtml}

      <!-- CONTACT -->
      <div style="margin-top:30px;font-size:13px;color:#6B7280;">
        ${content.contactEmail ? `<div>Email: ${content.contactEmail}</div>` : ''}
        ${content.contactPhone ? `<div>Phone: ${content.contactPhone}</div>` : ''}
        ${content.contactAddress ? `<div>Address: ${content.contactAddress}</div>` : ''}
        ${content.contactWebsite ? `<div>Website: ${content.contactWebsite}</div>` : ''}
      </div>
    `);
  }

  // ======================
  // ✅ Layout B Renderer
  // ======================
  renderLayoutB(content: LayoutBContent): string {
    const themeColor = content.headerBgColor || '#2563EB';

    const bodyHtml = content.bodyParagraphs
      .map(
        (p) =>
          `<p style="margin:0 0 12px;font-size:15px;color:#374151;">${p}</p>`,
      )
      .join('');

    const highlightsHtml = content.highlights
      .map(
        (h, i) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #E5E7EB;">
            <p style="margin:0;font-size:14px;color:#111827;">
              ${i + 1}. ${h}
            </p>
          </td>
        </tr>`,
      )
      .join('');

    const cta =
      content.ctaLabel && content.ctaUrl
        ? `<div style="text-align:center;margin:24px 0;">
            <a href="${content.ctaUrl}"
               style="display:inline-block;
                      background:${themeColor};
                      color:#fff;
                      padding:10px 20px;
                      border-radius:6px;
                      text-decoration:none;">
              ${content.ctaLabel}
            </a>
          </div>`
        : '';

    return this.wrap(`
      <!-- HEADER -->
      <div style="background:${themeColor};padding:16px;border-radius:6px;margin-bottom:20px;">
        <h2 style="margin:0;color:#fff;font-size:18px;">
          ${content.companyName}
        </h2>
        ${
          content.tagline
            ? `<p style="margin:6px 0 0;color:#e5e7eb;font-size:13px;">
                ${content.tagline}
              </p>`
            : ''
        }
      </div>

      <h1 style="font-size:22px;color:#111827;margin:0 0 10px;">
        ${content.subjectLine}
      </h1>

      ${
        content.greetingText
          ? `<p style="margin:0 0 16px;font-size:15px;color:#374151;">
              ${content.greetingText}
            </p>`
          : ''
      }

      <hr style="border:none;border-top:1px solid #E5E7EB;margin:16px 0;" />

      <!-- BODY -->
      ${bodyHtml}

      <!-- HIGHLIGHTS -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
        ${highlightsHtml}
      </table>

      <!-- CTA -->
      ${cta}

      <!-- CONTACT -->
      <div style="margin-top:30px;font-size:13px;color:#6B7280;">
        ${content.contactEmail ? `<div>Email: ${content.contactEmail}</div>` : ''}
        ${content.contactPhone ? `<div>Phone: ${content.contactPhone}</div>` : ''}
        ${content.contactAddress ? `<div>Address: ${content.contactAddress}</div>` : ''}
        ${content.contactWebsite ? `<div>Website: ${content.contactWebsite}</div>` : ''}
      </div>
    `);
  }

  // ======================
  // ✅ Wrapper (shared)
  // ======================
  private wrap(body: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:8px;padding:40px;
                 box-shadow:0 1px 3px rgba(0,0,0,.08);max-width:600px;width:100%;">
          <tr>
            <td>${body}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}
