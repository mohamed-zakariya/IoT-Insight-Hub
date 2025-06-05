// src/app/models/paged-request.model.ts

export type SortDirection = 'ASC' | 'DESC';

export interface PagedRequest {
  // ── Paging & sorting ─────────────────────────────────────────────────────────
  /** zero‐based page index (e.g. 0 for first page) */
  page: string;

  /** number of items per page */
  size: string;

  sortBy: string;

  sortDirection?: SortDirection;


  timestampStart?: string;

 
  timestampEnd?: string;


  location?: string[];

  
  congestionLevel?: string[];
}
