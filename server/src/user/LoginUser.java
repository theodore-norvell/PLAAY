package user;


import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClient;
import com.amazonaws.services.dynamodbv2.document.*;
import com.amazonaws.services.dynamodbv2.document.spec.QuerySpec;

import java.util.HashMap;
import java.util.Iterator;

public class LoginUser {

    public String login(String userName, String password)
    {
        String result = "Incorrect";
        AmazonDynamoDBClient client = new AmazonDynamoDBClient()
                .withEndpoint("http://localhost:8000");

        DynamoDB dynamoDB = new DynamoDB(client);

        Table table = dynamoDB.getTable("PLAAY2");

        HashMap<String, Object> valueMap = new HashMap<String, Object>();
        valueMap.put(":uN", userName);

        QuerySpec querySpec = new QuerySpec()
                .withKeyConditionExpression("username = :uN")
                //.withNameMap(new NameMap().with("#yr", "year"))
                .withValueMap(valueMap);

        ItemCollection<QueryOutcome> items = null;
        Iterator<Item> iterator = null;
        Item item = null;

        try {
            items = table.query(querySpec);

            iterator = items.iterator();
            while (iterator.hasNext()) {
                item = iterator.next();
                if (new Password().isSamePassword(password,item.getString("password")))
                {
                    result = "True";
                }
                else
                {
                    result = "Incorrect";
                }
            }

        } catch (Exception e) {
            result = "Error";
        }

        return result;
    }

}
