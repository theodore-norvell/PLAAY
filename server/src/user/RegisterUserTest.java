package user;

import java.util.HashMap;
import java.util.Map;

import com.amazonaws.regions.Regions;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClient;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.dynamodbv2.document.PrimaryKey;
import com.amazonaws.services.dynamodbv2.document.PutItemOutcome;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.dynamodbv2.document.spec.PutItemSpec;
import com.amazonaws.services.dynamodbv2.document.utils.NameMap;
import com.amazonaws.services.dynamodbv2.document.utils.ValueMap;

public class RegisterUserTest {
    public static void main(String[] args) throws Exception {

        AmazonDynamoDBClient client = new AmazonDynamoDBClient()
//.withEndpoint("http://localhost:8000"); //FOR LOCAL
                .withRegion(Regions.US_EAST_1); //FOR LIVE
        DynamoDB dynamoDB = new DynamoDB(client);

        Table table = dynamoDB.getTable("PLAAY");

        //String userId = "test";
        String uName = "testUser2";
        String pWord = "testPassword1";

        Password passwordHash = new Password();

        String pHash = passwordHash.hashPassword(pWord);

        Item item = new Item()
                .withPrimaryKey(new PrimaryKey("username", uName))
                //.withString("username",uName)
                .withString("password",pHash);

        PutItemSpec putItemSpec = new PutItemSpec()
                .withItem(item)
                .withConditionExpression("(attribute_not_exists(username))");

        // Attempt a conditional write.  We expect this to fail.

        try {
            System.out.println("Attempting a conditional write...");
            PutItemOutcome outcome = table.putItem(putItemSpec);
            System.out.println("PutItem succeeded: " + outcome.getPutItemResult());

        } catch (Exception e) {
            System.err.println("Unable to put item: " + uName);// + " " + uName);
            System.err.println(e.getMessage());
        }

    }
}
