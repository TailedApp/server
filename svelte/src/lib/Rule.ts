export interface Rule {
    name: string;
    pattern: string;
    ignore_case: boolean;
    foreground: string;
    background: string;
    first_only: boolean;
}