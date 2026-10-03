export class UpdateTransactionDto {
  amount?: number;
  type?: string;
  categoryId?: string;
  date?: string | Date;
  description?: string;
  note?: string;
}
