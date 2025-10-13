using Microsoft.AspNetCore.Mvc;

namespace Clinitek.Models
{
    public class Usuario : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
