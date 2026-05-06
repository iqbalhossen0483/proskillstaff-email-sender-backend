import { Injectable } from '@nestjs/common';

export interface TeamMember {
  name: string;
  title: string;
  photoUrl?: string;
  bio?: string;
}

export interface LayoutAContent {
  heading: string;
  intro?: string;
  teamMembers: TeamMember[];
  footer?: string;
}

export interface HighlightItem {
  title: string;
  description?: string;
}

export interface LayoutBContent {
  heading: string;
  intro?: string;
  highlights: HighlightItem[];
  callToActionText?: string;
  callToActionUrl?: string;
  footer?: string;
}

@Injectable()
export class EmailRendererService {
  renderLayoutA(content: LayoutAContent): string {
    const members = content.teamMembers
      .map(
        (m) => `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr>
            ${
              m.photoUrl
                ? `<td width="80" valign="top" style="padding-right:16px;">
                    <img src="${m.photoUrl}" width="72" height="72"
                         style="border-radius:50%;display:block;object-fit:cover;" alt="${m.name}" />
                  </td>`
                : ''
            }
            <td valign="top">
              <p style="margin:0;font-size:16px;font-weight:bold;color:#111827;">${m.name}</p>
              <p style="margin:4px 0 0;font-size:13px;color:#6B7280;">${m.title}</p>
              ${m.bio ? `<p style="margin:8px 0 0;font-size:14px;color:#374151;">${m.bio}</p>` : ''}
            </td>
          </tr>
        </table>`,
      )
      .join('');

    return this.wrap(`
      <h1 style="font-size:24px;color:#111827;margin:0 0 16px;">${content.heading}</h1>
      ${content.intro ? `<p style="font-size:15px;color:#374151;margin:0 0 24px;">${content.intro}</p>` : ''}
      <hr style="border:none;border-top:1px solid #E5E7EB;margin:0 0 24px;" />
      ${members}
      ${content.footer ? `<p style="font-size:13px;color:#9CA3AF;margin:24px 0 0;">${content.footer}</p>` : ''}
    `);
  }

  renderLayoutB(content: LayoutBContent): string {
    const highlights = content.highlights
      .map(
        (h, i) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #E5E7EB;">
            <p style="margin:0;font-size:15px;font-weight:bold;color:#111827;">
              ${i + 1}. ${h.title}
            </p>
            ${h.description ? `<p style="margin:4px 0 0;font-size:14px;color:#374151;">${h.description}</p>` : ''}
          </td>
        </tr>`,
      )
      .join('');

    const cta =
      content.callToActionText && content.callToActionUrl
        ? `<p style="text-align:center;margin:32px 0 0;">
             <a href="${content.callToActionUrl}"
                style="background:#2563EB;color:#fff;padding:12px 28px;border-radius:6px;
                       text-decoration:none;font-size:15px;font-weight:bold;display:inline-block;">
               ${content.callToActionText}
             </a>
           </p>`
        : '';

    return this.wrap(`
      <h1 style="font-size:24px;color:#111827;margin:0 0 16px;">${content.heading}</h1>
      ${content.intro ? `<p style="font-size:15px;color:#374151;margin:0 0 24px;">${content.intro}</p>` : ''}
      <table width="100%" cellpadding="0" cellspacing="0">${highlights}</table>
      ${cta}
      ${content.footer ? `<p style="font-size:13px;color:#9CA3AF;margin:24px 0 0;">${content.footer}</p>` : ''}
    `);
  }

  private wrap(body: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:8px;padding:40px;
                      box-shadow:0 1px 3px rgba(0,0,0,.08);max-width:600px;width:100%;">
          <tr><td>${body}</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}
