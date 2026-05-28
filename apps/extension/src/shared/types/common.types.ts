export interface Link {
  id: string;
  userId?: string;
  url: string;
  title: string;
  hostname: string;
  tags: string[];
  notes?: string;
  category?: string;
  createdAt: number;
  updatedAt: number;
}

export type LinkDTO = Omit<Link, "id" | "createdAt" | "hostname" | "updatedAt">;

export enum ActiveTab {
  Save = "save",
  Current = "current",
  All = "all",
}
