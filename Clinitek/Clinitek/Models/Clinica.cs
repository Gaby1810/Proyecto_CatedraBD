using Microsoft.AspNetCore.Mvc;

namespace Clinitek.Models
{
    public class Clinica : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
