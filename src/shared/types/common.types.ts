export interface Link {
  id: string;
  url: string;
  title: string;
  hostname: string;
  tags: string[];
  notes?: string;
  createdAt: number;
}

export type LinkDTO = Omit<Link, "id" | "createdAt" | "hostname">;
