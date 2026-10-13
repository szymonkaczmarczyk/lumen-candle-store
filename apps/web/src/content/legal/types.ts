export interface LegalSection {
  id: string;
  heading: string;
  paragraphs: string[];
}

export interface LegalDocument {
  title: string;
  updatedAt: string;
  sections: LegalSection[];
}
