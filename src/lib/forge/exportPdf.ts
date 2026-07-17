import type { ParsedCV } from "./types";
import type { ResumeProfile } from "@/types";

function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isResumeProfile(obj: any): obj is ResumeProfile {
  return obj && typeof obj === "object" && ("customization" in obj || "sectionVisibility" in obj);
}

export async function exportCvAsPdf(cvOrProfile: ParsedCV | ResumeProfile, filename?: string) {
  if (typeof window === "undefined") return;

  const isProfile = isResumeProfile(cvOrProfile);
  
  // Basic properties extraction
  let name = "";
  let title = "";
  let email = "";
  let phone = "";
  let location = "";
  let summary = "";
  let website = "";
  let photoDataUrl = "";
  
  let skills: string[] = [];
  let experience: any[] = [];
  let education: any[] = [];
  let projects: any[] = [];
  let certifications: any[] = [];
  let languages: any[] = [];
  let awards: any[] = [];
  let publications: any[] = [];
  let socialLinks: any[] = [];
  
  let template = "classic";
  let fontFamily = "sans";
  let primaryColor = "brand";
  let visibility: Record<string, boolean> = {};

  if (isProfile) {
    const p = cvOrProfile as ResumeProfile;
    name = p.fullName;
    title = p.headline;
    email = p.email;
    phone = p.phone;
    location = p.location;
    summary = p.summary;
    website = p.website || "";
    photoDataUrl = p.photoDataUrl || "";
    skills = p.skills || [];
    experience = p.experience || [];
    education = p.education || [];
    projects = p.projects || [];
    certifications = p.certifications || [];
    languages = p.languages || [];
    awards = p.awards || [];
    publications = p.publications || [];
    socialLinks = p.socialLinks || [];
    
    template = p.customization?.template || "classic";
    fontFamily = p.customization?.fontFamily || "sans";
    primaryColor = p.customization?.primaryColor || "brand";
    visibility = p.sectionVisibility || {};
  } else {
    const c = cvOrProfile as ParsedCV;
    name = c.name;
    title = c.title;
    email = c.email;
    phone = c.phone || "";
    location = c.location || "";
    summary = c.summary || "";
    photoDataUrl = c.photoDataUrl || "";
    skills = c.skills || [];
    experience = c.experience.map(e => ({
      role: e.position,
      company: e.company,
      start: e.duration.split(/[–-]/)[0]?.trim() || "",
      end: e.duration.split(/[–-]/)[1]?.trim() || "",
      highlights: e.description
    }));
    education = c.education.map(e => ({
      school: e.school,
      degree: e.degree,
      year: e.year
    }));
    // Standard template default visibility
    visibility = {
      profile: true,
      summary: true,
      experience: true,
      skills: true,
      education: true
    };
  }

  // Check section visibility (default to visible if not specified in profile visibility map)
  const isVisible = (secId: string) => visibility[secId] !== false;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to export your CV as PDF.");
    return;
  }

  const cleanName = name.replace(/[^\w\s\-]+/g, "").trim();
  const fileTitle = filename 
    ? filename.replace(/\.pdf$/i, "") 
    : `${cleanName.replace(/\s+/g, "-") || "Resume"}-CareerForge`;

  printWindow.document.title = fileTitle;

  // Formatting fonts and colors
  const fontMap: Record<string, string> = {
    sans: "'Plus Jakarta Sans', system-ui, sans-serif",
    serif: "'Merriweather', Georgia, serif",
    mono: "'Fira Code', 'Courier New', monospace",
  };
  const selectedFont = fontMap[fontFamily] || fontMap.sans;

  const colorMap: Record<string, string> = {
    brand: "#D94820",
    indigo: "#4F46E5",
    emerald: "#10B981",
    violet: "#8B5CF6",
    rose: "#F43F5E",
  };
  const accentColor = colorMap[primaryColor] || colorMap.brand;

  // HTML Sections Construction
  const photoHtml = photoDataUrl
    ? `<img src="${photoDataUrl}" alt="Profile Photo" class="profile-photo" />`
    : "";

  const contactItems: string[] = [];
  if (email) contactItems.push(`<span>${escapeHtml(email)}</span>`);
  if (phone) contactItems.push(`<span>${escapeHtml(phone)}</span>`);
  if (location) contactItems.push(`<span>${escapeHtml(location)}</span>`);
  if (website) contactItems.push(`<span>${escapeHtml(website)}</span>`);
  socialLinks.forEach(link => {
    contactItems.push(`<span>${escapeHtml(link.label)}: ${escapeHtml(link.url)}</span>`);
  });
  const contactHtml = contactItems.length > 0
    ? `<div class="contact-info">${contactItems.join("  ·  ")}</div>`
    : "";

  const summaryHtml = (summary && isVisible("profile"))
    ? `
      <div class="section">
        <h2 class="section-title">${isProfile ? "Profil" : "Özet / Summary"}</h2>
        <p class="summary-text">${escapeHtml(summary)}</p>
      </div>
    `
    : "";

  const experienceHtml = (experience.length > 0 && isVisible("experience"))
    ? `
      <div class="section">
        <h2 class="section-title">${isProfile ? "Deneyim" : "Deneyim / Experience"}</h2>
        ${experience.map(exp => {
          const bullets = exp.highlights && exp.highlights.length > 0
            ? `<ul class="bullets">
                ${exp.highlights.map((bullet: string) => `<li>${escapeHtml(bullet)}</li>`).join("")}
               </ul>`
            : "";
          const dateRange = [exp.start, exp.end].filter(Boolean).join(" – ") || "";
          return `
            <div class="item">
              <div class="item-header">
                <span class="item-title">${escapeHtml(exp.role || exp.position)}</span>
                <span class="item-date">${escapeHtml(dateRange)}</span>
              </div>
              <div class="item-subtitle">${escapeHtml(exp.company)}</div>
              ${bullets}
            </div>
          `;
        }).join("")}
      </div>
    `
    : "";

  const skillsHtml = (skills.length > 0 && isVisible("skills"))
    ? `
      <div class="section">
        <h2 class="section-title">${isProfile ? "Yetenekler" : "Beceriler / Skills"}</h2>
        <div class="skills-grid">
          ${skills.map(skill => `<span class="skill-badge">${escapeHtml(skill)}</span>`).join("")}
        </div>
      </div>
    `
    : "";

  const educationHtml = (education.length > 0 && isVisible("education"))
    ? `
      <div class="section">
        <h2 class="section-title">${isProfile ? "Eğitim" : "Eğitim / Education"}</h2>
        ${education.map(edu => `
          <div class="item">
            <div class="item-header">
              <span class="item-title">${escapeHtml(edu.school)}</span>
              <span class="item-date">${escapeHtml(edu.year)}</span>
            </div>
            <div class="item-subtitle">${escapeHtml(edu.degree)}</div>
          </div>
        `).join("")}
      </div>
    `
    : "";

  const projectsHtml = (projects.length > 0 && isVisible("projects"))
    ? `
      <div class="section">
        <h2 class="section-title">${isProfile ? "Projeler" : "Projects"}</h2>
        ${projects.map(proj => `
          <div class="item">
            <div class="item-header">
              <span class="item-title">${escapeHtml(proj.title)}</span>
              ${proj.url ? `<span class="item-date">${escapeHtml(proj.url)}</span>` : ""}
            </div>
            <p class="summary-text" style="margin-top: 4px;">${escapeHtml(proj.description)}</p>
          </div>
        `).join("")}
      </div>
    `
    : "";

  const certificationsHtml = (certifications.length > 0 && isVisible("certifications"))
    ? `
      <div class="section">
        <h2 class="section-title">${isProfile ? "Sertifikalar" : "Certifications"}</h2>
        ${certifications.map(cert => `
          <div class="item">
            <div class="item-header">
              <span class="item-title">${escapeHtml(cert.name)}</span>
              <span class="item-date">${escapeHtml(cert.date)}</span>
            </div>
            <div class="item-subtitle" style="margin-bottom: 0;">${escapeHtml(cert.issuer)}</div>
          </div>
        `).join("")}
      </div>
    `
    : "";

  const languagesHtml = (languages.length > 0 && isVisible("languages"))
    ? `
      <div class="section">
        <h2 class="section-title">${isProfile ? "Diller" : "Languages"}</h2>
        <div class="skills-grid">
          ${languages.map(lang => `<span class="skill-badge">${escapeHtml(lang.name)} (${escapeHtml(lang.level)})</span>`).join("")}
        </div>
      </div>
    `
    : "";

  const awardsHtml = (awards.length > 0 && isVisible("awards"))
    ? `
      <div class="section">
        <h2 class="section-title">${isProfile ? "Ödüller" : "Awards"}</h2>
        ${awards.map(aw => `
          <div class="item">
            <div class="item-header">
              <span class="item-title">${escapeHtml(aw.title)}</span>
              <span class="item-date">${escapeHtml(aw.date)}</span>
            </div>
            <div class="item-subtitle" style="margin-bottom: 0;">${escapeHtml(aw.issuer)}</div>
          </div>
        `).join("")}
      </div>
    `
    : "";

  const publicationsHtml = (publications.length > 0 && isVisible("publications"))
    ? `
      <div class="section">
        <h2 class="section-title">${isProfile ? "Yayınlar" : "Publications"}</h2>
        ${publications.map(pub => `
          <div class="item">
            <div class="item-header">
              <span class="item-title">${escapeHtml(pub.title)}</span>
              <span class="item-date">${escapeHtml(pub.date)}</span>
            </div>
            <div class="item-subtitle">${escapeHtml(pub.publisher)}</div>
            ${pub.url ? `<p class="summary-text" style="font-size: 11px;">${escapeHtml(pub.url)}</p>` : ""}
          </div>
        `).join("")}
      </div>
    `
    : "";

  // Template structural styling injections
  let layoutClass = "layout-classic";
  if (template === "modern") layoutClass = "layout-modern";
  if (template === "minimal") layoutClass = "layout-minimal";

  const html = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <title>${fileTitle}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&family=Fira+Code:wght@400;500;600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        
        @page {
          size: A4;
          margin: 15mm 15mm 15mm 15mm;
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: ${selectedFont};
          margin: 0;
          padding: 0;
          color: #1e293b;
          background-color: #ffffff;
          line-height: 1.5;
          font-size: 12px;
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
          border-bottom: 1.5px solid #e2e8f0;
          padding-bottom: 18px;
          margin-bottom: 20px;
        }

        .header-content {
          flex: 1;
        }

        .name {
          font-size: 26px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 4px 0;
          letter-spacing: -0.5px;
        }

        .headline {
          font-size: 14px;
          font-weight: 600;
          color: ${accentColor};
          margin: 0 0 10px 0;
          letter-spacing: 0.1px;
        }

        .contact-info {
          font-size: 11px;
          color: #475569;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .profile-photo {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 50%;
          border: 2px solid #e2e8f0;
          margin-left: 20px;
        }

        .section {
          margin-bottom: 20px;
          page-break-inside: avoid;
        }

        .section-title {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #0f172a;
          border-left: 3px solid ${accentColor};
          padding-left: 8px;
          margin: 0 0 10px 0;
        }

        /* Modern template styling overrides */
        .layout-modern .section-title {
          border-left: 0;
          border-bottom: 2px solid ${accentColor};
          padding-left: 0;
          padding-bottom: 3px;
        }

        /* Minimal template styling overrides */
        .layout-minimal .section-title {
          border-left: 0;
          padding-left: 0;
          color: ${accentColor};
        }

        .summary-text {
          font-size: 11.5px;
          color: #334155;
          margin: 0;
          text-align: justify;
        }

        .item {
          margin-bottom: 14px;
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
          font-size: 12.5px;
          font-weight: 600;
          color: #0f172a;
        }

        .item-date {
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
        }

        .item-subtitle {
          font-size: 11.5px;
          color: ${accentColor};
          font-weight: 500;
          margin-bottom: 6px;
        }

        .bullets {
          margin: 0;
          padding-left: 16px;
          color: #334155;
        }

        .bullets li {
          margin-bottom: 4px;
          font-size: 11.5px;
        }

        .skills-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .skill-badge {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #1e293b;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 10.5px;
          font-weight: 500;
        }

        .footer {
          margin-top: 30px;
          border-top: 1px solid #f1f5f9;
          padding-top: 10px;
          text-align: center;
          font-size: 9px;
          color: #94a3b8;
        }

        @media print {
          body {
            background-color: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body class="${layoutClass}">
      <div class="container">
        <div class="header">
          <div class="header-content">
            <h1 class="name">${escapeHtml(name || "Aday")}</h1>
            <div class="headline">${escapeHtml(title || "Profesyonel")}</div>
            ${contactHtml}
          </div>
          ${photoHtml}
        </div>

        ${summaryHtml}
        ${experienceHtml}
        ${skillsHtml}
        ${educationHtml}
        ${projectsHtml}
        ${certificationsHtml}
        ${languagesHtml}
        ${awardsHtml}
        ${publicationsHtml}

        <div class="footer">
          Generated via SoftBridge CareerForge · CareerForge tarafından oluşturulmuştur
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
