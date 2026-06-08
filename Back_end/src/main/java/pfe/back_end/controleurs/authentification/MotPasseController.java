package pfe.back_end.controleurs.authentification;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pfe.back_end.configuration.ServiceJwt;
import pfe.back_end.modeles.entites.Utilisateur;
import pfe.back_end.repositories.sql.UtilisateurRepository;
import pfe.back_end.services.authentification.MotPasse;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {
    "https://localhost:3000",
    "http://localhost:3000"
   // "https://trustsign-frontend.onrender.com"
}, allowCredentials = "true")
public class MotPasseController {

    @Autowired
    private MotPasse motPasseService;

    @Autowired
    private ServiceJwt jwtUtils;

    @Autowired
    private UtilisateurRepository utilisateurRepository;


    @PutMapping("/utilisateur/modifier-mot-de-passe")
    public ResponseEntity<?> modifierMotDePasse(@RequestBody Map<String, String> payload, HttpServletRequest request) {
        try {
            String token = recupererJwtDepuisCookie(request);
            if (token == null) return ResponseEntity.status(401).body(Map.of("erreur", "Session expirée"));

            String email = jwtUtils.getEmailFromToken(token);
            Utilisateur user = utilisateurRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            String ancienMdp = payload.get("ancienMotDePasse");
            String nouveauMdp = payload.get("nouveauMotDePasse");

            motPasseService.changerMotDePasse(user.getId(), ancienMdp, nouveauMdp);

            return ResponseEntity.ok(Map.of("message", "Mot de passe modifié avec succès !"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("erreur", e.getMessage()));
        }
    }

    @PostMapping("/mot-de-passe-oublie")
    public ResponseEntity<?> demandeMotDePasse(@RequestBody Map<String, String> payload) {
        try {
            motPasseService.demanderReinitialisation(payload.get("email"));  // Correction
            return ResponseEntity.ok(Map.of("message", "Code envoyé."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage()));
        }
    }


    @PostMapping("/reinitialiser-mot-de-passe")
    public ResponseEntity<?> resetMotDePasse(@RequestBody Map<String, String> payload) {
        try {
            motPasseService.terminerReinitialisation(
                    payload.get("email"),
                    payload.get("code"),
                    payload.get("nouveauMotDePasse")
            );
            return ResponseEntity.ok(Map.of("message", "Mot de passe modifié."));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("erreur", e.getMessage()));
        }
    }



    private String recupererJwtDepuisCookie(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("accessToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}