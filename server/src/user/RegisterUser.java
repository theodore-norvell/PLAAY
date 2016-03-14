package user;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClient;
import com.amazonaws.services.dynamodbv2.document.*;
import com.amazonaws.services.dynamodbv2.document.spec.PutItemSpec;
import com.amazonaws.services.dynamodbv2.document.spec.QuerySpec;
import com.amazonaws.services.dynamodbv2.document.utils.ValueMap;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.dynamodbv2.model.GetItemRequest;
import com.amazonaws.services.dynamodbv2.model.GetItemResult;

import java.util.Iterator;

public class RegisterUser
{
    public String register(String usr, String pwd)
    {
        AmazonDynamoDBClient client = new AmazonDynamoDBClient()
                .withEndpoint("http://localhost:8000");

        DynamoDB dynamoDB = new DynamoDB(client);

        Table table = dynamoDB.getTable("PLAAY2");


        try {
            String pHash = new Password().hashPassword(pwd);
            System.out.println("Checking if user already exists...");

            QuerySpec spec = new QuerySpec()
                    .withKeyConditionExpression("username = :v_id")
                    .withValueMap(new ValueMap()
                            .withString(":v_id", usr));

            ItemCollection<QueryOutcome> items = table.query(spec);

            Iterator<Item> iterator = items.iterator();
            Item usrCheck = null;
            while (iterator.hasNext()) {
                usrCheck = iterator.next();
            }
            if(usrCheck == null)
            {
                System.out.println("No user found...");
            }
            else
            {
                System.err.println("User already present...");
                return "NameTaken";
            }

            System.out.println("Adding a new user...");
            Item item = new Item()
                    .withPrimaryKey("username",usr)
                    .withString("password",pHash);
            PutItemSpec putItemSpec = new PutItemSpec()
                    .withItem(item)
                    .withConditionExpression("(attribute_not_exists(username))");

            PutItemOutcome outcome = table.putItem(putItemSpec);

            System.out.println("PutItem succeeded:\n" + outcome.getPutItemResult());
            return "Success";

        } catch (Exception e) {
            System.err.println("Unable to add user: " + usr);
            System.err.println(e.getMessage());
            return "Error";
        }
    }
}
