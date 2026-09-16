/**
 * Typed contract for every piece of content rendered on the site.
 *
 * Public components consume this contract through PortfolioService.
 * Runtime content lives in data/portfolio.json and is validated by the server.
 * Run npm run schema:generate after changing these models.
 */

/** Every icon the UI can render. Adding a name here requires a matching case in IconComponent. */
export type IconName =
  | 'mail'
  | 'phone'
  | 'map-pin'
  | 'linkedin'
  | 'download'
  | 'arrow-right'
  | 'arrow-up-right'
  | 'menu'
  | 'close'
  | 'sun'
  | 'moon'
  | 'layers'
  | 'compass'
  | 'scan'
  | 'cpu'
  | 'route'
  | 'git-branch'
  | 'file-text'
  | 'award'
  | 'graduation-cap'
  | 'briefcase'
  | 'check'
  | 'box'
  | 'globe'
  | 'shield-check'
  | 'users'
  | 'code'
  | 'sparkles'
  | 'ruler';

// ─── Identity & contact ───────────────────────────────────────────────────────

export interface PersonalInfo {
  name: string;
  /** Monogram used by the nav mark and footer. */
  initials: string;
  /** Primary positioning line shown under the name. */
  title: string;
  /** Short role descriptor used in metadata and the footer. */
  shortTitle: string;
  location: string;
  email: string;
  phone: string;
  /** Human-readable phone, formatted for display. */
  phoneDisplay: string;
  profileImage: string;
  profileImageAlt: string;
  /** Path to a résumé in /public, or null to hide every résumé CTA. */
  resumeUrl: string | null;
  resumeFileName: string;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: IconName;
  /** Rendered next to the label where space allows (e.g. the contact cards). */
  display?: string;
  external?: boolean;
}

export interface ContactChannel {
  label: string;
  value: string;
  /** `null` for non-actionable values such as a location. */
  href: string | null;
  icon: IconName;
  external?: boolean;
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export interface NavLink {
  label: string;
  /** Element id of the target section, without the leading `#`. */
  id: string;
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export interface HeroFact {
  label: string;
  value: string;
  icon: IconName;
}

export interface HeroContent {
  eyebrow: string;
  /** Two-to-four short discipline labels shown as chips. */
  focusAreas: string[];
  intro: string;
  facts: HeroFact[];
  primaryCta: { label: string; targetId: string };
  secondaryCta: { label: string; targetId: string };
}

// ─── Section headings ─────────────────────────────────────────────────────────

export type SectionKey =
  | 'about'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'education'
  | 'contact';

/** Heading copy for one section, rendered by SectionHeaderComponent. */
export interface SectionMeta {
  /** Two-digit technical index, e.g. '01'. */
  index: string;
  eyebrow: string;
  title: string;
  /** Optional supporting sentence. Leave empty to omit. */
  lead: string;
}

// ─── About ────────────────────────────────────────────────────────────────────

export interface Highlight {
  icon: IconName;
  title: string;
  description: string;
}

export interface AboutContent {
  paragraphs: string[];
  highlights: Highlight[];
}

// ─── Education ────────────────────────────────────────────────────────────────

export interface EducationItem {
  institution: string;
  degree: string;
  field: string;
  location: string;
  period: string;
  current: boolean;
  achievements: string[];
}

// ─── Experience ───────────────────────────────────────────────────────────────

export interface ExperienceItem {
  company: string;
  role: string;
  /** e.g. 'Full-time', 'Co-op'. */
  employmentType: string;
  location: string;
  period: string;
  current: boolean;
  summary: string;
  bullets: string[];
  tags: string[];
}

// ─── Projects ─────────────────────────────────────────────────────────────────

/** A measured design parameter, rendered in the technical spec grid. */
export interface ProjectSpec {
  label: string;
  value: string;
}

export interface Project {
  id: string;
  title: string;
  /** Course code / context line shown beneath the title. */
  context: string;
  period: string;
  category: string;
  icon: IconName;
  /** Featured projects render as a full-width case study. */
  featured: boolean;
  summary: string;
  bullets: string[];
  specs: ProjectSpec[];
  tech: string[];
  /** Verified result, e.g. 'Final grade: A+'. */
  outcome: string;
}

// ─── Skills, credentials, languages ───────────────────────────────────────────

export interface SkillGroup {
  category: string;
  icon: IconName;
  items: string[];
}

export type CredentialType = 'honour' | 'award' | 'certification';

export interface Credential {
  title: string;
  /** Awarding body. Leave empty to omit the line entirely. */
  issuer: string;
  detail: string;
  type: CredentialType;
  icon: IconName;
}

export interface LanguageItem {
  name: string;
  level: string;
  /** 1 = beginner, 3 = fluent. Drives the discrete level indicator (no fake percentages). */
  proficiency: 1 | 2 | 3;
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export interface PortfolioData {
  personal: PersonalInfo;
  socials: SocialLink[];
  nav: NavLink[];
  sections: Record<SectionKey, SectionMeta>;
  hero: HeroContent;
  about: AboutContent;
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: Project[];
  skills: SkillGroup[];
  credentials: Credential[];
  languages: LanguageItem[];
  contactChannels: ContactChannel[];
}
