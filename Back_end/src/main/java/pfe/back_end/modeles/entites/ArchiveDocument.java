package pfe.back_end.modeles.entites;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "archives_documents")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArchiveDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @Column(nullable = false, unique = true)
    private String archiveReference;

    @Column(nullable = false)
    private String cheminStockage;

    private String hashArchive;

    @Enumerated(EnumType.STRING)
    private NiveauArchive niveau;

    @Enumerated(EnumType.STRING)
    private StatutArchive statut;

    private LocalDateTime dateArchivage;
    private LocalDateTime dateExpiration;
    private LocalDateTime dateSuppression;

    private String tailleArchive;
    private String formatArchive;

    @Column(columnDefinition = "TEXT")
    private String certificatArchive;

    @Column(columnDefinition = "TEXT")
    private String preuveConservation;

    @Column(columnDefinition = "TEXT")
    private String jetonTimestamp;

    private LocalDateTime dateHorodatage;

    @PrePersist
    protected void onCreate() {
        dateArchivage = LocalDateTime.now();
        dateExpiration = dateArchivage.plusYears(10);
        statut = StatutArchive.ACTIF;
        archiveReference = java.util.UUID.randomUUID().toString();
    }


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Document getDocument() { return document; }
    public void setDocument(Document document) { this.document = document; }

    public String getArchiveReference() { return archiveReference; }

    public String getCheminStockage() { return cheminStockage; }

    public String getHashArchive() { return hashArchive; }

    public NiveauArchive getNiveau() { return niveau; }

    public StatutArchive getStatut() { return statut; }
    public void setStatut(StatutArchive statut) { this.statut = statut; }

    public LocalDateTime getDateArchivage() { return dateArchivage; }

    public LocalDateTime getDateExpiration() { return dateExpiration; }
    public void setDateExpiration(LocalDateTime dateExpiration) { this.dateExpiration = dateExpiration; }
    public void setDateSuppression(LocalDateTime dateSuppression) { this.dateSuppression = dateSuppression; }
    public String getTailleArchive() { return tailleArchive; }
    public String getCertificatArchive() { return certificatArchive; }
    public String getPreuveConservation() { return preuveConservation; }
    public String getJetonTimestamp() { return jetonTimestamp; }
    public LocalDateTime getDateHorodatage() { return dateHorodatage; }
}