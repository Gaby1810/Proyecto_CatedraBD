using Microsoft.AspNetCore.Mvc;

namespace Clinitek.Controllers
{
    public class PacienteController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
