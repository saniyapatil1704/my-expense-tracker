export class CreateTransactionDto {
  amount: number;
  type: string; // e.g., "income" or "expense"
  categoryId: string;
  date?: string | Date;
  description?: string;
  note?: string;
}
