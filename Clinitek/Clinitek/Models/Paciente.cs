using Microsoft.AspNetCore.Mvc;

namespace Clinitek.Models
{
    public class Paciente : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
