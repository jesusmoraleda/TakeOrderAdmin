package es.ucm.fdi.takeorder;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class RootController {

	@GetMapping("/")
    public String index(Model model) {
        return "index";
    }

    @GetMapping("/ingredients")
    public String peliculas(Model model) {
        return "pages/ingredients";
    }

    @GetMapping("/plates")
    public String cines(Model model) {
        return "pages/plates";
    }
    @GetMapping("/test")
    public String test(Model model) {
        return "pages/test";
    }
}