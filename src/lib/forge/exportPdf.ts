import type { ParsedCV } from "./types";

/**
 * Modern HTML/CSS Print-based PDF generation.
 * Renders a gorgeous A4 layout in a temporary window, opens the browser print prompt,
 * and automatically closes. Supports all Unicode/Turkish characters, formatting, and images.
 */
export async function exportCvAsPdf(cv: ParsedCV, filename?: string) {
  if (typeof window === "undefined") return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to export your CV as PDF.");
    return;
  }

  // Set document title so the browser default PDF filename is clean
  const cleanName = (cv.name || "Resume").replace(/[^\w\s\-]+/g, "").trim();
  const fileTitle = filename 
    ? filename.replace(/\.pdf$/i, "") 
    : `${cleanName.replace(/\s+/g, "-")}-CareerForge`;

  printWindow.document.title = fileTitle;

  const photoHtml = cv.photoDataUrl
    ? `<img src="${cv.photoDataUrl}" alt="Profile Photo" class="profile-photo" />`
    : "";

  const summaryHtml = cv.summary
    ? `
      <div class="section">
        <h2 class="section-title">Özet / Summary</h2>
        <p class="summary-text">${cv.summary}</p>
      </div>
    `
    : "";

  const experienceHtml = cv.experience && cv.experience.length > 0
    ? `
      <div class="section">
        <h2 class="section-title">Deneyim / Experience</h2>
        ${cv.experience.map(exp => {
          const bullets = exp.description && exp.description.length > 0
            ? `<ul class="bullets">
                ${exp.description.map(bullet => `<li>${bullet}</li>`).join("")}
               </ul>`
            : "";
          return `
            <div class="item">
              <div class="item-header">
                <span class="item-title">${exp.position}</span>
                <span class="item-date">${exp.duration}</span>
              </div>
              <div class="item-subtitle">${exp.company}</div>
              ${bullets}
            </div>
          `;
        }).join("")}
      </div>
    `
    : "";

  const skillsHtml = cv.skills && cv.skills.length > 0
    ? `
      <div class="section">
        <h2 class="section-title">Beceriler / Skills</h2>
        <div class="skills-grid">
          ${cv.skills.map(skill => `<span class="skill-badge">${skill}</span>`).join("")}
        </div>
      </div>
    `
    : "";

  const educationHtml = cv.education && cv.education.length > 0
    ? `
      <div class="section">
        <h2 class="section-title">Eğitim / Education</h2>
        ${cv.education.map(edu => `
          <div class="item">
            <div class="item-header">
              <span class="item-title">${edu.school}</span>
              <span class="item-date">${edu.year}</span>
            </div>
            <div class="item-subtitle">${edu.degree}</div>
          </div>
        `).join("")}
      </div>
    `
    : "";

  const contactItems: string[] = [];
  if (cv.email) contactItems.push(`<span>✉ ${cv.email}</span>`);
  if (cv.phone) contactItems.push(`<span>📞 ${cv.phone}</span>`);
  if (cv.location) contactItems.push(`<span>📍 ${cv.location}</span>`);
  const contactHtml = contactItems.length > 0
    ? `<div class="contact-info">${contactItems.join("  ·  ")}</div>`
    : "";

  const html = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <title>${fileTitle}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        @page {
          size: A4;
          margin: 20mm 15mm 20mm 15mm;
        }
        
        * {
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          margin: 0;
          padding: 0;
          color: #1e293b;
          background-color: #ffffff;
          line-height: 1.5;
          font-size: 13px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .container {
          max-width: 100%;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2.5px solid #d94820; /* Brand Accent Orange */
          padding-bottom: 16px;
          margin-bottom: 20px;
        }

        .header-content {
          flex: 1;
        }

        .name {
          font-size: 26px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 4px 0;
          letter-spacing: -0.5px;
        }

        .headline {
          font-size: 15px;
          font-weight: 600;
          color: #d94820;
          margin: 0 0 10px 0;
        }

        .contact-info {
          font-size: 12px;
          color: #64748b;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .profile-photo {
          width: 85px;
          height: 85px;
          object-fit: cover;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          margin-left: 20px;
        }

        .section {
          margin-bottom: 22px;
          page-break-inside: avoid;
        }

        .section-title {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #d94820;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 5px;
          margin: 0 0 12px 0;
        }

        .summary-text {
          font-size: 13px;
          color: #334155;
          margin: 0;
          text-align: justify;
        }

        .item {
          margin-bottom: 16px;
          page-break-inside: avoid;
        }

        .item:last-child {
          margin-bottom: 0;
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 2px;
        }

        .item-title {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
        }

        .item-date {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }

        .item-subtitle {
          font-size: 13px;
          color: #475569;
          font-weight: 500;
          margin-bottom: 6px;
        }

        .bullets {
          margin: 0;
          padding-left: 20px;
          color: #334155;
        }

        .bullets li {
          margin-bottom: 4px;
        }

        .skills-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .skill-badge {
          background-color: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #334155;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 500;
        }

        .footer {
          margin-top: 40px;
          border-top: 1px solid #f1f5f9;
          padding-top: 8px;
          text-align: center;
          font-size: 10px;
          color: #94a3b8;
        }

        @media print {
          body {
            background-color: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="header-content">
            <h1 class="name">${cv.name || "Aday"}</h1>
            <div class="headline">${cv.title || "Profesyonel"}</div>
            ${contactHtml}
          </div>
          ${photoHtml}
        </div>

        ${summaryHtml}
        ${experienceHtml}
        ${skillsHtml}
        ${educationHtml}

        <div class="footer">
          SoftBridge CareerForge (SoftBridge Solutions) tarafından üretilmiştir.
        </div>
      </div>

      <script>
        window.addEventListener('load', () => {
          setTimeout(() => {
            window.print();
            window.close();
          }, 350);
        });
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
