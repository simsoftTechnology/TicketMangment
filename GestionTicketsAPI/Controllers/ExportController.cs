using GestionTicketsAPI.Controllers;
using GestionTicketsAPI.Services;
using Microsoft.AspNetCore.Mvc;

[ApiController]
public class ExportController : BaseApiController
{
    private readonly ExcelExportServiceClosedXML _excelExportService;

    public ExportController()
    {
        _excelExportService = new ExcelExportServiceClosedXML();
    }

    [HttpGet("export-data")]
    public IActionResult ExportData()
    {
        // Remplacez par vos données réelles
        var data = new List<MyData>
        {
            new MyData { Id = 1, Name = "Test 1" },
            new MyData { Id = 2, Name = "Test 2" }
        };

        var fileContent = _excelExportService.ExportToExcel(data);
        return File(fileContent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "export.xlsx");
    }
}

public class MyData
{
    public int Id { get; set; }
    public string Name { get; set; }
}
