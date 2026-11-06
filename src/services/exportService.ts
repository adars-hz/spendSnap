import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Account, Category, Transaction } from '../types';
import { formatCurrency } from '../constants/currencies';

export const generateCsvContent = (
  transactions: Transaction[],
  categories: Category[],
  accounts: Account[],
  currencyCode: string
): string => {
  const getCatName = (id: string) => categories.find((c) => c.id === id)?.name || 'Unknown';
  const getAccName = (id: string) => accounts.find((a) => a.id === id)?.name || 'Unknown';

  const headers = ['Date', 'Type', 'Category', 'Account', 'Amount', 'Currency', 'Note', 'Tags'];
  const rows = transactions.map((t) => {
    return [
      t.date,
      t.type.toUpperCase(),
      `"${getCatName(t.categoryId)}"`,
      `"${getAccName(t.accountId)}"`,
      t.type === 'expense' ? `-${t.amount}` : `${t.amount}`,
      currencyCode,
      `"${(t.note || '').replace(/"/g, '""')}"`,
      `"${(t.tags || []).join(', ')}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

export const exportTransactionsToCsv = async (
  transactions: Transaction[],
  categories: Category[],
  accounts: Account[],
  currencyCode: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const csvContent = generateCsvContent(transactions, categories, accounts, currencyCode);

    if (Platform.OS === 'web') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `SpendSnap_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true, message: 'CSV downloaded successfully!' };
    }

    // On Native: generate HTML/Print file or share
    const html = `
      <html>
        <head><title>SpendSnap Export</title></head>
        <body style="font-family: sans-serif; padding: 20px;">
          <h2>SpendSnap Transaction Export</h2>
          <pre>${csvContent}</pre>
        </body>
      </html>
    `;
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Export SpendSnap CSV' });
      return { success: true, message: 'CSV shared successfully!' };
    }
    return { success: false, message: 'Sharing not available on this device' };
  } catch (error) {
    console.error('CSV export failed:', error);
    return { success: false, message: 'Failed to export CSV.' };
  }
};

export const exportTransactionsToPdf = async (
  transactions: Transaction[],
  categories: Category[],
  accounts: Account[],
  currencyCode: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const getCatName = (id: string) => categories.find((c) => c.id === id)?.name || 'Unknown';
    const getAccName = (id: string) => accounts.find((a) => a.id === id)?.name || 'Unknown';

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpenses;

    const rowsHtml = transactions
      .map(
        (t) => `
        <tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 10px 8px; font-size: 13px;">${t.date}</td>
          <td style="padding: 10px 8px; font-size: 13px; font-weight: 600;">${getCatName(t.categoryId)}</td>
          <td style="padding: 10px 8px; font-size: 13px; color: #64748B;">${t.note || '-'}</td>
          <td style="padding: 10px 8px; font-size: 13px; color: #64748B;">${getAccName(t.accountId)}</td>
          <td style="padding: 10px 8px; font-size: 13px; font-weight: bold; text-align: right; color: ${
            t.type === 'income' ? '#10B981' : '#F43F5E'
          }">
            ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount, currencyCode)}
          </td>
        </tr>
      `
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 24px; color: #0F172A; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #10B981; padding-bottom: 12px; margin-bottom: 20px; }
            .title { font-size: 26px; font-weight: 800; color: #10B981; margin: 0; }
            .summary-cards { display: flex; gap: 12px; margin-bottom: 24px; }
            .card { flex: 1; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; }
            .card-title { font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 600; margin-bottom: 4px; }
            .card-val { font-size: 18px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { text-align: left; padding: 8px; font-size: 12px; text-transform: uppercase; color: #64748B; background: #F1F5F9; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">SpendSnap</h1>
              <p style="color: #64748B; margin: 4px 0 0; font-size: 13px;">Financial Activity Statement</p>
            </div>
            <div style="text-align: right; font-size: 12px; color: #64748B;">
              Generated: ${new Date().toLocaleDateString()}<br/>
              Total Transactions: ${transactions.length}
            </div>
          </div>

          <div class="summary-cards">
            <div class="card">
              <div class="card-title">Total Income</div>
              <div class="card-val" style="color: #10B981;">+${formatCurrency(totalIncome, currencyCode)}</div>
            </div>
            <div class="card">
              <div class="card-title">Total Expenses</div>
              <div class="card-val" style="color: #F43F5E;">-${formatCurrency(totalExpenses, currencyCode)}</div>
            </div>
            <div class="card">
              <div class="card-title">Net Balance</div>
              <div class="card-val" style="color: ${netBalance >= 0 ? '#10B981' : '#F43F5E'};">
                ${formatCurrency(netBalance, currencyCode)}
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Account</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Export SpendSnap PDF' });
      return { success: true, message: 'PDF generated & shared successfully!' };
    }
    return { success: true, message: `PDF saved to: ${uri}` };
  } catch (error) {
    console.error('PDF export failed:', error);
    return { success: false, message: 'Failed to export PDF.' };
  }
};
