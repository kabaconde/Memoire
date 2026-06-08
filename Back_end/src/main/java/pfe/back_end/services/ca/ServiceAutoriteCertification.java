package pfe.back_end.services.ca;

import org.bouncycastle.asn1.x500.X500Name;
import org.bouncycastle.asn1.x509.*;
import org.bouncycastle.cert.X509v3CertificateBuilder;
import org.bouncycastle.cert.jcajce.JcaX509CertificateConverter;
import org.bouncycastle.cert.jcajce.JcaX509v3CertificateBuilder;
import org.bouncycastle.operator.ContentSigner;
import org.bouncycastle.operator.jcajce.JcaContentSignerBuilder;
import org.bouncycastle.pkcs.PKCS10CertificationRequest;
import org.bouncycastle.pkcs.jcajce.JcaPKCS10CertificationRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import pfe.back_end.services.configuration.ServiceConfiguration;

import jakarta.annotation.PostConstruct;
import pfe.back_end.services.hsm.ServiceGestionClesHSM;

import java.io.*;
import java.math.BigInteger;
import java.security.*;
import java.security.cert.Certificate;
import java.security.cert.X509Certificate;
import java.util.Base64;
import java.util.Date;
import java.util.concurrent.TimeUnit;

@Service
public class ServiceAutoriteCertification {

    private static final String PROVIDEUR_BC = "BC";
    private static final String ALGORITHME_SIGNATURE = "SHA512withRSA";

    @Autowired(required = false)
    private ServiceConfiguration serviceConfiguration;

    private int dureeValiditeMinutes = 5;
    private X509Certificate certificatRacine;
    private KeyPair paireClesRacine;
    private KeyPair paireClesEmettrice;
    private X509Certificate certificatEmetteur;
    private boolean pkiInitialisee = false;


    @Autowired
    private ServiceGestionClesHSM serviceHSM;  // Injecter le service HSM


    @Value("${pki.stockage.chemin:./coffre-pki}")
    private String cheminStockage;

    public X509Certificate getCertificatRacine() {
        return certificatRacine;
    }

    public String getCertificatRacinePem() throws Exception {
        if (certificatRacine == null) {
            return null;
        }
        return convertirEnPem(certificatRacine);
    }

    private int getDureeValiditeMinutes() {
        if (serviceConfiguration != null) {
            try {
                String valeur = serviceConfiguration.getValeur("pki.certificat.duree.minutes");
                if (valeur != null && !valeur.isEmpty()) {
                    return Integer.parseInt(valeur);
                }
            } catch (Exception e) {
                System.err.println("Erreur lecture configuration PKI: " + e.getMessage());
            }
        }
        return dureeValiditeMinutes;
    }

    @PostConstruct
    public void initialiser() {
        try {
            Security.addProvider(new org.bouncycastle.jce.provider.BouncyCastleProvider());
            File folder = new File(cheminStockage);
            if (!folder.exists()) {
                folder.mkdirs();
            }

            boolean chargee = chargerPKIExistante();

            if (!chargee) {
                System.out.println("Aucune PKI existante trouvée, création d'une nouvelle hiérarchie...");
                initialiserNouvelleHierarchie();
                pkiInitialisee = true;
            } else {
                pkiInitialisee = true;
            }

            dureeValiditeMinutes = getDureeValiditeMinutes();

            System.out.println("PKI Initialisée avec succès.");
            System.out.println("Durée de validité des certificats: " + dureeValiditeMinutes + " minutes");

        } catch (Exception e) {
            System.err.println("Attention : La PKI n'a pas pu démarrer : " + e.getMessage());
            e.printStackTrace();
            pkiInitialisee = false;
        }
    }


    private void initialiserNouvelleHierarchie() throws Exception {
        Provider hsmProvider = serviceHSM.getFournisseurPKCS11();
        KeyStore ks = serviceHSM.getKeyStore();  // Récupérer le KeyStore PKCS11

        String password = "AC_" + serviceHSM.getPinUtilisateur();  // Mot de passe pour l'AC

        // Vérifier si les clés existent déjà dans le HSM
        if (!ks.containsAlias("AC_RACINE")) {
            System.out.println("Génération des clés AC dans le HSM...");

            // Générer les clés DANS le HSM (SoftHSM2)
            KeyPairGenerator gen = KeyPairGenerator.getInstance("RSA", hsmProvider);

            // Clé racine (4096 bits)
            gen.initialize(4096);
            KeyPair paireRacine = gen.generateKeyPair();

            // Créer le certificat racine auto-signé
            X500Name sujetRacine = new X500Name("CN=TrustSign Root CA, O=ISIMG, C=TN");
            certificatRacine = genererCertificat(sujetRacine, sujetRacine,
                    paireRacine.getPublic(), paireRacine.getPrivate(), true, 1);

            // Stocker dans le HSM
            ks.setKeyEntry("AC_RACINE", paireRacine.getPrivate(),
                    password.toCharArray(), new Certificate[]{certificatRacine});
            paireClesRacine = paireRacine;

            // Clé émettrice (2048 bits)
            gen.initialize(2048);
            KeyPair paireEmettrice = gen.generateKeyPair();
            X500Name sujetEmetteur = new X500Name("CN=TrustSign Issuing CA, OU=Securite Numerique, O=ISIMG");

            certificatEmetteur = genererCertificat(sujetEmetteur, sujetRacine,
                    paireEmettrice.getPublic(), paireRacine.getPrivate(), true, 0);

            // Stocker dans le HSM
            ks.setKeyEntry("AC_EMETTRICE", paireEmettrice.getPrivate(),
                    password.toCharArray(), new Certificate[]{certificatEmetteur});
            paireClesEmettrice = paireEmettrice;

            System.out.println("✅ Clés AC générées et stockées dans SoftHSM2");
        } else {
            // Charger depuis le HSM
            PrivateKey cleRacine = (PrivateKey) ks.getKey("AC_RACINE", password.toCharArray());
            Certificate certRacine = ks.getCertificate("AC_RACINE");
            certificatRacine = (X509Certificate) certRacine;
            paireClesRacine = new KeyPair(certRacine.getPublicKey(), cleRacine);

            PrivateKey cleEmettrice = (PrivateKey) ks.getKey("AC_EMETTRICE", password.toCharArray());
            Certificate certEmetteur = ks.getCertificate("AC_EMETTRICE");
            certificatEmetteur = (X509Certificate) certEmetteur;
            paireClesEmettrice = new KeyPair(certEmetteur.getPublicKey(), cleEmettrice);

            System.out.println("✅ Clés AC chargées depuis SoftHSM2");
        }
    }
    private X509Certificate genererCertificat(X500Name sujet, X500Name emetteur, PublicKey clePublique, PrivateKey cleSignature, boolean estCA, int longueurChemin) throws Exception {
        long maintenant = System.currentTimeMillis();
        long dureeMillis = TimeUnit.DAYS.toMillis(3650);
        Date dateExpiration = new Date(maintenant + dureeMillis);

        X509v3CertificateBuilder constructeurCert = new JcaX509v3CertificateBuilder(
                emetteur, BigInteger.valueOf(maintenant), new Date(maintenant), dateExpiration, sujet, clePublique);

        constructeurCert.addExtension(Extension.basicConstraints, true, new BasicConstraints(estCA ? longueurChemin : -1));
        constructeurCert.addExtension(Extension.keyUsage, true, new KeyUsage(estCA ? KeyUsage.keyCertSign | KeyUsage.cRLSign : KeyUsage.digitalSignature));

        ContentSigner signataire = new JcaContentSignerBuilder(ALGORITHME_SIGNATURE).setProvider(PROVIDEUR_BC).build(cleSignature);
        return new JcaX509CertificateConverter().setProvider(PROVIDEUR_BC).getCertificate(constructeurCert.build(signataire));
    }

    public String signerDemandeUtilisateur(String csrPem) throws Exception {

        if (!pkiInitialisee || paireClesEmettrice == null || certificatEmetteur == null) {
            throw new RuntimeException("La PKI n'est pas correctement initialisée. Veuillez contacter l'administrateur.");
        }

        byte[] csrDecodee = Base64.getDecoder().decode(csrPem.replace("-----BEGIN CERTIFICATE REQUEST-----", "")
                .replace("-----END CERTIFICATE REQUEST-----", "")
                .replaceAll("\\s", ""));
        JcaPKCS10CertificationRequest jcaCsr = new JcaPKCS10CertificationRequest(new PKCS10CertificationRequest(csrDecodee));

        int dureeMinutes = getDureeValiditeMinutes();
        long dureeMillis = TimeUnit.MINUTES.toMillis(dureeMinutes);

        long maintenant = System.currentTimeMillis();
        Date dateDebut = new Date(maintenant);
        Date dateExpiration = new Date(maintenant + dureeMillis);

        System.out.println("Date de début du certificat: " + dateDebut);
        System.out.println("Date d'expiration du certificat: " + dateExpiration);
        System.out.println("Le certificat expirera dans " + dureeMinutes + " minutes !");

        X509v3CertificateBuilder constructeurCertUtilisateur = new JcaX509v3CertificateBuilder(
                certificatEmetteur,
                BigInteger.valueOf(System.currentTimeMillis()),
                dateDebut,
                dateExpiration,
                jcaCsr.getSubject(),
                jcaCsr.getPublicKey());

        constructeurCertUtilisateur.addExtension(Extension.basicConstraints, true, new BasicConstraints(false));
        constructeurCertUtilisateur.addExtension(Extension.keyUsage, true, new KeyUsage(KeyUsage.digitalSignature | KeyUsage.keyEncipherment));

        ContentSigner signataire = new JcaContentSignerBuilder(ALGORITHME_SIGNATURE)
                .setProvider(PROVIDEUR_BC)
                .build(paireClesEmettrice.getPrivate());

        X509Certificate certificatUser = new JcaX509CertificateConverter()
                .setProvider(PROVIDEUR_BC)
                .getCertificate(constructeurCertUtilisateur.build(signataire));

        return convertirEnPem(certificatUser);
    }

    private String convertirEnPem(X509Certificate certificat) throws Exception {
        return "-----BEGIN CERTIFICATE-----\n" +
                Base64.getMimeEncoder(64, new byte[]{'\n'}).encodeToString(certificat.getEncoded()) +
                "\n-----END CERTIFICATE-----";
    }


    private boolean chargerPKIExistante() throws Exception {
        try {
            KeyStore ks = serviceHSM.getKeyStore();
            String password = "AC_" + serviceHSM.getPinUtilisateur();

            // Vérifier si les clés existent dans le HSM
            if (ks.containsAlias("AC_RACINE") && ks.containsAlias("AC_EMETTRICE")) {

                // Charger la clé racine
                PrivateKey cleRacine = (PrivateKey) ks.getKey("AC_RACINE", password.toCharArray());
                Certificate certRacine = ks.getCertificate("AC_RACINE");
                certificatRacine = (X509Certificate) certRacine;
                paireClesRacine = new KeyPair(certRacine.getPublicKey(), cleRacine);

                // Charger la clé émettrice
                PrivateKey cleEmettrice = (PrivateKey) ks.getKey("AC_EMETTRICE", password.toCharArray());
                Certificate certEmetteur = ks.getCertificate("AC_EMETTRICE");
                certificatEmetteur = (X509Certificate) certEmetteur;
                paireClesEmettrice = new KeyPair(certEmetteur.getPublicKey(), cleEmettrice);

                System.out.println("✅ PKI chargée depuis SoftHSM2 (clés persistantes)");
                return true;
            }
        } catch (Exception e) {
            System.err.println("Aucune PKI trouvée dans HSM: " + e.getMessage());
        }
        return false;
    }
}