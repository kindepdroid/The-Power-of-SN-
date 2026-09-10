export type Role = 'contributor' | 'database_admin' | 'super_admin';
export type VersionStatus = 'draft' | 'submitted' | 'changes_requested' | 'rejected' | 'approved';
export type Profile = {
  id: string;
  name: string;
  phone: string;
  institution: string;
  education: string;
  social_links: Record<string, string>;
  role: Role;
  active: boolean;
};
export type Article = {
  id: string;
  author_id: string;
  slug: string;
  published_version_id: string | null;
  withdrawn: boolean;
  created_at: string;
};
export type ArticleVersion = {
  id: string;
  article_id: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  status: VersionStatus;
  author_name: string;
  lock_version: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};
export type PublicArticle = ArticleVersion & { slug: string };
export type ContentItem = {
  id: string;
  kind: 'program' | 'activity' | 'officer';
  title: string;
  description: string;
  image_url: string;
  contact: string;
  event_date: string | null;
  visible: boolean;
  sort_order: number;
  lock_version: number;
};
export type Organization = {
  id: number;
  profile: string;
  vision: string;
  mission: string;
  email: string;
  phone: string;
  logo_url: string;
  lock_version: number;
};
export type Decision = {
  id: string;
  version_id: string;
  action: string;
  note: string;
  created_at: string;
};
export type FormState = { error?: string; success?: string };
