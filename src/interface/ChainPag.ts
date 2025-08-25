import type { BlockI } from "./Block";

export interface ChainPagI {
    blocks: BlockI[];
    currentPage: number;
    totalPages: number;
    totalBlocks: number;
}