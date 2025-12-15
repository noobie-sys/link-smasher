import { Link } from "@/shared/types/common.types";

export interface OptionsState {
  links: Link[];
  isLoading: boolean;
  importStatus: string;
}
