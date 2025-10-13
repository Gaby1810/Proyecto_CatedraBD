using Microsoft.AspNetCore.Mvc;

namespace Clinitek.Models
{
    public class Recepcionista : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
