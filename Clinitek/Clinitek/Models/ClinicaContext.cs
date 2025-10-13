using Microsoft.AspNetCore.Mvc;

namespace Clinitek.Models
{
    public class ClinicaContext : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
