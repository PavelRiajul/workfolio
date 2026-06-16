// Generates a clean, single-column, ATS-friendly résumé PDF with a real
// (selectable / parseable) text layer — built from structured data, not a
// screenshot. Loaded on demand from main.ts when "Download PDF" is clicked.
import { jsPDF } from 'jspdf';

export interface ResumePdfData {
  name: string;
  role: string;
  location: string;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  website: string;
  summary: string;
  skills: { label: string; values: string }[];
  experience: { title: string; period: string; bullets: string[] }[];
  projects: { name: string; description: string }[];
  education: { title: string; year: string }[];
  languages: string;
}

const INK = { r: 10, g: 10, b: 10 };
const BODY = { r: 45, g: 45, b: 45 };
const GREY = { r: 120, g: 120, b: 120 };
const BLUE = { r: 37, g: 99, b: 235 };
const RULE = 222;

export function generateResumePdf(d: ResumePdfData) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter', compress: true });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 54;
  const contentW = pageW - M * 2;
  let y = M;

  const setColor = (c: { r: number; g: number; b: number }) => doc.setTextColor(c.r, c.g, c.b);
  const ensure = (space: number) => {
    if (y + space > pageH - M) {
      doc.addPage();
      y = M;
    }
  };
  const rule = () => {
    doc.setDrawColor(RULE);
    doc.setLineWidth(0.7);
    doc.line(M, y, pageW - M, y);
  };

  // ----- Header -----------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  setColor(INK);
  doc.text(d.name, M, y + 6);
  y += 24;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  setColor(BLUE);
  doc.text(d.role, M, y);
  y += 16;

  const contacts = [d.location, d.email, d.phone, d.github, d.linkedin, d.website].filter(Boolean);
  doc.setFontSize(9);
  setColor(GREY);
  const contactLine = contacts.join('   •   ');
  const contactLines = doc.splitTextToSize(contactLine, contentW);
  doc.text(contactLines, M, y);
  y += contactLines.length * 12 + 6;

  doc.setDrawColor(INK.r, INK.g, INK.b);
  doc.setLineWidth(1.4);
  doc.line(M, y, pageW - M, y);
  y += 4;

  // ----- Section helpers --------------------------------------------------
  const heading = (label: string) => {
    ensure(46);
    y += 22;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    setColor(GREY);
    doc.text(label.toUpperCase(), M, y, { charSpace: 1.2 });
    y += 7;
    rule();
    y += 16;
  };

  const paragraph = (text: string, size = 10, color = BODY, lh = 14) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(size);
    setColor(color);
    const lines = doc.splitTextToSize(text, contentW);
    lines.forEach((ln: string) => {
      ensure(lh);
      doc.text(ln, M, y);
      y += lh;
    });
  };

  // ----- Summary ----------------------------------------------------------
  heading('Summary');
  paragraph(d.summary);

  // ----- Skills -----------------------------------------------------------
  heading('Skills');
  const labelW = 96;
  d.skills.forEach((s) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    setColor(INK);
    const valLines = (() => {
      doc.setFont('helvetica', 'normal');
      return doc.splitTextToSize(s.values, contentW - labelW);
    })();
    ensure(valLines.length * 13 + 4);
    doc.setFont('helvetica', 'bold');
    setColor(INK);
    doc.text(s.label, M, y);
    doc.setFont('helvetica', 'normal');
    setColor(BODY);
    doc.text(valLines, M + labelW, y);
    y += valLines.length * 13 + 6;
  });

  // ----- Experience -------------------------------------------------------
  heading('Experience');
  d.experience.forEach((job, i) => {
    if (i > 0) y += 8;
    ensure(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    setColor(INK);
    doc.text(job.title, M, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setColor(GREY);
    doc.text(job.period, pageW - M, y, { align: 'right' });
    y += 15;
    job.bullets.forEach((b) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      setColor(BODY);
      const lines = doc.splitTextToSize(b, contentW - 14);
      ensure(lines.length * 13 + 2);
      doc.text('•', M + 2, y);
      doc.text(lines, M + 14, y);
      y += lines.length * 13 + 2;
    });
  });

  // ----- Projects ---------------------------------------------------------
  heading('Selected Projects');
  d.projects.forEach((p) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const text = `${p.name} — ${p.description}`;
    const lines = doc.splitTextToSize(text, contentW);
    ensure(lines.length * 13 + 4);
    // bold the name, then normal description on the first line
    doc.setFont('helvetica', 'bold');
    setColor(INK);
    const nameWidth = doc.getTextWidth(`${p.name} `);
    doc.text(`${p.name}`, M, y);
    doc.setFont('helvetica', 'normal');
    setColor(BODY);
    const descLines = doc.splitTextToSize(`— ${p.description}`, contentW - nameWidth);
    doc.text(descLines[0], M + nameWidth, y);
    y += 13;
    if (descLines.length > 1) {
      const rest = doc.splitTextToSize(descLines.slice(1).join(' '), contentW);
      rest.forEach((ln: string) => {
        ensure(13);
        doc.text(ln, M, y);
        y += 13;
      });
    }
    y += 5;
  });

  // ----- Education --------------------------------------------------------
  heading('Education & Certifications');
  d.education.forEach((e) => {
    ensure(16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    setColor(INK);
    const yearW = 60;
    const titleLines = doc.splitTextToSize(e.title, contentW - yearW);
    doc.text(titleLines, M, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setColor(GREY);
    doc.text(e.year, pageW - M, y, { align: 'right' });
    y += titleLines.length * 13 + 6;
  });

  // ----- Languages --------------------------------------------------------
  heading('Languages');
  paragraph(d.languages);

  // ----- Meta + save ------------------------------------------------------
  doc.setProperties({
    title: `${d.name} — Résumé`,
    author: d.name,
    subject: d.role,
  });
  const file = `${d.name.replace(/[^a-z0-9]+/gi, '-')}-Resume.pdf`;
  doc.save(file);
}
