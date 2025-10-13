using Microsoft.AspNetCore.Mvc;

namespace Clinitek.Controllers
{
    public class MedicoController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
