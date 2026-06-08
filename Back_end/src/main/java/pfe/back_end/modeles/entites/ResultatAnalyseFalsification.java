// modeles/entites/ResultatAnalyseFalsification.java
package pfe.back_end.modeles.entites;

import java.time.LocalDateTime;
import java.util.List;

public class ResultatAnalyseFalsification {
    private Long idDocument;
    private String nomFichier;
    private LocalDateTime dateAnalyse;
    private String hashActuel;
    private String hashOriginal;
    private boolean hashCorrespond;
    private String createur;
    private String producteur;
    private String versionPdf;
    private int nombrePages;
    private int elementsSuspects;
    private List<String> pagesSuspectes;
    private boolean aSignaturesExistantes;
    private int nombreSignaturesExistantes;
    private int scoreIntegrite;
    private String niveauConfiance;
    private String messageConfiance;
    private List<AnomalieFalsification> anomalies;
    private List<String> recommandations;

    private int nombrePolices;
    private boolean aTexteCache;
    private boolean aDatesIncoherentes;
    private String logicielDetection;

    public void setNombrePolices(int nombrePolices) { this.nombrePolices = nombrePolices; }



    public ResultatAnalyseFalsification() {
        this.scoreIntegrite = 100;
        this.dateAnalyse = LocalDateTime.now();
    }

    public void setIdDocument(Long idDocument) { this.idDocument = idDocument; }

    public String getNomFichier() { return nomFichier; }
    public void setNomFichier(String nomFichier) { this.nomFichier = nomFichier; }

    public void setDateAnalyse(LocalDateTime dateAnalyse) { this.dateAnalyse = dateAnalyse; }

    public void setHashActuel(String hashActuel) { this.hashActuel = hashActuel; }

    public String getHashOriginal() { return hashOriginal; }
    public void setHashOriginal(String hashOriginal) { this.hashOriginal = hashOriginal; }

    public boolean isHashCorrespond() { return hashCorrespond; }
    public void setHashCorrespond(boolean hashCorrespond) { this.hashCorrespond = hashCorrespond; }

    public void setCreateur(String createur) { this.createur = createur; }

    public void setProducteur(String producteur) { this.producteur = producteur; }

    public void setNombrePages(int nombrePages) { this.nombrePages = nombrePages; }

    public void setElementsSuspects(int elementsSuspects) { this.elementsSuspects = elementsSuspects; }

    public void setPagesSuspectes(List<String> pagesSuspectes) { this.pagesSuspectes = pagesSuspectes; }

    public int getScoreIntegrite() { return scoreIntegrite; }
    public void setScoreIntegrite(int scoreIntegrite) { this.scoreIntegrite = scoreIntegrite; }

    public String getNiveauConfiance() { return niveauConfiance; }
    public void setNiveauConfiance(String niveauConfiance) { this.niveauConfiance = niveauConfiance; }

    public void setMessageConfiance(String messageConfiance) { this.messageConfiance = messageConfiance; }

    public void setAnomalies(List<AnomalieFalsification> anomalies) { this.anomalies = anomalies; }

    public void setRecommandations(List<String> recommandations) { this.recommandations = recommandations; }
}