package user;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClient;
import com.amazonaws.services.dynamodbv2.document.*;
import com.amazonaws.services.dynamodbv2.document.spec.QuerySpec;
import com.amazonaws.services.dynamodbv2.document.spec.ScanSpec;
import com.amazonaws.services.dynamodbv2.document.utils.ValueMap;

import java.util.Iterator;

/**
 * Created by dillonbutt on 2016-03-20.
 */
public class LoadProgram
{
    public String getProgram(String user, String programName)
    {
        String result = "";
        AmazonDynamoDBClient dynamoDBClient = new AmazonDynamoDBClient()
                .withEndpoint("http://localhost:8000"); //FOR LOCAL
        //.withRegion(Regions.US_EAST_1); //FOR LIVE
        DynamoDB dynamoDB = new DynamoDB(dynamoDBClient);

        try
        {
            Table table = dynamoDB.getTable(user);
            QuerySpec querySpec = new QuerySpec()
                    .withKeyConditionExpression("programname = :pn")
                    .withValueMap(new ValueMap().with(":pn",programName));

            ItemCollection<QueryOutcome> items = null;
            Iterator<Item> iter = null;
            Item item = null;
            items = table.query(querySpec);
            iter = items.iterator();

            while (iter.hasNext()) {
                item = iter.next();
                result = (item.getString("program"));
                System.out.println(item.getString("program"));
            }
            return result;
        }
        catch (Exception e)
        {
            return null;
        }
    }
}
