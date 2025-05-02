using System;

namespace GestionTicketsAPI.Services;

using ClosedXML.Excel;
using System.Collections.Generic;
using System.IO;

public class ExcelExportServiceClosedXML
{
    public byte[] ExportToExcel<T>(IEnumerable<T> data, string sheetName = "Export")
    {
        using (var workbook = new XLWorkbook())
        {
            var worksheet = workbook.Worksheets.Add(sheetName);
            var properties = typeof(T).GetProperties();
            int col = 1;
            
            // Création de l'en-tête
            foreach (var prop in properties)
            {
                worksheet.Cell(1, col).Value = prop.Name;
                worksheet.Cell(1, col).Style.Font.Bold = true;
                col++;
            }

            int row = 2;
            foreach (var item in data)
            {
                col = 1;
                foreach (var prop in properties)
                {
                    var value = prop.GetValue(item);
                    worksheet.Cell(row, col).SetValue(value?.ToString() ?? "");
                    col++;
                }
                row++;
            }

            // Auto-ajustement des colonnes
            worksheet.Columns().AdjustToContents();

            using (var stream = new MemoryStream())
            {
                workbook.SaveAs(stream);
                return stream.ToArray();
            }
        }
    }
}

