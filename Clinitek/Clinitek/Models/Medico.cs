using Microsoft.AspNetCore.Mvc;

namespace Clinitek.Models
{
    public class Medico : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
