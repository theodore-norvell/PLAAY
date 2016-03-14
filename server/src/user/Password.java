package user;


import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public class Password {
    public String hashPassword(String pword) throws Exception
    {
        return hashStr(pword);
    }

    public boolean isSamePassword(String input, String saved) throws Exception
    {
        String hashedInput = hashStr(input);
        return hashedInput.equals(saved);
    }

    private String hashStr(String unhashed) throws Exception
    {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        byte[] hash = md.digest(unhashed.getBytes(StandardCharsets.UTF_8));
        String phash = String.format("%064x", new java.math.BigInteger(1, hash));
        return phash;
    }
}
