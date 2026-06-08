package pfe.back_end.controleurs.authentification;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pfe.back_end.configuration.ServiceJwt;
import pfe.back_end.modeles.entites.Utilisateur;
import pfe.back_end.repositories.sql.UtilisateurRepository;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {
    "https://localhost:3000",
    "http://localhost:3000",
    "https://memoirefrontend.onrender.com"
}, allowCredentials = "true")
public class ProfileControleur {

    @Autowired
    private ServiceJwt jwtUtils;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    // 🔧 Méthode pour récupérer le token depuis le Header Authorization
    private String recupererJwtDepuisHeader(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    @GetMapping("/utilisateur/mon-profil")
    public ResponseEntity<?> getMonProfil(HttpServletRequest request) {
        try {
            // 🔧 Lire le token depuis le header (pas depuis les cookies)
            String token = recupererJwtDepuisHeader(request);
            if (token == null) {
                return ResponseEntity.status(401).body(Map.of("erreur", "Non autorisé - Token manquant"));
            }

            String email = jwtUtils.getEmailFromToken(token);
            Utilisateur user = utilisateurRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("email", user.getEmail());
            userData.put("prenom", user.getPrenom());
            userData.put("nom", user.getNom());
            userData.put("telephone", user.getTelephone());
            userData.put("role", user.getRole().name());
            userData.put("statut", user.getStatutCycleVie());
            userData.put("statutCompte", user.getStatutCycleVie());
            userData.put("photoProfil", user.getPhotoProfil());
            userData.put("imageSignature", user.getImageSignature());
            userData.put("status_pki", user.getStatusPki() != null ? user.getStatusPki() : "NONE");
            userData.put("hsmAlias", user.getHsmAlias());

            return ResponseEntity.ok(userData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage()));
        }
    }

    @PutMapping("/utilisateur/modifier-profil")
    public ResponseEntity<?> updateProfil(@RequestBody Map<String, String> payload, HttpServletRequest request) {
        try {
            String token = recupererJwtDepuisHeader(request);
            if (token == null) {
                return ResponseEntity.status(401).body(Map.of("erreur", "Session expirée"));
            }

            String email = jwtUtils.getEmailFromToken(token);
            Utilisateur user = utilisateurRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            if (payload.containsKey("prenom")) user.setPrenom(payload.get("prenom"));
            if (payload.containsKey("nom")) user.setNom(payload.get("nom"));
            if (payload.containsKey("telephone")) user.setTelephone(payload.get("telephone"));
            if (payload.containsKey("photoProfil") && payload.get("photoProfil") != null && !payload.get("photoProfil").isEmpty()) {
                user.setPhotoProfil(payload.get("photoProfil"));
            }

            utilisateurRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Profil mis à jour avec succès !"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("erreur", "Erreur lors de la mise à jour : " + e.getMessage()));
        }
    }

    @PostMapping("/utilisateur/upload-photo")
    public ResponseEntity<?> uploadPhoto(@RequestBody Map<String, String> payload, HttpServletRequest request) {
        try {
            String token = recupererJwtDepuisHeader(request);
            if (token == null) {
                return ResponseEntity.status(401).body(Map.of("erreur", "Non autorisé"));
            }

            String email = jwtUtils.getEmailFromToken(token);
            Utilisateur user = utilisateurRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            String photoBase64 = payload.get("photo");
            if (photoBase64 == null || photoBase64.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("erreur", "Aucune photo fournie"));
            }

            user.setPhotoProfil(photoBase64);
            utilisateurRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Photo de profil mise à jour avec succès"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("erreur", e.getMessage()));
        }
    }
}