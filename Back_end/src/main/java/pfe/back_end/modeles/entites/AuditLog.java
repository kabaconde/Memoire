package pfe.back_end.modeles.entites;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;
import java.time.LocalDateTime;

@Document(collection = "audit_logs")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    private String id;

    private String eventType;
    private LocalDateTime timestamp;
    private Long userId;
    private String userEmail;
    private String userRole;
    private String ipAddress;
    private String userAgent;
    private Long documentId;
    private String documentName;
    private String signatureType;
    private String status;
    private String details;
    private String token;
    private String action;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEventType() { return eventType; }

    public LocalDateTime getTimestamp() { return timestamp; }

    public Long getUserId() { return userId; }

    public String getUserEmail() { return userEmail; }

    public String getUserRole() { return userRole; }

    public String getIpAddress() { return ipAddress; }

    public String getUserAgent() { return userAgent; }

    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }

    public String getDocumentName() { return documentName; }

    public String getSignatureType() { return signatureType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDetails() { return details; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }


}