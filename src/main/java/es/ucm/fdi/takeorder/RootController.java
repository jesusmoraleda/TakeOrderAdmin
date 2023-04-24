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
    public String ingredients(Model model) {
        return "pages/ingredients";
    }

    @GetMapping("/drinks")
    public String drinks(Model model) {
        return "pages/drinks";
    }

    @GetMapping("/plates")
    public String plates(Model model) {
        return "pages/plates";
    }
    @GetMapping("/menus")
    public String menus(Model model) {
        return "pages/menus";
    }
    @GetMapping("/test")
    public String test(Model model) {
        return "pages/test";
    }
    
}