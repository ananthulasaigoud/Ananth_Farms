import { Crop, LandExpense } from '@/types/crop';

export interface ExportData {
  crops: Crop[];
  landExpenses: LandExpense[];
  exportDate: string;
  version: string;
  metadata: {
    totalCrops: number;
    totalLandExpenses: number;
    totalProfit: number;
  };
}

export const exportFormats = {
  JSON: 'json',
  CSV: 'csv',
  EXCEL: 'xlsx',
  PDF: 'pdf',
} as const;

export type ExportFormat = typeof exportFormats[keyof typeof exportFormats];

// Export data to JSON
export const exportToJSON = (data: ExportData): string => {
  return JSON.stringify(data, null, 2);
};

// Export data to CSV
export const exportToCSV = (data: ExportData): string => {
  let csv = 'Crop Name,Type,Land Area,Land Unit,Sowing Date,Total Income,Total Expenses,Profit\n';
  
  data.crops.forEach(crop => {
    const totalIncome = crop.income.reduce((sum, inc) => sum + inc.amount, 0);
    const totalExpenses = crop.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const profit = totalIncome - totalExpenses;
    
    csv += `"${crop.name}","${crop.type}",${crop.landArea},"${crop.landUnit}","${crop.sowingDate}",${totalIncome},${totalExpenses},${profit}\n`;
  });
  
  return csv;
};

// Export data to Excel (simplified - returns CSV for now)
export const exportToExcel = (data: ExportData): string => {
  // In a real implementation, you would use a library like xlsx
  // For now, we'll return CSV format
  return exportToCSV(data);
};

// Export data to PDF (simplified - returns text for now)
export const exportToPDF = (data: ExportData): string => {
  let pdfContent = 'CROP LEDGER REPORT\n';
  pdfContent += '==================\n\n';
  pdfContent += `Export Date: ${data.exportDate}\n`;
  pdfContent += `Total Crops: ${data.metadata.totalCrops}\n`;
  pdfContent += `Total Land Expenses: ${data.metadata.totalLandExpenses}\n`;
  pdfContent += `Net Profit: ₹${data.metadata.totalProfit.toLocaleString()}\n\n`;
  
  pdfContent += 'CROP DETAILS:\n';
  pdfContent += '=============\n\n';
  
  data.crops.forEach((crop, index) => {
    const totalIncome = crop.income.reduce((sum, inc) => sum + inc.amount, 0);
    const totalExpenses = crop.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const profit = totalIncome - totalExpenses;
    
    pdfContent += `${index + 1}. ${crop.name} (${crop.type})\n`;
    pdfContent += `   Land Area: ${crop.landArea} ${crop.landUnit}\n`;
    pdfContent += `   Sowing Date: ${crop.sowingDate}\n`;
    pdfContent += `   Total Income: ₹${totalIncome.toLocaleString()}\n`;
    pdfContent += `   Total Expenses: ₹${totalExpenses.toLocaleString()}\n`;
    pdfContent += `   Profit: ₹${profit.toLocaleString()}\n\n`;
  });
  
  return pdfContent;
};

// Main export function
export const exportData = (
  crops: Crop[], 
  landExpenses: LandExpense[], 
  format: ExportFormat = 'json'
): { data: string; filename: string; mimeType: string } => {
  const totalCropProfit = crops.reduce((sum, crop) => {
    const income = crop.income.reduce((total, inc) => total + inc.amount, 0);
    const expenses = crop.expenses.reduce((total, exp) => total + exp.amount, 0);
    return sum + (income - expenses);
  }, 0);

  const totalLandExpenses = landExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalCropProfit - totalLandExpenses;

  const exportData: ExportData = {
    crops,
    landExpenses,
    exportDate: new Date().toISOString(),
    version: '1.0.0',
    metadata: {
      totalCrops: crops.length,
      totalLandExpenses: landExpenses.length,
      totalProfit: netProfit,
    },
  };

  let data: string;
  let filename: string;
  let mimeType: string;

  switch (format) {
    case 'csv':
      data = exportToCSV(exportData);
      filename = `crop-ledger-${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
      break;
    case 'xlsx':
      data = exportToExcel(exportData);
      filename = `crop-ledger-${new Date().toISOString().split('T')[0]}.xlsx`;
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      break;
    case 'pdf':
      data = exportToPDF(exportData);
      filename = `crop-ledger-${new Date().toISOString().split('T')[0]}.pdf`;
      mimeType = 'application/pdf';
      break;
    default:
      data = exportToJSON(exportData);
      filename = `crop-ledger-${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
  }

  return { data, filename, mimeType };
};

// Download file
export const downloadFile = (data: string, filename: string, mimeType: string): void => {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Import data from JSON
export const importFromJSON = (jsonString: string): ExportData => {
  try {
    const data = JSON.parse(jsonString);
    
    // Validate the data structure
    if (!data.crops || !Array.isArray(data.crops)) {
      throw new Error('Invalid data format: crops array is missing');
    }
    
    if (!data.landExpenses || !Array.isArray(data.landExpenses)) {
      throw new Error('Invalid data format: landExpenses array is missing');
    }
    
    return data as ExportData;
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Import data from CSV
export const importFromCSV = (csvString: string): ExportData => {
  try {
    const lines = csvString.split('\n');
    const headers = lines[0].split(',');
    
    if (headers.length < 8) {
      throw new Error('Invalid CSV format: insufficient columns');
    }
    
    const crops: Crop[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Simple CSV parsing (handles quoted values)
      const values = line.match(/(".*?"|[^,]+)/g)?.map(v => v.replace(/"/g, '')) || [];
      
      if (values.length >= 8) {
        const crop: Crop = {
          id: `imported-${Date.now()}-${i}`,
          name: values[0],
          type: values[1] as any,
          landArea: parseFloat(values[2]) || 0,
          landUnit: values[3] as 'acres' | 'hectares',
          sowingDate: values[4],
          expenses: [],
          income: [],
          createdAt: new Date().toISOString(),
        };
        
        crops.push(crop);
      }
    }
    
    return {
      crops,
      landExpenses: [],
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      metadata: {
        totalCrops: crops.length,
        totalLandExpenses: 0,
        totalProfit: 0,
      },
    };
  } catch (error) {
    throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Main import function
export const importData = (file: File): Promise<ExportData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        
        let data: ExportData;
        
        switch (fileExtension) {
          case 'json':
            data = importFromJSON(content);
            break;
          case 'csv':
            data = importFromCSV(content);
            break;
          default:
            throw new Error(`Unsupported file format: ${fileExtension}`);
        }
        
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

// Generate summary report
export const generateSummaryReport = (crops: Crop[], landExpenses: LandExpense[]): string => {
  const totalCropProfit = crops.reduce((sum, crop) => {
    const income = crop.income.reduce((total, inc) => total + inc.amount, 0);
    const expenses = crop.expenses.reduce((total, exp) => total + exp.amount, 0);
    return sum + (income - expenses);
  }, 0);

  const totalLandExpenses = landExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalCropProfit - totalLandExpenses;

  const profitableCrops = crops.filter(crop => {
    const income = crop.income.reduce((sum, inc) => sum + inc.amount, 0);
    const expenses = crop.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    return (income - expenses) > 0;
  });

  const report = `
FARM SUMMARY REPORT
===================
Generated: ${new Date().toLocaleDateString()}

OVERVIEW:
- Total Crops: ${crops.length}
- Profitable Crops: ${profitableCrops.length}
- Total Land Expenses: ${landExpenses.length}
- Net Profit: ₹${netProfit.toLocaleString()}

TOP PERFORMING CROPS:
${crops
  .map(crop => {
    const income = crop.income.reduce((sum, inc) => sum + inc.amount, 0);
    const expenses = crop.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    return { crop, profit: income - expenses };
  })
  .sort((a, b) => b.profit - a.profit)
  .slice(0, 5)
  .map((item, index) => `${index + 1}. ${item.crop.name} (${item.crop.type}): ₹${item.profit.toLocaleString()}`)
  .join('\n')}

RECOMMENDATIONS:
${netProfit > 0 ? '✅ Your farm is profitable! Keep up the good work.' : '⚠️ Consider reviewing expenses and crop selection.'}
${profitableCrops.length < crops.length / 2 ? '⚠️ Less than half of your crops are profitable. Review your farming strategy.' : '✅ Most of your crops are performing well.'}
  `.trim();

  return report;
}; 